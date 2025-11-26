import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getSummary,
  getLeadsByStage,
  getLeadsBySource,
  getSalesTrend,
  getRecentActivity,
} from "../controllers/dashboardController.js";

const router = express.Router();

// Dashboard routes
router.get("/summary", authenticate, getSummary);
router.get("/leads-by-stage", authenticate, getLeadsByStage);
router.get("/leads-by-source", authenticate, getLeadsBySource);
router.get("/sales-trend", authenticate, getSalesTrend);
router.get("/recent-activity", authenticate, getRecentActivity);

export default router;
