const { Guest , Teacher , Student , Parent , Career, Ads, AdsDepartment, AdsImages, CareerDepartment }   = require("../models");
const { validateStudent, loginValidation } = require("../validation");
const { serverErrs } = require("../middlewares/customError");
const generateRandomCode = require("../middlewares/generateCode");
const sendEmail = require("../middlewares/sendEmail");
const { compare, hash } = require("bcrypt");
const generateToken = require("../middlewares/generateToken");
const path          = require("path");
const fs            = require("fs");
const CC            = require("currency-converter-lt");
const { Op }        = require("sequelize");
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
dotenv.config();

const signUp = async (req, res) => {
  const { phoneNumber, language , password , long , lat} = req.body;
  // await validateStudent.validate({ phoneNumber, location });
  /*
  const teacher = await Teacher.findOne({
    where: {
      phone : phoneNumber,
    },
  });

  const student = await Student.findOne({
    where: {
      phoneNumber : phoneNumber,
    },
  });

  const parent = await Parent.findOne({
    where: {
      phone : phoneNumber,
    },
  });

  if (teacher)
    throw serverErrs.BAD_REQUEST({
      //arabic    : "رقم الهاتف مستخدم من قبل",
      arabic      : "عفوا ، الحساب غير صالح لانشاء ، نرجو مراجعه بياناتك مره اخري لكي يتم انشاء حسابك بشكل ناجح",
      //english: "phone is already used",
      english: "Sorry, the account is not valid for creation. Please review your data again so that your account can be created successfully.",

      //arabic: "الهاتف مستخدم من قبل المدرب",
      //english: "Phone is already used",
    });
  if (student)
    throw serverErrs.BAD_REQUEST({
      //arabic    : "رقم الهاتف مستخدم من قبل",
      arabic      : "عفوا ، الحساب غير صالح لانشاء ، نرجو مراجعه بياناتك مره اخري لكي يتم انشاء حسابك بشكل ناجح",
      //english: "phone is already used",
      english: "Sorry, the account is not valid for creation. Please review your data again so that your account can be created successfully.",

      //arabic: "الهاتف مستخدم من قبل طالب",
      //english: "Phone is already used",
    });
  if (parent)
    throw serverErrs.BAD_REQUEST({
      //arabic    : "رقم الهاتف مستخدم من قبل",
      arabic      : "عفوا ، الحساب غير صالح لانشاء ، نرجو مراجعه بياناتك مره اخري لكي يتم انشاء حسابك بشكل ناجح",
      //english: "phone is already used",
      english: "Sorry, the account is not valid for creation. Please review your data again so that your account can be created successfully.",

      //arabic: "الهاتف مستخدم من قبل ولي الامر",
      //english: "Phone is already used",
    });
  */

  const guestNumber = await Guest.findOne({
    where: {
      phoneNumber : phoneNumber,
    },
  });
  if (guestNumber)
    throw serverErrs.BAD_REQUEST({
      arabic      : "عفوا ٫ الحساب غير صالح للاستخدام",
      english     : "Sorry, the account is not valid for use",
    });
  
  const hashedPassword  = await hash(password, 12);
  const code            = generateRandomCode();
  const existGuest      = await Guest.findOne({
    where: {
      phoneNumber : phoneNumber,
    },
  });
  if (existGuest) {
    console.log("Update Gest");
    await existGuest.update({ registerCode: code });
    res.send({
      data    : existGuest,
      status  : 201,
      msg     : { arabic: "تم انشاء الحساب بنجاح", english: "Account created successfully" },
    });
  }
  else {
    const newGuest = await Guest.create({
      name   : "",
      email  : "",
      phoneNumber,
      language,
      registerCode: code,
      password: hashedPassword,
      lat     : lat,
      long    : long,
    });
    await newGuest.save();
    res.send({
      data    : newGuest,
      status  : 201,
      msg     : { arabic: "تم انشاء الحساب بنجاح", english: "Account created successfully" },
    });
  }

};

//signupData

