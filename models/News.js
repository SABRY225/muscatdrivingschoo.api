const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const News = sequelize.define("News", {
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
  descriptionAR: {
    type: DataTypes.TEXT,
    defaultValue: "",
  },
  descriptionEN: {
    type: DataTypes.TEXT,
    defaultValue: "",
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
});

module.exports = News;
