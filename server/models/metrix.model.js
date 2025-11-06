import mongoose from "mongoose";

const metricSchema = new mongoose.Schema({
  service_name: String,
  endpoint: String,
  method: String,
  status: Number,
  count: { type: Number, default: 0 },
  error_count: { type: Number, default: 0 },
  total_duration: { type: Number, default: 0 },
  avg_duration: { type: Number, default: 0 },
  timestamp: { type: Date, default: () => new Date() },
});

const Metric = mongoose.model("Metric", metricSchema);

export default Metric;
