const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const Parent = sequelize.define("Parent", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
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
  phone: {
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
  }
});

module.exports = Parent;
