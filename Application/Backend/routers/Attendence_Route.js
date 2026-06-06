import express from "express";
import {
  markAttendance,
  getAttendanceByClassAndDate,
  getAttendanceByStudent,
  updateAttendance,
} from "../controllers/Attendence_Controller.js";
import { protect, authorize } from "../middleware/Auth_Middleware.js";

const router = express.Router();

// Attendance routes

router.post("/", protect, authorize("admin", "teacher"), markAttendance);                              // POST   /api/attendance
router.get("/", protect, authorize("admin", "teacher"), getAttendanceByClassAndDate);                  // GET    /api/attendance?classId=&date=
router.get("/student/:studentId", protect, authorize("admin", "teacher"), getAttendanceByStudent);     // GET    /api/attendance/student/:studentId
router.put("/:id", protect, authorize("admin", "teacher"), updateAttendance);                          // PUT    /api/attendance/:id

export default router;