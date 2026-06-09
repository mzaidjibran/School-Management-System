import { Book } from "../models/Book_Model.js";
import { BookIssue } from "../models/BookIssue_Model.js";

// ─── Helper: Fine Calculate Karo ─────────────────────────────────
function calculateFine(dueDate, returnDate, finePerDay) {
  const due = new Date(dueDate);
  const returned = new Date(returnDate);
  if (returned <= due) return 0;

  const diffMs = returned - due;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays * finePerDay;
}

// ═══════════════════════════════════════════════════════════════════
//  BOOK CRUD
// ═══════════════════════════════════════════════════════════════════

// ─── Add Book ─────────────────────────────────────────────────────
export const addBook = async (request, response) => {
  try {
    const bookData = {
      ...request.body,
      addedBy: request.user._id,
      // availableCopies = totalCopies jab pehli baar add ho
      availableCopies: request.body.totalCopies,
    };

    const book = await Book.create(bookData);

    response.status(201).json({
      success: true,
      error: false,
      message: "Book added successfully",
      data: book,
    });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({
        success: false,
        error: true,
        message: "Is ISBN ki book already exist karti hai",
      });
    }
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Get All Books ────────────────────────────────────────────────
export const getAllBooks = async (request, response) => {
  try {
    const { category, search, available } = request.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (available === "true") filter.availableCopies = { $gt: 0 };

    // Text search (title ya author)
    if (search) {
      filter.$text = { $search: search };
    }

    const books = await Book.find(filter).sort({ createdAt: -1 });

    response.status(200).json({
      success: true,
      error: false,
      message: "Books fetched successfully",
      data: books,
      total: books.length,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Get Single Book ──────────────────────────────────────────────
export const getBookById = async (request, response) => {
  try {
    const book = await Book.findById(request.params.id);

    if (!book || !book.isActive) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Book not found",
      });
    }

    response.status(200).json({
      success: true,
      error: false,
      message: "Book fetched successfully",
      data: book,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Update Book ──────────────────────────────────────────────────
export const updateBook = async (request, response) => {
  try {
    const updated = await Book.findByIdAndUpdate(
      request.params.id,
      request.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Book not found",
      });
    }

    response.status(200).json({
      success: true,
      error: false,
      message: "Book updated successfully",
      data: updated,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Delete Book (soft delete) ────────────────────────────────────
export const deleteBook = async (request, response) => {
  try {
    // Pehle check karo koi book issued toh nahi hai
    const activeIssue = await BookIssue.findOne({
      book: request.params.id,
      status: "issued",
    });

    if (activeIssue) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "Yeh book abhi kisi ke paas issued hai, delete nahi ho sakti",
      });
    }

    const deleted = await Book.findByIdAndUpdate(
      request.params.id,
      { isActive: false },
      { new: true }
    );

    if (!deleted) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Book not found",
      });
    }

    response.status(200).json({
      success: true,
      error: false,
      message: "Book deleted successfully",
      data: deleted,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  ISSUE / RETURN
// ═══════════════════════════════════════════════════════════════════

// ─── Issue Book ───────────────────────────────────────────────────
export const issueBook = async (request, response) => {
  try {
    const { bookId, borrowerType, borrowerId, dueDate, remarks } = request.body;

    // Book check karo
    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Book not found",
      });
    }

    // Stock check karo
    if (book.availableCopies <= 0) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "Koi copy available nahi hai",
      });
    }

    // Issue record banao
    const issueRecord = await BookIssue.create({
      book: bookId,
      borrowerType,
      borrowerId,
      borrowerModel: borrowerType === "student" ? "Student" : "Teacher",
      dueDate,
      finePerDay: book.finePerDay, // book se copy karo
      issuedBy: request.user._id,
      remarks: remarks || null,
    });

    // Available copies kam karo
    book.availableCopies -= 1;
    await book.save();

    response.status(201).json({
      success: true,
      error: false,
      message: "Book issued successfully",
      data: issueRecord,
    });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({
        success: false,
        error: true,
        message: "Yeh book is borrower ke paas already issued hai",
      });
    }
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Return Book ──────────────────────────────────────────────────
export const returnBook = async (request, response) => {
  try {
    const { id } = request.params; // issueRecord id
    const { remarks } = request.body;

    const issueRecord = await BookIssue.findById(id).populate("book");

    if (!issueRecord) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Issue record not found",
      });
    }

    if (issueRecord.status === "returned") {
      return response.status(400).json({
        success: false,
        error: true,
        message: "Yeh book already return ho chuki hai",
      });
    }

    const returnDate = new Date();
    const fine = calculateFine(
      issueRecord.dueDate,
      returnDate,
      issueRecord.finePerDay
    );

    // Record update karo
    issueRecord.returnDate = returnDate;
    issueRecord.status = "returned";
    issueRecord.returnedTo = request.user._id;
    issueRecord.remarks = remarks || issueRecord.remarks;

    if (fine > 0) {
      issueRecord.fineStatus = "pending";
    }

    await issueRecord.save();

    // Available copies wapas badhao
    await Book.findByIdAndUpdate(issueRecord.book._id, {
      $inc: { availableCopies: 1 },
    });

    response.status(200).json({
      success: true,
      error: false,
      message:
        fine > 0
          ? `Book returned. Fine: Rs. ${fine} pending`
          : "Book returned successfully. No fine.",
      data: issueRecord,
      fine,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Pay Fine ─────────────────────────────────────────────────────
export const payFine = async (request, response) => {
  try {
    const { id } = request.params;
    const { amount } = request.body;

    const issueRecord = await BookIssue.findById(id);

    if (!issueRecord) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Issue record not found",
      });
    }

    if (issueRecord.fineStatus === "paid") {
      return response.status(400).json({
        success: false,
        error: true,
        message: "Fine already paid hai",
      });
    }

    issueRecord.finePaid = Number(amount);
    issueRecord.fineStatus = "paid";
    await issueRecord.save();

    response.status(200).json({
      success: true,
      error: false,
      message: "Fine paid successfully",
      data: issueRecord,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Get Overdue Books ────────────────────────────────────────────
export const getOverdueBooks = async (request, response) => {
  try {
    const today = new Date();

    const overdueRecords = await BookIssue.find({
      status: "issued",
      dueDate: { $lt: today },
    })
      .populate("book", "title author finePerDay")
      .sort({ dueDate: 1 });

    // Fine calculate karo har record ke liye
    const recordsWithFine = overdueRecords.map((record) => {
      const fine = calculateFine(record.dueDate, today, record.finePerDay);
      return { ...record.toObject(), calculatedFine: fine };
    });

    // Overdue status bhi update karo
    await BookIssue.updateMany(
      { status: "issued", dueDate: { $lt: today } },
      { status: "overdue" }
    );

    response.status(200).json({
      success: true,
      error: false,
      message: "Overdue books fetched successfully",
      data: recordsWithFine,
      total: recordsWithFine.length,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Get Borrower History ─────────────────────────────────────────
// Student ya Teacher ki poori history
export const getBorrowerHistory = async (request, response) => {
  try {
    const { borrowerId } = request.params;
    const { status } = request.query;

    const filter = { borrowerId };
    if (status) filter.status = status;

    const records = await BookIssue.find(filter)
      .populate("book", "title author category")
      .sort({ createdAt: -1 });

    // Summary
    const summary = {
      total: records.length,
      issued: records.filter((r) => r.status === "issued").length,
      returned: records.filter((r) => r.status === "returned").length,
      overdue: records.filter((r) => r.status === "overdue").length,
      pendingFine: records
        .filter((r) => r.fineStatus === "pending")
        .reduce((sum, r) => {
          return sum + calculateFine(r.dueDate, new Date(), r.finePerDay);
        }, 0),
    };

    response.status(200).json({
      success: true,
      error: false,
      message: "Borrower history fetched successfully",
      data: records,
      summary,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};