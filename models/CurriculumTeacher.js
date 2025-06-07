const { DataTypes } = require("sequelize");
const Sequelize = require("../db/config/connection");

const CurriculumTeacher = Sequelize.define("CurriculumTeacher", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = CurriculumTeacher;
