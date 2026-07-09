import mongoose from "mongoose";

const staffAttendanceSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Teacher is mandatory"],
    },
    date: {
      type: Date,
      required: [true, "Date is mandatory"],
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "leave"],
      required: [true, "Status is mandatory"],
    },
    remarks: {
      type: String,
      trim: true,
      default: null,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a teacher can only have one attendance entry per day
staffAttendanceSchema.index({ teacher: 1, date: 1 }, { unique: true });

export const StaffAttendance = mongoose.model("StaffAttendance", staffAttendanceSchema);
