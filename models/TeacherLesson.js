const { DataTypes } = require("sequelize");
const Sequelize = require("../db/config/connection");
// This object ADD By eng.reem.shwky@gamil.com
const TeacherLesson = Sequelize.define(
  "TeacherLesson",
  {
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
      defaultValue: "",
    },
    videoLink: {
      type: DataTypes.STRING,
      defaultValue: "",
    }
    
  },
);

module.exports = TeacherLesson;
