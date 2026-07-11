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
  parseBiometricLogs,
  parseStudentBiometricLogs,
  markStudentBiometricAttendance,
  getTodayTeacherAttendanceSummary,
} from "../controllers/Attendence_Controller.js";
import { protect } from "../middleware/Auth_Middleware.js";

const router = express.Router();

router.use(protect);

// Staff Attendance routes
router.post("/staff", markStaffAttendance);                        // POST   /api/attendance/staff
router.get("/staff", getStaffAttendance);                          // GET    /api/attendance/staff?date=
router.get("/staff/today-summary", getTodayTeacherAttendanceSummary); // GET    /api/attendance/staff/today-summary
router.put("/staff/:id", updateStaffAttendanceRecord);             // PUT    /api/attendance/staff/:id
router.post("/staff/biometric-parse", parseBiometricLogs);         // POST   /api/attendance/staff/biometric-parse

// Student Attendance routes
router.post("/", markAttendance);                              // POST   /api/attendance
router.get("/",getAttendanceByClassAndDate);                  // GET    /api/attendance?classId=&date=
router.get("/today-summary", getTodayAttendanceSummary);      // GET    /api/attendance/today-summary
router.get("/student/:studentId",getAttendanceByStudent);     // GET    /api/attendance/student/:studentId
router.put("/:id",updateAttendance);                          // PUT    /api/attendance/:id
router.post("/student/biometric-parse", parseStudentBiometricLogs); // POST /api/attendance/student/biometric-parse
router.post("/student/biometric-save", markStudentBiometricAttendance); // POST /api/attendance/student/biometric-save

export default router;