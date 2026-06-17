import express from "express";
import {
  createTeacher,
  getAllTeachers,
  getSingleTeacher,
  updateTeacher,
  deleteTeacher,
  assignClass,
} from "../controllers/Teacher_Controller.js";
import { protect, authorize } from "../middleware/Auth_Middleware.js";
import { upload } from "../middleware/Upload_Middleware.js";

const router = express.Router();

// ─── Teacher CRUD ─────────────────────────────────────────────────
router.post("/",upload.single("profileImage"), createTeacher);
router.get("/",getAllTeachers);
router.get("/:id", getSingleTeacher);
router.put("/:id",upload.single("profileImage"), updateTeacher);
router.delete("/:id",deleteTeacher);
router.post("/:id/class",assignClass);

export default router;