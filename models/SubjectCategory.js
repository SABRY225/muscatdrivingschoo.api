const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const SubjectCategory = sequelize.define("SubjectCategory", {
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
  image: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
});

module.exports = SubjectCategory;
