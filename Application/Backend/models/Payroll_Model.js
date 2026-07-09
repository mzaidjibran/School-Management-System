import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Teacher is mandatory"],
    },
    month: {
      type: String, // e.g. "July 2026"
      required: [true, "Month is mandatory"],
    },
    salaryBasis: {
      type: String,
      enum: ["monthly", "weekly", "daily"],
      required: [true, "Salary basis is mandatory"],
    },
    rate: {
      type: Number,
      required: [true, "Salary rate is mandatory"],
    },
    units: {
      type: Number,
      required: [true, "Working units is mandatory"],
      default: 1,
    },
    allowance: {
      type: Number,
      default: 0,
    },
    deduction: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      required: [true, "Net salary is mandatory"],
    },
    status: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },
    paymentDate: {
      type: Date,
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

// Ensure one payroll record per teacher per month
payrollSchema.index({ teacher: 1, month: 1 }, { unique: true });

export const Payroll = mongoose.model("Payroll", payrollSchema);
