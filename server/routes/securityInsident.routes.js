import express from "express";
import {
  getActiveIncidentCount,
  getAllIncidents,
  getIncidentDistribution,
  getResolvedIncidentCount,
  getWeeklyIncidentTrend,
  resolveIncidentGroup,
} from "../controllers/securityInsident.controller.js";

const securityIncidentRouter = express.Router();

securityIncidentRouter.get("/", getAllIncidents);
securityIncidentRouter.put("/resolve/:id", resolveIncidentGroup);

securityIncidentRouter.get("/active/count/:apiKey", getActiveIncidentCount);
securityIncidentRouter.get("/resolved/count/:apiKey", getResolvedIncidentCount);
securityIncidentRouter.get("/distribution/:apiKey", getIncidentDistribution);
securityIncidentRouter.get("/trend/weekly/:apiKey", getWeeklyIncidentTrend);
export default securityIncidentRouter;
