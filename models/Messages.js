const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const Messages = sequelize.define("Messages", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  from_user: {
    type: DataTypes.INTEGER, 
    allowNull: false,
  },
 isReply: {
    type: DataTypes.BOOLEAN, 
    allowNull: true,
    defaultValue:false
  },
  reply: {
    type: DataTypes.STRING, 
    allowNull: true,
  }
});

module.exports = Messages;
