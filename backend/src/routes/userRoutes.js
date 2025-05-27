import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  getDashboardStats,
  searchUsers,
  forceUpdateLeadStatuses,
} from "../controllers/userController.js";

const router = Router();

// Public routes
router.post("/", createUser);
router.get("/search", searchUsers);
router.post("/force-update-status", forceUpdateLeadStatuses);

// Protected routes (add auth middleware later if needed)
router.get("/", getUsers);
router.get("/dashboard/stats", getDashboardStats);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.patch("/:id/status", updateUserStatus);
router.delete("/:id", deleteUser);

export default router;
