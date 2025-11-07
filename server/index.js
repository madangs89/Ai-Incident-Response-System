import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/connnectDb.js";
import authRouter from "./routes/auth.routes.js";
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
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

app.listen(process.env.PORT, async () => {
  await connectDB();
  console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});
