/**
 * ملف إدارة قوالب رسائل واتساب
 * WhatsApp Templates Management Configuration
 *
 * هذا الملف يحتوي على جميع أسماء قوالب رسائل واتساب المستخدمة في النظام
 * عند تغيير اسم القالب هنا، سيتم تطبيقه تلقائياً على جميع الملفات التي تستخدمه
 */

// قوالب التحقق والتسجيل - Verification & Registration Templates
const VERIFICATION_TEMPLATES = {
  // قالب رمز التحقق
  VERIFY_CODE_AR: "verify_code_1",
  VERIFY_CODE_EN: "verify_code_en",

  // قوالب الترحيب
  WELCOME_STUDENT_AR: "welcome_student_ar",
  WELCOME_STUDENT_EN: "welcome_student_en",
  WELCOME_TEACHER_AR: "welcome_teacher_ar",
  WELCOME_TEACHER_EN: "welcome_teacher_en",

  // قالب إكمال الملف الشخصي
  PROFILE_COMPLETION_AR: "profile_completion_ar",
  PROFILE_COMPLETION_EN: "profile_completion_en",

  // قالب اكتمال تسجيل المعلم
  TEACHER_REGISTRATION_COMPLETE_AR: "teacher_registration_complete_ar",
  TEACHER_REGISTRATION_COMPLETE_EN: "teacher_registration_complete_en",

  //قوالب الشهادة 
  CERTIFICATE_ISSUED_AR: "certificate_issued_ar",  // للغة العربية
  CERTIFICATE_ISSUED_EN: "certificate_issued_en",   // للغة الإنجليزية

  // في ملف whatsapp-templates.js
  POINTS_ADDED_AR: "points_added_ar",  // للغة العربية
  POINTS_ADDED_EN: "points_added_en",   // للغة الإنجليزية
  
  // قوالب طلبات السحب
  WITHDRAWAL_REQUEST_AR: "withdrawal_request_ar",  // للغة العربية
  WITHDRAWAL_REQUEST_EN: "withdrawal_request_en",   // للغة الإنجليزية
  
  // قوالب حالة طلب السحب
  WITHDRAWAL_APPROVED_AR: "withdrawal_approved_ar",  // طلب السحب مقبول
  WITHDRAWAL_APPROVED_EN: "withdrawal_approved_en",
  WITHDRAWAL_REJECTED_AR: "withdrawal_rejected_ar",  // طلب السحب مرفوض
  WITHDRAWAL_REJECTED_EN: "withdrawal_rejected_en"
};

// قوالب الدفع والمحفظة - Payment & Wallet Templates
const PAYMENT_TEMPLATES = {
  // تأكيد شحن المحفظة
  WALLET_CHARGE_CONFIRMATION_AR: "wallet_charge_confirmation_ar",
  WALLET_CHARGE_CONFIRMATION_EN: "wallet_charge_confirmation_en",
  WALLET_CHARGE_ADMIN_AR: "wallet_charge_admin_ar", // إضافة قالب إشعار شحن الرصيد للمشرف

  // تأكيد الدفع
  PAYMENT_CONFIRMATION_AR: "payment_confirmation_ar",
  PAYMENT_CONFIRMATION_EN: "payment_confirmation_en",
  PAYMENT_CONFIRMATION_ADMIN_AR: "payment_confirmation_admin_ar", // إضافة قالب تأكيد الدفع للمشرف

  // فواتير المدفوعات
  WALLET_CHARGE_INVOICE_AR: "wallet_charge_invoice_ar",
  WALLET_CHARGE_INVOICE_EN: "wallet_charge_invoice_en",
  LESSON_PAYMENT_INVOICE_AR: "lesson_payment_invoice_ar",
  LESSON_PAYMENT_INVOICE_EN: "lesson_payment_invoice_en",
  LECTURE_PAYMENT_INVOICE_AR: "lecture_payment_invoice_ar",
  LECTURE_PAYMENT_INVOICE_EN: "lecture_payment_invoice_en",
  PACKAGE_PAYMENT_INVOICE_AR: "package_payment_invoice_ar",
  PACKAGE_PAYMENT_INVOICE_EN: "package_payment_invoice_en",
  TEST_PAYMENT_INVOICE_AR: "test_payment_invoice_ar",
  TEST_PAYMENT_INVOICE_EN: "test_payment_invoice_en",

  // إشعارات الدفع الإضافية
  PAYMENT_RECEIPT_AR: "payment_receipt_ar",
  PAYMENT_RECEIPT_EN: "payment_receipt_en",
  PAYMENT_FAILURE_AR: "payment_failure_ar",
  PAYMENT_FAILURE_EN: "payment_failure_en",
  REFUND_NOTIFICATION_AR: "refund_notification_ar",
  REFUND_NOTIFICATION_EN: "refund_notification_en",

  // قوالب فواتير إضافية
  DISCOUNT_PAYMENT_INVOICE_AR: "discount_payment_invoice_ar",
  DISCOUNT_PAYMENT_INVOICE_EN: "discount_payment_invoice_en",
  GENERAL_PAYMENT_INVOICE_AR: "general_payment_invoice_ar",
  GENERAL_PAYMENT_INVOICE_EN: "general_payment_invoice_en",

  // قوالب تذكير الدفع
  PAYMENT_REMINDER_URGENT_AR: "payment_reminder_urgent_ar",
  PAYMENT_REMINDER_URGENT_EN: "payment_reminder_urgent_en",
  PAYMENT_REMINDER_FINAL_AR: "payment_reminder_final_ar",
  PAYMENT_REMINDER_FINAL_EN: "payment_reminder_final_en",
  PAYMENT_REMINDER_GENTLE_AR: "payment_reminder_gentle_ar",
  PAYMENT_REMINDER_GENTLE_EN: "payment_reminder_gentle_en",
};

