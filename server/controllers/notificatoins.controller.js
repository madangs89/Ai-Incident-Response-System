import Notifications from "../models/Notificatoin.model.js";

export const createNotificationViaApi = async (req, res) => {
  try {
    const user = req.user;
    if (!user._id) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }
    const { logId, message } = req.body;
    if (!logId) {
      return res.status(400).json({
        message: "Log id is required",
        success: false,
      });
    }
    if (!message) {
      return res.status(400).json({
        message: "Message is required",
        success: false,
      });
    }

    const notification = await Notifications.create({
      userId: user._id,
      logId,
      message,
    });

    if (!notification) {
      return res.status(500).json({
        message: "Something went wrong",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Notification created successfully",
      success: true,
      data: notification,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const user = req.user;
    if (!user._id) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }
    const notifications = await Notifications.find({ userId: user._id });
    return res.status(200).json({
      message: "Notifications fetched successfully",
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const user = req.user;
    if (!user._id) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        message: "Notification id is required",
        success: false,
      });
    }
    const notification = await Notifications.findById(id);
    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
        success: false,
      });
    }
    if (notification.userId.toString() !== user._id.toString()) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }
    notification.status = "read";
    await notification.save();
    return res.status(200).json({
      message: "Notification marked as read successfully",
      success: true,
      data: notification,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};
