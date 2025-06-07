const { hash } = require("bcrypt");
const { Teacher, Student } = require("../models");
const { serverErrs } = require("./customError");
const generateRandomCode = require("./generateCode");
const sendEmail = require("./sendEmail");
const generateToken = require("./generateToken");

const forgetPassword = async (req, res) => {
  const { email } = req.body;
  const student = await Student.findOne({
    where: {
      email,
      isRegistered: true,
    },
  });
  const teacher = await Teacher.findOne({
    where: {
      email,
      isRegistered: true,
    },
  });
  if (!student && !teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "الايميل غير موجود",
      english: "Email not found",
    });
  const code = generateRandomCode();
  teacher
    ? await teacher.update({ registerCode: code })
    : await student.update({ registerCode: code });
  const mailOptions = {
    from: process.env.APP_EMAIL, //"info@moalime.com",
    to: email,
    subject: "Muscat Driving School!: verification code",
    html: `<div style="text-align: right;"> مرحبًا ، <br> شكرًا جزيلاً لك على الوقت الذي استغرقته للانضمام إلينا .
      تم رصد محاولة لتغيير كلمة المرور <br>
      لإتمام العملية يرجى ادخال الرمز التالي <br>
      <b> ${code} </b>
      .حظًا سعيدًا <br>
      ,فريق مسقط لتعليم قيادة السيارات
      </div>`,
  };
  sendEmail(mailOptions);
  res.send({ status: 201, msg: "successful send email" });
};

const verifyCodeForgottenPassword = async (req, res) => {
  const { registerCode, email } = req.body;

  const student = await Student.findOne({
    where: {
      email,
      isRegistered: true,
      registerCode,
    },
  });

  const teacher = await Teacher.findOne({
    where: {
      email,
      isRegistered: true,
      registerCode,
    },
  });

  if (!student && !teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "الكود خاطئ",
      english: "code is wrong",
    });

  res.send({
    status: 201,
    msg: {
      arabic: "تم التحقق من الكود بنجاح",
      english: "Verified code successfully",
    },
  });
};

const editForgottenPassword = async (req, res) => {
  const { email, password } = req.body;

  const student = await Student.findOne({
    where: {
      email,
      isRegistered: true,
    },
  });
  const teacher = await Teacher.findOne({
    where: {
      email,
      isRegistered: true,
    },
  });

  if (!student && !teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "الايميل غير موجود",
      english: "email not found",
    });

  const hashedPassword = await hash(password, 12);
  let token, role, data;
  if (teacher) {
    await teacher.update({ password: hashedPassword });
    token = await generateToken({
      userId: teacher.id,
      name: teacher.name,
      role: "teacher",
    });
    role = "teacher";
    data = teacher;
  } else {
    await student.update({ password: hashedPassword });
    token = await generateToken({
      userId: student.id,
      name: student.name,
      role: "student",
    });
    role = "student";
    data = student;
  }

  const mailOptions = {
    from: process.env.APP_EMAIL,//"info@moalime.com",
    to: email,
    subject: "Muscat Driving School!: password successfully changed",
    html: `<div style="text-align: right;"> مرحبًا ، <br> شكرًا جزيلاً لك على تخصيص بعض الوقت للانضمام إلينا .
      يسعدنا إخبارك أنه تم تغيير كلمة المرور بنجاح. <br>
      .نتطلع إلى تزويدك بتجربة استثنائية <br>
      ,حظًا سعيدًا <br>
      فريق مسقط لتعليم قيادة السيارات
      </div>`,
  };
  sendEmail(mailOptions);
  res.send({
    status: 201,
    msg: {
      arabic: "تم تغيير كلمة المرور بنجاح",
      english: "successful edit password",
    },
    token: token,
    role: role,
    data: data,
  });
};

module.exports = {
  forgetPassword,
  verifyCodeForgottenPassword,
  editForgottenPassword,
};
