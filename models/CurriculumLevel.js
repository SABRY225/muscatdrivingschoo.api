const { DataTypes } = require("sequelize");
const Sequelize = require("../db/config/connection");

const CurriculumLevel = Sequelize.define("CurriculumLevel", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  }
});

module.exports = CurriculumLevel;
