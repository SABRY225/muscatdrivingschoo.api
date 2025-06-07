const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const Subject = sequelize.define("Subject", {
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
  }
});

module.exports = Subject;