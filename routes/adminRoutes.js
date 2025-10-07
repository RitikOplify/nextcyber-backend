import express from "express";
import { adminSignIn, adminSignUp } from "../controllers/adminController.js";
const router = express.Router();
router.post("/sign-up", adminSignUp);
router.post("/signin", adminSignIn);

export default router;
