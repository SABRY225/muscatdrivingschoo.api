const {
  Teacher,        Student,          Parent,
  LangTeachStd,   RemoteSession,    F2FSessionStd,
  F2FSessionTeacher,   Level,       Curriculum,
  Class,          Experience,       EducationDegree,
  Certificates,   TeacherDay,       TeacherLevel,
  CurriculumTeacher,  Days,         Language,
  Subject,        Wallet,           Session,
  CurriculumLevel,FinancialRecord,  TeacherTypes,
  TrainingCategoryType,   TeacherLimits,            TeacherLecture,
  TeacherLesson,          LimeType,                 ParentStudent,
  Package,                StudentPackage,           Tests,
  StudentTest,            ExchangeRequestsStudent,
  StudentRefund,          Discounts,                StudentDiscount,
  TeacherQuestion,
  TeacherQuestionChoose,
  SubjectCategory
} = require("../models");
const { validateStudent, loginValidation } = require("../validation");
const { serverErrs } = require("../middlewares/customError");
const generateRandomCode = require("../middlewares/generateCode");
const sendEmail = require("../middlewares/sendEmail");
const { compare, hash } = require("bcrypt");
const generateToken = require("../middlewares/generateToken");
const path = require("path");
const fs = require("fs");
const CC = require("currency-converter-lt");
const TeacherSubject = require("../models/TeacherSubject");
const Rate = require("../models/Rate");
const { Op, fn , col, literal} = require("sequelize");
const { Sequelize } = require("sequelize");
const { db } = require("../firebaseConfig");

const dotenv = require("dotenv");
const {
  generateConfirmEmailBody,
  generateWelcomeEmailBody,
} = require("../utils/EmailBodyGenerator");
const {
  generateConfirmEmailSMSBody,
  generateWelcomeSMSBody,
} = require("../utils/SMSBodyGenerator");
const sendWhatsAppVerificationCode = require("../utils/sendWhatsAppVerificationCode");
const { sendWhatsAppTemplate } = require("../utils/whatsapp");
const StudentLecture = require("../models/StudentLecture");
const {
  sendNotification,
  sendBookingNotification,
  sendLessonNotification,
  sendGeneralNotification,
} = require("../services/shared/notification.service");
const { sendLessonEmail } = require("../utils/sendEmailLessonMeeting");
const Evaluations = require("../models/Evaluation");
const Lessons = require("../models/Lesson");
dotenv.config();

