const CC = require("currency-converter-lt");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { serverErrs } = require("../middlewares/customError");
const {
  Wallet,       Student,      Session,
  Teacher,      Admin,        FinancialRecord,
  StudentTest,  StudentPackage, StudentDiscount,
  Tests,
} = require("../models");
const { Notifications } = require("../firebaseConfig");
const sendEmail = require("../middlewares/sendEmail");

const dotenv = require("dotenv");
const {
  generateChargeConfirmationEmail,
  generateSessionConfirmationEmail,
  generateTeacherSessionNoticeEmail,
  generateSessionPaymentConfirmation,
} = require("../utils/EmailBodyGenerator");
const {
  generateChargeConfirmationSMSBody,
  generateSessionConfirmationSMSBody,
  generateSessionPaymentConfirmationSMS,
} = require("../utils/SMSBodyGenerator");
const StudentLecture = require("../models/StudentLecture");
dotenv.config();
const charge = async (req, res) => {
  const { StudentId, price, currency } = req.body;
  let currencyConverter = new CC();

  const newPrice = await currencyConverter
    .from(currency)
    .to("OMR")
    .amount(+price)
    .convert();

  global.price = price;
  global.currency = currency;
  global.newPrice = newPrice;

  let url = "https://checkout.thawani.om/api/v1/checkout/session";

  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "thawani-api-key": "V27floHDuAQzb4fVaAT2isXTtSbcqm",
    },
    body: `{"client_reference_id":"123412","mode":"payment","products":[{"name":"product 1","quantity":1,"unit_amount":${
      newPrice * 1000
    }}],"success_url":"${
      process.env.FRONTEND_URL
    }/success-charge","cancel_url":"${
      process.env.FRONTEND_URL
    }/fail-charge","metadata":{"Customer name":"somename","order id":0}}`,
  };

  const response = await fetch(url, options);
  const data = await response.json();
  if (data.success && data.code === 2004) {
    global.session_id = data.data.session_id;
    const charging = await Wallet.create({
      StudentId,
      price,
      currency,
      isPaid: false,
      typeAr: "إيداع",
      typeEn: "deposit",
      sessionId: global.session_id,
    });
  } else {
    throw serverErrs.BAD_REQUEST("charge didn't succeed");
  }

  res.send({
    status: 201,
    data: `https://checkout.thawani.om/pay/${data.data.session_id}?key=LmFvwxjsXqUb3MeOCWDPCSrAjWrwit`,
    msg: { arabic: "تم شحن المبلغ", english: "charged" },
  });
};

const checkoutSuccess = async (req, res) => {
  const { language } = req.body;

  let options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "thawani-api-key": "V27floHDuAQzb4fVaAT2isXTtSbcqm",
    },
  };

  let url = `https://checkout.thawani.om/api/v1/checkout/session/${global.session_id}`;

  const response = await fetch(url, options);
  const data = await response.json();

  if (data.data.payment_status != "paid") {
    throw serverErrs.BAD_REQUEST("charge didn't pay");
  }

  const wallet = await Wallet.findOne({
    where: {
      sessionId: global.session_id,
    },
  });
  const { StudentId } = wallet;

  wallet.isPaid = true;
  await wallet.save();

  global.session_id = null;

  const student = await Student.findOne({
    where: {
      id: StudentId,
    },
  });

  student.wallet += +global.newPrice;
  await student.save();

  const mailOptions = generateChargeConfirmationEmail(
    language,
    student.email,
    student.name,
    global.price,
    global.currency
  );
  // added by Abdelwahab
  const smsOptions = {
    body: generateChargeConfirmationSMSBody(
      language,
      student.name,
      global.price,
      global.currency
    ),
    to: student.phoneNumber,
  };
  sendEmail(mailOptions, smsOptions);
  global.newPrice = null;

  res.send({
    status: 201,
    data: student,
    msg: { arabic: "تم الدفع بنجاح", english: "successful charging" },
  });
};

