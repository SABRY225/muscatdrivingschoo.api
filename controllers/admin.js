const {
  Admin,            Class,              Level,
  Subject,          SubjectCategory,    Curriculum,
  CurriculumLevel,  ParentStudent,      Student,
  Teacher,          TeacherLevel,       LanguageLevel,
  Session,          Wallet,             Parent,
  SocialMedia,      CheckoutRequest,    LangTeachStd,
  CurriculumTeacher,RemoteSession,      F2FSessionStd,
  F2FSessionTeacher,Certificates,       Experience,
  EducationDegree,  TeacherDay,
  // ADD By eng.reem.shwky@gamil.com
  TrainingCategoryType,         TeacherTypes,   LimeType,
  Package,                      Rate,           DrivingLicenses,
  TeacherLecture,               TeacherLimits,
  ExchangeRequestsTeacher,
  CareerDepartment,             Career,     News,         Tests,
  ExchangeRequestsParent,
  ExchangeRequestsStudent,      Ads,
  Discounts,                    StudentRefund,  TeacherRefund,
  AdsDepartment,                AdsImages,      WhatsData,
} = require("../models");

const { PDFDocument } = require("pdf-lib");
const path      = require("path");
const fs        = require("fs");
const pdf       = require("html-pdf");
const sendEmail = require("../middlewares/sendEmail");
const { adminSendEmailBody } = require("../utils/EmailBodyGenerator");
const { validateAdminSignUp,  loginValidation,  profitValidation, } = require("../validation");
const { serverErrs }    = require("../middlewares/customError");
const { compare, hash } = require("bcrypt");
const generateToken     = require("../middlewares/generateToken");
const { Op } = require("sequelize");
const { Notifications } = require("../firebaseConfig");
const { promisify }     = require("util");
const TeacherSubject    = require("../models/TeacherSubject");
const FinancialRecord   = require("../models/financialRecord");
const { options } = require("../routes/admin");
const fetch = (...args) =>
import("node-fetch").then(({ default: fetch }) => fetch(...args));

const dotenv = require("dotenv");
const Statistics = require("../models/Statistics");
dotenv.config();
const signUp = async (req, res) => {
  const { name, email, password } = req.body;
  await validateAdminSignUp.validate({ name, email, password });
  const admin = await Admin.findOne({
    where: {
      email,
    },
  });
  if (admin)
    throw serverErrs.BAD_REQUEST({
      arabic: "الإيميل مستخدم سابقا",
      english: "email is already used",
    });

  const hashedPassword = await hash(password, 12);

  const newAdmin = await Admin.create(
    {
      name,
      email,
      password: hashedPassword,
    },
    {
      returning: true,
    }
  );
  await newAdmin.save();
  const { id } = newAdmin;
  const token = await generateToken({ userId: id, name, role: "admin" });
  console.log(token);
  // res.cookie("token", token);

  res.send({
    status: 201,
    data: newAdmin,
    msg: { arabic: "تم التسجيل بنجاح", english: "successful sign up" },
    token: token,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  await loginValidation.validate({ email, password });

  const admin = await Admin.findOne({ where: { email } });
  if (!admin)
    throw serverErrs.BAD_REQUEST({
      arabic: "خطأ في الإيميل أو كلمة السر",
      english: "Wrong Email Or Password",
    });

  const result = await compare(password, admin.password);
  if (!result)
    throw serverErrs.BAD_REQUEST({
      arabic: "خطأ في الإيميل أو كلمة السر",
      english: "Wrong Email Or Password",
    });

  const { id, name } = admin;

  const token = await generateToken({ userId: id, name, role: "admin" });
  // res.cookie("token", token);

  res.send({
    status: 201,
    data: admin,
    msg: { arabic: "تم تسجيل الدخول بنجاح", english: "successful log in" },
    token: token,
  });
};

const createStudent = async (req, res) => {
  const { email, phoneNumber, name, location, password } = req.body;
  const teacher = await Teacher.findOne({
    where: {
      email,
    },
  });

  const student = await Student.findOne({
    where: {
      email,
    },
  });
  const parent = await Parent.findOne({
    where: {
      email,
    },
  });
  if (teacher || student || parent)
    throw serverErrs.BAD_REQUEST({
      arabic: "الإيميل مستخدم سابقا",
      english: "email is already used",
    });
  hashedPassword = await hash(password, 12);
  const newStudent = await Student.create({
    email,
    name,
    location,
    phoneNumber: "+" + phoneNumber,
    password: hashedPassword,
    isRegistered: true,
  });
  const mailOptions = {
    from: process.env.APP_EMAIL,
    to: email,
    subject: "MDS: New Student Account",
    html: `<div style="text-align: right;"> مرحبًا ، <br> 
       يسعدنا إخبارك بأنه تم إنشاء حساب لك من طرف مدير موقع مسقط لتعليم قيادة السيارات <br>
    يمكنك تسجيل الدخول الآن باستخدام هذا الإيميل وكلمة السر: ${password} <br>
    .حظًا سعيدًا <br>
    ,فريق مسقط لتعليم قيادة السيارات
    </div>`,
  };
  const smsOptions = {
    body: ` مرحبًا ، 
    يسعدنا إخبارك بأنه تم إنشاء حساب لك من طرف مدير موقع مسقط لتعليم قيادة السيارات 
 يمكنك تسجيل الدخول الآن باستخدام هذا الإيميل وكلمة السر: ${password} 
 .حظًا سعيدًا
    ,فريق مسقط لتعليم قيادة السيارات
    `,
    to: phoneNumber,
  };
  sendEmail(mailOptions, smsOptions);
  res.send({
    status: 201,
    data: null,
    msg: {
      arabic: "تم إنشاء الحساب بنجاح",
      english: "successfully created new account",
    },
  });
};

const createTeacher = async (req, res) => {
  const { email, phone, password } = req.body;
  const teacher = await Teacher.findOne({
    where: {
      email,
    },
  });

  const student = await Student.findOne({
    where: {
      email,
    },
  });

  const parent = await Parent.findOne({
    where: {
      email,
    },
  });
  if (teacher || student || parent)
    throw serverErrs.BAD_REQUEST({
      arabic: "الإيميل مستخدم سابقا",
      english: "email is already used",
    });
  hashedPassword = await hash(password, 12);
  const newTeacher = await Teacher.create({
    email,
    phone: "+" + phone,
    password: hashedPassword,
    isRegistered: true,
    isVerified: true,
  });
  const mailOptions = {
    from: process.env.APP_EMAIL,
    to: email,
    subject: "MDS: New Trainer Account",
    html: `<div style="text-align: right;"> مرحبًا ، <br> 
       يسعدنا إخبارك بأنه تم إنشاء حساب لك من طرف مدير موقع مسقط لتعليم قيادة السيارات <br>
    يمكنك تسجيل الدخول الآن كمعلم باستخدام هذا الإيميل وكلمة السر: ${password} <br>
    .حظًا سعيدًا <br>
    ,فريق مسقط لتعليم قيادة السيارات
    </div>`,
  };
  const smsOptions = {
    body: ` مرحبًا ، 
    يسعدنا إخبارك بأنه تم إنشاء حساب لك من طرف مدير موقع مسقط لتعليم قيادة السيارات 
 يمكنك تسجيل الدخول الآن كمعلم باستخدام هذا الإيميل وكلمة السر: ${password} 
 .حظًا سعيدًا
    ,فريق مسقط لتعليم قيادة السيارات
    `,
    to: phone,
  };
  sendEmail(mailOptions, smsOptions);
  res.send({
    status: 201,
    data: null,
    msg: {
      arabic: "تم إنشاء الحساب بنجاح",
      english: "successfully created new account",
    },
  });
};
//WhatsData
const getWhatsData = async (req, res) => {
  const objwhatsData = await WhatsData.findOne({
    where: { id: 1 }
  });

  res.send({
    status: 201,
    data: objwhatsData,
    msg: {
      arabic: "تم رابط التواصل بالتطيبق الواتس اب",
      english: "get url for whats",
    },
  });
};


const getNewCheckoutRequests = async (req, res) => {
  const checkouts = await CheckoutRequest.findAll({
    where: { status: { [Op.eq]: 0 } },
    order: [["createdAt", "DESC"]],
    include: [{ model: Teacher }],
  });
  res.send({
    status: 201,
    data: checkouts,
    msg: {
      arabic: "تم إرجاع جميع طلبات الدفع الجديدة",
      english: "successful get new Checkout Requests",
    },
  });
};

const getProcessedCheckoutRequests = async (req, res) => {
  const checkouts = await CheckoutRequest.findAll({
    where: { status: { [Op.ne]: 0 } },
    order: [["updatedAt", "DESC"]],
    include: [{ model: Teacher }],
  });
  res.send({
    status: 201,
    data: checkouts,
    msg: {
      arabic: "تم إرجاع جميع طلبات الدفع المنتهية",
      english: "successful get processed Checkout Requests",
    },
  });
};

const acceptCheckout = async (req, res) => {
  const { checkoutId } = req.params;
  const checkout = await CheckoutRequest.findOne({
    where: {
      id: checkoutId,
    },
  });
  if (!checkout) {
    throw new serverErrs.BAD_REQUEST({
      arabic: "طلب الدفع غير موجود",
      english: "checkout request not found",
    });
  }
  await checkout.update({ status: 1 });
  res.send({
    status: 201,
    msg: {
      arabic: "تم قبول طلب الدفع بنجاح",
      english: "successful accepting Checkout Requests",
    },
  });
};

const rejectCheckout = async (req, res) => {
  const { checkoutId } = req.params;
  const checkout = await CheckoutRequest.findOne({
    where: {
      id: checkoutId,
    },
  });
  if (!checkout) {
    throw new serverErrs.BAD_REQUEST({
      arabic: "طلب الدفع غير موجود",
      english: "checkout request not found",
    });
  }
  await checkout.update({ status: -1 });

  res.send({
    status: 201,
    msg: {
      arabic: "تم رفض طلب الدفع بنجاح",
      english: "successful rejecting Checkout Requests",
    },
  });
};

const createSubjectCategory = async (req, res) => {
  const image = req.file.filename;
  const { titleAR, titleEN } = req.body;
  const newSubjectCategory = await SubjectCategory.create(
    {
      titleAR,
      titleEN,
      image,
    },
    {
      returning: true,
    }
  );
  await newSubjectCategory.save();
  res.send({
    status: 201,
    data: newSubjectCategory,
    msg: {
      arabic: "تم إنشاء المادة العامة بنجاح",
      english: "successful create new SubjectCategory",
    },
  });
};

const createSubject = async (req, res) => {
  const { titleAR, titleEN, subjectCategoryId } = req.body;
  const newSubject = await Subject.create(
    {
      titleAR,
      titleEN,
      SubjectCategoryId: subjectCategoryId,
    },
    {
      returning: true,
    }
  );
  await newSubject.save();
  res.send({
    status: 201,
    data: newSubject,
    msg: {
      arabic: "تم إنشاء المادة الفرعية بنجاح",
      english: "successful create new Subject",
    },
  });
};

const createLevel = async (req, res) => {
  const { titleAR, titleEN } = req.body;
  const newLevel = await Level.create(
    {
      titleAR,
      titleEN,
    },
    {
      returning: true,
    }
  );
  await newLevel.save();
  res.send({
    status: 201,
    data: newLevel,
    msg: {
      arabic: "تم إنشاء المستوى بنجاح",
      english: "successful create new level",
    },
  });
};

const createClass = async (req, res) => {
  const { titleAR, titleEN, levelId } = req.body;
  const newClassCreated = await Class.create(
    {
      titleAR,
      titleEN,
      LevelId: levelId,
    },
    {
      returning: true,
    }
  );
  await newClassCreated.save();
  res.send({
    status: 201,
    data: newClassCreated,
    msg: {
      arabic: "تم إنشاء الفصل بنجاح",
      english: "successful create new class",
    },
  });
};

const createCurriculum = async (req, res) => {
  const { titleAR, titleEN } = req.body;
  const newCurriculum = await Curriculum.create(
    {
      titleAR,
      titleEN,
    },
    {
      returning: true,
    }
  );
  await newCurriculum.save();
  res.send({
    status: 201,
    data: newCurriculum,
    msg: {
      arabic: "تم إنشاء المنهج بنجاح",
      english: "successful create new curriculum",
    },
  });
};

const linkedCurriculumLevel = async (req, res) => {
  const { levelId, curriculumId } = req.body;
  const curriculumLevel = await CurriculumLevel.findOne({
    where: {
      CurriculumId: curriculumId,
      LevelId: levelId,
    },
  });

  if (curriculumLevel)
    throw serverErrs.BAD_REQUEST({
      arabic: "تم ربط المنهج بالمستوى سابقا",
      english: "already linked curriculum with level",
    });

  const newCurriculumLevel = await CurriculumLevel.create(
    {
      CurriculumId: curriculumId,
      LevelId: levelId,
    },
    {
      returning: true,
    }
  );
  await newCurriculumLevel.save();
  res.send({
    status: 201,
    data: newCurriculumLevel,
    msg: {
      arabic: "تم ربط المنهج بالمستوى بنجاح",
      english: "successful linked curriculum with level",
    },
  });
};

const getSubjects = async (req, res) => {
  const subjects = await Subject.findAll({ include: { all: true } });
  res.send({
    status: 201,
    data: subjects,
    msg: {
      arabic: "تم ارجاع جميع المواد بنجاح",
      english: "successful get all Subjects",
    },
  });
};

const getSingleSubject = async (req, res) => {
  const { subjectId } = req.params;
  const subject = await Subject.findOne({
    where: { id: subjectId },
    include: { all: true },
  });
  if (!subject)
    throw serverErrs.BAD_REQUEST({
      arabic: "المادة غير موجودة",
      english: "Invalid subjectId! ",
    });
  res.send({
    status: 201,
    data: subject,
    msg: {
      arabic: "تم ارجاع المادة بنجاح",
      english: "successful get single subject",
    },
  });
};

const getSubjectCategories = async (req, res) => {
  const subjectCategories = await SubjectCategory.findAll({
    include: { all: true },
  });
  res.send({
    status: 201,
    data: subjectCategories,
    msg: {
      arabic: "تم ارجاع المادة العامة بنجاح",
      english: "successful get all subjectCategories",
    },
  });
};

const getSingleSubjectCategory = async (req, res) => {
  const { subjectCategoryId } = req.params;
  const subjectCategory = await SubjectCategory.findOne({
    where: { id: subjectCategoryId },
    include: { all: true },
  });
  if (!subjectCategory)
    throw serverErrs.BAD_REQUEST({
      arabic: "المادة غير موجودة",
      english: "Invalid subjectCategoryId! ",
    });
  res.send({
    status: 201,
    data: subjectCategory,
    msg: {
      arabic: "تم ارجاع المادة بنجاح",
      english: "successful get single subjectCategory",
    },
  });
};

const getClasses = async (req, res) => {
  const classes = await Class.findAll({ include: Level });
  res.send({
    status: 201,
    data: classes,
    msg: {
      arabic: "تم ارجاع جميع الفصول بنجاح",
      english: "successful get all classes",
    },
  });
};

const getSingleClass = async (req, res) => {
  const { classId } = req.params;
  const singleClass = await Class.findOne({
    where: { id: classId },
    include: { all: true },
  });
  if (!singleClass)
    throw serverErrs.BAD_REQUEST({
      arabic: "الفصل غير موجود",
      english: "Invalid classId! ",
    });
  res.send({
    status: 201,
    data: singleClass,
    msg: {
      arabic: "تم ارجاع الفصل بنجاح",
      english: "successful get single singleClass",
    },
  });
};

const getLevels = async (req, res) => {
  const levels = await Level.findAll();

  res.send({
    status: 201,
    data: levels,
    msg: {
      arabic: "تم ارجاع جميع المستويات بنجاح",
      english: "successful get all levels",
    },
  });
};

const getSingleLevel = async (req, res) => {
  const { levelId } = req.params;
  const level = await Level.findOne({
    where: { id: levelId },
    include: [{ model: Class }, { model: CurriculumLevel }],
  });
  if (!level)
    throw serverErrs.BAD_REQUEST({
      arabic: "المستوى غير موجود",
      english: "Invalid levelId! ",
    });
  res.send({
    status: 201,
    data: level,
    msg: {
      arabic: "تم ارجاع المستوى بنجاح",
      english: "successful get single level",
    },
  });
};

const getCurriculums = async (req, res) => {
  const curriculums = await Curriculum.findAll({ include: CurriculumLevel });
  res.send({
    status: 201,
    data: curriculums,
    msg: {
      arabic: "تم ارجاع جميع المناهج بنجاح",
      english: "successful get all Curriculums",
    },
  });
};

const getSingleCurriculum = async (req, res) => {
  const { curriculumId } = req.params;
  const curriculum = await Curriculum.findOne({
    where: { id: curriculumId },
    include: { all: true },
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

const acceptStudent = async (req, res) => {
  const { ParentStudentId } = req.params;
  const parentStudent = await ParentStudent.findOne({
    where: { id: ParentStudentId },
    include: { all: true },
  });
  if (!parentStudent)
    throw serverErrs.BAD_REQUEST({
      arabic: "الأب غير موجود",
      english: "parent student not found",
    });

  await parentStudent.update({ status: 1 });
  const student = await Student.findOne({
    where: { id: parentStudent.StudentId },
    include: { all: true },
  });
  await student.update({ ParentId: parentStudent.ParentId });
  res.send({
    status: 201,
    msg: {
      arabic: "تم قبول الطالب بنجاح",
      english: "Student has been accepted",
    },
  });
};

const rejectStudent = async (req, res) => {
  const { ParentStudentId } = req.params;
  const parentStudent = await ParentStudent.findOne({
    where: { id: ParentStudentId },
    include: { all: true },
  });
  if (!parentStudent)
    throw serverErrs.BAD_REQUEST({
      arabic: "الأب غير موجود",
      english: "parent student not found",
    });

  await parentStudent.update({ status: -1 });
  res.send({
    status: 201,
    msg: {
      arabic: "تم رفض الطالب بنجاح",
      english: "Student has been rejected",
    },
  });
};

const getParentStudentWaiting = async (req, res) => {
  const parentStudents = await ParentStudent.findAll({
    where: { status: 0 },
    include: { all: true },
  });

  res.send({
    status: 201,
    data: parentStudents,
    msg: {
      arabic: "تم ارجاع جميع طلبات الأب بنجاح",
      english: "successful get all Students are waiting",
    },
  });
};

const getParentStudentAccOrRej = async (req, res) => {
  const parentStudents = await ParentStudent.findAll({
    where: { status: { [Op.or]: [1, -1] } },
    include: { all: true },
  });

  res.send({
    status: 201,
    data: parentStudents,
    msg: {
      arabic: "تم ارجاع جميع طلبات الأب المقبولة",
      english: "successful get all Students are accepted",
    },
  });
};

const acceptTeacher = async (req, res) => {
  const { teacherId } = req.params;
  const teacher = await Teacher.findOne({
    where: { id: teacherId },
  });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجود",
      english: "invalid trainerId!",
    });

  await teacher.update({ isVerified: true });

  res.send({
    status: 201,
    data: teacher,
    msg: {
      arabic: "تم قبول المدرب بنجاح",
      english: "trainer has been accepted",
    },
  });
};

const getAcceptedTeachers = async (req, res) => {
  const acceptedTeachers = await Teacher.findAll({
    where: { isVerified: true },
  });

  res.send({
    status: 201,
    data: acceptedTeachers,
    msg: {
      arabic: "تم ارجاع جميع المدربين المقبولين",
      english: "successful get all acceptedTrainers",
    },
  });
};

const rejectTeacher = async (req, res) => {
  const { teacherId } = req.params;

  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجود",
      english: "Invalid trainerId! ",
    });
  await Teacher.destroy({
    where: {
      id: teacherId,
    },
  });

  res.send({
    status: 201,
    msg: { arabic: "تم رفض المدرب", english: "Rejected trainer successfully" },
  });
};

const getWaitingTeacher = async (req, res) => {
  const teachers = await Teacher.findAll({
    where: {
      isVerified: false,
      firstName: { [Op.gt]: "" },
      lastName: { [Op.gt]: "" },
      phone: { [Op.gt]: "" },
      gender: { [Op.gt]: "" },
      image: { [Op.gt]: "" },
      dateOfBirth: { [Op.gt]: "" },
      country: { [Op.gt]: "" },
      city: { [Op.gt]: "" },
      favStdGender: { [Op.gt]: "" },
      favhours: { [Op.gt]: "" },
      shortHeadlineAr: { [Op.gt]: "" },
      shortHeadlineEn: { [Op.gt]: "" },
      descriptionAr: { [Op.gt]: "" },
      descriptionEn: { [Op.gt]: "" },
    },
  });
  res.send({
    status: 201,
    data: teachers,
    msg: {
      arabic: "تم ارجاع جميع المدربين غير المقبولين بعد",
      english: "successful get all waiting trainers",
    },
  });
};

const getLanguageLevel = async (req, res) => {
  const languageLevels = await LanguageLevel.findAll();
  res.send({
    status: 201,
    data: languageLevels,
    msg: {
      arabic: "تم ارجاع جميع مستويات اللغة",
      english: "successful get all language level",
    },
  });
};

const updateLevel = async (req, res) => {
  const { titleAR, titleEN } = req.body;
  const { LevelId } = req.params;
  const level = await Level.findOne({
    where: { id: LevelId },
    include: { all: true },
  });
  if (!level)
    throw serverErrs.BAD_REQUEST({
      arabic: "المستوى غير موجود",
      english: "level not found",
    });
  await level.update({ titleAR, titleEN });
  res.send({
    status: 201,
    data: level,
    msg: {
      arabic: "تم تعديل المستوى بنجاح",
      english: "successful update level",
    },
  });
};

const updateSubCategories = async (req, res) => {
  const { titleAR, titleEN } = req.body;
  const { SubjectCategoryId } = req.params;
  const subjectCategory = await SubjectCategory.findOne({
    where: { id: SubjectCategoryId },
    include: { all: true },
  });
  if (!subjectCategory)
    throw serverErrs.BAD_REQUEST({
      arabic: "المادة العامة غير موجودة",
      english: "subjectCategory not found",
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
  if (req.file && subjectCategory.image) {
    clearImage(subjectCategory.image);
  }
  if (req.file) {
    await subjectCategory.update({ image: req.file.filename });
  }
  await subjectCategory.update({ titleAR, titleEN });
  res.send({
    status: 201,
    data: subjectCategory,
    msg: {
      arabic: "تم تعديل المادة العامة بنجاح",
      english: "successful update subjectCategory",
    },
  });
};

const updateSubject = async (req, res) => {
  const { titleAR, titleEN } = req.body;
  const { SubjectId } = req.params;
  const subject = await Subject.findOne({
    where: { id: SubjectId },
    include: { all: true },
  });
  if (!subject)
    throw serverErrs.BAD_REQUEST({
      arabic: "المادة غير موجودة",
      english: "Subject not found",
    });
  await subject.update({ titleAR, titleEN });
  res.send({
    status: 201,
    data: subject,
    msg: {
      arabic: "تم تعديل المادة الفرعية بنجاح",
      english: "successful update subject",
    },
  });
};

const updateClass = async (req, res) => {
  const { titleAR, titleEN } = req.body;
  const { ClassId } = req.params;
  const classes = await Class.findOne({
    where: { id: ClassId },
    include: { all: true },
  });
  if (!classes)
    throw serverErrs.BAD_REQUEST({
      arabic: "الفصل غير موجود",
      english: "Class not found",
    });
  await classes.update({ titleAR, titleEN });
  res.send({
    status: 201,
    data: classes,
    msg: { arabic: "تم تعديل الفصل بنجاح", english: "successful update Class" },
  });
};

const updateCurriculum = async (req, res) => {
  const { titleAR, titleEN } = req.body;
  const { CurriculumId } = req.params;
  const curriculum = await Curriculum.findOne({
    where: { id: CurriculumId },
    include: { all: true },
  });
  if (!curriculum)
    throw serverErrs.BAD_REQUEST({
      arabic: "المنهج غير موجود",
      english: "Curriculum not found",
    });
  await curriculum.update({ titleAR, titleEN });
  res.send({
    status: 201,
    data: curriculum,
    msg: {
      arabic: "تم تعديل المنهج بنجاح",
      english: "successful update curriculum",
    },
  });
};

const payDues = async (req, res) => {
  const { price, TeacherId } = req.body;

  const teacher = await Teacher.findOne({
    where: {
      id: TeacherId,
    },
  });
  if (teacher.totalAmount - teacher.dues < price) {
    throw serverErrs.BAD_REQUEST({
      arabic: "  انت تدفع اكثر من المبلغ المطلوب",
      english: "you are paying more than the requested price",
    });
  }
  await FinancialRecord.create({
    amount: price,
    type: "paid",
    TeacherId,
  });

  teacher.dues += +price;
  await teacher.save();

  await Notifications.add({
    titleAR: "تم دفع المستحقات  ",
    titleEn: "successfully paying dues ",
    TeacherId,
    seen: false,
    date: Date.now(),
  });

  res.send({
    status: 201,
    data: teacher,
    msg: {
      arabic: "تم الدفع للمعلم بنجاح",
      english: "successful paid to teacher",
    },
  });
};

const getAllSessions = async (req, res) => {
  const lessons = await Session.findAll({
    where: {
      isPaid: true,
    },
    include: [{ model: Student }, { model: Teacher }],
  });

  res.send({
    status: 201,
    data: lessons,
    msg: {
      arabic: "تم ارجاع الجلسات بنجاح",
      english: "successful get all lessons",
    },
  });
};

const deleteSessions = async (req, res) => {
  console.log("Delete Sessions");
  console.log(req.params);
  
  const { sessionId } = req.params;
  const objSession = await Session.findOne({
    where: { id: sessionId },
  });
  if (!objSession)
    throw serverErrs.BAD_REQUEST({
      arabic: "الحصه غير موجود",
      english: "Invalid Record ID! ",
    });
  
  await objSession.destroy();
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف الحصه بنجاح",
      english: "successfully delete record !",
    },
  });
};



