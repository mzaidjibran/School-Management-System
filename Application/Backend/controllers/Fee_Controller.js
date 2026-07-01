import { Fee } from "../models/Fee_Model.js";

// ─── Helper: Receipt Number Generate Karo ────────────────────────
function generateReceiptNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `RCP-${timestamp}-${random}`;
}

// ─── Create Fee Record ────────────────────────────────────────────
export const createFee = async (request, response) => {
  try {
    request.body.createdBy = request.userId;
    const fee = await Fee.create(request.body);

    response.status(201).json({
      success: true,
      error: false,
      message: "Fee record created successfully",
      data: fee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({
        success: false,
        error: true,
        message: "Is mahine ki yeh fee already create ho chuki hai",
      });
    }
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Get All Fees Of A Student ────────────────────────────────────
export const getStudentFees = async (request, response) => {
  try {
    const { studentId } = request.params;
    const { status, year } = request.query;

    const filter = { student: studentId, createdBy: request.userId };
    if (status) filter.status = status;
    if (year) filter.year = Number(year);

    const fees = await Fee.find(filter).sort({ year: -1, month: -1 });

    const totalAmount = fees.reduce((sum, f) => sum + f.amount, 0);
    const totalPaid = fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const totalDue = totalAmount - totalPaid;

    response.status(200).json({
      success: true,
      error: false,
      message: "Fees fetched successfully",
      data: fees,
      summary: { totalAmount, totalPaid, totalDue },
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Get Pending Fees ─────────────────────────────────────────────
export const getPendingFees = async (request, response) => {
  try {
    const fees = await Fee.find({
      createdBy: request.userId,
      status: { $in: ["pending", "partial", "overdue"] },
    })
      .populate("student", "firstName lastName rollNumber")
      .sort({ dueDate: 1 });

    response.status(200).json({
      success: true,
      error: false,
      message: "Pending fees fetched successfully",
      data: fees,
      total: fees.length,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Get All Fee Records ──────────────────────────────────────────
export const getAllFees = async (request, response) => {
  try {
    const { status, month, year } = request.query;

    const filter = { createdBy: request.userId };
    if (status) filter.status = status;
    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);

    const fees = await Fee.find(filter)
      .populate("student", "firstName lastName rollNumber class section")  // ← yeh already tha
      .sort({ year: -1, month: -1, dueDate: 1 });

    response.status(200).json({
      success: true,
      error: false,
      message: "All fees fetched successfully",
      data: fees,
      total: fees.length,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Pay Fee ─────────────────────────────────────────────────────
export const payFee = async (request, response) => {
  try {
    const { id } = request.params;
    const { payingAmount, paymentMethod } = request.body;

    const fee = await Fee.findOne({ _id: id, createdBy: request.userId });
    if (!fee) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Fee record not found",
      });
    }

    if (fee.status === "paid") {
      return response.status(400).json({
        success: false,
        error: true,
        message: "Yeh fee already pay ho chuki hai",
      });
    }

    fee.paidAmount += Number(payingAmount);
    fee.paymentMethod = paymentMethod;
    fee.paidDate = new Date();

    if (fee.paidAmount >= fee.amount) {
      fee.status = "paid";
      fee.paidAmount = fee.amount;
      fee.receiptNumber = generateReceiptNumber();
    } else {
      fee.status = "partial";
    }

    await fee.save();

    response.status(200).json({
      success: true,
      error: false,
      message:
        fee.status === "paid"
          ? "Fee fully paid! Receipt generated."
          : "Partial payment recorded",
      data: fee,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Update Fee Record ────────────────────────────────────────────
export const updateFee = async (request, response) => {
  try {
    const updated = await Fee.findOneAndUpdate(
      { _id: request.params.id, createdBy: request.userId },
      request.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Fee record not found",
      });
    }

    response.status(200).json({
      success: true,
      error: false,
      message: "Fee updated successfully",
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

// ─── Delete Fee Record ────────────────────────────────────────────
export const deleteFee = async (request, response) => {
  try {
    const deleted = await Fee.findOneAndDelete({ _id: request.params.id, createdBy: request.userId });

    if (!deleted) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Fee record not found",
      });
    }

    response.status(200).json({
      success: true,
      error: false,
      message: "Fee record deleted successfully",
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