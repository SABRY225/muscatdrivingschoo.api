const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const Friend = sequelize.define("Friend", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user1Id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    user1Type: {
        type: DataTypes.ENUM("teacher", "student", "admin", "parent"),
        allowNull: false,
    },
    user2Id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    user2Type: {
        type: DataTypes.ENUM("teacher", "student", "admin", "parent"),
        allowNull: false,
    },
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['user1Id', 'user2Id']
        }
    ]
});

module.exports = Friend;
