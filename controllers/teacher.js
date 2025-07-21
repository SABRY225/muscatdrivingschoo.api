const {
  Teacher,
  Student,
  Parent,
  LangTeachStd,
  TeacherLevel,
  CurriculumTeacher, RemoteSession, F2FSessionStd,
  F2FSessionTeacher, TeacherDay, Certificates,
  Experience, EducationDegree,
  Language, Days, Level, Curriculum,
  Subject, Session, FinancialRecord, Rate, CheckoutRequest, Admin,
  TrainingCategoryType, LimeType, TeacherTypes,
  TeacherLimits, TeacherLecture, TeacherLesson,
  TeacherQuestion, TeacherQuestionChoose,
  Package, SubjectCategory,
  Tests, TeacherRefund,
  ExchangeRequestsTeacher,
  Class,
  AdsTeachers,
  Career,
  StudentPackage,
  StudentTest,
  StudentDiscount
} = require("../models");
const { validateTeacher, loginValidation } = require("../validation");
const { serverErrs } = require("../middlewares/customError");
const generateRandomCode = require("../middlewares/generateCode");
const sendEmail = require("../middlewares/sendEmail");
const { compare, hash } = require("bcrypt");
const generateToken = require("../middlewares/generateToken");
const path = require("path");
const fs = require("fs");
const TeacherSubject = require("../models/TeacherSubject");
const { Op, fn, col, literal } = require("sequelize");
const { db } = require("../firebaseConfig");
const CC = require("currency-converter-lt");
const dotenv = require("dotenv");
const {
  generateConfirmEmailBody,
  generateWelcomeEmailBody,
  generateCertificateHTML,
} = require("../utils/EmailBodyGenerator");
const {
  generateConfirmEmailSMSBody,
  generateWelcomeSMSBody,
} = require("../utils/SMSBodyGenerator");
const { sendWhatsAppTemplate } = require("../utils/whatsapp");
const sendWhatsAppVerificationCode = require("../utils/sendWhatsAppVerificationCode");
const Discounts = require("../models/Discounts");
const {
  sendNotification,
  sendBookingNotification,
  sendLessonNotification,
  sendGeneralNotification,
} = require("../services/shared/notification.service");
const { sendLessonEmail } = require("../utils/sendEmailLessonMeeting");
const Invite = require("../models/Invite");
const Evaluations = require("../models/Evaluation");
const Lessons = require("../models/Lesson");
const StudentLecture = require("../models/StudentLecture");
const convertCurrency = require("../utils/convertCurrency");
const Notification = require("../models/Notification");
const { VERIFICATION_TEMPLATES } = require("../config/whatsapp-templates");

dotenv.config();
let currencyConverter = new CC();

const signUp = async (req, res, next) => {
  try {
    const { email, phoneNumber, language } = req.body;

    await validateTeacher.validate({ email });

    // رسالة الخطأ الموحدة
    const errorMessage = {
      arabic:
        "عفوا ، الحساب غير صالح ، نرجو مراجعه بياناتك مره اخري لكي يتم انشاء حسابك بشكل ناجح",
      english:
        "Sorry, the account is not valid. Please review your data again so that your account can be created successfully.",
    };
    const errorMessage2 = {
      arabic:
        "عفوا , هذا البريد مستخدم سابقا",
      english:
        "Sorry, this email address has already been used.",
    };

    // التحقق من وجود البريد في أي حساب آخر (سواء كان مكتمل التسجيل أو لا)
    const [teacherExists, studentExists, parentExists] = await Promise.all([
      Teacher.findOne({ where: { email } }),
      Student.findOne({ where: { email } }),
      Parent.findOne({ where: { email } }),
    ]);

    if (teacherExists || studentExists || parentExists) {
      throw serverErrs.BAD_REQUEST(errorMessage2);
    }

    const code = generateRandomCode();

    // إنشاء حساب جديد للمعلم
    await Teacher.create({
      email,
      phone: phoneNumber,
      registerCode: code,
    });

    // إرسال كود التفعيل
    try {
      const mailOptions = generateConfirmEmailBody(code, language, email);
      const smsOptions = {
        body: generateConfirmEmailSMSBody(language, code),
        to: phoneNumber,
      };

      sendEmail(mailOptions, smsOptions);
      await sendWhatsAppVerificationCode(phoneNumber, code, language);
    } catch (sendErr) {
      console.error("Error sending verification code:", sendErr.message);
      // يمكنك تجاهل الخطأ أو إعلام المستخدم حسب الحاجة
    }

    res.status(201).send({
      status: 201,
      msg: {
        arabic: "تم ارسال الإيميل بنجاح",
        english: "Email sent successfully",
      },
    });
  } catch (error) {
    console.error("SignUp Error:", error.message);
    next(error);
  }
};



const verifyCode = async (req, res) => {
  const { registerCode, email, long, lat } = req.body;

  const student = await Student.findOne({
    where: {
      email,
      isRegistered: true,
    },
  });

  const parent = await Parent.findOne({
    where: {
      email,
    },
  });

  const registeredTeacher = await Teacher.findOne({
    where: {
      email,
      isRegistered: true,
    },
  });
  if (registeredTeacher)
    throw serverErrs.BAD_REQUEST({
      //arabic: "الإيميل مستخدم سابقا",
      //english: "email is already used",
      arabic: "عفوا ، الحساب غير صالح ، نرجو مراجعه بياناتك مره اخري لكي يتم انشاء حسابك بشكل ناجح",
      english: "Sorry, the account is not valid. Please review your data again so that your account can be created successfully.",
    });
  if (student)
    throw serverErrs.BAD_REQUEST({
      //arabic: "الإيميل مستخدم سابقا",
      //english: "email is already used",
      arabic: "عفوا ، الحساب غير صالح ، نرجو مراجعه بياناتك مره اخري لكي يتم انشاء حسابك بشكل ناجح",
      english: "Sorry, the account is not valid. Please review your data again so that your account can be created successfully.",
    });
  if (parent)
    throw serverErrs.BAD_REQUEST({
      //arabic: "الإيميل مستخدم سابقا",
      //english: "email is already used",
      arabic: "عفوا ، الحساب غير صالح ، نرجو مراجعه بياناتك مره اخري لكي يتم انشاء حسابك بشكل ناجح",
      english: "Sorry, the account is not valid. Please review your data again so that your account can be created successfully.",
    });

  const teacher = await Teacher.findOne({
    where: { email, registerCode, },
  });

  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "الكود خاطئ",
      english: "code is wrong",
    });

  await teacher.update({ isRegistered: true, long, lat });

  res.send({
    status: 201,
    data: teacher,
    msg: {
      arabic: "تم التحقق من الكود واضافة الموقع بنجاح",
      english: "Verified code and add address successfully",
    },
  });
};

const signPassword = async (req, res, next) => {
  try {
    const { email, password, language } = req.body;

    let teacher = await Teacher.findOne({
      where: { email, isRegistered: true },
    });

    if (!teacher) {
      throw serverErrs.BAD_REQUEST({
        arabic: "الإيميل مستخدم سابقا",
        english: "Email is already used",
      });
    }

    const hashedPassword = await hash(password, 12);
    await teacher.update({ password: hashedPassword });

    const token = await generateToken({
      userId: teacher.id,
      name: teacher.firstName,
      role: "teacher",
    });

    await sendNotification(
      "انضمام معلم جديد الي المنصة",
      "A new teacher joins the platform",
      "1",
      "register_teacher",
      "admin"
    );

    const mailOptions = generateWelcomeEmailBody(
      language,
      `${teacher.firstName} ${teacher.lastName}`,
      email
    );

    const smsOptions = {
      body: generateWelcomeSMSBody(language, `${teacher.firstName} ${teacher.lastName}`),
      to: teacher.phone,
    };

    sendEmail(mailOptions, smsOptions);

    try {
      const { VERIFICATION_TEMPLATES } = require("../config/whatsapp-templates");
      const templateName = language === "ar"
        ? VERIFICATION_TEMPLATES.WELCOME_TEACHER_AR
        : VERIFICATION_TEMPLATES.WELCOME_TEACHER_EN;
      const result = await sendWhatsAppTemplate({
        to: teacher.phone,
        templateName,
        variables: [teacher.firstName + " " + teacher.lastName || "المدرب"],
        language: language === "ar" ? "ar" : "en_US",
        recipientName: teacher.firstName + " " + teacher.lastName || "المدرب",
        messageType: "welcome",
        fallbackToEnglish: true,
      });
      if (result.success) {
        console.log("✅ تم إرسال رسالة الترحيب للمعلم بنجاح");
      } else {
        console.error(`❌ فشل إرسال رسالة الترحيب للمعلم: ${result.error}`);
      }
    } catch (err) {
      console.error("❌ خطأ أثناء إرسال رسالة الترحيب للمعلم عبر واتساب:", err.message);
    }

    res.status(201).json({
      data: teacher.toJSON(),
      msg: { arabic: "تم التسجيل بنجاح", english: "Successful sign up" },
      token,
    });
  } catch (error) {
    next(error);
  }
};


const signAbout = async (req, res) => {
  const { teacherId } = req.params;
  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجود",
      english: "Invalid trainerId! ",
    });

  if (teacher.id != req.user.userId)
    throw serverErrs.BAD_REQUEST({
      arabic: "لا يوجد حق بالوصول",
      english: "No Auth ",
    });

  const { firstName, lastName, gender, dateOfBirth, phone, country, city } =
    req.body;
  let { languages } = req.body;
  if (typeof languages === "string") {
    languages = JSON.parse(languages);
  }
  await teacher.update({
    firstName,
    lastName,
    gender,
    dateOfBirth,
    phone,
    country,
    city,
  });
  const langTeacher = await LangTeachStd.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });

  await LangTeachStd.bulkCreate(languages).then(() =>
    console.log("LangTeachStd data have been created")
  );

  const langTeachers = await LangTeachStd.findAll({
    where: {
      TeacherId: teacher.id,
    },
    include: { all: true },
  });
  await teacher.save();
  const firstNames = teacher.firstName;
  const lastNames = teacher.lastName;

  // إرسال إشعار واتساب عند تعديل البيانات الشخصية للمعلم
  try {
    // رسالة اكتمال التسجيل
    const completeTemplate = teacher.language === "ar" ? PAYMENT_TEMPLATES.TEACHER_REGISTRATION_COMPLETE_AR : PAYMENT_TEMPLATES.TEACHER_REGISTRATION_COMPLETE_EN;
    await sendWhatsAppTemplate({
      to: teacher.phone,
      templateName: completeTemplate,
      variables: [teacher.firstName + " " + teacher.lastName || "المدرب"],
      language: completeTemplate.includes("_ar") ? "ar" : "en_US",
      recipientName: teacher.firstName + " " + teacher.lastName || "المدرب"
    });
    // رسالة الترحيب عند التسجيل الجديد
    const welcomeTemplate = teacher.language === "ar" ? PAYMENT_TEMPLATES.WELCOME_TEACHER_AR : PAYMENT_TEMPLATES.WELCOME_TEACHER_EN;
    await sendWhatsAppTemplate({
      to: teacher.phone,
      templateName: welcomeTemplate,
      variables: [teacher.firstName + " " + teacher.lastName || "المدرب"],
      language: welcomeTemplate.includes("_ar") ? "ar" : "en_US",
      recipientName: teacher.firstName + " " + teacher.lastName || "المدرب"
    });
  } catch (err) {
    console.error("خطأ إرسال واتساب (تسجيل/ترحيب):", err.message);
  }
  res.send({
    status: 201,
    data: { firstName: firstNames, lastName: lastNames },
    msg: {
      arabic: "تم تسجيل معلوماتك بنجاح",
      english: "successful sign about data",
    },
  });
};

