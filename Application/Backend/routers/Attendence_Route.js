import express from "express";
import {
  markAttendance,
  getAttendanceByClassAndDate,
  getAttendanceByStudent,
  updateAttendance,
  getTodayAttendanceSummary
} from "../controllers/Attendence_Controller.js";
import { protect, authorize } from "../middleware/Auth_Middleware.js";

const router = express.Router();

// Attendance routes

router.post("/", markAttendance);                              // POST   /api/attendance
router.get("/",getAttendanceByClassAndDate);                  // GET    /api/attendance?classId=&date=
router.get("/student/:studentId",getAttendanceByStudent);     // GET    /api/attendance/student/:studentId
router.put("/:id",updateAttendance);                          // PUT    /api/attendance/:id
router.get("/today-summary", getTodayAttendanceSummary);

export default router;