const getAllWallets = async (req, res) => {
  const wallets = await Wallet.findAll({
    where: {
      isPaid: "1",
    },
    include: [{ model: Student }],
    order: [["createdAt", "DESC"]],
    limit: 20000,
  });

  res.send({
    status: 201,
    data: wallets,
    msg: {
      arabic: "تم ارجاع جميع المحفظات",
      english: "successful get all wallets",
    },
  });
};

const deleteWallets = async (req, res) => {
  const { walletId } = req.params;
  const objWallet = await Wallet.findOne({ where: { id: walletId } });
  if (!objWallet)   
    throw serverErrs.BAD_REQUEST({
      arabic: "المحفظة غير موجوده سابقا",
      english: "Wallet is already not found",
    });

  await objWallet.destroy({
    where: {
      id: walletId,
    },
  });
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف المحفظة بنجاح",
      english: "successful delete Wallet",
    },
  });
};

const getStudentWallets = async (req, res) => {
  const { StudentId } = req.params;

  const wallets = await Wallet.findAll({
    where: {
      StudentId,
      isPaid: true,
    },
  });
  res.send({
    status: 201,
    data: wallets,
    msg: {
      arabic: "تم ارجاع محفظة الطالب بنجاح",
      english: "successful get all student wallets",
    },
  });
};

const getThawaniSession = async (req, res) => {
  const { StudentId } = req.params;

  const sessions = await Session.findAll({
    where: {
      StudentId,
      typeOfPayment: "thawani",
      isPaid: true,
    },
  });

  res.send({
    status: 201,
    data: sessions,
    msg: {
      arabic: "تم ارجاع جميع الجلسات التي تم تسجيلها من منصة ثواني",
      english: "successful get all thawani session",
    },
  });
};

const getAllTeachers = async (req, res) => {
  const teachers = await Teacher.findAll({
    where: {
      isVerified: true,
      isRegistered: true,
    },
    
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
      arabic: "تم ارجاع جميع السجل المالي للمعلم",
      english: "successful get all financial records for teacher",
    },
  });
};

const getNumbers = async (req, res) => {
  const studentsNumber = await Student.count({
    where: {
      isRegistered: true,
    },
  });

  const teachersNumber = await Teacher.count({
    where: {
      isRegistered: true,
      isVerified: true,
    },
  });

  const parentsNumber = await Parent.count();
  const sessionsNumber = await Session.count({
    where: {
      isPaid: true,
    },
  });

  const studentOnline = await Student.count({
    where: {
      isOnline: "1",
    },
  });

  const teacherOnline = await Teacher.count({
    where: {
      isOnline: "1",
    },
  });

  const packageOnline = await Package.count({
    where: {
      status: "1",
    },
  });

  const teacherLectureWaiting = await TeacherLecture.count({
    where: {
      status: "1",
    },
  });

  const parentExchangeNumWaiting = await ExchangeRequestsParent.count({
    where: {
      status: "1",
    },
  });

  const studentExchangeNumWaiting = await ExchangeRequestsStudent.count({
    where: {
      status: "1",
    },
  });

  const teacherExchangeNumWaiting = await ExchangeRequestsTeacher.count({
    where: {
      status: "1",
    },
  });

  const discountsNumWaiting = await Discounts.count({
    where: {
      status: "1",
    },
  });

  const adsNumWaiting = await Ads.count({
    where: {
      status: "1",
    },
  });

  const careerNumWaiting = await Career.count({
    where: {
      status: "1",
    },
  });

  res.send({
    status: 201,
    data: { studentsNumber,         teachersNumber, parentsNumber, sessionsNumber , studentOnline , 
      teacherOnline,                packageOnline,              teacherLectureWaiting,
      parentExchangeNumWaiting,     studentExchangeNumWaiting,
      teacherExchangeNumWaiting,    discountsNumWaiting,        adsNumWaiting,
      careerNumWaiting,
    },
    msg: {
      arabic: "تم ارجاع جميع الطلاب والمدربين والاباء المسجلين",
      english: "successful get all numbers",
    },
  });
};
// const getAllWalletsPdf = async (req, res) => {
//   const wallets = await Wallet.findAll({
//     where: {
//       isPaid: true,
//       typeEn: "deposit",
//     },
//     include: [{ model: Student }],
//   });

//   const invoicename = "invoice-" + 1 + ".pdf";
//   const invoicepath = path.join("invoices", invoicename);
//   res.setHeader("Content-type", "application/pdf");
//   res.setHeader("Content-Disposition", "inline;filename=" + invoicename + '"');
//   const pdfDoc = new PDFDocument();
//   pdfDoc.pipe(fs.createWriteStream(invoicepath));
//   pdfDoc.pipe(res);
//   wallets.forEach((wallet) => {
//     pdfDoc.text(
//       wallet.price + "," + wallet.currency + "," + wallet.Student.name
//     );
//   });
//   pdfDoc.end();
// };

