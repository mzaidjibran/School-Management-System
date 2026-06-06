import express from "express";
import {
  createFee,
  getStudentFees,
  getPendingFees,
  payFee,
  updateFee,
  deleteFee,
} from "../controllers/Fee_Controller.js";
import { protect, authorize } from "../middleware/Auth_Middleware.js";

const router = express.Router();

// Fee routes

router.post("/", protect, authorize("admin", "accountant"), createFee);                              // POST   /api/fee
router.get("/pending", protect, authorize("admin", "accountant"), getPendingFees);                   // GET    /api/fee/pending
router.get("/student/:studentId", protect, authorize("admin", "accountant"), getStudentFees);        // GET    /api/fee/student/:studentId
router.put("/pay/:id", protect, authorize("admin", "accountant"), payFee);                           // PUT    /api/fee/pay/:id
router.put("/:id", protect, authorize("admin"), updateFee);                                          // PUT    /api/fee/:id
router.delete("/:id", protect, authorize("admin"), deleteFee);                                       // DELETE /api/fee/:id

export default router;