const signAdditionalInfo = async (req, res) => {
  const { teacherId } = req.params;
  const teacher = await Teacher.findOne({
    where: { id: teacherId },
    attributes: { exclude: ["password"] },
  });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجود",
      english: "Invalid trainerId! ",
    });

  if (teacher.id != req.user.userId)
    throw serverErrs.BAD_REQUEST({
      arabic: "لا يوجد حق بالوصول",
      english: "No Auth ",
    });

  const {
    haveCertificates,
    haveExperience,
    experienceYears,
    favStdGender,
    favHours,
    articleExperience,
    bank_name,
    acc_name,
    acc_number,
    iban,
    paypal_acc,
  } = req.body;

  let { levels, curriculums, trainingcategorytypes, limetypes } = req.body;
  if (typeof levels === "string") {
    levels = JSON.parse(levels);
  }
  if (typeof curriculums === "string") {
    curriculums = JSON.parse(curriculums);
  }

  if (typeof trainingcategorytypes === "string") {
    trainingcategorytypes = JSON.parse(trainingcategorytypes);
  }

  if (typeof limetypes === "string") {
    limetypes = JSON.parse(limetypes);
  }

  await teacher.update({
    haveCertificates,
    haveExperience,
    experienceYears,
    favStdGender,
    favHours,
    articleExperience,
    bank_name,
    acc_name,
    acc_number,
    iban,
    paypal_acc,
  });
  const curriculumTeacher = await CurriculumTeacher.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });

  const teacherLevel = await TeacherLevel.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });

  const teacherType = await TeacherTypes.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });

  const teacherLimit = await TeacherLimits.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });


  await TeacherLevel.bulkCreate(levels).then(() =>
    console.log("Teacher Level data have been created")
  );
  await CurriculumTeacher.bulkCreate(curriculums).then(() =>
    console.log("Curriculum Teacher data have been created")
  );

  await TeacherTypes.bulkCreate(trainingcategorytypes).then(() =>
    console.log("Training Category Type TeachStd data have been created")
  );

  await TeacherLimits.bulkCreate(limetypes).then(() =>
    console.log("Limit Type TeachStd data have been created")
  );

  const teacherLevels = await TeacherLevel.findAll({
    where: {
      TeacherId: teacher.id,
    },
    include: { all: true },
  });

  const curriculumTeachers = await CurriculumTeacher.findAll({
    where: {
      TeacherId: teacher.id,
    },
    include: { all: true },
  });

  const typesTeachers = await TeacherTypes.findAll({
    where: {
      TeacherId: teacher.id,
    },
    include: { all: true },
  });

  const limitTeachers = await TeacherLimits.findAll({
    where: {
      TeacherId: teacher.id,
    },
    include: { all: true },
  });

  await teacher.save();

  res.send({
    status: 201,
    data: { teacher, teacherLevels, curriculumTeachers, typesTeachers, limitTeachers },
    msg: {
      arabic: "تم تسجيل معلومات إضافية بنجاح",
      english: "successful sign Additional Information! ",
    },
  });
};

const getSingleTeacher = async (req, res) => {
  const { teacherId } = req.params;
  const teacher = await Teacher.findOne({
    where: { id: teacherId },
    include: [
      { model: LangTeachStd, include: [Language] },
      { model: Experience },
      { model: EducationDegree },
      { model: Certificates },
      { model: TeacherLecture },
      { model: TeacherLesson },
      { model: TeacherDay, include: [Days] },
      { model: TeacherLevel, include: [Level] },
      { model: CurriculumTeacher, include: [Curriculum] },
      { model: TeacherSubject, include: [Subject] },
      { model: TeacherLimits, include: [LimeType] },
      { model: TeacherTypes, include: [TrainingCategoryType] },
      { model: Package, },
      { model: RemoteSession },
      { model: F2FSessionStd },
      { model: F2FSessionTeacher },
      { model: Rate },
      { model: Discounts },
    ],
    attributes: { exclude: ["password"] },
  });

  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجود",
      english: "Invalid trainerId! ",
    });

  res.send({
    status: 201,
    data: teacher,
    msg: {
      arabic: "تم إرجاع معلومات المدرب بنجاح",
      english: "successful get single trainer",
    },
  });
};

const uploadImage = async (req, res) => {
  const { teacherId } = req.params;

  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجود",
      english: "Invalid teacherId! ",
    });

  if (teacher.id != req.user.userId)
    throw serverErrs.BAD_REQUEST({
      arabic: "لا يوجد حق بالوصول",
      english: "No Auth ",
    });

  const clearImage = (filePath) => {
    filePath = path.join(__dirname, "..", `images/${filePath}`);
    fs.unlink(filePath, (err) => {
      if (err) throw serverErrs.BAD_REQUEST("Image not found");
    });
  };

  if (teacher.image) {
    clearImage(teacher.image);
  }
  await teacher.update({ image: req.files[0].filename });
  res.send({
    status: 201,
    data: req.files[0].filename,
    msg: {
      arabic: "تم إدراج الصورة بنجاح",
      english: "uploaded image successfully",
    },
  });
};


const addSubjects = async (req, res) => {
  const { teacherId } = req.params;

  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجود",
      english: "Invalid teacherId! ",
    });

  if (teacher.id != req.user.userId)
    throw serverErrs.BAD_REQUEST({
      arabic: "لا يوجد حق بالوصول",
      english: "No Auth ",
    });

  let { remote, f2fStudent, f2fTeacher, subjects } = req.body;
  if (typeof subjects === "string") {
    subjects = JSON.parse(subjects);
  }
  if (typeof remote === "string") {
    remote = JSON.parse(remote);
  }
  if (typeof f2fStudent === "string") {
    f2fStudent = JSON.parse(f2fStudent);
  }
  if (typeof f2fTeacher === "string") {
    f2fTeacher = JSON.parse(f2fTeacher);
  }
  let currency = "OMR";
  if (remote || f2fStudent || f2fTeacher) {
    currency = (remote?.currency || f2fStudent?.currency || f2fTeacher?.currency || "OMR");
  }
  const conversionRate = await convertCurrency(1, currency, "OMR")

  await TeacherSubject.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });

  await RemoteSession.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });
  await F2FSessionStd.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });
  await F2FSessionTeacher.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });
  await TeacherSubject.bulkCreate(subjects).then(() =>
    console.log("Teacher Subjects data have been created")
  );
  if (remote) {
    remote["priceAfterDiscount"] =
      +remote.price - +remote.price * (+remote.discount / 100.0);
    remote["priceAfterDiscount"] = +remote.priceAfterDiscount * conversionRate;
    remote["price"] = +remote.price * conversionRate;
    remote.currency = "OMR";
    await RemoteSession.create(remote).then(() =>
      console.log("Teacher remote session has been saved")
    );
  }
  if (f2fStudent) {
    f2fStudent["priceAfterDiscount"] =
      +f2fStudent.price - +f2fStudent.price * (+f2fStudent.discount / 100.0);
    f2fStudent["priceAfterDiscount"] =
      +f2fStudent.priceAfterDiscount * conversionRate;
    f2fStudent["price"] = +f2fStudent.price * conversionRate;
    f2fStudent.currency = "OMR";
    await F2FSessionStd.create(f2fStudent).then(() =>
      console.log("teacher session at home student has been saved")
    );
  }
  if (f2fTeacher) {
    f2fTeacher["priceAfterDiscount"] =
      +f2fTeacher.price - +f2fTeacher.price * (+f2fTeacher.discount / 100.0);
    f2fTeacher["priceAfterDiscount"] =
      +f2fTeacher.priceAfterDiscount * conversionRate;
    f2fTeacher["price"] = +f2fTeacher.price * conversionRate;
    f2fTeacher.currency = "OMR";
    await F2FSessionTeacher.create(f2fTeacher).then(() =>
      console.log("Teacher session at teacher home has been saved")
    );
  }

  const teacherSubjects = await TeacherSubject.findAll({
    where: {
      TeacherId: teacherId,
    },
    include: {
      all: true,
    },
  });

  const remoteSession = await RemoteSession.findAll({
    where: {
      TeacherId: teacherId,
    },
    include: {
      all: true,
    },
  });

  const f2fStudentSession = await F2FSessionStd.findAll({
    where: {
      TeacherId: teacherId,
    },
    include: {
      all: true,
    },
  });

  const f2fTeacherSession = await F2FSessionTeacher.findAll({
    where: {
      TeacherId: teacherId,
    },
    include: {
      all: true,
    },
  });
  res.send({
    status: 201,
    data: {
      teacherSubjects,
      remoteSession,
      f2fStudentSession,
      f2fTeacherSession,
    },
    msg: {
      arabic: "تم إضافة مادة ونوع الجلسة بنجاح",
      english: "added subjects and session type successfully",
    },
  });
};

const signAvailability = async (req, res) => {
  const { teacherId } = req.params;
  const teacher = await Teacher.findOne({
    where: { id: teacherId },
    attributes: { exclude: ["password"] },
  });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجود",
      english: "Invalid trainerId! ",
    });

  if (teacher.id != req.user.userId)
    throw serverErrs.BAD_REQUEST({
      arabic: "لا يوجد حق بالوصول",
      english: "No Auth ",
    });

  const { timeZone } = req.body;
  let { teacherDayes } = req.body;

  if (typeof teacherDayes === "string") {
    teacherDayes = JSON.parse(teacherDayes);
  }

  await teacher.update({
    timeZone,
  });
  const teacherDay = await TeacherDay.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });

  await TeacherDay.bulkCreate(teacherDayes).then(() =>
    console.log("TeacherDay data have been created")
  );

  const dayesTeacher = await TeacherDay.findAll({
    where: {
      TeacherId: teacher.id,
    },
    include: { all: true },
    attributes: { exclude: ["password"] },
  });

  await teacher.save();
  res.send({
    status: 201,
    data: { teacher, dayesTeacher },
    msg: {
      arabic: "تم تسجيل الوقت المتاح بنجاح",
      english: "successful sign availability!",
    },
  });
};

const createExchangeRequestsTeacher = async (req, res) => {
  const { amount, currency, TeacherId, reason } = req.body;
  const newExchange = await ExchangeRequestsTeacher.create(
    {
      amount: amount,
      currency: currency,
      status: "-1",
      TeacherId: TeacherId,
      AdminId: "1",
      reason: reason,
    },
    {
      returning: true,
    }
  );
  await newExchange.save();
  res.send({
    status: 201,
    data: newExchange,
    msg: {
      arabic: "تم إنشاء طلب صرف جديده بنجاح",
      english: "successful create new Exchange Requests Teacher",
    },
  });
};

