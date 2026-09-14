import { Notification } from "../models/Notification_Model.js";

// Helper function to create a notification programmatically scoped to owner/principal
export const createNotificationHelper = async (title, message, type = "system", createdBy = null) => {
  try {
    const notification = await Notification.create({ title, message, type, createdBy });
    return notification;
  } catch (err) {
    console.error("Error creating notification helper:", err);
  }
};

// Fetch notifications (scoped strictly to logged in principal/owner)
export const getNotifications = async (req, res) => {
  try {
    const ownerId = req.user && req.user.role === "teacher" ? req.user.createdBy : req.userId;
    if (!ownerId) {
      return res.status(200).json({ success: true, data: [] });
    }

    const notifications = await Notification.find({ createdBy: ownerId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Mark all as read (scoped strictly to logged in principal/owner)
export const markAllAsRead = async (req, res) => {
  try {
    const ownerId = req.user && req.user.role === "teacher" ? req.user.createdBy : req.userId;
    if (!ownerId) {
      return res.status(200).json({ success: true, message: "No notifications to mark" });
    }

    await Notification.updateMany({ createdBy: ownerId, read: false }, { read: true });
    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
