import express from "express";
import {
  getAllStudents,
  createStudent,
  getSingleStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/Student_Controller.js";
import { protect, authorize } from "../middleware/Auth_Middleware.js";
import { upload } from "../middleware/Upload_Middleware.js";

const router = express.Router();

router.use(protect);

// Student routes
router.get("/", getAllStudents);
router.get("/:id", getSingleStudent);
router.post("/", upload.single("profileImage"), createStudent);
router.put("/:id", upload.single("profileImage"), updateStudent);
router.delete("/:id", deleteStudent);

export default router;