import express from "express";
import {
  applyJob,
  createJob,
  deleteJob,
  getAllJobs,
  getJob,
  getRecruiterJob,
  updateJob,
} from "../controllers/jobController.js";
import { authMiddleware, recruiterMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.post("/create-job", authMiddleware, recruiterMiddleware, createJob);

// router.get("/get-all-jobs", authMiddleware, recruiterMiddleware, getAllJobs);
router.get("/get-all-jobs", authMiddleware, getAllJobs);

router.get("/get-job", authMiddleware, recruiterMiddleware, getJob);

router.put("/update-job", authMiddleware, recruiterMiddleware, updateJob);

router.patch("/delete-job", authMiddleware, recruiterMiddleware, deleteJob);
router.patch("/apply/:id", authMiddleware, applyJob);

router.get("/recruiter", authMiddleware, recruiterMiddleware, getRecruiterJob);

export default router;
