import { Router } from "express";
import cors from "cors";
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  verifyAdminToken,
} from "../controllers/authController.js";

const router = Router();

// CORS específico para rotas de autenticação
const authCors = cors({
  origin: [
    "http://localhost:8080",
    "http://localhost:3000",
    "http://127.0.0.1:8080",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
});

// Aplicar CORS específico para todas as rotas
router.use(authCors);

// Pre-flight request para todas as rotas
router.options("*", authCors);

// Public routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Protected routes
router.get("/profile", verifyAdminToken, getAdminProfile);

export default router;
