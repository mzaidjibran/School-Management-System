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

router.use(protect);

// Timetable routes
router.post("/",createOrUpdateTimetable);              // POST   /api/timetable
router.get("/teacher/:teacherId", getTeacherTimetable);  // GET    /api/timetable/teacher/:teacherId?session=
router.get("/:classId/today", getTodayTimetable);        // GET    /api/timetable/:classId/today?session=
router.get("/:classId", getClassTimetable);              // GET    /api/timetable/:classId?session=
router.delete("/:id", deleteTimetable);                  // DELETE /api/timetable/:id

export default router;