const { DataTypes } = require("sequelize");
const Sequelize = require("../db/config/connection");

const TeacherLimits = Sequelize.define("TeacherLimits", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  }
});

module.exports = TeacherLimits;