// قوالب الدروس والحجوزات - Lessons & Bookings Templates
const LESSON_TEMPLATES = {
  // طلبات الدروس
  LESSON_REQUEST_TEACHER_AR: "lesson_request_teacher_ar",
  LESSON_REQUEST_TEACHER_EN: "lesson_request_teacher_en",
  
  // حالة حجز الدرس
  LESSON_STATUS_ADMIN_AR: "lesson_status_admin_ar",
  
  // جلسة الدرس
  LESSON_SESSION_ADMIN_AR: "lesson_session_admin_ar",
  
  // تأكيد الحجز
  BOOKING_CONFIRMATION_ADMIN_AR: "booking_confirmation_admin_ar",

  // موافقة ورفض الدروس
  LESSON_APPROVED_STUDENT_AR: "lesson_approved_student_ar",
  LESSON_APPROVED_STUDENT_EN: "lesson_approved_student_en",
  LESSON_REJECTED_STUDENT_AR: "lesson_rejected_student_ar",
  LESSON_REJECTED_STUDENT_EN: "lesson_rejected_student_en",

  // بداية ونهاية الدروس
  LESSON_STARTED_STUDENT_AR: "lesson_started_student_ar",
  LESSON_STARTED_STUDENT_EN: "lesson_started_student_en",
  LESSON_STARTED_TEACHER_AR: "lesson_started_teacher_ar",
  LESSON_STARTED_TEACHER_EN: "lesson_started_teacher_en",
  LESSON_ENDED_STUDENT_AR: "lesson_ended_student_ar",
  LESSON_ENDED_STUDENT_EN: "lesson_ended_student_en",
  LESSON_ENDED_TEACHER_AR: "lesson_ended_teacher_ar",
  LESSON_ENDED_TEACHER_EN: "lesson_ended_teacher_en",
};

