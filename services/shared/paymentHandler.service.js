const {
  Wallet,
  Student,
  Teacher,
  Admin,
  FinancialRecord,
  Session,
  StudentTest,
  StudentDiscount,
  StudentPackage,
} = require("../../models");
const sendEmail = require("../../middlewares/sendEmail");
const { addToAdminWallet } = require("./adminWallet.service");
const {
  sendNotification,
  sendBookingNotification,
} = require("./notification.service");
const StudentLecture = require("../../models/StudentLecture");
const {
  generateChargeConfirmationEmail,
} = require("../../utils/EmailBodyGenerator");
const { addPointsForPurchase } = require("./points.service");
const { sendWhatsAppTemplate } = require("../../utils/whatsapp");
const { PAYMENT_TEMPLATES } = require("../../config/whatsapp-templates");
const { sendInvoiceWhatsApp } = require("../../utils/invoiceWhatsApp");
const Invite = require("../../models/Invite");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

exports.handleThawaniPaymentCharge = async (data, newPrice, createEntityFn) => {
  const { FRONTEND_URL, THAWANI_KEY, THAWANI_PUBLISHABLE_KEY } = process.env;

  const response = await fetch(
    "https://checkout.thawani.om/api/v1/checkout/session",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "thawani-api-key": THAWANI_KEY,
      },
      body: JSON.stringify({
        client_reference_id: "123412",
        mode: "payment",
        products: [
          { name: "product 1", quantity: 1, unit_amount: newPrice * 1000 },
        ],
        success_url: `${FRONTEND_URL}/success-payment`,
        cancel_url: `${FRONTEND_URL}/fail-payment`,
        metadata: { "Customer name": "somename", "order id": 0 },
      }),
    },
  );

  const result = await response.json();
  if (result.success && result.code === 2004) {
    const created = await createEntityFn({
      StudentId: data.StudentId,
      price,
      currency: "OMR",
      isPaid: false,
      typeAr: "إيداع",
      typeEn: "deposit",
      sessionId: result.data.session_id,
    });
    created.sessionId = result.data.session_id;
    global.session_id = result.data.session_id;
    await created.save();

    return {
      data: `https://checkout.thawani.om/pay/${result.data.session_id}?key=${THAWANI_PUBLISHABLE_KEY}`,
      msg: {
        arabic: "تم الحجز من خلال ثواني",
        english: "Booking with thawani",
      },
    };
  } else {
    throw new Error("charge didn't succeed");
  }
};

exports.handleThawaniPayment = async (data, newPrice, createEntityFn) => {
  const { FRONTEND_URL, THAWANI_KEY, THAWANI_PUBLISHABLE_KEY } = process.env;

  const response = await fetch(
    "https://checkout.thawani.om/api/v1/checkout/session",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "thawani-api-key": THAWANI_KEY,
      },
      body: JSON.stringify({
        client_reference_id: "123412",
        mode: "payment",
        products: [
          { name: "product 1", quantity: 1, unit_amount: newPrice * 1000 },
        ],
        success_url: `${FRONTEND_URL}/success-payment`,
        cancel_url: `${FRONTEND_URL}/fail-payment`,
        metadata: { "Customer name": "somename", "order id": 0 },
      }),
    },
  );

  const result = await response.json();
  if (result.success && result.code === 2004) {
    const created = await createEntityFn(data);
    global.session_id = result.data.session_id;
    global.typePay = data.type;
    created.sessionId = result.data.session_id;
    await created.save();

    return {
      data: `https://checkout.thawani.om/pay/${result.data.session_id}?key=${THAWANI_PUBLISHABLE_KEY}`,
      msg: {
        arabic: "تم الحجز من خلال ثواني",
        english: "Booking with thawani",
      },
    };
  } else {
    throw new Error("charge didn't succeed");
  }
};

