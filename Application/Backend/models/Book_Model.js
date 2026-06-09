import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is mandatory"],
      trim: true,
    },

    author: {
      type: String,
      required: [true, "Author name is mandatory"],
      trim: true,
    },

    isbn: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "textbook",
        "novel",
        "science",
        "mathematics",
        "history",
        "geography",
        "islamic",
        "computer",
        "reference",
        "other",
      ],
      required: [true, "Category is mandatory"],
    },

    publisher: {
      type: String,
      trim: true,
      default: null,
    },

    publishedYear: {
      type: Number,
      default: null,
    },

    totalCopies: {
      type: Number,
      required: [true, "Total copies is mandatory"],
      min: [1, "At least 1 copy is required"],
    },

    availableCopies: {
      type: Number,
      required: [true, "Available copies is mandatory"],
      min: [0, "Available copies cannot be negative"],
    },

    shelfLocation: {
      type: String,
      trim: true,
      default: null,
    },

    finePerDay: {
      type: Number,
      default: 5, // Rs. 5 per day default
      min: [0, "Fine cannot be negative"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Added by is mandatory"],
    },
  },
  {
    timestamps: true,
  }
);

bookSchema.index({ title: "text", author: "text" }); // search ke liye
bookSchema.index({ category: 1 });
bookSchema.index({ isActive: 1 });

export const Book = mongoose.model("Book", bookSchema);