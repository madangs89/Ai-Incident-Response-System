import express from "express";
import { authMiddleware } from "../middelwares/auth.middelware.js";
import { getAllIncidents } from "../controllers/incident.controller.js";

const incidentRouter = express.Router();

incidentRouter.get("/get-incidents/:key", authMiddleware, getAllIncidents);

export default incidentRouter;