const signUp = async (req, res) => {
  try {
    const { email, phoneNumber, name, location, language } = req.body;
    await validateStudent.validate({ email, name, location });

    const existsMsg = {
      arabic: "عفوا ، الحساب غير صالح لإنشاء، نرجو مراجعة بياناتك مره أخرى لكي يتم إنشاء حسابك بشكل ناجح",
      english: "Sorry, the account is not valid for creation. Please review your data again so that your account can be created successfully.",
    };
const errorMessage2 = {
      arabic:
         "عفوا , هذا البريد مستخدم سابقا",
      english:
        "Sorry, this email address has already been used.",
    };

    // 🔒 التأكد أن الإيميل غير مستخدم في أي جدول
    const [teacher, student, parent] = await Promise.all([
      Teacher.findOne({ where: { email } }),
      Student.findOne({ where: { email } }),
      Parent.findOne({ where: { email } }),
    ]);

    if (teacher || student || parent) throw serverErrs.BAD_REQUEST(errorMessage2);

    const code = generateRandomCode();

    await Student.create({ email, name, location, registerCode: code, phoneNumber });

    const mailOptions = generateConfirmEmailBody(code, language, email);
    const smsOptions = {
      body: generateConfirmEmailSMSBody(language, code),
      to: phoneNumber,
    };

    sendEmail(mailOptions, smsOptions);

    try {
      await sendWhatsAppVerificationCode(phoneNumber, code, language);
    } catch (err) {
      console.error("خطأ أثناء إرسال رسالة واتساب:", err.message);
    }

    res.send({
      status: 201,
      msg: {
        arabic: "تم ارسال الإيميل بنجاح",
        english: "Email sent successfully",
      },
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(err?.status || 500).send({
      status: err?.status || 500,
      msg: err?.message || {
        arabic: "حدث خطأ غير متوقع",
        english: "An unexpected error occurred",
      },
    });
  }
};

const verifyCode = async (req, res) => {
  const { registerCode, email, long, lat } = req.body;

  const teacher = await Teacher.findOne({
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

  const registeredStudent = await Student.findOne({
    where: {
      email,
      isRegistered: true,
    },
  });

  if (registeredStudent)
    throw serverErrs.BAD_REQUEST({
      //arabic: "الايميل مستخدم من قبل",
      //english: "email is already used",
      arabic      : "عفوا ، الحساب غير صالح ، نرجو مراجعه بياناتك مره اخري لكي يتم انشاء حسابك بشكل ناجح",
      english     : "Sorry, the account is not valid. Please review your data again so that your account can be created successfully.",
    });
  if (teacher)
    throw serverErrs.BAD_REQUEST({
      //arabic: "الايميل مستخدم من قبل",
      //english: "email is already used",
      arabic      : "عفوا ، الحساب غير صالح ، نرجو مراجعه بياناتك مره اخري لكي يتم انشاء حسابك بشكل ناجح",
      english     : "Sorry, the account is not valid. Please review your data again so that your account can be created successfully.",
    });
  if (parent)
    throw serverErrs.BAD_REQUEST({
      //arabic: "الايميل مستخدم من قبل",
      //english: "email is already used",
      arabic      : "عفوا ، الحساب غير صالح ، نرجو مراجعه بياناتك مره اخري لكي يتم انشاء حسابك بشكل ناجح",
      english     : "Sorry, the account is not valid. Please review your data again so that your account can be created successfully.",
    });
  const student = await Student.findOne({
    where: {
      email,
      registerCode,
    },
  });
  if (!student)
    throw serverErrs.BAD_REQUEST({
      arabic: "الكود خاطئ",
      english: "code is wrong",
    });

  await student.update({ isRegistered: true, long, lat });
  res.send({
    status: 201,
    data: student,
    msg: {
      arabic: "تم التحقق من الكود واضافة الموقع بنجاح",
      english: "Verified code and add address successfully",
    },
  });
};

const signPassword = async (req, res) => {
  const { email, password, language } = req.body;

  let student = await Student.findOne({
    where: {
      email,
      isRegistered: true,
    },
  });

  if (!student)
    throw serverErrs.BAD_REQUEST({
      arabic: "الايميل غير موجود",
      english: "email not found",
    });

  const hashedPassword = await hash(password, 12);

  await student.update({ password: hashedPassword });
  await student.save();

  const token = await generateToken({
    userId: student.id,
    name: student.name,
    role: "student",
  });

  const mailOptions = generateWelcomeEmailBody(language, student.name, email);
  const smsOptions = {
    body: generateWelcomeSMSBody(language, student.name),
    to: student.phoneNumber,
  };
  sendEmail(mailOptions, smsOptions);

  // إرسال رسالة ترحيبية بعد التسجيل بنجاح بنفس منطق mb
  try {
    const { VERIFICATION_TEMPLATES } = require("../config/whatsapp-templates");
    const templateName = language === "ar"
      ? VERIFICATION_TEMPLATES.WELCOME_STUDENT_AR
      : VERIFICATION_TEMPLATES.WELCOME_STUDENT_EN;

    const result = await sendWhatsAppTemplate({
      to: student.phoneNumber,
      templateName,
      variables: [student.name||"الطالب"],
      language: language === "ar" ? "ar" : "en_US",
      recipientName: student.name,
      messageType: "welcome",
      fallbackToEnglish: true,
    });

    if (result.success) {
      console.log("✅ تم إرسال رسالة الترحيب بنجاح");
    } else {
      console.error(`❌ فشل إرسال رسالة الترحيب: ${result.error}`);
    }
  } catch (err) {
    console.error("❌ خطأ أثناء إرسال رسالة الترحيب عبر واتساب:", err.message);
  }

  student = {
    id: student.id,
    email: student.email,
    name: student.name,
    gender: student.gender,
    image: student.image,
    city: student.city,
    dateOfBirth: student.dateOfBirth,
    nationality: student.nationality,
    location: student.location,
    phoneNumber: student.phoneNumber,
    regionTime: student.regionTime,
    registerCode: student.registerCode,
    isRegistered: student.isRegistered,
    wallet: student.wallet,
    long: student.long,
    lat: student.lat,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
    LevelId: student.LevelId,
    ClassId: student.ClassId,
    CurriculumId: student.CurriculumId,
    ParentId: student.ParentId,
  };
  res.send({
    status: 201,
    data: student,
    msg: {
      arabic: "تم تسجيل كلمة المرور بنجاح",
      english: "successful sign password",
    },
    token: token,
  });
};

// إرسال إشعار واتساب عند تعديل بيانات الطالب الشخصية


const signData = async (req, res) => {
  const { email, gender, levelId, curriculumId, classId } = req.body;

  let student = await Student.findOne({
    where: {
      email: email,
      isRegistered: true,
    },
  });

  if (!student)
    throw serverErrs.BAD_REQUEST({
      arabic: "الايميل غير موجود",
      english: "email not found",
    });

  await student.update({
    gender,
    LevelId: levelId,
    CurriculumId: curriculumId,
    ClassId: classId,
    isRegistered: true,
  });
  await student.save();
  student = {
    id: student.id,
    email: student.email,
    name: student.name,
    gender: student.gender,
    image: student.image,
    city: student.city,
    dateOfBirth: student.dateOfBirth,
    nationality: student.nationality,
    location: student.location,
    phoneNumber: student.phoneNumber,
    regionTime: student.regionTime,
    registerCode: student.registerCode,
    isRegistered: student.isRegistered,
    wallet: student.wallet,
    long: student.long,
    lat: student.lat,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
    LevelId: student.LevelId,
    ClassId: student.ClassId,
    CurriculumId: student.CurriculumId,
    ParentId: student.ParentId,
  };
 await sendNotification("انضمام طالب جديد الي المنصة","A new student joins the platform","1","register_student","admin");
  res.send({
    status: 201,
    data: student,
    msg: {
      arabic: "تم التسجيل البيانات بنجاح",
      english: "signed up successfully",
    },
  });
};

const createExchangeRequestsStudent = async (req, res) => {
  const { amount, currency , reason , StudentId } = req.body;
  const newExchange = await ExchangeRequestsStudent.create(
    {
      amount        : amount,
      currency      : currency,
      status        : "-1",
      StudentId     : StudentId,
      AdminId       : "1",
      reason        : reason,
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
      arabic  : "تم إنشاء طلب صرف جديده بنجاح",
      english : "successful create new Exchange Requests Student",
    },
  });
};

const getStudents = async (req, res) => {
  const Students = await Student.findAll({
    attributes: { exclude: ["password"] },
  });
  res.send({
    status: 201,
    data: Students,
    msg: {
      arabic: "تم ارجاع جميع الطلاب بنجاح",
      english: "successful get all Students",
    },
  });
};

const getSingleStudent = async (req, res) => {
  const { studentId } = req.params;
  const student = await Student.findOne({
    where: { id: studentId },
    include: [
      { model: Level },
      { model: Curriculum },
      { model: Class },
      { model: LangTeachStd },
    ],
    attributes: { exclude: ["password"] },
  });
  res.send({
    status: 201,
    data: student,
    msg: {
      arabic: "تم ارجاع الطالب",
      english: "successful get single student",
    },
  });
};

const getLastTenStudent = async (req, res) => {
  const students = await Student.findAll({
    where: { isRegistered: 1 },
    limit: 10,
    order: [["id", "DESC"]],
    include: { all: true },
    attributes: { exclude: ["password"] },
  });
  res.send({
    status: 201,
    data: students,
    msg: {
      arabic: "تم ارجاع اخر 10 طلاب مسجلين بنجاح",
      english: "successful get last ten students",
    },
  });
};

const editPersonalInformation = async (req, res) => {
  const { StudentId } = req.params;
  const student = await Student.findOne({
    where: { id: StudentId },
    attributes: { exclude: ["password"] },
  });
  if (!student)
    throw serverErrs.BAD_REQUEST({
      arabic: "الطالب غير موجود",
      english: "Student not found",
    });

  const {
    name,
    gender,
    dateOfBirth,
    phoneNumber,
    city,
    nationality,
    location,
    regionTime,
    LevelId,
    ClassId,
    CurriculumId,
  } = req.body;

  let { languages } = req.body;
  if (typeof languages === "string") {
    languages = JSON.parse(languages);
  }

  await student.update({
    name,
    gender,
    dateOfBirth,
    phoneNumber,
    city,
    nationality,
    location,
    regionTime,
    LevelId,
    ClassId,
    CurriculumId,
  });

  if (languages) {
    await LangTeachStd.destroy({
      where: {
        StudentId: student.id,
      },
    });

    await LangTeachStd.bulkCreate(languages).then(() =>
      console.log("LangTeachStd data have been created")
    );
  }

  // إرسال إشعار واتساب عند تعديل البيانات الشخصية
  try {
    await sendWhatsAppTemplate({
      to: student.phoneNumber,
      templateName: "profile_completed",
      variables: [student.name || "student"],
      language: "ar", // أو استخدم لغة الطالب إذا متوفرة
      recipientName: student.name || "student"
    });
  } catch (err) {
    console.error('❌ فشل إرسال رسالة الترحيب:', err);
  }
  res.send({
    status: 201,
    msg: {
      arabic: "تم تعديل بيانات الطالب بنجاح",
      english: "successful edit personal information data",
    },
  });
};

const editImageStudent = async (req, res) => {
  const { StudentId } = req.params;
  const student = await Student.findOne({
    where: { id: StudentId },
    attributes: { exclude: ["password"] },
  });
  if (!student)
    throw serverErrs.BAD_REQUEST({
      arabic: "الطالب غير موجود",
      english: "Student not found",
    });
  const clearImage = (filePath) => {
    filePath = path.join(__dirname, "..", `images/${filePath}`);
    fs.unlink(filePath, (err) => {
      if (err)
        throw serverErrs.BAD_REQUEST({
          arabic: "الصورة غير موجودة",
          english: "Image not found",
        });
    });
  };
  if (!req.file) {
    throw serverErrs.BAD_REQUEST({
      arabic: "الصورة غير موجودة",
      english: "Image not found",
    });
  }

  if (student.image) {
    clearImage(student.image);
  }
  await student.update({ image: req.file.filename });
  res.send({
    status: 201,
    student,
    msg: {
      arabic: "تم تعديل الصورة بنجاح",
      english: "successful edit student image",
    },
  });
};

const resetPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { StudentId } = req.params;
  let student = await Student.findOne({
    where: { id: StudentId },
    include: { all: true },
  });
  if (!student)
    throw serverErrs.BAD_REQUEST({
      arabic: "الطالب غير موجود",
      english: "student not found",
    });
  const result = await compare(oldPassword, student?.password);
  if (!result)
    throw serverErrs.BAD_REQUEST({
      arabic: "كلمة المرور خاطئة",
      english: "Old password is wrong",
    });
  const hashedPassword = await hash(newPassword, 12);
  await student.update({ password: hashedPassword });
  student = {
    id: student.id,
    email: student.email,
    name: student.name,
    gender: student.gender,
    image: student.image,
    city: student.city,
    dateOfBirth: student.dateOfBirth,
    nationality: student.nationality,
    location: student.location,
    phoneNumber: student.phoneNumber,
    regionTime: student.regionTime,
    registerCode: student.registerCode,
    isRegistered: student.isRegistered,
    wallet: student.wallet,
    long: student.long,
    lat: student.lat,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
    LevelId: student.LevelId,
    ClassId: student.ClassId,
    CurriculumId: student.CurriculumId,
    ParentId: student.ParentId,
  };
  res.send({
    status: 201,
    data: student,
    msg: {
      arabic: "تم تغيير كلمة المرور بنجاح",
      english: "successful update student password",
    },
  });
};

const getSingleTeacher = async (req, res) => {
  const { teacherId } = req.params;
  const { currency }  = req.query;
  const teacher       = await Teacher.findOne({
    where:   { id: teacherId },
    include: [
      { model: RemoteSession },
      { model: F2FSessionStd },
      { model: F2FSessionTeacher },
      { model: LangTeachStd, include: [Language] },
      { model: Experience },
      { model: TeacherLecture     },
      { model: TeacherLesson      },
      { model: EducationDegree },
      { model: Certificates },
      { model: TeacherDay,        include: [Days] },
      { model: TeacherLevel,      include: [Level] },
      { model: CurriculumTeacher, include: [Curriculum] },
      { model: TeacherSubject,    include: [Subject] },
      { model: TeacherTypes,      include: [TrainingCategoryType] },
      { model: TeacherLimits,     include: [LimeType] },
      { model: Package,           },
      { model: Rate,              include: [Student] },
      { model: Tests,             include: [Level] },
      { model: Discounts  }
    ],
    attributes: { exclude: ["password"] },
  });
  if (!teacher)
  {
    return res.send({
    status: 500,
    msg: {
      arabic: " المدرب غير موجود",
      english: "teacher not found",
    },
  });
  }

  // let currencyConverter = new CC();

  // if (teacher.RemoteSession) {
  //   const newPriceRemote = await currencyConverter
  //     .from(teacher.RemoteSession.currency)
  //     .to(currency)
  //     .amount(+teacher.RemoteSession.priceAfterDiscount)
  //     .convert();
  //   teacher.RemoteSession.priceAfterDiscount = newPriceRemote;
  //   teacher.RemoteSession.currency = currency;
  // }
  // if (teacher.F2FSessionStd) {
  //   const newPriceF2FStudent = await currencyConverter
  //     .from(teacher.F2FSessionStd.currency)
  //     .to(currency)
  //     .amount(+teacher.F2FSessionStd.priceAfterDiscount)
  //     .convert();
  //   teacher.F2FSessionStd.priceAfterDiscount = newPriceF2FStudent;
  //   teacher.F2FSessionStd.currency = currency;
  // }
  // if (teacher.F2FSessionTeacher) {
  //   const newPriceF2FTeacher = await currencyConverter
  //     .from(teacher.F2FSessionTeacher.currency)
  //     .to(currency)
  //     .amount(+teacher.F2FSessionTeacher.priceAfterDiscount)
  //     .convert();
  //   teacher.F2FSessionTeacher.priceAfterDiscount = newPriceF2FTeacher;
  //   teacher.F2FSessionTeacher.currency = currency;
  // }

  res.send({
    status: 201,
    data: teacher,
    msg: {
      arabic: "ارجاع بيانات الملعم بنجاح مع تحويل العملة",
      english: "successful get trainer with converted currency",
    },
  });
};

const getStudentCredit = async (req, res) => {
  const { studentId } = req.params;
  const { currency } = req.query;
  const student = await Student.findOne({
    where: { id: studentId },
    attributes: ["wallet"],
    attributes: { exclude: ["password"] },
  });
  if (!student)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجود",
      english: "Invalid studentId! ",
    });

  let currencyConverter = new CC();
  const newPrice = await currencyConverter
    .from("OMR")
    .to(currency)
    .amount(+student.wallet)
    .convert();
  student.wallet = newPrice;

  res.send({
    status: 201,
    data: student,
    msg: {
      arabic: "تم ارجاع محفظة الطالب بعملته الأصلية",
      english: "successful get student wallet",
    },
  });
};

