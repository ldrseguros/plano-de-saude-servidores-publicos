import { Router } from "express";
import {
  getUserEnrollmentSteps,
  updateEnrollmentStep,
  completeEnrollmentStep,
  getEnrollmentProgress,
} from "../controllers/enrollmentController.js";

const router = Router();

// Enrollment routes
router.get("/user/:userId/steps", getUserEnrollmentSteps);
router.get("/user/:userId/progress", getEnrollmentProgress);
router.put("/user/:userId/step/:step", updateEnrollmentStep);
router.post("/user/:userId/step/:step/complete", completeEnrollmentStep);

export default router;
