import TeacherAttendance from "../models/Teacher_Attendence_Model.js";

// ─── Mark Attendance ──────────────────────────────────────────────
export const markAttendance = async (request, response) => {
  try {
    const attendance = await TeacherAttendance.create(request.body); 
    response.status(201).json({
      success: true,
      error: false,
      message: "Attendance marked successfully",
      data: attendance,
    });
  } catch (error) {
    // Duplicate attendance (same teacher + same date)
    if (error.code === 11000) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "Attendance already marked for this date",
      });
    }
    response.status(400).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Get Attendance (monthly filter) ─────────────────────────────
export const getAttendance = async (request, response) => {
  try {
    const { teacherId, month, year } = request.query;
    const query = {};

    if (teacherId) query.teacherId = teacherId;

    // Month + Year filter
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: start, $lte: end };
    }

    const records = await TeacherAttendance.find(query).populate(
      "teacherId",
      "firstName lastName employeeId"
    );

    // Summary
    const summary = {
      present:  records.filter((r) => r.status === "present").length,
      absent:   records.filter((r) => r.status === "absent").length,
      late:     records.filter((r) => r.status === "late").length,
      half_day: records.filter((r) => r.status === "half_day").length,
      on_leave: records.filter((r) => r.status === "on_leave").length,
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
export const updateAttendance = async (request, response) => {
  try {
    const updatedRecord = await TeacherAttendance.findByIdAndUpdate(
      request.params.id,
      request.body,
      { new: true, runValidators: true }
    );
    if (!updatedRecord) {
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
      data: updatedRecord,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};