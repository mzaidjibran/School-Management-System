import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is mandatory"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is mandatory"],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is mandatory"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Gender is mandatory"],
    },
    profileImage: {
  type: String,
  default: null,
},

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: { type: String },
      city:   { type: String },
      state:  { type: String },
      zip:    { type: String },
    },

    guardian: {
      name:         { type: String, required: [true, "Guardian name is required"] },
      relationship: { type: String, enum: ["father", "mother", "other"] },
      phone:        { type: String, required: [true, "Guardian phone is required"] },
      email:        { type: String, lowercase: true },
      cnic:         { type: String },
    },

    rollNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    admissionNumber: {
      type: String,
      unique: true,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },

    currentClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      default: null,
    },
    section: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "graduated", "expelled", "transferred"],
      default: "active",
    },

    documents: [
      {
        name: { type: String },  // e.g. "Birth Certificate"
        url:  { type: String },  // file path / cloud URL
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Student = mongoose.model("Student", studentSchema);