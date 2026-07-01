import { Exam, Result } from "../models/Exam_Model.js";
import mongoose from "mongoose";

// ─── EXAMS ────────────────────────────────────────────────────────────────────

export const getAllExams = async (req, res) => {
  try {
    const { classId, status, examType, session, page = 1, limit = 20 } = req.query;
    const filter = { createdBy: req.userId };
    if (classId)   filter.class    = classId;
    if (status)    filter.status   = status;
    if (examType)  filter.examType = examType;
    if (session)   filter.session  = session;

    const total = await Exam.countDocuments(filter);
    const exams = await Exam.find(filter)
      .populate("class", "name section")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ examDate: -1 });

    res.json({ success: true, error: false, message: "Exams fetched", total, data: exams });
  } catch (err) {
    res.status(500).json({ success: false, error: true, message: err.message });
  }
};

export const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, createdBy: req.userId }).populate("class", "name section");
    if (!exam) return res.status(404).json({ success: false, error: true, message: "Exam not found" });
    res.json({ success: true, error: false, message: "Exam fetched", data: exam });
  } catch (err) {
    res.status(500).json({ success: false, error: true, message: err.message });
  }
};

export const createExam = async (req, res) => {
  try {
    const examData = { ...req.body };
    examData.createdBy = req.userId;

    const exam = new Exam(examData);
    await exam.save();
    const populated = await Exam.findOne({ _id: exam._id, createdBy: req.userId }).populate("class", "name section");
    res.status(201).json({ success: true, error: false, message: "Exam created", data: populated });
  } catch (err) {
    res.status(400).json({ success: false, error: true, message: err.message });
  }
};

export const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndUpdate({ _id: req.params.id, createdBy: req.userId }, req.body, {
      new: true, runValidators: true,
    }).populate("class", "name section");
    if (!exam) return res.status(404).json({ success: false, error: true, message: "Exam not found" });
    res.json({ success: true, error: false, message: "Exam updated", data: exam });
  } catch (err) {
    res.status(400).json({ success: false, error: true, message: err.message });
  }
};

export const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, createdBy: req.userId });
    if (!exam) return res.status(404).json({ success: false, error: true, message: "Exam not found" });

    await Result.deleteMany({ exam: req.params.id });
    await Exam.deleteOne({ _id: req.params.id });
    res.json({ success: true, error: false, message: "Exam and its results deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: true, message: err.message });
  }
};

// ─── MARKS / RESULTS ─────────────────────────────────────────────────────────

// Helper: percentage se grade calculate karta hai
const calculateGrade = (percentage) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
};

export const enterMarks = async (req, res) => {
  try {
    const { examId } = req.params;
    const { results } = req.body;

    if (!results || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ success: false, error: true, message: "Results array is mandatory" });
    }

    const exam = await Exam.findOne({ _id: examId, createdBy: req.userId });
    if (!exam) {
      return res.status(404).json({ success: false, error: true, message: "Exam not found" });
    }

    const saved = [];
    for (const r of results) {
      const obtainedMarks = Number(r.obtainedMarks);
      const percentage = (obtainedMarks / exam.totalMarks) * 100;

      const updateData = {
        ...r,
        obtainedMarks,
        exam: examId,
        status: obtainedMarks >= exam.passingMarks ? "pass" : "fail",
        grade: calculateGrade(percentage),
        enteredBy: req.userId,
      };

      const result = await Result.findOneAndUpdate(
        { exam: examId, student: r.student },
        updateData,
        { upsert: true, new: true, runValidators: true }
      );
      saved.push(result);
    }
    res.status(201).json({ success: true, error: false, message: "Marks entered", data: saved });
  } catch (err) {
    res.status(400).json({ success: false, error: true, message: err.message });
  }
};

export const getExamResults = async (req, res) => {
  try {
    const examExists = await Exam.findOne({ _id: req.params.examId, createdBy: req.userId });
    if (!examExists) {
      return res.status(403).json({ success: false, error: true, message: "Aapko is exam ki access nahi hai" });
    }

    const results = await Result.find({ exam: req.params.examId })
      .populate("student", "firstName lastName rollNumber");

    const summary = {
      total:   results.length,
      passed:  results.filter((r) => r.status === "pass").length,
      failed:  results.filter((r) => r.status === "fail").length,
      highest: results.length ? Math.max(...results.map((r) => r.obtainedMarks)) : 0,
      lowest:  results.length ? Math.min(...results.map((r) => r.obtainedMarks)) : 0,
      average: results.length
        ? (results.reduce((s, r) => s + r.obtainedMarks, 0) / results.length).toFixed(2)
        : 0,
    };

    res.json({ success: true, error: false, message: "Results fetched", summary, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: true, message: err.message });
  }
};

export const getStudentResults = async (req, res) => {
  try {
    const student = await mongoose.model("Student").findOne({ _id: req.params.studentId, createdBy: req.userId });
    if (!student) {
      return res.status(403).json({ success: false, error: true, message: "Aapko is student ki access nahi hai" });
    }

    const results = await Result.find({ student: req.params.studentId })
      .populate("exam", "name examType examDate totalMarks passingMarks subject class");
    res.json({ success: true, error: false, message: "Student results fetched", data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: true, message: err.message });
  }
};

export const getResultReport = async (req, res) => {
  try {
    const { classId, examType, session } = req.query;
    const examFilter = { createdBy: req.userId };
    if (classId)  examFilter.class    = classId;
    if (examType) examFilter.examType = examType;
    if (session)  examFilter.session  = session;

    const exams   = await Exam.find(examFilter, "_id name subject");
    const examIds = exams.map((e) => e._id);
    const results = await Result.find({ exam: { $in: examIds } })
      .populate("student", "firstName lastName rollNumber")
      .populate("exam", "name subject totalMarks passingMarks");

    res.json({ success: true, error: false, message: "Report fetched", data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: true, message: err.message });
  }
};