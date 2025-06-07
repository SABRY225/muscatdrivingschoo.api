const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const TeacherSubject = sequelize.define("TeacherSubject", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = TeacherSubject;