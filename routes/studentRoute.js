import express from "express";
import {
  createStudent,
  deleteStudent,
  getStudent,
  getStudentById,
} from "../controllers/studentController.js";
const router = express.Router();

router.get("/", getStudent);
router.get("/:id", getStudentById);
router.delete("/:id", deleteStudent);
router.post("/", createStudent);

export default router;
