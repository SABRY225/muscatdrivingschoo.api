const { DataTypes } = require("sequelize");
const Sequelize = require("../db/config/connection");

//Developer by eng.reem.shwky@gmail.com
const Package = Sequelize.define(
  "Package",
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
      allowNull: false,
    },
    descriptionAr: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    descriptionEn: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    image: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: "1",
    },
    duration: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    price: {
      type: DataTypes.STRING,
      defaultValue: "0",
    },
    numTotalLesson: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    numWeekLesson: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    gender: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    startDate: {
      type: DataTypes.STRING,
      defaultValue: false,
    },
    endDate: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    time: {
      type: DataTypes.STRING,
      defaultValue: "",
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
      linkPackage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  docs: {
    type: DataTypes.STRING,
    allowNull: true,
  },
    currency: {
      type: DataTypes.STRING,
      defaultValue: "OMR",
      allowNull: false,
    },
  } 
);

module.exports = Package;
