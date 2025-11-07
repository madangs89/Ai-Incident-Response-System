import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectName: {
      type: String,
      required: true,
    },
    environment: { type: String, default: "development" },
    totalAnalyzedLogs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const APIKey = mongoose.model("APIKey", apiKeySchema);

export default APIKey;
