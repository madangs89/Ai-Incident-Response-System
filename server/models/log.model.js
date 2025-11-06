import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  service_name: String,
  level: String,
  message: String,
  error_type: String,
  stack: String,
  metadata: Object,
  timestamp: Date,
  complexity: String,
  severity: String,
  status: { type: String, default: "active" },
  aiAnalysisId: { type: mongoose.Schema.Types.ObjectId, ref: "AIAnalysis" },
});

const Log = mongoose.model("Log", logSchema);

export default Log;
