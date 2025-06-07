const { DataTypes } = require("sequelize");
const Sequelize = require("../db/config/connection");

const TeacherTypes = Sequelize.define("TeacherTypes", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  }
});

module.exports = TeacherTypes;
