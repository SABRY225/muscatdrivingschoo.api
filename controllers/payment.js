const testBookingService = require("../services/booking/testBooking.service");
const discountBookingService = require("../services/booking/discountBooking.service");
const lectureBookingService = require("../services/booking/lectureBooking.service");
const packageBookingService = require("../services/booking/packageBooking.service");
const chargeService = require("../services/booking/chargeService.service");
const chargeSuccess = require("../services/booking/chargeSuccess.service");
const bookingService = require("../services/booking/bookingService.service");
const bookingSuccess = require("../services/booking/bookingSuccess.service");


exports.charge = async (req, res) => {
  try {
    const response = await chargeService.book(req.body);
    res.status(201).send(response);
  } catch (err) {
    res.status(err.status || 500).send({ error: err.message });
  }
};

exports.booking = async (req, res) => {
  try {
    const response = await bookingService.book(req.body);
    res.status(201).send(response);
  } catch (err) {
    res.status(err.status || 500).send({ error: err.message });
  }
};

exports.bookingTest = async (req, res) => {
  try {
    const response = await testBookingService.book(req.body);
    res.status(201).send(response);
  } catch (err) {
    res.status(err.status || 500).send({ error: err.message });
  }
};

exports.bookingDiscount = async (req, res) => {
  try {
    const response = await discountBookingService.book(req.body);
    res.status(201).send(response);
  } catch (err) {
    res.status(err.status || 500).send({ error: err.message });
  }
};

exports.bookingLecture = async (req, res) => {
  try {
    const response = await lectureBookingService.book(req.body);
    res.status(201).send(response);
  } catch (err) {
    res.status(err.status || 500).send({ error: err.message });
  }
};

exports.bookingPackage = async (req, res) => {
  try {
    const response = await packageBookingService.book(req.body);
    res.status(201).send(response);
  } catch (err) {
    res.status(err.status || 500).send({ error: err.message });
  }
};

exports.checkoutSuccess = async (req, res) => {
  try {
    const response = await chargeSuccess.confirmePaymentCharge(req.body);
    res.status(201).send(response);
  } catch (err) {
    res.status(err.status || 500).send({ error: err.message });
  }
};

exports.bookingSuccess = async (req, res) => {
  try {
    const response = await bookingSuccess.confirmePayment(req.body);
    res.status(201).send(response);
  } catch (err) {
    res.status(err.status || 500).send({ error: err.message });
  }
};