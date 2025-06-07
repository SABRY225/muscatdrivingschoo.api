const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const Rate = sequelize.define("Rate", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
});

module.exports = Rate;