const getAllWalletsPdf = async (req, res) => {
  const { language } = req.query;
  const wallets = await Wallet.findAll({
    where: {
      isPaid: true,
    },
    order:   [["createdAt", "DESC"]],
    include: [{ model: Student }],
  });
  const financialRecords = await FinancialRecord.findAll({
    include: [
      { model: Student, attributes: ["name"], required: false },
      {
        model: Teacher,
        attributes: ["firstName", "lastName"],
        required: false,
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  const htmlEN = `
  <html>
    <head>
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
        }
        h1 {
          text-align: center;
        }
        th, td {
          border: 1px solid black;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #ddd;
        }
      </style>
    </head>
    <body>
      <h1>Wallets details</h1>
      <table>
        <thead>
          <tr>
            <th>Price</th>
            <th>Currency</th>
            <th>Student name</th>
            <th>Booking Pay</th>
          </tr>
        </thead>
        <tbody>
          ${wallets
            .map(
              (wallet) => `
            <tr>
              <td>${wallet.price}</td>
              <td>${wallet.currency}</td>
              <td>${wallet.Student?.name}</td>
              <td>${`${wallet.createdAt}`.substring(0, 24)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      <h1>Payment Operations</h1>
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Teacher</th>
            <th>Amount</th>
            <th>Currency</th>
            <th>Booking Pay</th>
          </tr>
        </thead>
        <tbody>
          ${financialRecords
            .map(
              (financialRecord) => `
            <tr>
              <td>${financialRecord.Student}</td>
              <td>${
                financialRecord.Teacher.firstName +
                " " +
                financialRecord.Teacher.lastName
              }</td>
              <td>${financialRecord.amount}</td>
              <td>${financialRecord.currency}</td>
              <td>${`${financialRecord.createdAt}`.substring(0, 24)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </body>
  </html>
`;

  const htmlAR = `
    <html>
      <head>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
          }
          h1 {
            text-align: center;
          }
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: right;
          }
          th {
            background-color: #ddd;
          }
        </style>
      </head>
      <body>
     <h1>تفاصيل المحفظة</h1>
        <table>
          <thead>
            <tr>
            <th>تاريخ الحجز</th>
            <th>إسم الطالب</th>
            <th>العملة</th>
            <th>السعر</th>
            </tr>
          </thead>
          <tbody>
            ${wallets
              .map(
                (wallet) => `
              <tr>
              <td>${`${wallet.createdAt}`.substring(0, 24)}</td>
              <td>${wallet.Student?.name}</td>
              <td>${wallet.currency}</td>
              <td>${wallet.price}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <h1>عمليات الدفع</h1>
      <table>
        <thead>
          <tr>
            <th>الطالب</th>
            <th>المدرب</th>
            <th>المبلغ</th>
            <th>العملة</th>
            <th>تاريخ الدفع</th>
          </tr>
        </thead>
        <tbody>
          ${financialRecords
            .map(
              (financialRecord) => `
            <tr>
              <td>${financialRecord.Student}</td>
              <td>${
                financialRecord.Teacher.firstName +
                " " +
                financialRecord.Teacher.lastName
              }</td>
              <td>${financialRecord.amount}</td>
              <td>${financialRecord.currency}</td>
              <td>${`${financialRecord.createdAt}`.substring(0, 24)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      </body>
    </html>
  `;

  const options = {
    format: "A5",
    orientation: "landscape",
  };
  const html = language === "EN" ? htmlEN : htmlAR;
  pdf
    .create(html, options)
    .toFile(path.join("invoices", "wallets.pdf"), async (err, response) => {
      if (err) throw serverErrs.BAD_REQUEST("PDF not created");
      const pdf = await fetch(
        //"https://aghati.moalime.com/invoices/wallets.pdf"
        "https://server2.moalime.com/invoices/wallets.pdf"
      );
      const buffer = await pdf.arrayBuffer();
      const fileData = Buffer.from(buffer);
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=wallets.pdf",
        "Content-Length": fileData.length,
      });
      res.end(fileData);
    });
};

const getAllStudentsPDF = async (req, res) => {
  const students = await Student.findAll({
    include: [
      { model: Level },
      { model: Class },
      { model: Curriculum },
      { model: Parent },
      { model: Session },
    ],
  });

  students.map((student) => {
    let c = 0;
    if (student.Sessions) {
      student.Sessions.forEach((Session) => {
        if (Session.isPaid) c++;
      });
    }
    student.sessionsCount = c;
    return student;
  });

  const html = `
    <html>
      <head>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #ddd;
          }
        </style>
      </head>
      <body>
        <h1>All Students</h1>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Gender</th>
              <th>City</th>
              <th>Date of Birth</th>
              <th>Nationality</th>
              <th>Location</th>
              <th>Phone Number</th>
              <th>Level</th>
              <th>Class</th>
              <th>Curriculum</th>
              <th>Sessions</th>
            </tr>
          </thead>
          <tbody>
            ${students
              .map(
                (student) => `
              <tr>
                <td>${student.email}</td>
                <td>${student.name}</td>
                <td>${student.gender}</td>
                <td>${student.city}</td>
                <td>${student.dateOfBirth}</td>
                <td>${student.nationality}</td>
                <td>${student.location}</td>
                <td>${student.phoneNumber}</td>
                <td>${student.Level?.titleEN || "not exist"}</td>
                <td>${student.Class?.titleEN || "not exist"}</td>
                <td>${student.Curriculum?.titleEN || "not exist"}</td>
                <td>${student.sessionsCount}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const options = {
    format: "A2",
    orientation: "landscape",
  };
  try {
    pdf
      .create(html, options)
      .toFile(path.join("invoices", "students.pdf"), async (err, response) => {
        if (err) throw serverErrs.BAD_REQUEST("PDF not created");
        const pdf = await fetch(
          //"https://aghati.moalime.com/invoices/students.pdf"
          "https://server2.moalime.com/invoices/students.pdf"
        );
        const buffer = await pdf.arrayBuffer();
        const fileData = Buffer.from(buffer);
        res.writeHead(200, {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=students.pdf",
          "Content-Length": fileData.length,
        });
        res.end(fileData);
      });
  } catch (error) {
    res.send({
      message: "failed to save pdf",
      // status: 201,
      // response,
      // msg: {
      //   arabic: "تم ارجاع جميع الطلاب المسجلين",
      //   english: "successful get all students",
      // },
    });
  }
};

const getAllTeachersPDF = async (req, res) => {
  const teachers = await Teacher.findAll({
    include: { model: Session },
  });

  teachers.map((teacher) => {
    let c = 0;
    if (teacher.Sessions) {
      teacher.Sessions.forEach((Session) => {
        if (Session.isPaid) c++;
      });
    }
    teacher.sessionsCount = c;
    return teacher;
  });

  const html = `
    <html>
      <head>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #ddd;
          }
        </style>
      </head>
      <body>
        <h1>All trainers</h1>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Gender</th>
              <th>City</th>
              <th>Date of Birth</th>
              <th>Phone Number</th>
              <th>Country</th>
              <th>Sessions</th>
            </tr>
          </thead>
          <tbody>
            ${teachers
              .map(
                (teacher) => `
              <tr>
                <td>${teacher.email}</td>
                <td>${teacher.firstName + " " + teacher.lastName}</td>
                <td>${teacher.gender}</td>
                <td>${teacher.city}</td>
                <td>${teacher.dateOfBirth}</td>
                <td>${teacher.phone}</td>
                <td>${teacher.country}</td>
                <td>${teacher.sessionsCount}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const options = {
    format: "A2",
    orientation: "landscape",
  };

  pdf
    .create(html, options)
    .toFile(path.join("invoices", "teachers.pdf"), async (err, response) => {
      if (err) throw serverErrs.BAD_REQUEST("PDF not created");
      const pdf = await fetch(
        //"https://aghati.moalime.com/invoices/teachers.pdf"
        "https://server2.moalime.com/invoices/teachers.pdf"
      );
      const buffer = await pdf.arrayBuffer();
      const fileData = Buffer.from(buffer);
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=teachers.pdf",
        "Content-Length": fileData.length,
      });
      res.end(fileData);
    });
};

const getAllParentsPDF = async (req, res) => {
  const parents = await Parent.findAll({
    include: { model: Student },
  });

  const html = `
    <html>
      <head>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #ddd;
          }
        </style>
      </head>
      <body>
        <h1>All Parents</h1>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Number of children</th>
            </tr>
          </thead>
          <tbody>
            ${parents
              .map(
                (parent) => `
              <tr>
                <td>${parent.email}</td>
                <td>${parent.name}</td>
                <td>${parent.Students?.length}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const options = {
    format: "A2",
    orientation: "landscape",
  };

  pdf
    .create(html, options)
    .toFile(path.join("invoices", "parents.pdf"), async (err, response) => {
      if (err) throw serverErrs.BAD_REQUEST("PDF not created");
      const pdf = await fetch(
        //"https://aghati.moalime.com/invoices/parents.pdf"
        "https://server2.moalime.com/invoices/parents.pdf"
      );
      const buffer = await pdf.arrayBuffer();
      const fileData = Buffer.from(buffer);
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=parents.pdf",
        "Content-Length": fileData.length,
      });
      res.end(fileData);
    });
};

const allReports = async (req, res) => {
  const parents = await Parent.findAll({
    include: { model: Student },
  });

  const teachers = await Teacher.findAll({
    include: { model: Session },
  });

  teachers.map((teacher) => {
    let c = 0;
    if (teacher.Sessions) {
      teacher.Sessions.forEach((Session) => {
        if (Session.isPaid) c++;
      });
    }
    teacher.sessionsCount = c;
    return teacher;
  });

  const students = await Student.findAll({
    include: [
      { model: Level },
      { model: Class },
      { model: Curriculum },
      { model: Parent },
      { model: Session },
    ],
  });

  students.map((student) => {
    let c = 0;
    if (student.Sessions) {
      student.Sessions.forEach((Session) => {
        if (Session.isPaid) c++;
      });
    }
    student.sessionsCount = c;
    return student;
  });

  const html1 = `
    <html>
      <head>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #ddd;
          }
        </style>
      </head>
      <body>
        <h1>All Parents</h1>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Number of children</th>
            </tr>
          </thead>
          <tbody>
            ${parents
              .map(
                (parent) => `
              <tr>
                <td>${parent.email}</td>
                <td>${parent.name}</td>
                <td>${parent.Students?.length}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const html2 = `
    <html>
      <head>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #ddd;
          }
        </style>
      </head>
      <body>
        <h1>All trainers</h1>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Gender</th>
              <th>City</th>
              <th>Date of Birth</th>
              <th>Phone Number</th>
              <th>Country</th>
              <th>Sessions</th>
            </tr>
          </thead>
          <tbody>
            ${teachers
              .map(
                (teacher) => `
              <tr>
                <td>${teacher.email}</td>
                <td>${teacher.firstName + " " + teacher.lastName}</td>
                <td>${teacher.gender}</td>
                <td>${teacher.city}</td>
                <td>${teacher.dateOfBirth}</td>
                <td>${teacher.phone}</td>
                <td>${teacher.country}</td>
                <td>${teacher.sessionsCount}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const html3 = `
    <html>
      <head>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #ddd;
          }
        </style>
      </head>
      <body>
        <h1>All Students</h1>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Gender</th>
              <th>City</th>
              <th>Date of Birth</th>
              <th>Nationality</th>
              <th>Location</th>
              <th>Phone Number</th>
              <th>Level</th>
              <th>Class</th>
              <th>Curriculum</th>
              <th>Sessions</th>
            </tr>
          </thead>
          <tbody>
            ${students
              .map(
                (student) => `
              <tr>
                <td>${student.email}</td>
                <td>${student.name}</td>
                <td>${student.gender}</td>
                <td>${student.city}</td>
                <td>${student.dateOfBirth}</td>
                <td>${student.nationality}</td>
                <td>${student.location}</td>
                <td>${student.phoneNumber}</td>
                <td>${student.Level?.titleEN || "not exist"}</td>
                <td>${student.Class?.titleEN || "not exist"}</td>
                <td>${student.Curriculum?.titleEN || "not exist"}</td>
                <td>${student.sessionsCount}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const options = {
    format: "A2",
    orientation: "landscape"
  };
  //const browser = await puppeteer.launch();
  //const page    = await browser.newPage();
  try {
    pdf
    .create(html1, options)
    .toFile(path.join("invoices", "parents.pdf"), async (err, response) => {
      if (err) throw serverErrs.BAD_REQUEST("PDF not created");
    });
  } catch (error) {
    console.log(error);
  }
 // await page.pdf({ path: `'./businesscard.pdf'` });
 // await browser.close();

  pdf
    .create(html1, options)
    .toFile(path.join("invoices", "parents.pdf"), async (err, response) => {
      if (err) throw serverErrs.BAD_REQUEST("PDF not created");
    });

  pdf
    .create(html2, options)
    .toFile(path.join("invoices", "teachers.pdf"), async (err, response) => {
      if (err) throw serverErrs.BAD_REQUEST("PDF not created");
    });

  pdf
    .create(html3, options)
    .toFile(path.join("invoices", "students.pdf"), async (err, response) => {
      if (err) throw serverErrs.BAD_REQUEST("PDF not created");
    });

  const readFileAsync = promisify(fs.readFile);
  const buffer1 = await readFileAsync(path.join("invoices", "teachers.pdf"));
  const buffer2 = await readFileAsync(path.join("invoices", "students.pdf"));
  const buffer3 = await readFileAsync(path.join("invoices", "parents.pdf"));

  const pdfDoc = await PDFDocument.create();

  const [pdf1Doc, pdf2Doc, pdf3Doc] = await Promise.all([
    PDFDocument.load(buffer1),
    PDFDocument.load(buffer2),
    PDFDocument.load(buffer3),
  ]);
  
  // copy pages from each generated PDF file into new PDF document
  const [pdf1Pages, pdf2Pages, pdf3Pages] = await Promise.all([
    pdfDoc.copyPages(pdf1Doc, pdf1Doc.getPageIndices()),
    pdfDoc.copyPages(pdf2Doc, pdf2Doc.getPageIndices()),
    pdfDoc.copyPages(pdf3Doc, pdf3Doc.getPageIndices()),
  ]);

  // add copied pages to new PDF document
  pdf1Pages.forEach((page) => pdfDoc.addPage(page));
  pdf2Pages.forEach((page) => pdfDoc.addPage(page));
  pdf3Pages.forEach((page) => pdfDoc.addPage(page));

  // save final combined PDF file
  
  const mergedPdf = await pdfDoc.save();
  fs.writeFileSync(path.join("invoices", "combined.pdf"), mergedPdf);
  
  //https://aghati.moalime.com/invoices/combined.pdf
  //https://server2.moalime.com/invoices/combined.pdf
  const pdf4 = await fetch("https://server2.moalime.com/invoices/combined.pdf");
  const buffer = await pdf4.arrayBuffer();
  const fileData = Buffer.from(buffer);
  res.writeHead(200, {
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=parents.pdf",
    "Content-Length": fileData.length,
  });
  res.end(fileData);
  
};

const getSessionsForStudent = async (req, res) => {
  const { StudentId } = req.params;
  const sessions = await Session.findAll({
    where: {
      StudentId,
      isPaid: true,
    },
    include: [{ model: Teacher }],
  });
  res.send({
    status: 200,
    sessions,
    msg: {
      arabic: "تم ارجاع جميع الجلسات للطالب بنجاح",
      english: "successful get all sessions for the student successfully",
    },
  });
};

const getSessionsForTeacher = async (req, res) => {
  const { TeacherId } = req.params;
  const sessions = await Session.findAll({
    where: {
      TeacherId,
      isPaid: true,
    },
    include: [{ model: Student }],
  });
  res.send({
    status: 200,
    sessions,
    msg: {
      arabic: "تم ارجاع جميع الجلسات للمعلم بنجاح",
      english: "successful get all sessions for the teacher successfully",
    },
  });
};

const editWhatsappPhone = async (req, res) => {
  const id = req.user.userId;
  const { whatsappPhone } = req.body;
  const admin = await Admin.findOne({
    where: { id },
  });
  if (!admin) {
    throw serverErrs.BAD_REQUEST("Admin not found");
  }
  await admin.update({ whatsappPhone });
  res.send({
    status: 201,
    admin,
    msg: {
      arabic: "تم تحديث رقم الواتس بنجاح",
      english: "successful update whatsapp phone successfully",
    },
  });
};

const createSocialMedia = async (req, res) => {
  const { type, link } = req.body;
  const newSocialMedia = await SocialMedia.create(
    {
      type,
      link,
    },
    {
      returning: true,
    }
  );
  await newSocialMedia.save();
  res.send({
    status: 201,
    data: newSocialMedia,
    msg: {
      arabic: "تم إضافة رابط السوشيال ميديا بنجاح",
      english: "successful create new SocialMedia",
    },
  });
};

const editSocialMedia = async (req, res) => {
  const { SocialMediaId } = req.params;
  const { type, link } = req.body;
  const socialMedia = await SocialMedia.findOne({
    where: { id: SocialMediaId },
  });
  if (!socialMedia) {
    throw serverErrs.BAD_REQUEST("socialMedia not found");
  }
  await socialMedia.update({ type, link });
  res.send({
    status: 201,
    data: socialMedia,
    msg: {
      arabic: "تم تحديث رابط السوشيال ميديا بنجاح",
      english: "successful update new SocialMedia",
    },
  });
};

const getSocialMedia = async (req, res) => {
  const socialMedia = await SocialMedia.findAll();
  res.send({
    status: 201,    //200 modify eng.reem.shwky@gmail.com
    data: socialMedia,
    msg: {
      arabic: "تم ارجاع السوشيال ميديا بنجاح",
      english: "successful get SocialMedia",
    },
  });
};

const getWatsappPhone = async (req, res) => {
  const admin = await Admin.findOne({ where: { id: 1 } });
  res.send({
    status: 200,
    data: admin.whatsappPhone,
    msg: {
      arabic: "تم ارجاع رقم الواتس بنجاح",
      english: "successful get whatsapp phone",
    },
  });
};

const updateProfitRatio = async (req, res) => {
  const { profitRatio } = req.body;
  await profitValidation.validate({ profitRatio });
  const id = req.user.userId;

  const admin = await Admin.findOne({
    where: {
      id: id,
    },
  });
  admin.profitRatio = profitRatio;
  await admin.save();
  res.send({
    status: 201,
    msg: {
      arabic: "تم تحديث نسبة الربح بنجاح",
      english: "successful update profitRatio successfully",
    },
  });
};

const deleteTeacher = async (req, res) => {
  const { TeacherId } = req.params;
  const teacher = await Teacher.findOne({ where: { id: TeacherId } });
  if (!teacher) throw serverErrs.BAD_REQUEST("Teacher not found");
  await teacher.update({ isEnable: false });
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف المدرب بنجاح",
      english: "successful delete trainer",
    },
  });
};

const deleteStudent = async (req, res) => {
  const { StudentId } = req.params;
  const student = await Student.findOne({ where: { id: StudentId } });
  if (!student) throw serverErrs.BAD_REQUEST("Student not found");
  await student.update({ isEnable: false });
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف الطالب بنجاح",
      english: "successful delete Student",
    },
  });
};

const getProfitRatio = async (req, res) => {
  const admin = await Admin.findOne({ where: { id: req.user.userId } });
  res.send({
    status: 200,
    profitRatio: admin.profitRatio,
  });
};

