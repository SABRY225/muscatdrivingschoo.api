const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const CheckoutRequest = sequelize.define("CheckoutRequest", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  value: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

module.exports = CheckoutRequest;
