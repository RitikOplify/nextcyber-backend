import express from "express";
import {
  createStudent,
  getStudent,
  getStudentById,
} from "../controllers/studentController.js";
const router = express.Router();

router.get("/", getStudent);
router.get("/:id", getStudentById);
router.post("/", createStudent);

export default router;