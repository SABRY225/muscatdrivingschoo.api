const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const Statistics = sequelize.define("Statistics", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  teachers: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  students: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lessons: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lectures: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
    timestamps: true,
  });

module.exports = Statistics;
