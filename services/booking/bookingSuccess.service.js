const { handleconfirmePayment } = require("../shared/paymentHandler.service");

exports.confirmePayment = async (data) => {
    const { language } = data;
    return await handleconfirmePayment(language);
};