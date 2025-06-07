const dotenv = require("dotenv");
const { Sequelize } = require("sequelize");

dotenv.config();
const { DATABASE_NAME, DATABASE_USER_NAME, DATABASE_PASSWORD } = process.env;

const sequelize = new Sequelize(
  DATABASE_NAME,
  DATABASE_USER_NAME,
  DATABASE_PASSWORD,
  {
    dialect: "mysql",
    host: "localhost",
  }
);
module.exports = sequelize;
