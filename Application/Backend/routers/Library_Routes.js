import express from "express";
import {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  issueBook,
  returnBook,
  payFine,
  getOverdueBooks,
  getBorrowerHistory,
} from "../controllers/Library_Controller.js";
import { protect, authorize } from "../middleware/Auth_Middleware.js";

const router = express.Router();

// ─── Book Routes ──────────────────────────────────────────────────
router.post("/books", protect, authorize("admin", "librarian"), addBook);                                    // POST   /api/library/books
router.get("/books", protect, authorize("admin", "librarian", "teacher"), getAllBooks);                      // GET    /api/library/books
router.get("/books/:id", protect, authorize("admin", "librarian", "teacher"), getBookById);                  // GET    /api/library/books/:id
router.put("/books/:id", protect, authorize("admin", "librarian"), updateBook);                              // PUT    /api/library/books/:id
router.delete("/books/:id", protect, authorize("admin"), deleteBook);                                        // DELETE /api/library/books/:id

// ─── Issue / Return Routes ────────────────────────────────────────
router.post("/issue", protect, authorize("admin", "librarian"), issueBook);                                  // POST   /api/library/issue
router.put("/return/:id", protect, authorize("admin", "librarian"), returnBook);                             // PUT    /api/library/return/:id
router.put("/fine/:id", protect, authorize("admin", "librarian"), payFine);                                  // PUT    /api/library/fine/:id

// ─── Reports Routes ───────────────────────────────────────────────
router.get("/overdue", protect, authorize("admin", "librarian"), getOverdueBooks);                           // GET    /api/library/overdue
router.get("/history/:borrowerId", protect, authorize("admin", "librarian", "teacher"), getBorrowerHistory); // GET    /api/library/history/:borrowerId

export default router;