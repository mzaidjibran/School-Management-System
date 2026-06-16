import TeacherLeave from "../models/Teacher_Leave_Model.js";

// ─── Apply Leave ──────────────────────────────────────────────────
export const applyLeave = async (request, response) => {
  try {
    const { fromDate, toDate } = request.body;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const totalDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

    const leave = await TeacherLeave.create({ ...request.body, totalDays });
    response.status(201).json({
      success: true,
      error: false,
      message: "Leave applied successfully",
      data: leave,
    });
  } catch (error) {
    response.status(400).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Get All Leaves ───────────────────────────────────────────────
export const getAllLeaves = async (request, response) => {
  try {
    const { teacherId, status, leaveType } = request.query;
    const query = {};

    if (teacherId)  query.teacherId = teacherId;
    if (status)     query.status = status;
    if (leaveType)  query.leaveType = leaveType;

    const leaves = await TeacherLeave.find(query).populate(
      "teacherId",
      "firstName lastName employeeId"
    );

    response.status(200).json({
      success: true,
      error: false,
      message: "Leave records fetched successfully",
      data: leaves,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Approve / Reject Leave ───────────────────────────────────────
export const updateLeaveStatus = async (request, response) => {
  try {
    const { status, remarks } = request.body;
    const updatedLeave = await TeacherLeave.findByIdAndUpdate(
      request.params.id,
      { status, remarks, approvedBy: request.user._id },
      { new: true, runValidators: true }
    );
    if (!updatedLeave) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Leave record not found",
      });
    }
    response.status(200).json({
      success: true,
      error: false,
      message: `Leave ${status} successfully`,
      data: updatedLeave,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};