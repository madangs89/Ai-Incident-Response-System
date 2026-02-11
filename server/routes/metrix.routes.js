import express from "express";
import {
  avrgResTime,
  MetricAccept,
  totalApiCallToday,
} from "../controllers/metric.controller.js";

const metricRouter = express.Router();

metricRouter.post("/create", MetricAccept);

metricRouter.get("/today/total/:apiKey", totalApiCallToday);
metricRouter.get("/average-response/:apiKey", avrgResTime);

export default metricRouter;
