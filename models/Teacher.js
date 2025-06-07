const { DataTypes } = require("sequelize");
const Sequelize = require("../db/config/connection");

const Teacher = Sequelize.define(
  "Teacher",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    lastName: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    password: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    phone: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    gender: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    image: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    videoLink: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    dateOfBirth: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    city: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    country: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    haveExperience: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    experienceYears: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    favStdGender: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    haveCertificates: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    favHours: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    timeZone: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    articleExperience: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    bank_name: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    acc_name: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    acc_number: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    iban: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    paypal_acc: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    shortHeadlineAr: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    shortHeadlineEn: {
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
    instantBooking: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isRegistered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    registerCode: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rate: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalAmount: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
    },
    dues: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
    },
    hoursNumbers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    bookingNumbers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    bookingDiscountNumbers : {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    bookingTestNumbers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    bookingLectureNumbers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    bookingPackageNumbers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    long: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
    },
    lat: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
    },
    isEnable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isSuspended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // ADD By eng.reem.shwk@gmail.com
    isnotify :{
      type : DataTypes.BOOLEAN,
      defaultValue : false,
    },
    isOnline :{
      type : DataTypes.BOOLEAN,
      defaultValue : false,
    }
  },
  {
    defaultScope: {
      where: {
        isEnable: true,
      },
    },
  }
);

module.exports = Teacher;
