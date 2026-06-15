const mongoose = require("mongoose");

const TimetableSchema = new mongoose.Schema(
  {
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      required: true,
    },
    periods: [
      {
        periodNumber: { type: Number, required: true },
        subject: { type: String, required: true },
        teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
        startTime: { type: String, required: true }, // "08:00"
        endTime: { type: String, required: true },   // "09:00"
        room: { type: String },
        type: {
          type: String,
          enum: ["lecture", "lab", "library", "sports", "break"],
          default: "lecture",
        },
      },
    ],
    session: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// One timetable per class per day per session
TimetableSchema.index({ class: 1, day: 1, session: 1 }, { unique: true });

module.exports = mongoose.model("Timetable", TimetableSchema);