const booking = async (req, res) => {
  let {
    title,
    StudentId,
    TeacherId,
    price,
    currency,
    typeOfPayment,
    type,
    date,
    period,
    language,
  } = req.body;

  const createSession = async () => {
    const session = await Session.create({
      title,
      StudentId,
      TeacherId,
      price,
      currency,
      typeOfPayment,
      type,
      date,
      period,
      totalPrice,
    });
    return session;
  };
  const createWallet = async () => {
    const wallet = await Wallet.create({
      StudentId,
      price: totalPrice,
      currency,
      typeAr: "سحب",
      typeEn: "withdraw",
    });
    return wallet;
  };

  const totalPrice = +price * period;
  let currencyConverter = new CC();

  const converterPrice = await currencyConverter
    .from(currency)
    .to("OMR")
    .amount(+totalPrice)
    .convert();

  const newPrice = converterPrice.toFixed(3);
  if (newPrice < 0.1) {
    throw serverErrs.BAD_REQUEST("Total price must be greater than 0.1 OMR");
  }
  global.newPrice = newPrice;
  if (typeOfPayment == "thawani") {
    let url = "https://checkout.thawani.om/api/v1/checkout/session";

    let options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "thawani-api-key": "V27floHDuAQzb4fVaAT2isXTtSbcqm",
      },
      body: `{"client_reference_id":"123412","mode":"payment","products":[{"name":"product 1","quantity":1,"unit_amount":${
        newPrice * 1000
      }}],"success_url":"${
        process.env.FRONTEND_URL
      }/success-payment","cancel_url":"${
        process.env.FRONTEND_URL
      }/fail-payment","metadata":{"Customer name":"somename","order id":0}}`,
    };
    const response = await fetch(url, options);
    const data = await response.json();
    if (data.success && data.code === 2004) {
      global.session_id = data.data.session_id;
      const session = await createSession();
      session.sessionId = global.session_id;
      await session.save();
    } else {
      console.log("data.data: ", data.data);
      console.log("error: ", data.data.error);
      throw serverErrs.BAD_REQUEST("charge didn't succeed");
    }

    res.send({
      status: 201,
      data: `https://checkout.thawani.om/pay/${global.session_id}?key=LmFvwxjsXqUb3MeOCWDPCSrAjWrwit`,
      msg: {
        arabic: "تم الحجز من خلال ثواني",
        english: "booking with thawani",
      },
    });
  } else if (typeOfPayment == "wallet") {
    const student = await Student.findOne({
      where: {
        id: StudentId,
      },
    });
    if (+student.wallet < +newPrice) {
      throw serverErrs.BAD_REQUEST(
        "your current wallet is less than the required price"
      );
    }
    const session = await createSession();
    session.isPaid = true;
    await session.save();
    const wallet = await createWallet();
    wallet.isPaid = true;
    await wallet.save();
    student.wallet -= +newPrice;
    await student.save();

    await FinancialRecord.create({
      StudentId,
      TeacherId,
      amount: newPrice,
      type: "booking",
    });

    const teacher = await Teacher.findOne({
      where: {
        id: TeacherId,
      },
    });

    const admin = await Admin.findOne();
    discount = 1 - +admin.profitRatio / 100.0;
    teacher.totalAmount += +newPrice * discount;
    teacher.bookingNumbers += 1;
    teacher.hoursNumbers += +session.period;
    await teacher.save();

    await Notifications.add({
      titleAR: `تم حجز الدرس من الطالب ${student.name}`,
      titleEn: `booking successfully from student ${student.name}`,
      TeacherId,
      seen: false,
      date: Date.now(),
    });

    const mailOptions = generateSessionConfirmationEmail(
      language,
      student.email,
      student.name,
      teacher.firstName + " " + teacher.lastName,
      session.date,
      session.type,
      session.period
    );
    // added by Abdelwahab
    const smsOptions = {
      body: generateSessionConfirmationSMSBody(
        language,
        student.name,
        teacher.firstName + " " + teacher.lastName,
        session.date,
        session.type,
        session.period
      ),
      to: student.phoneNumber,
    };
    sendEmail(mailOptions, smsOptions);

    const mailOption = generateTeacherSessionNoticeEmail(
      language,
      teacher.email,
      teacher.firstName + " " + teacher.lastName,
      student.name,
      session.date,
      session.type,
      session.period
    );
    const smsOptions2 = {
      body: generateSessionConfirmationSMSBody(
        language,
        teacher.firstName + " " + teacher.lastName,
        student.name,
        session.date,
        session.type,
        session.period
      ),
      to: teacher.phone,
    };
    sendEmail(mailOption, smsOptions2);

    res.send({
      status: 201,
      data: session,
      msg: {
        arabic: "تم الدفع من خلال المحفظة",
        english: "booking with wallet",
      },
    });
  }
};

