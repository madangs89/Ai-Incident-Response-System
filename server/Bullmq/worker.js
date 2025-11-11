import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { generateSignature } from "../config/hashWorker.js";
import Log from "../models/log.model.js";
import { connectDB } from "../config/connnectDb.js";
import { addErrorJob } from "./logQueue.js";
console.log("REDIS_URL:", process.env.REDIS_URL); // ← check this prints correctly


import {ioredis} from "./queue.js";

try {
  await connectDB();
  console.log("✅ MongoDB connected in worker");
} catch (err) {
  console.error("❌ MongoDB connection failed:", err.message);
  process.exit(1);
}

export const apiLogsWorker = new Worker(
  "api-logs-queue",
  async (job) => {
    const { log, key } = job.data;
    // console.log(log, key);
    console.log("Processing job type:", job.name, key);
    const FullLogs = [];
    const fullIncidents = [];
    console.log("Processing Job from:", key, "Log Count:", log.length);
    for (let i = 0; i < log.length; i++) {
      // console.log(log[i]);
      const signature = generateSignature(
        log[i]?.error_type,
        log[i]?.message,
        log[i]?.metadata?.functionName,
        log[i]?.metadata?.file
      );
      if (!fullIncidents.some((item) => item.signature === signature)) {
        fullIncidents.push({
          signature,
          serviceName: log[i]?.service_name,
          message: log[i]?.message,
          errorType: log[i]?.error_type,
          metadata: log[i]?.metadata,
          complexity: log[i]?.metadata?.severity,
          key: key,
          sdk_version: log[i]?.sdk_version,
          level: log[i]?.level,
          createdAt: log[i]?.timestamp,
          endpoint: log[i]?.metadata?.endpoint || log[i]?.metadata?.module,
        });
      }
      FullLogs.push({
        serviceName: log[i]?.service_name,
        message: log[i]?.message,
        errorType: log[i]?.error_type,
        metadata: log[i]?.metadata,
        complexity: log[i]?.metadata?.severity,
        key: key,
        sdk_version: log[i]?.sdk_version,
        level: log[i]?.level,
        createdAt: log[i]?.timestamp,
      });
    }
    let isError = false;
    try {
      const data = await Log.insertMany(FullLogs);
      if (data) {
        console.log("Logs Inserted Successfully");
      }
    } catch (error) {
      console.log(error);
      isError = true;
    }
    if (!isError) {
      try {
        console.log("adding to incidents");

        // here i am pushing my data to database
      } catch (error) {
        let payload = {
          fullIncidents,
        };
        await addErrorJob(
          payload,
          "errorQueue",
          "errors-queue",
          key,
          "incidents"
        );
      }
    } else {
      let payload = {
        fullIncidents,
        FullLogs,
      };
      await addErrorJob(payload, "errorQueue", "errors-queue", key, "fullLogs");
    }
    return { processed: log.length };
  },
  { connection: ioredis }
);

console.log("Worker is running...");
