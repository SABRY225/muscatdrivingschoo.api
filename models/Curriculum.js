const { DataTypes } = require("sequelize");
const Sequelize = require("../db/config/connection");

const Curriculum = Sequelize.define("Curriculum", {
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
  }
});

module.exports = Curriculum;
