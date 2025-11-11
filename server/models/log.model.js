import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    serviceName: {
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
    metadata: {
      type: Object,
      required: true,
    },
    complexity: {
      type: Number || String,
      required: true,
      default: 1,
    },
    level: {
      type: String,
      required: true,
      default: "High",
      // enu: ["High", "Medium", "Low"],
    },
    sdkVersion: {
      type: String,
      required: true,
      default: "1.0.0",
    },
    key: { type: String, required: true },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    ttl: 7 * 24 * 60 * 60, // 7 day
  }
);

const Log = mongoose.model("Log", logSchema);

export default Log;
