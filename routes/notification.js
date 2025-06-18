const express = require("express");
const { getNotifications, readNotification, deleteNotification, getNotificationsUnreadCount } = require("../controllers/notificationController");

const notificationRouter = express.Router();

notificationRouter.get("/:userId", getNotifications);
notificationRouter.get("/unread-count/:userId", getNotificationsUnreadCount);
// قراءة تنبية
notificationRouter.put("/read/:notificationId", readNotification);
// حذف تنبية
notificationRouter.delete("/:notificationId", deleteNotification);
module.exports = notificationRouter;
