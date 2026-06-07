// Teacher_Route.js
import express from "express";

// Teacher CRUD
import {
  createTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  assignClass,
} from "../controllers/Teacher_Controller.js";

// Attendance
import {
  markAttendance,
  getAttendance,
  updateAttendance,
} from "../controllers/Teacher_Attendence_Controller.js";

// Salary
import {
  generateSalary,
  getSalaryRecords,
  markAsPaid,
} from "../controllers/Teacher_Salary_Controller.js";

// Leave
import {
  applyLeave,
  getAllLeaves,
  updateLeaveStatus,
} from "../controllers/Teacher_Leave_Controller.js";

import { protect, authorize } from "../middleware/Auth_Middleware.js";

const router = express.Router();

// ─── Teacher CRUD ─────────────────────────────────────────────────────────────
router.post("/",          protect, authorize("admin"),            createTeacher);      // POST   /api/teachers
router.get("/",           protect, authorize("admin", "teacher"), getAllTeachers);     // GET    /api/teachers
router.get("/:id",        protect, authorize("admin", "teacher"), getTeacherById);  // GET    /api/teachers/:id
router.put("/:id",        protect, authorize("admin"),            updateTeacher);      // PUT    /api/teachers/:id
router.delete("/:id",     protect, authorize("admin"),            deleteTeacher);      // DELETE /api/teachers/:id
router.post("/:id/class", protect, authorize("admin"),            assignClass);        // POST   /api/teachers/:id/class

// ─── Attendance ───────────────────────────────────────────────────────────────
router.post("/attendance/mark",    protect, authorize("admin"),            markAttendance);   // POST   /api/teachers/attendance/mark
router.get("/attendance/records",  protect, authorize("admin", "teacher"), getAttendance);    // GET    /api/teachers/attendance/records
router.put("/attendance/:id",      protect, authorize("admin"),            updateAttendance); // PUT    /api/teachers/attendance/:id

// ─── Salary ───────────────────────────────────────────────────────────────────
router.post("/salary/generate",  protect, authorize("admin"), generateSalary);    // POST   /api/teachers/salary/generate
router.get("/salary/records",    protect, authorize("admin"), getSalaryRecords);  // GET    /api/teachers/salary/records
router.put("/salary/:id/pay",    protect, authorize("admin"), markAsPaid);        // PUT    /api/teachers/salary/:id/pay

// ─── Leave ────────────────────────────────────────────────────────────────────
router.post("/leave/apply",       protect, authorize("admin", "teacher"), applyLeave);         // POST   /api/teachers/leave/apply
router.get("/leave/all",          protect, authorize("admin"),            getAllLeaves);        // GET    /api/teachers/leave/all
router.put("/leave/:id/status",   protect, authorize("admin"),            updateLeaveStatus);  // PUT    /api/teachers/leave/:id/status

export default router;