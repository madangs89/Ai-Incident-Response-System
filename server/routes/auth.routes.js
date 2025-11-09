import {
  gitLogin,
  isAuthenticated,
  login,
  logout,
  oAuthLogin,
  signUp,
} from "../controllers/auth.controller.js";
import express from "express";
import { authMiddleware } from "../middelwares/auth.middelware.js";
const authRouter = express.Router();

authRouter.post("/google", oAuthLogin);
authRouter.post("/github", gitLogin);
authRouter.post("/signup", signUp);
authRouter.post("/login", login);
authRouter.get("/is-auth", authMiddleware, isAuthenticated);
authRouter.post("/logout", logout);

export default authRouter;
