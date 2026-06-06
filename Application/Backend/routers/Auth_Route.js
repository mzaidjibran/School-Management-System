import express from "express";
import { register, login, getMe } from "../controllers/Auth_Controller.js";
import { protect } from "../middleware/Auth_Middleware.js";

const router = express.Router();

// Auth routes

router.post("/register", register);   // POST  /api/auth/register
router.post("/login", login);         // POST  /api/auth/login
router.get("/me", protect, getMe);    // GET   /api/auth/me

export default router;