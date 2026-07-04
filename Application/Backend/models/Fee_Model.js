import mongoose from "mongoose";

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student is mandatory"],
    },

    feeType: {
      type: String,
      enum: ["tuition", "admission", "exam", "library", "transport", "other"],
      required: [true, "Fee type is mandatory"],
    },

    amount: {
      type: Number,
      required: [true, "Amount is mandatory"],
      min: [0, "Amount cannot be negative"],
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: [0, "Paid amount cannot be negative"],
    },

    month: {
      type: Number,
      min: 1,
      max: 12,
      default: null,
    },

    year: {
      type: Number,
      required: [true, "Year is mandatory"],
    },

    dueDate: {
      type: Date,
      required: [true, "Due date is mandatory"],
    },

    paidDate: {
      type: Date,
      default: null,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "cheque", "online"],
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "partial", "paid", "overdue"],
      default: "pending",
    },

    receiptNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    remarks: {
      type: String,
      default: null,
    },

    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },

    fine: {
      type: Number,
      default: 0,
      min: [0, "Fine cannot be negative"],
    },

    // TODO: auth lagane par required: true karna
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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
  {
    timestamps: true,
  }
);

feeSchema.index(
  { student: 1, feeType: 1, month: 1, year: 1 },
  {
    unique: true,
    partialFilterExpression: { month: { $ne: null } },
  }
);

feeSchema.index({ status: 1 });
feeSchema.index({ dueDate: 1 });

export const Fee = mongoose.model("Fee", feeSchema);