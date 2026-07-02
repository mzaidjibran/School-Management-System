import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student is mandatory"],
    },

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class is mandatory"],
    },

    date: {
      type: Date,
      required: [true, "Date is mandatory"],
    },

    schoolSection: {
      type: String,
      enum: ["girls", "boys"],
      required: false,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
    },

    status: {
      type: String,
      enum: ["present", "absent", "late", "leave"],
      required: [true, "Status is mandatory"],
    },

    lateMinutes: {
      type: Number,
      default: 0,
    },

    remarks: {
      type: String,
      trim: true,
      default: null,
    },

    // markedBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Teacher",
    //   required: [true, "Marked by is mandatory"],
    // },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ student: 1, class: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model("Attendance", attendanceSchema);