import express from "express";
import { authMiddleware } from "../middelwares/auth.middelware.js";
import {
  changePassword,
  deleteUser,
  getAllUsers,
  getUserLogEdUserDetails,
  setCurrentApiKey,
  updateUserDetails,
} from "../controllers/user.controler.js";

const userRouter = express.Router();

userRouter.get("/profile", authMiddleware, getUserLogEdUserDetails);
userRouter.put("/update", authMiddleware, updateUserDetails);
userRouter.delete("/delete/:id", deleteUser);
userRouter.get("/get-all", getAllUsers);
userRouter.put("/change-pass", authMiddleware, changePassword);
userRouter.put("/set-api-key/:key/:value", authMiddleware, setCurrentApiKey);
// Added
export default userRouter;
