const { DataTypes } = require("sequelize");
const Sequelize = require("../db/config/connection");
// This object ADD By eng.reem.shwky@gamil.com
const TeacherQuestion = Sequelize.define(
  "TeacherQuestion",
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
    descriptionAr: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    descriptionEn: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: "1",
    },
    
  },
);

module.exports = TeacherQuestion;
