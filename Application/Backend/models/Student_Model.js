import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters"],
    },

    CNIC: {
      type: String,
      unique: true,
      trim: true,
      maxlength: [20, "CNIC cannot exceed 20 characters"],
    },

    dateOfBirth: {
      type: Date,
      default: Date.now,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    dateOfJoining: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "Terminated", "On Leave"],
      default: "Active",
    },

    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    profileImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Student", studentSchema);
