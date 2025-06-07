const { DataTypes } = require("sequelize");
const sequelize     = require("../db/config/connection");

const AdsDepartment = sequelize.define("AdsDepartment", {
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
});

module.exports = AdsDepartment;
