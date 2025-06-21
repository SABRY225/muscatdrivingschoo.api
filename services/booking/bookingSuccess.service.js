const { handleconfirmePayment } = require("../shared/paymentHandler.service");

exports.confirmePayment = async (data) => {
    const { language } = req.body;
    return await handleconfirmePayment(language);
};