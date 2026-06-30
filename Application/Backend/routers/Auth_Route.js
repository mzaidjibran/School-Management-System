import express from "express";
import {
  SignUp,
  SignIn,
  LogOut,
  RefreshAccessToken,
  GetCurrentUser,
  UpdateMyProfile,
  ForgotPassword,
  VerifyOtp,
  ResetPassword,
  GetPrincipals,
} from "../controllers/Auth_Controller.js";
import { protect, authorize } from "../middleware/Auth_Middleware.js";

const router = express.Router();

// ── Public Routes ─────────────────────────────────────────────────
router.post("/signup",          SignUp);
router.post("/signin",          SignIn);
router.post("/logout",          LogOut);
router.post("/refresh-token",   RefreshAccessToken);
router.post("/forgot-password", ForgotPassword);
router.post("/verify-otp",      VerifyOtp);
router.post("/reset-password",  ResetPassword);
router.get("/principals",       GetPrincipals);

// ── Protected Routes (login zaruri) ──────────────────────────────
router.put ("/me",              protect, UpdateMyProfile);
router.get("/me", protect, GetCurrentUser);

export default router;