const getWalletHistory = async (req, res) => {
  const { studentId } = req.params;
  const walletHistory = await Wallet.findAll({
    where: { studentId, isPaid: true },
  });

  res.send({
    status: 201,
    data: walletHistory,
    msg: {
      arabic: "تم ارجاع تاريخ المحفظة بنجاح",
      english: "successful get Wallet History",
    },
  });
};

const getAllLessons = async (req, res) => {
  const { studentId } = req.params;
  const lessons = await Session.findAll({
    where: { StudentId: studentId, isPaid: true },
    include: [{ model: Teacher }],
  });

  res.send({
    status: 201,
    data: lessons,
    msg: {
      arabic: "تم ارجاع جميع الجلسات بنجاح",
      english: "successful get all lessons",
    },
  });
};

const getMyTeachers = async (req, res) => {
  const { studentId } = req.params;
  const teachers = await Teacher.findAll({
    include: [
      {
        model: Session,
        on: Session.TeacherId,
        where: {
          StudentId: studentId,
          isPaid:true
        },
        attributes: [],
      },
    ],
    attributes: { exclude: ["password"] },
  });
  res.send({
    status: 201,
    data: teachers,
    msg: {
      arabic: "تم ارجاع جميع مدربي التلميذ بنجاح",
      english: "successful get all student trainers",
    },
  });
};

