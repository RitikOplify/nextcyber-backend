import express from "express";
import {
  currentUser,
  refreshTokens,
  signIn,
  signOut,
  signUp,
} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/auth.js";
const router = express.Router();

router.post("/refresh-token", refreshTokens);
router.get("/current", authMiddleware, currentUser);
router.post("/signup", signUp);
router.post("/signin", signIn);
router.get("/signout", authMiddleware, signOut);

export default router;