const addDescription = async (req, res) => {
  const { teacherId } = req.params;

  const teacher = await Teacher.findOne({
    where: { id: teacherId },
    attributes: { exclude: ["password"] },
  });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجود",
      english: "Invalid trainerId! ",
    });

  if (teacher.id != req.user.userId)
    throw serverErrs.BAD_REQUEST({
      arabic: "لا يوجد حق بالوصول",
      english: "No Auth ",
    });

  const { shortHeadlineAr, shortHeadlineEn, descriptionAr, descriptionEn } =
    req.body;

  const updatedTeacher = await teacher.update({
    shortHeadlineAr,
    shortHeadlineEn,
    descriptionAr,
    descriptionEn,
  });
  res.send({
    status: 201,
    data: updatedTeacher,
    msg: {
      arabic: "تم إضافة وصف بنجاح",
      english: "added description successfully",
    },
  });
};


const PersonalDescription = async (req, res) => {
  const { teacherId } = req.params;

  // التأكد من وجود المدرب
  const teacher = await Teacher.findOne({
    where: { id: teacherId },
    attributes: { exclude: ["password"] },
  });

  if (!teacher) {
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجود",
      english: "Trainer not found",
    });
  }

  // التحقق من الصلاحيات
  if (teacher.id !== req.user.userId) {
    throw serverErrs.UNAUTHORIZED({
      arabic: "لا يوجد صلاحية للوصول",
      english: "Unauthorized access",
    });
  }

  const {
    descriptionAr = teacher.descriptionAr,
    videoLink = teacher.videoLink,
    invitationLink,
  } = req.body;

  // التحديث
  await teacher.update({
    descriptionAr,
    videoLink,
  });

  if (invitationLink) {
    const inviter = await Invite.findOne({ where: { link: invitationLink } });

    if (inviter) {
      inviter.amountPoints = Number(inviter.amountPoints) + 3;
      await inviter.save();
    }
  }

  res.status(200).send({
    status: 200,
    data: teacher,
    msg: {
      arabic: "تم تحديث الوصف بنجاح",
      english: "Description updated successfully",
    },
  });
};



const signResume = async (req, res) => {
  const { teacherId } = req.params;
  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجود",
      english: "Invalid trainerId! ",
    });

  if (teacher.id != req.user.userId)
    throw serverErrs.BAD_REQUEST({
      arabic: "لا يوجد حق بالوصول",
      english: "No Auth ",
    });

  let { certificates, experiences, educationDegrees } = req.body;

  if (typeof certificates === "string") {
    certificates = JSON.parse(certificates);
  }
  if (typeof experiences === "string") {
    experiences = JSON.parse(experiences);
  }
  if (typeof educationDegrees === "string") {
    educationDegrees = JSON.parse(educationDegrees);
  }

  const teacherCertificate = await Certificates.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });

  const teacherExperience = await Experience.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });

  const teacherEducationDegree = await EducationDegree.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });

  await Certificates.bulkCreate(certificates).then(() =>
    console.log("Certificates data have been created")
  );
  await Experience.bulkCreate(experiences).then(() =>
    console.log("Experience data have been created")
  );
  await EducationDegree.bulkCreate(educationDegrees).then(() =>
    console.log("EducationDegree data have been created")
  );

  const teacherCertificates = await Certificates.findAll({
    where: {
      TeacherId: teacher.id,
    },
    include: { all: true },
  });

  const teacherExperiences = await Experience.findAll({
    where: {
      TeacherId: teacher.id,
    },
    include: { all: true },
  });

  const teacherEducationDegrees = await EducationDegree.findAll({
    where: {
      TeacherId: teacher.id,
    },
    include: { all: true },
  });
  await teacher.save();
  res.send({
    status: 201,
    data: { teacherCertificates, teacherExperiences, teacherEducationDegrees },
    msg: {
      arabic: "تم إدخال معلومات السيرة الذاتية بنجاح",
      english: "successful sign Resume Information!",
    },
  });
};

const signVideoLink = async (req, res) => {
  const { teacherId } = req.params;
  const teacher = await Teacher.findOne({
    where: { id: teacherId },
    attributes: { exclude: ["password"] },
  });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجود",
      english: "Invalid trainerId! ",
    });

  if (teacher.id != req.user.userId)
    throw serverErrs.BAD_REQUEST({
      arabic: "لا يوجد حق بالوصول",
      english: "No Auth ",
    });

  const { videoLink } = req.body;

  await teacher.update({
    videoLink,
  });

  await teacher.save();
  res.send({
    status: 201,
    data: teacher,
    msg: {
      arabic: "تم إدراج الفيديو بنجاح",
      english: "successful sign VideoLink Information!",
    },
  });
};
// Modify by eng.reem.shwky@gmail.com
const searchTeacherFilterSide = async (req, res) => {

  const { videoLink, gender, LanguageId, CurriculumId } = req.body;
  const { currency } = req.query;
  let whereTeacher = { isVerified: 1, isRegistered: true };
  const whereInclude = [
    { model: F2FSessionTeacher, },
    { model: F2FSessionStd, },
    { model: RemoteSession, },
    { model: TeacherLimits, include: [LimeType] },
    { model: TeacherTypes, include: [TrainingCategoryType] },
    //{ modal: Tests ,            include: [Level]},
  ];
  if (videoLink) {
    whereTeacher["videoLink"] = { [Op.not]: "" };
  }
  if (gender == "male" || gender == "female") {
    whereTeacher["gender"] = gender;
  }
  if (LanguageId) {
    whereInclude.push({
      model: LangTeachStd,
      where: { LanguageId: 1 },
    });
  } else {
    whereInclude.push({
      model: LangTeachStd,
    });
  }

  if (CurriculumId !== "all") {
    whereInclude.push({
      model: CurriculumTeacher,
      where: { CurriculumId: + CurriculumId },
    });
  }

  const teachers = await Teacher.findAll({
    where: whereTeacher,
    include: whereInclude,
    attributes: { exclude: ["password"] },
  });

  await Promise.all(
    teachers.map(async (teacher) => {
      try {
        if (teacher.RemoteSession !== null) {
          const newPriceRemote = await currencyConverter
            .from(teacher.RemoteSession.currency)
            .to(currency)
            .amount(+teacher.RemoteSession.priceAfterDiscount)
            .convert();
          teacher.RemoteSession.priceAfterDiscount = newPriceRemote;
          teacher.RemoteSession.currency = currency;
        }
        if (teacher.F2FSessionStd !== null) {
          const newPriceF2FStudent = await currencyConverter
            .from(teacher.F2FSessionStd.currency)
            .to(currency)
            .amount(+teacher.F2FSessionStd.priceAfterDiscount)
            .convert();
          teacher.F2FSessionStd.priceAfterDiscount = newPriceF2FStudent;
          teacher.F2FSessionStd.currency = currency;
        }
        if (teacher.F2FSessionTeacher !== null) {
          const newPriceF2FTeacher = await currencyConverter
            .from(teacher.F2FSessionTeacher.currency)
            .to(currency)
            .amount(+teacher.F2FSessionTeacher.priceAfterDiscount)
            .convert();
          teacher.F2FSessionTeacher.priceAfterDiscount = newPriceF2FTeacher;
          teacher.F2FSessionTeacher.currency = currency;
        }
      } catch (error) {
        console.error(error);
      } finally {
        return teacher;
      }
    })
  );

  res.send({
    status: 201,
    data: teachers,
    msg: {
      arabic: "تم البحث بنجاح",
      english: "successful search",
    },
  });
};

const searchTeacherFilterTop = async (req, res) => {
  const { LevelId } = req.body;
  let { subjects } = req.body;
  const { currency } = req.query;

  if (typeof subjects === "string") {
    subjects = JSON.parse(subjects);
  }

  const whereInclude = [
    { model: F2FSessionTeacher, },
    { model: F2FSessionStd, },
    { model: RemoteSession, },
    { model: TeacherLimits, include: [LimeType] },
    { model: TeacherTypes, include: [TrainingCategoryType] },
  ];

  if (LevelId !== "all") {
    whereInclude.push({
      model: TeacherLevel,
      where: { LevelId: +LevelId },
    });
  }

  if (subjects.length > 0) {
    whereInclude.push({
      model: TeacherSubject,
      where: {
        SubjectId: {
          [Op.or]: subjects,
        },
      },
    });
  }

  const teachers = await Teacher.findAll({
    where: { isVerified: 1 },
    include: whereInclude,
    attributes: { exclude: ["password"] },
  });

  await Promise.all(
    teachers.map(async (teacher) => {
      if (teacher.RemoteSession) {
        const newPriceRemote = await currencyConverter
          .from(teacher.RemoteSession.currency)
          .to(currency)
          .amount(+teacher.RemoteSession.priceAfterDiscount)
          .convert();
        teacher.RemoteSession.priceAfterDiscount = newPriceRemote;
        teacher.RemoteSession.currency = currency;
      }
      if (teacher.F2FSessionStd) {
        const newPriceF2FStudent = await currencyConverter
          .from(teacher.F2FSessionStd.currency)
          .to(currency)
          .amount(+teacher.F2FSessionStd.priceAfterDiscount)
          .convert();
        teacher.F2FSessionStd.priceAfterDiscount = newPriceF2FStudent;
        teacher.F2FSessionStd.currency = currency;
      }
      if (teacher.F2FSessionTeacher) {
        const newPriceF2FTeacher = await currencyConverter
          .from(teacher.F2FSessionTeacher.currency)
          .to(currency)
          .amount(+teacher.F2FSessionTeacher.priceAfterDiscount)
          .convert();
        teacher.F2FSessionTeacher.priceAfterDiscount = newPriceF2FTeacher;
        teacher.F2FSessionTeacher.currency = currency;
      }
      return teacher;
    })
  );

  res.send({
    status: 201,
    data: teachers,
    msg: {
      arabic: "تم البحث بنجاح",
      english: "successful search",
    },
  });
};

const resetPassword = async (req, res) => {
  const { TeacherId } = req.params;
  const { oldPassword, newPassword } = req.body;

  const teacher = await Teacher.findOne({
    where: { id: TeacherId },
    include: { all: true },
  });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجود",
      english: "trainer not found",
    });
  const result = await compare(oldPassword, teacher?.password);
  if (!result)
    throw serverErrs.BAD_REQUEST({
      arabic: "كلمة المرور غير صحيحة",
      english: "Old password is wrong",
    });
  const hashedPassword = await hash(newPassword, 12);
  await teacher.update({ password: hashedPassword });
  res.send({
    status: 201,
    data: teacher,
    msg: {
      arabic: "تم تحديث كلمة المرور بنجاح",
      english: "successful update trainer password",
    },
  });
};

