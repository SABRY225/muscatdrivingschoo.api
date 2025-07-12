const jwt = require("jsonwebtoken");
const { Parent, Student, Teacher } = require("../models");
const { loginValidation } = require("../validation");
const { compare } = require("bcrypt");
const generateToken = require("./generateToken");
const { serverErrs } = require("./customError");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
const transporter = nodemailer.createTransport({
  host: "premium174.web-hosting.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_EMAIL_PASSWORD,
  },
});
const login = async (req, res) => {
  const { email, password, lang,long, lat } = req.body;

  await loginValidation.validate({ email, password });

  const parent = await Parent.findOne({ where: { email, isSuspended: false } });

  const student = await Student.findOne({
    where: { email, isRegistered: true, isSuspended: false },
  });

  const teacher = await Teacher.findOne({
    where: { email, isRegistered: true, isSuspended: false },
  });

  const found = parent || student || teacher;
  if (!found) throw serverErrs.BAD_REQUEST("Email not found");

  const result = await compare(
    password,
    parent?.password || student?.password || teacher?.password
  );
  if (!result) throw serverErrs.BAD_REQUEST("Wrong Email Or Password");

  const role = teacher ? "teacher" : student ? "student" : "parent";
  const data = teacher ? teacher : student ? student : parent;
  const isOnline = true;
  await data.update({ long, lat , isOnline});
  const token = await generateToken({ userId: data.id, name: data.name, role });

  let missingFields = [];

  if(role=="teacher"){
    const requiredFields = [
      "firstName", "lastName", "gender", "dateOfBirth", "phone", "email",
      "country", "city", "image", "favStdGender", "experienceYears",
      "descriptionAr"
    ];
    missingFields = requiredFields.filter((field) => !teacher[field]);
  }else if(role=="student"){
    const requiredFields = ["name", "gender", "image", "email", "dateOfBirth", "city", "phoneNumber"];
    missingFields = requiredFields.filter((field) => !student[field]);
  }
  if (missingFields.length > 0) {
    const mailOptions = {
  from: process.env.APP_EMAIL,
  to: email,
  subject: lang === "ar" ? "استكمال بيانات حسابك" : "Complete your account information",

  html: lang === "ar" ? `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
        <h1> استكمال بيانات حسابك</h1>
    </div>
    <div style="padding: 20px;" align="right">
        <div><b>${student?.name || teacher?.firstName + " " + teacher?.lastName}</b> مرحبا</div>
        <div>يرجى استكمال بيانات ملفك الشخصي لمنصة مسقط لتعليم قيادة السيارات</div>
        <div>شكراً لك</div>
    </div>
    <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
        <a href="mailto:info@muscatdrivingschool.com">info@muscatdrivingschool.com</a>.
        <p>منصة مسقط لتعليم قيادة السيارات ©. جميع الحقوق محفوظة.</p>
    </div>
  </div>` : `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
        <h1>Complete your account information</h1>
    </div>
    <div style="padding: 20px;" align="left">
        <div>Hello <b>${student?.name || teacher?.firstName + " " + teacher?.lastName}</b></div>
        <div>Please complete your profile information for the Muscat Driving School platform</div>
        <div>Thank you</div>
    </div>
    <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
        <a href="mailto:info@muscatdrivingschool.com">info@muscatdrivingschool.com</a>.
        <p>Muscat Driving School Platform ©. All rights reserved.</p>
    </div>
  </div>`,
};


    await transporter.sendMail(mailOptions);
  }
  res.send({
    status: 201,
    data: data,
    message: {arabic:"تم تسجيل الدخول بنجاح",english:"successful login"},
    token: token,
    role: role,
    missingFields
  });
};

module.exports = login;