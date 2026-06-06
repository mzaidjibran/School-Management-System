import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // ─── Basic Info ───────────────────────────────────────────────
    firstName: {
      type: String,
      required: [true, "First name zaruri hai"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name zaruri hai"],
      trim: true,
    },

    // ─── Login Credentials ────────────────────────────────────────
    email: {
      type: String,
      required: [true, "Email zaruri hai"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password zaruri hai"],
      minlength: [6, "Password kam az kam 6 characters ka hona chahiye"],
      select: false, // by default password fetch nahi hoga
    },

    // ─── Role ─────────────────────────────────────────────────────
    role: {
      type: String,
      enum: ["admin", "teacher", "accountant"],
      default: "teacher",
    },

    // ─── Profile ──────────────────────────────────────────────────
    profileImage: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },

    // ─── Status ───────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    // ─── Password Reset ───────────────────────────────────────────
    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Password Save Se Pehle Hash Karo ────────────────────────────
userSchema.pre("save", async function () {
  // Sirf tab hash karo jab password change hua ho
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ─── Password Compare Method ──────────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;