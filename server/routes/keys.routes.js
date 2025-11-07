import express from "express";
import {
  createAPIKey,
  deleteAPIKey,
  getAPIKeys,
  verifyKeys,
} from "../controllers/apikeys.controller.js";
import { authMiddleware } from "../middelwares/auth.middelware.js";

const keysRouter = express.Router();

keysRouter.post("/key/create", authMiddleware, createAPIKey);
keysRouter.get("/key/get", authMiddleware, getAPIKeys);
keysRouter.delete("/key/delete/:id", authMiddleware, deleteAPIKey);
keysRouter.get("/key/verify", verifyKeys);

export default keysRouter;
