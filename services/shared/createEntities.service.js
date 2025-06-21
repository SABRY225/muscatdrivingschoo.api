const { StudentTest, StudentDiscount, StudentPackage, Session, Wallet } = require("../../models");
const StudentLecture = require("../../models/StudentLecture");

exports.createStudentTest = async (data) => {
  return await StudentTest.create(data);
};

exports.createStudentDiscount = async (data) => {
  return await StudentDiscount.create(data);
};

exports.createStudentLecture = async (data) => {
  return await StudentLecture.create(data);
};

exports.createStudentPackage = async (data) => {
  return await StudentPackage.create(data);
};
exports.createSession = async (data) => {
  return await Session.create(data);
};

exports.createCharge = async (data) => {
  return await Wallet.create(data);
};

