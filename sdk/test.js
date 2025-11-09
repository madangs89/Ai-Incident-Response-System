import mongoose from "mongoose";
import { Client as PgClient } from "pg";
import mysql from "mysql2/promise";
import { createClient as createRedisClient } from "redis";
import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import axios from "axios";
import AIAnalyzerLogger from "./index.js";
const logger = new AIAnalyzerLogger(
  "77f7bfab15f87a12b82b73cef0c7fd558c5ea3d41f8993836af102f711084e1d",
  "test",
  "development"
);
await logger.init();
logger.setupGlobalCapture();

// async function mongoConnectionError() {
//   try {
//     await mongoose.connect("mongodb://127.0.0.1:9999/fake");
//     console.log("✅ MongoDB Connected Successfully");
//   } catch (err) {
//     console.log("❌ MongoDB Error:", err.message);
//     await logger.captureError(err, { module: "database", operation: "mongo_connect" });
//   }
// }

// await mongoConnectionError();

// async function postgresAuthError() {
//   const client = new PgClient({
//     host: "localhost",
//     port: 5432,
//     user: "wrong_user",
//     password: "wrong_password",
//     database: "testdb",
//   });
//   try {
//     await client.connect();
//   } catch (err) {
//     console.log("❌ Postgres Error:", err.message);
//     await logger.captureError(err, {
//       module: "database",
//       operation: "pg_connect",
//     });
//   }
// }

// await postgresAuthError();

// async function mysqlHostError() {
//   try {
//     await mysql.createConnection({
//       host: "127.0.0.2", // non-existent host
//       user: "root",
//       password: "test",
//       database: "fake",
//       connectTimeout: 2000,
//     });
//   } catch (err) {
//     console.log("❌ MySQL Error:", err.message);
//     await logger.captureError(err, { module: "database", operation: "mysql_connect" });
//   }
// }

// await mysqlHostError();

// async function redisConnectionError() {
//   const client = createRedisClient({ url: "redis://:wrongpassword@localhost:6379" ,  });
//   client.on("error", async (err) => {
//     console.log("❌ Redis Error:", err.message);
//     await logger.captureError(err, { module: "database", operation: "redis_connect" });
//   });
//   try {
//     await client.connect();
//   } catch (err) {}
// }

// await redisConnectionError();

// async function networkTimeoutError() {
//   try {
//     await axios.get("https://10.255.255.1", { timeout: 2000 });
//   } catch (err) {
//     console.log("❌ Network Timeout:", err.message);
//     await logger.captureError(err, { module: "network", operation: "timeout" });
//   }
// }

// await networkTimeoutError();



// async function networkDnsError() {
//   try {
//     await axios.get("https://invalid-domain.ai-analyzer.fake");
//   } catch (err) {
//     console.log("❌ DNS Error:", err.message);
//     await logger.captureError(err, { module: "network", operation: "dns_fail" });
//   }
// }

// await networkDnsError();

// async function fileMissingError() {
//   try {
//     await fs.readFile("./this-file-does-not-exist.txt", "utf8");
//   } catch (err) {
//     console.log("❌ FS Missing Error:", err.message);
//     await logger.captureError(err, { module: "fs", operation: "readFile" });
//   }
// }

// await fileMissingError();


// async function authTokenError() {
//   try {
//     const token = null;
//     if (!token) throw new Error("JWT token missing in request headers");
//   } catch (err) {
//     console.log("❌ Auth Error:", err.message);
//     await logger.captureError(err, { module: "auth", operation: "token_check" });
//   }
// }

// await authTokenError();

// function runtimeReferenceError() {
//   console.log(undefinedVariable);
// }

// runtimeReferenceError();


async function unhandledRejectionError() {
  Promise.reject(new Error("Unhandled promise rejection from async task"));
}

await unhandledRejectionError();