import express from "express";
import {
  createClass,
  getAllClasses,
  getSingleClass,
  updateClass,
  deleteClass,
} from "../controllers/Class_Controller.js";
import { protect, authorize } from "../middleware/Auth_Middleware.js";

const router = express.Router();

// Class routes

router.post("/", protect, authorize("admin"), createClass);                           // POST   /api/classes
router.get("/", protect, authorize("admin", "teacher"), getAllClasses);               // GET    /api/classes
router.get("/:id", protect, authorize("admin", "teacher"), getSingleClass);           // GET    /api/classes/:id
router.put("/:id", protect, authorize("admin"), updateClass);                         // PUT    /api/classes/:id
router.delete("/:id", protect, authorize("admin"), deleteClass);                      // DELETE /api/classes/:id

export default router;