import mongoose from "mongoose";

const securityIncidentSchema = new mongoose.Schema(
  {
    // ---- Identity ----
    serviceName: { type: String, required: true },

    endpoint: { type: String, required: true }, // /login
    method: { type: String, required: true }, // POST

    apiKey: { type: String, required: true }, // for attribution to service

    // ---- Attack classification ----
    attackType: {
      type: String,
      enum: [
        "SQL_INJECTION",
        "NOSQL_INJECTION",
        "XSS",
        "COMMAND_INJECTION",
        "PATH_TRAVERSAL",
        "ANOMALY",
      ],
      required: true,
    },

    detectionSource: {
      type: String,
      enum: ["RULE", "ML", "RULE+ML"],
      required: true,
    },

    severity: {
      type: Number, // 1 (low) → 5 (critical)
      min: 1,
      max: 5,
      required: true,
    },
    confidence: {
      type: Number, // ML confidence
      min: 0,
      max: 1,
      default: null,
    },

    // ---- Grouping / de-duplication ----
    signature: {
      type: String,
      required: true,
      index: true,
    },

    occurrences: {
      type: Number,
      default: 1,
    },

    // ---- Evidence (why flagged) ----
    indicators: {
      payloadSample: { type: String }, // trimmed
      queryParamsCount: { type: Number },
      isJson: { type: Boolean },
      mlScore: { type: Number },
    },

    // ---- Request context ----
    requestMeta: {
      normalizedPath: String,
      userAgent: String,
      clientIp: String,
    },

    metrics: {
      durationMs: Number,
      statusCode: Number,
    },

    // ---- Lifecycle ----
    status: {
      type: String,
      enum: ["open", "acknowledged", "resolved"],
      default: "open",
    },
  },
  { timestamps: true },
);

// Indexes for UI & performance
securityIncidentSchema.index({ signature: 1 });
securityIncidentSchema.index({ severity: -1 });
securityIncidentSchema.index({ lastSeen: -1 });
securityIncidentSchema.index({ attackType: 1 });

const SecurityIncident = mongoose.model(
  "SecurityIncident",
  securityIncidentSchema,
);

export default SecurityIncident;
