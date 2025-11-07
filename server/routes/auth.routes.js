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

authRouter.post("/auth/google", oAuthLogin);
authRouter.post("/auth/github", gitLogin);
authRouter.post("/auth/signup", signUp);
authRouter.post("/auth/login", login);
authRouter.get("/auth/is-auth", authMiddleware, isAuthenticated);
authRouter.post("/auth/logout", logout);

export default authRouter;
