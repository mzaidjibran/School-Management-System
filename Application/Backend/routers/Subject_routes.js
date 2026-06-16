import express from "express";
import {
  getAllSubjects,
  getSubjectById,
  addSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/Subject_Controller.js";
import { protect, authorize } from "../middleware/Auth_Middleware.js";

const router = express.Router();

// Subject routes

router.post("/", protect, authorize("admin", "teacher"), addSubject);         // POST   /api/subjects
router.get("/", protect, authorize("admin", "teacher"), getAllSubjects);      // GET    /api/subjects?classId=&status=&search=
router.get("/:id", protect, authorize("admin", "teacher"), getSubjectById);   // GET    /api/subjects/:id
router.put("/:id", protect, authorize("admin", "teacher"), updateSubject);    // PUT    /api/subjects/:id
router.delete("/:id", protect, authorize("admin", "teacher"), deleteSubject); // DELETE /api/subjects/:id

export default router;