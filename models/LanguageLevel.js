const { DataTypes } = require("sequelize");
const Sequelize = require("../db/config/connection");

const LanguageLevel = Sequelize.define("LanguageLevel", {
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
});

module.exports = LanguageLevel;
