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
  method: {
    type: DataTypes.ENUM("phone", "bank"),
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true, // فقط عند method = "phone"
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: true, // فقط عند method = "bank"
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  iban: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = CheckoutRequest;