// Modiy by eng.reem.shwky@gmail.com
const signAbout = async (req, res) => {
  const { teacherId } = req.params;
  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجود",
      english: "Invalid trainerId! ",
    });

  const { firstName, lastName, gender, dateOfBirth, phone, country, city , trainingcategorytypes , limetypes} =
    req.body;
  let { languages } = req.body;
  if (typeof languages === "string") {
    languages = JSON.parse(languages);
  }
  if (typeof trainingcategorytypes === "string") {
    trainingcategorytypes = JSON.parse(trainingcategorytypes);
  }

  if(typeof limetypes === "string"){
    limetypes = JSON.parse(limetypes);
  }

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

  await TeacherTypes.bulkCreate(trainingcategorytypes).then(() =>
    console.log("Training Category Type TeachStd data have been created")
  );

  await TeacherLimits.bulkCreate(limetypes).then(() =>
    console.log("Limit Type TeachStd data have been created")
  );

  await LangTeachStd.bulkCreate(languages).then(() =>
    console.log("LangTeachStd data have been created")
  );

  const langTeachers = await LangTeachStd.findAll({
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
  const firstNames = teacher.firstName;
  const lastNames = teacher.lastName;

  res.send({
    status: 201,
    data: { firstName: firstNames, lastName: lastNames , typesTeachers , limitTeachers },
    msg: {
      arabic: "تم تسجيل معلوماتك بنجاح",
      english: "successful sign about data",
    },
  });
};

const uploadImage = async (req, res) => {
  const { teacherId } = req.params;

  if (!req.file)
    throw serverErrs.BAD_REQUEST({
      arabic: " الصورة غير موجودة ",
      english: "Image not exist ",
    });

  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجود",
      english: "Invalid trainerId! ",
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
  await teacher.update({ image: req.file.filename });
  res.send({
    status: 201,
    data: req.file.filename,
    msg: {
      arabic: "تم إدراج الصورة بنجاح",
      english: "uploaded image successfully",
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

  let { levels, curriculums } = req.body;
  if (typeof levels === "string") {
    levels = JSON.parse(levels);
  }
  if (typeof curriculums === "string") {
    curriculums = JSON.parse(curriculums);
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

  await TeacherLevel.bulkCreate(levels).then(() =>
    console.log("LangTeachStd data have been created")
  );
  await CurriculumTeacher.bulkCreate(curriculums).then(() =>
    console.log("LangTeachStd data have been created")
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
  await teacher.save();

  res.send({
    status: 201,
    data: { teacher, teacherLevels, curriculumTeachers },
    msg: {
      arabic: "تم تسجيل معلومات إضافية بنجاح",
      english: "successful sign Additional Information! ",
    },
  });
};

const addSubjects = async (req, res) => {
  const { teacherId } = req.params;

  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجود",
      english: "Invalid trainerId! ",
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
    await RemoteSession.create(remote).then(() =>
      console.log("Teacher remote session has been saved")
    );
  }
  if (f2fStudent) {
    f2fStudent["priceAfterDiscount"] =
      +f2fStudent.price - +f2fStudent.price * (+f2fStudent.discount / 100.0);
    await F2FSessionStd.create(f2fStudent).then(() =>
      console.log("teacher session at home student has been saved")
    );
  }
  if (f2fTeacher) {
    f2fTeacher["priceAfterDiscount"] =
      +f2fTeacher.price - +f2fTeacher.price * (+f2fTeacher.discount / 100.0);
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

const signResume = async (req, res) => {
  const { teacherId } = req.params;
  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجود",
      english: "Invalid trainerId! ",
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

// ----------------------
const deleteLevel = async (req, res) => {
  const { levelId } = req.params;
  const level = await Level.findOne({
    where: { id: levelId },
  });
  if (!level)
    throw serverErrs.BAD_REQUEST({
      arabic: "المستوى غير موجود",
      english: "Invalid levelId! ",
    });
  const classes = await Class.findAll({
    where: {
      LevelId: levelId,
    },
  });
  classes.forEach(async (classItem) => {
    await classItem.destroy();
  });

  const curriculumLevels = await CurriculumLevel.findAll({
    where: {
      LevelId: levelId,
    },
  });
  curriculumLevels.forEach(async (curriculumLevel) => {
    await curriculumLevel.destroy();
  });
  const teacherLevels = await TeacherLevel.findAll({
    where: {
      LevelId: levelId,
    },
  });
  teacherLevels.forEach(async (teacherLevel) => {
    await teacherLevel.destroy();
  });
  await level.destroy();
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف المستوى بنجاح",
      english: "successfully delete level!",
    },
  });
};

const deleteClass = async (req, res) => {
  const { classId } = req.params;
  const clss = await Class.findOne({
    where: { id: classId },
  });
  if (!clss)
    throw serverErrs.BAD_REQUEST({
      arabic: "الصف غير موجود",
      english: "Invalid classId! ",
    });
  await clss.destroy();

  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف القسم بنجاح",
      english: "successfully delete class!",
    },
  });
};
const deleteCurriculum = async (req, res) => {
  const { curriculumId } = req.params;
  console.log("trying to delete curruculum with id = ", curriculumId);
  const curriculum = await Curriculum.findOne({
    where: { id: curriculumId },
  });
  if (!curriculum)
    throw serverErrs.BAD_REQUEST({
      arabic: "المنهج غير موجود",
      english: "Invalid curriculumId! ",
    });
  const curriculumLevels = await CurriculumLevel.findAll({
    where: {
      CurriculumId: curriculumId,
    },
  });
  curriculumLevels.forEach(async (curriculumLevel) => {
    await curriculumLevel.destroy();
  });
  const curriculumTeachers = await CurriculumTeacher.findAll({
    where: {
      CurriculumId: curriculumId,
    },
  });
  curriculumTeachers.forEach(async (curriculumTeacher) => {
    await curriculumTeacher.destroy();
  });
  await curriculum.destroy();
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف المنهج بنجاح",
      english: "successfully delete curriculum!",
    },
  });
};

const deleteSubjectCategory = async (req, res) => {
  const { categoryId } = req.params;
  console.log("trying to delete subjectCategory with id = ", categoryId);
  const subjectCategorie = await SubjectCategory.findOne({
    where: { id: categoryId },
  });
  if (!subjectCategorie)
    throw serverErrs.BAD_REQUEST({
      arabic: "التصنيف غير موجود",
      english: "Invalid categoryId! ",
    });
  const subjects = await Subject.findAll({
    where: {
      SubjectCategoryId: categoryId,
    },
  });

  subjects.forEach(async (sub) => {
    await sub.destroy();
  });
  await subjectCategorie.destroy();

  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف المادة بنجاح",
      english: "successfully delete category!",
    },
  });
};
const deleteSubject = async (req, res) => {
  const { subjectId } = req.params;
  console.log("trying to delete subject with id = ", subjectId);
  const subject = await Subject.findOne({
    where: { id: subjectId },
  });
  if (!subject)
    throw serverErrs.BAD_REQUEST({
      arabic: "الموضوع غير موجود",
      english: "Invalid subjectId! ",
    });
  const teacherSubjects = await TeacherSubject.findAll({
    where: {
      SubjectId: subjectId,
    },
  });
  teacherSubjects.forEach(async (teacherSubject) => {
    await teacherSubject.destroy();
  });
  await subject.destroy();

  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف الموضوع بنجاح",
      english: "successfully delete subject!",
    },
  });
};

const suspendTeacher = async (req, res) => {
  const { teacherId } = req.params;
  console.log("trying to suspend teacher with id = ", teacherId);
  const teacher = await Teacher.findOne({
    where: { id: teacherId },
  });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجود",
      english: "Invalid trainerId! ",
    });
  await teacher.update({
    isSuspended: true,
  });
  const mailOptions = {
    from: process.env.APP_EMAIL,
    to: teacher.email,
    subject: "MDS: Account Suspended",
    html: `<div style="text-align: right;"> مرحبًا ، <br> 
    <br>.يؤسفنا أن نحيطك علما أن مدير موقع مسقط لتعليم قيادة السيارات قام بتوقيف حسابك توقيفا مؤقتا
    <br>.الرجاء التواصل مع الإدارة لحل المشكلة في القريب العاجل
    <br>.في الأثناء لا يمكنك استخدام خدمات موقع مسقط لتعليم قيادة السيارات
    .حظًا سعيدًا <br>
    ,فريق مسقط لتعليم قيادة السيارات
    </div>`,
  };
  const smsOptions = {
    body: `مرحبًا ،
    .يؤسفنا أن نحيطك علما أن مدير موقع مسقط لتعليم قيادة السيارات قام بتوقيف حسابك توقيفا مؤقتا
    .الرجاء التواصل مع الإدارة لحل المشكلة في القريب العاجل
    .في الأثناء لا يمكنك استخدام خدمات موقع مسقط لتعليم قيادة السيارات
    .حظًا سعيدًا 
    ,فريق مسقط لتعليم قيادة السيارات`,
    to: teacher.phone,
  };
  sendEmail(mailOptions, smsOptions);
  res.send({
    status: 201,
    msg: {
      arabic: "تم ايقاف المدرب بنجاح",
      english: "successfully suspended trainer!",
    },
  });
};
const suspendStudent = async (req, res) => {
  const { studentId } = req.params;
  console.log("trying to suspend student with id = ", studentId);
  const student = await Student.findOne({
    where: { id: studentId },
  });
  if (!student)
    throw serverErrs.BAD_REQUEST({
      arabic: "الطالب غير موجود",
      english: "Invalid studentId! ",
    });
  await student.update({
    isSuspended: true,
  });
  const mailOptions = {
    from: process.env.APP_EMAIL,
    to: student.email,
    subject: "MDS: Account Suspended",
    html: `<div style="text-align: right;"> مرحبًا ، <br> 
    <br>.يؤسفنا أن نحيطك علما أن مدير موقع مسقط لتعليم قيادة السيارات قام بتوقيف حسابك توقيفا مؤقتا
    <br>.الرجاء التواصل مع الإدارة لحل المشكلة في القريب العاجل
    <br>.في الأثناء لا يمكنك استخدام خدمات موقع مسقط لتعليم قيادة السيارات
    .حظًا سعيدًا <br>
    ,فريق مسقط لتعليم قيادة السيارات
    </div>`,
  };
  const smsOptions = {
    body: `مرحبًا ،
    .يؤسفنا أن نحيطك علما أن مدير موقع مسقط لتعليم قيادة السيارات قام بتوقيف حسابك توقيفا مؤقتا
    .الرجاء التواصل مع الإدارة لحل المشكلة في القريب العاجل
    .في الأثناء لا يمكنك استخدام خدمات موقع مسقط لتعليم قيادة السيارات
    .حظًا سعيدًا 
    ,فريق مسقط لتعليم قيادة السيارات`,
    to: student.phoneNumber,
  };
  sendEmail(mailOptions, smsOptions);

  res.send({
    status: 201,
    msg: {
      arabic: "تم ايقاف الطالب بنجاح",
      english: "successfully suspended student!",
    },
  });
};
const unSuspendTeacher = async (req, res) => {
  const { teacherId } = req.params;
  console.log("trying to unSuspend teacher with id = ", teacherId);
  const teacher = await Teacher.findOne({
    where: { id: teacherId },
  });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجود",
      english: "Invalid trainerId! ",
    });
  await teacher.update({
    isSuspended: false,
  });

  const mailOptions = {
    from: process.env.APP_EMAIL,
    to: teacher.email,
    subject: "MDS: Account Activated",
    html: `<div style="text-align: right;"> مرحبًا ، <br> 
    <br>.يسعدنا أن نحيطك علما أن مدير موقع مسقط لتعليم قيادة السيارات قام بإعادة تفعيل حسابك 
    <br> يمكنك استخدام خدمات موقع مسقط لتعليم قيادة السيارات الآن
    <br>.مع كامل إعتذارات فريق موقعي
    .حظًا سعيدًا <br>
    ,فريق مسقط لتعليم قيادة السيارات
    </div>`,
  };
  const smsOptions = {
    body: `مرحبًا ،
    .يسعدنا أن نحيطك علما أن مدير موقع مسقط لتعليم قيادة السيارات قام بإعادة تفعيل حسابك 
    .يمكنك استخدام خدمات موقع مسقط لتعليم قيادة السيارات الآن
   .مع كامل إعتذارات فريق موقعي
    .حظًا سعيدًا 
    ,فريق مسقط لتعليم قيادة السيارات`,
    to: teacher.phone,
  };
  sendEmail(mailOptions, smsOptions);

  res.send({
    status: 201,
    msg: {
      arabic: "تم اعادة تفعيل المدرب بنجاح",
      english: "successfully unSuspended trainer!",
    },
  });
};
const unSuspendStudent = async (req, res) => {
  const { studentId } = req.params;
  console.log("trying to unSuspend student with id = ", studentId);
  const student = await Student.findOne({
    where: { id: studentId },
  });
  if (!student)
    throw serverErrs.BAD_REQUEST({
      arabic: "الطالب غير موجود",
      english: "Invalid studentId! ",
    });
  await student.update({
    isSuspended: false,
  });
  const mailOptions = {
    from: process.env.APP_EMAIL,
    to: student.email,
    subject: "MDS: Account Activated",
    html: `<div style="text-align: right;"> مرحبًا ، <br> 
    <br>.يسعدنا أن نحيطك علما أن مدير موقع مسقط لتعليم قيادة السيارات قام بإعادة تفعيل حسابك 
    <br> يمكنك استخدام خدمات موقع مسقط لتعليم قيادة السيارات الآن
    <br>.مع كامل إعتذارات فريق موقعي
    .حظًا سعيدًا <br>
    ,فريق مسقط لتعليم قيادة السيارات
    </div>`,
  };
  const smsOptions = {
    body: `مرحبًا ،
    .يسعدنا أن نحيطك علما أن مدير موقع مسقط لتعليم قيادة السيارات قام بإعادة تفعيل حسابك 
    .يمكنك استخدام خدمات موقع مسقط لتعليم قيادة السيارات الآن
   .مع كامل إعتذارات فريق موقعي
    .حظًا سعيدًا 
    ,فريق مسقط لتعليم قيادة السيارات`,
    to: student.phoneNumber,
  };
  sendEmail(mailOptions, smsOptions);
  res.send({
    status: 201,
    msg: {
      arabic: "تم اعادة تفعيل الطالب بنجاح",
      english: "successfully unSuspended student!",
    },
  });
};
const suspendParent = async (req, res) => {
  const { parentId } = req.params;
  console.log("trying to suspend parent with id = ", parentId);
  const parent = await Parent.findOne({
    where: { id: parentId },
  });
  if (!parent)
    throw serverErrs.BAD_REQUEST({
      arabic: "الوالد غير موجودة",
      english: "Invalid parentId! ",
    });
  await parent.update({
    isSuspended: true,
  });

  const mailOptions = {
    from: process.env.APP_EMAIL,
    to: parent.email,
    subject: "MDS: Account Suspended",
    html: `<div style="text-align: right;"> مرحبًا ، <br> 
    <br>.يؤسفنا أن نحيطك علما أن مدير موقع مسقط لتعليم قيادة السيارات قام بتوقيف حسابك توقيفا مؤقتا
    <br>.الرجاء التواصل مع الإدارة لحل المشكلة في القريب العاجل
    <br>.في الأثناء لا يمكنك استخدام خدمات موقع مسقط لتعليم قيادة السيارات
    .حظًا سعيدًا <br>
    ,فريق مسقط لتعليم قيادة السيارات
    </div>`,
  };
  sendEmail(mailOptions);

  res.send({
    status: 201,
    msg: {
      arabic: "تم ايقاف الوالد بنجاح",
      english: "successfully suspended parent!",
    },
  });
};
const unSuspendParent = async (req, res) => {
  const { parentId } = req.params;
  console.log("trying to unSuspend parent with id = ", parentId);
  const parent = await Parent.findOne({
    where: { id: parentId },
  });
  if (!parent)
    throw serverErrs.BAD_REQUEST({
      arabic: "الوالد غير موجودة",
      english: "Invalid parentId! ",
    });
  await parent.update({
    isSuspended: false,
  });
  const mailOptions = {
    from: process.env.APP_EMAIL,
    to: parent.email,
    subject: "MDS: Account Activated",
    html: `<div style="text-align: right;"> مرحبًا ، <br> 
    <br>.يسعدنا أن نحيطك علما أن مدير موقع مسقط لتعليم قيادة السيارات قام بإعادة تفعيل حسابك 
    <br> يمكنك استخدام خدمات موقع مسقط لتعليم قيادة السيارات الآن
    <br>.مع كامل إعتذارات فريق مسقط لتعليم قيادة السيارات
    .حظًا سعيدًا <br>
    ,فريق مسقط لتعليم قيادة السيارات
    </div>`,
  };
  sendEmail(mailOptions);
  res.send({
    status: 201,
    msg: {
      arabic: "تم  اعادة تفعيل الوالد بنجاح",
      english: "successfully unsuspended parent!",
    },
  });
};
//Developer by eng.reem.shwky@gmail.com
const getAllCashBoxStudent = async (req, res) => {
  const arrStudents = await Student.findAll({
    include: [
      { model: FinancialRecord },
    ],
    order: [["createdAt", "DESC"]],
  });
  
  res.send({
    status: 200,
    data: arrStudents,
    msg: {
      arabic: "تم جلب جميع العمليات البنكية المالية للطلاب بنجاح",
      english: "successfully fetched financial records students!",
    },
  });
};

