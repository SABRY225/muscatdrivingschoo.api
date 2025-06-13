const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const Invite = sequelize.define("Invite", {
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    link: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    amountPoints: {
        type: DataTypes.DECIMAL,
        defaultValue:0,
        allowNull: true,
    }
});

module.exports = Invite;
