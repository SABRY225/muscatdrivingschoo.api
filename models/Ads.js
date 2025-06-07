const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const Ads = sequelize.define("Ads", {
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
  link: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  advertiserPhone : {
    type: DataTypes.TEXT,
    defaultValue: "",
  },
  advertiserAddress : {
    type: DataTypes.TEXT,
    defaultValue: "",
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  carModel : {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  yearManufacture :{
    type: DataTypes.STRING,
    defaultValue: "",
  },
  carPrice :{
    type: DataTypes.STRING,
    defaultValue: "0",
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: "OMR",
    allowNull: false,
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: "1",
  },
});

module.exports = Ads;
