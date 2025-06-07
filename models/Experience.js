const { DataTypes } = require("sequelize");
const Sequelize = require("../db/config/connection");

const Experience = Sequelize.define("Experience", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  }, 
  jobTitle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  from: {
    type: DataTypes.STRING,
    allowNull: false
  },
  to:{
    type: DataTypes.STRING,
    allowNull: false
  }
})

module.exports = Experience;