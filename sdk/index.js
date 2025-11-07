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
  }

  nowIso() {
    return new Date().toISOString();
  }
  init = async () => {
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
  };

  verifyKey = async (key) => {
    try {
      if (!key) {
        return;
      }
      let ok = await axios.get(`${this.baseUrl}/api/key/verify`, {
        headers: {
          "x-api-key": key,
        },
      });

      if (ok.data.valid) {
        this.isVerified = true;
        this.consoler("API Key is verified");
      } else {
        this.isVerified = false;
        this.consoler("API Key is not verified");
      }
    } catch (error) {
      this.isVerified = false;
      this.consoler(error.response.data.message);
    }
  };

  parseTopStackFrame(stack) {
    if (!stack || typeof stack !== "string") return null;
    const lines = stack
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // matches: at fn (path:line:col)  OR  at path:line:col
      const m = line.match(/at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?$/);
      if (m) {
        const functionName = m[1] || "<anonymous>";
        const file = m[2];
        const lineNo = parseInt(m[3], 10);
        const colNo = parseInt(m[4], 10);
        return { functionName, file, line: lineNo, col: colNo };
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
  };

  expressCapture = async (err, req, res, next) => {
    if (!this.isVerified) {
      this.consoler("API Key is not verified");
      return;
    }
    try {
      await this.captureError(
        err,
        { module: "express", operation: "express" },
        { req, isReq: true }
      );
    } catch (error) {
      this.consoler(error);
    } finally {
      const start = Date.now();
      res.on("finish", () => {
        const duration = Date.now() - start;
        this.captureMessage("API_METRIC", "INFO", {
          endpoint: req.originalUrl,
          method: req.method,
          status: res.statusCode,
          duration,
        });
      });
      next();
    }
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
    let maxTries = 3;
    let attempt = 0;
    while (attempt <= maxTries) {
      this.consoler("Sending to api");
      try {
        const data = await axios.post(
          `${this.baseUrl}/api/log/create`,
          payload,
          {
            headers: {
              "x-api-key": this.apiKey,
            },
          }
        );
        this.consoler(data.data);

        this.consoler(payload);
        return true;
      } catch (error) {
        console.log(error);

        attempt++;
        if (attempt > maxTries) break;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    return false;
  };
}
