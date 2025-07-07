const { sendWhatsAppTemplate } = require('./whatsapp');
const { ADMIN_TEMPLATES } = require('../config/whatsapp-templates');

/**
 * إرسال إشعار واتساب إلى الأدمن
 * @param {Object} options
 * @param {string} options.templateName - اسم القالب
 * @param {Array} options.variables - متغيرات القالب
 * @param {string} options.recipientName - اسم المستلم (للتوثيق)
 * @param {string} options.messageType - نوع الرسالة (للتوثيق)
 */
async function sendAdminWhatsApp({
  templateName,
  variables = [],
  recipientName = "الإدارة",
  messageType = "admin_notification"
}) {
  try {
    // رقم هاتف الأدمن من متغيرات البيئة
    const adminPhoneNumber = process.env.ADMIN_PHONE_NUMBER;
    
    if (!adminPhoneNumber) {
      console.error('❌ رقم هاتف الأدمن غير محدد في متغيرات البيئة (ADMIN_PHONE_NUMBER)');
      return null;
    }

    // إضافة رمز الدولة إذا لم يكن موجوداً
    const to = adminPhoneNumber.startsWith('+') 
      ? adminPhoneNumber 
      : `+${adminPhoneNumber}`;

    console.log(`📤 إرسال إشعار إلى الأدمن (${to}) - ${templateName}`, { variables });

    const result = await sendWhatsAppTemplate({
      to,
      templateName,
      variables,
      language: 'ar', // نستخدم العربية كلغة افتراضية للإدارة
      recipientName,
      messageType,
      fallbackToEnglish: false // لا نريد العودة للغة الإنجليزية في إشعارات الأدمن
    });

    console.log('✅ تم إرسال إشعار الأدمن بنجاح');
    return result;
  } catch (error) {
    console.error('❌ فشل إرسال إشعار الأدمن:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * إرسال إشعار حجز جديد إلى الأدمن
 * @param {Object} options
 * @param {string} options.studentName - اسم الطالب
 * @param {string} options.bookingType - نوع الحجز (درس/محاضرة/اختبار)
 * @param {string} options.bookingDetails - تفاصيل الحجز
 * @param {string} options.amount - المبلغ
 */
async function sendNewBookingNotification({
  studentName,
  bookingType,
  bookingDetails,
  amount
}) {
  return sendAdminWhatsApp({
    templateName: ADMIN_TEMPLATES.NEW_BOOKING_NOTIFICATION_AR,
    variables: [studentName, bookingType, bookingDetails, amount],
    messageType: 'new_booking_notification'
  });
}

/**
 * إرسال إشعار دفع جديد إلى الأدمن
 * @param {Object} options
 * @param {string} options.studentName - اسم الطالب
 * @param {string} options.paymentType - نوع الدفع
 * @param {string} options.amount - المبلغ
 * @param {string} options.invoiceNumber - رقم الفاتورة
 */
async function sendNewPaymentNotification({
  studentName,
  paymentType,
  amount,
  invoiceNumber
}) {
  return sendAdminWhatsApp({
    templateName: ADMIN_TEMPLATES.NEW_PAYMENT_NOTIFICATION_AR,
    variables: [studentName, paymentType, amount, invoiceNumber],
    messageType: 'new_payment_notification'
  });
}

/**
 * إرسال إشعار شكوى جديدة إلى الأدمن
 * @param {Object} options
 * @param {string} options.studentName - اسم الطالب
 * @param {string} options.complaintType - نوع الشكوى
 * @param {string} options.complaintDetails - تفاصيل الشكوى
 */
async function sendNewComplaintNotification({
  studentName,
  complaintType,
  complaintDetails
}) {
  return sendAdminWhatsApp({
    templateName: ADMIN_TEMPLATES.NEW_COMPLAINT_NOTIFICATION_AR,
    variables: [studentName, complaintType, complaintDetails],
    messageType: 'new_complaint_notification'
  });
}

module.exports = {
  sendAdminWhatsApp,
  sendNewBookingNotification,
  sendNewPaymentNotification,
  sendNewComplaintNotification
};
