import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/connnectDb.js";
import authRouter from "./routes/auth.routes.js";
import keysRouter from "./routes/keys.routes.js";
import logRouter from "./routes/log.routes.js";
import { app, httpServer } from "./server.js";
import userRouter from "./routes/user.routes.js";
import { generateAnalysis } from "./config/google.js";
import metricRouter from "./routes/metrix.routes.js";
import incidentRouter from "./routes/incident.routes.js";
import aiRoutes from "./routes/aiAnalysis.routes.js";

import securityIncidentRouter from "./routes/securityInsident.routes.js";

import axios from "axios";

async function spamLogin() {
  for (let i = 1; i <= 15; i++) {
    try {
      await axios.post("http://localhost:4000/login", {
        username: "admin",
        password: "wrongpassword",
      });
      console.log(`Request ${i} sent`);
    } catch {
      console.log(`Request ${i} failed`);
    }
  }
}

async function flood() {
  const promises = [];
  for (let i = 0; i < 200; i++) {
    promises.push(axios.get("http://localhost:4000/ddos").catch(() => {}));
  }
  await Promise.all(promises);
}

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Hello from server",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/key", keysRouter);
app.use("/api/log", logRouter);
app.use("/api/metric", metricRouter);
app.use("/api/user", userRouter);
app.use("/api/incident", incidentRouter);
app.use("/api/ai", aiRoutes);
app.use("/api/security-incident", securityIncidentRouter);

httpServer.listen(process.env.PORT, async () => {
  await connectDB();

  const fakeLog = {
    serviceName: "user-service",
    message: "MongoDB connection refused: ECONNREFUSED 127.0.0.1:27017",
    errorType: "MongoNetworkError",
    metadata: {
      severity: 5,
      module: "database",
      operation: "connect",
      status: 500,
      endpoint: "/init/db",
      caller: {
        function: "connectToDB",
        file: "src/config/db.js",
        line: 42,
        col: 11,
      },
      environment: "production",
    },
    complexity: 5,
    key: "test-api-key-456",
    sdk_version: "1.0.0",
    level: "CRITICAL",
    createdAt: "2025-11-12T10:22:10.421Z",
    endpoint: "/init/db",
    stack: `MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1494:16)
    at MongoClient.connect (/usr/src/app/node_modules/mongodb/lib/mongo_client.js:160:30)`,
  };
  console.log(`Server is running on port http://localhost:${process.env.PORT}`);

  // flood();
});
