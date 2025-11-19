import express from "express";
import { MetricAccept } from "../controllers/metric.controller.js";

const metricRouter = express.Router();

metricRouter.post("/create", MetricAccept);
export default metricRouter;
