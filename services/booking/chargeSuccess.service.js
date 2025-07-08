const { handleconfirmePaymentCharge } = require("../shared/paymentHandler.service");

exports.confirmePaymentCharge = async (data) => {
    const { language } = data;
    return await handleconfirmePaymentCharge(language);
};