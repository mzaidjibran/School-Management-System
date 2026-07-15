import express from "express";
import { verifyWebhook, receiveMessage } from "../controllers/whatsapp_controller.js";

const router = express.Router();

// Webhook endpoints
router.get("/webhook", verifyWebhook);
router.post("/webhook", receiveMessage);

export default router;
