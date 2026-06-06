import express from "express";
import {
  getAllStudents,
  createStudent,
  getSingleStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/Student_Controller.js";
import { protect, authorize } from "../middleware/Auth_Middleware.js";

const router = express.Router();

// Student routes

router.post("/", protect, authorize("admin"), createStudent);                   // POST   /api/students
router.get("/", protect, authorize("admin", "teacher"), getAllStudents);        // GET    /api/students
router.get("/:id", protect, authorize("admin", "teacher"), getSingleStudent);  // GET    /api/students/:id
router.put("/:id", protect, authorize("admin"), updateStudent);                 // PUT    /api/students/:id
router.delete("/:id", protect, authorize("admin"), deleteStudent);              // DELETE /api/students/:id

export default router;