const getComingLessons = async (req, res) => {
  const { studentId } = req.params;
  const comingLessons = await Session.findAll({
    where: {
      StudentId: studentId,
      isPaid: true,
      date: { [Op.gte]: new Date() },
    },
    include: [{ model: Teacher }],
  });

  res.send({
    status: 201,
    data: comingLessons,
    msg: {
      arabic: "تم ارجاع جميع الجلسات القادمة",
      english: "successful get all Coming Lessons",
    },
  });
};

const getPreviousLessons = async (req, res) => {
  const { studentId } = req.params;
  const previousLessons = await Session.findAll({
    where: {
      StudentId: studentId,
      isPaid: true,
      date: { [Op.lt]: new Date() },
    },
    include: [{ model: Teacher }],
  });

  res.send({
    status: 201,
    data: previousLessons,
    msg: {
      arabic: "تم ارجاع جميع الجلسات السابقة",
      english: "successful get all Previous Lessons",
    },
  });
};

const rateTeacher = async (req, res) => {
  const { StudentId, TeacherId, rating, comment } = req.body;

  const teacher = await Teacher.findOne({
    where: {
      id: TeacherId,
    },
    attributes: { exclude: ["password"] },
  });

  const session = await Session.findOne({
    where: {
      TeacherId,
      StudentId,
      isPaid: true,
    },
  });

  if (!session)
    throw serverErrs.BAD_REQUEST({
      arabic: "لا يوجد أي جلسة مع المدرب ",
      english: "You don't have any session with the trainer",
    });

  const rateData = await Rate.findOne({
    where: {
      TeacherId,
      StudentId,
    },
  });

  if (rateData)
    throw serverErrs.BAD_REQUEST({
      arabic: "لقد قمت بتقييم المدرب من قبل",
      english: "You already Rated the trainer ",
    });

  const rate = await Rate.create({
    StudentId,
    TeacherId,
    rating,
    comment,
  });

  const rates = await Rate.findAll({
    where: {
      TeacherId,
    },
    attributes: [[Sequelize.fn("AVG", Sequelize.col("rating")), "avg_rating"]],
  });

  const avgRating = rates[0].dataValues.avg_rating;
  console.log(
    "rates[0].dataValues.avg_rating: ",
    rates[0].dataValues.avg_rating
  );
  const ratingFromZeroToFive = Math.round(avgRating);

  teacher.rate = ratingFromZeroToFive;
  console.log("trainer.rate : ", teacher.rate);
  await teacher.save();

  res.send({
    status: 201,
    data: rate,
    msg: {
      arabic: "تم تقييم المدرب بنجاح",
      english: "successful rate trainer",
    },
  });
};

const getSubjectByCategoryId = async (req, res) => {
  const { id } = req.params;
  const subjects = await Subject.findAll({
    where: { SubjectCategoryId: id },
  });
  console.log(id, subjects);
  res.send({
    status: 200,
    data: subjects,
  });
};

const getCurriculumByLevelId = async (req, res) => {
  const { levelId } = req.params;
  const curriculum = await Curriculum.findAll({
    include: [
      {
        model: CurriculumLevel,
        where: { LevelId: levelId },
        attributes: [],
      },
    ],
    attributes: ["id", "titleEN", "titleAR"],
  });
  if (!curriculum)
    throw serverErrs.BAD_REQUEST({
      arabic: "المنهج غير موجود",
      english: "Invalid curriculumId! ",
    });
  res.send({
    status: 201,
    data: curriculum,
    msg: {
      arabic: "تم ارجاع المنهج بنجاح",
      english: "successful get single curriculum",
    },
  });
};

const getClassByLevelId = async (req, res) => {
  const { levelId } = req.params;
  const Classes = await Class.findAll({
    where: { LevelId: levelId },
  });
  if (!Classes)
    throw serverErrs.BAD_REQUEST({
      arabic: "الفصل غير موجود",
      english: "Invalid classId! ",
    });
  res.send({
    status: 201,
    data: Classes,
    msg: {
      arabic: "تم ارجاع الفصول بنجاح",
      english: "successful get classes",
    },
  });
};

const acceptLesson = async (req, res) => {
  const { StudentId } = req.params;
  const { SessionId } = req.body;

  const session = await Session.findOne({
    where: {
      id: SessionId,
      StudentId,
    },
  });

  if (!session)
    throw serverErrs.BAD_REQUEST({
      arabic: "الجلسة غير موجودة",
      english: "session not found",
    });

  await session.update({ studentAccept: true });


  res.send({
    status: 201,
    msg: {
      arabic: "تم تعديل الجلسة بنجاح",
      english: "successful update session",
    },
  });
};

const startLesson = async (req, res) => {
  try {
    const { StudentId } = req.params;
    const { SessionId, lang = "en" } = req.body;

    const session = await Session.findOne({
      where: {
        id: SessionId,
        StudentId,
      },
    });

    if (!session) {
      return res.status(400).send({
        status: 400,
        message: {
          arabic: "الجلسة غير موجودة",
          english: "Session not found",
        },
      });
    }

    const now = Date.now();
    await session.update({ startedAt: now });

    const [student, teacher] = await Promise.all([
      Student.findByPk(StudentId),
      Teacher.findByPk(session.TeacherId),
    ]);

    // إرسال رسالة واتساب عند بدء الدرس
    await sendLessonNotification({
      type: "lesson_started",
      student,
      teacher,
      language: lang,
      lessonDetails: {
        date: session.date || new Date().toLocaleDateString("ar-EG"),
        time: session.period || new Date().toLocaleTimeString("ar-EG"),
      },
    });

    const message = lang === "ar" ? "تم بدء الدرس الان" : "The lesson has started now";

    await Promise.all([
      sendNotification(message, message, StudentId, "lesson_start", "student"),
      sendNotification(message, message, teacher.id, "lesson_start", "teacher"),
      sendLessonEmail(student.email, lang, message, "start"),
      sendLessonEmail(teacher.email, lang, message, "start"),
    ]);

    return res.status(201).send({
      status: 201,
      msg: {
        arabic: "تم بدء الجلسة بنجاح",
        english: "Lesson started successfully",
      },
    });
  } catch (error) {
    console.error("❌ Error in startLesson:", error);
    return res.status(500).send({
      status: 500,
      error: error.message,
      msg: {
        arabic: "حدث خطأ أثناء بدء الجلسة",
        english: "An error occurred while starting the session",
      },
    });
  }
};