const getAllSessions = async (req, res) => {
  const { TeacherId } = req.params;

  const lessons = await Session.findAll({
    where: {
      TeacherId,
      isPaid: true,
    },
    include: [{ model: Student }],
  });

  res.send({
    status: 201,
    data: lessons,
    msg: {
      arabic: "تم إرجاع جميع الدروس بنجاح",
      english: "successful get all lessons",
    },
  });
};

const getMyStudents = async (req, res) => {
  const { TeacherId } = req.params;

  const students = await Student.findAll({
    include: [
      {
        model: Session,
        on: Session.StudentId,
        where: {
          TeacherId: TeacherId,
        },
        attributes: [],
      },
    ],
    attributes: { exclude: ["password"] },
  });
  console.log(students);
  res.send({
    status: 201,
    data: students,
    msg: {
      arabic: "تم ارجاع جميع تلاميذ المدرب بنجاح",
      english: "successful get all teacher students",
    },
  });
};

const getCredit = async (req, res) => {
  const { TeacherId } = req.params;

  const teacher = await Teacher.findOne({
    where: {
      id: TeacherId,
    },
  });

  res.send({
    status: 201,
    data: { totalAmount: teacher.totalAmount, dues: teacher.dues },
    msg: {
      arabic: "تم إرجاع مستحقات المدرب بنجاح",
      english: "successful get all trainer credit & dues",
    },
  });
};

const getTeacherFinancial = async (req, res) => {
  const { TeacherId } = req.params;

  const records = await FinancialRecord.findAll({
    where: {
      TeacherId,
    },
  });

  res.send({
    status: 201,
    data: records,
    msg: {
      arabic: "تم إرجاع السجل المالي بنجاح",
      english: "successful get all financial records",
    },
  });
};

const updateNotification = async (req, res) => {
  const { TeacherId } = req.params;
  const notificationsRef = db.collection("Notifications");
  const query = notificationsRef.where("TeacherId", "==", TeacherId);

  query.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const notificationRef = notificationsRef.doc(doc.id);
      notificationRef.update({ seen: true });
    });
  });

  res.send({
    status: 201,
    msg: {
      arabic: "تم رؤية جميع الإشعارات ",
      english: "successful seen for all Notification",
    },
  });
};

const getTeacherRate = async (req, res) => {
  const { TeacherId } = req.params;
  const rates = await Rate.findAll({
    where: {
      TeacherId,
    },
  });

  res.send({
    status: 201,
    data: rates,
    msg: {
      arabic: "تم ارجاع تقييم المدرب بنجاح",
      english: "successful get trainer rate",
    },
  });
};

const acceptLesson = async (req, res) => {
  const { TeacherId } = req.params;
  const { SessionId } = req.body;

  const session = await Session.findOne({
    where: {
      id: SessionId,
      TeacherId,
    },
  });

  if (!session)
    throw serverErrs.BAD_REQUEST({
      arabic: "الجلسة غير موجودة",
      english: "session not found",
    });

  await session.update({ teacherAccept: true });


  res.send({
    status: 201,
    msg: {
      arabic: "تم تعديل الجلسة بنجاح",
      english: "successful update session",
    },
  });
};

const endLesson = async (req, res) => {
  try {
    const { TeacherId } = req.params;
    const { SessionId, lang = "en" } = req.body;

    const session = await Session.findOne({
      where: {
        id: SessionId,
        TeacherId,
      },
    });

    if (!session)
      return res.status(400).send({
        status: 400,
        message: {
          arabic: "الجلسة غير موجودة",
          english: "Session not found",
        },
      });

    const now = Date.now();
    await session.update({ endedAt: now });

    const [student, teacher] = await Promise.all([
      Student.findByPk(session.StudentId),
      Teacher.findByPk(session.TeacherId),
    ]);


    const message = lang === "ar" ? "انتهى الدرس الآن." : "The lesson is now finished.";


    // إرسال الإيميلات بالتوازي
    await Promise.all([
      sendLessonNotification({
        type: "lesson_end",
        student,
        teacher,
        language: lang,
        lessonDetails: {
          date: session.date,
          time: session.time,
        },
      }),
      sendLessonEmail(student.email, lang, message, "end"),
      sendLessonEmail(teacher.email, lang, message, "end"),
    ]);

    return res.status(201).send({
      status: 201,
      msg: {
        arabic: "تم إنهاء الجلسة بنجاح",
        english: "Lesson ended successfully",
      },
    });
  } catch (error) {
    return res.status(500).send({
      status: 500,
      error: error.message,
      msg: {
        arabic: "حدث خطأ ما أثناء إنهاء الجلسة",
        english: "An error occurred while ending the session",
      },
    });
  }
};
const requestCheckout = async (req, res) => {
  try {
    const { TeacherId } = req.params;
    const { amount, method, phoneNumber, bankInfo } = req.body;

    const teacher = await Teacher.findOne({ where: { id: TeacherId } });
    if (!teacher) {
      return res.status(400).send({
        arabic: "المدرب غير موجود",
        english: "Trainer not found",
      });
    }

    const totalAmount = Number(teacher.totalAmount);
    const dues = Number(teacher.dues);

    if (isNaN(totalAmount) || isNaN(dues)) {
      return res.status(400).send({
        arabic: "خطأ في البيانات المالية للمدرب",
        english: "Invalid financial data for the trainer",
      });
    }

    const availableAmount = totalAmount - dues;

    if (!Number(amount) || Number(amount) <= 0 || Number(amount) > availableAmount) {
      return res.status(400).send({
        arabic: "قيمة المبلغ غير صالحة",
        english: "Invalid amount value",
      });
    }

    if (!method || !["phone", "bank"].includes(method)) {
      return res.status(400).send({
        msg: {
          arabic: "طريقة الدفع غير صالحة",
          english: "Invalid payment method",
        },
      });
    }

    let checkoutData = {
      TeacherId,
      value: Number(amount),
      method,
    };

    if (method === "phone") {
      if (!phoneNumber) {
        return res.status(400).send({
          msg: {
            arabic: "رقم الهاتف مطلوب",
            english: "Phone number is required",
          },
        });
      }
      checkoutData.phoneNumber = phoneNumber;
    }

    if (method === "bank") {
      const { bankName, accountNumber, iban } = bankInfo || {};
      if (!bankName || !accountNumber || !iban) {
        return res.status(400).send({
          msg: {
            arabic: "بيانات الحساب البنكي مطلوبة",
            english: "Bank account info is required",
          },
        });
      }
      checkoutData.bankName = bankName;
      checkoutData.accountNumber = accountNumber;
      checkoutData.iban = iban;
    }

    const checkoutRequest = await CheckoutRequest.create(checkoutData);

    await teacher.update({
      dues: dues + Number(amount),
    });
    // إرسال إشعار واتساب للإداريين
    try {
      const admins = await Admin.findAll({
        where: { isSuperAdmin: true },
        attributes: ['phone', 'language']
      });

      const templateName = (admins[0]?.language === 'ar') ? 
        VERIFICATION_TEMPLATES.WITHDRAWAL_REQUEST_AR : 
        VERIFICATION_TEMPLATES.WITHDRAWAL_REQUEST_EN;

      const formattedAmount = amount.toLocaleString();
      const teacherName = `${teacher.firstName} ${teacher.lastName}`;
      
      // إرسال الإشعار لكل مدير
      await Promise.all(admins.map(async (admin) => {
        try {
          await sendWhatsAppTemplate({
            to: admin.phone.startsWith('+') ? admin.phone : `+${admin.phone}`,
            templateName,
            variables: [
              teacherName,
              formattedAmount,
              method === 'bank' ? bankInfo.bankName : phoneNumber,
              new Date().toLocaleDateString(admin.language === 'ar' ? 'ar-EG' : 'en-US')
            ],
            language: admin.language === 'ar' ? 'ar' : 'en_US',
            recipientName: admin.name || 'Admin',
            messageType: 'withdrawal_request',
            fallbackToEnglish: true,
          });
        } catch (error) {
          console.error(`فشل إرسال إشعار السحب إلى ${admin.phone}:`, error);
        }
      }));
      return res.status(201).send({
      status: 201,
      data: checkoutRequest,
      msg: {
        arabic: "تم إرسال طلب الدفعة بنجاح",
        english: "Request sent successfully",
      },
    });
    } catch (error) {
      console.error('خطأ في إرسال إشعارات الواتساب:', error);
      // لا نوقف العملية في حالة فشل إرسال الإشعار
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      status: 500,
      msg: {
        arabic: "حدث خطأ أثناء معالجة الطلب",
        english: "An error occurred while processing the request",
      },
    });
  }
};



const getProfitRatio = async (req, res) => {
  const admin = await Admin.findOne();
  res.send({
    status: 200,
    profitRatio: admin.profitRatio,
  });
};
// Developer by eng.reem.shwky@gmail.com
const settingNotification = async (req, res) => {
  const { teacherId } = req.params;
  const teacher = await Teacher.findOne({
    where: { id: teacherId },
    attributes: { exclude: ["password"] },
  });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجود",
      english: "Invalid trainerId! ",
    });

  if (teacher.id != req.user.userId)
    throw serverErrs.BAD_REQUEST({
      arabic: "لا يوجد حق بالوصول",
      english: "No Auth ",
    });

  const { isnotify } = req.body;

  await teacher.update({
    isnotify,
  });


  await teacher.save();

  res.send({
    status: 201,
    data: { teacher },
    msg: {
      arabic: "تم تعديل معلومات بنجاح",
      english: "successful edit Information! ",
    },
  });
};

const getNumbers = async (req, res) => {

  const { teacherId } = req.params;
  const numLevels = await TeacherLevel.count({
    where: {
      TeacherId: teacherId,
    },
  });

  const numDays = await TeacherDay.count({
    where: {
      TeacherId: teacherId,
    },
  });

  const numLimits = await TeacherLimits.count({
    where: {
      TeacherId: teacherId,
    },
  });

  const numSubject = await TeacherSubject.count({
    where: {
      TeacherId: teacherId,
    },
  });

  const numTypes = await TeacherTypes.count({
    where: {
      TeacherId: teacherId,
    },
  });

  const numCurriculum = await CurriculumTeacher.count({
    where: {
      TeacherId: teacherId,
    },
  });

  res.send({
    status: 201,
    data: { numLevels, numDays, numLimits, numSubject, numTypes, numCurriculum },
    msg: {
      arabic: "تم ارجاع جميع صفوف المدربين",
      english: "successful get all numbers",
    },
  });
};

const getAllCertificates = async (req, res) => {
  const { teacherId } = req.params;
  console.log(teacherId);
  const arrCretificates = await Certificates.findAll({
    where: {
      TeacherId: teacherId,
    }
  });

  res.send({
    status: 201,
    data: arrCretificates,
    msg: {
      arabic: "تم إرجاع جميع الشهادات بنجاح",
      english: "successful get all Certification",
    },
  });
};