const getSingleCashBoxStudent = async (req, res) => {
  const { studentId } = req.params;
  const objRows = await FinancialRecord.findAll({
    where: { StudentId: studentId },
    include: [
      { model: Student, attributes: ["name"], required: false },
      { model: Teacher},
    ],
    order: [["createdAt", "DESC"]],
  });
  
  res.send({
    status: 200,
    data: objRows,
    msg: {
      arabic: "تم جلب جميع العمليات البنكية المالية للطلاب بنجاح",
      english: "successfully fetched financial records students!",
    },
  });
};

const getSingleCashBoxTeacher = async (req, res) => {
  const { teacherId } = req.params;
  const objRows = await FinancialRecord.findAll({
    where: { TeacherId: teacherId },
    include: [
      { model: Student, attributes: ["name" , "image"], required: false },
      { model: Teacher},
    ],
    order: [["createdAt", "DESC"]],
  });
  
  res.send({
    status: 200,
    data: objRows,
    msg: {
      arabic: "تم جلب جميع العمليات البنكية المالية للمدب بنجاح",
      english: "successfully fetched financial records team!",
    },
  });
};

const getAllCashBoxTeacher = async (req, res) => {
  const arrTeacher = await Teacher.findAll({
    include: [
      { model: FinancialRecord },
    ],
    order: [["createdAt", "DESC"]],
  });
  
  res.send({
    status: 200,
    data: arrTeacher,
    msg: {
      arabic: "تم جلب جميع العمليات البنكية المالية للمدربين بنجاح",
      english: "successfully fetched financial records teachers!",
    },
  });
};

const getAllFinancialRecords = async (req, res) => {
  const financialRecords = await FinancialRecord.findAll({
    include: [
      { model: Student, attributes: ["name"], required: false },
      {
        model: Teacher,
        attributes: ["firstName", "lastName"],
        required: false,
      },
    ],
    order: [["createdAt", "DESC"]],
  });
  res.send({
    status: 200,
    data: financialRecords,
    msg: {
      arabic: "تم جلب التقارير المالية بنجاح",
      english: "successfully fetched financial records!",
    },
  });
};

const deleteFinancialRecords = async (req, res) => {
  const { financialRecordsId } = req.params;
  const objCurrent = await FinancialRecord.findOne({ where: { id: financialRecordsId } });
  if (!objCurrent) throw serverErrs.BAD_REQUEST("Training Category Type not found");
  await FinancialRecord.destroy({
    where: {
      id: financialRecordsId,
    },
  });
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف تقارير المالية بنجاح",
      english: "successful delete financial record",
    },
  });
};

//Developed by eng.reem.shwky@gmail.com

const getTrainingCategoryTypes = async (req, res) => {
  const trainingcategorytypes = await TrainingCategoryType.findAll();
  res.send({
    status: 201,
    data: trainingcategorytypes,
    msg: {
      arabic: "تم ارجاع جميع فئه التدريب بنجاح",
      english: "successful get all training category types",
    },
  });
};
const getSingleTrainingCategoryType = async (req, res) => {
  const { trainingcategorytypeId } = req.params;
  const trainingcategorytype = await TrainingCategoryType.findOne({
    where: { id: trainingcategorytypeId },
    include: { all: true },
  });
  if (!trainingcategorytype)
    throw serverErrs.BAD_REQUEST({
      arabic: "فئه التدريب غير موجود",
      english: "Invalid trainingcategorytypeId! ",
    });
  res.send({
    status: 201,
    data: trainingcategorytype,
    msg: {
      arabic: "تم ارجاع فئه التدريب بنجاح",
      english: "successful get single Training Category Type",
    },
  });
};
const createTrainingCategoryType = async (req, res) => {
  const { titleAR, titleEN } = req.body;
  const image = req.file.filename;

  const newTrainingCategoryType = await TrainingCategoryType.create(
    {
      titleAR       : titleAR,
      titleEN       : titleEN,
      image         : image,
    },
    {
      returning: true,
    }
  );
  await newTrainingCategoryType.save();
  res.send({
    status: 201,
    data: newTrainingCategoryType,
    msg: {
      arabic: "تم إنشاء فئه جديده من التدريب بنجاح",
      english: "successful create new Training Category Type",
    },
  });
};
const deleteTrainingCategoryType = async (req, res) => {
  const { trainingcategorytypeId } = req.params;
  const obj_tct = await TrainingCategoryType.findOne({ where: { id: trainingcategorytypeId } });
  if (!obj_tct) throw serverErrs.BAD_REQUEST("Training Category Type not found");
  await TrainingCategoryType.destroy({
    where: {
      id: trainingcategorytypeId,
    },
  });
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف فئه التدريب بنجاح",
      english: "successful delete training Category Type",
    },
  });
};
const updateTrainingCategoryType = async (req, res) => {
  const { titleAR, titleEN } = req.body;
  const { trainingcategorytypeId } = req.params;
  const obj_tct = await TrainingCategoryType.findOne({
    where   : { id: trainingcategorytypeId },
    include : { all: true },
  });
  if (!obj_tct)
    throw serverErrs.BAD_REQUEST({
      arabic: "فئه التدريب غير موجود",
      english: "Class not found",
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
    }
  
    if (req.file && obj_tct.image) {
      clearImage(obj_tct.image);
    }
    if (req.file) {
      await obj_tct.update({ image: req.file.filename });
    }

  await obj_tct.update({ titleAR, titleEN });
  res.send({
    status: 201,
    data: obj_tct,
    msg: { arabic: "تم تعديل فئه التدريب بنجاح", english: "successful update Training Category Type" },
  });
};

const getLimeTypes = async (req, res) => {
  const limetypes = await LimeType.findAll();
  res.send({
    status: 201,
    data: limetypes,
    msg: {
      arabic: "تم ارجاع جميع نوع الجير بنجاح",
      english: "successful get all lime type",
    },
  });
};

const getSingleLimeType = async (req, res) => {
  const { limetypeId } = req.params;
  const limetype = await LimeType.findOne({
    where: { id: limetypeId },
    include: { all: true },
  });
  if (!limetype)
    throw serverErrs.BAD_REQUEST({
      arabic: "فئه التدريب غير موجود",
      english: "Invalid trainingcategorytypeId! ",
    });
  res.send({
    status: 201,
    data: limetype,
    msg: {
      arabic: "تم ارجاع فئه التدريب بنجاح",
      english: "successful get single Training Category Type",
    },
  });
};

const createLimeType = async (req, res) => {
  const { titleAR, titleEN } = req.body;
  const image = req.file.filename;

  const newLimeType = await LimeType.create(
    {
      titleAR   : titleAR,
      titleEN   : titleEN,
      image     : image,
    },
    {
      returning: true,
    }
  );

  await newLimeType.save();
  res.send({
    status: 201,
    data: newLimeType,
    msg: {
      arabic: "تم إنشاء نوع الجير جديده من التدريب بنجاح",
      english: "successful create new Lime Type",
    },
  });
};

const deleteLimeType = async (req, res) => {
  const { limetypeId } = req.params;
  const obj_tct = await LimeType.findOne({ where: { id: limetypeId } });
  if (!obj_tct) throw serverErrs.BAD_REQUEST("Lime Type not found");
  await LimeType.destroy({
    where: {
      id: limetypeId,
    },
  });
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف نوع الجير بنجاح",
      english: "successful delete Lime Type",
    },
  });
};

const updateLimeType = async (req, res) => {
  console.log("Update Lime Type");
  console.log(req.body);
  
  const { titleAR, titleEN } = req.body;
  const { limetypeId } = req.params;
  const image = req.file.filename;

  const obj_tct = await LimeType.findOne({
    where   : { id: limetypeId },
    include : { all: true },
  });
  if (!obj_tct)
    throw serverErrs.BAD_REQUEST({
      arabic: "نوع الجير غير موجود",
      english: "Lime Type not found",
    });
  await obj_tct.update({ titleAR, titleEN });
  const clearImage = (filePath) => {
    filePath = path.join(__dirname, "..", `images/${filePath}`);
    fs.unlink(filePath, (err) => {
      if (err)
        throw serverErrs.BAD_REQUEST({
          arabic: "الصورة غير موجودة",
          english: "Image not found",
        });
    });
  }

  if (req.file && obj_tct.image) {
    clearImage(obj_tct.image);
  }
  if (req.file) {
    await obj_tct.update({ image: req.file.filename });
  }

  res.send({
    status: 201,
    data: obj_tct,
    msg: { arabic: "تم تعديل نوع الجير بنجاح", english: "successful update Lime Type" },
  });
};

const getSingleAdmin = async (req, res) => {
  const { AdminId } = req.params;
  const obj_admin = await Admin.findOne({
    where: { id: AdminId },
    include: { all: true },
  });
  if (!obj_admin)
    throw serverErrs.BAD_REQUEST({
      arabic: "الادمن غير موجودة",
      english: "Invalid AdminId! ",
    });
  res.send({
    status: 201,
    data  : obj_admin,
    msg: {
      arabic: "تم ارجاع الادمن بنجاح",
      english: "successful get single Admin",
    },
  });
};
const getAdmins = async (req, res) => {
  const obj_admins  = await Admin.findAll();
  
  res.send({
    status: 201,
    data  : obj_admins,
    msg: {
      arabic: "تم ارجاع الادمن بنجاح",
      english: "successful get all Admin",
    },
  });
};

const createAdmin = async (req, res) => {
  const { email, name, password , whatsappPhone , role , address } = req.body;
  const admin = await Admin.findOne({
    where: {
      email,
    },
  });
  if (admin)
    throw serverErrs.BAD_REQUEST({
      arabic: "الإيميل مستخدم سابقا",
      english: "email is already used",
    });

  const obj_Whatsapp = await Admin.findOne({
      where: {
        whatsappPhone,
      },
    });

    if (obj_Whatsapp)
      throw serverErrs.BAD_REQUEST({
        arabic    : "رقم الواتس اب مستخدم سابقا",
        english   : "Whatsapp is already used",
      });

  const hashPassword = await hash(password, 12);
  const newAdmin = await Admin.create(
    {
      email         : email,
      name          : name,
      password      : hashPassword,
      whatsappPhone : whatsappPhone,
      role          : role,
      address       : address,
    },
    {
      returning: true,
    }
  );
  await newAdmin.save();
  res.send({
    status: 201,
    data: newAdmin,
    msg: {
      arabic  : "تم إنشاء ادمن جديده بنجاح",
      english : "successful create new Admin",
    },
  });
};

const updateAdmin = async (req, res) => {
  const { email, name, password , whatsappPhone , role , address} = req.body;
  
  const { AdminId } = req.params;
  const obj_update_admin = await Admin.findOne({
    where   : { id: AdminId },
    include : { all: true },
  });
  if (!obj_update_admin)
    throw serverErrs.BAD_REQUEST({
      arabic: " الادمن غير موجود",
      english: "Admin not found",
    });
  await obj_update_admin.update({ 
    email         : email, 
    name:name , 
    password      : obj_update_admin.password , 
    whatsappPhone : whatsappPhone,
    role          : role,
    address       : address,
   });
  
  res.send({
    status: 201,
    data: obj_update_admin,
    msg: { arabic: "تم تعديل بيانات الادمن بنجاح", english: "successful update admin" },
  });
};

const deleteAdmin = async (req, res) => {
  const { AdminId } = req.params;
  const obj_admin = await Admin.findOne({
    where: { id: AdminId },
  });
  if (!obj_admin)
    throw serverErrs.BAD_REQUEST({
      arabic: "الادمن غير موجود",
      english: "Invalid Admin ID! ",
    });
  
  await obj_admin.destroy();
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف الادمن بنجاح",
      english: "successfully delete Admin !",
    },
  });
};

const rejectPackage = async (req, res) => {
  const { packageId } = req.params;
  const objPackage = await Package.findOne({
    where: { id: packageId },
    include: { all: true },
  });
  if (!objPackage)
    throw serverErrs.BAD_REQUEST({
      arabic    : "الباقه غير موجود",
      english   : "Package not found",
    });
  
  console.log("Found Package");

  await objPackage.update({ status: "0" });
  console.log("Rejected Package");
  res.send({
    status: 201,
    msg: {
      arabic: "تم رفض الباقة بنجاح",
      english: "Package has been rejected",
    },
  });
};

const acceptPackage = async (req, res) => {

  const { packageId } = req.params;
  const objPackage = await Package.findOne({
    where: { id: packageId },
  });
  if (!objPackage)
    throw serverErrs.BAD_REQUEST({
      arabic    : "الباقه غير موجود",
      english   : "Package not found",
    });

  console.log("Found Package");

  await objPackage.update({ status: "2" });
  console.log("Update Package");

  res.send({
    status: 201,
    msg: {
      arabic: "تم قبول الباقة بنجاح",
      english: "Package has been Accepted",
    },
  });
};

const getPackageByStatus = async (req, res) => {
  console.log(req.params);
  const { status } = req.params;
  const arrPackage = await Package.findAll({
    where: {
      status: status,
    },
    include: [
      { model: Teacher  },
      { model: TrainingCategoryType },
      { model: LimeType },
      { model: SubjectCategory  },
      { model: Level    },
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

const getAllPackages = async (req, res) => {
  const arrPackage = await Package.findAll({
    include: [
      { model: Teacher  },
      { model: TrainingCategoryType },
      { model: LimeType },
      { model: SubjectCategory  },
      { model: Level    },
    ],
  });

  res.send({
    status: 201,
    data: arrPackage,
    msg: {
      arabic: "تم ارجاع جميع باقاتي بنجاح",
      english: "successful get all packages teacher",
    },
  });
};

const deleteParentStudent = async (req, res) => {
  const { parentStudentId } = req.params;
  const objParentStudent = await ParentStudent.findOne({
    where: { id: parentStudentId },
  });
  if (!objParentStudent)
    throw serverErrs.BAD_REQUEST({
      arabic: "السجيل غير موجود",
      english: "Invalid Record ID! ",
    });
  
  await objParentStudent.destroy();
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف السجل بنجاح",
      english: "successfully delete record !",
    },
  });
};

const getRates = async (req, res) => {

  const rates = await Rate.findAll({
    include: [{ model: Student, },
      { model: Teacher, },
    ],
  });

  res.send({
    status: 201,
    data: rates,
    msg: {
      arabic: "تم ارجاع جميع تقيم العملاء بنجاح",
      english: "successful get all rating",
    },
  });
};

const deleteRates = async (req, res) => {
  const { rateId } = req.params;
  const objRate = await Rate.findOne({
    where: { id: rateId },
  });
  if (!objRate)
    throw serverErrs.BAD_REQUEST({
      arabic: "التقيم غير موجود",
      english: "Invalid Record ID! ",
    });
  
  await objRate.destroy();
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف السجل بنجاح",
      english: "successfully delete record !",
    },
  });
};

const getSingleDrivingLicenses = async (req, res) => {
  console.log("Get Driving Licesss");
  const { drivingLicensesId } = req.params;

  const objDrivingLicense = await DrivingLicenses.findOne({
    where      :   { id: drivingLicensesId },
    attributes: { exclude: ["password"] },
  });
  if (!objDrivingLicense)
    throw serverErrs.BAD_REQUEST({
      arabic: "رخصه القياده غير موجودة",
      english: "Invalid Driving Licenses! ",
    });

  console.log(objDrivingLicense);
  res.send({
    status: 201,
    data  : objDrivingLicense,
    msg: {
      arabic: "تم ارجاع رخصه القياده بنجاح",
      english: "successful get single Driving Licenses",
    },
  });
};

const getDrivingLicenses = async (req, res) => {
  const objList  = await DrivingLicenses.findAll();
  
  res.send({
    status: 201,
    data  : objList,
    msg: {
      arabic: "تم ارجاع  رخصه القياده بنجاح",
      english: "successful get all Driving Licenses",
    },
  });
};