const nearestTeachers = async (req, res) => {
  const { StudentId } = req.params;

  const student = await Student.findOne({
    where: {
      id: StudentId,
    },
  });

  if (!student)
    throw serverErrs.BAD_REQUEST({
      arabic: "الطالب غير موجودة",
      english: "student not found",
    });
  const teachers = await Teacher.findAll({
    where: { isVerified: 1, isRegistered: true },
    include: [
      {
        model: TeacherSubject,
        on: TeacherSubject.TeacherId,
        include: [{ model: Subject, on: Subject.id }],
      },
    ],
    attributes: { exclude: ["password"] },
  });

  const lon1 = student.long;
  const lat1 = student.lat;
  const result = [];
  teachers?.forEach((tch) => {
    const lon2 = tch.long;
    const lat2 = tch.lat;
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in metres

    if (d < 10 * 4000) {
      result.push(tch);
    }
    // if (d < distance * 1000) {
    //   result.push(tch);
    // }
  });

  console.log("GET MAp");
  console.log(result.length);

  res.send({
    status: 201,
    result,
    msg: {
      arabic: "تم ايجاد المدربين في مسافة 15 كيلو متر",
      english: "successful get trainers in 15 kilo meter",
    },
  });
};
const getFinancialRecords = async (req, res) => {
  const { StudentId } = req.params;
  const student = await Student.findOne({
    where: {
      id: StudentId,
    },
  });

  if (!student)
    throw serverErrs.BAD_REQUEST({
      arabic: "الطالب غير موجودة",
      english: "student not found",
    });
  const financialRecords = await FinancialRecord.findAll({
    where: {
      StudentId: StudentId,
    },
    include: [
      {
        model: Teacher,
        attributes: ["firstName", "lastName"],
        required: false,
      },
    ],
  });
  res.send({
    status: 201,
    data: financialRecords,
    msg: {
      arabic: "تم إرجاع سجل الدفوعات الخاصة بالطالب بنجاح",
      english: "Student financial records returned successfully",
    },
  });
};

const updateNotification = async (req, res) => {
  const { StudentId } = req.params;
  const notificationsRef = db.collection("Notifications");
  const query = notificationsRef.where("StudentId", "==", StudentId);

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

// Developer by eng.reem.shwky@gmail.com
const settingNotification = async (req, res) => {
  const { studentId } = req.params;
  const student = await Student.findOne({
    where: { id: studentId },
    attributes: { exclude: ["password"] },
  });
  if (!student)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجود",
      english: "Invalid trainerId! ",
    });

  if (student.id != req.user.userId)
    throw serverErrs.BAD_REQUEST({
      arabic: "لا يوجد حق بالوصول",
      english: "No Auth ",
    });

  const { isnotify } = req.body;

  await student.update({
    isnotify,
  });

  await student.save();

  res.send({
    status: 201,
    data: { student },
    msg : {
      arabic: "تم تعديل معلومات بنجاح",
      english: "successful edit Information! ",
    },
  });
};

const getParentsByStudentId = async (req, res) => {
  const { StudentId } = req.params;
  const student = await Student.findOne({
    where: {
      id: StudentId,
    },
  });

  if (!student)
    throw serverErrs.BAD_REQUEST({
      arabic: "الطالب غير موجودة",
      english: "student not found",
    });

    const dataParents = await ParentStudent.findAll({
      where: {
        StudentId: StudentId,
      },
      include: {
        model: Parent,
      },
    });

    res.send({
      status: 201,
      data: dataParents,
      msg: {
        arabic  : "ارجاع جميع الابناء للابناء",
        english : "successful get all Parents for single Student",
      },
    });
};

const updateLogout = async (req, res) => {
  console.log("Logout Student");
  console.log(req.params);

  const { studentId } = req.params;
  const student = await Student.findOne({
    where: { id: studentId },
    attributes: { exclude: ["password"] },
  });

  await student.update({
    isOnline : false,
  });

  await student.save();

  res.send({
    status: 201,
    data: { student },
    msg : {
      arabic: "تم تعديل معلومات بنجاح",
      english: "successful edit Information! ",
    },
  });
};

const bookLecture = async (req, res) => {
  const { StudentId, TeacherLectureId } = req.body;

  const obj_student = await Student.findOne({
    where: {
      id: StudentId,
    },
    attributes: { exclude: ["password"] },
  });

  if (!obj_student)
    throw serverErrs.BAD_REQUEST({
      arabic  : "هـذا الطالب غير مسجل بنظام",
      english : "This student is not registered in the system",
    });

  const studentLecture = await StudentLecture.findOne({
    where: {
      TeacherLectureId,
      StudentId,
      //isPaid: true,
    },
  });

  if (studentLecture)
    throw serverErrs.BAD_REQUEST({
      arabic: "قمت بالتسجيل في هـذه الدوره مسبقا ",
      english: "I have already registered for this course.",
    });

  const objStLe = await StudentLecture.create({
    StudentId,
    TeacherLectureId,
  });


  res.send({
    status: 201,
    data: objStLe,
    msg: {
      arabic: "تم اشتراك الدوره بنجاح المدرب بنجاح",
      english: "successful subscribe to our course",
    },
  });
};

const bookPackage = async (req, res) => {
  const { StudentId, PackageId , currency } = req.body;
  const obj_student = await Student.findOne({
    where: {
      id: StudentId,
    },
    attributes: { exclude: ["password"] },
  });

  if (!obj_student)
    throw serverErrs.BAD_REQUEST({
      arabic  : "هـذا الطالب غير مسجل بنظام",
      english : "This student is not registered in the system",
    });

  const objStudentPackage = await StudentPackage.findOne({
    where: {
      PackageId : PackageId,
      StudentId : StudentId,
    },
  });

  if (objStudentPackage)
    throw serverErrs.BAD_REQUEST({
      arabic: "قمت بالتسجيل في هـذه الباقة مسبقا ",
      english: "I have already registered for this package.",
    });

  const objStLe = await StudentPackage.create({
    PackageId : PackageId,
    StudentId : StudentId,
    currency  : currency,
    price     : "0",
    isPaid    : "1",
    typeOfPayment : "Free",
  });

  res.send({
    status: 201,
    data: objStLe,
    msg: {
      arabic: "تم اشتراك الباقة بنجاح المدرب بنجاح",
      english: "successful subscribe to our package",
    },
  });
};