// قوالب الحجوزات للمعلمين - Teacher Booking Templates
const BOOKING_TEMPLATES = {
  // إشعارات حجز الاختبارات
  TEST_BOOKING_NOTIFICATION_TEACHER_AR: "test_booking_notification_teacher_ar",
  TEST_BOOKING_NOTIFICATION_TEACHER_EN: "test_booking_notification_teacher_en",
  TEST_BOOKING_NOTIFICATION_STUDENT_AR: "test_booking_notification_student_ar",
  TEST_BOOKING_NOTIFICATION_STUDENT_EN: "test_booking_notification_student_en",

  // إشعارات حجز الباقات
  PACKAGE_BOOKING_NOTIFICATION_TEACHER_AR:
    "package_booking_notification_teacher_ar",
  PACKAGE_BOOKING_NOTIFICATION_TEACHER_EN:
    "package_booking_notification_teacher_en",
  PACKAGE_BOOKING_NOTIFICATION_STUDENT_AR:
    "package_booking_notification_student_ar",
  PACKAGE_BOOKING_NOTIFICATION_STUDENT_EN:
    "package_booking_notification_student_en",

  // إشعارات حجز المحاضرات
  LECTURE_BOOKING_NOTIFICATION_TEACHER_AR:
    "lecture_booking_notification_teacher_ar",
  LECTURE_BOOKING_NOTIFICATION_TEACHER_EN:
    "lecture_booking_notification_teacher_en",
  LECTURE_BOOKING_NOTIFICATION_STUDENT_AR:
    "lecture_booking_notification_student_ar",
  LECTURE_BOOKING_NOTIFICATION_STUDENT_EN:
    "lecture_booking_notification_student_en",

  // إشعارات حجز الخصومات
  DISCOUNT_BOOKING_NOTIFICATION_TEACHER_AR:
    "discount_booking_notification_teacher_ar",
  DISCOUNT_BOOKING_NOTIFICATION_TEACHER_EN:
    "discount_booking_notification_teacher_en",
  DISCOUNT_BOOKING_NOTIFICATION_STUDENT_AR:
    "discount_booking_notification_student_ar",
  DISCOUNT_BOOKING_NOTIFICATION_STUDENT_EN:
    "discount_booking_notification_student_en",

  // إشعارات حجز الدروس
  LESSON_BOOKING_NOTIFICATION_TEACHER_AR:
    "lesson_booking_notification_teacher_ar",
  LESSON_BOOKING_NOTIFICATION_TEACHER_EN:
    "lesson_booking_notification_teacher_en",
  LESSON_BOOKING_NOTIFICATION_STUDENT_AR:
    "lesson_booking_notification_student_ar",
  LESSON_BOOKING_NOTIFICATION_STUDENT_EN:
    "lesson_booking_notification_student_en",

  // قوالب الحجز الأساسية (للتوافق مع الكود القديم)
  TEST_BOOKING_NOTIFICATION: "test_booking_notification_teacher_ar",
  PACKAGE_BOOKING_NOTIFICATION: "package_booking_notification_teacher_ar",
  LECTURE_BOOKING_NOTIFICATION: "lecture_booking_notification_teacher_ar",
  DISCOUNT_BOOKING_NOTIFICATION: "discount_booking_notification_teacher_ar",
  LESSON_BOOKING_NOTIFICATION: "lesson_booking_notification_teacher_ar",

  // قوالب الدروس الإضافية
  LESSON_REQUEST: "lesson_request_teacher_ar",
  LESSON_APPROVED: "lesson_approved_student_ar",
  LESSON_REJECTED: "lesson_rejected_student_ar",
  LESSON_STARTED: "lesson_started_student_ar",
  LESSON_ENDED: "lesson_ended_student_ar",
};

// قوالب إشعارات الأدمن - Admin Notifications Templates
const ADMIN_TEMPLATES = {
  // === القوالب القديمة ===
  // إشعار حجز جديد
  NEW_BOOKING_NOTIFICATION_AR: "new_booking_notification_ar",
  NEW_BOOKING_NOTIFICATION_EN: "new_booking_notification_en",
  
  // إشعار دفع جديد
  NEW_PAYMENT_NOTIFICATION_AR: "new_payment_notification_ar",
  NEW_PAYMENT_NOTIFICATION_EN: "new_payment_notification_en",
  
  // إشعار شكوى جديدة
  NEW_COMPLAINT_NOTIFICATION_AR: "new_complaint_notification_ar",
  NEW_COMPLAINT_NOTIFICATION_EN: "new_complaint_notification_en",
  
  // إشعار تنبيه عام
  ADMIN_ALERT_AR: "admin_alert_ar",
  ADMIN_ALERT_EN: "admin_alert_en",
  
  // إشعار مستخدم جديد للأدمن
  NEW_USER_ADMIN_NOTIFICATION_AR: "new_user_admin_notification_ar",
  NEW_USER_ADMIN_NOTIFICATION_EN: "new_user_admin_notification_en",
  
  // === القوالب الجديدة ===
  // إشعار تأكيد دفع
  PAYMENT_CONFIRMATION_ADMIN_AR: "payment_confirmation_admin_ar",
  PAYMENT_CONFIRMATION_ADMIN_EN: "payment_confirmation_admin_en",
  
  // إشعار شحن رصيد طالب
  WALLET_CHARGE_ADMIN_AR: "wallet_charge_admin_ar",
  WALLET_CHARGE_ADMIN_EN: "wallet_charge_admin_en",
  
  // إشعار حالة حجز درس
  LESSON_STATUS_ADMIN_AR: "lesson_status_admin_ar",
  LESSON_STATUS_ADMIN_EN: "lesson_status_admin_en",
  
  // إشعار تأكيد حجز
  BOOKING_CONFIRMATION_ADMIN_AR: "booking_confirmation_admin_ar",
  BOOKING_CONFIRMATION_ADMIN_EN: "booking_confirmation_admin_en",
  
  // إشعار بدء/انتهاء درس
  LESSON_SESSION_ADMIN_AR: "lesson_session_admin_ar",
  LESSON_SESSION_ADMIN_EN: "lesson_session_admin_en",
};

