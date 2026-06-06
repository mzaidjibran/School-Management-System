import mongoose from "mongoose";

// Yeh model track karta hai ke student ko kab kaunsi class assign hui
// History bhi rehti hai — promoted, transferred wagera

const classAssignmentSchema = new mongoose.Schema(
  {
    // ─── Kaunsa Student ───────────────────────────────────────────
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student is mandatory"],
    },

    // ─── Kaunsi Class ─────────────────────────────────────────────
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class is mandatoryzaruri hai"],
    },

    // ─── Academic Year ────────────────────────────────────────────
    academicYear: {
      type: String,
      required: [true, "Academic year is mandatory"],
      // e.g. "2024-2025"
    },

    // ─── Kab Assign Hua ───────────────────────────────────────────
    assignedDate: {
      type: Date,
      default: Date.now,
    },

    // ─── Kab Tak Raha ─────────────────────────────────────────────
    // Agar current assignment hai to null rahega
    leftDate: {
      type: Date,
      default: null,
    },

    // ─── Kyu Assign Hua / Kyu Gaya ────────────────────────────────
    reason: {
      type: String,
      enum: ["new_admission", "promoted", "transferred", "re_admitted"],
      default: "new_admission",
    },

    // ─── Current Assignment Hai Ya Purani History ─────────────────
    isCurrent: {
      type: Boolean,
      default: true,
      // Jab student promote ho to purani entry ka isCurrent = false ho jaega
    },

    // ─── Kisne Assign Kiya ────────────────────────────────────────
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin
      required: [true, "Assigned by is mandatory"],
    },
  },
  {
    timestamps: true,
  }
);

// ─── Ek Student Ki Current Assignment Ek Hi Hogi ─────────────────
classAssignmentSchema.index(
  { student: 1, isCurrent: 1 },
  {
    unique: true,
    partialFilterExpression: { isCurrent: true },
    // Sirf wahan unique enforce hoga jahan isCurrent = true ho
  }
);

export const ClassAssignment = mongoose.model("ClassAssignment", classAssignmentSchema);