const bookTest = async (req, res) => {
  const { StudentId, TestId, day } = req.body;
  const objStudent = await Student.findOne({
    where: {
      id: StudentId,
    },
  });

  if (!objStudent)
    throw serverErrs.BAD_REQUEST({
      arabic  : "هـذا الطالب غير مسجل بنظام",
      english : "This student is not registered in the system",
    });

  const objTest = await Tests.findOne({
    where: {
      TestId : TestId,
    },
  });

  if (!objTest)
    throw serverErrs.BAD_REQUEST({
      arabic  : "هـذا الاختبار غير مسجل بنظام",
      english : "This test is not registered in the system",
    });

  const objStudentTest = await StudentTest.findOne({
    where: {
      TestId    : TestId,
      StudentId : StudentId,
    },
  });

  if (objStudentTest)
    throw serverErrs.BAD_REQUEST({
      arabic: "قمت بالتسجيل في هـذه الاختبار مسبقا ",
      english: "I have already registered for this test.",
    });

  const objST = await StudentTest.create({
    TestId : TestId,
    StudentId : StudentId,
    day : day
  });

  res.send({
    status: 201,
    data: objST,
    msg: {
      arabic: "تم اشتراك الاختبار بنجاح المدرب بنجاح",
      english: "successful subscribe to our test",
    },
  });
};

const getStudentTests = async (req, res) => {
  const { StudentId } = req.params;
  const student = await Student.findOne({
    where: {
      id: StudentId,
    },
  });

  if (!student)
    throw serverErrs.BAD_REQUEST({
      arabic: "الطالب غير موجودة",
      english: "student not found",
    });

    const dataStudentTest = await StudentTest.findAll({
      where: {
        StudentId: StudentId,
        isPaid:true
      },
      include: [
        { model: Tests , include: [Level] },
      ]
      ,
    });
 const enrichedTest = await Promise.all(dataStudentTest.map(async (test) => {
    const teacherTest = test.Test;

    if (!teacherTest) return test; 

    const curriculum = await Curriculum.findOne({ where: { id: teacherTest.curriculums } });
    const classData = await Class.findOne({ where: { id: teacherTest.class } });
    const subject = await Subject.findOne({ where: { id: teacherTest.subject } });
    const level = await Level.findOne({ where: { id: teacherTest.LevelId } });
    const teacher = await Teacher.findOne({ where: { id: teacherTest.TeacherId } });

    return {
      ...test.toJSON(),
      Test: {
        ...teacherTest.toJSON(),
        curriculum,
        classData,
        subject,
        level,
        teacher
      },
    };
  }));
    res.send({
      status: 201,
      data: enrichedTest,
      msg: {
        arabic  : "ارجاع جميع الاختبارات الموافقة عليها",
        english : "successful get all Tests",
      },
    });
};

const getStudentLectures = async (req, res) => {
  const { StudentId } = req.params;

  const student = await Student.findOne({ where: { id: StudentId } });

  if (!student) {
    throw serverErrs.BAD_REQUEST({
      arabic: "الطالب غير موجودة",
      english: "Student not found",
    });
  }

  // جلب المحاضرات
  const dataTeacherLecture = await StudentLecture.findAll({
    where: {
      StudentId: StudentId,
      isPaid: true,
    },
    include: [{ model: TeacherLecture }],
  });

  // جلب بيانات المنهج والفصل والمادة لكل محاضرة
  const enrichedLectures = await Promise.all(dataTeacherLecture.map(async (lecture) => {
    const teacherLecture = lecture.TeacherLecture;

    if (!teacherLecture) return lecture; // في حال كانت المحاضرة null

    const curriculum = await Curriculum.findOne({ where: { id: teacherLecture.curriculums } });
    const classData = await Class.findOne({ where: { id: teacherLecture.class } });
    const subject = await Subject.findOne({ where: { id: teacherLecture.subject } });

    return {
      ...lecture.toJSON(),
      TeacherLecture: {
        ...teacherLecture.toJSON(),
        curriculum,
        classData,
        subject,
      },
    };
  }));

  return res.status(200).json({
    status: 200,
    data: enrichedLectures,
    msg: {
      arabic: "تم استرجاع المحاضرات بنجاح مع التفاصيل",
      english: "Lectures fetched successfully with full details",
    },
  });
};

const getRefundStudentById = async (req, res) =>{
  const { StudentId } = req.params;
  const objStudent = await Student.findOne({
    where  : { id: StudentId }
  });
  if (!objStudent)
    throw serverErrs.BAD_REQUEST({
      arabic: "الطالب غير موجودة",
      english: "Invalid Student! ",
    });
  
  const dataRefund = await StudentRefund.findAll({
      where: {
        StudentId: StudentId,
      },
  });


  res.send({
    status: 201,
    data  : dataRefund,
    msg: {
      arabic: "تم عمليه الاسترجاع بنجاح",
      english: "successful add Refund success",
    },
  });
}

const getStudentPackages = async (req, res) => {
  const { StudentId } = req.params;

  const student = await Student.findOne({ where: { id: StudentId } });

  if (!student) {
    return res.status(400).json({
      message: {
        arabic: "الطالب غير موجود",
        english: "Student not found",
      },
    });
  }

  // جميع الباقات التي دفعها الطالب
  const studentPackages = await StudentPackage.findAll({
    where: {
      StudentId,
      isPaid: true,
    },
  });

  // الحصول على تفاصيل كل باقة مرتبطة
  const fullPackages = await Promise.all(
    studentPackages.map(async (pkg) => {
      const packageData = await Package.findOne({
        where: { id: pkg.PackageId }, // نفترض أن StudentPackage يحتوي على PackageId
      });

      if (!packageData) return null;

      const level = await Level.findOne({ where: { id: packageData.LevelId } });
      const classId = await Class.findOne({ where: { id: packageData.class } });
      const curriculum = await Curriculum.findOne({ where: { id: packageData.curriculums } });

      return {
        ...packageData.dataValues,
        level: level ? level.dataValues : null,
        classId: classId ? classId.dataValues : null,
        curriculums: curriculum ? curriculum.dataValues : null,
      };
    })
  );

  // إزالة الباقات التي لم يتم العثور عليها (null)
  const filteredPackages = fullPackages.filter(pkg => pkg !== null);

  return res.status(200).json({
    status: 200,
    data: filteredPackages,
    msg: {
      arabic: "تم استرجاع جميع الباقات المدفوعة",
      english: "Successfully retrieved all paid packages",
    },
  });
};


const getStudentDiscounts = async (req, res) => {
  const { StudentId } = req.params;
  const student = await Student.findOne({
    where: {
      id: StudentId,
    },
  });

  if (!student)
    throw serverErrs.BAD_REQUEST({
      arabic: "الطالب غير موجودة",
      english: "student not found",
    });

    const dataTeacherDiscount = await StudentDiscount.findAll({
      where: {
        StudentId: StudentId,
        isPaid:true
      },
      include: [
        { model: Discounts },
      ]
    });
const enrichedDiscount = await Promise.all(dataTeacherDiscount.map(async (discount) => {
    const teacherDiscount = discount.Discount;

    if (!teacherDiscount) return discount; 

    const curriculum = await Curriculum.findOne({ where: { id: teacherDiscount.curriculums } });
    const classData = await Class.findOne({ where: { id: teacherDiscount.class } });
    const subject = await Subject.findOne({ where: { id: teacherDiscount.subject } });
    const teacher = await Teacher.findOne({ where: { id: teacherDiscount.TeacherId } });

    return {
      ...discount.toJSON(),
      Discount: {
        ...teacherDiscount.toJSON(),
        curriculum,
        classData,
        subject,
        teacher
      },
    };
  }));
    res.send({
      status: 201,
      data: enrichedDiscount,
      msg: {
        arabic  : "ارجاع جميع الخصومات الموافقة عليها",
        english : "successful get all Discounts",
      },
    });
};

