import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    Name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true }, // bcrypt hashed

    // ─── Role ─────────────────────────────────────────────────────
    role: {
      type: String,
      enum: ["admin", "teacher"],
      default: "admin",
    },
    assignedPages: {
      type: [String],
      default: [],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },

    // ─── Profile ──────────────────────────────────────────────────
    profileImage: {
      type: String,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    schoolName: {
      type: String,
      default: "",
    },
    schoolLogo: {
      type: String,
      default: "",
    },

    // Forgot password OTP fields (active OTP ke waqt set hote hain)
    resetOTP:       { type: String, default: null },
    resetOTPExpiry: { type: Date,   default: null },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);