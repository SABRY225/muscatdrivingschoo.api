const { createStudentPackage } = require("../shared/createEntities.service");
const { handleThawaniPayment, handleWalletPayment, handlePointsPayment } = require("../shared/paymentHandler.service");

exports.book = async (data) => {
  const { price, typeOfPayment } = data;
  if (price < 0.1) {
    throw new Error("Total price must be greater than 0.1 OMR");
  }

  if (typeOfPayment === "thawani") {
    return await handleThawaniPayment(data, price, createStudentPackage);
  } else if (typeOfPayment === "wallet") {
    return await handleWalletPayment(data, price, createStudentPackage, "package_booking");
  }else if(typeOfPayment === "points"){
    return await handlePointsPayment(data, price, createStudentPackage, "package_booking");
  }
};