import { Router } from "express";
import {
  getUserEnrollmentSteps,
  updateEnrollmentStep,
  completeEnrollmentStep,
  getEnrollmentProgress,
  savePdfDocument,
  getUserDocuments,
  downloadDocument,
  getDocumentDiagnostics,
} from "../controllers/enrollmentController.js";

const router = Router();

// Enrollment routes
router.get("/user/:userId/steps", getUserEnrollmentSteps);
router.get("/user/:userId/progress", getEnrollmentProgress);
router.put("/user/:userId/step/:step", updateEnrollmentStep);
router.post("/user/:userId/step/:step/complete", completeEnrollmentStep);
router.post("/user/:userId/step/:step", completeEnrollmentStep);
router.post("/user/:userId/pdf", savePdfDocument);
router.get("/user/:userId/documents", getUserDocuments);
router.get("/documents/:documentId/download", downloadDocument);
router.get("/documents/:documentId/diagnostics", getDocumentDiagnostics);

export default router;
