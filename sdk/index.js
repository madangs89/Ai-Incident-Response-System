import { v4 as uuidv4 } from "uuid";
import axios from "axios";
export default class AIAnalyzerLogger {
  constructor(key, serviceName, environment = "development") {
    if (!key) {
      this.consoler("API Key is not set");
      throw new Error(
        "Setup You api key from our Dashboard=> https://ai-analyzer.com/"
      );
    }
    if (!serviceName) {
      this.consoler("Service Name is not set");
      throw new Error(
        "Setup You service name from our Dashboard=> https://ai-analyzer.com/"
      );
    }
    this.apiKey = key;
    this.baseUrl = "http://localhost:3000";
    this.serviceName = serviceName;
    this.isVerified = false;
    this.collectTelemetry = false;
    this.environment = environment;
    this.queue = [];
    this.isFlushing = false;
    this.flushInterval = 5 * 1000; // 5 seconds
    this.batchSize = 10;
    this.flushTimer = null;
    this.metricQueue = [];
    this.metricInterval = 10 * 1000;
    this.isMetricFlushing = false;

    setInterval(() => {
      if (this.isMetricFlushing == false && this.metricQueue.length > 0) {
        this.flushMetric();
      }
    }, this.metricInterval);
  }

  nowIso() {
    return new Date().toISOString();
  }
  init = async (app) => {
    if (this.apiKey == undefined || this.apiKey.length <= 0) {
      this.consoler("API Key is not set");
      throw new Error(
        "Setup You api key from our Dashboard=> https://ai-analyzer.com/"
      );
    }
    if (this.isVerified == false) {
      await this.verifyKey(this.apiKey);
    } else {
      this.isVerified = true;
      this.consoler("API Key is verified");
    }

    if (this.isVerified && app) {
      this.patchExpress(app);
      app.use((req, res, next) => this.expressMetricCapture(req, res, next));
    }
    this.setupGlobalCapture();
  };

  verifyKey = async (key) => {
    if (this.isVerified === true) {
      this.consoler("API Key already verified, skipping verification");
      return;
    }

    if (!key) {
      this.consoler("API Key missing during verification");
      return;
    }

    let attempts = 0;
    while (attempts < 3) {
      try {
        const res = await axios.get(`${this.baseUrl}/api/key/verify`, {
          headers: { "x-api-key": key },
          timeout: 3000,
        });
        if (res.data.valid) {
          this.isVerified = true;
          this.consoler("✅ API Key verified successfully");
          return;
        } else {
          this.consoler("❌ API Key invalid — stopping logging");
          this.isVerified = false;
          return; // stop trying if key is invalid
        }
      } catch (error) {
        attempts++;
        this.isVerified = false;
      }
    }

    this.consoler("⚠️ Could not verify key after retries — will retry later.");
  };