const updateTeacherCertificates = async (req, res) => {
  const { certificatesId } = req.params;
  const objCretificates = await Certificates.findOne({
    where: { id: certificatesId },
    attributes: { exclude: ["password"] },
  });
  if (!objCretificates)
    throw serverErrs.BAD_REQUEST({
      arabic: "الشهاده غير موجود",
      english: "Certificate not found",
    });

  const {
    name,
    subject,
    from,
    to,
  } = req.body;

  await objCretificates.update({
    name,
    subject,
    from,
    to,

  });

  res.send({
    status: 201,
    msg: {
      arabic: "تم تعديل بيانات الشهاده بنجاح",
      english: "successful update of Certificates",
    },
  });
};

const deleteTeacherCertificates = async (req, res) => {
  const { certificatesId } = req.params;
  const objCretificates = await Certificates.findOne({
    where: { id: certificatesId },
  });
  if (!objCretificates)
    throw serverErrs.BAD_REQUEST({
      arabic: "الشهاده غير موجود",
      english: "Invalid Cretificates ID! ",
    });

  await objCretificates.destroy();
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف الشهاده بنجاح",
      english: "successfully delete of Cretificates !",
    },
  });
};

const getLectureByTeacherId = async (req, res) => {
  const { teacherId } = req.params;
  const arrLectures = await TeacherLecture.findAll({
    where: {
      TeacherId: teacherId,
    }
  });
  const lecturesData = await Promise.all(
    arrLectures.map(async (lecture) => {
      const subject = await Subject.findOne({
        where: {
          id: lecture.subject,
        },
      });
      const classDate = await Class.findOne({
        where: {
          id: lecture.class,
        },
      });
      const curriculums = await Curriculum.findOne({
        where: {
          id: lecture.curriculums,
        },
      });
      return {
        ...lecture.dataValues,
        subject: subject ? subject.dataValues : null,
        class: classDate ? classDate.dataValues : null,
        curriculums: curriculums ? curriculums.dataValues : null
      };
    })
  );
  res.send({
    status: 201,
    data: lecturesData,
    msg: {
      arabic: "تم ارجاع جميع المحاضرات المدرب بنجاح",
      english: "successful get all lectures teacher",
    },
  });
};


const getSingleLecture = async (req, res) => {
  const { lectureId } = req.params;
  const objLecture = await TeacherLecture.findOne({
    where: { id: lectureId },
    include: [{ model: Teacher }],
  });
  const [subject, classData, curriculums] = await Promise.all([
    Subject.findOne({ where: { id: objLecture.subject } }),
    Class.findOne({ where: { id: objLecture.class } }),
    Curriculum.findOne({ where: { id: objLecture.curriculums } }),
  ]);

  const lectureData = {
    ...objLecture.dataValues,
    subject: subject ? subject.dataValues : null,
    class: classData ? classData.dataValues : null,
    curriculums: curriculums ? curriculums.dataValues : null
  };
  res.send({
    status: 201,
    data: lectureData,
    msg: {
      arabic: "تم ارجاع جميع المحاضرات المدرب بنجاح",
      english: "successful get all lectures teacher",
    },
  });
};

const createLecture = async (req, res) => {
  const data = req.body;
  if (req.files && req.files.length > 0) {
    req.files.forEach(file => {
      if (file.fieldname === "docs") {
        data.docs = file.filename; // أو URL حسب طريقة التخزين
      } else if (file.fieldname === "image") {
        data.image = file.filename;
      }
    });
  }
  const objTeacher = await Teacher.findOne({
    where: {
      id: data.TeacherId,
    },
  });

  if (!objTeacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير مسجل سابقا",
      english: "Teacher is not found",
    });

  const newLecture = await TeacherLecture.create(data);

  res.send({
    status: 201,
    data: newLecture,
    msg: {
      arabic: "تم إنشاء محاضره بنجاح",
      english: "successful create new Lecture",
    },
  });
};


const deleteLecture = async (req, res) => {
  const { lectureId } = req.params;
  const objLecture = await TeacherLecture.findOne({
    where: { id: lectureId },
  });
  if (!objLecture)
    throw serverErrs.BAD_REQUEST({
      arabic: "محاضره غير موجود",
      english: "Invalid Lecture ID! ",
    });

  await objLecture.destroy();
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف محاضره بنجاح",
      english: "successfully delete of Lecture !",
    },
  });
};

const updateLecture = async (req, res) => {
  const { lectureId } = req.params;
  const data = req.body;
  const objLecture = await TeacherLecture.findOne({
    where: { id: lectureId },
  });

  if (!objLecture) {
    throw serverErrs.BAD_REQUEST({
      arabic: "المحاضره غير موجود",
      english: "Lecture not found",
    });
  };

  if (req.files && req.files.length > 0) {
    req.files.forEach(file => {
      if (file.fieldname === "docs") {
        data.docs = file.filename; // أو URL حسب طريقة التخزين
      } else if (file.fieldname === "image") {
        data.image = file.filename;
      }
    });
  }

  await objLecture.update(data);
  res.send({
    status: 201,
    data: objLecture,
    msg: {
      arabic: "تم تعديل بيانات المحاضره بنجاح",
      english: "successful update of Lecture",
    },
  });
};

const getLessonByTeacherId = async (req, res) => {
  const { teacherId } = req.params;
  const arrLessons = await TeacherLesson.findAll({
    where: {
      TeacherId: teacherId,
    },
    include: [
      { model: TeacherLecture }
    ]
  });

  res.send({
    status: 201,
    data: arrLessons,
    msg: {
      arabic: "تم ارجاع جميع الدروس المدرب بنجاح",
      english: "successful get all lessons teacher",
    },
  });
};

const createLesson = async (req, res) => {

  const { TeacherId, titleAR, titleEN, LectureId, videoLink } = req.body;
  const objTeacher = await Teacher.findOne({
    where: {
      id: TeacherId,
    },
  });

  if (!objTeacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير مسجل سابقا",
      english: "Teacher is not found",
    });

  const objLecture = await TeacherLecture.findOne({
    where: {
      id: LectureId,
    },
  });

  if (!objLecture)
    throw serverErrs.BAD_REQUEST({
      arabic: "المحاضره غير مسجل سابقا",
      english: "Lectrue is not found",
    });
  const newLesson = await TeacherLesson.create({
    TeacherId: TeacherId,
    TeacherLectureId: LectureId,
    titleEN: titleEN,
    titleAR: titleAR,
    videoLink: videoLink,
  });

  await newLesson.save();
  res.send({
    status: 201,
    data: newLesson,
    msg: {
      arabic: "تم إنشاء الدرس بنجاح",
      english: "successful create new Lesson",
    },
  });
};

const getSingleLesson = async (req, res) => {
  const { lessonId } = req.params;

  const objLesson = await TeacherLesson.findOne({
    where: { id: lessonId },
    include: [
      { model: TeacherLecture }
    ]
  });

  res.send({
    status: 201,
    data: objLesson,
    msg: {
      arabic: "تم ارجاع الدرس المدرب بنجاح",
      english: "successful get a lesson",
    },
  });
};

const updateLesson = async (req, res) => {
  const { lessonId } = req.params;
  const objLesson = await TeacherLesson.findOne({
    where: { id: lessonId },
  });

  if (!objLesson) {
    throw serverErrs.BAD_REQUEST({
      arabic: "الدرس غير موجود",
      english: "Lesson not found",
    });
  };

  const { TeacherId, titleAR, titleEN, videoLink } = req.body;

  await objLesson.update({
    TeacherId: TeacherId,
    titleAR: titleAR,
    titleEN: titleEN,
    videoLink: videoLink,
  });


  const objLessonTwo = await TeacherLesson.findOne({
    where: { id: objLesson.id },
  });

  res.send({
    status: 201,
    data: objLessonTwo,
    msg: {
      arabic: "تم تعديل بيانات المحاضره بنجاح",
      english: "successful update of Lecture",
    },
  });
};

const deleteLesson = async (req, res) => {
  const { lessonId } = req.params;
  const objLesson = await TeacherLesson.findOne({
    where: { id: lessonId },
  });
  if (!objLesson)
    throw serverErrs.BAD_REQUEST({
      arabic: "الدرس غير موجود",
      english: "Invalid Lesson ID! ",
    });

  await objLesson.destroy();
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف الدرس بنجاح",
      english: "successfully delete of Lesson !",
    },
  });
};

const updateLogout = async (req, res) => {
  console.log("Logout Teacher");

  const { teacherId } = req.params;
  const teacher = await Teacher.findOne({
    where: { id: teacherId },
    attributes: { exclude: ["password"] },
  });

  await teacher.update({
    isOnline: false,
  });

  await teacher.save();

  res.send({
    status: 201,
    data: { teacher },
    msg: {
      arabic: "تم تعديل معلومات بنجاح",
      english: "successful edit Information! ",
    },
  });
};

const getPackageByTeacherId = async (req, res) => {
  console.log(req.params);
  const { teacherId } = req.params;
  const arrPackage = await Package.findAll({
    where: {
      TeacherId: teacherId,
    },
    include: [
      { model: Teacher },
      { model: TrainingCategoryType },
      { model: LimeType },
      { model: SubjectCategory },
      { model: Level },
    ],
  });

  res.send({
    status: 201,
    data: arrPackage,
    msg: {
      arabic: "تم ارجاع جميع باقاتي المدرب بنجاح",
      english: "successful get all packages teacher",
    },
  });
};

const getSinglePackage = async (req, res) => {
  try {
    const { packageId } = req.params;

    const objPackage = await Package.findOne({
      where: { id: packageId },
      include: [
        { model: Teacher },
        { model: TrainingCategoryType },
        { model: LimeType },
        { model: SubjectCategory },
        { model: Level },
      ],
    });

    if (!objPackage) {
      return res.status(404).json({
        status: 404,
        msg: {
          arabic: "لم يتم العثور على الباقة",
          english: "Package not found",
        },
      });
    }

    const classData = await Class.findOne({
      where: {
        id: objPackage.class,
      },
    });

    const curriculumsData = await Curriculum.findOne({
      where: {
        id: objPackage.curriculums,
      },
    });

    const packagesData = {
      ...objPackage.dataValues,
      class: classData ? classData.dataValues : null,
      curriculums: curriculumsData ? curriculumsData.dataValues : null,
    };

    return res.status(200).json({
      status: 200,
      data: packagesData,
      msg: {
        arabic: "تم ارجاع بيانات الباقه للمدرب بنجاح",
        english: "Successfully retrieved package data",
      },
    });
  } catch (error) {
    console.error("Error in getSinglePackage:", error);
    return res.status(500).json({
      status: 500,
      msg: {
        arabic: "حدث خطأ أثناء جلب بيانات الباقة",
        english: "An error occurred while retrieving package data",
      },
    });
  }
};

const createPackage = async (req, res) => {
  const data = req.body;

  if (req.files && req.files.length > 0) {
    req.files.forEach(file => {
      if (file.fieldname === "docs") {
        data.docs = file.filename; // أو URL حسب طريقة التخزين
      } else if (file.fieldname === "image") {
        data.image = file.filename;
      }
    });
  }


  const newPackage = await Package.create(data);
  res.send({
    status: 201,
    data: newPackage,
    msg: {
      arabic: "تم إنشاء باقه جديده بنجاح",
      english: "successful create new Package",
    },
  });
};