async function getLecturesWithQuestions(req, res) {
  try {
    const { StudentId } = req.params; // جلب studentId من المعاملات

    // الخطوة 1: جلب المحاضرات التي سجل فيها الطالب ويحتوي بعضها على أسئلة
    const sessions = await StudentLecture.findAll({
      where: {
        StudentId: StudentId,
        isPaid: 1, // التأكد أن الطالب قبل المحاضرة
      }
    });

    if (!sessions.length) {
      return res.status(404).send({
        message: {
          arabic: "الطالب غير مشترك في أي محاضرة",
          english: "The student is not enrolled in any lecture",
        },
      });
    }
    console.log(sessions);
    

    const lectureIds = sessions.map((session) => session.TeacherLectureId);

    // الخطوة 2: جلب الأسئلة المتعلقة بتلك المحاضرات
    const lecturesWithQuestions = await TeacherQuestion.findAll({
      where: {
        TeacherLectureId: lectureIds, // جلب الأسئلة للمحاضرات التي يشترك فيها الطالب
      }
    });

    if (!lecturesWithQuestions.length) {
      return res.status(404).send({
        message: {
          arabic: "لا توجد محاضرات تحتوي على أسئلة",
          english: "No lectures with questions found",
        },
      });
    }

    const lecturesWithQuestionsIds = lecturesWithQuestions.map((q) => q.TeacherLectureId);

    // الخطوة 3: جلب أسماء المحاضرات المرتبطة بتلك المحاضرات
    const lectures = await TeacherLecture.findAll({
      where: {
        id: lecturesWithQuestionsIds,
      },
      attributes: ["id", "titleEN","titleAR"], // جلب الاسم والمعرّف فقط
    });

    // الخطوة 4: إنشاء الشكل النهائي للبيانات
    const responseData = lectures.map((lecture) => ({
      Id: lecture.id,
      nameEN: `Question of ${lecture.titleEN}`,
      nameAR: `أسئلة عن ${lecture.titleAR}`,
    }));

    // الخطوة 5: إرسال النتيجة
    res.status(200).send({
      status: "success",
      data: responseData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: error.message || error,
      message: {
        arabic: "حدث خطأ أثناء استرجاع البيانات",
        english: "An error occurred while fetching the data",
      },
    });
  }
}
async function getMyQuestions(req, res) {
  try {
    const { id } = req.params;

    // جلب الأسئلة الخاصة بالمحاضرة
    const questions = await TeacherQuestion.findAll({
      where: {
        TeacherLectureId: id,
      },
      attributes: ["id", "TeacherLectureId", "titleAR", "titleEN"],
    });

    if (!questions.length) {
      return res.status(404).send({
        message: {
          arabic: "لا توجد أسئلة مرتبطة بهذه المحاضرات",
          english: "No questions found for these lectures",
        },
      });
    }

    // جلب الإجابات لكل سؤال والتحقق من عدد الإجابات
    const questionsWithAnswers = await Promise.all(
      questions.map(async (question) => {
        const answers = await TeacherQuestionChoose.findAll({
          where: { TeacherQuestionId: question.id },
          attributes: ["id", "titleAR", "titleEN", "isCorrectAnswer"],
        });

        // إذا كان عدد الإجابات أقل من 4، لا يتم تضمين السؤال
        if (answers.length < 4) {
          return null; // إعادة null في حالة عدم وجود 4 إجابات
        }

        return {
          ...question.dataValues,
          answers,
        };
      })
    );

    // إزالة الأسئلة التي لم تحتوي على 4 إجابات
    const filteredQuestions = questionsWithAnswers.filter(
      (question) => question !== null
    );

    if (!filteredQuestions.length) {
      return res.status(404).send({
        message: {
          arabic: "لا توجد أسئلة تحتوي على 4 إجابات أو أكثر",
          english: "No questions with 4 or more answers found",
        },
      });
    }

    // إرسال النتيجة
    res.status(200).send({
      status: "success",
      data: filteredQuestions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: error.message || error,
      message: {
        arabic: "حدث خطأ أثناء استرجاع البيانات",
        english: "An error occurred while fetching the data",
      },
    });
  }
}

const getSessionsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const [sessions, discounts, lectures, packages, tests] = await Promise.all([
      Session.findAll({
        where: {
          StudentId: studentId,
          type: { [Op.in]: ["Online", "student", "teacher"] },
          isPaid: true,
        },
        attributes: [
          "id", "title", "date", "period", "type", "price", "currency", "isPaid", "createdAt",
        ],
        include: [
          {
            model: Teacher,
            attributes: ["id", "firstName", "lastName", "email", "phone"],
            include: [
              {
                model: TeacherSubject,
                include: [
                  {
                    model: Subject,
                    include: [{ model: SubjectCategory }],
                  },
                ],
              },
            ],
          },
        ],
      }),

      StudentDiscount.findAll({ where: { StudentId: studentId, isPaid: true } }),
      StudentLecture.findAll({ where: { StudentId: studentId, isPaid: true } }),
      StudentPackage.findAll({ where: { StudentId: studentId, isPaid: true } }),
      StudentTest.findAll({ where: { StudentId: studentId, isPaid: true } }),
    ]);

    // دالة مساعد لجلب بيانات المعلم لأي عنصر فيه TeacherId
    const attachTeacherData = async (records) => {
      return await Promise.all(
        records.map(async (item) => {
          const data = item.toJSON();
          if (data.TeacherId) {
            const teacher = await Teacher.findOne({
              where: { id: data.TeacherId },
              attributes: ["id", "firstName", "lastName", "email", "phone"],
            });
            return { ...data, Teacher: teacher || null };
          }
          return { ...data, Teacher: null };
        })
      );
    };

    // دمجهم بعد إضافة بيانات المعلم إن وجد
    const [
      lecturesWithTeacher,
      packagesWithTeacher,
      discountsWithTeacher,
      testsWithTeacher,
    ] = await Promise.all([
      attachTeacherData(lectures),
      attachTeacherData(packages),
      attachTeacherData(discounts),
      attachTeacherData(tests),
    ]);

    // تجميع كل البيانات في مصفوفة واحدة
    const combinedData = [
      ...sessions.map((item) => ({ Type: "session", ...item.toJSON() })),
      ...lecturesWithTeacher.map((item) => ({ Type: "lecture", ...item })),
      ...packagesWithTeacher.map((item) => ({ Type: "package", ...item })),
      ...discountsWithTeacher.map((item) => ({ Type: "discount", ...item })),
      ...testsWithTeacher.map((item) => ({ Type: "test", ...item })),
    ];

    if (combinedData.length === 0) {
      return res.status(404).json({
        status: 404,
        msg: {
          arabic: "لا توجد بيانات لهذا الطالب",
          english: "No data found for this student",
        },
      });
    }

    res.status(200).json({
      status: 200,
      data: combinedData,
      msg: {
        arabic: "تم جلب البيانات بنجاح",
        english: "Data fetched successfully",
      },
    });

  } catch (error) {
    console.error("Error fetching student data:", error);
    res.status(500).json({
      status: 500,
      error: error.message,
      msg: {
        arabic: "حدث خطأ أثناء جلب البيانات",
        english: "An error occurred while fetching the data",
      },
    });
  }
};
const getEvaluationsByStudent = async (req, res) => {
  try {
    const { StudentId } = req.params;

    const evaluations = await Evaluations.findAll({
      where: { StudentId },
      order: [["certificateDate", "DESC"]],
      include: [
        {
          model: Teacher,
          attributes: ["id", "firstName", "lastName", "email", "phone"],
        },
      ],
    });

    res.status(200).json({
      msg: "تم جلب التقييمات بنجاح",
      data: evaluations,
    });
  } catch (err) {
    console.error("❌ Error fetching evaluations:", err);
    res.status(500).json({ msg: "حدث خطأ أثناء جلب التقييمات", error: err.message });
  }
};

