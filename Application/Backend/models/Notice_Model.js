import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    priority: {
      type: String,
      enum: ["urgent", "important", "normal"],
      default: "normal",
    },
    targetAudience: {
      type: String,
      enum: ["all", "students", "teachers", "parents", "staff"],
      default: "all",
    },
    targetClass: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
    publishDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    attachments: [{ type: String }],
    status: {
      type: String,
      enum: ["draft", "published", "expired", "archived"],
      default: "published",
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
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Notice', NoticeSchema);