const deletePackage = async (req, res) => {
  const { packageId } = req.params;
  const objPackage = await Package.findOne({
    where: { id: packageId },
  });
  if (!objPackage)
    throw serverErrs.BAD_REQUEST({
      arabic: "الباقة غير موجود",
      english: "Invalid Package ID! ",
    });

  await objPackage.destroy();
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف الباقة بنجاح",
      english: "successfully delete of Package !",
    },
  });
};

const updatePackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    const data = req.body;
    const package = await Package.findOne({
      where: { id: packageId },
    });;
    if (!package) {
      return res.status(404).send({
        status: 404,
        msg: {
          ar: "الحزمة غير موجودة",
          en: "Package not found"
        }
      });
    }
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (file.fieldname === "docs") {
          data.docs = file.filename; // أو URL حسب طريقة التخزين
        } else if (file.fieldname === "image") {
          data.image = file.filename;
        }
      });
    }

    await package.update(data);
    // إرجاع استجابة بالبيانات المحدثة
    res.send({
      status: 200,
      data: package,
      msg: {
        ar: "تم التحديث بنجاح",
        en: "Successfully updated"
      }
    });
  } catch (err) {
    console.error("Error updating package:", err);
    res.status(500).send({
      status: 500,
      msg: {
        ar: "خطأ في الخادم",
        en: "Server error"
      }
    });
  }
};

const getPackageAccept = async (req, res) => {
  const arrPackage = await Package.findAll({
    where: {
      status: "2"
    },
    include: [
      { model: Teacher },
      { model: TrainingCategoryType },
      { model: LimeType },
      { model: SubjectCategory },
      { model: Level },
    ],
  });

  res.send({
    status: 201,
    data: arrPackage,
    msg: {
      arabic: "تم ارجاع جميع باقاتي المدرب بنجاح",
      english: "successful get all packages teacher",
    },
  });
};

const getPackageAcceptByTeacherId = async (req, res) => {
  const { teacherId } = req.params;
  const arrPackage = await Package.findAll({
    where: {
      TeacherId: teacherId,
      status: "2"
    },
    include: [
      { model: Teacher },
      { model: TrainingCategoryType },
      { model: LimeType },
      { model: SubjectCategory },
      { model: Level },
    ],
  });

  res.send({
    status: 201,
    data: arrPackage,
    msg: {
      arabic: "تم ارجاع جميع باقاتي المدرب بنجاح",
      english: "successful get all packages teacher",
    },
  });
};

const getAllTeachers = async (req, res) => {
  const teachers = await Teacher.findAll({
    where: {
      isVerified: true,
      isRegistered: true,
    },
    include: [
      { model: LangTeachStd, include: [Language] },
      { model: Experience },
      { model: EducationDegree },
      { model: Certificates },
      { model: TeacherLevel, include: [Level] },
      { model: CurriculumTeacher, include: [Curriculum] },
      { model: TeacherSubject, include: [Subject] },
      { model: TeacherLimits, include: [LimeType] },
      { model: TeacherTypes, include: [TrainingCategoryType] },
      { model: Package, },
      { model: Rate },
    ],
  });

  res.send({
    status: 201,
    data: teachers,
    msg: {
      arabic: "تم ارجاع جميع المدربين",
      english: "successful get all trainers",
    },
  });
};

const getAllTeachersRating = async (req, res) => {
  const teachers = await Teacher.findAll({
    where: {
      isVerified: true,
      isRegistered: true,
    },
    include: [
      { model: LangTeachStd, include: [Language] },
      { model: Experience },
      { model: EducationDegree },
      { model: Certificates },
      { model: TeacherLevel, include: [Level] },
      { model: CurriculumTeacher, include: [Curriculum] },
      { model: TeacherSubject, include: [Subject] },
      { model: TeacherLimits, include: [LimeType] },
      { model: TeacherTypes, include: [TrainingCategoryType] },
      { model: Package, },
      { model: Rate },
    ],
  });

  var newArrTeachers = [];
  var j = 0;
  for (var i = 0; i < teachers.length; i++) {
    if (teachers[i].Rates.length > 0) {
      newArrTeachers[j] = teachers[i];
      j++;
    }
  }

  res.send({
    status: 201,
    data: newArrTeachers,
    msg: {
      arabic: "تم ارجاع جميع المدربين",
      english: "successful get all trainers",
    },
  });
};

const getQuestionByTeacherId = async (req, res) => {
  const { teacherId } = req.params;
  const arrQuestions = await TeacherQuestion.findAll({
    where: {
      TeacherId: teacherId,
    },
    include: [
      { model: TeacherLecture, },
    ]
  });

  res.send({
    status: 201,
    data: arrQuestions,
    msg: {
      arabic: "تم ارجاع جميع المحاضرات المدرب بنجاح",
      english: "successful get all lectures teacher",
    },
  });
};

const getSingleQuestion = async (req, res) => {
  const { questionId } = req.params;
  const objQuestion = await TeacherQuestion.findOne({
    where: { id: questionId },
    include: [
      { model: TeacherLecture, },
    ]
  });

  res.send({
    status: 201,
    data: objQuestion,
    msg: {
      arabic: "تم ارجاع جميع الاسئله المدرب بنجاح",
      english: "successful get all Question teacher",
    },
  });
};

const createQuestion = async (req, res) => {
  const { TeacherId, titleAR, titleEN, descriptionAr, descriptionEn, LectureId } = req.body;
  const objTeacher = await Teacher.findOne({
    where: {
      id: TeacherId,
    },
  });

  if (!objTeacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير مسجل سابقا",
      english: "Teacher is not found",
    });


  const objLecture = await TeacherLecture.findOne({
    where: {
      id: LectureId,
    },
  });

  if (!objLecture)
    throw serverErrs.BAD_REQUEST({
      arabic: "المحاضره غير مسجل سابقا",
      english: "Lecture is not found",
    });

  const newQuestion = await TeacherQuestion.create({
    TeacherId: TeacherId,
    TeacherLectureId: LectureId,
    titleAR: titleAR,
    titleEN: titleEN,
    descriptionAr: descriptionAr,
    descriptionEn: descriptionEn,
  });

  await newQuestion.save();
  res.send({
    status: 201,
    data: newQuestion,
    msg: {
      arabic: "تم إنشاء اسئله بنجاح",
      english: "successful create new Question",
    },
  });
};

const updateQuestion = async (req, res) => {
  const { questionId } = req.params;

  const objQuestion = await TeacherQuestion.findOne({
    where: { id: questionId },
  });

  if (!objQuestion) {
    throw serverErrs.BAD_REQUEST({
      arabic: "السؤال غير موجود",
      english: "Question not found",
    });
  };

  const {
    TeacherId: TeacherId,
    TeacherLectureId: TeacherLectureId,
    titleAR: titleAR,
    titleEN: titleEN,
    descriptionAr: descriptionAr,
    descriptionEn: descriptionEn,
  } = req.body;

  await objQuestion.update({
    TeacherId: TeacherId,
    TeacherLectureId: TeacherLectureId,
    titleAR: titleAR,
    titleEN: titleEN,
    descriptionAr: descriptionAr,
    descriptionEn: descriptionEn,
  });


  const objQuestionTwo = await TeacherQuestion.findOne({
    where: { id: objQuestion.id },
  });

  res.send({
    status: 201,
    data: objQuestionTwo,
    msg: {
      arabic: "تم تعديل بيانات السؤال بنجاح",
      english: "successful update of Question",
    },
  });
};

const deleteQuestion = async (req, res) => {
  const { questionId } = req.params;
  const objQuestion = await TeacherQuestion.findOne({
    where: { id: questionId },
  });
  if (!objQuestion)
    throw serverErrs.BAD_REQUEST({
      arabic: "السؤال غير موجود",
      english: "Invalid Question ID! ",
    });

  await objQuestion.destroy();
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف السؤال بنجاح",
      english: "successfully delete of Question !",
    },
  });
};

const getQuestionChooseByTeacherId = async (req, res) => {
  const { teacherId } = req.params;
  const arrQuestions = await TeacherQuestionChoose.findAll({
    where: {
      TeacherId: teacherId,
    },
    include: [
      { model: TeacherQuestion, },
    ]
  });

  res.send({
    status: 201,
    data: arrQuestions,
    msg: {
      arabic: "تم ارجاع جميع اجابات الاسئله الخاصه بهذا المدرب بنجاح",
      english: "successful get all answers of choose questions fot this teacher",
    },
  });
};

const getSingleQuestionChoose = async (req, res) => {
  const { questionChooseId } = req.params;
  const objQuestionChoose = await TeacherQuestionChoose.findOne({
    where: { id: questionChooseId },
    include: [
      { model: TeacherQuestion, },
    ]
  });

  res.send({
    status: 201,
    data: objQuestionChoose,
    msg: {
      arabic: "تم ارجاع جميع اجابات المدرب بنجاح",
      english: "successful get all choose answers teacher",
    },
  });
};

const createQuestionChoose = async (req, res) => {

  const { TeacherId, titleAR, titleEN, TeacherQuestionId, isCorrect } = req.body;
  const objTeacher = await Teacher.findOne({
    where: {
      id: TeacherId,
    },
  });

  if (!objTeacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير مسجل سابقا",
      english: "Teacher is not found",
    });


  const objQuestion = await TeacherQuestion.findOne({
    where: {
      id: TeacherQuestionId,
    },
  });

  if (!objQuestion)
    throw serverErrs.BAD_REQUEST({
      arabic: "السوال غير مسجل سابقا",
      english: "Question is not found",
    });

  const newQuestionChoose = await TeacherQuestionChoose.create({
    TeacherId: TeacherId,
    TeacherQuestionId: TeacherQuestionId,
    titleAR: titleAR,
    titleEN: titleEN,
    isCorrectAnswer: isCorrect
  });

  await newQuestionChoose.save();
  res.send({
    status: 201,
    data: newQuestionChoose,
    msg: {
      arabic: "تم إنشاء اجابه بنجاح",
      english: "successful create new choose answer",
    },
  });
};

const updateQuestionChoose = async (req, res) => {
  console.log("Update Question Choose");
  console.log(req.params);
  console.log(req.body);

  const { questionChooseId } = req.params;

  const objQuestionChoose = await TeacherQuestionChoose.findOne({
    where: { id: questionChooseId },
  });

  if (!objQuestionChoose) {
    throw serverErrs.BAD_REQUEST({
      arabic: "الاجابه غير موجود",
      english: "Answer not found",
    });
  };

  const {
    TeacherId: TeacherId,
    TeacherQuestionId: TeacherQuestionId,
    titleAR: titleAR,
    titleEN: titleEN,
    isCorrectAnswer: isCorrectAnswer,
  } = req.body;

  await objQuestionChoose.update({
    TeacherId: TeacherId,
    TeacherQuestionId: TeacherQuestionId,
    titleAR: titleAR,
    titleEN: titleEN,
    isCorrectAnswer: isCorrectAnswer
  });


  const objQuestionChooseTwo = await TeacherQuestionChoose.findOne({
    where: { id: objQuestionChoose.id },
  });

  res.send({
    status: 201,
    data: objQuestionChooseTwo,
    msg: {
      arabic: "تم تعديل بيانات الاجابه بنجاح",
      english: "successful update of Question Choose",
    },
  });
};

