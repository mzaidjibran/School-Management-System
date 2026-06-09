import mongoose from "mongoose";

const bookIssueSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: [true, "Book is mandatory"],
    },

    // ─── Borrower: Student YA Teacher ────────────────────────────
    borrowerType: {
      type: String,
      enum: ["student", "teacher"],
      required: [true, "Borrower type is mandatory"],
    },

    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "borrowerModel", // dynamic ref
      required: [true, "Borrower ID is mandatory"],
    },

    borrowerModel: {
      type: String,
      enum: ["Student", "Teacher"],
      required: true,
    },

    // ─── Issue / Return Dates ─────────────────────────────────────
    issueDate: {
      type: Date,
      required: [true, "Issue date is mandatory"],
      default: Date.now,
    },

    dueDate: {
      type: Date,
      required: [true, "Due date is mandatory"],
    },

    returnDate: {
      type: Date,
      default: null,
    },

    // ─── Fine ─────────────────────────────────────────────────────
    finePerDay: {
      type: Number,
      required: true, // Book se copy kiya jayega issue ke waqt
    },

    finePaid: {
      type: Number,
      default: 0,
    },

    fineStatus: {
      type: String,
      enum: ["none", "pending", "paid"],
      default: "none",
    },

    // ─── Status ───────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["issued", "returned", "overdue"],
      default: "issued",
    },

    remarks: {
      type: String,
      trim: true,
      default: null,
    },

    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Issued by is mandatory"],
    },

    returnedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Ek borrower ke paas ek book sirf ek baar issue ho sakti hai (jab tak return na ho)
bookIssueSchema.index(
  { book: 1, borrowerId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "issued" },
  }
);

bookIssueSchema.index({ status: 1 });
bookIssueSchema.index({ dueDate: 1 });
bookIssueSchema.index({ borrowerId: 1 });

export const BookIssue = mongoose.model("BookIssue", bookIssueSchema);