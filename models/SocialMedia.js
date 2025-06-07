const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const SocialMedia = sequelize.define("SocialMedia", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  link: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = SocialMedia;
