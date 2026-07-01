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
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    CNIC: {
      type: String,
      trim: true,
    },
    religion: {
      type: String,
      trim: true,
    },
    nationality: {
      type: String,
      trim: true,
    },
    previousSchool: {
      type: String,
      trim: true,
    },
    medicalInfo: {
      type: String,
      trim: true,
    },
    emergencyName: {
      type: String,
      trim: true,
    },
    emergencyPhone: {
      type: String,
      trim: true,
    },
    motherName: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      trim: true,
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
      sparse: true,
    },
    admissionNumber: {
      type: String,
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
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.index({ rollNumber: 1, createdBy: 1 }, { unique: true, sparse: true });
studentSchema.index({ admissionNumber: 1, createdBy: 1 }, { unique: true, sparse: true });

export const Student = mongoose.model("Student", studentSchema);