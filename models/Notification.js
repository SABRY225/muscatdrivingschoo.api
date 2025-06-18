const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const Notification = sequelize.define("Notification", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userType: {
        type: DataTypes.ENUM('teacher', 'student', 'admin'),
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('lesson_booking',
                             'lesson_canceled_request',
                             'lesson_approved_request',
                             'payment_success',
                             'complaint',
                             'chat_message',
                             'lesson_start',
                             'lesson_accept',
                             'lesson_end',
                             'register_student',
                             'register_teacher',
                             'package_booking',
                             'lecture_booking',
                             'test_booking',
                             'dicount_booking',
                             'resource_booking',
                             'charge_success',
                            ),
        allowNull: false,
    },
    messageAr: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    messageEn: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
});

module.exports = Notification;
