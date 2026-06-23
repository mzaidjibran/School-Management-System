import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Class name is mandatory"],
      trim: true,
    },

    section: {
      type: String,
      required: [true, "Section is mandatory"],
      trim: true,
      uppercase: true,
    },

    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },

    academicYear: {
      type: String,
      required: [true, "Academic year is mandatory"],
    },

    room: {
      type: String,
      default: null,
    },

    capacity: {
      type: Number,
      default: 40,
    },

    // ── NEW: frontend (Add/Edit Class form) sends these, model me missing thay ──
    shift: {
      type: String,
      enum: ["Morning", "Evening"],
      default: "Morning",
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

classSchema.index({ name: 1, section: 1, academicYear: 1 }, { unique: true });

export const Class = mongoose.model("Class", classSchema);