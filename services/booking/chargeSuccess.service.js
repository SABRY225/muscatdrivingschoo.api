const { handleconfirmePaymentCharge } = require("../shared/paymentHandler.service");

exports.confirmePaymentCharge = async (data) => {
    const { language } = req.body;
    return await handleconfirmePaymentCharge(language);
};