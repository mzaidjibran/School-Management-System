import { Attendance } from "../models/Attendence_Model.js";
import { Student } from "../models/Student_Model.js";
import { Class } from "../models/Class_Model.js";

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
        // Validate student ownership
        const ownerId = request.user && request.user.role === "teacher" ? request.user.createdBy : request.userId;
        const studentExists = await Student.findOne({ _id: rec.student, createdBy: ownerId });
        if (!studentExists) continue;

        if (request.headers["x-branch-id"]) rec.branch = request.headers["x-branch-id"];
        if (request.headers["x-section"]) rec.schoolSection = request.headers["x-section"];

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
    const { classId, date, section } = request.query;

    if (!classId || !date) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "classId and date are mandatory",
      });
    }

    const ownerId = request.user && request.user.role === "teacher" ? request.user.createdBy : request.userId;
    const classExists = await Class.findOne({ _id: classId, createdBy: ownerId });
    if (!classExists) {
      return response.status(403).json({
        success: false,
        error: true,
        message: "Aapko is class ki access nahi hai",
      });
    }

    // Date ka start aur end banao (poora din)
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const query = {
      class: classId,
      date: { $gte: start, $lte: end },
    };
    if (request.user && request.user.role === "teacher") {
      query.schoolSection = request.user.gender === "female" ? "girls" : "boys";
    } else {
      if (section) {
        query.schoolSection = section;
      } else if (request.headers["x-section"]) {
        query.schoolSection = request.headers["x-section"];
      }
    }
    if (request.headers["x-branch-id"]) {
      query.branch = request.headers["x-branch-id"];
    }

    const records = await Attendance.find(query).populate("student", "firstName lastName rollNumber profileImage");

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

    const ownerId = request.user && request.user.role === "teacher" ? request.user.createdBy : request.userId;
    const studentExists = await Student.findOne({ _id: studentId, createdBy: ownerId });
    if (!studentExists) {
      return response.status(403).json({
        success: false,
        error: true,
        message: "Aapko is student ki access nahi hai",
      });
    }

    const filter = { student: studentId };
    if (request.headers["x-branch-id"]) filter.branch = request.headers["x-branch-id"];
    if (request.headers["x-section"]) filter.schoolSection = request.headers["x-section"];

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
    const record = await Attendance.findById(request.params.id);
    if (!record) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Attendance record not found",
      });
    }

    const ownerId = request.user && request.user.role === "teacher" ? request.user.createdBy : request.userId;
    const studentExists = await Student.findOne({ _id: record.student, createdBy: ownerId });
    if (!studentExists) {
      return response.status(403).json({
        success: false,
        error: true,
        message: "Aapko is record ki access nahi hai",
      });
    }

    const updated = await Attendance.findByIdAndUpdate(
      request.params.id,
      request.body,
      { new: true, runValidators: true }
    );

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

// ─── Get Today's Attendance Summary (Dashboard ke liye) ───────────
export const getTodayAttendanceSummary = async (request, response) => {
  try {
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    const ownerId = request.user && request.user.role === "teacher" ? request.user.createdBy : request.userId;
    const studentQuery = { createdBy: ownerId };
    if (request.headers["x-branch-id"]) studentQuery.branch = request.headers["x-branch-id"];
    
    if (request.user && request.user.role === "teacher") {
      studentQuery.schoolSection = request.user.gender === "female" ? "girls" : "boys";
    } else if (request.headers["x-section"]) {
      studentQuery.schoolSection = request.headers["x-section"];
    }

    const studentIds = await Student.find(studentQuery).distinct("_id");
    
    const attendanceQuery = {
      student: { $in: studentIds },
      date: { $gte: start, $lte: end },
    };
    if (request.headers["x-branch-id"]) attendanceQuery.branch = request.headers["x-branch-id"];
    
    if (request.user && request.user.role === "teacher") {
      attendanceQuery.schoolSection = request.user.gender === "female" ? "girls" : "boys";
    } else if (request.headers["x-section"]) {
      attendanceQuery.schoolSection = request.headers["x-section"];
    }

    let records = await Attendance.find(attendanceQuery);
    let summaryDate = today;

    // Fallback: If no records for today, fetch the most recent day's records
    if (records.length === 0) {
      const searchCriteria = { student: { $in: studentIds } };
      if (request.headers["x-branch-id"]) searchCriteria.branch = request.headers["x-branch-id"];
      
      if (request.user && request.user.role === "teacher") {
        searchCriteria.schoolSection = request.user.gender === "female" ? "girls" : "boys";
      } else if (request.headers["x-section"]) {
        searchCriteria.schoolSection = request.headers["x-section"];
      }

      const latestRecord = await Attendance.findOne(searchCriteria).sort({ date: -1 });

      if (latestRecord) {
        summaryDate = latestRecord.date;
        const startLatest = new Date(summaryDate);
        startLatest.setHours(0, 0, 0, 0);
        const endLatest = new Date(summaryDate);
        endLatest.setHours(23, 59, 59, 999);

        attendanceQuery.date = { $gte: startLatest, $lte: endLatest };
        records = await Attendance.find(attendanceQuery);
      }
    }

    const summary = {
      total:   records.length,
      present: records.filter((r) => r.status === "present").length,
      absent:  records.filter((r) => r.status === "absent").length,
      late:    records.filter((r) => r.status === "late").length,
      leave:   records.filter((r) => r.status === "leave").length,
      date:    summaryDate
    };

    response.status(200).json({
      success: true,
      error: false,
      data: summary,
    });
  } catch (error) {
    response.status(500).json({ success: false, error: true, message: error.message });
  }
};