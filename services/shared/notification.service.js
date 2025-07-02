const Notification = require("../../models/Notification");
const { sendWhatsAppTemplate } = require("../../utils/whatsapp");
const {
  BOOKING_TEMPLATES,
  LESSON_TEMPLATES,
} = require("../../config/whatsapp-templates");

const sendNotification = async (titleAR, titleEn, userId, type, userType) => {
  await Notification.create({
    messageAr: titleAR,
    messageEn: titleEn,
    userId,
    type,
    userType,
  });
};

const sendBookingNotification = async ({ type, student, teacher, adminId, language }) => {
  const now = Date.now();

  const types = {
    test_booking: {
      ar: "قام الطالب بحجز اختبار",
      en: "Student has booked a test",
      whatsappTemplate: BOOKING_TEMPLATES.TEST_BOOKING_NOTIFICATION,
    },
    package_booking: {
      ar: "قام الطالب بحجز باقة",
      en: "Student has booked a package",
      whatsappTemplate: BOOKING_TEMPLATES.PACKAGE_BOOKING_NOTIFICATION,
    },
    lecture_booking: {
      ar: "قام الطالب بحجز محاضرة",
      en: "Student has booked a lecture",
      whatsappTemplate: BOOKING_TEMPLATES.LECTURE_BOOKING_NOTIFICATION,
    },
    discount_booking: {
      ar: "قام الطالب بالحجز خصم",
      en: "Student booked with discount",
      whatsappTemplate: BOOKING_TEMPLATES.DISCOUNT_BOOKING_NOTIFICATION,
    },
    lesson_booking: {
      ar: "قام الطالب بحجز جلسة تعليم",
      en: "Student has booked a driving session",
      whatsappTemplate: BOOKING_TEMPLATES.LESSON_BOOKING_NOTIFICATION,
    },
  };

  const msg = types[type];
  if (!msg) return; // في حالة النوع غير معرف

  // 💬 إشعار للطالب
  await Notification.create({
    messageAr: msg.ar,
    messageEn: msg.en,
    userId: student.id,
    type: "student",
    userType: "payment_success",
  });

  // 📱 إرسال رسالة واتساب للطالب
  try {
    const studentTemplateName =
      language === "ar"
        ? `${msg.whatsappTemplate}`
        : `${msg.whatsappTemplate}`;

    await sendWhatsAppTemplate({
      to: student.phoneNumber,
      templateName: studentTemplateName,
      variables: [student.name || "الطالب" , type.replace("_", " ")],
      language: studentTemplateName.includes("_ar") ? "ar" : "en_US",
      recipientName: student.name,
      messageType: "booking_confirmation",
    });
  } catch (whatsappError) {
    console.error(
      `❌ فشل إرسال رسالة واتساب للطالب ${student.name}:`,
      whatsappError.message,
    );
  }

  // 💬 إشعار للمعلم
  if (teacher?.id) {
    await Notification.create({
      messageAr: `${msg.ar} من ${student.name}`,
      messageEn: `${msg.en} by ${student.name}`,
      userId: teacher.id,
      type: "teacher",
      userType: "payment_success",
    });

    // 📱 إرسال رسالة واتساب للمعلم
    try {
      const teacherTemplateName =
        language === "ar"
          ? `${msg.whatsappTemplate}`
          : `${msg.whatsappTemplate}`;

      await sendWhatsAppTemplate({
        to: teacher.phone,
        templateName: teacherTemplateName,
        variables: [teacher.name || "المعلم", student.name || "الطالب", type.replace("_", " ")],
        language: teacherTemplateName.includes("_ar") ? "ar" : "en_US",
        recipientName: teacher.name,
        messageType: "booking_notification",
      });
    } catch (whatsappError) {
      console.error(
        `❌ فشل إرسال رسالة واتساب للمعلم ${teacher.name}:`,
        whatsappError.message,
      );
    }
  }

  // 💬 إشعار للأدمن
  if (adminId) {
    await Notification.create({
      messageAr: `${msg.ar} من الطالب ${student.name}`,
      messageEn: `${msg.en} by student ${student.name}`,
      userId: adminId,
      type: "admin",
      userType: "payment_success",
    });
  }
};

