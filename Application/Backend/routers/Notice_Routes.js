import express from "express";
import {
  getAllNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  getActiveNotices,
} from "../controllers/Notice_Controller.js";
import { protect, authorize } from "../middleware/Auth_Middleware.js";

const router = express.Router();

// Notice routes

router.post("/", protect, authorize("admin", "teacher"), createNotice);          // POST   /api/notices
router.get("/", protect, authorize("admin", "teacher"), getAllNotices);          // GET    /api/notices?status=&priority=&targetAudience=&page=&limit=
router.get("/active", protect, authorize("admin", "teacher"), getActiveNotices); // GET    /api/notices/active
router.get("/:id", protect, authorize("admin", "teacher"), getNoticeById);       // GET    /api/notices/:id
router.put("/:id", protect, authorize("admin", "teacher"), updateNotice);        // PUT    /api/notices/:id
router.delete("/:id", protect, authorize("admin", "teacher"), deleteNotice);     // DELETE /api/notices/:id

export default router;