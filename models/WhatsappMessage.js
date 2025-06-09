const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const WhatsappMessage = sequelize.define('whatsapp_messages', {
  template_name: DataTypes.STRING,
  phone_number: DataTypes.STRING,
  recipient_name: DataTypes.STRING,
  sent_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false
});

module.exports = WhatsappMessage;
