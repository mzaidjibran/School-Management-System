import mongoose from "mongoose";

// ── Refresh Token Schema ──────────────────────────────────────────────────────
// JWT refresh tokens store karta hai — logout ya expiry pe delete ho jate hain
const refreshTokenSchema = new mongoose.Schema(
  {
    // Kis user ka token hai
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token:     { type: String, required: true },
    expiresIn: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.RefreshToken || mongoose.model("RefreshToken", refreshTokenSchema);