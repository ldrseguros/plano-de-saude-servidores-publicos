import { Router } from "express";
import {
  addDependent,
  createDependentFromBody,
  getUserDependents,
  updateDependent,
  deleteDependent,
  updateDependents,
} from "../controllers/dependentController.js";

const router = Router();

// Dependent routes
router.post("/", createDependentFromBody); // Nova rota que aceita userId no body
router.post("/user/:userId", addDependent);
router.post("/user/:userId/bulk", updateDependents); // Bulk update/create dependents
router.get("/user/:userId", getUserDependents);
router.put("/:id", updateDependent);
router.delete("/:id", deleteDependent);

export default router;
