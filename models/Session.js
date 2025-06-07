const { DataTypes } = require("sequelize");
const Sequelize = require("../db/config/connection");

const Session = Sequelize.define("Session", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  period: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
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
  totalPrice: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  sessionId: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  teacherAccept: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  studentAccept: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  startedAt: {
    type: DataTypes.CHAR,
    defaultValue: null,
    // allowNull: true,
  },
  endedAt: {
    type: DataTypes.CHAR,
    defaultValue: null,
    // allowNull: true,
  },
});

module.exports = Session;
