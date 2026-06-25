import express from "express";
import {
  getAllNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  getActiveNotices,
} from "../controllers/Notice_Controller.js";

const router = express.Router();

// Notice routes

router.post("/",createNotice);          // POST   /api/notices
router.get("/", getAllNotices);          // GET    /api/notices?status=&priority=&targetAudience=&page=&limit=
router.get("/active", getActiveNotices); // GET    /api/notices/active
router.get("/:id", getNoticeById);       // GET    /api/notices/:id
router.put("/:id", updateNotice);        // PUT    /api/notices/:id
router.delete("/:id", deleteNotice);     // DELETE /api/notices/:id

export default router;