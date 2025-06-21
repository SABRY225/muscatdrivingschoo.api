const { createCharge } = require("../shared/createEntities.service");
const { handleThawaniPaymentCharge } = require("../shared/paymentHandler.service");

exports.book = async (data) => {
  const { price } = data;
  if (price < 0.1) {
    throw new Error("Total price must be greater than 0.1 OMR");
  }
  return await handleThawaniPaymentCharge(data, price, createCharge);
};