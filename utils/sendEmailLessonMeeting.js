const dotenv = require("dotenv");
dotenv.config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "premium174.web-hosting.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_EMAIL_PASSWORD,
  },
});

const sendLessonEmail = async (email, lang, message, type = "start") => {
  try {
    const isArabic = lang === "ar";
    const subject = isArabic
      ? type === "start" ? "بدء الدرس" : "انتهاء الدرس"
      : type === "start" ? "Lesson Started" : "Lesson Ended";

    const heading = isArabic
      ? type === "start" ? "تم بدء الدرس بنجاح" : "تم انتهاء الدرس بنجاح"
      : type === "start" ? "Lesson has started successfully" : "Lesson has ended successfully";

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #333; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #ddd; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; padding: 15px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
            <h2 style="margin: 0; font-size: 22px;">${
              isArabic ? "منصة مسقط لتعليم قيادة السيارات" : "Muscat Driving School Platform"
            }</h2>
        </div>
        <div style="padding: 25px; text-align: ${isArabic ? "right" : "left"}; direction: ${isArabic ? "rtl" : "ltr"};">
            <h3 style="color: #007bff;">${heading}</h3>
            <p style="margin: 15px 0;">${message}</p>
            <p style="margin-top: 20px;">${
              isArabic
                ? "نشكركم على استخدام منصتنا ونتمنى لكم تجربة تعليمية ناجحة وآمنة."
                : "Thank you for using our platform. We hope you had a productive and safe learning experience."
            }</p>
        </div>
        <div style="margin-top: 30px; padding: 15px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
            <p style="margin: 5px 0;">
              <a href="mailto:info@muscatdrivingschool.com" style="color: #007bff; text-decoration: none;">info@muscatdrivingschool.com</a>
            </p>
            <p style="margin: 5px 0; font-size: 14px;">© ${
              isArabic
                ? "منصة مسقط لتعليم قيادة السيارات. جميع الحقوق محفوظة."
                : "Muscat Driving School Platform. All rights reserved."
            }</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.APP_EMAIL,
      to: email,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email (${type}) sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
  }
};


module.exports = {
  sendLessonEmail,
};
