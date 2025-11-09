import express from "express";
import {
  createAPIKey,
  deleteAPIKey,
  getAPIKeys,
  verifyKeys,
} from "../controllers/apikeys.controller.js";
import { authMiddleware } from "../middelwares/auth.middelware.js";

const keysRouter = express.Router();

keysRouter.post("/create", authMiddleware, createAPIKey);
keysRouter.get("/get", authMiddleware, getAPIKeys);
keysRouter.delete("/delete/:id", authMiddleware, deleteAPIKey);
keysRouter.get("/verify", verifyKeys);

export default keysRouter;
