const { DataTypes } = require("sequelize");
const Sequelize = require("../db/config/connection");
// This object ADD By eng.reem.shwky@gamil.com
const Discounts = Sequelize.define(
  "Discounts",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    discountType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    titleAR: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    titleEN: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    
    descriptionAR: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    descriptionEN: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },

    conditionsAR: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    conditionsEN: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },

    startDate: {
      type: DataTypes.STRING,
      defaultValue: "",
    },

    endDate: {
      type: DataTypes.STRING,
      defaultValue: "",
    },

    percentage: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    amountBeforeDiscount: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: "OMR",
      allowNull: false,
    },
    amountAfterDiscount: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
    },

    image: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
  curriculums: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  class: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  semester: {
    type: DataTypes.STRING,
    allowNull: false,
  },
    subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
      linkDiscount: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  docs: {
    type: DataTypes.STRING,
    allowNull: true,
  },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: "1",
    },
    
  },
);

module.exports = Discounts;