exports.handleWalletPayment = async (data, newPrice, createEntityFn, type) => {
  const { StudentId, TeacherId, currency, language } = data;

  const student = await Student.findOne({ where: { id: StudentId } });
  if (+student.wallet < +newPrice) {
       return {
    error: true,
    status: 400,
    msg: {
      arabic: "رصيد المحفظة الحالي أقل من السعر المطلوب",
      english: "Your current wallet is less than the required price",
    }
  };
  }

  const created = await createEntityFn(data);
  created.isPaid = true;
  await created.save();

  await Wallet.create({
    StudentId,
    price: data.price,
    currency,
    typeAr: "سحب",
    typeEn: "withdraw",
    isPaid: true,
  });

  student.wallet -= +newPrice;
  await student.save();

  await FinancialRecord.create({
    StudentId,
    TeacherId,
    currency,
    amount: newPrice,
    type,
  });

  const teacher = await Teacher.findOne({ where: { id: TeacherId } });
  const admin = await Admin.findOne({ where: { id: "1" } });

  const discount = 1 - +admin.profitRatio / 100.0;
  teacher.totalAmount += +newPrice * discount;
  const counterField = `booking${type.replace("booking", "")}Numbers`;
  teacher[counterField] = (teacher[counterField] || 0) + 1;
  await teacher.save();
  const amountadmin = +newPrice * (+admin.profitRatio / 100.0);
  await addToAdminWallet(amountadmin);

  // add points
  await addPointsForPurchase({
    studentId: student.id,
    teacherId: teacher.id,
  });

  // send email
  const mailOptions = generateChargeConfirmationEmail(
    language,
    student.name,
    student.email,
    newPrice,
    currency,
  );
  await sendEmail(mailOptions);

  // send WhatsApp payment confirmation and invoice
  try {
    const templateName =
      language === "ar"
        ? PAYMENT_TEMPLATES.PAYMENT_CONFIRMATION_AR
        : PAYMENT_TEMPLATES.PAYMENT_CONFIRMATION_EN;
    await sendWhatsAppTemplate({
      to: student.phoneNumber,
      templateName,
      variables: [student.name, newPrice.toString(), currency, type],
      language: templateName.includes("_ar") ? "ar" : "en_US",
      recipientName: student.name,
      messageType: "payment_confirmation",
    });

    // إرسال فاتورة دفع مفصلة
    await sendInvoiceWhatsApp({
      to: student.phoneNumber,
      customerName: student.name,
      invoiceNumber: `INV-${created.id}-${Date.now()}`,
      totalAmount: newPrice,
      currency: currency,
      paymentMethod: "wallet",
      language: language,
      invoiceType: type.includes("lesson")
        ? "lesson_payment"
        : type.includes("lecture")
          ? "lecture_payment"
          : type.includes("package")
            ? "package_payment"
            : type.includes("test")
              ? "test_payment"
              : "general_payment",
      sessionDetails: {
        teacherName: teacher.name || `${teacher.firstName} ${teacher.lastName}`,
        subject: type,
        duration: created.period || "60",
      },
    });
  } catch (whatsappError) {
    console.error(
      "❌ فشل إرسال رسالة واتساب لتأكيد الدفع:",
      whatsappError.message,
    );
  }

  // add notfication
  await sendBookingNotification({
    type,
    student,
    teacher,
    adminId: "1",
  });

  return {
    data: created,
    msg: {
      arabic: "تم الدفع من خلال المحفظة",
      english: "Booking with wallet",
    },
  };
};

