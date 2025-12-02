import express from "express";
import { authenticate } from "../middleware/auth.js";
import { generateSummary } from "../controllers/aiController.js";

const router = express.Router();

// dashboard summary
router.post("/", authenticate, generateSummary);

export default router;
