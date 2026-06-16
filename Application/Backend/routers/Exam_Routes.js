import express from "express";
import {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  enterMarks,
  getExamResults,
  getStudentResults,
  getResultReport,
} from "../controllers/Exam_Controller.js";
import { protect, authorize } from "../middleware/Auth_Middleware.js";

const router = express.Router();

// Exam routes

router.post("/", protect, authorize("admin", "teacher"), createExam);                          // POST   /api/exams
router.get("/", protect, authorize("admin", "teacher"), getAllExams);                           // GET    /api/exams?classId=&status=&examType=&session=&page=&limit=
router.get("/results/report", protect, authorize("admin", "teacher"), getResultReport);         // GET    /api/exams/results/report?classId=&examType=&session=
router.get("/student/:studentId", protect, authorize("admin", "teacher"), getStudentResults);   // GET    /api/exams/student/:studentId
router.get("/:id", protect, authorize("admin", "teacher"), getExamById);                        // GET    /api/exams/:id
router.put("/:id", protect, authorize("admin", "teacher"), updateExam);                         // PUT    /api/exams/:id
router.delete("/:id", protect, authorize("admin", "teacher"), deleteExam);                      // DELETE /api/exams/:id
router.post("/:examId/marks", protect, authorize("admin", "teacher"), enterMarks);              // POST   /api/exams/:examId/marks
router.get("/:examId/results", protect, authorize("admin", "teacher"), getExamResults);         // GET    /api/exams/:examId/results

export default router;