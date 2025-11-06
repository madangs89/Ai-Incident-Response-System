import mongoose from "mongoose";

const aiAnalysisSchema = new mongoose.Schema(
  {
    logId: { type: mongoose.Schema.Types.ObjectId, ref: "Log" },
    rootCause: {
      type: String,
      required: true,
    },
    fixSuggestion: {
      type: String,
      required: true,
    },
    aiModel: {
      type: String,
      required: true,
      enum: ["openai", "huggingface", "gemini"],
      default: "gemini",
    },
  },
  {
    timestamps: true,
  }
);

const AIAnalysis = mongoose.model("AIAnalysis", aiAnalysisSchema);

export default AIAnalysis;
