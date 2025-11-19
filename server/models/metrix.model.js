import mongoose from "mongoose";

const metricSchema = new mongoose.Schema(
  {
    apiKey: {
      type: String,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    count: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 },
    avgDuration: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

metricSchema.index({ apiKey: 1, endpoint: 1, method: 1 });
const Metric = mongoose.model("Metric", metricSchema);

export default Metric;
