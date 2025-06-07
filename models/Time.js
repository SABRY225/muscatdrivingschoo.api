const { DataTypes } = require("sequelize");
const Sequelize = require("../db/config/connection");

const Time = Sequelize.define("Time", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  from: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  to: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Time;
