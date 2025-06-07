const generateConfirmEmailSMSBody = (language, code) => {
  return language === "en"
    ? `Welcome to Muscat Driving School! Please confirm your email using this code: ${code}. If you didn't sign up, ignore this message.`
    : `مرحباً بك في مسقط لتعليم قيادة السيارات! يرجى تأكيد بريدك الإلكتروني باستخدام هذا الرمز: ${code}. إذا لم تقم بالتسجيل، تجاهل هذه الرسالة.
    `;
};
const generateWelcomeSMSBody = (language, name) => {
  return language === "en"
    ? `
    Welcome to Muscat Driving School, ${name}! Your account has been successfully created. We're excited to have you with us.
    `
    : `مرحباً بك في مسقط لتعليم قيادة السيارات, ${name}! تم إنشاء حسابك بنجاح. نحن سعداء بانضمامك إلينا.
    `;
};
const generateChargeConfirmationSMSBody = (language, name, price, currency) => {
  return language === "en"
    ? `Hello ${name}, your payment of ${price} ${currency} to Muscat Driving School was successful. Thank you!.`
    : `مرحباً ${name}، دفعتك بمقدار ${price} ${currency} إلى مسقط لتعليم قيادة السيارات تمت بنجاح. شكراً لك!
    `;
};
const generateSessionConfirmationSMSBody = (
  language,
  studentName,
  teacherName,
  date,
  type,
  duration
) => {
  return language === "en"
    ? `
  Hello ${studentName}, your session with ${teacherName} on ${date.slice(
        0,
        date.indexOf("*")
      )} at ${date.slice(date.indexOf("*") + 1)} for ${
        duration + duration > 1 ? "hours" : "hour"
      } has been confirmed. Location: ${type}. We're excited to see you there!.
`
    : `
مرحباً ${studentName}، تم تأكيد جلستك مع ${teacherName} في ${date.slice(
        0,
        date.indexOf("*")
      )} الساعة ${date.slice(
        date.indexOf("*") + 1
      )}لمدة ${duration} ساعة. المكان: ${type}. نحن متحمسون لرؤيتك هناك!`;
};
const generateSessionPaymentConfirmationSMS = (
  language,
  studentName,
  teacherName,
  date,
  type,
  duration,
  price,
  currency
) => {
  return language === "en"
    ? `
  Hello ${studentName}, your payment of ${price} ${currency} for the session on ${date.slice(
        0,
        date.indexOf("*")
      )} at ${date.slice(date.indexOf("*") + 1)} for ${
        duration + duration > 1 ? "hours" : "hour"
      } with ${teacherName} has been successfully processed. Location: ${type}. Thank you!
  `
    : `
    مرحباً ${studentName}، تم تأكيد دفع مبلغ ${price} ${currency} لجلسة التدريب بتاريخ ${date.slice(
        0,
        date.indexOf("*")
      )} الساعة ${date.slice(
        date.indexOf("*") + 1
      )} لمدة ${duration} ساعة. المكان:  ${type}. مع المدرب ${teacherName}. شكراً لك!

    `;
};
module.exports = {
  generateConfirmEmailSMSBody,
  generateWelcomeSMSBody,
  generateChargeConfirmationSMSBody,
  generateSessionConfirmationSMSBody,
  generateSessionPaymentConfirmationSMS,
};
