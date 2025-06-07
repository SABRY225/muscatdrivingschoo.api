const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const Class = sequelize.define("Class", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  titleAR: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  titleEN: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Class;