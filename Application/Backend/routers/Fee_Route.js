import express from "express";
import {
  createFee,
  getStudentFees,
  getPendingFees,
  getAllFees,
  payFee,
  updateFee,
  deleteFee,
} from "../controllers/Fee_Controller.js";

import { protect } from "../middleware/Auth_Middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createFee);                          // POST   /api/fee
router.get("/", getAllFees);                           // GET    /api/fee
router.get("/pending", getPendingFees);               // GET    /api/fee/pending
router.get("/student/:studentId", getStudentFees);    // GET    /api/fee/student/:studentId
router.put("/pay/:id", payFee);                       // PUT    /api/fee/pay/:id
router.put("/:id", updateFee);                        // PUT    /api/fee/:id
router.delete("/:id", deleteFee);                     // DELETE /api/fee/:id

export default router;