// قوالب الشكاوى والمشاكل - Complaints & Issues Templates
const COMPLAINT_TEMPLATES = {
  // تقديم الشكوى
  COMPLAINT_SUBMITTED_AR: "complaint_submitted_ar",
  COMPLAINT_SUBMITTED_EN: "complaint_submitted_en",

  // رد على الشكوى
  COMPLAINT_REPLY_AR: "complaint_reply_ar",
  COMPLAINT_REPLY_EN: "complaint_reply_en",

  // إشعار الأدمن بشكوى جديدة
  NEW_COMPLAINT_ADMIN_AR: "new_complaint_admin_ar",
  NEW_COMPLAINT_ADMIN_EN: "new_complaint_admin_en",
};

// قوالب عامة وتجريبية - General & Testing Templates
const GENERAL_TEMPLATES = {
  // قوالب تجريبية
  TEMPLATE_NAME: "template_name",
  TEMPLATE_NAME_AR: "template_name_ar",
  TEMPLATE_NAME_EN: "template_name_en",
};

// تجميع جميع القوالب - All Templates Combined
const ALL_TEMPLATES = {
  ...VERIFICATION_TEMPLATES,
  ...PAYMENT_TEMPLATES,
  ...LESSON_TEMPLATES,
  ...BOOKING_TEMPLATES,
  ...COMPLAINT_TEMPLATES,
  ...ADMIN_TEMPLATES,
  ...GENERAL_TEMPLATES,
};

/**
 * دالة للحصول على اسم القالب حسب المفتاح
 * @param {string} templateKey - مفتاح القالب
 * @returns {string} اسم القالب
 */
function getTemplateName(templateKey) {
  const templateName = ALL_TEMPLATES[templateKey];
  if (!templateName) {
    console.warn(`⚠️ Template key not found: ${templateKey}`);
    throw new Error(`Template key "${templateKey}" not found in configuration`);
  }
  return templateName;
}

/**
 * دالة للحصول على قائمة بجميع أسماء القوالب
 * @returns {Object} كائن يحتوي على جميع أسماء القوالب
 */
function getAllTemplates() {
  return { ...ALL_TEMPLATES };
}

/**
 * دالة للبحث عن قالب حسب الاسم
 * @param {string} templateName - اسم القالب
 * @returns {string|null} مفتاح القالب أو null إذا لم يوجد
 */
function findTemplateKey(templateName) {
  const entries = Object.entries(ALL_TEMPLATES);
  const found = entries.find(([key, name]) => name === templateName);
  return found ? found[0] : null;
}

/**
 * دالة للحصول على قوالب حسب الفئة
 * @param {string} category - فئة القوالب (verification, payment, lesson, booking, complaint, admin)
 * @returns {Object} قوالب الفئة المحددة
 */
function getTemplatesByCategory(category) {
  const categories = {
    verification: VERIFICATION_TEMPLATES,
    payment: PAYMENT_TEMPLATES,
    lesson: LESSON_TEMPLATES,
    booking: BOOKING_TEMPLATES,
    complaint: COMPLAINT_TEMPLATES,
    admin: ADMIN_TEMPLATES,
    general: GENERAL_TEMPLATES,
  };

  return categories[category] || {};
}

/**
 * دالة للتحقق من وجود القالب
 * @param {string} templateKey - مفتاح القالب
 * @returns {boolean} true إذا كان القالب موجود
 */
function templateExists(templateKey) {
  return templateKey in ALL_TEMPLATES;
}

/**
 * دالة لإرجاع قائمة بجميع مفاتيح القوالب
 * @returns {string[]} مصفوفة بجميع مفاتيح القوالب
 */
function getAllTemplateKeys() {
  return Object.keys(ALL_TEMPLATES);
}

/**
 * دالة لإرجاع قائمة بجميع أسماء القوالب (القيم)
 * @returns {string[]} مصفوفة بجميع أسماء القوالب
 */
function getAllTemplateNames() {
  return Object.values(ALL_TEMPLATES);
}

// تصدير الوحدات
module.exports = {
  // الفئات المنفصلة
  VERIFICATION_TEMPLATES,
  PAYMENT_TEMPLATES,
  BOOKING_TEMPLATES,
  COMPLAINT_TEMPLATES,
  LESSON_TEMPLATES,
  ADMIN_TEMPLATES,
  GENERAL_TEMPLATES,

  // جميع القوالب
  ALL_TEMPLATES,

  // الدوال المساعدة
  getTemplateName,
  getAllTemplates,
  findTemplateKey,
  getTemplatesByCategory,
  templateExists,
  getAllTemplateKeys,
  getAllTemplateNames,
};
