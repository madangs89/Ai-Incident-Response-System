import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { generateSignature } from "../config/hashWorker.js";
import Log from "../models/log.model.js";
import { connectDB } from "../config/connnectDb.js";
import { addErrorJob } from "./logQueue.js";
console.log("REDIS_URL:", process.env.REDIS_URL); // ← check this prints correctly
// aiResponseQueue
import { aiResponseQueue, ioredis } from "./queue.js";
import Incident from "../models/insident.model.js";
import { generateAnalysis } from "../config/google.js";
import AIAnalysis from "../models/AIAnalysis.model.js";

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
          stack: log[i]?.stack,
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
        stack: log[i]?.stack,
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

        const bulkOps = fullIncidents.map((incident) => ({
          updateOne: {
            filter: { signature: incident.signature },
            update: {
              $setOnInsert: {
                endpoint: incident.endpoint,
                serviceName: incident.serviceName,
                errorType: incident.errorType,
                complexity: incident.complexity,
                key: incident.key,
                message: incident.message,
                metadata: incident.metadata,
                stack: incident.stack,
                status: "active",
                aiAnalysisId: incident.aiAnalysisId || null,
              },
              $set: { lastSeen: new Date() },
              $inc: { occurrences: 1 },
            },
            upsert: true,
          },
        }));

        const result = await Incident.bulkWrite(bulkOps, { ordered: false });

        // Only newly INSERTED docs need AI queue
        if (result.upsertedCount > 0) {
          console.log("New Incidents Inserted:");
          for (const index in result.upsertedIds) {
            const insertedId = result.upsertedIds[index];

            // original input that caused the NEW insert
            const originalIncident = fullIncidents[index];

            await aiResponseQueue.add("ai-response-queue", {
              incident: originalIncident,
              key,
              _id: insertedId,
            });

            console.log("added to ai response queue");
          }
        }
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
export const aiResponseWorker = new Worker(
  "ai-response-queue",
  async (job) => {
    const { incident, key, _id } = job.data;
    console.log(
      "Processing Job from:",
      key,
      "Incident Count:",
      incident,
      "id",
      _id
    );

    try {
      const aiResponse = await generateAnalysis(incident);
      console.log("top", aiResponse);
      console.log(aiResponse?.rootCause);

      if (aiResponse) {
        console.log("in", aiResponse);
        const aiAnalysis = await AIAnalysis.create({
          incidentId: _id,
          rootCause:
            aiResponse?.rootCause ||
            "Something May Went Wrong Please ReGenerate in Web UI",
          fixSuggestion:
            aiResponse?.fixSuggestion ||
            "Something May Went Wrong Please ReGenerate in Web UI",
        });
        console.log("ai analysis", aiAnalysis);
      }
      return { processed: incident };
    } catch (error) {
      console.error("AI job failed:", error);

      throw error;
    }
  },
  {
    connection: ioredis,
  }
);
console.log("ai-response queue is running");
