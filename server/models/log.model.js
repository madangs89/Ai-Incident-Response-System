import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  errorType: {
    type: String,
    required: true,
  },
  stack: {
    type: String,
    required: true,
  },
  metadata: {
    type: Object,
    required: true,
  },
  complexity: {
    type: String,
    required: true,
  },
  status: { type: String, default: "active" },
  aiAnalysisId: { type: mongoose.Schema.Types.ObjectId, ref: "AIAnalysis" },
});

const Log = mongoose.model("Log", logSchema);

export default Log;
