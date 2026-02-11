import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    endpoint: { type: String, required: true }, // e.g., /api/register
    serviceName: { type: String, required: true },
    errorType: { type: String, required: true }, // e.g., "DatabaseError"
    occurrences: { type: Number, default: 1 }, // how many logs linked
    lastSeen: { type: Date, default: Date.now },
    aiAnalysisId: { type: mongoose.Schema.Types.ObjectId, ref: "AIAnalysis" },
    complexity: { type: String, required: true },
    // errorMessage: { type: String, required: true },
    key: {
      type: String,
      required: true,
    },
    signature: { type: String, required: true },
    metadata: {
      type: Object,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: { type: String, default: "active", enum: ["active", "solved"] },
    stack: { type: String },
    incidentType: {
      type: String,
      enum: ["SECURITY", "ERROR", "ANOMALY"],
      required: true,
    },

    attackType: {
      type: String,
      default: null, // SQL_INJECTION, XSS, etc.
    },
  },
  { timestamps: true },
);
incidentSchema.index({ signature: 1 });
const Incident = mongoose.model("Incident", incidentSchema);

export default Incident;
