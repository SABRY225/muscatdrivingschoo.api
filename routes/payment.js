const express = require("express");
const {charge,      checkoutSuccess,    booking,            bookingSuccess,
    bookingTest,    bookingLecture,     bookingPackage,     bookingDiscount,
} = require("../controllers/payment");
const errorCatcher = require("../middlewares/errorCatcher");

const paymentRouter = express.Router();

paymentRouter.post("/charge",               errorCatcher(charge));
paymentRouter.post("/successCheckout",      errorCatcher(checkoutSuccess));
paymentRouter.post("/booking",              errorCatcher(booking));
paymentRouter.post("/bookingSuccess",       errorCatcher(bookingSuccess));

//Developer by eng.reem.shwky@gmail.com
paymentRouter.post("/bookingTest",              errorCatcher(bookingTest));
paymentRouter.post("/bookingLecture",           errorCatcher(bookingLecture));
paymentRouter.post("/bookingPackage",           errorCatcher(bookingPackage));
paymentRouter.post("/bookingDiscount",          errorCatcher(bookingDiscount));
//
module.exports = paymentRouter;