const bookingSuccess = async (req, res) => {
  const { language } = req.body;
  let options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "thawani-api-key": "V27floHDuAQzb4fVaAT2isXTtSbcqm",
    },
  };

  let url = `https://checkout.thawani.om/api/v1/checkout/session/${global.session_id}`;

  const response = await fetch(url, options);
  const data = await response.json();

  if (data.data.payment_status != "paid") {
    throw serverErrs.BAD_REQUEST("payment didn't succeed");
  }

  const session = await Session.findOne({
    where: {
      sessionId: global.session_id,
    },
  });
  const { StudentId } = session;

  session.isPaid = true;
  await session.save();

  global.session_id = null;
  await FinancialRecord.create({
    amount: session.price * session.period,
    currency: session.currency,
    type: "booking",
    TeacherId: session.TeacherId,
    StudentId,
  });

  const teacher = await Teacher.findOne({
    where: {
      id: session.TeacherId,
    },
  });

  const admin = await Admin.findOne();
  discount = 1 - +admin.profitRatio / 100.0;

  teacher.totalAmount += +session.price * discount;
  teacher.bookingNumbers += 1;
  teacher.hoursNumbers += +session.period;
  await teacher.save();

  const student = await Student.findOne({
    where: {
      id: StudentId,
    },
  });

  await Notifications.add({
    titleAR: `تم حجز الدرس من الطالب ${student.name}`,
    titleEn: `booking successfully from student ${student.name}`,
    TeacherId: teacher.id,
    seen: false,
    date: Date.now(),
  });

  const mailOptions1 = generateSessionPaymentConfirmation(
    language,
    student.email,
    student.name,
    teacher.firstName + " " + teacher.lastName,
    session.date,
    session.type,
    session.period,
    session.price,
    session.totalPrice,
    session.currency
  );
  const smsOptions1 = {
    body: generateSessionPaymentConfirmationSMS(
      language,
      student.name,
      teacher.firstName + " " + teacher.lastName,
      session.date,
      session.type,
      session.period,
      session.totalPrice,
      session.currency
    ),
    to: student.phoneNumber,
  };
  sendEmail(mailOptions1, smsOptions1);

  const mailOptions = generateSessionConfirmationEmail(
    language,
    student.email,
    student.name,
    teacher.firstName + " " + teacher.lastName,
    session.date,
    session.type,
    session.period
  );

  // added by Abdelwahab
  const smsOptions = {
    body: generateSessionConfirmationSMSBody(
      language,
      student.name,
      teacher.firstName + " " + teacher.lastName,
      session.date,
      session.type,
      session.period
    ),
    to: student.phoneNumber,
  };
  sendEmail(mailOptions, smsOptions);

  const mailOption = generateTeacherSessionNoticeEmail(
    language,
    teacher.email,
    teacher.firstName + " " + teacher.lastName,
    student.name,
    session.date,
    session.type,
    session.period
  );

  const smsOptions3 = {
    body: generateSessionConfirmationSMSBody(
      language,
      teacher.firstName + " " + teacher.lastName,
      student.name,
      session.date,
      session.type,
      session.period
    ),
    to: teacher.phone,
  };
  sendEmail(mailOption, smsOptions3);
  res.send({
    status: 201,
    data: session,
    msg: {
      arabic: "تم الدفع بنجاح من خلال منصة ثواني",
      english: "successful booking from thawani",
    },
  });
};


