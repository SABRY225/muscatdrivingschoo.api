const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const TeacherRefund = sequelize.define("TeacherRefund", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  reasonAR: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reasonEN: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  amount: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "0",
  },
  
  currency: {
    type: DataTypes.STRING,
    defaultValue: "OMR",
    allowNull: false,
  },

  previousWallet : {
    type: DataTypes.STRING,
    defaultValue: "0",
  },

  nowWallet : {
    type: DataTypes.STRING,
    defaultValue: "0",
  }
});

module.exports = TeacherRefund;