  parseTopStackFrame(stack) {
    if (!stack || typeof stack !== "string") return null;

    // Normalize lines
    const lines = stack
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    // Several regex patterns to match common stack formats (V8/Node, Firefox, Safari)
    const patterns = [
      // Node/V8: at functionName (filePath:line:col) OR at filePath:line:col
      /at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?$/,
      // Chrome anonymous: at filePath:line:col
      /^(.+?):(\d+):(\d+)$/,
      // Firefox: functionName@filePath:line:col
      /^(?:(.+?)@)?(.+?):(\d+):(\d+)$/,
    ];

    // prefer first non-internal, non-node_module frame (skip first line if it's message)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pat of patterns) {
        const m = line.match(pat);
        if (m) {
          // normalize groups: functionName optional
          let functionName = m[1] || "<anonymous>";
          let file = m[2];
          let lineNo = parseInt(m[3], 10);
          let colNo = parseInt(m[4], 10);
          if (!file) continue;
          // Skip internal frames
          const fileLower = String(file).toLowerCase();
          if (
            fileLower.includes("(internal") ||
            fileLower.includes("node:internal")
          )
            continue;
          // return first useful frame
          console.log(file, functionName);

          return { functionName, file, line: lineNo, col: colNo };
        }
      }
    }
    return null;
  }
  consoler = (data) => {
    console.log(data);
  };

  /**
   * Classifies an error based on message content, error name, stack trace, HTTP status,
   * module context, and operation type.
   *
   * Returns:
   * {
   *   level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO",
   *   severity: 1–5,
   *   topFrame: { functionName, file, line, col }
   * }
   *
   * Severity Scale:
   *  5 - CRITICAL  : Fatal crash, unhandled, global, DB down
   *  4 - HIGH      : Server/network/database failure, 5xx errors
   *  3 - MEDIUM    : Validation, 4xx client-side errors
   *  2 - LOW       : Not found / Unauthorized / Forbidden
   *  1 - INFO      : Informational or non-error logs
   */

  classifyErrorSeverity(errorObj, metadata = {}) {
    const message = errorObj?.message?.toLowerCase?.() || "";
    const name = errorObj?.name?.toLowerCase?.() || "";
    const stack = errorObj?.stack || "";

    const top = this.parseTopStackFrame?.(stack);
    const file = top?.file?.toLowerCase?.() || "";

    const module = metadata?.module?.toLowerCase?.() || "";
    const operation = metadata?.operation?.toLowerCase?.() || "";
    const status = metadata?.status || null;

    // Default classification
    let level = "INFO";
    let severity = 1;

    // 🌍 Global / System-level error contexts
    const isGlobal =
      module.includes("global") ||
      operation.includes("unhandledrejection") ||
      operation.includes("uncaughtexception") ||
      message.includes("uncaught") ||
      message.includes("unhandledrejection");

    // 🧠 Module-based flags
    const isDatabase =
      module.includes("database") ||
      module.includes("db") ||
      message.includes("mongo") ||
      message.includes("sql") ||
      file.includes("database") ||
      file.includes("db");

    const isNetwork =
      module.includes("network") ||
      module.includes("api") ||
      message.includes("socket") ||
      message.includes("connection") ||
      message.includes("timeout") ||
      file.includes("net");

    const isAuth =
      module.includes("auth") ||
      message.includes("unauthorized") ||
      message.includes("forbidden");

    const isFilesystem =
      module.includes("fs") ||
      message.includes("enoent") ||
      message.includes("permission denied") ||
      message.includes("file not found");

    const isExternalService =
      module.includes("external") ||
      message.includes("axios") ||
      message.includes("fetch") ||
      message.includes("third party");

    // 🧱 Stack awareness — check if error comes from user code
    const isUserCode =
      file && !file.includes("node_modules") && !file.includes("internal");

    // -------------------------------------------------------------------------------------
    // 🔥 CRITICAL ERRORS (Level 5)
    // -------------------------------------------------------------------------------------
    if (
      isGlobal ||
      name.includes("referenceerror") ||
      name.includes("syntaxerror") ||
      name.includes("typeerror") ||
      message.includes("crash") ||
      message.includes("out of memory") ||
      message.includes("cannot read property") ||
      message.includes("segmentation fault") ||
      (isDatabase && message.includes("connection refused")) ||
      message.includes("database error") ||
      message.includes("stack overflow") ||
      message.includes("heap out of memory")
    ) {
      level = "CRITICAL";
      severity = 5;
    }

    // -------------------------------------------------------------------------------------
    // ⚠️ HIGH ERRORS (Level 4)
    // -------------------------------------------------------------------------------------
    else if (
      message.includes("timeout") ||
      message.includes("failed") ||
      message.includes("internal server error") ||
      message.includes("service unavailable") ||
      status >= 500 ||
      isNetwork ||
      isDatabase ||
      isFilesystem ||
      isExternalService
    ) {
      level = "HIGH";
      severity = 4;
    }

    // -------------------------------------------------------------------------------------
    // 🟡 MEDIUM ERRORS (Level 3)
    // -------------------------------------------------------------------------------------
    else if (
      message.includes("validation") ||
      message.includes("bad request") ||
      message.includes("invalid") ||
      message.includes("unprocessable") ||
      status >= 400
    ) {
      level = "MEDIUM";
      severity = 3;
    }

    // -------------------------------------------------------------------------------------
    // 🟢 LOW ERRORS (Level 2)
    // -------------------------------------------------------------------------------------
    else if (
      message.includes("not found") ||
      message.includes("unauthorized") ||
      message.includes("forbidden") ||
      message.includes("missing") ||
      status === 404 ||
      status === 401 ||
      status === 403 ||
      isAuth
    ) {
      level = "LOW";
      severity = 2;
    }

    // -------------------------------------------------------------------------------------
    // 🔍 Contextual Adjustments
    // -------------------------------------------------------------------------------------

    // Database errors are always more severe
    if (isDatabase && severity < 5) severity = Math.min(severity + 1, 5);

    // Global unhandled errors always critical
    if (isGlobal && severity < 5) severity = 5;

    // User code failures are more severe
    if (isUserCode && severity < 5) severity += 1;

    // Library or dependency code failures are slightly less severe
    if (file.includes("node_modules") && severity > 2) severity -= 1;

    // Normalize boundaries
    severity = Math.min(Math.max(severity, 1), 5);

    // Assign matching level if not explicitly set
    if (severity === 5) level = "CRITICAL";
    else if (severity === 4) level = "HIGH";
    else if (severity === 3) level = "MEDIUM";
    else if (severity === 2) level = "LOW";
    else level = "INFO";

    return {
      level,
      severity,
      topFrame: top || {},
    };
  }

  patchExpress(app) {
    if (!app || typeof app.use !== "function") {
      this.consoler("Invalid Express app instance passed to patchExpress");
      return;
    }

    const methodsToPatch = ["get", "post", "put", "delete", "patch", "all"];
    methodsToPatch.forEach((method) => {
      const originalMethod = app[method].bind(app);

      app[method] = (path, ...handlers) => {
        const wrappedHandlers = handlers.map((handler) => {
          if (typeof handler !== "function") return handler;

          // Wrap each handler
          return async (req, res, next) => {
            try {
              await Promise.resolve(handler(req, res, next));
            } catch (err) {
              console.log(
                `⚠️ [AIAnalyzer] Auto-captured route error on ${method.toUpperCase()} ${path}:`,
                err.message
              );

              await this.captureError(
                err,
                { module: "express", operation: "autoWrap", method, path },
                { req, isReq: true }
              );

              // Forward to Express error handlers if needed
              next(err);
            }
          };
        });

        return originalMethod(path, ...wrappedHandlers);
      };
    });

    console.log(
      "🧠 [AIAnalyzer] Express methods patched for auto error capture"
    );
  }

  setupGlobalCapture = () => {
    if (!this.isVerified) {
      this.consoler("API Key is not verified");
      return;
    }
    process.on("unhandledRejection", (error) => {
      console.log(error);
      this.captureError(
        error,
        {
          module: "global",
          operation: "unhandledRejection",
        },
        {}
      )
        .then(() => {
          console.log("[AIAnalyzer] Error captured successfully.");
        })
        .catch((err) => {
          console.error(
            "[AIAnalyzer] Failed to send unhandledRejection:",
            err.message
          );
        });
    });
    process.on("uncaughtException", (error) => {
      console.log(error);
      this.captureError(
        error,
        {
          module: "global",
          operation: "uncaughtException",
        },
        {}
      )
        .then(() => {
          console.log("[AIAnalyzer] Error captured successfully.");
        })
        .catch((err) => {
          console.error(
            "[AIAnalyzer] Failed to send unhandledRejection:",
            err.message
          );
        });
    });
    process.on("beforeExit", async () => {
      if (this.queue.length > 0) {
        try {
          await this.flushQueue();
        } catch (error) {}
      }
    });
    process.on("exit", () => {
      if (this.flushTimer) clearTimeout(this.flushTimer);
    });
  };

  expressCapture = async (err, req, res, next) => {
    console.log("handle comes to express capture");
    if (!this.isVerified) {
      this.consoler("API Key is not verified");
      return;
    }
    try {
      if (!err) {
        return next();
      }
      console.log("error in express capture", err);

      await this.captureError(
        err,
        { module: "express", operation: "express" },
        { req, isReq: true }
      );
    } catch (error) {
      this.consoler(error);
    }
    next();
  };

  captureError = async (error, metadata, data) => {
    if (!this.isVerified) {
      this.consoler("API Key is not verified");
      return;
    }
    if (!error) {
      this.consoler("Error is not set");
      return;
    }
    const payload = this.buildPayload(error, metadata, data);
    if (!payload) {
      this.consoler("Payload is not set");
      return;
    }
    if (payload) {
      const { level, severity } = this.classifyErrorSeverity(
        error,
        payload.metadata
      );
      payload.level = level;
      payload.metadata.severity = severity;
      const response = await this.sendToApi(payload);
      if (!response) {
        this.consoler("Response is not set");
        return;
      }
      this.consoler("Response is set");
      return response;
    }
  };

  expressMetricCapture = async (req, res, next) => {
    console.log("🟢 [AIAnalyzer] expressCapture started:", req.originalUrl);

    if (!this.isVerified) {
      this.consoler("API Key is not verified");
      return next();
    }

    const start = Date.now();

    // 🧩 Wrap response finish for metrics
    res.on("finish", async () => {
      const duration = Date.now() - start;
      console.log("metric", {
        endpoint: req.originalUrl,
        method: req.method,
        status: res.statusCode,
        duration,
      });

      this.metricQueue.push({
        endpoint: req.originalUrl,
        method: req.method,
        status: res.statusCode,
        duration,
      });

      if (res.statusCode >= 500) {
        // 🟥 System / server error
        await this.captureError(
          new Error(`HTTP ${res.statusCode} ${req.method} ${req.originalUrl}`),
          { module: "express", operation: "response", status: res.statusCode },
          { req, isReq: true }
        );
      } else if (res.statusCode >= 400) {
        // 🟡 Client-side handled error (optional)
        await this.captureError(
          new Error(
            `ClientError ${res.statusCode} ${req.method} ${req.originalUrl}`
          ),
          { module: "express", operation: "response", status: res.statusCode },
          { req, isReq: true }
        );
      }
    });

    next();
  };

  buildPayload = (error, metadata, data) => {
    if (!this.isVerified) {
      this.consoler("API Key is not verified");
      return;
    }
    if (!error) {
      this.consoler("Error is not set");
      return;
    }
    if (metadata.module) {
      metadata.module = metadata.module.toLowerCase();
    } else {
      metadata.module = "Dont know";
    }

    if (metadata.operation) {
      metadata.operation = metadata.operation.toLowerCase();
    } else {
      metadata.operation = "Dont know";
    }

    const errorObj =
      error instanceof Error
        ? error
        : new Error(typeof error === "string" ? error : JSON.stringify(error));

    let message;
    if (errorObj) {
      if (errorObj.message) {
        message = errorObj.message;
      } else {
        message = String(errorObj);
      }
    } else {
      message = String(errorObj || "");
    }

    let stack = errorObj && errorObj.stack ? errorObj.stack : undefined;

    if (data?.isReq && data.req) {
      metadata = {
        ...metadata,
        endpoint: data.req.originalUrl || data.req.url,
        method: data.req.method,
        status: (data.req.res && data.req.res.statusCode) || undefined,
      };
    } else if (data?.isReq && !data.req) {
      this.consoler("res is not set");
      throw new Error("res is not set");
    }

    const top = this.parseTopStackFrame(errorObj && errorObj.stack);

    metadata = {
      ...metadata,
      caller: {
        function: top?.functionName || "<unknown>",
        file: top?.file || "<unknown>",
        line: top?.line ?? null,
        col: top?.col ?? null,
      },
    };

    const payload = {
      sdk_version: "1.0.0",
      id: uuidv4(),
      service_name: this.serviceName,
      level: "ERROR",
      message: message || errorObj.message,
      error_type: errorObj.name || errorObj.code || "Error",
      stack: stack || errorObj.stack,
      metadata: metadata || {},
      timestamp: this.nowIso(),
      //   hostname: os.hostname(),
    };
    return payload;
  };

  captureMessage = async (message, level = "INFO", metadata = {}) => {
    if (!this.isVerified) {
      this.consoler("API Key is not verified");
      return;
    }
    const payload = {
      id: uuidv4(),
      service_name: this.serviceName,
      level,
      message,
      metadata,
      timestamp: this.nowIso(),
    };
    return await this.sendToApi(payload);
  };

  sendToApi = async (payload) => {
    if (!this.isVerified) {
      this.consoler("API Key is not verified");
      return;
    }
    this.queue.push(payload);

    // If we have a full batch, flush immediately
    if (this.queue.length >= this.batchSize) {
      this.flushQueue();
      return;
    }

    // Otherwise schedule a flush if not already scheduled
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flushTimer = null;
        if (this.queue.length > 0) this.flushQueue();
      }, this.flushInterval);
    }
  };

  flushQueue = async () => {
    console.log("Handle comes to flushQueue");

    if (!this.isVerified) {
      this.consoler("API Key is not verified");
      return;
    }

    if (this.isFlushing || this.queue.length <= 0) {
      return;
    }
    const batch = this.queue.splice(0, this.queue.length);
    try {
      this.isFlushing = true;
      const { data } = await axios.post(
        `${this.baseUrl}/api/log/create`,
        batch,
        {
          headers: { "x-api-key": this.apiKey },
          timeout: 5000,
        }
      );
      this.consoler(data);
      this.consoler(`[AIAnalyzer] Flushed ${batch.length} logs successfully.`);
    } catch (error) {
      this.consoler(error);
      console.error(
        "[AIAnalyzer] Failed to flush batch:",
        error?.message || error?.response?.data?.message
      );
      // Retry once after short delay
      // setTimeout(() => {
      //   this.queue.unshift(...batch);
      // }, 2000);
    } finally {
      this.isFlushing = false;
    }
  };

  flushMetric = async () => {
    try {
      if (!this.isVerified) {
        this.consoler("API Key is not verified");
        return;
      }

      if (this.isMetricFlushing || this.metricQueue.length <= 0) {
        return;
      }

      this.isMetricFlushing = true;
      const batch = this.metricQueue.splice(0, this.metricQueue.length);
      const { data } = await axios.post(
        `${this.baseUrl}/api/metric/create`,
        batch,
        {
          headers: { "x-api-key": this.apiKey },
          timeout: 5000,
        }
      );
      this.consoler(data);
      this.consoler(
        `[AIAnalyzer] Flushed ${batch.length} metrics successfully.`
      );
    } catch (error) {
      console.log(error);
      
      this.consoler(error.error?.response?.data?.message|| error.message);
      console.error(
        "[AIAnalyzer] Failed to flush batch metric:",
        error?.message || error?.response?.data?.message
      );
    } finally {
      this.isMetricFlushing = false;
    }
  };

  async shutdown() {
    if (this.flushTimer) clearTimeout(this.flushTimer);
    if (this.queue.length > 0) await this.flushQueue();
    console.log("[AIAnalyzer] SDK shutdown gracefully.");
  }
}
