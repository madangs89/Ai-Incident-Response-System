import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    endpoint: { type: String, required: true }, // e.g., /api/register
    serviceName: { type: String, required: true },
    errorType: { type: String, required: true }, // e.g., "DatabaseError"
    occurrences: { type: Number, default: 1 }, // how many logs linked
    lastSeen: { type: Date, default: Date.now },
    aiAnalysisId: { type: mongoose.Schema.Types.ObjectId, ref: "AIAnalysis" },
  },
  { timestamps: true }
);

const Incident = mongoose.model("Incident", incidentSchema);

export default Incident;
