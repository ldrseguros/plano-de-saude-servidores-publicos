import { Router } from "express";
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  verifyAdminToken,
} from "../controllers/authController.js";

const router = Router();

// Public routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Protected routes
router.get("/profile", verifyAdminToken, getAdminProfile);

export default router;
