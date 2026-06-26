import mongoose from "mongoose";

// ── OTP Schema ────────────────────────────────────────────────────────────────
// Forgot password ke liye temporary OTP store karta hai
// MongoDB TTL index: expiresAt time pe document automatically delete ho jata hai
const otpSchema = new mongoose.Schema({
  email:     { type: String, required: true },
  otp:       { type: String, required: true },
  expiresAt: { type: Date,   required: true, index: { expires: 0 } },
});

export default mongoose.models.Otp || mongoose.model("Otp", otpSchema);