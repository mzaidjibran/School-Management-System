import {Exam,Results}from "../models/Exam.js";

// ─── EXAMS ────────────────────────────────────────────────────────────────────

exports.getAllExams = async (req, res) => {
  try {
    const { classId, status, examType, session, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (classId) filter.class = classId;
    if (status) filter.status = status;
    if (examType) filter.examType = examType;
    if (session) filter.session = session;

    const total = await Exam.countDocuments(filter);
    const exams = await Exam.find(filter)
      .populate("class", "name section")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ examDate: -1 });

    res.json({ success: true, total, exams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate("class", "name section");
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });
    res.json({ success: true, exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createExam = async (req, res) => {
  try {
    const exam = new Exam({ ...req.body, createdBy: req.user._id });
    await exam.save();
    res.status(201).json({ success: true, message: "Exam created", exam });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });
    res.json({ success: true, message: "Exam updated", exam });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    await Result.deleteMany({ exam: req.params.id });
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Exam and its results deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── MARKS / RESULTS ─────────────────────────────────────────────────────────

exports.enterMarks = async (req, res) => {
  try {
    const { examId } = req.params;
    const { results } = req.body; // [{ student, obtainedMarks, remarks }]
    const saved = [];
    for (const r of results) {
      const result = await Result.findOneAndUpdate(
        { exam: examId, student: r.student },
        { ...r, exam: examId, enteredBy: req.user._id },
        { upsert: true, new: true, runValidators: true }
      );
      saved.push(result);
    }
    res.status(201).json({ success: true, message: "Marks entered", results: saved });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getExamResults = async (req, res) => {
  try {
    const results = await Result.find({ exam: req.params.examId })
      .populate("student", "name rollNumber");

    const summary = {
      total: results.length,
      passed: results.filter((r) => r.status === "pass").length,
      failed: results.filter((r) => r.status === "fail").length,
      highest: results.length ? Math.max(...results.map((r) => r.obtainedMarks)) : 0,
      lowest: results.length ? Math.min(...results.map((r) => r.obtainedMarks)) : 0,
      average: results.length
        ? (results.reduce((s, r) => s + r.obtainedMarks, 0) / results.length).toFixed(2)
        : 0,
    };

    res.json({ success: true, summary, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudentResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.params.studentId })
      .populate("exam", "name examType examDate totalMarks passingMarks subject class");
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getResultReport = async (req, res) => {
  try {
    const { classId, examType, session } = req.query;
    const examFilter = {};
    if (classId) examFilter.class = classId;
    if (examType) examFilter.examType = examType;
    if (session) examFilter.session = session;

    const exams = await Exam.find(examFilter, "_id name subject");
    const examIds = exams.map((e) => e._id);
    const results = await Result.find({ exam: { $in: examIds } })
      .populate("student", "name rollNumber")
      .populate("exam", "name subject totalMarks");

    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};