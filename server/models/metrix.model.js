import mongoose from "mongoose";

const metricSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
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

const Metric = mongoose.model("Metric", metricSchema);

export default Metric;
