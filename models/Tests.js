const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const Tests = sequelize.define("Tests", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
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
  linkExam: {
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
    price: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: "OMR",
    allowNull: false,
  },
  status : {
    type: DataTypes.TINYINT,
    defaultValue: "1",
  }
});

module.exports = Tests;