exports.handlePointsPayment = async (data, newPrice, createEntityFn, type) => {
  const { StudentId, TeacherId, currency, language } = data;

  const student = await Student.findOne({ where: { id: StudentId } });
  const studentInvite = await Invite.findOne({ where: { userId: StudentId } });
  if(!studentInvite){
           return {
    error: true,
    status: 400,
    msg: {
      arabic: "للاسف لا تمتلك اي نقاط مكتسبة",
      english: "Unfortunately, you don't have any acquired points."
    }
  };
  }
  if ((+studentInvite.amountPoints / 50) < +newPrice) {
       return {
    error: true,
    status: 400,
    msg: {
      arabic: "رصيد من النقاط المكتسبة الحالي غير كافي للشراء",
      english: "A balance of the current acquired points is not sufficient to buy"
    }
  };
  }

  const created = await createEntityFn(data);
  created.isPaid = true;
  await created.save();

  studentInvite.amountPoints -= +newPrice * 50
  await studentInvite.save();

  await FinancialRecord.create({
    StudentId,
    TeacherId,
    currency,
    amount: newPrice,
    type,
  });

  const teacher = await Teacher.findOne({ where: { id: TeacherId } });
  const admin = await Admin.findOne({ where: { id: "1" } });

  const discount = 1 - +admin.profitRatio / 100.0;
  teacher.totalAmount += +newPrice * discount;
  const counterField = `booking${type.replace("booking", "")}Numbers`;
  teacher[counterField] = (teacher[counterField] || 0) + 1;
  await teacher.save();
  const amountadmin = +newPrice * (+admin.profitRatio / 100.0);
  await addToAdminWallet(amountadmin);

  // send email
  const mailOptions = generateChargeConfirmationEmail(
    language,
    student.name,
    student.email,
    newPrice,
    currency,
  );
  await sendEmail(mailOptions);

  // send WhatsApp payment confirmation and invoice
  try {
    const templateName =
      language === "ar"
        ? PAYMENT_TEMPLATES.PAYMENT_CONFIRMATION_AR
        : PAYMENT_TEMPLATES.PAYMENT_CONFIRMATION_EN;
    await sendWhatsAppTemplate({
      to: student.phoneNumber,
      templateName,
      variables: [student.name, newPrice.toString(), currency, type],
      language: templateName.includes("_ar") ? "ar" : "en_US",
      recipientName: student.name,
      messageType: "payment_confirmation",
    });

    // إرسال فاتورة دفع مفصلة
    await sendInvoiceWhatsApp({
      to: student.phoneNumber,
      customerName: student.name,
      invoiceNumber: `INV-${created.id}-${Date.now()}`,
      totalAmount: newPrice,
      currency: currency,
      paymentMethod: "wallet",
      language: language,
      invoiceType: type.includes("lesson")
        ? "lesson_payment"
        : type.includes("lecture")
          ? "lecture_payment"
          : type.includes("package")
            ? "package_payment"
            : type.includes("test")
              ? "test_payment"
              : "general_payment",
      sessionDetails: {
        teacherName: teacher.name || `${teacher.firstName} ${teacher.lastName}`,
        subject: type,
        duration: created.period || "60",
      },
    });
  } catch (whatsappError) {
    console.error(
      "❌ فشل إرسال رسالة واتساب لتأكيد الدفع:",
      whatsappError.message,
    );
  }

  // add notfication
  await sendBookingNotification({
    type,
    student,
    teacher,
    adminId: "1",
  });

  return {
    data: created,
    msg: {
      arabic: "تم الدفع من خلال النقط المكتسبة",
      english: "Payed through acquired points",
    },
  };
};

exports.handleconfirmePaymentCharge = async (language) => {
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

  student.wallet += +wallet.price;
  await student.save();

  // send message to email
  const mailOptions = generateChargeConfirmationEmail(
    language,
    student.name,
    student.email,
    wallet.price,
    wallet.currency,
    wallet.sessionId,
  );
  await sendEmail(mailOptions);

  // send WhatsApp wallet charge confirmation and invoice
  try {
    const templateName =
      language === "ar"
        ? PAYMENT_TEMPLATES.WALLET_CHARGE_CONFIRMATION_AR
        : PAYMENT_TEMPLATES.WALLET_CHARGE_CONFIRMATION_EN;
    await sendWhatsAppTemplate({
      to: student.phoneNumber,
      templateName,
      variables: [student.name, wallet.price.toString(), wallet.currency],
      language: templateName.includes("_ar") ? "ar" : "en_US",
      recipientName: student.name,
      messageType: "wallet_charge_confirmation",
    });

    // إرسال فاتورة شحن الرصيد
    await sendInvoiceWhatsApp({
      to: student.phoneNumber,
      customerName: student.name,
      invoiceNumber: `CHG-${wallet.id}-${Date.now()}`,
      totalAmount: wallet.price,
      currency: wallet.currency,
      paymentMethod: "thawani",
      language: language,
      invoiceType: "wallet_charge",
      transactionId: wallet.sessionId,
    });
  } catch (whatsappError) {
    console.error(
      "❌ فشل إرسال رسالة واتساب لتأكيد شحن الرصيد:",
      whatsappError.message,
    );
  }

  // send notification
  await sendNotification(
    `تم ايداع مبلغ قدره ${wallet.price} ريال عماني`,
    `An amount of ${wallet.price} Omani Riyals has been deposited.`,
    student.id,
    "student",
    "charge_success",
  );
  await sendNotification(
    `تم ايداع مبلغ قدره ${wallet.price} ريال عماني في رصيد الطالب ${student.name} `,
    `An amount of ${wallet.price} Omani Riyals has been deposited into the student's balance ${student.name}`,
    "1",
    "admin",
    "charge_success",
  );
  res.send({
    status: 201,
    data: student,
    msg: { arabic: "تم الدفع بنجاح", english: "successful charging" },
  });
};