const createDrivingLicenses = async (req, res) => {
  const { titleAR, titleEN, country , requirementsAR , requirementsEN } = req.body;
  const image = req.file.filename;
  const objDrivingLicenses = await DrivingLicenses.findOne({
    where: {
      country : country,
    },
  });
  if (objDrivingLicenses)
    throw serverErrs.BAD_REQUEST({
      arabic: "الدوله موجوده سابقا",
      english: "country is already found",
    });
    

  const newDrivingLicenses = await DrivingLicenses.create(
    {
      titleAR         : titleAR,
      titleEN         : titleEN,
      country         : country,
      requirementsAR  : requirementsAR,
      requirementsEN  : requirementsEN,
      image           : image,
    },
    {
      returning: true,
    }
  );
  await newDrivingLicenses.save();
  res.send({
    status: 201,
    data: newDrivingLicenses,
    msg: {
      arabic  : "تم إنشاء رخصه القياده جديده بنجاح",
      english : "successful create new Driving Licenses",
    },
  });
};

const deleteDrivingLicenses = async (req, res) => {
  const { drivingLicensesId } = req.params;
  const objDrivingLicenses = await DrivingLicenses.findOne({ where: { id: drivingLicensesId } });
  if (!objDrivingLicenses)   
    throw serverErrs.BAD_REQUEST({
      arabic: "رخصه القياده غير موجوده سابقا",
      english: "Driving Licenses is already not found",
    });

  await DrivingLicenses.destroy({
    where: {
      id: drivingLicensesId,
    },
  });
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف رخصه القياده بنجاح",
      english: "successful delete Driving Licenses",
    },
  });
};

const updateDrivingLicenses = async (req, res) => {
  
  const { titleAR, titleEN, country , requirementsAR , requirementsEN } = req.body;
  const { drivingLicensesId } = req.params;

  const objDrivingLicenses = await DrivingLicenses.findOne({
    where   : { id: drivingLicensesId },
    include : { all: true },
  });
  if (!objDrivingLicenses)
    throw serverErrs.BAD_REQUEST({
      arabic: "رخصه القياده غير موجوده سابقا",
      english: "Driving Licenses is already not found",
    });
  await objDrivingLicenses.update({
    titleAR         : titleAR,
    titleEN         : titleEN,
    country         : country,
    requirementsAR  : requirementsAR,
    requirementsEN  : requirementsEN,
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
  }

  if (req.file && objDrivingLicenses.image) {
    clearImage(objDrivingLicenses.image);
  }
  if (req.file) {
    await objDrivingLicenses.update({ image: req.file.filename });
  }

  res.send({
    status: 201,
    data: objDrivingLicenses,
    msg: { 
      arabic: "تم تعديل بيانات رخصه القياده بنجاح", 
      english: "successful update Driving Licenses" 
    },
  });
};

const sendMail = async (req, res) => {
  console.log("Send Message New");
  const language = "en";
  const { email , messageMail } = req.body;
  const mailOptions = adminSendEmailBody(messageMail, language, email);
  /*
  const mailOptions = {
    from      : process.env.APP_EMAIL,
    to        : email,
    subject   : "MDS: New Message",
    html: messageMail,
  };
  */
  sendEmail(mailOptions);

  res.send({
    status: 201,
    msg: {
      arabic: "تم ارسال الرساله بنجاح",
      english: "successfully send message!",
    },
  });
};
/*
const { Client , LocalAuth} = require('whatsapp-web.js');
const qrcode                = require('qrcode-terminal');
*/

const sendWhatsapp = async (req, res) => {
  /*
  console.log("enter Send Whats");

  const client     = new Client({
    puppeteer: {
     headless: true,
    },
  });

  try {
    client.on('qr', async (qr) => {
      console.log('QR RECEIVED = ', qr);
      qrcode.generate(qr, { small: true });
      res.send({data : qr});
    });
  
    client.on('authenticated', async (session) => {
      console.log('Authenticated');
    });
  
    client.on('disconnected', async (reason) => {
      console.log(`Disconnected, reason: ${reason}`)
    });
    const { phone , message } = req.body;
    
    client.on('ready', async() => {
      try {
      console.log('Client is ready! ، I Will Send');
      console.log(phone);
      var nomer_telephone = [phone]; //"+201012591423",  // "+201096193358" // "+201020189717" ,
      var sendMessageTo = `Hi, Muscat ` + message; 
      
        for (var nomor = 0; nomor < nomer_telephone.length; nomor++) {
          var chatId = nomer_telephone[nomor].substring(1) + "@c.us"; 
          client.sendMessage(chatId, sendMessageTo).then((r) => {
            console.log(`Hi `+ chatId +` has been sendMessage to `+ sendMessageTo);
           
          });;
        }
        
        console.log("END SEND........");
        setTimeout(() => {
           client.destroy();
        }, 10000);
        
      } catch (error) {
        console.log(error);
      }
  
      //res.send({status: 201, data : "Finished Send Message"});
    });
    client.initialize();
    console.log("END ALL Whats appp");
  } catch (error) {
    console.log(error);
    res.send({status: 201, data : "ERROR001"});
  }
  */
};


const sendWhatsappWaitingSendMessage = async (req, res) => {
  const { phone , message } = req.body;
  
};

const getAllParents = async (req, res) => {

  const objList = await Parent.findAll();

  res.send({
    status: 201,
    data  : objList,
    msg: {
      arabic: "تم ارجاع جميع الاباء بنجاح",
      english: "successful get all parents",
    },
  }); 
};

const rejectTeacherLecture = async (req, res) => {
  const { lectrueId } = req.params;
  const objLecture = await TeacherLecture.findOne({
    where: { id: lectrueId },
  });
  if (!objLecture)
    throw serverErrs.BAD_REQUEST({
      arabic    : "المحاضره غير موجود",
      english   : "Package not found",
    });


  await objLecture.update({ status: "0" });
  console.log("Rejected Lecture");
  res.send({
    status: 201,
    msg: {
      arabic: "تم رفض المحاضره بنجاح",
      english: "Lecture has been rejected",
    },
  });
};

const acceptTeacherLecture = async (req, res) => {
  const { lectrueId } = req.params;
  const objLecture = await TeacherLecture.findOne({
    where: { id: lectrueId },
  });
  if (!objLecture)
    throw serverErrs.BAD_REQUEST({
      arabic    : "المحاضره غير موجود",
      english   : "Lecture not found",
    });


  await objLecture.update({ status: "2" });

  res.send({
    status: 201,
    msg: {
      arabic: "تم قبول المحاضره بنجاح",
      english: "Lecture has been Accepted",
    },
  });
};

const getAllLecture = async (req, res) => {
  const arrLectures = await TeacherLecture.findAll({
    include: { all: true },
  });

  res.send({
    status: 201,
    data: arrLectures,
    msg: {
      arabic: "تم ارجاع جميع المحاضرات المدرب بنجاح",
      english: "successful get all lectures teacher",
    },
  });
};

const getAllCareerDeparment = async (req, res) => {
  const arrCareerDepartment = await CareerDepartment.findAll();
  res.send({
    status: 201,
    data: arrCareerDepartment,
    msg: {
      arabic: "تم ارجاع جميع اقسام الؤظائف بنجاح",
      english: "successful get all department career",
    },
  });
};
const getSingleCareerDepartment = async (req, res) => {
  const { careerDepartmentId } = req.params;
  const objCareerDepartment = await CareerDepartment.findOne({
    where: { id: careerDepartmentId },
  });

  if (!objCareerDepartment)
    throw serverErrs.BAD_REQUEST({
      arabic: "قسم الوظيفة غير موجود",
      english: "Invalid career deparment ID! ",
    });
  res.send({
    status: 201,
    data: objCareerDepartment,
    msg: {
      arabic: "تم ارجاع اقسام الؤظيفه بنجاح",
      english: "successful get single Career Department",
    },
  });
};
const createCareerDepartment = async (req, res) => {
  const { titleAR, titleEN } = req.body;
  const newCareerDepartment = await CareerDepartment.create(
    {
      titleAR   : titleAR,
      titleEN   : titleEN,
    },
    {
      returning: true,
    }
  );

  await newCareerDepartment.save();
  res.send({
    status: 201,
    data: newCareerDepartment,
    msg: {
      arabic: "تم إنشاء قسم وظيفة جديده بنجاح",
      english: "successful create new career department",
    },
  });
};
const deleteCareerDepartment = async (req, res) => {
  const { careerDepartmentId } = req.params;
  const objCareerDepartment   = await CareerDepartment.findOne({ where: { id: careerDepartmentId } });
  if (!objCareerDepartment) throw serverErrs.BAD_REQUEST("Career Department not found");
  await CareerDepartment.destroy({
    where: {
      id: careerDepartmentId,
    },
  });
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف قسم الوظيفة بنجاح",
      english: "successful delete Career Department",
    },
  });
};
const updateCareerDepartment = async (req, res) => {
  console.log("Update Career Department");
  console.log(req.body);
  
  const { titleAR, titleEN } = req.body;
  const { careerDepartmentId } = req.params;

  const objCareerDepartment = await CareerDepartment.findOne({
    where   : { id: careerDepartmentId },
  });
  if (!objCareerDepartment)
    throw serverErrs.BAD_REQUEST({
      arabic  : " قسم الوظيفة غير موجود",
      english : "Career Department not found",
    });
  await objCareerDepartment.update({ titleAR, titleEN });
  res.send({
    status: 201,
    data: objCareerDepartment,
    msg: { arabic: "تم تعديل قسم الوظيفة بنجاح", english: "successful update Career Department" },
  });
};

const getAllCareer = async (req, res) => {
  const arrCareer  = await Career.findAll({
    include: { all: true },
  });
  res.send({
    status: 201,
    data: arrCareer,
    msg: {
      arabic: "تم ارجاع جميع الؤظائف بنجاح",
      english: "successful get all careers",
    },
  });
};

const createCareer = async (req, res) => {
  const { titleAR, titleEN, country , descriptionAr , descriptionEn , advertiserName , advertiserPhone , CareerDepartmentId } = req.body;
  const image = req.file.filename;
  const objCareerDepartment = await CareerDepartment.findOne({
    where: {
      id : CareerDepartmentId,
    },
  });
  if (!objCareerDepartment)
    throw serverErrs.BAD_REQUEST({
      arabic: "قسم الوظيفة موجوده سابقا",
      english: "Career Department is already found",
    });

  const newCareer = await Career.create(
    {
      titleAR         : titleAR,
      titleEN         : titleEN,
      country         : country,
      descriptionAr   : descriptionAr,
      descriptionEn   : descriptionEn,
      CareerDepartmentId : CareerDepartmentId,
      image           : image,
      advertiserName  : advertiserName,
      advertiserPhone : advertiserPhone,
      status          : "1"
    }
  );
  await newCareer.save();
  res.send({
    status: 201,
    data: newCareer,
    msg: {
      arabic  : "تم إنشاء وظيفه جديده بنجاح",
      english : "successful create new Career",
    },
  });
};

const getSingleCareer = async (req, res) => {
  const { careerId } = req.params;
  const objCareer = await Career.findOne({
    where   : { id: careerId },
    include : { all: true },
  });

  if (!objCareer)
    throw serverErrs.BAD_REQUEST({
      arabic: " الوظيفة غير موجود",
      english: "Invalid career ID! ",
    });
  res.send({
    status: 201,
    data: objCareer,
    msg: {
      arabic: "تم ارجاع الؤظيفه بنجاح",
      english: "successful get single Career",
    },
  });
};

const deleteCareer = async (req, res) => {
  const { careerId } = req.params;
  const objCareer   = await Career.findOne({ where: { id: careerId } });
  if (!objCareer) throw serverErrs.BAD_REQUEST("Career not found");
  await Career.destroy({
    where: {
      id: careerId,
    },
  });
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف الوظيفة بنجاح",
      english: "successful delete Career",
    },
  });
};

const updateCareer = async (req, res) => {
  
  const { titleAR, titleEN, country , descriptionAr , descriptionEn ,  advertiserName , advertiserPhone, CareerDepartmentId } = req.body;
  const { careerId } = req.params;

  const objCareer = await Career.findOne({
    where   : { id: careerId },
    include : { all: true },
  });
  if (!objCareer)
    throw serverErrs.BAD_REQUEST({
      arabic: " الوظيفه غير موجوده سابقا",
      english: "Career is already not found",
    });

  await objCareer.update({
    titleAR         : titleAR,
    titleEN         : titleEN,
    country         : country,
    descriptionAr   : descriptionAr,
    descriptionEn   : descriptionEn,
    advertiserName  : advertiserName, 
    advertiserPhone     : advertiserPhone,
    CareerDepartmentId  : CareerDepartmentId,
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
  }

  if (req.file && objCareer.image) {
    clearImage(objCareer.image);
  }
  if (req.file) {
    await objCareer.update({ image: req.file.filename });
  }

  res.send({
    status: 201,
    data: objCareer,
    msg: { 
      arabic: "تم تعديل بيانات الوظيفة بنجاح", 
      english: "successful update Career" 
    },
  });
};

const getCareerByDepartment = async (req, res) => {
  const { departmentId } = req.params;
  const arrCareer  = await Career.findAll({
    where : {
      CareerDepartmentId : departmentId,
    },
    include: { all: true },
  });
  res.send({
    status: 201,
    data: arrCareer,
    msg: {
      arabic: "تم ارجاع جميع الؤظائف بنجاح",
      english: "successful get all careers",
    },
  });
};


const getSingleNews = async (req, res) => {
  console.log("Get News");
  const { newsId } = req.params;

  const objNews = await News.findOne({
    where      :   { id: newsId }
  });
  if (!objNews)
    throw serverErrs.BAD_REQUEST({
      arabic: "النشره الاخبارية غير موجودة",
      english: "Invalid News! ",
    });

  res.send({
    status: 201,
    data  : objNews,
    msg: {
      arabic: "تم ارجاع النشره الاخبارية بنجاح",
      english: "successful get single News",
    },
  });
};

const getNews = async (req, res) => {
  const objList  = await News.findAll();
  
  res.send({
    status: 201,
    data  : objList,
    msg: {
      arabic: "تم ارجاع النشره الاخبارية بنجاح",
      english: "successful get all News",
    },
  });
};

const createNews = async (req, res) => {
  const { titleAR, titleEN , descriptionAR , descriptionEN } = req.body;
  const image = req.file.filename;
  const newNews = await News.create(
    {
      titleAR         : titleAR,
      titleEN         : titleEN,
      descriptionAR   : descriptionAR,
      descriptionEN   : descriptionEN,
      image           : image,
    },
    {
      returning: true,
    }
  );
  await newNews.save();
  res.send({
    status: 201,
    data: newNews,
    msg: {
      arabic  : "تم إنشاء نشره اخبارية جديده بنجاح",
      english : "successful create new News",
    },
  });
};

const deleteNews = async (req, res) => {
  const { newId } = req.params;
  const objNews = await News.findOne({ where: { id: newId } });
  if (!objNews)   
    throw serverErrs.BAD_REQUEST({
      arabic: "نشره اخبارية غير موجوده سابقا",
      english: "News is already not found",
    });

  await objNews.destroy({
    where: {
      id: newId,
    },
  });
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف النشره الاخبارية بنجاح",
      english: "successful delete News",
    },
  });
};

const updateNews = async (req, res) => {
  
  const { titleAR, titleEN , descriptionAR , descriptionEN } = req.body;
  const { newId } = req.params;

  const objNews = await News.findOne({
    where   : { id: newId }
  });
  if (!objNews)
    throw serverErrs.BAD_REQUEST({
      arabic: " النشره الاخبارية غير موجوده سابقا",
      english: "News is already not found",
    });
  await objNews.update({
    titleAR         : titleAR,
    titleEN         : titleEN,
    descriptionAR   : descriptionAR,
    descriptionEN   : descriptionEN,
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
  }

  if (req.file && objNews.image) {
    clearImage(objNews.image);
  }
  if (req.file) {
    await objNews.update({ image: req.file.filename });
  }

  res.send({
    status: 201,
    data: objNews,
    msg: { 
      arabic: "تم تعديل بيانات النشره الاخبارية بنجاح", 
      english: "successful update News" 
    },
  });
};

const getTests = async (req, res) => {
  const arrTests = await Tests.findAll({
    include: { all: true },
  });

  res.send({
    status: 201,
    data: arrTests,
    msg: {
      arabic: "تم ارجاع جميع الاختبارات بنجاح",
      english: "successful get all tests",
    },
  });
};

const rejectTests = async (req, res) => {
  const { testId } = req.params;
  const objTests = await Tests.findOne({
    where: { id: testId },
    include: { all: true },
  });
  if (!objTests)
    throw serverErrs.BAD_REQUEST({
      arabic    : "الاختبار غير موجود",
      english   : "Test not found",
    });
  
  console.log("Found Package");

  await objTests.update({ status: "0" });
  console.log("Rejected Test");
  res.send({
    status: 201,
    msg: {
      arabic: "تم رفض الاختبار بنجاح",
      english: "Test has been rejected",
    },
  });
};

const acceptTests = async (req, res) => {

  const { testId } = req.params;
  const objTest = await Tests.findOne({
    where: { id: testId },
  });
  if (!objTest)
    throw serverErrs.BAD_REQUEST({
      arabic    : "الاختبار غير موجود",
      english   : "Test not found",
    });

  console.log("Found Test");

  await objTest.update({ status: "2" });
  console.log("Update Package");

  res.send({
    status: 201,
    msg: {
      arabic: "تم قبول الاختبار بنجاح",
      english: "Test has been Accepted",
    },
  });
};

const getSingleExchangeRequestsTeacher = async (req, res) => {
  const { exchangeRequestsTeacherId } = req.params;

  const objExchangeRequestsTeacher = await ExchangeRequestsTeacher.findOne({
    where      :   { id: exchangeRequestsTeacherId },
    include: [{ model: Teacher }],
  });
  if (!objExchangeRequestsTeacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "طلب صرف المدرب غير موجودة",
      english: "Invalid Exchange Requests Teacher! ",
    });

  res.send({
    status: 201,
    data  : objExchangeRequestsTeacher,
    msg: {
      arabic: "تم ارجاع طلب صرف المدرب بنجاح",
      english: "successful get single Exchange Requests Teacher",
    },
  });
};

