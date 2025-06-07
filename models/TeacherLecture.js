const { DataTypes } = require("sequelize");
const Sequelize = require("../db/config/connection");
// This object ADD By eng.reem.shwky@gamil.com
const TeacherLecture = Sequelize.define(
  "TeacherLecture",
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
    locationAr: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    locationEn: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },

    price: {
      type: DataTypes.STRING,
      defaultValue: "0",
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: "OMR",
      allowNull: false,
    },
  curriculums: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  class: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  semester: {
    type: DataTypes.STRING,
    allowNull: false,
  },
    subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  linkLecture: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  docs: {
    type: DataTypes.STRING,
    allowNull: true,
  },
    image: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: "1",
    },
    
  },
);

module.exports = TeacherLecture;
