import { Worker } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";
import { generateSignature } from "../config/hashWorker.js";
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
    for (let i = 0; i < log.length; i++) {
      // console.log(log[i]);
      const signature = generateSignature(
        log[0]?.error_type,
        log[0]?.message,
        log[0]?.metadata?.functionName,
        log[0]?.metadata?.file
      );
      console.log(signature);

      // here i will do some logic here if fails
    }
    return { processed: log.length };
  },
  { connection }
);

console.log("Worker is running...");
