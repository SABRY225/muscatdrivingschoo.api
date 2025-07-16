const { Parent, Teacher, Student, ParentStudent } = require("../models");
const { validateParentSignUp } = require("../validation");
const { serverErrs } = require("../middlewares/customError");
const { compare, hash } = require("bcrypt");
const generateToken = require("../middlewares/generateToken");
const { Op } = require("sequelize");
const path = require("path");
const fs   = require("fs");

const signUp = async (req, res) => {
  const { name, email, password } = req.body;
  await validateParentSignUp.validate({ name, email, password });
  const parent = await Parent.findOne({
    where: {
      email,
    },
  });

  const teacher = await Teacher.findOne({
    where: {
      email,
      isRegistered: true,
    },
  });

  const student = await Student.findOne({
    where: {
      email,
    },
  });
  if (parent)
    throw serverErrs.BAD_REQUEST({
      //arabic: "الإيميل مستخدم مسبقا",
      //english: "email is already used",
      arabic      : "عفوا ، الحساب غير صالح ، نرجو مراجعه بياناتك مره اخري لكي يتم انشاء حسابك بشكل ناجح",
      english     : "Sorry, the account is not valid. Please review your data again so that your account can be created successfully.",
    });
  if (teacher)
    throw serverErrs.BAD_REQUEST({
      //arabic: "الإيميل مستخدم مسبقا",
      //english: "email is already used",
      arabic      : "عفوا ، الحساب غير صالح ، نرجو مراجعه بياناتك مره اخري لكي يتم انشاء حسابك بشكل ناجح",
      english     : "Sorry, the account is not valid. Please review your data again so that your account can be created successfully.",
    });
  if (student)
    throw serverErrs.BAD_REQUEST({
      //arabic: "الإيميل مستخدم مسبقا",
      //english: "email is already used",
      arabic      : "عفوا ، الحساب غير صالح ، نرجو مراجعه بياناتك مره اخري لكي يتم انشاء حسابك بشكل ناجح",
      english     : "Sorry, the account is not valid. Please review your data again so that your account can be created successfully.",
    });

  const hashedPassword = await hash(password, 12);

  const newParent = await Parent.create(
    {
      name,
      email,
      password: hashedPassword,
    },
    {
      returning: true,
    }
  );
  await newParent.save();
  const { id } = newParent;
  const token = await generateToken({ userId: id, name, role: "parent" });

  // res.cookie("token", token);

  res.send({
    status: 201,
    data: newParent,
    msg: { arabic: "تم التسجيل بنجاح", english: "successful sign up" },
    token: token,
  });
};

const getSingleParent = async (req, res) => {
  const { ParentId } = req.params;
  const parent = await Parent.findOne({
    where: { id: ParentId },
    //include: { all: true },
  });
  res.send({
    status: 201,
    data: parent,
    msg: {
      arabic: "تم ارجاع الأب بنجاح",
      english: "successful get single parent",
    },
  });
};

const addStudentToParent = async (req, res) => {
  const { ParentId, StudentId } = req.body;
  const parent = await Parent.findOne({
    where: { id: ParentId },
  });
  const student = await Student.findOne({
    where: { id: StudentId },
  });

  if (!parent)
    throw serverErrs.BAD_REQUEST({
      arabic: "الأب غير موجود",
      english: "parent not exist",
    });
  if (!student)
    throw serverErrs.BAD_REQUEST({
      arabic: "الطالب غير موجود",
      english: "student not exist",
    });
  if (student.ParentId)
    throw serverErrs.BAD_REQUEST({
      arabic: "يوجد أب للابن",
      english: "student already have a parent",
    });

  const oldParentStudent = await ParentStudent.findOne({
    where: { ParentId, StudentId, status: { [Op.ne]: -1 } },
  });

  if (oldParentStudent)
    throw serverErrs.BAD_REQUEST({
      arabic: "طلب الابن موجود مسبقا",
      english: "student request is already exist",
    });

  const newParentStudent = await ParentStudent.create({
    ParentId,
    StudentId,
  });
  await newParentStudent.save();

  res.send({
    status: 201,
    data: newParentStudent,
    msg: {
      arabic: "تم اضافة طلب الطالب الى قائمة الانتظار",
      english: "successful added student to parent waiting list",
    },
  });
};
//Devloper By eng.reem.shwky@gamil.com