const checkStudentSubscription = async (req, res) => {
  try {
    const { StudentId, type,val } = req.params;

    if (!StudentId || !type) {
      return res.status(400).json({
        status: 400,
        msg: {
          arabic: "الطالب أو نوع الاشتراك غير موجود",
          english: "Student ID or subscription type is missing",
        },
      });
    }

    let model;

    switch (type) {
      case "LectureId":
        model = StudentLecture;
        break;
      case "TestId":
        model = StudentTest;
        break;
      case "DiscountId":
        model = StudentDiscount;
        break;
      case "PackageId":
        model = StudentPackage;
        break;
      default:
        return res.status(400).json({
          status: 400,
          msg: {
            arabic: "نوع الاشتراك غير صالح",
            english: "Invalid subscription type",
          },
        });
    }

    const subscription = await model.findOne({
      where: { StudentId ,isPaid:1,[type]: val},
    });

    return res.status(200).json({
      status: 200,
      data:subscription,
      subscription: subscription ? true : false,
      msg: {
        arabic: subscription ? "لقد قمت بحجزها من قبل " : "الطالب غير مشترك",
        english: subscription ? "I have already booked it." : "Student is not subscribed",
      },
    });

  } catch (error) {
    console.error("Error checking subscription:", error);
    return res.status(500).json({
      status: 500,
      msg: {
        arabic: "حدث خطأ أثناء التحقق من الاشتراك",
        english: "An error occurred while checking subscription",
      },
    });
  }
};

const getStudentStats = async (req, res) => {
  try {
    const { StudentId } = req.params;
    const currentYear = new Date().getFullYear();

    // خطوة 1: اجلب البيانات من قاعدة البيانات
const sessions = await Session.findAll({
  where: {
    isPaid: true,
    StudentId: StudentId,
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
      StudentId:StudentId
    },
  });




  const lessonWaiting = await Lessons.count({
    where: {
      StudentId:StudentId,
      status: "pending",
    },
  });
  const lessonOnline = await Lessons.count({
    where: {
      StudentId:StudentId,
      status: "approved",
    },
  });
  const lessonCanceled = await Lessons.count({
    where: {
      StudentId:StudentId,
      status: "canceled",
    },
  });

  const teachers = await Teacher.count({
    include: [
      {
        model: Session,
        on: Session.StudentId,
        where: {
          StudentId: StudentId,
        },
      },
    ],
  });

  const lessonsByInstructor = await Teacher.findAll({
  include: [
    {
      model: Session,
      where: {
        StudentId: StudentId, 
        isPaid:true
      },
      attributes: [], // لا ترجع كل تفاصيل الجلسة
    },
  ],
  attributes: [
    'id',
    'firstName', 
    'lastName', 
    [Sequelize.fn('COUNT', Sequelize.col('Sessions.id')), 'sessionsCount']
  ],
  group: ['Teacher.id'], // مهم جداً لتجميع النتائج
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
    StudentId: StudentId,
    createdAt: {
      [Op.between]: [startOfWeek, endOfWeek],
    },
  },
});

const completedLessons = await Session.count({
  where: {
    isPaid: true,
    teacherAccept: true,
    studentAccept: true,
    StudentId: StudentId,
  },
});

  const packagePay= await StudentPackage.count({
    where: {
      isPaid: true ,
    },
  });
  const testPay= await StudentTest.count({
    where: {
      isPaid: true ,
    },
  });
  const lecturePay= await StudentLecture.count({
    where: {
      isPaid: true ,
    },
  });
  const discountPay= await StudentDiscount.count({
    where: {
      isPaid: true ,
    },
  });

    return res.status(200).json({
      teachers,
      packagePay,
      discountPay,
      sessionsThisWeek,
      sessionsNumber,
      testPay,
      lecturePay,
      lessonCanceled,
      lessonOnline,
      lessonWaiting,
      completedLessons,
      lessonsChart:monthlyData,
      bookingsByType:[
        { name: "Package", value: packagePay },
        { name: "Test", value: testPay },
        { name: "Lecture", value: lecturePay },
        { name: "Lesson", value: lessonOnline },
      ],
      lessonsByInstructor,
    });
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
module.exports = {
  checkStudentSubscription,
  getStudentStats,
  getEvaluationsByStudent,
  getLecturesWithQuestions,
  getSessionsByStudent,
  getMyQuestions,
  createExchangeRequestsStudent,
  signUp,               verifyCode,       signPassword,
  signData,             getStudents,      getSingleStudent,
  getLastTenStudent,    editPersonalInformation,
  editImageStudent,     resetPassword,
  getSingleTeacher,     getStudentCredit,
  getWalletHistory,     getAllLessons,
  getComingLessons,     getPreviousLessons,
  rateTeacher,          getSubjectByCategoryId,
  getCurriculumByLevelId, getClassByLevelId,
  acceptLesson,         startLesson,
  nearestTeachers,      getMyTeachers,
  getFinancialRecords,  updateNotification,
  settingNotification,      getParentsByStudentId,
  updateLogout,             bookLecture,          bookPackage,
  bookTest,                 getStudentTests,      getStudentLectures,
  getStudentPackages,       getRefundStudentById, getStudentDiscounts,
  
};
