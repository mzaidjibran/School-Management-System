import express from "express";
import { getNotifications, markAllAsRead } from "../controllers/Notification_Controller.js";
import { protect } from "../middleware/Auth_Middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getNotifications);
router.put("/read-all", markAllAsRead);

export default router;
