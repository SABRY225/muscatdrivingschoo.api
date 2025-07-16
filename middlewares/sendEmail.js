const nodemailer = require("nodemailer");
const dotenv     = require("dotenv");
const sendSMS   = require("./sendSMS");

dotenv.config();
const sendEmail = (mailOptions, smsOptions) => {

  const transporter = nodemailer.createTransport({
    host: "premium174.web-hosting.com",//"premium174.web-hosting.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_EMAIL_PASSWORD,
    },
  });
  try {
    console.log(mailOptions);
    console.log("Send Mail First");
    
    transporter.sendMail(mailOptions, (error , info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(info);
        return "";
      }
      //console.log("Send Mail 3");
    });

    console.log("Send Mail 2");
  } catch (error) {
    console.log(error);
  } finally {
    if (smsOptions) {
    console.log("Start Send SMS");
      // try {
      //   sendSMS(smsOptions);
      // } catch (error) {
      //   console.log(error);
      // }
    }
  }
};

module.exports = sendEmail;
