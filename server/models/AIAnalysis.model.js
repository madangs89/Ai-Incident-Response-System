import mongoose from "mongoose";

const aiAnalysisSchema = new mongoose.Schema(
  {
    incidentId: { type: mongoose.Schema.Types.ObjectId, ref: "Incident" },
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
