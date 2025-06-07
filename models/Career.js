const { DataTypes } = require("sequelize");
const Sequelize = require("../db/config/connection");
// This object ADD By eng.reem.shwky@gamil.com
const Career = Sequelize.define(
  "Career",
  {
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
      defaultValue: "",
    },
    descriptionAr: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    descriptionEn: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    image: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    country: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: "1",
    },

    advertiserName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    advertiserPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    
  },
);

module.exports = Career;