// Developer by eng.reem.shwky@gmail.com
const bookingTest = async (req, res) => {
  let {
    title,  StudentId,  TeacherId,
    price,  currency,   typeOfPayment,
    date,   language,
  } = req.body;

  console.log(req.body);
  console.log("Test 1");

  const createStudentTest = async () => {
    const objStudentTest = await StudentTest.create({
      title,    StudentId,    TeacherId,
      price,    currency,     typeOfPayment,
      date,
    });
    return objStudentTest;
  };
  const createWallet = async () => {
    const wallet = await Wallet.create({
      StudentId, price: price, currency, typeAr: "سحب",   typeEn: "withdraw",
    });
    return wallet;
  };

  let currencyConverter = new CC();

  const converterPrice = await currencyConverter
    .from(currency)
    .to("OMR")
    .amount(+price)
    .convert();

  console.log("Test 2");
  const newPrice = converterPrice.toFixed(3);
  if (newPrice < 0.1) {
    throw serverErrs.BAD_REQUEST("Total price must be greater than 0.1 OMR");
  }
  global.newPrice = newPrice;
  if (typeOfPayment == "thawani") {
    let url = "https://checkout.thawani.om/api/v1/checkout/session";

    let options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "thawani-api-key": "V27floHDuAQzb4fVaAT2isXTtSbcqm",
      },
      body: `{"client_reference_id":"123412","mode":"payment","products":[{"name":"product 1","quantity":1,"unit_amount":${
        newPrice * 1000
      }}],"success_url":"${
        process.env.FRONTEND_URL
      }/success-payment","cancel_url":"${
        process.env.FRONTEND_URL
      }/fail-payment","metadata":{"Customer name":"somename","order id":0}}`,
    };
    const response = await fetch(url, options);
    const data = await response.json();
    if (data.success && data.code === 2004) {
      global.session_id = data.data.session_id;
      const currentStudentTest = await createStudentTest();
      currentStudentTest.sessionId = global.session_id;
      await currentStudentTest.save();
    } else {
      console.log("data.data: ",  data.data);
      console.log("error: ",      data.data.error);
      throw serverErrs.BAD_REQUEST("charge didn't succeed");
    }

    console.log("Test 3");
    res.send({
      status: 201,
      data: `https://checkout.thawani.om/pay/${global.session_id}?key=LmFvwxjsXqUb3MeOCWDPCSrAjWrwit`,
      msg: {
        arabic: "تم الحجز من خلال ثواني",
        english: "booking with thawani",
      },
    });
  } else if (typeOfPayment == "wallet") {
    const student = await Student.findOne({
      where: {
        id: StudentId,
      },
    });
    if (+student.wallet < +newPrice) {
      throw serverErrs.BAD_REQUEST(
        "your current wallet is less than the required price"
      );
    }
    const currentStudentTest = await createStudentTest();
    currentStudentTest.isPaid = true;
    await currentStudentTest.save();
    const wallet = await createWallet();
    wallet.isPaid = true;
    await wallet.save();
    student.wallet -= +newPrice;
    await student.save();
    console.log("Test 4");

    await FinancialRecord.create({
      StudentId : StudentId,
      TeacherId : TeacherId,
      currency: currency,
      amount: newPrice,
      type: "bookingTest",
    });

    console.log("Test 5 : Teacher Id");
    console.log(TeacherId);
    const teacher = await Teacher.findOne({
      where: {
        id: TeacherId,
      },
    });

    console.log("Teacher ........")
    console.log(teacher);
    console.log("Test 6");

    const admin = await Admin.findOne({
      where : {
        id: "1",
      },
    });

    discount = 1 - +admin.profitRatio / 100.0;
    teacher.totalAmount        += +newPrice * discount;
    teacher.bookingTestNumbers += 1;
    await teacher.save();

    console.log("Test 7");
    
    await Notifications.add({
      titleAR: `تم حجز الاختبار للطالب ${student.name}`,
      titleEn: `booking test successfully from student ${student.name}`,
      TeacherId,
      seen: false,
      date: Date.now(),
    });
    

    console.log("Test 8");
    const mailOptions = generateSessionConfirmationEmail(
      language,
      student.email,
      student.name,
      teacher.firstName + " " + teacher.lastName,
      currentStudentTest.date,
      "Booking-Test", "1"
    );
  
    console.log("Test 9");
    const smsOptions = {
      body: generateSessionConfirmationSMSBody(
        language,
        student.name,
        teacher.firstName + " " + teacher.lastName,
        currentStudentTest.date,
        "Booking-Test", "1"
      ),
      to: student.phoneNumber,
    };
    sendEmail(mailOptions, smsOptions);

    const mailOption = generateTeacherSessionNoticeEmail(
      language,
      teacher.email,
      teacher.firstName + " " + teacher.lastName,
      student.name,
      currentStudentTest.date,
      "Booking-Test",
      "1"
    );
    const smsOptions2 = {
      body: generateSessionConfirmationSMSBody(
        language,
        teacher.firstName + " " + teacher.lastName,
        student.name,
        currentStudentTest.date,
        "Booking-Test",
        "1"
      ),
      to: teacher.phone,
    };
    sendEmail(mailOption, smsOptions2);
    console.log("Test 10");

    res.send({
      status: 201,
      data: currentStudentTest,
      msg: {
        arabic: "تم الدفع من خلال المحفظة",
        english: "booking with wallet",
      },
    });
  }
};

