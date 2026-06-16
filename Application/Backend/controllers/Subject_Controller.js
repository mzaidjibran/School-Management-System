import Subject from "../models/Subject_Model.js";

export const getAllSubjects = async (req, res) => {
  try {
    const { classId, status, search } = req.query;
    const filter = {};
    if (classId) filter.class = classId;
    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: "i" };

    const subjects = await Subject.find(filter)
      .populate("class", "name section")
      .populate("teacher", "name")
      .sort({ name: 1 });

    res.json({ success: true, total: subjects.length, subjects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate("class", "name section")
      .populate("teacher", "name");
    if (!subject) return res.status(404).json({ success: false, message: "Subject not found" });
    res.json({ success: true, subject });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addSubject = async (req, res) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();
    res.status(201).json({ success: true, message: "Subject added", subject });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!subject) return res.status(404).json({ success: false, message: "Subject not found" });
    res.json({ success: true, message: "Subject updated", subject });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Subject deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};