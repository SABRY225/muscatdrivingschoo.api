const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const Admin = sequelize.define("Admin", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  whatsappPhone: {
    type: DataTypes.STRING,
  },
  profitRatio: {
    type: DataTypes.INTEGER,
    defaultValue:20,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type        : DataTypes.STRING,
    defaultValue: "admin",        // admin or accountant
  },
  // ADD By eng.reem.shwk@gmail.com
  isnotify :{
    type : DataTypes.BOOLEAN,
    defaultValue : false,
  }
});

module.exports = Admin;
