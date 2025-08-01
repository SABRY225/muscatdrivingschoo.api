const {
  Wallet,
  Student,
  Teacher,
  Admin: AdminModel,
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
  generateInvoiceEmailBody,
  generatePointsEmailBody,
} = require("../../utils/EmailBodyGenerator");
const { addPointsForPurchase } = require("./points.service");
const { sendWhatsAppTemplate } = require("../../utils/whatsapp");
const getServiceType = (type, language = 'ar') => {
  const serviceTypes = {
    'WITHDRAW': { ar: 'سحب', en: 'Withdraw' },
    'DEPOSIT': { ar: 'إيداع', en: 'Deposit' },
    'LESSON': { ar: 'حصة', en: 'Lesson' },
    'PAYMENT': { ar: 'دفع', en: 'Payment' },
    'booking': { ar: 'حجز', en: 'Booking' },
    'lesson_booking': { ar: 'حجز حصة', en: 'Lesson Booking' },
    'wallet_charge': { ar: 'شحن محفظة', en: 'Wallet Charge' },
    'payment_confirmation': { ar: 'تأكيد دفع', en: 'Payment Confirmation' },
    'wallet_charge_confirmation': { ar: 'تأكيد شحن المحفظة', en: 'Wallet Charge Confirmation' },
    // يمكن إضافة المزيد من الأنواع عند الحاجة
  };
  
  // البحث عن النوع مع تجاهل حالة الأحرف
  const normalizedType = type && typeof type === 'string' ? type.toUpperCase() : type;
  const service = serviceTypes[normalizedType] || { ar: type, en: type };
  
  return language === 'ar' ? service.ar : service.en;
};
const { PAYMENT_TEMPLATES, LESSON_TEMPLATES } = require("../../config/whatsapp-templates");
// Admin model is already imported above as AdminModel
const { sendInvoiceWhatsApp } = require("../../utils/invoiceWhatsApp");
const Invite = require("../../models/Invite");
const Lessons = require("../../models/Lesson");
const { checkAndCreateSessions } = require("./packageSession.service");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