// دالة لإرسال إشعارات الدروس (الحجز، الموافقة، الرفض، البداية، النهاية)
const sendLessonNotification = async ({
  type, // lesson_request, lesson_approved, lesson_rejected, lesson_started, lesson_ended
  student,
  teacher,
  adminId,
  language = "ar", // اللغة من الطلب
  lessonDetails = {},
}) => {
  const notificationTypes = {
    lesson_request: {
      ar: "طلب حجز درس جديد",
      en: "New lesson booking request",
    },
    lesson_approved: {
      ar: "تم قبول طلب الدرس",
      en: "Lesson request approved",
    },
    lesson_rejected: {
      ar: "تم رفض طلب الدرس",
      en: "Lesson request rejected",
    },
    lesson_started: {
      ar: "بدأ الدرس",
      en: "Lesson started",
    },
    lesson_ended: {
      ar: "انتهى الدرس",
      en: "Lesson ended",
    },
  };

  const msg = notificationTypes[type];
  if (!msg) return;

  // إشعار للطالب
  if (student?.id) {
    await Notification.create({
      messageAr: msg.ar,
      messageEn: msg.en,
      userId: student.id,
      type: "student",
      userType: type,
    });

    // رسالة واتساب للطالب
    try {
      let templateName;

      // تحديد القالب المناسب للطالب حسب نوع الإشعار واللغة
      switch (type) {
        case "lesson_request":
          // طلب الدرس لا يرسل للطالب، فقط للمعلم
          break;
        case "lesson_approved":
          templateName =
            language === "ar"
              ? LESSON_TEMPLATES.LESSON_APPROVED_STUDENT_AR
              : LESSON_TEMPLATES.LESSON_APPROVED_STUDENT_EN;
          break;
        case "lesson_rejected":
          templateName =
            language === "ar"
              ? LESSON_TEMPLATES.LESSON_REJECTED_STUDENT_AR
              : LESSON_TEMPLATES.LESSON_REJECTED_STUDENT_EN;
          break;
        case "lesson_started":
          templateName =
            language === "ar"
              ? LESSON_TEMPLATES.LESSON_STARTED_STUDENT_AR
              : LESSON_TEMPLATES.LESSON_STARTED_STUDENT_EN;
          break;
        case "lesson_ended":
          templateName =
            language === "ar"
              ? LESSON_TEMPLATES.LESSON_ENDED_STUDENT_AR
              : LESSON_TEMPLATES.LESSON_ENDED_STUDENT_EN;
          break;
      }

      if (templateName) {
        await sendWhatsAppTemplate({
          to: student.phoneNumber,
          templateName,
          variables: [
            student.name || "الطالب",
            teacher?.name || "المعلم",
            lessonDetails.date || new Date().toLocaleDateString("ar-EG"),
            lessonDetails.time || new Date().toLocaleTimeString("ar-EG"),
          ],
          language: templateName.includes("_ar") ? "ar" : "en_US",
          recipientName: student.name || "الطالب",
          messageType: type,
        });
      }
    } catch (whatsappError) {
      console.error(
        `❌ فشل إرسال رسالة واتساب للطالب في ${type}:`,
        whatsappError.message,
      );
    }
  }

  // إشعار للمعلم
  if (teacher?.id) {
    await Notification.create({
      messageAr: `${msg.ar} - ${student?.name || "طالب"}`,
      messageEn: `${msg.en} - ${student?.name || "Student"}`,
      userId: teacher.id,
      type: "teacher",
      userType: type,
    });

    // رسالة واتساب للمعلم
    try {
      let templateName;

      // تحديد القالب المناسب للمعلم حسب نوع الإشعار واللغة
      switch (type) {
        case "lesson_request":
          templateName =
            language === "ar"
              ? LESSON_TEMPLATES.LESSON_REQUEST_TEACHER_AR
              : LESSON_TEMPLATES.LESSON_REQUEST_TEACHER_EN;
          break;
        case "lesson_approved":
          // موافقة الدرس لا ترسل للمعلم، فقط للطالب
          break;
        case "lesson_rejected":
          // رفض الدرس لا يرسل للمعلم، فقط للطالب
          break;
        case "lesson_started":
          templateName =
            language === "ar"
              ? LESSON_TEMPLATES.LESSON_STARTED_TEACHER_AR
              : LESSON_TEMPLATES.LESSON_STARTED_TEACHER_EN;
          break;
        case "lesson_ended":
          templateName =
            language === "ar"
              ? LESSON_TEMPLATES.LESSON_ENDED_TEACHER_AR
              : LESSON_TEMPLATES.LESSON_ENDED_TEACHER_EN;
          break;
      }

      if (templateName) {
        await sendWhatsAppTemplate({
          to: teacher.phone,
          templateName,
          variables: [
            teacher.name || "المعلم",
            student?.name || "الطالب",
            lessonDetails.date || new Date().toLocaleDateString("ar-EG"),
            lessonDetails.time || new Date().toLocaleTimeString("ar-EG"),
          ],
          language: templateName.includes("_ar") ? "ar" : "en_US",
          recipientName: teacher.name || "المعلم",
          messageType: type,
        });
      }
    } catch (whatsappError) {
      console.error(
        `❌ فشل إرسال رسالة واتساب للمعلم في ${type}:`,
        whatsappError.message,
      );
    }
  }

  // إشعار للأدمن
  if (adminId) {
    await Notification.create({
      messageAr: `${msg.ar} - الطالب: ${student?.name || "غير محدد"} - المعلم: ${teacher?.name || "غير محدد"}`,
      messageEn: `${msg.en} - Student: ${student?.name || "Unknown"} - Teacher: ${teacher?.name || "Unknown"}`,
      userId: adminId,
      type: "admin",
      userType: type,
    });
  }
};

