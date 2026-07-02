import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    description: { type: String },
    class: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    creditHours: { type: Number, default: 1 },
    type: {
      type: String,
      enum: ["theory", "practical", "both"],
      default: "theory",
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
    },
    schoolSection: {
      type: String,
      enum: ["girls", "boys"],
      default: null,
    },
  },
  { timestamps: true }
);

SubjectSchema.index({ code: 1, createdBy: 1, branch: 1, schoolSection: 1 }, { unique: true });

export default mongoose.model('Subject', SubjectSchema);