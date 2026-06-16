import TimeTable from "../models/TimeTable_model.js";

export const createOrUpdateTimetable = async (req, res) => {
  try {
    const { class: classId, day, session } = req.body;
    const timetable = await Timetable.findOneAndUpdate(
      { class: classId, day, session },
      { ...req.body, createdBy: req.user._id },
      { upsert: true, new: true, runValidators: true }
    );
    res.status(201).json({ success: true, message: "Timetable saved", timetable });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getClassTimetable = async (req, res) => {
  try {
    const { classId } = req.params;
    const { session } = req.query;
    const filter = { class: classId, isActive: true };
    if (session) filter.session = session;

    const timetable = await Timetable.find(filter)
      .populate("class", "name section")
      .populate("periods.teacher", "name")
      .sort({ day: 1 });

    // Order days properly
    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    timetable.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));

    res.json({ success: true, timetable });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTodayTimetable = async (req, res) => {
  try {
    const { classId } = req.params;
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = days[new Date().getDay()];
    const { session } = req.query;

    const filter = { class: classId, day: today, isActive: true };
    if (session) filter.session = session;

    const timetable = await Timetable.findOne(filter)
      .populate("periods.teacher", "name");

    if (!timetable) return res.json({ success: true, day: today, periods: [] });

    // Find current and next period
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const periods = timetable.periods.sort((a, b) => a.startTime.localeCompare(b.startTime));
    const currentPeriod = periods.find((p) => p.startTime <= currentTime && p.endTime > currentTime);
    const nextPeriod = periods.find((p) => p.startTime > currentTime);

    res.json({ success: true, day: today, timetable, currentPeriod, nextPeriod });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTeacherTimetable = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { session } = req.query;
    const filter = { "periods.teacher": teacherId, isActive: true };
    if (session) filter.session = session;

    const timetables = await Timetable.find(filter)
      .populate("class", "name section");

    res.json({ success: true, timetables });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTimetable = async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Timetable deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};