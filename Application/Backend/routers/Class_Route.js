import express from "express";
import {
  createClass,
  getAllClasses,
  getSingleClass,
  updateClass,
  deleteClass,
} from "../controllers/Class_Controller.js";

import { protect } from "../middleware/Auth_Middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createClass);            // POST   /api/classes
router.get("/", getAllClasses);           // GET    /api/classes
router.get("/:id", getSingleClass);       // GET    /api/classes/:id
router.put("/:id", updateClass);          // PUT    /api/classes/:id
router.delete("/:id", deleteClass);       // DELETE /api/classes/:id

export default router;