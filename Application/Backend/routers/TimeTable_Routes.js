import express from "express";
import {
  createOrUpdateTimetable,
  getClassTimetable,
  getTodayTimetable,
  getTeacherTimetable,
  deleteTimetable,
} from "../controllers/Timetable_Controller.js";
import { protect, authorize } from "../middleware/Auth_Middleware.js";

const router = express.Router();

// Timetable routes

router.post("/", protect, authorize("admin", "teacher"), createOrUpdateTimetable);              // POST   /api/timetable
router.get("/teacher/:teacherId", protect, authorize("admin", "teacher"), getTeacherTimetable);  // GET    /api/timetable/teacher/:teacherId?session=
router.get("/:classId/today", protect, authorize("admin", "teacher"), getTodayTimetable);        // GET    /api/timetable/:classId/today?session=
router.get("/:classId", protect, authorize("admin", "teacher"), getClassTimetable);              // GET    /api/timetable/:classId?session=
router.delete("/:id", protect, authorize("admin", "teacher"), deleteTimetable);                  // DELETE /api/timetable/:id

export default router;