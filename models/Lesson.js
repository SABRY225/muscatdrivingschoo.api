const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const Lessons = sequelize.define("Lessons", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sessionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: true
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved','paid','canceled'),
    defaultValue: 'pending',
  },
  paymentLink: {
    type: DataTypes.STRING,
    defaultValue: true
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  place:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  typeLesson:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  period: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
    timestamps: true,
  });

module.exports = Lessons;
