import express from "express";
import { authMiddleware } from "../middelwares/auth.middelware.js";
import {
  getAllIncidents,
  markIncidentAsSolved,
} from "../controllers/incident.controller.js";

const incidentRouter = express.Router();

incidentRouter.get("/get-incidents/:key", authMiddleware, getAllIncidents);
incidentRouter.put(
  "/mark-incident-solved/:incidentId",
  authMiddleware,
  markIncidentAsSolved
);

export default incidentRouter;
