const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const Evaluations = sequelize.define("Evaluations", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  TeacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Teachers',
      key: 'id'
    }
  },
  StudentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Students',
      key: 'id'
    }
  },
  StudentName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  certificateDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  trainingStage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  teacherSignature: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: "Evaluations",
  timestamps: true,
});

module.exports = Evaluations;
