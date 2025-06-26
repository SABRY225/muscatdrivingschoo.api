const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const ChatMessage = sequelize.define("ChatMessage", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    message: {
        type: DataTypes.STRING,
        allowNull: true, // السماح بأن تكون الرسالة فارغة في حالة إرسال ملف
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: true, // السماح بأن يكون فارغًا في حالة عدم وجود ملف
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    seen: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,  // الرسالة غير مقروءة عند الإرسال
    },
    isNotified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // أول ما تتسجل الرسالة تكون مش متبلغ عنها
    },
}, {
    timestamps: true,
});

module.exports = ChatMessage;
