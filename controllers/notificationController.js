const Notification = require("../models/Notification");

// جلب كل التنبيهات وعدد الغير مقروء
const getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isRead } = req.query; // فلترة حسب حالة القراءة (اختياري)

        let whereClause = { userId };

        if (isRead !== undefined) {
            whereClause.isRead = isRead === "true"; // تحويل `isRead` لبوليان
        }

        const notifications = await Notification.findAll({
            where: whereClause,
            order: [["createdAt", "DESC"]],
        });

        // حساب عدد التنبيهات الغير مقروءة
        const unreadCount = await Notification.count({
            where: {
                userId,
                isRead: false,
            },
        });

        res.status(200).json({
            status: 200,
            message: "Notifications fetched successfully",
            data: {
                notifications,
                unreadCount,
            },
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

const getNotificationsUnreadCount = async (req, res) => {
    try {
        const { userId } = req.params;

        let whereClause = { userId };

        const notifications = await Notification.findAll({
            where: whereClause,
            order: [["createdAt", "DESC"]],
        });

        // حساب عدد التنبيهات الغير مقروءة
        const unreadCount = await Notification.count({
            where: {
                userId,
                isRead: false,
            },
        });

        res.status(200).json({
            status: 200,
            unreadCount,
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
// قراءة تنبية (تحديث isRead = true)
const readNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findByPk(notificationId);
        if (!notification) {
            return res.status(404).json({
                status: 404,
                message: "Notification not found",
            });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({
            status: 200,
            message: "Notification marked as read",
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

// حذف تنبية
const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findByPk(notificationId);
        if (!notification) {
            return res.status(404).json({
                status: 404,
                message: "Notification not found",
            });
        }

        await notification.destroy();

        res.status(200).json({
            status: 200,
            message: "Notification deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

module.exports = {
    getNotifications,
    readNotification,
    deleteNotification,
    getNotificationsUnreadCount
};
