const { DataTypes } = require("sequelize");
const Sequelize = require("../db/config/connection");
// This object ADD By eng.reem.shwky@gamil.com
const TeacherQuestionChoose = Sequelize.define(
  "TeacherQuestionChoose",
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
    isCorrectAnswer: {
      type: DataTypes.TINYINT,
      defaultValue: "0",
    },
    
  },
);

module.exports = TeacherQuestionChoose;
