import express from "express";
import {
  getAllSubjects,
  getSubjectById,
  addSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/Subject_Controller.js";

const router = express.Router();

// TODO: auth lagane par protect aur authorize middleware wapas add karna
router.post("/", addSubject);         // POST   /api/subjects
router.get("/", getAllSubjects);      // GET    /api/subjects?classId=&status=&search=
router.get("/:id", getSubjectById);  // GET    /api/subjects/:id
router.put("/:id", updateSubject);   // PUT    /api/subjects/:id
router.delete("/:id", deleteSubject);// DELETE /api/subjects/:id

export default router;