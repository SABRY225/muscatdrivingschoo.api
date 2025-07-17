const dotenv = require("dotenv");
dotenv.config();

const generateConfirmEmailBody = (code, language, email) => {
  return language === "en"
    ? {
        from: process.env.APP_EMAIL,
        to: email,
        subject: "Welcome to Muscat Driving School! Confirm Your Email",
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
  <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
      <h1>Welcome to Muscat Driving School!</h1>
  </div>
  <div style="padding: 20px;">
      <p>Welcome to Muscat Driving School! We are excited to have you join our community. At Muscat Driving School, we strive to provide the best experience for our users, and we’re thrilled to have you on board.</p>
      <p>To complete your registration, please confirm your email address by using the code below:</p>
      <div style="text-align: center; font-size: 1.2em; margin: 20px 0; padding: 10px; background-color: #f4f4f4; border: 1px solid #ddd; border-radius: 10px;">
          <strong>Your Confirmation Code: ${code} </strong>
      </div>
      <p>To confirm your email, simply enter this code in the confirmation section on our website.</p>
      <p>If you did not sign up for an account, please ignore this email.</p>
      <p>Should you have any questions or need further assistance, feel free to reach out to our support team at <a href="mailto:info@muscatdrivingschool.com">info@muscatdrivingschool.com</a>.</p>
      <p>Thank you for choosing Muscat Driving School. We look forward to serving you!</p>
  </div>
  <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
      <p>Best regards,</p>
      Muscat Driving School<br>
      <a href="muscatdrivingschool.com">muscatdrivingschool.com</a><br>
      <p>Muscat Driving School ©. All rights reserved.</p>
      <p>By sending this email, you acknowledge and agree to our <a href="muscatdrivingschool.com/TermsAndConditions">Terms of Service</a> and <a href="muscatdrivingschool.com/PrivacyPolicy">Privacy Policy</a>.</p>
  </div>
</div>`,
      }
    : {
        from: process.env.APP_EMAIL,
        to: email,
        subject:
         "Welcome to Muscat Driving School! Confirm Your Email",
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; direction: rtl;">
  <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
      <h1>مرحباً بك في مسقط لتعليم قيادة السيارات!</h1>
  </div>
  <div style="padding: 20px;">
      <p>مرحباً بك في مسقط لتعليم قيادة السيارات! نحن متحمسون لانضمامك إلى مجتمعنا. في مسقط لتعليم قيادة السيارات، نسعى جاهدين لتقديم أفضل تجربة لمستخدمينا، ونحن مسرورون لانضمامك إلينا.</p>
      <p>لإكمال تسجيلك، يرجى تأكيد عنوان بريدك الإلكتروني باستخدام الرمز أدناه:</p>
      <div style="text-align: center; font-size: 1.2em; margin: 20px 0; padding: 10px; background-color: #f4f4f4; border: 1px solid #ddd; border-radius: 10px;">
          <strong>رمز التأكيد الخاص بك: ${code}</strong>
      </div>
      <p>لتأكيد بريدك الإلكتروني، قم بإدخال هذا الرمز في قسم التأكيد على موقعنا.</p>
      <p>إذا لم تقم بالتسجيل للحصول على حساب، يرجى تجاهل هذا البريد الإلكتروني.</p>
      <p>إذا كان لديك أي أسئلة أو تحتاج إلى مساعدة إضافية، لا تتردد في التواصل مع فريق الدعم لدينا على <a href="mailto:info@muscatdrivingschool.com">info@muscatdrivingschool.com</a>.</p>
      <p>شكراً لاختيارك مسقط لتعليم قيادة السيارات. نتطلع لخدمتك!</p>
  </div>
  <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
      <p>أطيب التحيات،</p>
      مسقط لتعليم قيادة السيارات<br>
      <a href="muscatdrivingschool.com">muscatdrivingschool.com</a><br></p>
      <p>مسقط لتعليم قيادة السيارات © . جميع الحقوق محفوظة.</p>
      <p>بإرسال هذا البريد الإلكتروني، فإنك تقر وتوافق على <a href="muscatdrivingschool.com/TermsAndConditions">شروط الخدمة</a> و <a href="muscatdrivingschool.com/PrivacyPolicy">سياسة الخصوصية</a> الخاصة بنا.</p>
  </div>
</div>`,
      };
};
const generateWelcomeEmailBody = (language, name, email) => {
  return {
    from: process.env.APP_EMAIL,
    to: email,
    subject:
      language === "en"
        ? "Welcome to Muscat Driving School! Account successfully created "
        : "مرحباً بك في مسقط لتعليم قيادة السيارات! تم تسجيل حسابك بنجاح",
    html:
      language === "en"
        ? `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
        <h1>Welcome to Muscat Driving School!</h1>
    </div>
    <div style="padding: 20px;">
        <p>Dear ${name} ,</p>
        <p>We are thrilled to welcome you to Muscat Driving School! Thank you for subscribing. You are now part of a community that values excellence and strives to provide the best services and products to our clients.</p>
        <p>Your subscription unlocks a host of benefits and exclusive content tailored just for you. We are committed to ensuring that your experience with us is nothing short of exceptional.</p>
        <p>If you have any questions or need assistance, our support team is here to help. Feel free to reach out to us at <a href="mailto:info@muscatdrivingschool.com">info@muscatdrivingschool.com</a> or visit our <a href="muscatdrivingschool.com">website</a> for more information.</p>
        <p>We look forward to serving you and hope you enjoy all that Muscat Driving School has to offer.</p>
        <p>Best regards,</p>
        <p>Muscat Driving School<br>
        <a href="muscatdrivingschool.com">muscatdrivingschool.com</a><br>
    </div>
    <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
        <p>Muscat Driving School ©. All rights reserved.</p>
    </div>
</div>
        `
        : `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; direction: rtl;">
        <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
            <h1>مرحباً بك في مسقط لتعليم قيادة السيارات!</h1>
        </div>
        <div style="padding: 20px;">
            <p>عزيزي/عزيزتي ${name}،</p>
            <p>نحن مسرورون لانضمامك إلى مسقط لتعليم قيادة السيارات! شكراً لك على الاشتراك. أنت الآن جزء من مجتمع يقدر التميز ويسعى لتقديم أفضل الخدمات والمنتجات لعملائنا.</p>
            <p>اشتراكك يفتح لك العديد من الفوائد والمحتوى الحصري المصمم خصيصاً لك. نحن ملتزمون بضمان أن تكون تجربتك معنا مميزة للغاية.</p>
            <p>إذا كان لديك أي أسئلة أو تحتاج إلى مساعدة، فإن فريق الدعم لدينا هنا للمساعدة. لا تتردد في التواصل معنا عبر البريد الإلكتروني <a href="mailto:info@muscatdrivingschool.com">info@muscatdrivingschool.com</a> أو زيارة <a href="muscatdrivingschool.com">موقعنا</a> لمزيد من المعلومات.</p>
            <p>نتطلع لخدمتك ونتمنى أن تستمتع بكل ما تقدمه مسقط لتعليم قيادة السيارات.</p>
            <p>أطيب التحيات،</p>
            مسقط لتعليم قيادة السيارات<br>
            <a href="muscatdrivingschool.com">muscatdrivingschool.com</a><br>
        </div>
        <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
            <p>ملاحظة: تم إرسال هذا البريد الإلكتروني من حساب غير مراقب. يرجى عدم الرد مباشرة على هذا البريد الإلكتروني. لأي استفسارات، تواصل مع فريق الدعم لدينا على <a href="mailto:info@muscatdrivingschool.com">info@muscatdrivingschool.com</a>.</p>
            <p>مسقط لتعليم قيادة السيارات ©. جميع الحقوق محفوظة.</p>
        </div>
    </div>
    `,
  };
};
const generateChargeConfirmationEmail = (
  language,
  email,
  name,
  price,
  currency
) => {
  return language === "en"
    ? {
        from: process.env.APP_EMAIL,
        to: email,
        subject: "Payment Confirmation from Muscat Driving School",
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
        <h1>Payment Confirmation</h1>
    </div>
    <div style="padding: 20px;">
        <p>Dear ${name},</p>
        <p>We are pleased to inform you that your payment of ${price} ${currency} has been successfully processed. Thank you for your prompt payment and for choosing Muscat Driving School.</p>
        <p>If you have any questions or need further assistance, please feel free to reach out to our support team at <a href="mailto:info@muscatdrivingschool.com">info@muscatdrivingschool.com</a>.</p>
        <p>Thank you once again for your business!</p>
        <p>Best regards,</p>
        Muscat Driving School<br>
        <a href="muscatdrivingschool.com">muscatdrivingschool.com</a><br>
    </div>
    <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
        <p>Muscat Driving School ©. All rights reserved.</p>
    </div>
</div>
`,
      }
    : {
        from: process.env.APP_EMAIL,
        to: email,
        subject: " تأكيد الدفع من مسقط لتعليم قيادة السيارات",
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; direction: rtl;">
        <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
            <h1>تأكيد الدفع</h1>
        </div>
        <div style="padding: 20px;">
            <p>عزيزي/عزيزتي ${name}،</p>
            <p>يسعدنا إبلاغك بأن دفعتك بمقدار ${price} ${currency} قد تمت بنجاح. شكراً لك على دفعك الفوري واختيارك لـمسقط لتعليم قيادة السيارات.</p>
            <p>إذا كان لديك أي أسئلة أو تحتاج إلى مساعدة إضافية، لا تتردد في التواصل مع فريق الدعم لدينا على <a href="mailto:info@muscatdrivingschool.com">info@muscatdrivingschool.com</a>.</p>
            <p>شكراً مرة أخرى لتعاملك معنا!</p>
            <p>أطيب التحيات،</p>
            مسقط لتعليم قيادة السيارات<br>
            <a href="muscatdrivingschool.com">muscatdrivingschool.com</a><br>
        </div>
        <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
            <p>مسقط لتعليم قيادة السيارات ©. جميع الحقوق محفوظة.</p>
        </div>
    </div>
     `,
      };
};
const generateSessionConfirmationEmail = (
  language, email,  studentName,  teacherName,  date, type, duration
) => {
  return language === "en"
    ? {
        from: process.env.APP_EMAIL,
        to: email,
        subject: `MDS: Your Training Session Confirmation with ${teacherName}`,
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
            <h1>Training Session Confirmation</h1>
        </div>
        <div style="padding: 20px;">
            <p>Dear ${studentName},</p>
            <p>We are pleased to inform you that your training session with ${teacherName} has been confirmed. Below are the details of your upcoming session:</p>
            <ul style="line-height: 1.6;">
                <li><strong>Date:</strong> ${date.slice(
                  0,
                  date.indexOf("*")
                )}</li>
                <li><strong>Time:</strong> ${date.slice(
                  date.indexOf("*") + 1
                )}</li>
                <li><strong>Location:</strong>${type}</li>
                <li><strong>Duration:</strong>${duration} ${
          duration > 1 ? "hours" : "hour"
        }</li>
            </ul>
            <p>This is a fantastic opportunity to learn and grow, and we encourage you to make the most of it. Our trainers are dedicated to providing you with valuable knowledge and skills that will benefit you greatly. We are confident that you will find this session both informative and inspiring.</p>
            <p>We are committed to your success and are delighted to have you as a client. Your growth and satisfaction are our top priorities, and we are here to support you every step of the way.</p>
            <p>Please make sure to arrive a few minutes early and bring any necessary materials. If you have any questions or need to reschedule, feel free to contact us at <a href="mailto:info@muscatdrivingschool.com">info@muscatdrivingschool.com</a>.</p>
            <p>We look forward to seeing you at the session and wish you a productive and enjoyable experience.</p>
            <p>Best regards,</p>
            Muscat Driving School<br>
            <a href="muscatdrivingschool.com">muscatdrivingschool.com</a><br>
        </div>
        <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
            <a href="mailto:info@muscatdrivingschool.com">info@muscatdrivingschool.com</a>.
            <p>Muscat Driving School ©. All rights reserved.</p>
        </div>
    </div>
    `,
      }
    : {
        from: process.env.APP_EMAIL,
        to: email,
        subject: `مسقط لتعليم السياقة: تأكيد جلستك التدريبية مع ${teacherName}`,
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; direction: rtl;">
        <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
            <h1>تأكيد الجلسة التدريبية</h1>
        </div>
        <div style="padding: 20px;">
            <p>عزيزي/عزيزتي ${studentName}،</p>
            <p>يسعدنا إبلاغك بأن جلستك التدريبية مع ${teacherName} قد تم تأكيدها. فيما يلي تفاصيل الجلسة القادمة:</p>
            <ul style="line-height: 1.6;">
                <li><strong>التاريخ:</strong>${date.slice(
                  0,
                  date.indexOf("*")
                )}</li>
                <li><strong>الوقت:</strong> ${date.slice(
                  date.indexOf("*") + 1
                )}</li>
                <li><strong>المكان:</strong>${type}</li>
                <li><strong>المدة:</strong>${duration} ساعة</li>
            </ul>
            <p>هذه فرصة رائعة للتعلم والنمو، ونشجعك على الاستفادة القصوى منها. مدربونا ملتزمون بتزويدك بالمعرفة والمهارات القيمة التي ستفيدك بشكل كبير. نحن واثقون أنك ستجد هذه الجلسة مفيدة وملهمة.</p>
            <p>نحن ملتزمون بنجاحك ويسعدنا أن تكون من بين عملائنا. إن نموك ورضاك هما أولويتنا القصوى، ونحن هنا لدعمك في كل خطوة من خطواتك.</p>
            <p>يرجى التأكد من الوصول قبل بضع دقائق وجلب أي مواد ضرورية. إذا كان لديك أي أسئلة أو تحتاج إلى إعادة جدولة، فلا تتردد في التواصل معنا على <a href="mailto:info@muscatdrivingschool.com">info@muscatdrivingschool.com</a>.</p>
            <p>نتطلع لرؤيتك في الجلسة ونتمنى لك تجربة مثمرة وممتعة.</p>
            <p>أطيب التحيات،</p>
            مسقط لتعليم قيادة السيارات<br>
            <a href="muscatdrivingschool.com">muscatdrivingschool.com</a><br>
        </div>
        <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
            <a href="mailto:info@muscatdrivingschool.com">info@muscatdrivingschool.com</a>.
            <p>مسقط لتعليم قيادة السيارات ©. جميع الحقوق محفوظة.</p>
        </div>
    </div>
     `,
      };
};
const generateTeacherSessionNoticeEmail = (
  language,
  email,
  teacherName,
  studentName,
  date,
  type,
  duration
) => {
  return language === "en"
    ? {
        from: process.env.APP_EMAIL,
        to: email,
        subject: `MDS: Session Confirmation with ${studentName}`,
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
        <h1>Session Confirmation</h1>
    </div>
    <div style="padding: 20px;">
        <p>Dear ${teacherName},</p>
        <p>We are pleased to inform you that your session with ${studentName} has been confirmed. Below are the details of the upcoming session:</p>
        <ul style="line-height: 1.6;">
        <li><strong>Date:</strong> ${date.slice(0, date.indexOf("*"))}</li>
          <li><strong>Time:</strong> ${date.slice(date.indexOf("*") + 1)}</li>
          <li><strong>Location:</strong>${type}</li>
          <li><strong>Duration:</strong>${duration} ${
          duration > 1 ? "hours" : "hour"
        }</li>
        </ul>
        <p>We are confident that this session will be a valuable learning experience for ${studentName}. If you have any specific preparations or materials needed for the session, please let us know.</p>
        <p>Thank you for your dedication and efforts in providing excellent training. We look forward to a successful session.</p>
        <p>Best regards,</p>
        Muscat Driving School<br>
        <a href="muscatdrivingschool.com">muscatdrivingschool.com</a><br>
        </div>
    <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
    <a href="mailto:info@muscatdrivingschool.com">info@muscatdrivingschool.com</a>.
        <p>Muscat Driving School ©. All rights reserved.</p>
    </div>
    </div>
        `,
      }
    : {
        from: process.env.APP_EMAIL,
        to: email,
        subject: `مسقط لتعليم السياقة: تأكيد جلستك التدريبية مع ${studentName}`,
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; direction: rtl;">
    <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
        <h1>تأكيد الجلسة التدريبية</h1>
    </div>
    <div style="padding: 20px;">
        <p>عزيزي/عزيزتي ${teacherName}،</p>
        <p>يسعدنا إبلاغك بأن جلستك التدريبية مع ${studentName} قد تم تأكيدها. فيما يلي تفاصيل الجلسة القادمة:</p>
        <ul style="line-height: 1.6;">
                <li><strong>التاريخ:</strong>${date.slice(
                  0,
                  date.indexOf("*")
                )}</li>
                <li><strong>الوقت:</strong> ${date.slice(
                  date.indexOf("*") + 1
                )}</li>
                <li><strong>المكان:</strong>${type}</li>
                <li><strong>المدة:</strong>${duration} ساعة</li>
            </ul>
        <p>نحن واثقون أن هذه الجلسة ستكون تجربة تعليمية قيمة لـ ${studentName}. إذا كان لديك أي تجهيزات خاصة أو مواد تحتاجها للجلسة، يرجى إعلامنا بذلك.</p>
        <p>شكرًا لك على تفانيك وجهودك في تقديم تدريب ممتاز. نتطلع إلى جلسة ناجحة.</p>
        <p>أطيب التحيات،</p>
        مسقط لتعليم قيادة السيارات<br>
        <a href="muscatdrivingschool.com">muscatdrivingschool.com</a><br>
    </div>
    <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
    <a href="mailto:info@muscatdrivingschool.com">info@muscatdrivingschool.com</a>.
    <p>مسقط لتعليم قيادة السيارات ©. جميع الحقوق محفوظة.</p>
</div>
</div>
`,
      };
};
const generateSessionPaymentConfirmation = (
  language,
  email,
  studentName,
  teacherName,
  date,
  type,
  duration,
  price,
  totalPrice,
  currency
) => {
  return language === "en"
    ? {
        from: process.env.APP_EMAIL,
        to: email,
        subject: `MDS: Payment Confirmation for Your Session`,
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
        <h1>Payment Confirmation</h1>
    </div>
    <div style="padding: 20px;">
        <p>Dear ${studentName},</p>
        <p>We are pleased to inform you that your payment for the upcoming session with ${teacherName} has been successfully processed. Below are the details of your session:</p>
        <ul style="line-height: 1.6;">
            <li><strong>Session Date:</strong> ${date.slice(
              0,
              date.indexOf("*")
            )}</li>
            <li><strong>Time:</strong> ${date.slice(date.indexOf("*") + 1)}</li>
            <li><strong>Location:</strong>${type}</li>
            <li><strong>Duration:</strong>${duration} ${
          duration > 1 ? "hours" : "hour"
        }</li>
          <li><strong>One Hour price:</strong> ${price} ${currency}</li>
            <li><strong>Amount Paid:</strong> ${totalPrice} ${currency}</li>
        </ul>
        <p>Thank you for your prompt payment. We are excited to have you join the session and are confident that it will be a valuable learning experience for you.</p>
        <p>If you have any questions or need further assistance, please feel free to reach out to our support team at <a href="mailto:info@muscatdrivingschool.com">info@muscatdrivingschool.com</a>.</p>
        <p>We appreciate your time and look forward to seeing you at the session!</p>
        <p>Best regards,</p>
        Muscat Driving School<br>
        <a href="muscatdrivingschool.com">muscatdrivingschool.com</a><br>
    </div>
    <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
com">info@muscatdrivingschool.com</a>.
        <p>Muscat Driving School ©. All rights reserved.</p>
    </div>
</div>`,
      }
    : {
        from: process.env.APP_EMAIL,
        to: email,
        subject: `مسقط لتعليم السياقة: تأكيد الدفع لجلسة التدريب الخاصة بك`,
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; direction: rtl;">
    <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
        <h1>تأكيد الدفع</h1>
    </div>
    <div style="padding: 20px;">
        <p>عزيزي/عزيزتي ${studentName}،</p>
        <p>يسعدنا إبلاغك بأن دفعتك للجلسة القادمة مع المدرب ${teacherName} قد تمت بنجاح. فيما يلي تفاصيل جلستك:</p>
        <ul style="line-height: 1.6;">
        <li><strong>تاريخ الجلسة:</strong>${date.slice(
          0,
          date.indexOf("*")
        )}</li>
        <li><strong>الوقت:</strong> ${date.slice(date.indexOf("*") + 1)}</li>
        <li><strong>المكان:</strong>${type}</li>
        <li><strong>المدة:</strong>${duration} ساعة</li>
        <li><strong>سعر الساعة:</strong>${price} ${currency}</li>
        <li><strong>المبلغ المدفوع:</strong>${totalPrice} ${currency} </li>
        </ul>
        <p>شكرًا لك على الدفع الفوري. نحن متحمسون لانضمامك إلى الجلسة وواثقون أنها ستكون تجربة تعليمية قيمة لك.</p>
        <p>إذا كان لديك أي أسئلة أو تحتاج إلى مزيد من المساعدة، يرجى التواصل مع فريق الدعم لدينا على <a href="mailto:info@muscatdrivingschool.com">info@muscatdrivingschool.com</a>.</p>
        <p>نحن نقدر وقتك ونتطلع لرؤيتك في الجلسة!</p>
        <p>أطيب التحيات،</p>
        مسقط لتعليم قيادة السيارات<br>
        <a href="muscatdrivingschool.com">muscatdrivingschool.com</a><br>
     </p>
    </div>
    <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
    <a href="mailto:info@muscatdrivingschool.com">info@muscatdrivingschool.com</a>.
        <p>مسقط لتعليم قيادة السيارات ©. جميع الحقوق محفوظة.</p>
    </div>
</div>
        `,
      };
};
const adminSendEmailBody = (message, language, email) => {
  return language === "en"
    ? {
        from: process.env.APP_EMAIL,
        to: email,
        subject: "Welcome to Muscat Driving School! New Message",
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
  <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
      <h1>Welcome to Muscat Driving School!</h1>
  </div>
  <div style="padding: 20px;">
      <p>${message} </p>
  </div>
  <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
      <p>Best regards,</p>
      Muscat Driving School<br>
      <a href="muscatdrivingschool.com">muscatdrivingschool.com</a><br>
      <p>Muscat Driving School ©. All rights reserved.</p>
      <p>By sending this email, you acknowledge and agree to our <a href="muscatdrivingschool.com/TermsAndConditions">Terms of Service</a> and <a href="muscatdrivingschool.com/PrivacyPolicy">Privacy Policy</a>.</p>
  </div>
</div>`,
      }
    : {
        from: process.env.APP_EMAIL,
        to: email,
        subject:
          "مرحباً بك في مسقط لتعليم قيادة السيارات! رساله جديدة",
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; direction: rtl;">
  <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
      <h1>مرحباً بك في مسقط لتعليم قيادة السيارات!</h1>
  </div>
  <div style="padding: 20px;">
      <p> ${message}</p>
  </div>
  <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
      <p>أطيب التحيات،</p>
      مسقط لتعليم قيادة السيارات<br>
      <a href="muscatdrivingschool.com">muscatdrivingschool.com</a><br></p>
      <p>مسقط لتعليم قيادة السيارات © . جميع الحقوق محفوظة.</p>
      <p>بإرسال هذا البريد الإلكتروني، فإنك تقر وتوافق على <a href="muscatdrivingschool.com/TermsAndConditions">شروط الخدمة</a> و <a href="muscatdrivingschool.com/PrivacyPolicy">سياسة الخصوصية</a> الخاصة بنا.</p>
  </div>
</div>`,
      };
};
const generateInvoiceEmailBody = ({
  language,
  recipientName,
  email,
  itemName,
  price,
  currency,
  date,
  role
}) => {
  const formattedDate = new Date(date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US");

  return language === "en"
    ? {
        from: process.env.APP_EMAIL,
        to: email,
        subject: "Deposit Confirmation Invoice",
        html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; direction: ltr;">
  <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
    <h1>Muscat Driving School</h1>
    <h2>Deposit Confirmation Invoice</h2>
  </div>
  <h2>Invoice</h2>
  <p>Hello ${recipientName},</p>
  <p>Thank you for your ${role === "teacher" ? "deposit" : "purchase"}. Below are your invoice details:</p>
  <ul>
    <li><strong>Item:</strong> ${itemName}</li>
    <li><strong>Amount:</strong> ${price} ${currency}</li>
    <li><strong>Date:</strong> ${formattedDate}</li>
  </ul>
  <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
    <p>Best regards,</p>
    Muscat Driving School<br>
    <a href="https://muscatdrivingschool.com">muscatdrivingschool.com</a><br>
    <p>© Muscat Driving School. All rights reserved.</p>
    <p>By sending this email, you agree to our 
      <a href="https://muscatdrivingschool.com/TermsAndConditions">Terms of Service</a> and 
      <a href="https://muscatdrivingschool.com/PrivacyPolicy">Privacy Policy</a>.
    </p>
  </div>
</div>`
      }
    : {
        from: process.env.APP_EMAIL,
        to: email,
        subject: "فاتورة تأكيد الإيداع",
        html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; direction: rtl;">
  <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
    <h1>مسقط لتعليم قيادة السيارات</h1>
    <h2>فاتورة تأكيد الإيداع</h2>
  </div>
  <h2>فاتورة</h2>
  <p>أهلاً ${recipientName},</p>
  <p>شكرًا لـ${role === "teacher" ? "إيداعك" : "شرائك"}. إليك تفاصيل فاتورتك:</p>
  <ul>
    <li><strong>نوع الفاتورة:</strong> ${itemName}</li>
    <li><strong>المبلغ:</strong> ${price} ريال عماني</li>
    <li><strong>تاريخ الشراء:</strong> ${formattedDate}</li>
  </ul>
  <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
    <p>أطيب التحيات،</p>
    مسقط لتعليم قيادة السيارات<br>
    <a href="https://muscatdrivingschool.com">muscatdrivingschool.com</a><br>
    <p>© مسقط لتعليم قيادة السيارات. جميع الحقوق محفوظة.</p>
    <p>بإرسال هذا البريد الإلكتروني، فإنك تقر وتوافق على 
      <a href="https://muscatdrivingschool.com/TermsAndConditions">شروط الخدمة</a> و 
      <a href="https://muscatdrivingschool.com/PrivacyPolicy">سياسة الخصوصية</a>.
    </p>
  </div>
</div>`
      };
};


const generateChargeInvoiceEmail = (
  language,
  name,
  email,
  amount,
  currency,
  sessionId,
  date = new Date()
) => {
  const formattedDate = new Date(date).toLocaleString(language === "ar" ? "ar-EG" : "en-US", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  });

  const isArabic = language === "ar";

  const subject = isArabic ? "فاتورة تأكيد الدفع" : "Payment Confirmation Invoice";
  const header = isArabic ? "منصة مسقط لتعليم قيادة السيارات" : "Muscat Driving School Platform";
  const greeting = isArabic ? "شكراً لاستخدامك منصتنا!" : "Thank you for using our platform!";
  const regards = isArabic ? "أطيب التحيات،" : "Best regards,";
  const footerRights = isArabic ? "© مسقط لتعليم قيادة السيارات. جميع الحقوق محفوظة." : "© Muscat Driving School. All rights reserved.";
  const terms = isArabic ? "شروط الخدمة" : "Terms of Service";
  const privacy = isArabic ? "سياسة الخصوصية" : "Privacy Policy";
  const serviceLink = "https://muscatdrivingschool.com/TermsAndConditions";
  const privacyLink = "https://muscatdrivingschool.com/PrivacyPolicy";

  const bodyContent = isArabic
    ? `
      <h3 style="color: #004aad;">📄 فاتورة تأكيد الدفع</h3>
      <p><strong>الاسم:</strong> ${name}</p>
      <p><strong>المبلغ:</strong> ${amount} ${currency}</p>
      <p><strong>تاريخ الدفع:</strong> ${formattedDate}</p>
      ${sessionId?`<p><strong>رقم العملية:</strong> ${sessionId}</p>`:''}
      <p style="margin-top: 30px;">${greeting}</p>
    `
    : `
      <h3 style="color: #004aad;">📄 Payment Confirmation Invoice</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Amount:</strong> ${amount} ${currency}</p>
      <p><strong>Payment Date:</strong> ${formattedDate}</p>
      ${sessionId?`<p><strong>Transaction ID:</strong> ${sessionId}</p>`:''}
      <p style="margin-top: 30px;">${greeting}</p>
    `;

  return {
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 700px; margin: auto; border: 1px solid #ddd;">
        <div style="background-color: #004aad; padding: 15px; color: white; text-align: center;">
          <h2 style="margin: 0;">${header}</h2>
        </div>

        <div style="padding: 25px;">
          ${bodyContent}
        </div>

        <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
          <p>${regards}</p>
          <strong>مسقط لتعليم قيادة السيارات</strong><br>
          <a href="https://muscatdrivingschool.com">muscatdrivingschool.com</a><br><br>
          <p>${footerRights}</p>
          <p>
            ${
              isArabic
                ? `بإرسال هذا البريد الإلكتروني، فإنك توافق على <a href="${serviceLink}">${terms}</a> و <a href="${privacyLink}">${privacy}</a>.`
                : `By receiving this email, you agree to our <a href="${serviceLink}">${terms}</a> and <a href="${privacyLink}">${privacy}</a>.`
            }
          </p>
        </div>
      </div>
    `,
  };
};

const generatePointsEmailBody = ({
  language,
  recipientName,
  email,
  newPoints,
  totalPoints,
  date
}) => {
  const formattedDate = new Date(date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US");

  return language === "en"
    ? {
        from: process.env.APP_EMAIL,
        to: email,
        subject: "Points Update Notification",
        html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; direction: ltr;">
  <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
    <h1>Muscat Driving School</h1>
    <h2>Points Added</h2>
  </div>
  <h2>Points Notification</h2>
  <p>Hello ${recipientName},</p>
  <p>We’re happy to inform you that <strong>${newPoints}</strong> new point(s) have been added to your account on <strong>${formattedDate}</strong>.</p>
  <p>Keep learning and earning more points!</p>
  <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
    <p>Best regards,</p>
    Muscat Driving School<br>
    <a href="https://muscatdrivingschool.com">muscatdrivingschool.com</a><br>
    <p>© Muscat Driving School. All rights reserved.</p>
  </div>
</div>`
      }
    : {
        from: process.env.APP_EMAIL,
        to: email,
        subject: "تمت إضافة نقاط جديدة",
        html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; direction: rtl;">
  <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
    <h1>مسقط لتعليم قيادة السيارات</h1>
    <h2>إضافة نقاط جديدة</h2>
  </div>
  <h2>تنبيه بالنقاط</h2>
  <p>مرحبًا ${recipientName}،</p>
  <p>تمت إضافة <strong>${newPoints}</strong> نقطة جديدة إلى نقاطك المكتسبة بتاريخ <strong>${formattedDate}</strong>.</p>
  <p>واصل التعلم واكسب المزيد من النقاط!</p>
  <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
    <p>مع أطيب التحيات،</p>
    مسقط لتعليم قيادة السيارات<br>
    <a href="https://muscatdrivingschool.com">muscatdrivingschool.com</a><br>
    <p>© مسقط لتعليم قيادة السيارات. جميع الحقوق محفوظة.</p>
  </div>
</div>`
      };
};

// templates/emailHeaderFooter.js
const getHeader = (language) =>
  language === "ar"
    ? `
<div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
  <h1>مسقط لتعليم قيادة السيارات</h1>
  <h2>إشعار</h2>
</div>`
    : `
<div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
  <h1>Muscat Driving School</h1>
  <h2>Notification</h2>
</div>`;

const getFooter = (language) =>
  language === "ar"
    ? `
<div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
  <p>مع أطيب التحيات،</p>
  مسقط لتعليم قيادة السيارات<br>
  <a href="https://muscatdrivingschool.com">muscatdrivingschool.com</a><br>
  <p>© مسقط لتعليم قيادة السيارات. جميع الحقوق محفوظة.</p>
</div>`
    : `
<div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
  <p>Best regards,</p>
  Muscat Driving School<br>
  <a href="https://muscatdrivingschool.com">muscatdrivingschool.com</a><br>
  <p>© Muscat Driving School. All rights reserved.</p>
</div>`;


const generateCertificateHTML = ({ language, studentName, certificateTitle, date,email }) => {
  const formattedDate = new Date(date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US");
  const direction = language === "ar" ? "rtl" : "ltr";
  const header = getHeader(language);
  const footer = getFooter(language);

  const body = language === "ar"
    ? `
      <h2>شهادة إتمام</h2>
      <p>تشهد مدرسة مسقط لتعليم القيادة بأن ${studentName} قد أتم ${certificateTitle} بنجاح بتاريخ <strong>${formattedDate}</strong>.</p>
    `
    : `
      <h2>Certificate of Completion</h2>
      <p>This is to certify that ${studentName} has successfully completed ${certificateTitle} on <strong>${formattedDate}</strong>.</p>
    `;

  return {
        from: process.env.APP_EMAIL,
        to: email,
        subject: language === "ar"?"شهادة تدريب جديدة":"New Training Certificate",
        html:`
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; direction: ${direction};">
      ${header}
      ${body}
      ${footer}
    </div>`}
  
};

module.exports = {
  generateConfirmEmailBody,
  generateWelcomeEmailBody,
  generateChargeConfirmationEmail,
  generateSessionConfirmationEmail,
  generateTeacherSessionNoticeEmail,
  generateSessionPaymentConfirmation,
  adminSendEmailBody,
  generatePointsEmailBody,
  generateInvoiceEmailBody,
  generateCertificateHTML
};
