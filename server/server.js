import express from "express";
import { createServer } from "http";
import { createClient } from "redis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
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


io.on("connection", (socket) => {
  console.log(socket);
});
