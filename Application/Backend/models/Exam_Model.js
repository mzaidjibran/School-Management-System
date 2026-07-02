import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    subject: { type: String, required: true, trim: true },
    examDate: { type: Date, required: true },
    endDate: { type: Date },
    startTime: { type: String },
    duration: { type: Number },
    totalMarks: { type: Number, required: true, default: 100 },
    passingMarks: { type: Number, required: true, default: 40 },
    venue: { type: String },
    examType: {
      type: String,
      enum: ["mid_term", "final_term", "unit_test", "practical", "quiz", "Theory", "Practical", "Both"],
      required: true,
    },
    session: { type: String },
    instructions: { type: String },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled", "Upcoming", "Ongoing", "Completed", "Cancelled"],
      default: "scheduled",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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

const ResultSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    obtainedMarks: { type: Number, required: true },
    grade: { type: String },
    remarks: { type: String },
    status: { type: String, enum: ["pass", "fail"] },
    // Optional — set karo jab auth ho
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Auto-calculate grade and pass/fail
ResultSchema.pre("save", async function (next) {
  const exam = await mongoose.model("Exam").findById(this.exam);
  if (exam) {
    this.status = this.obtainedMarks >= exam.passingMarks ? "pass" : "fail";
    const percentage = (this.obtainedMarks / exam.totalMarks) * 100;
    if (percentage >= 90) this.grade = "A+";
    else if (percentage >= 80) this.grade = "A";
    else if (percentage >= 70) this.grade = "B";
    else if (percentage >= 60) this.grade = "C";
    else if (percentage >= 50) this.grade = "D";
    else this.grade = "F";
  }
  next();
});

ResultSchema.index({ exam: 1, student: 1 }, { unique: true });

const Exam = mongoose.model("Exam", ExamSchema);
const Result = mongoose.model("Result", ResultSchema);

export { Exam, Result };