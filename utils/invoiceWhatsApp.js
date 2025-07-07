const { sendWhatsAppTemplate, formatArabicDateTime } = require("./whatsapp");
const { PAYMENT_TEMPLATES } = require("../config/whatsapp-templates");

/**
 * إرسال فاتورة دفع عبر واتساب
 * @param {Object} options
 * @param {string} options.to - رقم الهاتف
 * @param {string} options.customerName - اسم العميل
 * @param {string} options.invoiceNumber - رقم الفاتورة
 * @param {Array} options.items - عناصر الفاتورة
 * @param {number} options.totalAmount - المبلغ الإجمالي
 * @param {string} options.currency - العملة
 * @param {string} options.paymentMethod - طريقة الدفع
 * @param {string} options.language - اللغة
 * @param {string} options.invoiceType - نوع الفاتورة
 */
async function sendInvoiceWhatsApp({
  to,
  customerName,
  invoiceNumber,
  items = [],
  totalAmount,
  currency = "OMR",
  paymentMethod = "wallet",
  language = "ar",
  invoiceType = "payment",
  transactionId = null,
  sessionDetails = null,
}) {
  console.log("🧾 إرسال فاتورة دفع عبر واتساب:", {
    to,
    customerName,
    invoiceNumber,
    totalAmount,
    currency,
    paymentMethod,
    language,
    invoiceType,
    itemsCount: items.length,
    timestamp: new Date().toISOString(),
  });

  try {
    let templateName;
    let variables = [];
    switch (invoiceType) {
      case "wallet_charge":
        templateName =
          language === "ar"
            ? PAYMENT_TEMPLATES.WALLET_CHARGE_INVOICE_AR
            : PAYMENT_TEMPLATES.WALLET_CHARGE_INVOICE_EN;
        variables = [
          customerName,
          totalAmount.toString(),
          currency,
          invoiceNumber,
          formatArabicDateTime(new Date()),
          paymentMethod === "thawani" ? "ثواني" : "المحفظة",
        ];
        break;
      case "lesson":
        templateName =
          language === "ar"
            ? PAYMENT_TEMPLATES.LESSON_PAYMENT_INVOICE_AR
            : PAYMENT_TEMPLATES.LESSON_PAYMENT_INVOICE_EN;
        
        // الحصول على تفاصيل الحصة من المعلمات الإضافية
        const lessonType = sessionDetails?.lessonType || 'قيادة عادية';
        const lessonDate = sessionDetails?.date ? new Date(sessionDetails.date) : new Date();
        const lessonTime = sessionDetails?.time || '10:00 ص';
        const instructorName = sessionDetails?.instructorName || 'مدرب المدرسة';
        const location = sessionDetails?.location || 'مقر المدرسة';
        
        // ملاحظة: القالب يتوقع 8 معلمات
        // ترتيب المتغيرات المطلوب:
        // 1. اسم الطالب
        // 2. اسم المعلم
        // 3. نوع الدرس
        // 4. مدة الدرس (نستخدم ساعة واحدة كقيمة افتراضية)
        // 5. المبلغ الإجمالي
        // 6. رقم الفاتورة
        // 7. التاريخ والوقت
        // 8. مكان التدريب
        const lessonDuration = '1 ساعة'; // يمكن تعديلها حسب الحاجة
        
        variables = [
          customerName, // 1. اسم الطالب
          instructorName, // 2. اسم المدرب
          lessonType, // 3. نوع الدرس (قيادة نهارية/ليلية/طرق سريعة)
          lessonDuration, // 4. مدة الدرس
          `${totalAmount} ${currency}`, // 5. المبلغ الإجمالي مع العملة
          invoiceNumber, // 6. رقم الفاتورة
          `${formatArabicDateTime(lessonDate)} - ${lessonTime}`, // 7. التاريخ والوقت
          location // 8. مكان التدريب
        ];
        break;
      default:
        templateName =
          language === "ar"
            ? PAYMENT_TEMPLATES.PAYMENT_CONFIRMATION_AR
            : PAYMENT_TEMPLATES.PAYMENT_CONFIRMATION_EN;
        variables = [
          customerName,
          totalAmount.toString(),
          currency,
          invoiceNumber,
        ];
        break;
    }
    await sendWhatsAppTemplate({
      to,
      templateName,
      variables,
      language: language === "ar" ? "ar" : "en_US",
      recipientName: customerName,
      messageType: "invoice",
    });
  } catch (error) {
    console.error("❌ Error sending invoice WhatsApp message:", error.response?.data || error);
    throw error;
  }
}

module.exports = {
  sendInvoiceWhatsApp,
};
