import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, unique: true, trim: true },
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
  },
  { timestamps: true }
);

export default mongoose.model('Subject', SubjectSchema);