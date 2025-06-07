const { DataTypes } = require("sequelize");
const Sequelize = require("../db/config/connection");

const StudentLecture = Sequelize.define("StudentLecture", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: "Booking Lecture",
  },
  typeOfPayment: {
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
  sessionId: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Booking Lecture",
  },
});

module.exports = StudentLecture;
