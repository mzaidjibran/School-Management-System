import express from "express";
import {
  paySalary,
  getPayrollHistory,
  updateTeacherBaseSalary,
  getPayrollAttendanceStats,
} from "../controllers/Payroll_Controller.js";
import { protect, authorize } from "../middleware/Auth_Middleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.post("/pay", paySalary);
router.get("/history", getPayrollHistory);
router.put("/teacher-salary", updateTeacherBaseSalary);
router.get("/attendance-stats", getPayrollAttendanceStats);

export default router;