const editPersonalInformation = async (req, res) => {
  const { ParentId } = req.params;
  const parent = await Parent.findOne({
    where: { id: ParentId },
    attributes: { exclude: ["password"] },
  });
  if (!parent)
    throw serverErrs.BAD_REQUEST({
      arabic: "ولي الامر غير موجود",
      english: "Student not found",
    });

  const {
    name,
    phone,
  } = req.body;

  await parent.update({
    name,
    phone,
  });

  res.send({
    status: 201,
    msg: {
      arabic: "تم تعديل بيانات ولي الامر بنجاح",
      english: "successful edit personal information data",
    },
  });
};

const getStudentsByParentId = async (req, res) => {
  const { ParentId } = req.params;
  const obj_parent = await Parent.findOne({
    where: {
      id: ParentId,
    },
  });

  

  if (!obj_parent)
    throw serverErrs.BAD_REQUEST({
      arabic: "الاب غير موجودة",
      english: "Parent not found",
    });

    const dataStudent = await ParentStudent.findAll({
      where: {
        ParentId: ParentId,
        status:1,
      },
      include: {
        model: Student,
      },
    });

    res.send({
      status: 201,
      data: dataStudent,
      msg: {
        arabic: "ارجاع جميع الأبناء للأب",
        english: "successful get all Students for single Parent",
      },
    });

};

const settingNotification = async (req, res) => {
  const { PatentId } = req.params;
  const obj_parent = await Parent.findOne({
    where: { id: PatentId },
    attributes: { exclude: ["password"] },
  });
  if (!obj_parent)
    throw serverErrs.BAD_REQUEST({
      arabic: "ولي الامر غير موجود",
      english: "Invalid parentId! ",
    });

  if (obj_parent.id != req.user.userId)
    throw serverErrs.BAD_REQUEST({
      arabic: "لا يوجد حق بالوصول",
      english: "No Auth ",
    });

  const { isnotify } = req.body;

  await obj_parent.update({
    isnotify,
  });

  await obj_parent.save();

  res.send({
    status: 201,
    data: { obj_parent },
    msg : {
      arabic: "تم تعديل معلومات بنجاح",
      english: "successful edit Information! ",
    },
  });
};

const editImageParent = async (req, res) => {
  console.log(req.params);
  const { ParentId } = req.params;
  const obj_parent = await Parent.findOne({
    where: { id: ParentId },
    attributes: { exclude: ["password"] },
  });
  if (!obj_parent)
    throw serverErrs.BAD_REQUEST({
      arabic: "ولي الامر غير موجود",
      english: "Parent not found",
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

  if (obj_parent.image) {
    clearImage(obj_parent.image);
  }
  await obj_parent.update({ image: req.files[0].filename });
  res.send({
    status: 201,
    obj_parent,
    msg: {
      arabic: "تم تعديل الصورة بنجاح",
      english: "successful edit parent image",
    },
  });
};

const resetPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { ParentId } = req.params;
  let obj_parent = await Parent.findOne({
    where: { id: ParentId },
    include: { all: true },
  });
  if (!obj_parent)
    throw serverErrs.BAD_REQUEST({
      arabic: "ولي الامر غير موجود",
      english: "Parent not found",
    });
  const result = await compare(oldPassword, obj_parent?.password);
  if (!result)
    throw serverErrs.BAD_REQUEST({
      arabic: "كلمة المرور خاطئة",
      english: "Old password is wrong",
    });
  const hashedPassword = await hash(newPassword, 12);
  console.log(hashedPassword );
  await obj_parent.update({ password: hashedPassword });
  obj_parent = {
    id: obj_parent.id,
    email: obj_parent.email,
    name: obj_parent.name,
    image: obj_parent.image,
    createdAt: obj_parent.createdAt,
    updatedAt: obj_parent.updatedAt,
  };
  res.send({
    status: 201,
    data: obj_parent,
    msg: {
      arabic: "تم تغيير كلمة المرور بنجاح",
      english: "successful update student password",
    },
  });
};

const updateLogout = async (req, res) => {
  console.log("Logout Parent");

  const { parentId } = req.params;
  const parent = await Parent.findOne({
    where: { id: parentId },
    attributes: { exclude: ["password"] },
  });

  await parent.update({
    isOnline : false,
  });

  await parent.save();

  res.send({
    status: 201,
    data: { parent },
    msg : {
      arabic: "تم تعديل معلومات بنجاح",
      english: "successful edit Information! ",
    },
  });
};

module.exports = {
  signUp,
  getSingleParent,
  addStudentToParent,
  // This Developer by eng.reem.shwky@gamil.com
  getStudentsByParentId,
  editPersonalInformation,
  settingNotification,
  editImageParent,
  resetPassword,
  updateLogout,
};
