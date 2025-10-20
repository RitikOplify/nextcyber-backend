import express from "express";
import { recruiterOnboarding } from "../controllers/recruiterController.js";
import { authMiddleware } from "../middlewares/auth.js";
const router = express.Router();

router.post("/onboarding/:id", authMiddleware, recruiterOnboarding);

export default router;
