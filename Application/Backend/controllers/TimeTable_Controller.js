import TimeTable from "../models/TimeTable_model.js";

// ─── Create or Update Timetable (upsert per class+day+session) ───
export const createOrUpdateTimetable = async (req, res) => {
  try {
    const { class: classId, day, session } = req.body;
    req.body.createdBy = req.userId;
    if (req.headers["x-branch-id"]) req.body.branch = req.headers["x-branch-id"];
    if (req.headers["x-section"]) req.body.schoolSection = req.headers["x-section"];

    const query = { class: classId, day, session, createdBy: req.userId };
    if (req.headers["x-branch-id"]) query.branch = req.headers["x-branch-id"];
    if (req.headers["x-section"]) query.schoolSection = req.headers["x-section"];

    const timetable = await TimeTable.findOneAndUpdate(
      query,
      { ...req.body },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      message: "Timetable saved",
      timetable,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── Get All Timetable Entries For A Class ────────────────────────
export const getClassTimetable = async (req, res) => {
  try {
    const { classId } = req.params;
    const { session } = req.query;

    const filter = { class: classId, isActive: true, createdBy: req.userId };
    if (session) filter.session = session;
    if (req.headers["x-branch-id"]) filter.branch = req.headers["x-branch-id"];
    if (req.headers["x-section"]) filter.schoolSection = req.headers["x-section"];

    const timetable = await TimeTable.find(filter)
      .populate("class", "name section")
      .populate("periods.teacher", "name")
      .sort({ day: 1 });

    // Sort by proper day order
    const dayOrder = [
      "Monday", "Tuesday", "Wednesday",
      "Thursday", "Friday", "Saturday",
    ];
    timetable.sort(
      (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
    );

    res.json({ success: true, timetable });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get Today's Timetable For A Class ────────────────────────────
export const getTodayTimetable = async (req, res) => {
  try {
    const { classId } = req.params;
    const days = [
      "Sunday", "Monday", "Tuesday",
      "Wednesday", "Thursday", "Friday", "Saturday",
    ];
    const today = days[new Date().getDay()];
    const { session } = req.query;

    const filter = { class: classId, day: today, isActive: true, createdBy: req.userId };
    if (session) filter.session = session;
    if (req.headers["x-branch-id"]) filter.branch = req.headers["x-branch-id"];
    if (req.headers["x-section"]) filter.schoolSection = req.headers["x-section"];

    const timetable = await TimeTable.findOne(filter).populate(
      "periods.teacher",
      "name"
    );

    if (!timetable) {
      return res.json({ success: true, day: today, periods: [] });
    }

    // Find current and next period
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const periods = timetable.periods.sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
    const currentPeriod = periods.find(
      (p) => p.startTime <= currentTime && p.endTime > currentTime
    );
    const nextPeriod = periods.find((p) => p.startTime > currentTime);

    res.json({
      success: true,
      day: today,
      timetable,
      currentPeriod,
      nextPeriod,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get Timetable For A Specific Teacher ────────────────────────
export const getTeacherTimetable = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { session } = req.query;

    const filter = { "periods.teacher": teacherId, isActive: true, createdBy: req.userId };
    if (session) filter.session = session;
    if (req.headers["x-branch-id"]) filter.branch = req.headers["x-branch-id"];
    if (req.headers["x-section"]) filter.schoolSection = req.headers["x-section"];

    const timetables = await TimeTable.find(filter).populate(
      "class",
      "name section"
    );

    res.json({ success: true, timetables });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Delete A Timetable Entry By ID ──────────────────────────────
export const deleteTimetable = async (req, res) => {
  try {
    const query = { _id: req.params.id, createdBy: req.userId };
    if (req.headers["x-branch-id"]) query.branch = req.headers["x-branch-id"];
    if (req.headers["x-section"]) query.schoolSection = req.headers["x-section"];

    const deleted = await TimeTable.findOneAndDelete(query);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Timetable not found" });
    }
    res.json({ success: true, message: "Timetable deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};