// دالة لإرسال إشعارات عامة (انضمام مستخدم جديد، شكوى، رد على شكوى)
const sendGeneralNotification = async ({
  type, // new_user_joined, complaint_received, complaint_reply
  user,
  adminId,
  details = {},
}) => {
  const notificationTypes = {
    new_user_joined: {
      ar: "انضمام مستخدم جديد",
      en: "New user joined",
      whatsappTemplate: "new_user_joined",
    },
    complaint_received: {
      ar: "شكوى جديدة",
      en: "New complaint received",
      whatsappTemplate: "complaint_received",
    },
    complaint_reply: {
      ar: "رد على الشكوى",
      en: "Complaint reply",
      whatsappTemplate: "complaint_reply",
    },
  };

  const msg = notificationTypes[type];
  if (!msg) return;

  // إشعار للمستخدم (في حالة الرد على الشكوى)
  if (type === "complaint_reply" && user?.id) {
    await Notification.create({
      messageAr: msg.ar,
      messageEn: msg.en,
      userId: user.id,
      type: user.userType || "student",
      userType: type,
    });

    // رسالة واتساب للمستخدم
    try {
      const templateName =
        language === "ar"
          ? `${msg.whatsappTemplate}_ar`
          : `${msg.whatsappTemplate}_en`;

      await sendWhatsAppTemplate({
        to: user.phoneNumber || user.phone,
        templateName,
        variables: [user.name, details.replyMessage || "تم الرد على شكواك"],
        language: templateName.includes("_ar") ? "ar" : "en_US",
        recipientName: user.name,
        messageType: type,
      });
    } catch (whatsappError) {
      console.error(
        `❌ فشل إرسال رسالة واتساب للمستخدم في ${type}:`,
        whatsappError.message,
      );
    }
  }

  // إشعار للأدمن بانضمام مستخدم جديد
  if (type === "new_user_joined" && adminId && user?.id) {
    await Notification.create({
      messageAr: `${msg.ar} - ${user?.name || "مستخدم جديد"} (${user.userType || "طالب"})`,
      messageEn: `${msg.en} - ${user?.name || "New User"} (${user.userType || "student"})`,
      userId: adminId,
      type: "admin",
      userType: type,
    });

    // إرسال رسالة واتساب للأدمن عن المستخدم الجديد
    try {
      const templateName = "new_user_admin_notification_ar";
      await sendWhatsAppTemplate({
        to: process.env.ADMIN_WHATSAPP_NUMBER || "+96871234567",
        templateName,
        variables: [
          user?.name || "مستخدم جديد",
          user.userType === "teacher" ? "معلم" : "طالب",
          user.email || "غير محدد",
          user.phoneNumber || user.phone || "غير محدد",
        ],
        language: "ar",
        recipientName: "الإدارة",
        messageType: "new_user_notification",
      });
      console.log("✅ WhatsApp new user notification sent to admin");
    } catch (whatsappError) {
      console.error(
        "❌ Failed to send WhatsApp new user notification to admin:",
        whatsappError.message,
      );
    }
  }

  // إشعار للأدمن بالشكاوى
  if (type === "complaint_received" && adminId) {
    await Notification.create({
      messageAr: `${msg.ar} - ${user?.name || "مستخدم"}`,
      messageEn: `${msg.en} - ${user?.name || "User"}`,
      userId: adminId,
      type: "admin",
      userType: type,
    });

    // إرسال رسالة واتساب للأدمن عن الشكوى الجديدة
    try {
      const templateName = "new_complaint_admin_ar";
      await sendWhatsAppTemplate({
        to: process.env.ADMIN_WHATSAPP_NUMBER || "+96871234567",
        templateName,
        variables: [
          user?.name || "مستخدم",
          details.complaintTitle || "شكوى جديدة",
          details.category || "عام",
          details.complaintId || "غير محدد",
        ],
        language: "ar",
        recipientName: "الإدارة",
        messageType: "complaint_notification",
      });
      console.log("✅ WhatsApp complaint notification sent to admin");
    } catch (whatsappError) {
      console.error(
        "❌ Failed to send WhatsApp complaint notification to admin:",
        whatsappError.message,
      );
    }
  }
};
module.exports = {
  sendNotification,
  sendBookingNotification,
  sendLessonNotification,
  sendGeneralNotification,
};