const getExchangeRequestsTeachers = async (req, res) => {
  const objList  = await ExchangeRequestsTeacher.findAll({
    include: [{ model: Teacher }],
  });
  
  res.send({
    status: 201,
    data  : objList,
    msg: {
      arabic: "تم ارجاع صرف المدرب بنجاح",
      english: "successful get all Exchange Requests Teacher",
    },
  });
};

const createExchangeRequestsTeacher = async (req, res) => {
  const { amount, currency , status , TeacherId, AdminId } = req.body;
  const newExchange = await ExchangeRequestsTeacher.create(
    {
      amount        : amount,
      currency      : currency,
      status        : status,
      TeacherId     : TeacherId,
      AdminId       : AdminId,
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
      english : "successful create new Exchange Requests Teacher",
    },
  });
};

const deleteExchangeRequestsTeacher = async (req, res) => {
  const { exchangeRequestsTeacherId } = req.params;
  const objExchangeRequestsTeacher = await ExchangeRequestsTeacher.findOne({ where: { id: exchangeRequestsTeacherId } });
  if (!objExchangeRequestsTeacher)   
    throw serverErrs.BAD_REQUEST({
      arabic: "طلب صرف غير موجوده سابقا",
      english: "Exchange Requests Teacher is already not found",
    });

  await objExchangeRequestsTeacher.destroy({
    where: {
      id: exchangeRequestsTeacherId,
    },
  });
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف طلب صرف بنجاح",
      english: "successful delete Exchange Requests Teacher",
    },
  });
};

const updateExchangeRequestsTeacher = async (req, res) => {
  const { amount, currency , status , TeacherId, AdminId } = req.body;
  const { exchangeRequestsTeacherId } = req.params;

  const objExchangeRequestsTeacher = await ExchangeRequestsTeacher.findOne({
    where   : { id: exchangeRequestsTeacherId }
  });

  if (!objExchangeRequestsTeacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "صرف الطلب غير موجوده سابقا",
      english: "Exchange Requests Teacher is already not found",
    });
  await objExchangeRequestsTeacher.update({
      amount        : amount,
      currency      : currency,
      status        : status,
      TeacherId     : TeacherId,
      AdminId       : AdminId,
   });

  res.send({
    status: 201,
    data: objExchangeRequestsTeacher,
    msg: { 
      arabic: "تم تعديل بيانات صرف الطلب بنجاح", 
      english: "successful update Exchange Requests Teacher" 
    },
  });
};

const updateExchangeRequestsTeacherByStatus = async (req, res) => {
  console.log("Update Teacher ");

  const { status } = req.body;
  const { exchangeRequestsTeacherId } = req.params;
 
  console.log(status);
  console.log(exchangeRequestsTeacherId);
  const objExchangeRequestsTeacher = await ExchangeRequestsTeacher.findOne({
    where   : { id: exchangeRequestsTeacherId }
  });

  if (!objExchangeRequestsTeacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "صرف الطلب غير موجوده سابقا",
      english: "Exchange Requests Teacher is already not found",
    });
  await objExchangeRequestsTeacher.update({
      status        : status
   });

  if(status == "2"){
    res.send({
      status: 201,
      data: objExchangeRequestsTeacher,
      msg: { 
        arabic: "تم تعديل بيانات الموافقة علي صرف الطلب بنجاح", 
        english: "successful agree to Exchange Requests Teacher" 
      },
    });
  }else{
    res.send({
      status: 201,
      data: objExchangeRequestsTeacher,
      msg: { 
        arabic: "تم تعديل بيانات رفض علي صرف الطلب بنجاح", 
        english: "successful disagree to Exchange Requests Teacher" 
      },
    });
  }
  
};

const createRefundTeacher = async (req, res) =>{
  const { amount, reasonAR , reasonEN , TeacherId , totalAmount , currency , AdminId , exchangeRequestTeacherId } = req.body;

  const objTeacher = await Teacher.findOne({
    where  : { id: TeacherId }
  });
  if (!objTeacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المدرب غير موجودة",
      english: "Invalid Teacher! ",
    });

  objTeacher.totalAmount += +amount;
  await objTeacher.save();

  const objExchange = await ExchangeRequestsTeacher.findOne({
    where  : { id: exchangeRequestTeacherId }
  });
  if (!objExchange)
    throw serverErrs.BAD_REQUEST({
      arabic: "صرف الطلب غير موجوده سابقا",
      english: "Exchange Requests Teacher is already not found",
    });
  await objExchange.update({
      status        : "4",
  });
  
  await FinancialRecord.create({
    TeacherId : TeacherId,
    currency  : currency,
    amount    : amount,
    type      : "refund",
  });

  const newRefundHistory = await TeacherRefund.create(
    {
      amount        : amount,
      currency      : currency,
      reasonAR      : reasonAR,
      reasonEN      : reasonEN,
      previousWallet: totalAmount,
      nowWallet     : objTeacher.totalAmount,  
      AdminId       : AdminId,
      TeacherId     : TeacherId
    },
    {
      returning: true,
    }
  );
  await newRefundHistory.save();

  res.send({
    status: 201,
    data  : newRefundHistory,
    msg: {
      arabic: "تم عمليه الاسترجاع بنجاح",
      english: "successful add Refund success",
    },
  });
}

const getSingleExchangeRequestsParent = async (req, res) => {
  console.log("ExchangeRequestsParent");
  const { exchangeRequestsParentId } = req.params;

  const objExchangeRequestsParent = await ExchangeRequestsParent.findOne({
    where      :   { id: exchangeRequestsParentId }
  });
  if (!objExchangeRequestsParent)
    throw serverErrs.BAD_REQUEST({
      arabic: "طلب صرف الاب غير موجودة",
      english: "Invalid Exchange Requests Parent! ",
    });

  res.send({
    status: 201,
    data  : objExchangeRequestsParent,
    msg: {
      arabic: "تم ارجاع طلب صرف الاب بنجاح",
      english: "successful get single Exchange Requests Parent",
    },
  });
};

const getExchangeRequestsParents = async (req, res) => {
  const objList  = await ExchangeRequestsParent.findAll({
    include: [{ model: Parent }],
  });
  
  res.send({
    status: 201,
    data  : objList,
    msg: {
      arabic: "تم ارجاع صرف الاباء بنجاح",
      english: "successful get all Exchange Requests Parents",
    },
  });
};

const createExchangeRequestsParent = async (req, res) => {
  const { amount, currency , status , ParentId, AdminId } = req.body;
  const newExchange = await ExchangeRequestsParent.create(
    {
      amount        : amount,
      currency      : currency,
      status        : status,
      ParentId      : ParentId,
      AdminId       : AdminId,
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
      english : "successful create new Exchange Requests Parent",
    },
  });
};

const deleteExchangeRequestsParent = async (req, res) => {
  const { exchangeRequestsParentId } = req.params;
  const objExchangeRequestsParent = await ExchangeRequestsParent.findOne({ where: { id: exchangeRequestsParentId } });
  if (!objExchangeRequestsParent)   
    throw serverErrs.BAD_REQUEST({
      arabic: "طلب صرف غير موجوده سابقا",
      english: "Exchange Requests Parent is already not found",
    });

  await objExchangeRequestsParent.destroy({
    where: {
      id: exchangeRequestsParentId,
    },
  });
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف طلب صرف بنجاح",
      english: "successful delete Exchange Requests Parent",
    },
  });
};

const updateExchangeRequestsParent = async (req, res) => {
  
  const { amount, currency , status , ParentId, AdminId } = req.body;
  const { exchangeRequestsParentId } = req.params;

  const objExchangeRequestsParent = await ExchangeRequestsParent.findOne({
    where   : { id: exchangeRequestsParentId }
  });

  if (!objExchangeRequestsParent)
    throw serverErrs.BAD_REQUEST({
      arabic: "صرف الطلب غير موجوده سابقا",
      english: "Exchange Requests Parent is already not found",
    });
  await objExchangeRequestsParent.update({
      amount        : amount,
      currency      : currency,
      status        : status,
      ParentId      : ParentId,
      AdminId       : AdminId,
   });

  res.send({
    status: 201,
    data: objExchangeRequestsParent,
    msg: { 
      arabic: "تم تعديل بيانات صرف الطلب بنجاح", 
      english: "successful update Exchange Requests Parent" 
    },
  });
};

const updateExchangeRequestsParentByStatus = async (req, res) => {
  
  const { status } = req.body;
  const { exchangeRequestsParentId } = req.params;

  const objExchangeRequestsParent = await ExchangeRequestsParent.findOne({
    where   : { id: exchangeRequestsParentId }
  });

  if (!objExchangeRequestsParent)
    throw serverErrs.BAD_REQUEST({
      arabic: "صرف الطلب غير موجوده سابقا",
      english: "Exchange Requests Student is already not found",
    });
  await objExchangeRequestsParent.update({
      status        : status
   });

  if(status == "2"){
    res.send({
      status: 201,
      data: objExchangeRequestsParent,
      msg: { 
        arabic: "تم تعديل بيانات الموافقة علي صرف الطلب بنجاح", 
        english: "successful agree to Exchange Requests Parent" 
      },
    });
  }else{
    res.send({
      status: 201,
      data: objExchangeRequestsParent,
      msg: { 
        arabic: "تم تعديل بيانات رفض علي صرف الطلب بنجاح", 
        english: "successful disagree to Exchange Requests Parent" 
      },
    });
  }
  
};

const getSingleExchangeRequestsStudent = async (req, res) => {
  const { exchangeRequestsStudentId } = req.params;

  const objExchangeRequestsStudent = await ExchangeRequestsStudent.findOne({
    where      :   { id: exchangeRequestsStudentId },
    include: [{ model: Student }],
  });
  if (!objExchangeRequestsStudent)
    throw serverErrs.BAD_REQUEST({
      arabic: "طلب صرف الطالب غير موجودة",
      english: "Invalid Exchange Requests Student! ",
    });

  res.send({
    status: 201,
    data  : objExchangeRequestsStudent,
    msg: {
      arabic: "تم ارجاع طلب صرف الاب بنجاح",
      english: "successful get single Exchange Requests Student",
    },
  });
};

const getExchangeRequestsStudents = async (req, res) => {
  const objList  = await ExchangeRequestsStudent.findAll({
    include: [{ model: Student }],
  });
  
  
  res.send({
    status: 201,
    data  : objList,
    msg: {
      arabic: "تم ارجاع صرف الطلاب بنجاح",
      english: "successful get all Exchange Requests Students",
    },
  });
};

const createRefundStudent = async (req, res) =>{
  const { amount, reasonAR , reasonEN , StudentId , wallet , currency , AdminId , exchangeRequestStudentId } = req.body;
  
  const createWallet = async () => {
    const wallet = await Wallet.create({
      StudentId, price: amount, currency, typeAr: "استرجاع",   typeEn: "refund",
    });
    return wallet;
  };

  const objStudent = await Student.findOne({
    where  : { id: StudentId }
  });
  if (!objStudent)
    throw serverErrs.BAD_REQUEST({
      arabic: "الطالب غير موجودة",
      english: "Invalid Student! ",
    });
  
  const objWallet = await createWallet();
  objWallet.isPaid = true;
  await objWallet.save();
  objStudent.wallet += +amount;
  await objStudent.save();

  const objExchange = await ExchangeRequestsStudent.findOne({
    where  : { id: exchangeRequestStudentId }
  });
  if (!objExchange)
    throw serverErrs.BAD_REQUEST({
      arabic: "صرف الطلب غير موجوده سابقا",
      english: "Exchange Requests Student is already not found",
    });
  await objExchange.update({
      status        : "4",
  });
  
  const newRefundHistory = await StudentRefund.create(
    {
      amount        : amount,
      currency      : currency,
      reasonAR      : reasonAR,
      reasonEN      : reasonEN,
      previousWallet: wallet,
      nowWallet     : objStudent.wallet,  
      AdminId       : AdminId,
      StudentId     : StudentId
    },
    {
      returning: true,
    }
  );
  await newRefundHistory.save();

  res.send({
    status: 201,
    data  : newRefundHistory,
    msg: {
      arabic: "تم عمليه الاسترجاع بنجاح",
      english: "successful add Refund success",
    },
  });
}

const createExchangeRequestsStudent = async (req, res) => {
  const { amount, currency , status , StudentId, AdminId } = req.body;
  const newExchange = await ExchangeRequestsStudent.create(
    {
      amount        : amount,
      currency      : currency,
      status        : status,
      StudentId     : StudentId,
      AdminId       : AdminId,
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

const deleteExchangeRequestsStudent = async (req, res) => {
  const { exchangeRequestsStudentId } = req.params;
  const objExchangeRequestsStudent = await ExchangeRequestsStudent.findOne({ where: { id: exchangeRequestsStudentId } });
  if (!objExchangeRequestsStudent)   
    throw serverErrs.BAD_REQUEST({
      arabic: "طلب صرف غير موجوده سابقا",
      english: "Exchange Requests Student is already not found",
    });

  await objExchangeRequestsStudent.destroy({
    where: {
      id: exchangeRequestsStudentId,
    },
  });
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف طلب صرف بنجاح",
      english: "successful delete Exchange Requests Student",
    },
  });
};

const updateExchangeRequestsStudent = async (req, res) => {
  
  const { amount, currency , status , StudentId, AdminId } = req.body;
  const { exchangeRequestsStudentId } = req.params;

  const objExchangeRequestsStudent = await ExchangeRequestsStudent.findOne({
    where   : { id: exchangeRequestsStudentId }
  });

  if (!objExchangeRequestsStudent)
    throw serverErrs.BAD_REQUEST({
      arabic: "صرف الطلب غير موجوده سابقا",
      english: "Exchange Requests Student is already not found",
    });
  await objExchangeRequestsStudent.update({
      amount        : amount,
      currency      : currency,
      status        : status,
      StudentId     : StudentId,
      AdminId       : AdminId,
   });

  res.send({
    status: 201,
    data: objExchangeRequestsStudent,
    msg: { 
      arabic: "تم تعديل بيانات صرف الطلب بنجاح", 
      english: "successful update Exchange Requests Parent" 
    },
  });
};

const updateExchangeRequestsStudentByStatus = async (req, res) => {
  
  const { status } = req.body;
  const { exchangeRequestsStudentId } = req.params;

  const objExchangeRequestsStudent = await ExchangeRequestsStudent.findOne({
    where   : { id: exchangeRequestsStudentId }
  });

  if (!objExchangeRequestsStudent)
    throw serverErrs.BAD_REQUEST({
      arabic: "صرف الطلب غير موجوده سابقا",
      english: "Exchange Requests Student is already not found",
    });
  await objExchangeRequestsStudent.update({
      status        : status
   });

  if(status == "2"){
    res.send({
      status: 201,
      data: objExchangeRequestsStudent,
      msg: { 
        arabic: "تم تعديل بيانات الموافقة علي صرف الطلب بنجاح", 
        english: "successful agree to Exchange Requests Parent" 
      },
    });
  }else{
    res.send({
      status: 201,
      data: objExchangeRequestsStudent,
      msg: { 
        arabic: "تم تعديل بيانات رفض علي صرف الطلب بنجاح", 
        english: "successful disagree to Exchange Requests Parent" 
      },
    });
  }
  
};

