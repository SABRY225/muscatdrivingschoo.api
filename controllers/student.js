const {
  Teacher,        Student,          Parent,
  LangTeachStd,   RemoteSession,    F2FSessionStd,
  F2FSessionTeacher,   Level,       Curriculum,
  Class,          Experience,       EducationDegree,
  Certificates,   TeacherDay,       TeacherLevel,
  CurriculumTeacher,  Days,         Language,
  Subject,        Wallet,           Session,
  CurriculumLevel,FinancialRecord,  TeacherTypes,
  // Developer by eng.reem.shwky@gmail.com
  TrainingCategoryType,   TeacherLimits,            TeacherLecture,
  TeacherLesson,          LimeType,                 ParentStudent,
  Package,                StudentPackage,           Tests,
  StudentTest,            ExchangeRequestsStudent,
  StudentRefund,          Discounts,                StudentDiscount
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
const { Op } = require("sequelize");
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
dotenv.config();

const signUp = async (req, res) => {
  const { email, phoneNumber, name, location, language } = req.body;
  await validateStudent.validate({ email, name, location });

  const teacher = await Teacher.findOne({
    where: {
      email,
      isRegistered: true,
    },
  });

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

  if (teacher)
    throw serverErrs.BAD_REQUEST({
     //arabic: "الايميل مستخدم من قبل",
     // english: "email is already used",
     arabic      : "عفوا ، الحساب غير صالح لانشاء ، نرجو مراجعه بياناتك مره اخري لكي يتم انشاء حسابك بشكل ناجح",
      english     : "Sorry, the account is not valid for creation. Please review your data again so that your account can be created successfully.",
    });
  if (student)
    throw serverErrs.BAD_REQUEST({
      //arabic: "الايميل مستخدم من قبل",
      //english: "email is already used",
      arabic      : "عفوا ، الحساب غير صالح لانشاء ، نرجو مراجعه بياناتك مره اخري لكي يتم انشاء حسابك بشكل ناجح",
      english     : "Sorry, the account is not valid for creation. Please review your data again so that your account can be created successfully.",
    });
  if (parent)
    throw serverErrs.BAD_REQUEST({
      //arabic: "الايميل مستخدم من قبل",
      //english: "email is already used",
      arabic      : "عفوا ، الحساب غير صالح لانشاء ، نرجو مراجعه بياناتك مره اخري لكي يتم انشاء حسابك بشكل ناجح",
      english     : "Sorry, the account is not valid for creation. Please review your data again so that your account can be created successfully.",
    });

  const code = generateRandomCode();
  const existStudent = await Student.findOne({
    where: {
      email,
      isRegistered: false,
    },
  });
  if (existStudent) await existStudent.update({ registerCode: code });
  else {
    const newStudent = await Student.create({
      email,  name,  location, registerCode: code, phoneNumber,
    });
    await newStudent.save();
  }

  const mailOptions = generateConfirmEmailBody(code, language, email);
  const smsOptions = {
    body: generateConfirmEmailSMSBody(language, code),
    to: phoneNumber,
  };
  sendEmail(mailOptions, smsOptions);
   await sendWhatsAppVerificationCode(
  phoneNumber,    // رقم الهاتف
  code,           // كود التحقق
  language        // اللغة (ar أو en_US)
);

  res.send({
    status: 201,
    msg: { arabic: "تم ارسال الإيميل بنجاح", english: "successful send email" },
  });
  //res.send({ status: 201, msg: "successful send email" });
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

// بعد تسجيل الطالب بنجاح
await sendWhatsAppTemplate({
  to: student.phoneNumber,
  templateName: "hello_user",
  variables: [student.name || "student"],
  language: language === "ar" ? "ar" : "en_US",
  recipientName: student.name || "student"
});

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

  let currencyConverter = new CC();

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
  console.log("date.now: ", Date.now());
  await session.update({ startedAt: Date.now() });

  res.send({
    status: 201,
    msg: {
      arabic: "تم تعديل الجلسة بنجاح",
      english: "successful update session",
    },
  });
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
      },
      include: [
        { model: Tests , include: [Level] },
      ]
      ,
    });

    res.send({
      status: 201,
      data: dataStudentTest,
      msg: {
        arabic  : "ارجاع جميع الاختبارات الموافقة عليها",
        english : "successful get all Tests",
      },
    });
};

const getStudentLectures = async (req, res) => {
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

    const dataTeacherLecture = await StudentLecture.findAll({
      where: {
        StudentId: StudentId,
      },
    
      include: [
        { model: TeacherLecture },
      ]
  
    });

    res.send({
      status: 201,
      data: dataTeacherLecture,
      msg: {
        arabic  : "ارجاع جميع المحاضرات الموافقة عليها",
        english : "successful get all Lectures",
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

    const dataTeacherPackage = await StudentPackage.findAll({
      where: {
        StudentId: StudentId,
      },
      include: [
        { model: Package },
      ]
    });

    res.send({
      status: 201,
      data: dataTeacherPackage,
      msg: {
        arabic  : "ارجاع جميع الباقات الموافقة عليها",
        english : "successful get all Packages",
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
      },
      include: [
        { model: Discounts },
      ]
    });

    res.send({
      status: 201,
      data: dataTeacherDiscount,
      msg: {
        arabic  : "ارجاع جميع الخصومات الموافقة عليها",
        english : "successful get all Discounts",
      },
    });
};

module.exports = {
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
  // Develoepr By eng.reem.shwky@gmail.com
  settingNotification,      getParentsByStudentId,
  updateLogout,             bookLecture,          bookPackage,
  bookTest,                 getStudentTests,      getStudentLectures,
  getStudentPackages,       getRefundStudentById, getStudentDiscounts,
  
};
