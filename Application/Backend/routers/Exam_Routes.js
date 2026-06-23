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

const router = express.Router();

// Auth baad mein lagayenge — abhi sab open hain
router.post("/",                    createExam);         // POST   /api/exams
router.get("/",                     getAllExams);         // GET    /api/exams
router.get("/results/report",       getResultReport);    // GET    /api/exams/results/report
router.get("/student/:studentId",   getStudentResults);  // GET    /api/exams/student/:studentId
router.get("/:id",                  getExamById);        // GET    /api/exams/:id
router.put("/:id",                  updateExam);         // PUT    /api/exams/:id
router.delete("/:id",               deleteExam);         // DELETE /api/exams/:id
router.post("/:examId/marks",       enterMarks);         // POST   /api/exams/:examId/marks
router.get("/:examId/results",      getExamResults);     // GET    /api/exams/:examId/results

export default router;