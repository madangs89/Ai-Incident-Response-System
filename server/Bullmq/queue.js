import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import IORedis from "ioredis";
import pkg from "bullmq";
const { Queue } = pkg;

export const ioredis = new IORedis(process.env.REDIS_URL , {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: {},
});

const defaultJobOptions = {
  attempts: 1,
  backoff: { type: "exponential", delay: 2000 },
  removeOnComplete: { age: 3600, count: 5000 },
  removeOnFail: { age: 86400, count: 1000 },
  timeout: 30_000,
};

// correct initialization: pass { connection, defaultJobOptions } as one object
export const apiLogsQueue = new Queue("api-logs-queue", {
  connection: ioredis,
  defaultJobOptions,
});

export const aiResponseQueue = new Queue("ai-response-queue", {
  connection: ioredis,
  defaultJobOptions,
});

export const messagingQueue = new Queue("messaging-queue", {
  connection: ioredis,
  defaultJobOptions,
});
export const errorQueue = new Queue("errors-queue", {
  connection: ioredis,
  defaultJobOptions,
});