// Reem
const bookingDiscount = async (req, res) => {
  let {
    title,      StudentId,      TeacherId,
    price,      currency,       typeOfPayment,
    language,
  } = req.body;

  console.log(req.body);
  console.log("Test 1");

  const createStudentDiscount = async () => {
    const objStudentDiscount = await StudentDiscount.create({
      title,    StudentId,    TeacherId,
      price,    currency,     typeOfPayment,
    });
    return objStudentDiscount;
  };
  const createWallet = async () => {
    const wallet = await Wallet.create({
      StudentId, price: price, currency, typeAr: "سحب",   typeEn: "withdraw",
    });
    return wallet;
  };

  let currencyConverter = new CC();

  const converterPrice = await currencyConverter
    .from(currency)
    .to("OMR")
    .amount(+price)
    .convert();

  console.log("Test 2");
  const newPrice = converterPrice.toFixed(3);
  if (newPrice < 0.1) {
    throw serverErrs.BAD_REQUEST("Total price must be greater than 0.1 OMR");
  }
  global.newPrice = newPrice;
  if (typeOfPayment == "thawani") {
    let url = "https://checkout.thawani.om/api/v1/checkout/session";

    let options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "thawani-api-key": "V27floHDuAQzb4fVaAT2isXTtSbcqm",
      },
      body: `{"client_reference_id":"123412","mode":"payment","products":[{"name":"product 1","quantity":1,"unit_amount":${
        newPrice * 1000
      }}],"success_url":"${
        process.env.FRONTEND_URL
      }/success-payment","cancel_url":"${
        process.env.FRONTEND_URL
      }/fail-payment","metadata":{"Customer name":"somename","order id":0}}`,
    };
    const response = await fetch(url, options);
    const data = await response.json();
    if (data.success && data.code === 2004) {
      global.session_id = data.data.session_id;
      const currentStudentDiscount = await createStudentDiscount();
      currentStudentDiscount.sessionId = global.session_id;
      await currentStudentDiscount.save();
    } else {
      console.log("data.data: ",  data.data);
      console.log("error: ",      data.data.error);
      throw serverErrs.BAD_REQUEST("charge didn't succeed");
    }

    console.log("Test 3");
    res.send({
      status: 201,
      data: `https://checkout.thawani.om/pay/${global.session_id}?key=LmFvwxjsXqUb3MeOCWDPCSrAjWrwit`,
      msg: {
        arabic: "تم الحجز من خلال ثواني",
        english: "booking with thawani",
      },
    });
  } else if (typeOfPayment == "wallet") {
    const student = await Student.findOne({
      where: {
        id: StudentId,
      },
    });
    if (+student.wallet < +newPrice) {
      throw serverErrs.BAD_REQUEST(
        "your current wallet is less than the required price"
      );
    }
    const currentStudentDiscount = await createStudentDiscount();
    currentStudentDiscount.isPaid = true;
    await currentStudentDiscount.save();
    const wallet = await createWallet();
    wallet.isPaid = true;
    await wallet.save();
    student.wallet -= +newPrice;
    await student.save();
    console.log("Test 4");

    await FinancialRecord.create({
      StudentId : StudentId,
      TeacherId : TeacherId,
      currency  : currency,
      amount    : newPrice,
      type      : "bookingDiscount",
    });

    console.log("Test 5 : Teacher Id");
    console.log(TeacherId);
    const teacher = await Teacher.findOne({
      where: {
        id: TeacherId,
      },
    });

    console.log("Teacher ........")
    console.log(teacher);
    console.log("Test 6");

    const admin = await Admin.findOne({
      where : {
        id: "1",
      },
    });

    discount = 1 - +admin.profitRatio / 100.0;
    teacher.totalAmount           += +newPrice * discount;
    teacher.bookingDiscountNumbers += 1;
    await teacher.save();

    console.log("Test 7");
    
    await Notifications.add({
      titleAR: `تم حجز الاختبار للطالب ${student.name}`,
      titleEn: `booking test successfully from student ${student.name}`,
      TeacherId,
      seen: false,
      date: Date.now(),
    });
    

    console.log("Test 8");
    const mailOptions = generateSessionConfirmationEmail(
      language,
      student.email,
      student.name,
      teacher.firstName + " " + teacher.lastName,
      "",
      "Booking-Lecture", "1"
    );
  
    console.log("Test 9");
    const smsOptions = {
      body: generateSessionConfirmationSMSBody(
        language,
        student.name,
        teacher.firstName + " " + teacher.lastName,
        "",
        "Booking-Lecture", "1"
      ),
      to: student.phoneNumber,
    };
    sendEmail(mailOptions, smsOptions);

    const mailOption = generateTeacherSessionNoticeEmail(
      language,
      teacher.email,
      teacher.firstName + " " + teacher.lastName,
      student.name,
      "",
      "Booking-Lecture",
      "1"
    );
    const smsOptions2 = {
      body: generateSessionConfirmationSMSBody(
        language,
        teacher.firstName + " " + teacher.lastName,
        student.name,
        "",
        "Booking-Lecture",
        "1"
      ),
      to: teacher.phone,
    };
    sendEmail(mailOption, smsOptions2);
    console.log("Test 10");

    res.send({
      status: 201,
      data: currentStudentDiscount,
      msg: {
        arabic: "تم الدفع من خلال المحفظة",
        english: "booking with wallet",
      },
    });
  }
};

