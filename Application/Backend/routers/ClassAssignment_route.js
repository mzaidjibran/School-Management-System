import express from "express";
import {
  assignStudentToClass,
  getStudentCurrentClass,
  getStudentClassHistory,
  getStudentsInClass,
} from "../controllers/ClassAssignment_Controller.js";
import { protect, authorize } from "../middleware/Auth_Middleware.js";

const router = express.Router();

// ClassAssignment routes

router.post("/", protect, authorize("admin"), assignStudentToClass);                                         // POST   /api/class-assignment
router.get("/student/:studentId/current", protect, authorize("admin", "teacher"), getStudentCurrentClass);   // GET    /api/class-assignment/student/:studentId/current
router.get("/student/:studentId/history", protect, authorize("admin", "teacher"), getStudentClassHistory);   // GET    /api/class-assignment/student/:studentId/history
router.get("/class/:classId/students", protect, authorize("admin", "teacher"), getStudentsInClass);          // GET    /api/class-assignment/class/:classId/students

export default router;