// شحن رصيد من ثواني
exports.handleThawaniPaymentCharge = async (data, newPrice, createEntityFn) => {
  const { FRONTEND_URL, THAWANI_KEY, THAWANI_PUBLISHABLE_KEY } = process.env;

  const response = await fetch(
    "https://uatcheckout.thawani.om/api/v1/checkout/session",
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
      price: newPrice,
      currency: "OMR",
      isPaid: false,
      typeAr: "إيداع",
      typeEn: "deposit",
      sessionId: result.data.session_id,
    });
    created.sessionId = result.data.session_id;
    global.session_id = result.data.session_id;
    global.typePay = "charge";
    await created.save();

    return {
      data: `https://uatcheckout.thawani.om/pay/${result.data.session_id}?key=${THAWANI_PUBLISHABLE_KEY}`,
      msg: {
        arabic: "تم الحجز من خلال ثواني",
        english: "Booking with thawani",
      },
    };
  } else {
    throw new Error("charge didn't succeed");
  }
};
// الدفع من خلال ثواني
exports.handleThawaniPayment = async (data, newPrice, createEntityFn) => {
  const { FRONTEND_URL, THAWANI_KEY, THAWANI_PUBLISHABLE_KEY } = process.env;

  const response = await fetch(
    "https://uatcheckout.thawani.om/api/v1/checkout/session",
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
    global.TeacherId = data.TeacherId;
    if (data.type == "lesson_booking") {
      global.lessionRequestId = data.lessionRequestId;
    }
    await created.save();
    console.log("global.session_id", global.session_id);
    console.log("global.typePay", global.typePay);
    return {
      data: `https://uatcheckout.thawani.om/pay/${result.data.session_id}?key=${THAWANI_PUBLISHABLE_KEY}`,
      msg: {
        arabic: "تم الحجز من خلال ثواني",
        english: "Booking with thawani",
      },
    };
  } else {
    throw new Error("charge didn't succeed");
  }
};
// الدفع من خلال الرصيد
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
  if (data.type === "lesson_booking") {
    const lession = await Lessons.findByPk(data.lessionRequestId);
    if (!lession) throw new Error("Lesson not found");

    lession.status = "paid";
    await lession.save();
  }
  if (data.type === "package_booking") {
    await checkAndCreateSessions({ studentId: StudentId, packageId: data.PackageId, teacherId: data.TeacherId })
  }
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
  const admin = await AdminModel.findOne({ where: { id: "1" } });

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
    {
      language,
      email: student.email,
      name: student.name,
      price: newPrice,
      currency: currency,
    }
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
      variables: [student.name, newPrice.toString(), currency, getServiceType(type, language)],
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
        teacherName: teacher.firstName || `${teacher.firstName} ${teacher.lastName}`,
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
// الدفع من خلال النقاط
exports.handlePointsPayment = async (data, newPrice, createEntityFn, type) => {
  const { StudentId, TeacherId, currency, language } = data;
  console.log(data);
  
  const student = await Student.findOne({ where: { id: StudentId } });
  const studentInvite = await Invite.findOne({ where: { userId: StudentId } });
  if (!studentInvite) {
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
  if (data.type === "lesson_booking") {
    const lession = await Lessons.findByPk(data.lessionRequestId);
    if (!lession) throw new Error("Lesson not found");

    lession.status = "paid";
    await lession.save();
  }
  if (data.type === "package_booking") {
    await checkAndCreateSessions({ studentId: StudentId, packageId: data.PackageId, teacherId: data.TeacherId })
  }
  await FinancialRecord.create({
    StudentId,
    TeacherId,
    currency,
    amount: newPrice,
    type,
  });

  const teacher = await Teacher.findOne({ where: { id: TeacherId } });
  const admin = await AdminModel.findOne({ where: { id: "1" } });

  const discount = 1 - +admin.profitRatio / 100.0;
  teacher.totalAmount += +newPrice * discount;
  const counterField = `booking${type.replace("booking", "")}Numbers`;
  teacher[counterField] = (teacher[counterField] || 0) + 1;
  await teacher.save();
  const amountadmin = +newPrice * (+admin.profitRatio / 100.0);
  await addToAdminWallet(amountadmin);

  // send email
  const mailOptions = generateInvoiceEmailBody(
    {
      language,
      studentName: student.name,
      email: student.email,
      itemName: type,
      price: newPrice,
      currency: currency,
      date: new Date() // ⬅️ مفقود أيضًا في دالتك
    }
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
      variables: [student.name, newPrice.toString(), currency, getServiceType(type, language)],
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
        teacherName: teacher.firstName || `${teacher.firstName} ${teacher.lastName}`,
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
// تاكيد الدفع
exports.handleconfirmePayment = async (language) => {
  const { THAWANI_KEY } = process.env;
  let options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "thawani-api-key": THAWANI_KEY,
    },
  };

  console.log("global.session_id", global.session_id);
  console.log("global.typePay", global.typePay);

  let url = `https://uatcheckout.thawani.om/api/v1/checkout/session/${global.session_id}`;

  const response = await fetch(url, options);
  const data = await response.json();
  console.log("data =", data);

  if (data.data.payment_status !== "paid") {
    throw serverErrs.BAD_REQUEST("payment didn't succeed");
  }

  let session;

  if (global.typePay === "lesson_booking") {
    session = await Session.findOne({ where: { sessionId: global.session_id } });

    const lession = await Lessons.findByPk(global.lessionRequestId);
    if (!lession) throw new Error("Lesson not found");

    lession.status = "paid";
    await lession.save();
  } else if (global.typePay === "test_booking") {
    session = await StudentTest.findOne({ where: { sessionId: global.session_id } });
  } else if (global.typePay === "lecture_booking") {
    session = await StudentLecture.findOne({ where: { sessionId: global.session_id } });
  } else if (global.typePay === "discount_booking") {
    session = await StudentDiscount.findOne({ where: { sessionId: global.session_id } });
  } else if (global.typePay === "package_booking") {
    session = await StudentPackage.findOne({ where: { sessionId: global.session_id } });
  } else if (global.typePay === "charge") {
    const wallet = await Wallet.findOne({ where: { sessionId: global.session_id } });
    const { StudentId } = wallet;

    wallet.isPaid = true;
    await wallet.save();

    global.session_id = null;

    const student = await Student.findOne({ where: { id: StudentId } });
    student.wallet += wallet.price;
    await student.save();

    const mailOptions = generateChargeConfirmationEmail(
      {
        language,
        email: student.email,
        name: student.name,
        price: wallet.price,
        currency: wallet.currency,
      }
    );
    await sendEmail(mailOptions);

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

      await sendInvoiceWhatsApp({
        to: student.phoneNumber,
        customerName: student.name,
        invoiceNumber: `CHG-${wallet.id}-${Date.now()}`,
        totalAmount: wallet.price,
        currency: wallet.currency,
        paymentMethod: "thawani",
        language,
        invoiceType: "wallet_charge",
        transactionId: wallet.sessionId,
      });
      await sendNotification(
        `تم ايداع مبلغ قدره ${wallet.price} ريال عماني`,
        `An amount of ${wallet.price} Omani Riyals has been deposited.`,
        student.id,
        "student",
        "charge_success",
      );

      await sendNotification(
        `تم ايداع مبلغ قدره ${wallet.price} ريال عماني في رصيد الطالب ${student.name}`,
        `An amount of ${wallet.price} Omani Riyals has been deposited into the student's balance ${student.name}`,
        "1",
        "admin",
        "charge_success",
      );

      // Send WhatsApp notification to all active admins
      try {
        const admins = await AdminModel.findAll({
          where: { isActive: true },
          attributes: ['phone', 'name']
        });

        for (const admin of admins) {
          try {
            await sendWhatsAppTemplate({
              to: admin.phone.startsWith('+') ? admin.phone : `+${admin.phone}`,
              templateName: PAYMENT_TEMPLATES.WALLET_CHARGE_ADMIN_AR,
              variables: [
                student.name,
                `${wallet.price} ${wallet.currency}`,
                `CHG-${wallet.id}-${Date.now()}`,
                `${student.wallet} ${wallet.currency}` // Current balance after adding the charge
              ],
              language: 'ar',
              recipientName: admin.name || 'مدير النظام',
              messageType: 'wallet_charge',
              fallbackToEnglish: false
            });
          } catch (error) {
            console.error(`Failed to send wallet charge notification to admin ${admin.phone}:`, error);
            // Continue with other admins if one fails
          }
        }
      } catch (error) {
        console.error('Error sending admin wallet charge notification:', error);
      }

      return {
        status: 201,
        data: student,
        msg: { arabic: "تم الدفع بنجاح", english: "successful charging" },
      };
    } catch (whatsappError) {
      console.error("❌ فشل إرسال رسالة واتساب لتأكيد شحن الرصيد:", whatsappError.message);
    }
  }

  const { StudentId } = session;
  session.isPaid = true;
  await session.save();
  global.session_id = null;
  if (global.typePay === "package_booking") {
    await checkAndCreateSessions({ studentId: StudentId, packageId: session.PackageId, teacherId: global.TeacherId })
  }
  await FinancialRecord.create({
    amount: session.price,
    currency: session.currency,
    type: "booking",
    TeacherId: global.TeacherId,
    StudentId,
  });

  const teacher = await Teacher.findOne({ where: { id: global.TeacherId } });
  const admin = await AdminModel.findOne();
  const discount = 1 - +admin.profitRatio / 100.0;

  teacher.totalAmount += +session.price * discount;
  teacher.bookingNumbers += 1;
  teacher.hoursNumbers += +session.period;
  await teacher.save();

  const amountAdmin = +session.price * (+admin.profitRatio / 100.0);
  await addToAdminWallet(amountAdmin);

  const student = await Student.findOne({ where: { id: StudentId } });
  await addPointsForPurchase({ studentId: student.id, teacherId: teacher.id });

  const mailOptions = generateInvoiceEmailBody({
    language,
    recipientName: student.name,
    email: student.email,
    itemName: global.typePay,
    price: session.price,
    currency: session.currency,
    date: new Date(),
    role: "student"
  });
  const mailOptionsPoints = generatePointsEmailBody({
    language,
    recipientName: student.name,
    email: student.email,
    newPoints: 3,
    totalPoints: 20,
    date: new Date(),
    role: "student"
  });
  const mailOptionsTeacher = generateInvoiceEmailBody({
    language,
    recipientName: `${teacher.firstName} ${teacher.lastName}`,
    email: teacher.email,
    itemName: global.typePay,
    price: session.price,
    currency: session.currency,
    date: new Date(),
    role: "teacher"
  });
  const mailOptionsTeacherPoints = generatePointsEmailBody({
    language,
    recipientName: teacher.firstName + " " + teacher.lastName,
    email: teacher.email,
    newPoints: 3,
    totalPoints: 20,
    date: new Date(),
    role: "student"
  });


  await sendEmail(mailOptions);
  await sendEmail(mailOptionsPoints);
  await sendEmail(mailOptionsTeacher);
  await sendEmail(mailOptionsTeacherPoints);

  try {
    // const templateName =
    //   language === "ar"
    //     ? PAYMENT_TEMPLATES.PAYMENT_CONFIRMATION_AR
    //     : PAYMENT_TEMPLATES.PAYMENT_CONFIRMATION_EN;

    // await sendWhatsAppTemplate({
    //   to: student.phoneNumber,
    //   templateName,
    //   variables: [
    //     student.name,
    //     session.price.toString(),
    //     session.currency,
    //     session.type,
    //   ],
    //   language: templateName.includes("_ar") ? "ar" : "en_US",
    //   recipientName: student.name,
    //   messageType: "payment_confirmation",
    // });
    // await sendWhatsAppTemplate({
    //   to: teacher.phone,
    //   templateName,
    //   variables: [
    //     teacher.firstName+" "+teacher.lastName,
    //     session.price.toString(),
    //     session.currency,
    //     session.type,
    //   ],
    //   language: templateName.includes("_ar") ? "ar" : "en_US",
    //   recipientName: teacher.firstName+" "+teacher.lastName,
    //   messageType: "payment_confirmation",
    // });

    // student
    await sendInvoiceWhatsApp({
      to: student.phoneNumber,
      customerName: student.name,
      invoiceNumber: `PAY-${session.id}-${Date.now()}`,
      totalAmount: session.price,
      currency: session.currency,
      paymentMethod: "thawani",
      language,
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
        teacherName: teacher.firstName || `${teacher.firstName} ${teacher.lastName}`,
        subject: session.type,
        duration: session.period || "60",
      },
    });

    // teacher
    await sendInvoiceWhatsApp({
      to: teacher.phone,
      customerName: teacher.firstName,
      invoiceNumber: `PAY-${session.id}-${Date.now()}`,
      totalAmount: session.price,
      currency: session.currency,
      paymentMethod: "thawani",
      language,
      invoiceType: global.typePay == "lesson_booking"
        ? "lesson_payment"
        : global.typePay == "lecture_booking"
          ? "lecture_payment"
          : global.typePay == "package_booking"
            ? "package_payment"
            : global.typePay == "test_booking"
              ? "test_payment"
              : global.typePay == "discount_booking"
                ? "discount_payment"
                : "general_payment",
      transactionId: session.sessionId,
      sessionDetails: {
        teacherName: student.name,
        subject: global.typePay,
      },
    });
  } catch (whatsappError) {
    console.error("❌ فشل إرسال رسالة واتساب لتأكيد الدفع:", whatsappError.message);
  }

  // Send payment confirmation to all active admins
  try {
    const admins = await AdminModel.findAll({
      where: { isActive: true },
      attributes: ['phone', 'name']
    });

    for (const admin of admins) {
      try {
        await sendWhatsAppTemplate({
          to: admin.phone.startsWith('+') ? admin.phone : `+${admin.phone}`,
          templateName: PAYMENT_TEMPLATES.PAYMENT_CONFIRMATION_ADMIN_AR,
          variables: [
            student.name,
            getServiceType(session.type, 'ar'),
            `${session.price} ${session.currency}`,
            `PAY-${session.id}-${Date.now()}`
          ],
          language: 'ar',
          recipientName: admin.name || 'مدير النظام',
          messageType: 'payment_confirmation',
          fallbackToEnglish: false
        });
      } catch (error) {
        console.error(`Failed to send payment confirmation to admin ${admin.phone}:`, error);
        // Continue with other admins if one fails
      }
    }
  } catch (error) {
    console.error('Error sending admin payment confirmation:', error);
  }

  await sendBookingNotification({
    type: session.type,
    student,
    teacher,
    adminId: "1",
  });

  return {
    status: 201,
    data: session,
    msg: {
      arabic: "تم الدفع بنجاح من خلال منصة ثواني",
      english: "successful booking from thawani",
    },
  };
};