const bookingLecture = async (req, res) => {
  let {
    title,      StudentId,      TeacherId,
    price,      currency,           typeOfPayment,
    language,
  } = req.body;

  console.log(req.body);
  console.log("Test 1");

  const createStudentLecture = async () => {
    const objStudentLecture = await StudentLecture.create({
      title,    StudentId,    TeacherId,
      price,    currency,     typeOfPayment,
    });
    return objStudentLecture;
  };
  const createWallet = async () => {
    const wallet = await Wallet.create({
      StudentId, price: price, currency, typeAr: "سحب",   typeEn: "withdraw",
    });
    return wallet;
  };

  let currencyConverter = new CC();

  const converterPrice = await currencyConverter
    .from(currency)
    .to("OMR")
    .amount(+price)
    .convert();

  console.log("Test 2");
  const newPrice = converterPrice.toFixed(3);
  if (newPrice < 0.1) {
    throw serverErrs.BAD_REQUEST("Total price must be greater than 0.1 OMR");
  }
  global.newPrice = newPrice;
  if (typeOfPayment == "thawani") {
    let url = "https://checkout.thawani.om/api/v1/checkout/session";

    let options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "thawani-api-key": "V27floHDuAQzb4fVaAT2isXTtSbcqm",
      },
      body: `{"client_reference_id":"123412","mode":"payment","products":[{"name":"product 1","quantity":1,"unit_amount":${
        newPrice * 1000
      }}],"success_url":"${
        process.env.FRONTEND_URL
      }/success-payment","cancel_url":"${
        process.env.FRONTEND_URL
      }/fail-payment","metadata":{"Customer name":"somename","order id":0}}`,
    };
    const response = await fetch(url, options);
    const data = await response.json();
    if (data.success && data.code === 2004) {
      global.session_id = data.data.session_id;
      const currentStudentLecture = await createStudentLecture();
      currentStudentLecture.sessionId = global.session_id;
      await currentStudentLecture.save();
    } else {
      console.log("data.data: ",  data.data);
      console.log("error: ",      data.data.error);
      throw serverErrs.BAD_REQUEST("charge didn't succeed");
    }

    console.log("Test 3");
    res.send({
      status: 201,
      data: `https://checkout.thawani.om/pay/${global.session_id}?key=LmFvwxjsXqUb3MeOCWDPCSrAjWrwit`,
      msg: {
        arabic: "تم الحجز من خلال ثواني",
        english: "booking with thawani",
      },
    });
  } else if (typeOfPayment == "wallet") {
    const student = await Student.findOne({
      where: {
        id: StudentId,
      },
    });
    if (+student.wallet < +newPrice) {
      throw serverErrs.BAD_REQUEST(
        "your current wallet is less than the required price"
      );
    }
    const currentStudentLecture = await createStudentLecture();
    currentStudentLecture.isPaid = true;
    await currentStudentLecture.save();
    const wallet = await createWallet();
    wallet.isPaid = true;
    await wallet.save();
    student.wallet -= +newPrice;
    await student.save();
    console.log("Test 4");

    await FinancialRecord.create({
      StudentId : StudentId,
      TeacherId : TeacherId,
      currency: currency,
      amount: newPrice,
      type: "bookingLecture",
    });

    console.log("Test 5 : Teacher Id");
    console.log(TeacherId);
    const teacher = await Teacher.findOne({
      where: {
        id: TeacherId,
      },
    });

    console.log("Teacher ........")
    console.log(teacher);
    console.log("Test 6");

    const admin = await Admin.findOne({
      where : {
        id: "1",
      },
    });

    discount = 1 - +admin.profitRatio / 100.0;
    teacher.totalAmount           += +newPrice * discount;
    teacher.bookingLectureNumbers += 1;
    await teacher.save();
    
    await Notifications.add({
      titleAR: `تم حجز الاختبار للطالب ${student.name}`,
      titleEn: `booking test successfully from student ${student.name}`,
      TeacherId,
      seen: false,
      date: Date.now(),
    });
    

    console.log("Test 8");
    const mailOptions = generateSessionConfirmationEmail(
      language,
      student.email,
      student.name,
      teacher.firstName + " " + teacher.lastName,
      "",
      "Booking-Lecture", "1"
    );
  
    console.log("Test 9");
    const smsOptions = {
      body: generateSessionConfirmationSMSBody(
        language,
        student.name,
        teacher.firstName + " " + teacher.lastName,
        "",
        "Booking-Lecture", "1"
      ),
      to: student.phoneNumber,
    };
    sendEmail(mailOptions, smsOptions);

    const mailOption = generateTeacherSessionNoticeEmail(
      language,
      teacher.email,
      teacher.firstName + " " + teacher.lastName,
      student.name,
      "",
      "Booking-Lecture",
      "1"
    );
    const smsOptions2 = {
      body: generateSessionConfirmationSMSBody(
        language,
        teacher.firstName + " " + teacher.lastName,
        student.name,
        "",
        "Booking-Lecture",
        "1"
      ),
      to: teacher.phone,
    };
    sendEmail(mailOption, smsOptions2);
    console.log("Test 10");

    res.send({
      status: 201,
      data: currentStudentLecture,
      msg: {
        arabic: "تم الدفع من خلال المحفظة",
        english: "booking with wallet",
      },
    });
  }
};

