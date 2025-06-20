const dotenv = require("dotenv");
dotenv.config();
const nodemailer = require("nodemailer");

async function sendEmails(emails, message, lang) {
  const transporter = nodemailer.createTransport({
    host: "premium174.web-hosting.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_EMAIL_PASSWORD,
    },
  });

  const batchSize = 20;
  const emailBatches = [];

  for (let i = 0; i < emails.length; i += batchSize) {
    emailBatches.push(emails.slice(i, i + batchSize));
  }

  console.log(`Total batches: ${emailBatches.length}`);

  for (const [index, batch] of emailBatches.entries()) {
    console.log(`Sending batch ${index + 1} with ${batch.length} emails...`);

    const results = await Promise.allSettled(
      batch.map((email) => {
        console.log(`Preparing email for: ${email}`);

        const mailOptions = {
          from: process.env.APP_EMAIL,
          to: email,
          subject: lang === "ar" ? "تنبية هام" : "Important Notice",
          html:
            lang === "ar"
              ? `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #ffffff;">
    <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
        <h1 style="margin: 0; font-size: 20px;">إشعار مهم من منصة مسقط لتعليم قيادة السيارات</h1>
    </div>
    <div style="padding: 20px; text-align: right; direction: rtl;">
        ${message}
    </div>
    <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
        <p style="margin: 5px 0;"><a href="mailto:info@muscatdrivingschool.com" style="color: #007bff; text-decoration: none;">info@muscatdrivingschool.com</a></p>
        <p style="margin: 5px 0; font-size: 14px;">© منصة مسقط لتعليم قيادة السيارات. جميع الحقوق محفوظة.</p>
    </div>
</div>`
              : `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #ffffff;">
    <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
        <h1 style="margin: 0; font-size: 20px;">Important Notice from Muscat Driving School Platform</h1>
    </div>
    <div style="padding: 20px; text-align: left;">
        ${message}
    </div>
    <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
        <p style="margin: 5px 0;">
            <a href="mailto:info@muscatdrivingschool.com" style="color: #007bff; text-decoration: none;">info@muscatdrivingschool.com</a>
        </p>
        <p style="margin: 5px 0; font-size: 14px;">© Muscat Driving School Platform. All rights reserved.</p>
    </div>
</div>
`,
        };

        return transporter.sendMail(mailOptions)
          .then(() => {
            console.log(`Email sent successfully to: ${email}`);
          })
          .catch((error) => {
            console.error(`Failed to send email to: ${email}`, error);
          });
      })
    );

    console.log(`Batch ${index + 1} results:`, results);
  }

  console.log("All emails have been processed.");
}

module.exports = { sendEmails };
