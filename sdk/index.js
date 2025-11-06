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
    this.baseUrl = "https://localhost:3000";
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
      let ok = await axios.get(`${this.baseUrl}/verify`, {
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
      this.consoler(error);
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

  captureMessage(message, level = "INFO", metadata = {}) {
    const payload = {
      id: uuidv4(),
      service_name: this.serviceName,
      level,
      message,
      metadata,
      timestamp: this.nowIso(),
    };
    return this.sendToApi(payload);
  }

  sendToApi = async (payload) => {
    let maxTries = 3;
    let attempt = 0;
    while (attempt <= maxTries) {
      try {
        await axios.post(this.baseUrl, payload);
        return true;
      } catch (error) {
        attempt++;
        if (attempt > maxTries) break;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    return false;
  };
}
