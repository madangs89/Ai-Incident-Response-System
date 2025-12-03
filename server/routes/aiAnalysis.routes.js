import express from "express";
import { authMiddleware } from "../middelwares/auth.middelware.js";
import { getAiAnalysis } from "../controllers/aiAnalysis.controller.js";

const aiRoutes = express.Router();

aiRoutes.get("/get-ai/:id", authMiddleware ,getAiAnalysis);

export default aiRoutes;
