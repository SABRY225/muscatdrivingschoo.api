const { DataTypes } = require("sequelize");
const Sequelize = require("../db/config/connection");

const TeacherLevel = Sequelize.define("TeacherLevel", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  }
});

module.exports = TeacherLevel;
