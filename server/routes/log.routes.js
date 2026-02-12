import express from "express";
import {
  acceptLog,
  getWeeklyLogTrend,
} from "../controllers/logs.controller.js";

const logRouter = express.Router();

logRouter.post("/create", acceptLog);
logRouter.get("/trend/:key", getWeeklyLogTrend);
export default logRouter;
