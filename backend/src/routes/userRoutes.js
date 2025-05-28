import express from "express";
import cors from "cors";
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

const router = express.Router();

// CORS específico para rotas de usuários
const usersCors = cors({
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
router.use(usersCors);

// Pre-flight request para todas as rotas
router.options("*", usersCors);

// Rotas públicas
router.post("/", createUser);
router.get("/search", searchUsers);
router.post("/force-update-status", forceUpdateLeadStatuses);
router.get("/dashboard/stats", getDashboardStats);

// Rotas que estavam protegidas (removida a autenticação)
router.get("/", getUsers);
router.get("/:id", usersCors, getUserById);
router.put("/:id", usersCors, updateUser);
router.patch("/:id/status", usersCors, updateUserStatus);
router.delete("/:id", deleteUser);

export default router;
