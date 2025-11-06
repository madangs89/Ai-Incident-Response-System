import mongoose from "mongoose";

const aiAnalysisSchema = new mongoose.Schema({
  logId: { type: mongoose.Schema.Types.ObjectId, ref: "Log" },
  root_cause: String,
  fix_suggestion: String,
  ai_model: String,
  createdAt: { type: Date, default: Date.now },
});

const AIAnalysis = mongoose.model("AIAnalysis", aiAnalysisSchema);

export default AIAnalysis;
