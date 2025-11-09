import express from "express";
import { createServer } from "http";
import { createClient } from "redis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import IORedis from "ioredis";
import pkg from "bullmq";
const { Queue } = pkg;
import cors from "cors";
export const app = express();

export const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

export const pubClient = createClient({
  url: process.env.REDIS_URL,
});
const subClient = pubClient.duplicate();

pubClient.on("error", function (err) {
  throw err;
});
subClient.on("error", function (err) {
  throw err;
});

pubClient.on("connect", function (err) {
  console.log("Redis PubClient connected");
});
subClient.on("connect", function (err) {
  console.log("Redis subClient connected");
});
await pubClient.connect();
await subClient.connect();

io.adapter(createAdapter(pubClient, subClient));

export const ioredis = new IORedis(process.env.REDIS_URL);

const defaultJobOptions = {
  attempts: 3,
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

// new QueueScheduler("api-logs-queue", redisConnection);
// new QueueScheduler("ai-response-queue", redisConnection);
// new QueueScheduler("messaging-queue", redisConnection);

io.on("connection", (socket) => {
  console.log(socket);
});
