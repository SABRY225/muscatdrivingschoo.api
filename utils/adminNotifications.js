const { sendWhatsAppTemplate } = require('./whatsapp');
const { ADMIN_TEMPLATES } = require('../config/whatsapp-templates');

/**
 * إرسال إشعار تأكيد دفع للإدارة
 * @param {Object} options
 * @param {string} options.studentName - اسم الطالب
 * @param {string} options.paymentType - نوع الدفع (درس/محاضرة/باقة/اختبار/خصم)
 * @param {number} options.amount - المبلغ
 * @param {string} options.invoiceNumber - رقم الفاتورة
 */
async function sendPaymentConfirmationToAdmin({ studentName, paymentType, amount, invoiceNumber }) {
  try {
    await sendWhatsAppTemplate({
      to: process.env.ADMIN_PHONE_NUMBER,
      templateName: ADMIN_TEMPLATES.PAYMENT_CONFIRMATION_ADMIN_AR,
      variables: [studentName, paymentType, amount, invoiceNumber]
    });
  } catch (error) {
    console.error('فشل إرسال إشعار تأكيد الدفع للإدارة:', error);
  }
}

/**
 * إرسال إشعار شحن رصيد للإدارة
 * @param {Object} options
 * @param {string} options.studentName - اسم الطالب
 * @param {number} options.amount - المبلغ المشحون
 * @param {string} options.transactionId - رقم المعاملة
 */
async function sendWalletChargeNotification({ studentName, amount, transactionId }) {
  try {
    await sendWhatsAppTemplate({
      to: process.env.ADMIN_PHONE_NUMBER,
      templateName: ADMIN_TEMPLATES.WALLET_CHARGE_ADMIN_AR,
      variables: [studentName, amount, transactionId]
    });
  } catch (error) {
    console.error('فشل إرسال إشعار شحن الرصيد للإدارة:', error);
  }
}

/**
 * إرسال إشعار مستخدم جديد للإدارة
 * @param {Object} options
 * @param {string} options.userType - نوع المستخدم (طالب/مدرب)
 * @param {string} options.userName - اسم المستخدم
 * @param {string} options.joinDate - تاريخ الانضمام
 */
async function sendNewUserNotification({ userType, userName, joinDate }) {
  try {
    await sendWhatsAppTemplate({
      to: process.env.ADMIN_PHONE_NUMBER,
      templateName: ADMIN_TEMPLATES.NEW_USER_ADMIN_AR,
      variables: [userType, userName, joinDate]
    });
  } catch (error) {
    console.error('فشل إرسال إشعار مستخدم جديد للإدارة:', error);
  }
}

/**
 * إرسال إشعار حالة حجز درس للإدارة
 * @param {Object} options
 * @param {string} options.studentName - اسم الطالب
 * @param {string} options.teacherName - اسم المدرب
 * @param {string} options.lessonDate - تاريخ الدرس
 * @param {string} options.status - حالة الحجز (تمت الموافقة/مرفوض)
 */
async function sendLessonStatusNotification({ studentName, teacherName, lessonDate, status }) {
  try {
    await sendWhatsAppTemplate({
      to: process.env.ADMIN_PHONE_NUMBER,
      templateName: ADMIN_TEMPLATES.LESSON_STATUS_ADMIN_AR,
      variables: [studentName, teacherName, lessonDate, status]
    });
  } catch (error) {
    console.error('فشل إرسال إشعار حالة الدرس للإدارة:', error);
  }
}

/**
 * إرسال إشعار بدء/انتهاء درس للإدارة
 * @param {Object} options
 * @param {string} options.studentName - اسم الطالب
 * @param {string} options.teacherName - اسم المدرب
 * @param {string} options.lessonTime - توقيت الدرس
 * @param {string} options.status - الحالة (بدأ/انتهى)
 */
async function sendLessonSessionNotification({ studentName, teacherName, lessonTime, status }) {
  try {
    await sendWhatsAppTemplate({
      to: process.env.ADMIN_PHONE_NUMBER,
      templateName: ADMIN_TEMPLATES.LESSON_SESSION_ADMIN_AR,
      variables: [studentName, teacherName, lessonTime, status]
    });
  } catch (error) {
    console.error('فشل إرسال إشعار جلسة الدرس للإدارة:', error);
  }
}

module.exports = {
  sendPaymentConfirmationToAdmin,
  sendWalletChargeNotification,
  sendNewUserNotification,
  sendLessonStatusNotification,
  sendLessonSessionNotification
};
