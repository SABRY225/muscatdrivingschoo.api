const express = require("express");

const errorCatcher = require("../middlewares/errorCatcher");
const { charge, checkoutSuccess, booking, bookingSuccess, bookingTest, bookingLecture, bookingPackage, bookingDiscount } = require("../controllers/payment");

const paymentRouter = express.Router();

paymentRouter.post("/charge",               errorCatcher(charge));
paymentRouter.post("/successCheckout",      errorCatcher(checkoutSuccess));
paymentRouter.post("/booking",              errorCatcher(booking));
paymentRouter.post("/bookingSuccess",       errorCatcher(bookingSuccess));
paymentRouter.post("/bookingTest",              errorCatcher(bookingTest));
paymentRouter.post("/bookingLecture",           errorCatcher(bookingLecture));
paymentRouter.post("/bookingPackage",           errorCatcher(bookingPackage));
paymentRouter.post("/bookingDiscount",          errorCatcher(bookingDiscount));

module.exports = paymentRouter;
