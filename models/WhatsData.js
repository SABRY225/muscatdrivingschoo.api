const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const WhatsData = sequelize.define("WhatsData", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = WhatsData;
