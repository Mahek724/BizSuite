import express from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getAssignedTags,
} from "../controllers/clientController.js";

const router = express.Router();

// Routes
router.get("/", authenticate, getClients);
router.get("/:id", authenticate, getClientById);
router.post("/", authenticate, requireAdmin, createClient);
router.put("/:id", authenticate, requireAdmin, updateClient);
router.delete("/:id", authenticate, requireAdmin, deleteClient);
router.get("/tags/assigned", authenticate, getAssignedTags);

export default router;
