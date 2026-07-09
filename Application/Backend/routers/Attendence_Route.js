import express from "express";
import {
  markAttendance,
  getAttendanceByClassAndDate,
  getAttendanceByStudent,
  updateAttendance,
  getTodayAttendanceSummary,
  markStaffAttendance,
  getStaffAttendance,
  updateStaffAttendanceRecord,
} from "../controllers/Attendence_Controller.js";
import { protect } from "../middleware/Auth_Middleware.js";

const router = express.Router();

router.use(protect);

// Staff Attendance routes
router.post("/staff", markStaffAttendance);                        // POST   /api/attendance/staff
router.get("/staff", getStaffAttendance);                          // GET    /api/attendance/staff?date=
router.put("/staff/:id", updateStaffAttendanceRecord);             // PUT    /api/attendance/staff/:id

// Student Attendance routes
router.post("/", markAttendance);                              // POST   /api/attendance
router.get("/",getAttendanceByClassAndDate);                  // GET    /api/attendance?classId=&date=
router.get("/today-summary", getTodayAttendanceSummary);      // GET    /api/attendance/today-summary
router.get("/student/:studentId",getAttendanceByStudent);     // GET    /api/attendance/student/:studentId
router.put("/:id",updateAttendance);                          // PUT    /api/attendance/:id

export default router;