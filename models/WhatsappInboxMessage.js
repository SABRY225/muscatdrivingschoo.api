const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const WhatsappInboxMessage = sequelize.define("whatsapp_inbox_messages", {
  phone_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  received_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
});

module.exports = WhatsappInboxMessage;
