import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { createPlan, deletePlan, getPlanById, getPlans, updatePlan } from "../controllers/planController.js";

const router = express.Router();

router.post("/", authMiddleware, createPlan);
router.get("/", getPlans);
router.get("/:id", getPlanById);
router.put("/:id", authMiddleware, updatePlan);
router.delete("/:id", authMiddleware, deletePlan);

export default router;