const signUpData = async (req, res) => {
  const { guestID, name , language , email } = req.body;

  const guest = await Guest.findOne({
    where: {
      email : email,
    },
  });

  /*
  const teacher = await Teacher.findOne({
    where: {
      email : email,
    },
  });

  const student = await Student.findOne({
    where: {
      email : email,
    },
  });

  const parent = await Parent.findOne({
    where: {
      email : email,
    },
  });

  if (teacher)
    throw serverErrs.BAD_REQUEST({
     //arabic: "الاميل مستخدم من قبل",
     arabic      : "عفوا ، الحساب غير صالح لانشاء ، نرجو مراجعه بياناتك مره اخري لكي يتم انشاء حسابك بشكل ناجح",
     //english: "email is already used",
     english: "Sorry, the account is not valid for creation. Please review your data again so that your account can be created successfully.",
     // arabic: "البريدالالكتروني مستخدم من قبل المدرب",
     // english: "Email is already used",
    });
  if (student)
    throw serverErrs.BAD_REQUEST({
      //arabic: "البريدالالكتروني مستخدم من قبل طالب",
      //english: "Email is already used",
      //arabic: "الاميل مستخدم من قبل",
      //english: "email is already used",
      arabic      : "عفوا ، الحساب غير صالح لانشاء ، نرجو مراجعه بياناتك مره اخري لكي يتم انشاء حسابك بشكل ناجح",
      english: "Sorry, the account is not valid for creation. Please review your data again so that your account can be created successfully.",
    });
  if (parent)
    throw serverErrs.BAD_REQUEST({
      //arabic: "الاميل مستخدم من قبل",
      //english: "email is already used",
      //arabic: "البريدالالكتروني مستخدم من قبل ولي الامر",
      //english: "Email is already used",
      arabic      : "عفوا ، الحساب غير صالح لانشاء ، نرجو مراجعه بياناتك مره اخري لكي يتم انشاء حسابك بشكل ناجح",
      english: "Sorry, the account is not valid for creation. Please review your data again so that your account can be created successfully.",
    });
    */
    if (guest)
      throw serverErrs.BAD_REQUEST({
       arabic     : "عفوا ٫ البريد الالكتروني غير صالح للاستخدام",
       english    : "Sorry, the email address is not valid for use",
      });

  const code       = generateRandomCode();
  const existGuest = await Guest.findOne({
    where: { id: guestID },
  });
  if (existGuest) {
    console.log("Update Gest");
    await existGuest.update({ registerCode: code  , name : name ,  lang : language, email : email});
    res.send({
      data    : existGuest,
      status  : 201,
      msg     : { arabic: "تم انشاء الحساب بنجاح", english: "Account created successfully" },
    });
  }
  else {
    throw serverErrs.BAD_REQUEST({
      arabic: "عفوا الحساب غير موجود", 
      english: "Account not found",
    });
    
  }

};

const verifyCode = async (req, res) => {
  const { registerCode, email, long, lat } = req.body;
  /*
  const teacher = await Teacher.findOne({
    where: {
      email,    isRegistered: true,
    },
  });

  if (teacher)
    throw serverErrs.BAD_REQUEST({
      //arabic  : "الايميل مستخدم من قبل",
      //english : "email is already used",
      arabic      : "عفوا ، الحساب غير صالح لانشاء ، نرجو مراجعه بياناتك مره اخري لكي يتم انشاء حسابك بشكل ناجح",
      english     : "Sorry, the account is not valid for creation. Please review your data again so that your account can be created successfully.",
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
      //arabic    : "الايميل مستخدم من قبل",
      //english   : "email is already used",
      arabic      : " عفوا “الحساب غير صالح للانشاء ، ارجوا مراجعه بيناتك مره اخري لكي يتم انشاء حسابك بشكل ناجح ",
      english   : "Sorry, the account is not valid for creation. Please review your data again so that your account can be created successfully.",
    });
  
  if (parent)
    throw serverErrs.BAD_REQUEST({
      //arabic: "الايميل مستخدم من قبل",
      //english : "email is already used",
      arabic      : "عفوا ، الحساب غير صالح لانشاء ، نرجو مراجعه بياناتك مره اخري لكي يتم انشاء حسابك بشكل ناجح",
      english: "Sorry, the account is not valid for creation. Please review your data again so that your account can be created successfully.",
    });
  */
  const guest = await Guest.findOne({
    where: {
      email,
      registerCode,
    },
  });
  if (!guest)
    throw serverErrs.BAD_REQUEST({
      arabic: "الكود خاطئ",
      english: "code is wrong",
    });

  await guest.update({ isRegistered: true, long, lat });
  res.send({
    status: 201,
    data: guest,
    msg: {
      arabic: "تم التحقق من الكود واضافة الموقع بنجاح",
      english: "Verified code and add address successfully",
    },
  });
};

const resetPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { GuestId } = req.params;
  let guest = await Guest.findOne({
    where: { id: GuestId },
    include: { all: true },
  });
  if (!guest)
    throw serverErrs.BAD_REQUEST({
      arabic: "المضيف غير موجود",
      english: "guest not found",
    });
  const result = await compare(oldPassword, guest?.password);
  if (!result)
    throw serverErrs.BAD_REQUEST({
      arabic: "كلمة المرور خاطئة",
      english: "Old password is wrong",
    });
  const hashedPassword = await hash(newPassword, 12);
  await guest.update({ password: hashedPassword });
  guest = {
    id: guest.id,                     email: guest.email,
    name: guest.name,                 gender: guest.gender,
    image: guest.image,               city: guest.city,
    dateOfBirth: guest.dateOfBirth,   nationality: guest.nationality,
    //location: guest.location,
    phoneNumber: guest.phoneNumber,   isRegistered: guest.isRegistered,
    createdAt: guest.createdAt,       updatedAt: guest.updatedAt,
  };
  res.send({
    status: 201,
    data: guest,
    msg: {
      arabic: "تم تغيير كلمة المرور بنجاح",
      english: "successful update student password",
    },
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

const guestLogin = async (req, res) => {

  const { phoneNumber, password } = req.body;
  const guest = await Guest.findOne({ where: { phoneNumber : phoneNumber } });
  if (!guest) {
    throw serverErrs.BAD_REQUEST({
      arabic: "غير موجود الهاتف مستخدم من قبل ",
      english: "Phone is not found",
    });  
  }

  const result = await compare(
    password,
    guest?.password 
  );
  if (!result) throw serverErrs.BAD_REQUEST("Wrong Email Or Password");

  const role = "guest";
  const data = guest;
  const token = await generateToken({ userId: data.id, name: data.name, role });
  res.send({
    status: 201,
    data: data,
    msg: "successful log in",
    token: token,
    role: role,
  });

}

const getSingleGuest = async (req, res) => {
  const { guestId } = req.params;
  const guest = await Guest.findOne({
    where: { id: guestId },
    attributes: { exclude: ["password"] },
  });
  res.send({
    status: 201,
    data: guest,
    msg: {
      arabic: "تم ارجاع المضيف",
      english: "successful get single guest",
    },
  });
};

const editProfile = async (req, res) => {
  const { GuestId } = req.params;
  const guest = await Guest.findOne({
    where: { id: GuestId },
    attributes: { exclude: ["password"] },
  });
  if (!guest)
    throw serverErrs.BAD_REQUEST({
      arabic: "المضيف غير موجود",
      english: "Guest not found",
    });

  const {
    name, gender,       dateOfBirth,  phoneNumber,
    city, nationality,  location,
  } = req.body;


  await guest.update({
    name, gender, dateOfBirth, phoneNumber,  city, nationality,  location,
  });

  res.send({
    status: 201,
    msg: {
      arabic: "تم تعديل بيانات المضيف بنجاح",
      english: "successful edit personal information data",
    },
  });
};

const editPhoto = async (req, res) => {
  const { GuestId } = req.params;
  const guest = await Guest.findOne({
    where: { id: GuestId },
    attributes: { exclude: ["password"] },
  });
  if (!guest)
    throw serverErrs.BAD_REQUEST({
      arabic: "المضيف غير موجود",
      english: "Guest not found",
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
  if (!req.files) {
    throw serverErrs.BAD_REQUEST({
      arabic: "الصورة غير موجودة",
      english: "Image not found",
    });
  }

  if (guest.image) {
    clearImage(guest.image);
  }
  await guest.update({ image: req.files[0].filename });
  res.send({
    status: 201,
    guest,
    msg: {
      arabic: "تم تعديل الصورة بنجاح",
      english: "successful edit guest image",
    },
  });
};

const getCareerByGuest = async (req, res) => {
  const { GuestId } = req.params;
  const arrCareer  = await Career.findAll({
    where  : { GuestId : GuestId},
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
  const { titleAR, titleEN, country , descriptionAr , descriptionEn , advertiserName , advertiserPhone , CareerDepartmentId , GuestId } = req.body;
  const image = req.files[0].filename;
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
      GuestId         : GuestId,
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
      arabic: "الوظيفه غير موجوده سابقا",
      english: "Career is already not found",
    });

  await objCareer.update({
    titleAR         : titleAR,
    titleEN         : titleEN,
    country         : country,
    descriptionAr   : descriptionAr,
    descriptionEn   : descriptionEn,
    advertiserName  : advertiserName, 
    advertiserPhone : advertiserPhone,
    CareerDepartmentId : CareerDepartmentId,
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

  if (req.files && objCareer.image) {
    clearImage(objCareer.image);
  }
  if (req.files) {
    await objCareer.update({ image: req.files[0].filename });
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

const createCareerStepOne = async (req, res) => {
  const { CareerDepartmentId } = req.body;
  const { GuestId } = req.params;
  const objDepartment = await CareerDepartment.findOne({
    where: {
      id : CareerDepartmentId[0].CareerDepartmentId,
    },
  });
  if (!objDepartment)
    throw serverErrs.BAD_REQUEST({
      arabic: "قسم الوظيفه موجوده سابقا",
      english: "Career Department is already found",
    });

  const newCareer = await Career.create(
    {
      CareerDepartmentId  : CareerDepartmentId[0].CareerDepartmentId,
      GuestId             : GuestId,
      titleAR	            : "",
      titleEN             : "",
      descriptionAR       : "",
      descriptionEN       : "",
      country             : "",
      image               : "",
      advertiserName      : "",
      advertiserPhone     : "",
      status              : "1"
    }
  );
  await newCareer.save();
  res.send({
    status: 201,
    data: newCareer,
    msg: {
      arabic  : "تم إنشاء الخطوه الاولي بنجاح جديده بنجاح",
      english : "successful create new step one in career",
    },
  });
};

const createCareerStepTwo = async (req, res) => {
  console.log("Career 0");
  const { titleAR, titleEN , descriptionAR , descriptionEN } = req.body;
  const { CareerId } = req.params;

  console.log(req.body);
  console.log(req.params);

  const objCareer = await Career.findOne({
    where   : { id: CareerId },
  });
  if (!objCareer)
    throw serverErrs.BAD_REQUEST({
      arabic: "الوظيفه غير موجوده سابقا",
      english: "Career is already not found",
    });

  await objCareer.update(
    {
      titleAR         : titleAR,
      titleEN         : titleEN,
      descriptionAr   : descriptionAR,
      descriptionEn   : descriptionEN,
    }
  );
  
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

  if (req.files && objCareer.image) {
    clearImage(objCareer.image);
  }
  if (req.files) {
    await objCareer.update({ image: req.files[0].filename });
  }

  res.send({
    status: 201,
    data: objCareer,
    msg: {
      arabic  : "تم إنشاء الخطوه الثانيه بنجاح جديده بنجاح",
      english : "successful create new step two in career",
    },
  });
};

const createAdsStepOne = async (req, res) => {
  const { AdsDepartmentId , advertiserPhone } = req.body;
  const { GuestId } = req.params;
  const objAds = await AdsDepartment.findOne({
    where: {
      id : AdsDepartmentId[0].AdsDepartmentId,
    },
  });
  if (!objAds)
    throw serverErrs.BAD_REQUEST({
      arabic: "قسم الاعلان موجوده سابقا",
      english: "Ads Department is already found",
    });

  const newAds = await Ads.create(
    {
      AdsDepartmentId : AdsDepartmentId[0].AdsDepartmentId,
      GuestId         : GuestId,
      titleAR	        : "",
      titleEN         : "",
      descriptionAR   : "",
      descriptionEN   : "",
      link            : "",
      image           : "",
      advertiserPhone     : advertiserPhone,
      advertiserAddress   : "",
      GuestId             : GuestId,
      status              : "1"
    }
  );
  await newAds.save();
  res.send({
    status: 201,
    data: newAds,
    msg: {
      arabic  : "تم إنشاء الخطوه الاولي بنجاح جديده بنجاح",
      english : "successful create new step one in ads",
    },
  });
};

const createAdsStepTwo = async (req, res) => {
  const { AdsId } = req.params;
  const guest = await Ads.findOne({
    where: { id: AdsId },
  });
  if (!guest)
    throw serverErrs.BAD_REQUEST({
      arabic: "الاعلان غير موجود",
      english: "Ads not found",
    });
 
  const image = req.files[0].filename;
  console.log("Image Path :- ");
  console.log(image);

  const newAdsImages = await AdsImages.create({
    AdId : AdsId,
    image : image,
  });
  await newAdsImages.save();

  res.send({
    status: 201,
    newAdsImages,
    msg: {
      arabic: "تم رفع الصورة بنجاح",
      english: "successful upload image",
    },
  });
}

const createAdsStepThree = async (req, res) => {
  const { titleAR, titleEN , descriptionAR , descriptionEN , link} = req.body;
  const { AdsId } = req.params;

  const objAds = await Ads.findOne({
    where   : { id: AdsId },
  });
  if (!objAds)
    throw serverErrs.BAD_REQUEST({
      arabic: "الاعلان غير موجوده سابقا",
      english: "Ads is already not found",
    });

  await objAds.update({
    titleAR         : titleAR,
    titleEN         : titleEN,
    descriptionAR   : descriptionAR,
    descriptionEN   : descriptionEN,
    link            : link,
  });
  
  res.send({
    status: 201,
    data: objAds,
    msg: { 
      arabic: "تم تعديل بيانات الاعلان بنجاح", 
      english: "successful Update ADS" 
    },
  });
};


const createAdsStepFour = async (req, res) => {
  const { carModel, yearManufacture , carPrice , currency } = req.body;
  const { AdsId } = req.params;

  const objAds = await Ads.findOne({
    where   : { id: AdsId },
  });
  if (!objAds)
    throw serverErrs.BAD_REQUEST({
      arabic: "الاعلان غير موجوده سابقا",
      english: "Ads is already not found",
    });

  await objAds.update({
    carModel          : carModel,
    yearManufacture   : yearManufacture,
    carPrice          : carPrice,
    currency          : currency,
  });
  
  res.send({
    status: 201,
    data: objAds,
    msg: { 
      arabic: "تم تعديل بيانات الاعلان بنجاح", 
      english: "successful Update ADS" 
    },
  });
};
const getAdsSingle = async (req, res) => {
  const { AdsId } = req.params;
  const objAds = await Ads.findOne({
    where      :   { id: AdsId },
    include: [{ model: AdsDepartment }],
  });
  if (!objAds)
    throw serverErrs.BAD_REQUEST({
      arabic: "الاعلان غير موجودة",
      english: "Invalid Ads! ",
    });

  res.send({
    status: 201,
    data  : objAds,
    msg: {
      arabic: "تم ارجاع بيانات الاعلان بنجاح",
      english: "successful get ads",
    },
  });
};

const getAdsAll = async (req, res) => {
  const { GuestId } = req.params;
  const guest = await Guest.findOne({
    where       : { id: GuestId },
  });
  if (!guest)
    throw serverErrs.BAD_REQUEST({
      arabic: "المضيف غير موجودة",
      english: "Invalid Guest! ",
    });
  
  const listAds = await Ads.findAll({
    where       : { GuestId: GuestId },
    include     : [
      { model: AdsDepartment }
    ],
  });

  var newArr = [];
  for( var i=0; i < listAds.length ; i++){
    const arrImages = await AdsImages.findAll({
      where       : { AdId: GuestId },
    });
    var createobj = {
      id        : listAds[i].id,
      images    : arrImages,
      createdAt : listAds[i].createdAt,
      updatedAt : listAds[i].updatedAt,
      titleAR   : listAds[i].titleAR,
      titleEN   : listAds[i].titleEN,
      descriptionAR : listAds[i].descriptionAR,
      descriptionEN : listAds[i].descriptionEN,
      link      : listAds[i].link,
      advertiserPhone    : listAds[i].advertiserPhone,
      advertiserAddress    : listAds[i].advertiserAddress,
      status    : listAds[i].status,
      GuestId   : listAds[i].GuestId,
      AdsDepartmentId    : listAds[i].AdsDepartmentId,
    }
    newArr[i] = createobj;
  }
  
  res.send({
    status: 201,
    data  : newArr,
    msg: {
      arabic: "تم ارجاع بيانات الاعلان بنجاح",
      english: "successful get all ads",
    },
  });
};

const getAdsImagesByAdsId = async (req, res) => {
  const { AdsId } = req.params;
  const ads = await Ads.findOne({
    where       : { id: AdsId },
  });
  if (!ads)
    throw serverErrs.BAD_REQUEST({
      arabic: "الاعلان غير موجودة",
      english: "Invalid ADS! ",
    });
  
  const listAdsImages = await AdsImages.findAll({
    where : { AdId: AdsId },
  });

  res.send({
    status: 201,
    data  : listAdsImages,
    msg: {
      arabic: "تم ارجاع بيانات صور الاعلان بنجاح",
      english: "successful get all images ads",
    },
  });
};

const deleteAds = async (req, res) => {
  const { AdsId } = req.params;
  const objAds = await Ads.findOne({ where: { id: AdsId } });
  if (!objAds)   
    throw serverErrs.BAD_REQUEST({
      arabic: "اعلان غير موجوده سابقا",
      english: "ADS is already not found",
    });

  await objAds.destroy({
    where: {
      id: AdsId,
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
module.exports = {
  signUp,               verifyCode,    
  signData,             signUpData,         guestLogin,         getSingleGuest,
  editProfile,          editPhoto,          getCareerByGuest,
  createCareer,         deleteCareer,       updateCareer,
  resetPassword,
  createAdsStepOne,     createAdsStepTwo,     createAdsStepThree,
  getAdsSingle,         getAdsAll,            getAdsImagesByAdsId,
  deleteAds,
  createCareerStepOne,  createCareerStepTwo,  createAdsStepFour,
};
