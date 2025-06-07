const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const TrainingCategoryType = sequelize.define("TrainingCategoryType", {
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

module.exports = TrainingCategoryType;
