import express from "express";
import {
  getActiveIncidentCount,
  getAllIncidents,
  getIncidentDistribution,
  getResolvedIncidentCount,
  getWeeklyIncidentTrend,
} from "../controllers/securityInsident.controller.js";

const securityIncidentRouter = express.Router();

securityIncidentRouter.get("/", getAllIncidents);
securityIncidentRouter.get("/active/count/:apiKey", getActiveIncidentCount);
securityIncidentRouter.get("/resolved/count/:apiKey", getResolvedIncidentCount);
securityIncidentRouter.get("/distribution/:apiKey", getIncidentDistribution);
securityIncidentRouter.get("/trend/weekly/:apiKey", getWeeklyIncidentTrend);
export default securityIncidentRouter;