const bookingPackage = async (req, res) => {
  let {
    title,      StudentId,        TeacherId,
    price,      currency,         typeOfPayment,
    language,
  } = req.body;

  console.log(req.body);
  console.log("Test 1");

  const createStudentPackage = async () => {
    const objStudentPackage = await StudentPackage.create({
      title,    StudentId,    TeacherId,
      price,    currency,     typeOfPayment,
    });
    return objStudentPackage;
  };
  const createWallet = async () => {
    const wallet = await Wallet.create({
      StudentId, price: price, currency, typeAr: "سحب",   typeEn: "withdraw",
    });
    return wallet;
  };

  let currencyConverter = new CC();
  const converterPrice = await currencyConverter
    .from(currency)
    .to("OMR")
    .amount(+price)
    .convert();

  console.log("Test 2");
  const newPrice = converterPrice.toFixed(3);
  if (newPrice < 0.1) {
    throw serverErrs.BAD_REQUEST("Total price must be greater than 0.1 OMR");
  }
  global.newPrice = newPrice;
  if (typeOfPayment == "thawani") {
    let url = "https://checkout.thawani.om/api/v1/checkout/session";

    let options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "thawani-api-key": "V27floHDuAQzb4fVaAT2isXTtSbcqm",
      },
      body: `{"client_reference_id":"123412","mode":"payment","products":[{"name":"product 1","quantity":1,"unit_amount":${
        newPrice * 1000
      }}],"success_url":"${
        process.env.FRONTEND_URL
      }/success-payment","cancel_url":"${
        process.env.FRONTEND_URL
      }/fail-payment","metadata":{"Customer name":"somename","order id":0}}`,
    };
    const response = await fetch(url, options);
    const data = await response.json();
    if (data.success && data.code === 2004) {
      global.session_id = data.data.session_id;
      const currentStudentPackage = await createStudentPackage();
      currentStudentPackage.sessionId = global.session_id;
      await currentStudentPackage.save();
    } else {
      console.log("data.data: ",  data.data);
      console.log("error: ",      data.data.error);
      throw serverErrs.BAD_REQUEST("charge didn't succeed");
    }

    console.log("Test 3");
    res.send({
      status: 201,
      data: `https://checkout.thawani.om/pay/${global.session_id}?key=LmFvwxjsXqUb3MeOCWDPCSrAjWrwit`,
      msg: {
        arabic: "تم الحجز من خلال ثواني",
        english: "booking with thawani",
      },
    });
  } else if (typeOfPayment == "wallet") {
    const student = await Student.findOne({
      where: {
        id: StudentId,
      },
    });
    if (+student.wallet < +newPrice) {
      throw serverErrs.BAD_REQUEST(
        "your current wallet is less than the required price"
      );
    }
    const currentStudentPackage = await createStudentPackage();
    currentStudentPackage.isPaid = true;
    await currentStudentPackage.save();
    const wallet = await createWallet();
    wallet.isPaid = true;
    await wallet.save();
    student.wallet -= +newPrice;
    await student.save();
    console.log("Test 4");

    await FinancialRecord.create({
      StudentId : StudentId,
      TeacherId : TeacherId,
      currency  : currency,
      amount    : newPrice,
      type      : "bookingPackage",
    });

    console.log("Test 5 : Teacher Id");
    console.log(TeacherId);
    const teacher = await Teacher.findOne({
      where: {
        id: TeacherId,
      },
    });

    console.log("Teacher ........")
    console.log(teacher);
    console.log("Test 6");

    const admin = await Admin.findOne({
      where : {
        id: "1",
      },
    });

    discount = 1 - +admin.profitRatio / 100.0;
    teacher.totalAmount           += +newPrice * discount;
    teacher.bookingPackageNumbers += 1;
    await teacher.save();

    console.log("Test 7");
    
    await Notifications.add({
      titleAR: `تم حجز الاختبار للطالب ${student.name}`,
      titleEn: `booking test successfully from student ${student.name}`,
      TeacherId,
      seen: false,
      date: Date.now(),
    });
    

    console.log("Test 8");
    const mailOptions = generateSessionConfirmationEmail(
      language,
      student.email,
      student.name,
      teacher.firstName + " " + teacher.lastName,
      "",
      "Booking-Package", "1"
    );
  
    console.log("Test 9");
    const smsOptions = {
      body: generateSessionConfirmationSMSBody(
        language,
        student.name,
        teacher.firstName + " " + teacher.lastName,
        "",
        "Booking-Package", "1"
      ),
      to: student.phoneNumber,
    };
    sendEmail(mailOptions, smsOptions);

    const mailOption = generateTeacherSessionNoticeEmail(
      language,
      teacher.email,
      teacher.firstName + " " + teacher.lastName,
      student.name,
      "",
      "Booking-Package",
      "1"
    );
    const smsOptions2 = {
      body: generateSessionConfirmationSMSBody(
        language,
        teacher.firstName + " " + teacher.lastName,
        student.name,
        "",
        "Booking-Package",
        "1"
      ),
      to: teacher.phone,
    };
    sendEmail(mailOption, smsOptions2);
    console.log("Test 10");

    res.send({
      status: 201,
      data: currentStudentPackage,
      msg: {
        arabic: "تم الدفع من خلال المحفظة",
        english: "booking with wallet",
      },
    });
  }
};

module.exports = { charge, checkoutSuccess, booking, 
  bookingSuccess,
  bookingTest,  bookingLecture, bookingPackage,
  bookingDiscount
 };
