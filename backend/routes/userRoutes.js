import express from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  getAllUsers,
  addUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

// Routes
router.get("/", authenticate, requireAdmin, getAllUsers);
router.post("/", authenticate, requireAdmin, addUser);
router.put("/:id", authenticate, requireAdmin, updateUser);
router.delete("/:id", authenticate, requireAdmin, deleteUser);

export default router;
