const { DataTypes } = require("sequelize");
const Sequelize = require("../db/config/connection");

const StudentPackage = Sequelize.define("StudentPackage", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: "1",
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: "Booking Package",
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
    defaultValue: "Booking Package",
  },
});

module.exports = StudentPackage;