const getNumbersExchangeRequests = async (req, res) => {
  const parentNumWaiting = await ExchangeRequestsParent.count({
    where: {
      status: "1",
    },
  });

  const studentNumWaiting = await ExchangeRequestsStudent.count({
    where: {
      status: ["1" , "-1"],
    },
  });

  const teacherNumWaiting = await ExchangeRequestsTeacher.count({
    where: {
      status: [ "-1" , "1"],
    },
  });

  const parentNumAccept = await ExchangeRequestsParent.count({
    where: {
      status: "2",
    },
  });

  const parentNumRejected = await ExchangeRequestsParent.count({
    where: {
      status: "0",
    },
  });

  

  const studentNumAccept = await ExchangeRequestsStudent.count({
    where: {
      status: "2",
    },
  });

  const studentNumRejected = await ExchangeRequestsStudent.count({
    where: {
      status: "0",
    },
  });

  const teacherNumAccept = await ExchangeRequestsTeacher.count({
    where: {
      status: "2",
    },
  });

  const teacherNumRejected = await ExchangeRequestsTeacher.count({
    where: {
      status: "0",
    },
  });

  res.send({
    status: 201,
    data: { 
      parentNumWaiting,   parentNumAccept,   parentNumRejected, 
      studentNumWaiting,  studentNumAccept , studentNumRejected , 
      teacherNumWaiting,  teacherNumAccept,  teacherNumRejected
    },
    msg: {
      arabic: "تم ارجاع جميع الطلاب والمدربين والاباء المسجلين",
      english: "successful get all numbers",
    },
  });
};
// Table Ads
const getSingleAds = async (req, res) => {
  const { adsId } = req.params;

  const objAds = await Ads.findOne({
    where      :   { id: adsId },
  });
  if (!objAds)
    throw serverErrs.BAD_REQUEST({
      arabic: "الاعلان غير موجودة",
      english: "Invalid Ads! ",
    });

  res.send({
    status: 201,
    data  : objExchangeRequestsTeacher,
    msg: {
      arabic: "تم ارجاع طلب صرف المدرب بنجاح",
      english: "successful get single Exchange Requests Teacher",
    },
  });
};

const getAllAds = async (req, res) => {
  const listAds  = await Ads.findAll(
    {
      include: [{ 
        model : AdsDepartment
      }],
    }
  );

  var newArr = [];
  for( var i=0; i < listAds.length ; i++){
    const arrImages = await AdsImages.findAll({
      where       : { AdId: listAds[i].id },
    });

    var row_image = ( arrImages.length >0  && arrImages != null) ? arrImages[0].image : "";
    var createobj = {
      id                  : listAds[i].id,
      images              : arrImages,
      image               : row_image,
      createdAt           : listAds[i].createdAt,
      updatedAt           : listAds[i].updatedAt,
      titleAR             : listAds[i].titleAR,
      titleEN             : listAds[i].titleEN,
      descriptionAR       : listAds[i].descriptionAR,
      descriptionEN       : listAds[i].descriptionEN,
      link                : listAds[i].link,
      advertiserPhone     : listAds[i].advertiserPhone,
      advertiserAddress   : listAds[i].advertiserAddress,
      status              : listAds[i].status,
      GuestId             : listAds[i].GuestId,
      AdsDepartmentId     : listAds[i].AdsDepartmentId,
      carModel            : listAds[i].carModel,
      yearManufacture     : listAds[i].yearManufacture,
      carPrice            : listAds[i].carPrice,
      currency            : listAds[i].currency,
    }
    newArr[i] = createobj;
  }
  
  res.send({
    status: 201,
    data  : newArr,
    msg: {
      arabic: "تم ارجاع جميع الاعلانات بنجاح",
      english: "successful get all Ads",
    },
  });
};

const createAds = async (req, res) => {
  const {  titleAR , titleEN , descriptionAR , descriptionEN , 
           link, carModel, yearManufacture , carPrice , 
           currency , AdsDepartmentId } = req.body;
  const image = req.file.filename;
  const newAds = await Ads.create(
    {
      titleAR           : titleAR,        titleEN       : titleEN,
      descriptionAR     : descriptionAR,  descriptionEN     : descriptionEN,
      link              : link,           image             : image,
      carModel          : carModel,       yearManufacture   : yearManufacture,
      carPrice          : carPrice,
      currency          : currency,
      AdsDepartmentId   : AdsDepartmentId,
    },
    {
      returning: true,
    }
  );
  await newAds.save();
  res.send({
    status: 201,
    data: newAds,
    msg: {
      arabic  : "تم إنشاء اعلان جديده بنجاح",
      english : "successful create new ADS",
    },
  });
};

const deleteAds = async (req, res) => {
  const { adsId } = req.params;
  const objAds = await Ads.findOne({ where: { id: adsId } });
  if (!objAds)   
    throw serverErrs.BAD_REQUEST({
      arabic: "اعلان غير موجوده سابقا",
      english: "ADS is already not found",
    });

  await objAds.destroy({
    where: {
      id: adsId,
    },
  });
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف اعلان بنجاح",
      english: "successful delete Ads",
    },
  });
};

const updateAds = async (req, res) => {
  const {  titleAR , titleEN , descriptionAR , descriptionEN , 
    link, carModel, yearManufacture , carPrice , currency ,
    AdsDepartmentId
   } = req.body;
  const { adsId } = req.params;

  const objAds = await Ads.findOne({
    where   : { id: adsId }
  });

  if (!objAds)
    throw serverErrs.BAD_REQUEST({
      arabic: "اعلان غير موجوده سابقا",
      english: "ADS is already not found",
    });
  await objAds.update({
    titleAR       : titleAR,            titleEN       : titleEN,
    descriptionAR : descriptionAR,      descriptionEN : descriptionEN,
    link          : link,               carModel          : carModel,
    yearManufacture   : yearManufacture,carPrice          : carPrice,
    currency          : currency,       AdsDepartmentId   : AdsDepartmentId,
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
  }

  if (req.file && objAds.image) {
    clearImage(objAds.image);
  }
  if (req.file) {
    await objAds.update({ image: req.file.filename });
  }

  res.send({
    status: 201,
    data: objAds,
    msg: { 
      arabic: "تم تعديل بيانات اعلان بنجاح", 
      english: "successful update Exchange Requests Teacher" 
    },
  });
};

const getAllDiscounts = async (req, res) => {
  const arrDiscounts = await Discounts.findAll({
    include: [
      { model: Teacher  },
    ],
  });

  res.send({
    status: 201,
    data: arrDiscounts,
    msg: {
      arabic: "تم ارجاع جميع الخصومات الخاصه بنجاح",
      english: "successful get all dicounts teacher",
    },
  });
};

const getAllDiscountsAgree = async (req, res) => {
  const arrDiscounts = await Discounts.findAll({
    where: { status : "2" },
    include: [
      { model: Teacher  },
    ],
  });

  res.send({
    status: 201,
    data: arrDiscounts,
    msg: {
      arabic: "تم ارجاع جميع الخصومات الخاصه بنجاح",
      english: "successful get all agree dicounts teacher",
    },
  });
};
const updateDiscountStatus = async (req, res) => {
  
  const { status }     = req.body;
  const { discountId } = req.params;

  const objDicount = await Discounts.findOne({
    where   : { id: discountId }
  });

  if (!objDicount)
    throw serverErrs.BAD_REQUEST({
      arabic: "صف الخصومه غير موجوده سابقا",
      english: "Discount is already not found",
    });
  await objDicount.update({
      status        : status,
   });

  res.send({
    status: 201,
    data: objDicount,
    msg: { 
      arabic: "تم تعديل بيانات الخصومه بنجاح", 
      english: "successful update data status of discount" 
    },
  });
};

const getAllAdsDeparment = async (req, res) => {
  const arrList = await AdsDepartment.findAll();
  res.send({
    status: 201,
    data: arrList,
    msg: {
      arabic: "تم ارجاع جميع اقسام الاعلانات بنجاح",
      english: "successful get all department department",
    },
  });
};

const getSingleAdsDepartment = async (req, res) => {
  const { adsDepartmentId } = req.params;
  const objAdsDepartment = await AdsDepartment.findOne({
    where: { id: adsDepartmentId },
  });
  if (!adsDepartmentId)
    throw serverErrs.BAD_REQUEST({
      arabic: "قسم الاعلان غير موجود",
      english: "Invalid ads deparment ID! ",
    });
  res.send({
    status: 201,
    data: objAdsDepartment,
    msg: {
      arabic: "تم ارجاع اقسام الاعلان بنجاح",
      english: "successful get single Ads Department",
    },
  });
};

const createAdsDepartment = async (req, res) => {
  const { titleAR, titleEN } = req.body;
  const newAdsDepartment = await AdsDepartment.create(
    {
      titleAR   : titleAR,
      titleEN   : titleEN,
    },
    {
      returning: true,
    }
  );

  await newAdsDepartment.save();
  res.send({
    status: 201,
    data: newAdsDepartment,
    msg: {
      arabic: "تم إنشاء قسم اعلان جديده بنجاح",
      english: "successful create new ads department",
    },
  });
};

const deleteAdsDepartment = async (req, res) => {
  const { adsDepartmentId } = req.params;
  const objAdsDepartment   = await AdsDepartment.findOne({ where: { id: adsDepartmentId } });
  if (!objAdsDepartment) throw serverErrs.BAD_REQUEST("Ads Department not found");
  await AdsDepartment.destroy({
    where: {
      id: adsDepartmentId,
    },
  });
  res.send({
    status: 201,
    msg: {
      arabic: "تم حذف قسم الاعلان بنجاح",
      english: "successful delete Ads Department",
    },
  });
};

const updateAdsDepartment = async (req, res) => {
  console.log("Update Ads Department");
  console.log(req.body);
  
  const { titleAR, titleEN } = req.body;
  const { adsDepartmentId } = req.params;

  const objAdsDepartment = await AdsDepartment.findOne({
    where   : { id: adsDepartmentId },
  });
  if (!objAdsDepartment)
    throw serverErrs.BAD_REQUEST({
      arabic  : " قسم الاعلان غير موجود",
      english : "Ads Department not found",
    });
  await objAdsDepartment.update({ titleAR, titleEN });
  res.send({
    status: 201,
    data: objAdsDepartment,
    msg: { arabic: "تم تعديل قسم الاعلان بنجاح", english: "successful update Ads Department" },
  });
};

const updateAdsStatus = async (req, res) => {
  const { status }     = req.body;
  const { AdsId } = req.params;

  const objAds = await Ads.findOne({
    where   : { id: AdsId }
  });

  if (!objAds)
    throw serverErrs.BAD_REQUEST({
      arabic: "صف الاعلان غير موجوده سابقا",
      english: "Ads is already not found",
    });
  await objAds.update({
      status        : status,
   });

  res.send({
    status: 201,
    data: objAds,
    msg: { 
      arabic: "تم تعديل بيانات الاعلان بنجاح", 
      english: "successful update data status of ads" 
    },
  });
};

const updateCareerStatus = async (req, res) => {
  const { status }  = req.body;
  const { CareerId }   = req.params;

  const objCareer = await Career.findOne({
    where   : { id: CareerId }
  });

  if (!objCareer)
    throw serverErrs.BAD_REQUEST({
      arabic: "صف الوظيفه غير موجوده سابقا",
      english: "Career is already not found",
    });
  await objCareer.update({
      status        : status,
   });

  res.send({
    status: 201,
    data: objCareer,
    msg: { 
      arabic: "تم تعديل بيانات الوظيفه بنجاح", 
      english: "successful update data status of career" 
    },
  });
};

const getCounts = async (req, res) => {
  try {
    const data = await Statistics.findByPk(1);
    
    if (!data) {
      return res.status(404).json({ error: "Data not found" });
    }

    const countData = {
      teachers: data.teachers,
      students: data.students,
      lessons: data.lessons,
      lectures: data.lectures
    };

    res.send({
      status: 200,
      data: countData,
      message: {
        ar: "عملية ناجحة",
        en: "Process successfully"
      }
    });
  } catch (error) {
    console.error("Error fetching counts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const changeCounts = async (req, res) => {
  try {
    const { teachers, students, lessons, lectures } = req.body;
    const data = await Statistics.findByPk(1);

    if (!data) {
      return res.status(404).json({ error: "Data not found" });
    }

    // تحديث القيم
    data.teachers = teachers;
    data.students = students;
    data.lessons = lessons;
    data.lectures = lectures;

    // حفظ التحديثات في قاعدة البيانات
    await data.save();

    const countData = {
      teachers: data.teachers,
      students: data.students,
      lessons: data.lessons,
      lectures: data.lectures
    };

    res.send({
      status: 200,
      data: countData,
      message: {
        ar: "عملية ناجحة",
        en: "Process successfully"
      }
    });
  } catch (error) {
    console.error("Error updating counts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getCounts,
  changeCounts,
  signUp,
  login,
  createStudent,          createTeacher,        createSubjectCategory,
  createSubject,          createLevel,          createClass,
  createCurriculum,       getSubjects,          getSingleSubject,
  getSubjectCategories,   getSingleSubjectCategory,
  getClasses,             getSingleClass,       getLevels,
  getSingleLevel,         getCurriculums,       getSingleCurriculum,
  linkedCurriculumLevel,  acceptStudent,        rejectStudent,
  getParentStudentWaiting,  getParentStudentAccOrRej,
  acceptTeacher,            getAcceptedTeachers,      rejectTeacher,
  getWaitingTeacher,        getLanguageLevel,         updateLevel,
  updateSubCategories,      updateSubject,            updateClass,
  updateCurriculum,         payDues,
  // Developer by eng.reem.shwky@gmail.com
  getAllSessions,             deleteSessions,
  getAllWallets,              getStudentWallets,
  getThawaniSession,          getAllTeachers,
  getTeacherFinancial,        getNumbers,
  getAllWalletsPdf,           getAllStudentsPDF,        getAllTeachersPDF,          getAllParentsPDF,
  getSessionsForStudent,      getSessionsForTeacher,    editWhatsappPhone,
  createSocialMedia,          editSocialMedia,          getSocialMedia,
  getWatsappPhone,
  allReports,                   updateProfitRatio,            deleteTeacher,
  deleteStudent,                getProfitRatio,     getNewCheckoutRequests,
  getProcessedCheckoutRequests, acceptCheckout,               rejectCheckout,
  signAbout,                    uploadImage,        signAdditionalInfo,
  addSubjects,
  signResume,
  signAvailability,
  addDescription,
  signVideoLink,
  deleteLevel,               deleteClass,                deleteCurriculum,
  deleteSubjectCategory,     deleteSubject,      suspendTeacher,
  suspendStudent,            suspendParent,      unSuspendTeacher,
  unSuspendStudent,          unSuspendParent,    getAllFinancialRecords,

  // Developer by eng.reem.shwky@gmail.com
  deleteFinancialRecords,     getTrainingCategoryTypes,   getSingleTrainingCategoryType,
  createTrainingCategoryType, deleteTrainingCategoryType, updateTrainingCategoryType,

  getLimeTypes,             getSingleLimeType,
  createLimeType,           deleteLimeType,         updateLimeType,         
  getSingleAdmin,           createAdmin,
  updateAdmin,              deleteAdmin,            getAdmins,
  getPackageByStatus,       acceptPackage,          rejectPackage,
  getAllPackages,
  deleteParentStudent,
  getRates,                 deleteRates,
  getSingleDrivingLicenses,                         getDrivingLicenses,
  createDrivingLicenses,    updateDrivingLicenses,
  deleteDrivingLicenses,
  getAllParents,            sendMail,
  rejectTeacherLecture,     acceptTeacherLecture,         getAllLecture,

  getAllCareerDeparment,    getSingleCareerDepartment,    createCareerDepartment,
  deleteCareerDepartment,   updateCareerDepartment,

  getAllCareer,             createCareer,                 deleteCareer,
  getSingleCareer,          updateCareer,                 getCareerByDepartment,
  getSingleNews,            getNews,                      createNews,
  deleteNews,               updateNews,                   deleteWallets,
  getTests,                 acceptTests,                  rejectTests,
  getSingleExchangeRequestsTeacher,     getExchangeRequestsTeachers,
  createExchangeRequestsTeacher,        deleteExchangeRequestsTeacher,
  updateExchangeRequestsTeacher,
  getSingleExchangeRequestsParent,      getExchangeRequestsParents,
  createExchangeRequestsParent,         deleteExchangeRequestsParent,
  updateExchangeRequestsParent,
  getSingleExchangeRequestsStudent,     getExchangeRequestsStudents,
  createExchangeRequestsStudent,        deleteExchangeRequestsStudent,
  updateExchangeRequestsStudent,        getNumbersExchangeRequests,
  updateExchangeRequestsStudentByStatus,
  updateExchangeRequestsParentByStatus,
  updateExchangeRequestsTeacherByStatus,
  getSingleAds,               getAllAds,                createAds,
  deleteAds,                  updateAds,                getAllDiscounts,          getAllDiscountsAgree,
  updateDiscountStatus,       getAllCashBoxStudent,     getAllCashBoxTeacher,
  getSingleCashBoxStudent,    getSingleCashBoxTeacher,  createRefundStudent,
  createRefundTeacher,
  getAllAdsDeparment,         getSingleAdsDepartment,   createAdsDepartment,
  deleteAdsDepartment,        updateAdsDepartment,      updateAdsStatus,
  updateCareerStatus,         sendWhatsapp,             sendWhatsappWaitingSendMessage,
  getWhatsData,
};
