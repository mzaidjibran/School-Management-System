import { Attendance } from "../models/Attendence_Model.js";

// ─── Mark Attendance ──────────────────────────────────────────────
// Ek ya multiple students ki hazri ek saath mark karo
export const markAttendance = async (request, response) => {
  try {
    const { records } = request.body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "Records array is mandatory",
      });
    }

    // Ek ek karke save karo
    const inserted = [];
    for (const rec of records) {
      try {
        const { Attendance } = await import("../models/Attendence_Model.js");
        const doc = await Attendance.create(rec);
        inserted.push(doc);
      } catch (e) {
        console.log("Skip:", e.message);
      }
    }

    response.status(201).json({
      success: true,
      error: false,
      message: `${inserted.length} records marked successfully`,
      data: inserted,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Get Attendance By Class and Date ────────────────────────────
// Ek class ki ek din ki poori hazri
export const getAttendanceByClassAndDate = async (request, response) => {
  try {
    const { classId, date } = request.query;

    if (!classId || !date) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "classId and date are mandatory",
      });
    }

    // Date ka start aur end banao (poora din)
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const records = await Attendance.find({
      class: classId,
      date: { $gte: start, $lte: end },
    }).populate("student", "firstName lastName rollNumber profileImage");

    response.status(200).json({
      success: true,
      error: false,
      message: "Attendance fetched successfully",
      data: records,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Get Attendance By Student ────────────────────────────────────
// Ek student ki poori attendance history
export const getAttendanceByStudent = async (request, response) => {
  try {
    const { studentId } = request.params;
    const { month, year } = request.query;

    const filter = { student: studentId };

    // Agar month aur year diya ho to filter karo
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(filter)
      .populate("class", "name section")
      .sort({ date: -1 });

    // Summary bhi calculate karo
    const summary = {
      total: records.length,
      present: records.filter((r) => r.status === "present").length,
      absent: records.filter((r) => r.status === "absent").length,
      late: records.filter((r) => r.status === "late").length,
      leave: records.filter((r) => r.status === "leave").length,
    };

    response.status(200).json({
      success: true,
      error: false,
      message: "Attendance fetched successfully",
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

// ─── Update Attendance ────────────────────────────────────────────
// Galti se wrong status mark ho gayi to update karo
export const updateAttendance = async (request, response) => {
  try {
    const updated = await Attendance.findByIdAndUpdate(
      request.params.id,
      request.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Attendance record not found",
      });
    }

    response.status(200).json({
      success: true,
      error: false,
      message: "Attendance updated successfully",
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