const deleteQuestionChoose = async (req, res) => {
  const { questionChooseId } = req.params;
  const objQuestionChoose = await TeacherQuestionChoose.findOne({
    where: { id: questionChooseId },
  });
  if (!objQuestionChoose)
    throw serverErrs.BAD_REQUEST({
      arabic: "الاجابة غير موجود",
      english: "Invalid answer ID! ",
    });

  await objQuestionChoose.destroy();
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف اجابه بنجاح",
      english: "successfully delete of Question Choose!",
    },
  });
};

const getTestsByTeacherId = async (req, res) => {
  const { teacherId } = req.params;
  const arrTests = await Tests.findAll({
    where: {
      TeacherId: teacherId,
    },
    include: [
      { model: Level, },
    ]
  });

  res.send({
    status: 201,
    data: arrTests,
    msg: {
      arabic: "تم ارجاع جميع الاختبارات الخاصه بهذا المدرب بنجاح",
      english: "successful get all tests fot this teacher",
    },
  });
};

const getSingleTest = async (req, res) => {
  const { testId } = req.params;
  const objTest = await Tests.findOne({
    where: { id: testId },
    include: [
      { model: Teacher, },
      { model: Level, },
    ]
  });
  const [subject, classData, curriculums] = await Promise.all([
    Subject.findOne({ where: { id: objTest.subject } }),
    Class.findOne({ where: { id: objTest.class } }),
    Curriculum.findOne({ where: { id: objTest.curriculums } }),
  ]);

  const examData = {
    ...objTest.dataValues,
    subject: subject ? subject.dataValues : null,
    class: classData ? classData.dataValues : null,
    curriculums: curriculums ? curriculums.dataValues : null,
  };

  res.send({
    status: 201,
    data: examData,
    msg: {
      arabic: "تم صف الاختبار المدرب بنجاح",
      english: "successful get single test of teacher",
    },
  });
};

const createTest = async (req, res) => {
  try {
    const data = req.body;

    // التأكد من أن هناك ملفات وتحميلها
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (file.fieldname === "docs") {
          data.docs = file.filename; // أو URL حسب طريقة التخزين
        } else if (file.fieldname === "image") {
          data.image = file.filename;
        }
      });
    }


    const table = await Tests.create(data);

    res.send({
      status: 200,
      msg: {
        arabic: "تم انشاء اختبار جديد",
        english: "A new exam has been created."
      }
    });
  } catch (error) {
    console.error("Error creating exam:", error);
    res.status(400).send({
      status: 400,
      error: error.message,
      msg: {
        arabic: "حدث خطأ ما",
        english: "Something went wrong"
      }
    });
  }
};

const updateTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const data = req.body;
    const exam = await Tests.findOne({ where: { id: testId } });
    if (!exam) {
      return res.status(404).send({
        status: 404,
        msg: {
          arabic: "الأختبار غير موجود",
          english: "exam not found"
        }
      });
    }
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (file.fieldname === "docs") {
          data.docs = file.filename; // أو URL حسب طريقة التخزين
        } else if (file.fieldname === "image") {
          data.image = file.filename;
        }
      });
    }

    await exam.update(data);
    res.send({
      status: 200,
      msg: {
        arabic: "تم تحديث الأختبار بنجاح",
        english: "Exam updated successfully"
      },
    });
  } catch (error) {
    res.status(500).send({
      status: 500,
      error: error.message,
      msg: {
        arabic: "حدث خطأ في الخادم",
        english: "Server error"
      }
    });
  }
};

const deleteTest = async (req, res) => {
  const { testId } = req.params;
  const objTest = await Tests.findOne({
    where: { id: testId },
  });
  if (!objTest)
    throw serverErrs.BAD_REQUEST({
      arabic: "الاختبار غير موجود",
      english: "Invalid test ID! ",
    });

  await objTest.destroy();
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف الاختبار بنجاح",
      english: "successfully delete of Test!",
    },
  });
};

const getDiscountByTeacherId = async (req, res) => {
  const { teacherId } = req.params;
  const arrDiscounts = await Discounts.findAll({
    where: {
      TeacherId: teacherId,
    }
  });

  res.send({
    status: 201,
    data: arrDiscounts,
    msg: {
      arabic: "تم ارجاع جميع الخصومات الخاصه المدرب بنجاح",
      english: "successful get all discounts teacher",
    },
  });
};

const getSingleDiscount = async (req, res) => {
  const { discountId } = req.params;
  const objDiscount = await Discounts.findOne({
    where: { id: discountId },
  });

  const classId = await Class.findOne({
    where: {
      id: objDiscount.class,
    },
  });
  const curriculums = await Curriculum.findOne({
    where: {
      id: objDiscount.curriculums,
    },
  });
  // إرجاع المورد مع البيانات المرتبطة به
  const discountWithData = {
    ...objDiscount.dataValues,
    class: classId ? classId.dataValues : null,
    curriculums: curriculums ? curriculums.dataValues : null,
  };
  res.send({
    status: 201,
    data: discountWithData,
    msg: {
      arabic: "تم ارجاع الخصوصه الخاصه بنجاح",
      english: "successful get all discount teacher",
    },
  });
};

const createDiscount = async (req, res) => {
  try {
    const data = req.body;
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (file.fieldname === "docs") {
          data.docs = file.filename; // أو URL حسب طريقة التخزين
        } else if (file.fieldname === "image") {
          data.image = file.filename;
        }
      });
    }
    await Discounts.create(data);

    res.send({
      status: 200,
      message: {
        arabic: "تم انشاء خصم جديدة",
        english: "A new Discount has been created.",
      },
    });
  } catch (error) {
    res.status(500).send({
      status: 500,
      error: error.message,
      message: {
        arabic: "حدث خطأ أثناء إنشاء الخصم",
        english: "An error occurred while creating the discount",
      },
    });
  }
};

const deleteDiscount = async (req, res) => {
  const { discountId } = req.params;
  const objDiscount = await Discounts.findOne({
    where: { id: discountId },
  });
  if (!objDiscount)
    throw serverErrs.BAD_REQUEST({
      arabic: "الخصومه الخاصه غير موجود",
      english: "Invalid Discount ID! ",
    });

  await objDiscount.destroy();
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف الخصومه بنجاح",
      english: "successfully delete of Discount !",
    },
  });
};

const updateDiscount = async (req, res) => {

  try {
    const { discountId } = req.params;
    const discount = await Discounts.findByPk(discountId);
    if (!discount) {
      return res.status(404).send({
        status: 404,
        message: {
          arabic: "الخصم غير موجود",
          english: "Discount not found",
        },
      });
    }

    const data = req.body;
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (file.fieldname === "docs") {
          data.docs = file.filename; // أو URL حسب طريقة التخزين
        } else if (file.fieldname === "image") {
          data.image = file.filename;
        }
      });
    }

    await discount.update(data);

    res.send({
      status: 200,
      message: {
        arabic: "تم تحديث الخصم بنجاح",
        english: "Discount updated successfully",
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({
      status: 500,
      message: {
        arabic: "حدث خطأ في الخادم",
        english: "Server error",
      },
      error: error.message,
    });
  }
};

const getRefundTeacherById = async (req, res) => {
  const { TeacherId } = req.params;
  const objTeacher = await Teacher.findOne({
    where: { id: TeacherId }
  });
  if (!objTeacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجودة",
      english: "Invalid Teacher! ",
    });

  const dataRefund = await TeacherRefund.findAll({
    where: {
      TeacherId: TeacherId,
    },
  });


  res.send({
    status: 201,
    data: dataRefund,
    msg: {
      arabic: "تم عمليه الاسترجاع بنجاح",
      english: "successful add Refund success",
    },
  });
}

const getSessionsByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const sessions = await Session.findAll({
      where: { TeacherId: teacherId, isPaid: true },
      attributes: ["id", "title", "date", "period", "type", "isPaid", "price", "currency"],
      include: [
        {
          model: Student,
          attributes: ["id", "phoneNumber", "name", "email"],
        },
        {
          model: Teacher,
          attributes: ["id", "firstName", "lastName", "email", "phone"],
          include: [{
            model: TeacherSubject,
            include: [{
              model: Subject,
              include: [{
                model: SubjectCategory
              }]
            }]
          }]
        },
      ],
    });
    if (!sessions.length) {
      return res.status(404).json({
        status: 404,
        msg: {
          arabic: "لم يتم العثور على جلسات لهذا المدرب",
          english: "No sessions found for this teacher",
        },
      });
    }

    res.status(200).json({
      status: 200,
      data: sessions,
      msg: {
        arabic: "تم البحث بنجاح",
        english: "Successful search",
      },
    });

  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({
      status: 500,
      msg: {
        arabic: "حدث خطأ أثناء جلب البيانات",
        english: "An error occurred while fetching the data",
      },
    });
  }
};

