const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const ExchangeRequestsStudent = sequelize.define("ExchangeRequestsStudent", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  
  amount: {
    type: DataTypes.STRING,
    defaultValue: "0",
  },

  currency: {
    type: DataTypes.STRING,
    defaultValue: "OMR",
    allowNull: false,
  },

  reason: {
    type: DataTypes.STRING,
    defaultValue: "no-set",
    allowNull: false,
  },

  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
});

module.exports = ExchangeRequestsStudent;
