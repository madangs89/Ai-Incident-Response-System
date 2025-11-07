import { oAuthLogin } from "../controllers/auth.controller.js";
import express from "express";
const authRouter = express.Router();




authRouter.post("/google" , oAuthLogin)


export default authRouter