const availbleTeacher = async (req, res) => {
  try {
    const teacherData = await TeacherDay.findAll({
      where: {
        TeacherId: req.params.id
      }
    });

    if (!teacherData) return res.status(404).json({ message: 'Teacher not found' });


    const data = await Promise.all(
      teacherData.map(async (teacher) => {
        const day = await Days.findOne({
          where: {
            id: teacher.DayId,
          },
        });
        return {
          ...teacher.dataValues,
          day: day ? day.dataValues : null
        };
      })
    );
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

const addEvaluations = async (req, res) => {
  try {
    const {
      TeacherId,
      StudentId,
      StudentName,
      certificateDate,
      teacherSignature,
      trainingStage,
      language, // لو حابب ترسل الإيميل حسب اللغة
    } = req.body;

    // 📝 إنشاء التقييم
    const evaluation = await Evaluations.create({
      TeacherId,
      StudentId,
      StudentName,
      certificateDate,
      trainingStage,
      teacherSignature,
    });

    // 📬 إرسال بريد إلكتروني
    const student = await Student.findByPk(StudentId);
    if (student && student.email) {
      const mailOptions = generateCertificateHTML({
        language,
        studentName: StudentName,
        date: certificateDate,
        certificateTitle: trainingStage,
        email: student.email
      });

      await sendEmail(mailOptions);
    }
    // إرسال رسالة واتساب
try {
  const { VERIFICATION_TEMPLATES } = require("../config/whatsapp-templates");
  const { sendWhatsAppTemplate } = require("../utils/whatsapp");
  
  const templateName = language === "ar" 
    ? VERIFICATION_TEMPLATES.CERTIFICATE_ISSUED_AR 
    : VERIFICATION_TEMPLATES.CERTIFICATE_ISSUED_EN;
  
  if (student && student.phoneNumber) {
    await sendWhatsAppTemplate({
      to: student.phoneNumber.startsWith('+') ? student.phoneNumber : `+${student.phoneNumber}`,
      templateName,
      variables: [
        student.name,                    // اسم الطالب
        trainingStage,                  // عنوان الشهادة
        new Date(certificateDate).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US") // تاريخ الإصدار
      ],
      language: language === "ar" ? "ar" : "en_US",
      recipientName: student.name,
      messageType: "certificate_issued",
      fallbackToEnglish: true,
    });
  }
} catch (error) {
  console.error("Error sending WhatsApp message:", error);
  // لا نوقف العملية في حالة فشل إرسال رسالة الواتساب
}
    // 🔔 إنشاء تنبيه للطالب
    await Notification.create({
      userId: StudentId,
      userType: "student",
      title: language === "ar" ? "تم إصدار شهادة جديدة" : "New Certificate Issued",
      messageAr: `تم إصدار شهادة جديدة بتاريخ ${new Date(certificateDate).toLocaleDateString("ar-EG")}`,
      messageEn: `A new certificate was issued on ${new Date(certificateDate).toLocaleDateString("en-US")}`,
      type: "certificate",
    });

    res.status(201).json({
      msg: {
        arabic: "تم حفظ التقييم وإرسال الشهادة بنجاح",
        english: "Evaluation saved and certificate email sent successfully",
      },
      data: evaluation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "حدث خطأ أثناء إنشاء التقييم أو إرسال البريد",
      error: err.message,
    });
  }
};


const getTeacherStats = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const currentYear = new Date().getFullYear();

    // خطوة 1: اجلب البيانات من قاعدة البيانات
    const sessions = await Session.findAll({
      where: {
        isPaid: true,
        TeacherId: teacherId,
        createdAt: {
          [Op.between]: [
            new Date(`${currentYear}-01-01T00:00:00Z`),
            new Date(`${currentYear}-12-31T23:59:59Z`)
          ]
        }
      },
      attributes: [
        [fn("MONTH", col("createdAt")), "month"],
        [fn("COUNT", col("id")), "total"]
      ],
      group: [literal("month")],
      order: [[literal("month"), "ASC"]]
    });

    // تجهيز بيانات 12 شهر
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const found = sessions.find(
        s => parseInt(s.dataValues.month) === monthNum
      );

      return {
        month: `${monthNum.toString().padStart(2, "0")}`,
        Lessons: found ? parseInt(found.dataValues.total) : 0
      };
    });

    const sessionsNumber = await Session.count({
      where: {
        isPaid: true,
        TeacherId: teacherId
      },
    });
    const packageWaiting = await Package.count({
      where: {
        TeacherId: teacherId,
        status: "1",
      },
    });
    const packageOnline = await Package.count({
      where: {
        TeacherId: teacherId,
        status: "2",
      },
    });
    const teacherLectureWaiting = await TeacherLecture.count({
      where: {
        TeacherId: teacherId,
        status: "1",
      },
    });
    const discountsNumWaiting = await Discounts.count({
      where: {
        TeacherId: teacherId,
        status: "1",
      },
    });

    const discountsOnline = await Discounts.count({
      where: {
        TeacherId: teacherId,
        status: "2",
      },
    });

    const testsOnline = await Tests.count({
      where: {
        TeacherId: teacherId,
        status: "2",
      },
    });
    const testsWaiting = await Tests.count({
      where: {
        TeacherId: teacherId,
        status: "1",
      },
    });

    const adsNumTeacherWaiting = await AdsTeachers.count({
      where: {
        TeacherId: teacherId,
        status: "1",
      },
    });
    const adsNumTeacher = await AdsTeachers.count({
      where: {
        TeacherId: teacherId,
        status: "2",
      },
    });

    const careerNumWaiting = await Career.count({
      where: {
        TeacherId: teacherId,
        status: "1",
      },
    });
    const careerOnline = await Career.count({
      where: {
        TeacherId: teacherId,
        status: "2",
      },
    });

    const lessonWaiting = await Lessons.count({
      where: {
        TeacherId: teacherId,
        status: "pending",
      },
    });
    const lessonOnline = await Lessons.count({
      where: {
        TeacherId: teacherId,
        status: "approved",
      },
    });
    const lessonCanceled = await Lessons.count({
      where: {
        TeacherId: teacherId,
        status: "canceled",
      },
    });
    const lectureOline = await TeacherLecture.count({
      where: {
        status: "2",
        TeacherId: teacherId
      },
    });
    const students = await Session.count({
      where: {
        TeacherId: teacherId,
        isPaid: true,
        StudentId: {
          [Op.ne]: null, // StudentId not null
        },
      },
      distinct: true,
      col: 'StudentId',
    });
    const studentsdata = await Session.findAll({
      where: {
        TeacherId: teacherId,
        isPaid: true,
        StudentId: {
          [Op.ne]: null, // StudentId not null
        },
      },
      distinct: true,
      col: 'StudentId',
    });


    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    const diffToMonday = (dayOfWeek + 6) % 7; // احسب كم ترجع ليوم الاثنين
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    const sessionsThisWeek = await Session.count({
      where: {
        isPaid: true,
        teacherAccept: true,
        TeacherId: teacherId,
        createdAt: {
          [Op.between]: [startOfWeek, endOfWeek],
        },
      },
    });

    return res.status(200).json({
      students,
      studentsdata,
      lectureOline,
      sessionsThisWeek,
      sessionsNumber,
      discountsOnline,
      packageWaiting,
      testsWaiting,
      testsOnline,
      packageOnline,
      discountsNumWaiting,
      teacherLectureWaiting,
      lessonCanceled,
      lessonOnline,
      lessonWaiting,
      careerOnline,
      careerNumWaiting,
      adsNumTeacher,
      adsNumTeacherWaiting,
      lessonsChart: monthlyData
    });
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    return res.status(500).json({ error: "Server error" });
  }
};


const getMyStudentSubscriptions = async (req, res) => {
  try {
    const { TeacherId } = req.params;

    // جلب الحزم، الاختبارات، المحاضرات، الخصومات الخاصة بالمدرب
    const [myPackages, myTests] = await Promise.all([
      Package.findAll({ where: { TeacherId } }),
      Tests.findAll({ where: { TeacherId } }),
    ]);

    // ✅ جلب بيانات الطلاب المشتركين في الحزم
    const packagesData = await Promise.all(
      myPackages.map(async (pkg) => {
        const packageStudents = await StudentPackage.findAll({
          where: { PackageId: pkg.id, isPaid: true },
          include: [
            {
              model: Student,
              attributes: ['id', 'name', 'email'],
            },
            {
              model: Package,
              attributes: ['id', 'titleAR', 'titleEN'],
            },
          ],
        });

        if (packageStudents.length === 0) return null;

        return {
          type: 'package',
          packageId: pkg.id,
          packageTitleAR: pkg.titleAR,
          packageTitleEN: pkg.titleEN,
          students: packageStudents.map((pak) => ({
            student: pak.Student,
            price: pak.price,
            currency: pak.currency,
            subscribedAt: pak.createdAt,
          })),
        };
      })
    );

    // ✅ جلب بيانات الطلاب المشتركين في الاختبارات
    const testsData = await Promise.all(
      myTests.map(async (test) => {
        const testStudents = await StudentTest.findAll({
          where: { TestId: test.id, isPaid: true },
          include: [
            {
              model: Student,
              attributes: ['id', 'name', 'email'],
            },
            {
              model: Tests,
              include: [
                {
                  model: Level,
                  attributes: ['id', 'titleAR', 'titleEN'],
                },
              ],
            },
          ],
        });

        if (testStudents.length === 0) return null;

        return {
          type: 'test',
          tests:testStudents.map((ts) => ({
            testId: ts.Test.id,
            currency: ts.currency,
            price: ts.price,
            testTitleAR: ts.Test.Level.titleAR,
            testTitleEN: ts.Test.Level.titleEN,
            student: ts.Student,
            subscribedAt: ts.createdAt,
          })),
        };
      })
    );

    // // ✅ المحاضرات التي اشترك فيها الطلاب
    const lectureSubscriptions = await StudentLecture.findAll({
      where: { isPaid: true },
      include: [
        {
          model: Student,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: TeacherLecture,
          where: { TeacherId },
          attributes: ['id', 'titleAR', 'titleEN'],
        },
      ],
    });

    const lecturesData = lectureSubscriptions.map((entry) => ({
      type: 'lecture',
      student: entry.Student,
      currency: entry.currency,
      price: entry.price,
      lecture: entry.TeacherLecture,
      subscribedAt: entry.createdAt,
    }));

    // // ✅ الخصومات التي استخدمها الطلاب
    const discountSubscriptions = await StudentDiscount.findAll({
      where: { isPaid: true },
      include: [
        {
          model: Student,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Discounts,
          where: { TeacherId, },
          attributes: ['id', 'titleAR', 'titleEN'],
        },
      ],
    });

    const discountsData = discountSubscriptions.map((entry) => ({
      type: 'discount',
      student: entry.Student,
      currency: entry.currency,
      price: entry.price,
      discount: entry.Discount,
      subscribedAt: entry.createdAt,
    }));

    // ✅ تجميع الكل وتصفية null
    const combinedData = [
      ...packagesData,
      ...testsData,
      ...lecturesData,
      ...discountsData,
    ].filter((item) => item !== null);

    res.status(200).json(combinedData);
  } catch (error) {
    console.error('Error fetching my package subscriptions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




module.exports = {
  getTeacherStats,
  addEvaluations,
  getMyStudentSubscriptions,
  createExchangeRequestsTeacher,
  availbleTeacher,
  getSessionsByTeacher,
  signUp, verifyCode, signPassword, signAbout,
  signAdditionalInfo, settingNotification, getSingleTeacher, uploadImage,
  addSubjects, addDescription, signResume,
  signAvailability, signVideoLink, searchTeacherFilterSide,
  searchTeacherFilterTop, resetPassword, getAllSessions,
  getCredit, getTeacherFinancial, updateNotification,
  getTeacherRate, acceptLesson, endLesson,
  getMyStudents, requestCheckout, getProfitRatio,
  getNumbers,
  getAllCertificates,
  updateTeacherCertificates,
  deleteTeacherCertificates,
  createLecture, getLectureByTeacherId, deleteLecture, updateLecture, getSingleLecture,
  createLesson, getLessonByTeacherId, getSingleLesson, updateLesson, deleteLesson,
  updateLogout,
  getPackageByTeacherId, getSinglePackage, createPackage,
  deletePackage, updatePackage, getPackageAcceptByTeacherId,
  getPackageAccept, getAllTeachers,
  getQuestionByTeacherId, getSingleQuestion, createQuestion,
  deleteQuestion, updateQuestion,
  getQuestionChooseByTeacherId, getSingleQuestionChoose,
  createQuestionChoose, updateQuestionChoose,
  deleteQuestionChoose,
  getTestsByTeacherId, getSingleTest,
  createTest, updateTest,
  deleteTest, getDiscountByTeacherId,
  getSingleDiscount, createDiscount,
  deleteDiscount, updateDiscount,
  getRefundTeacherById, getAllTeachersRating, PersonalDescription
};
