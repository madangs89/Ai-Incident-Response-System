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
      type: String,
      required: true,
    },
    key: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "APIKey",
    },
  },
  {
    timestamps: true,
    ttl: 7 * 24 * 60 * 60, // 7 day
  }
);

const Log = mongoose.model("Log", logSchema);

export default Log;
