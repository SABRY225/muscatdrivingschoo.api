const { createSession } = require("../shared/createEntities.service");
const { handleThawaniPayment, handleWalletPayment, handlePointsPayment } = require("../shared/paymentHandler.service");

exports.book = async (data) => {
  const { price, typeOfPayment } = data;

  if (price < 0.1) {
    throw new Error("Total price must be greater than 0.1 OMR");
  }

  // إضافة totalPrice إلى البيانات
  const updatedData = { ...data, totalPrice: price };

  if (typeOfPayment === "thawani") {
    return await handleThawaniPayment(updatedData, price, createSession);
  } else if (typeOfPayment === "wallet") {
    return await handleWalletPayment(updatedData, price, createSession, "lesson_booking");
  }else if(typeOfPayment === "points"){
    return await handlePointsPayment(data, price, createSession, "lesson_booking");
  }
};