exports.handleconfirmePayment = async (language) => {
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

  let session;
  if (global.typePay == "lesson_booking") {
    session = await Session.findOne({
      where: {
        sessionId: global.session_id,
      },
    });
  } else if (global.typePay == "test_booking") {
    session = await StudentTest.findOne({
      where: {
        sessionId: global.session_id,
      },
    });
  } else if (global.typePay == "lecture_booking") {
    session = await StudentLecture.findOne({
      where: {
        sessionId: global.session_id,
      },
    });
  } else if (global.typePay == "discount_booking") {
    session = await StudentDiscount.findOne({
      where: {
        sessionId: global.session_id,
      },
    });
  } else if (global.typePay == "package_booking") {
    session = await StudentPackage.findOne({
      where: {
        sessionId: global.session_id,
      },
    });
  }

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
  // add mony to admin wallet
  const amountAdmin = +session.price * (+admin.profitRatio / 100.0);
  await addToAdminWallet(amountAdmin);

  const student = await Student.findOne({
    where: {
      id: StudentId,
    },
  });
  // add points
  await addPointsForPurchase({
    studentId: student.id,
    teacherId: teacher.id,
  });
  // send email
  const mailOptions = generateChargeConfirmationEmail(
    language,
    student.name,
    student.email,
    session.price,
    session.currency,
    session.sessionId,
  );
  await sendEmail(mailOptions);

  // send WhatsApp payment confirmation and invoice
  try {
    const templateName =
      language === "ar"
        ? PAYMENT_TEMPLATES.PAYMENT_CONFIRMATION_AR
        : PAYMENT_TEMPLATES.PAYMENT_CONFIRMATION_EN;
    await sendWhatsAppTemplate({
      to: student.phoneNumber,
      templateName,
      variables: [
        student.name,
        session.price.toString(),
        session.currency,
        session.type,
      ],
      language: templateName.includes("_ar") ? "ar" : "en_US",
      recipientName: student.name,
      messageType: "payment_confirmation",
    });

    // إرسال فاتورة دفع مفصلة
    await sendInvoiceWhatsApp({
      to: student.phoneNumber,
      customerName: student.name,
      invoiceNumber: `PAY-${session.id}-${Date.now()}`,
      totalAmount: session.price,
      currency: session.currency,
      paymentMethod: "thawani",
      language: language,
      invoiceType: session.type.includes("lesson")
        ? "lesson_payment"
        : session.type.includes("lecture")
          ? "lecture_payment"
          : session.type.includes("package")
            ? "package_payment"
            : session.type.includes("test")
              ? "test_payment"
              : session.type.includes("discount")
                ? "discount_payment"
                : "general_payment",
      transactionId: session.sessionId,
      sessionDetails: {
        teacherName: teacher.name || `${teacher.firstName} ${teacher.lastName}`,
        subject: session.type,
        duration: session.period || "60",
      },
    });
  } catch (whatsappError) {
    console.error(
      "❌ فشل إرسال رسالة واتساب لتأكيد الدفع:",
      whatsappError.message,
    );
  }

  // add notfication
  await sendBookingNotification({
    type: session.type,
    student,
    teacher,
    adminId: "1",
  });

  res.send({
    status: 201,
    data: session,
    msg: {
      arabic: "تم الدفع بنجاح من خلال منصة ثواني",
      english: "successful booking from thawani",
    },
  });
};
