import APIKey from "../models/apikeys.model.js";
import Metric from "../models/metrix.model.js";
import SecurityIncident from "../models/SecurityIncident.model.js";

/* ============================
   SEVERITY BASE
============================ */
const ATTACK_BASE_SEVERITY = {
  SQL_INJECTION: 4,
  NOSQL_INJECTION: 4,
  COMMAND_INJECTION: 5,
  PATH_TRAVERSAL: 4,
  XSS: 3,
};

/* ============================
   RULE-BASED DETECTION
============================ */
function detectRuleBasedAttack(item) {
  const payload = (item.bodySample || "").toLowerCase();
  const endpoint = (item.endpoint || "").toLowerCase();

  if (/('|%27)\s*or\s*1=1|union\s+select/.test(payload)) return "SQL_INJECTION";

  if (/<script>|onerror=|onload=/.test(payload)) return "XSS";

  if (/(;|\|\||&&)\s*(ls|rm|cat|bash|sh)/.test(payload))
    return "COMMAND_INJECTION";

  if (/(\.\.\/|%2e%2e%2f)/.test(endpoint + payload)) return "PATH_TRAVERSAL";

  if (/\$(ne|gt|lt|where)/.test(payload)) return "NOSQL_INJECTION";

  return null;
}

/* ============================
   MAIN CONTROLLER
============================ */
export const MetricAccept = async (req, res) => {
  try {
    console.log("Metric received");

    const apiKey =
      req.header("x-api-key") ||
      req.headers["x-api-key"] ||
      req.get("x-api-key");

    if (!apiKey)
      return res.status(400).json({
        success: false,
        message: "API key required",
      });

    const isValid = await APIKey.findOne({ key: apiKey });

    if (!isValid)
      return res.status(404).json({
        success: false,
        message: "Invalid API key",
      });

    const data = req.body;

    if (!Array.isArray(data) || data.length === 0)
      return res.status(400).json({
        success: false,
        message: "Empty metrics",
      });

    /* ============================
       STEP 1: RULE-BASED SECURITY
    ============================ */
    for (const item of data) {
      const ruleAttack = detectRuleBasedAttack(item);

      const isAttack = !!ruleAttack;
      const attackType = ruleAttack || null;

      let severity = ATTACK_BASE_SEVERITY[attackType] || 1;

      if (item.status >= 500) severity++;
      severity = Math.min(severity, 5);

      item.security = {
        rule: {
          detected: isAttack,
          attackType,
        },
        final: {
          isAttack,
          attackType,
          severity,
        },
      };

      /* ============================
         SAVE INCIDENT (NO GROUPING)
      ============================ */
      if (isAttack && attackType) {
        await SecurityIncident.create({
          serviceName: isValid?.serviceName || "Unknown Service",
          endpoint: item.endpoint,
          method: item.method,

          apiKey, // for attribution
          attackType,
          detectionSource: "RULE",

          severity,
          confidence: null,

          // unique signature (no grouping)
          signature: `${item.endpoint}_${attackType}_${Date.now()}_${Math.random()}`,

          occurrences: 1,

          indicators: {
            payloadSample: item.bodySample?.slice(0, 300),
            queryParamsCount: item.query_params_count,
            isJson: item.is_json,
            mlScore: null,
          },

          requestMeta: {
            normalizedPath: item.normalized_path,
            userAgent: item.headers?.["user-agent"],
            clientIp: item.client_ip,
          },

          metrics: {
            durationMs: item.duration,
            statusCode: item.status,
          },

          status: "open",
        });
      }

      console.log("Processed security item:", item);
    }

    /* ============================
       STEP 2: METRIC AGGREGATION
    ============================ */
    const bulkOps = {};

    data.forEach((item) => {
      const key = `${item.endpoint}::${item.method}`;

      if (!bulkOps[key]) {
        bulkOps[key] = {
          apiKey,
          endpoint: item.endpoint,
          method: item.method,
          count: 0,
          errorCount: 0,
          totalDuration: 0,
        };
      }

      bulkOps[key].count++;
      bulkOps[key].totalDuration += item.duration;

      if (item.status >= 400) bulkOps[key].errorCount++;
    });

    await Metric.bulkWrite(
      Object.values(bulkOps).map((m) => ({
        updateOne: {
          filter: {
            apiKey,
            endpoint: m.endpoint,
            method: m.method,
          },
          update: {
            $inc: {
              count: m.count,
              errorCount: m.errorCount,
              totalDuration: m.totalDuration,
            },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );

    return res.json({
      success: true,
      processed: data.length,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
