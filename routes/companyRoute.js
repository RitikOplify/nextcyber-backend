import express from "express";
import {
  createCompanyProfile,
  getCompany,
} from "../controllers/companyController.js";
const router = express.Router();

router.get("/", getCompany);
router.post("/", createCompanyProfile);

export default router;