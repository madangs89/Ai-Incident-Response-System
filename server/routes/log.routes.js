import express from "express";
import { acceptLog } from "../controllers/logs.controller.js";

const logRouter = express.Router();

logRouter.post("/log/create", acceptLog);
export default logRouter;
