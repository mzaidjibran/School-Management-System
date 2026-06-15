import Notice from "../models/Notice.js";

exports.getAllNotices = async (req, res) => {
  try {
    const { status, priority, targetAudience, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (targetAudience) filter.targetAudience = targetAudience;

    const total = await Notice.countDocuments(filter);
    const notices = await Notice.find(filter)
      .populate("createdBy", "name")
      .populate("targetClass", "name section")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ publishDate: -1 });

    res.json({ success: true, total, notices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("createdBy", "name");
    if (!notice) return res.status(404).json({ success: false, message: "Notice not found" });
    res.json({ success: true, notice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createNotice = async (req, res) => {
  try {
    const notice = new Notice({ ...req.body, createdBy: req.user._id });
    await notice.save();
    res.status(201).json({ success: true, message: "Notice created", notice });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!notice) return res.status(404).json({ success: false, message: "Notice not found" });
    res.json({ success: true, message: "Notice updated", notice });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteNotice = async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Notice deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getActiveNotices = async (req, res) => {
  try {
    const now = new Date();
    const notices = await Notice.find({
      status: "published",
      publishDate: { $lte: now },
      $or: [{ expiryDate: { $gte: now } }, { expiryDate: null }],
    }).sort({ priority: 1, publishDate: -1 }).limit(10);
    res.json({ success: true, notices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};