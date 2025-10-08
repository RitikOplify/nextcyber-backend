import express from "express";
import {
  createStudent,
  deleteStudent,
  getStudent,
  getStudentById,
  studentOnboarding,
} from "../controllers/studentController.js";
const router = express.Router();

router.get("/", getStudent);
router.get("/:id", getStudentById);
router.delete("/:id", deleteStudent);
router.post("/", createStudent);
router.post("/onboarding/:id", studentOnboarding);

export default router;
