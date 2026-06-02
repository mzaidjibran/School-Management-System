import express from "express";
import {
  getAllStudents,
  createStudent,
  getSingleStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/Student_Controller.js";

const router = express.Router();

//student routers

router.post("/", createStudent);
router.get("/",getAllStudents);
router.get("/:id",getSingleStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

export default router;