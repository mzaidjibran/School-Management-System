import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Branch Name is mandatory"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Branch Code is mandatory"],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Har principal ke levels pe code unique ho sakta hai
branchSchema.index({ code: 1, createdBy: 1 }, { unique: true });

export const Branch = mongoose.model("Branch", branchSchema);
