const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const AdsImages = sequelize.define("AdsImages", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
});

module.exports = AdsImages;
