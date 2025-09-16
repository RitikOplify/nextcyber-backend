import express from "express";
import { createStudent, getStudent } from "../controllers/studentController.js";
const router = express.Router();

router.get("/", getStudent);
router.post("/", createStudent);

export default router;
