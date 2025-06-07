const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const DrivingLicenses = sequelize.define("DrivingLicenses", {
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
  country: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  requirementsAR: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  requirementsEN: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  image: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
});

module.exports = DrivingLicenses;
