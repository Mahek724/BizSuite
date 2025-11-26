import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  getLeadSources,
} from "../controllers/leadController.js";

const router = express.Router();

// Lead routes
router.post("/", authenticate, createLead);
router.get("/", authenticate, getLeads);
router.get("/sources/all", authenticate, getLeadSources);
router.get("/:id", authenticate, getLeadById);
router.put("/:id", authenticate, updateLead);
router.delete("/:id", authenticate, deleteLead);

export default router;
