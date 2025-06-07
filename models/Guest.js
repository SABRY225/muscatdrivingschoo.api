const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const Guest = sequelize.define("Guest", {
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  long: {
    type: DataTypes.DOUBLE,
    defaultValue: 0,
  },
  lat: {
    type: DataTypes.DOUBLE,
    defaultValue: 0,
  },
  isSuspended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // ADD By eng.reem.shwk@gmail.com
  image: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  phoneNumber: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  dateOfBirth: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  nationality: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  gender: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  city: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  isnotify :{
    type : DataTypes.BOOLEAN,
    defaultValue : false,
  },
  isOnline :{
    type : DataTypes.BOOLEAN,
    defaultValue : false,
  },
  isRegistered: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Guest;
