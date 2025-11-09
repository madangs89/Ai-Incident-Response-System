import { Worker } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

console.log("REDIS_URL:", process.env.REDIS_URL); // ← check this prints correctly

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: {},
});

export const apiLogsWorker = new Worker(
  "api-logs-queue",
  async (job) => {
    const { log, key } = job.data;
    console.log("Processing Job from:", key, "Log Count:", log.length);

    return { processed: log.length };
  },
  { connection }
);

console.log("Worker is running...");
