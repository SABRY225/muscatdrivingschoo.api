const Notification = require("../../models/Notification");

const sendNotification = async (titleAR, titleEn, userId,type,userType) => {
  await Notification.create({
    messageAr:titleAR,
    messageEn:titleEn,
    userId,
    type,
    userType
  });
};

const sendBookingNotification = async ({
  type,
  student,
  teacher,
  adminId
}) => {
  const now = Date.now();

  const types = {
    test_booking: {
      ar: "قام الطالب بحجز اختبار",
      en: "Student has booked a test"
    },
    package_booking: {
      ar: "قام الطالب بحجز باقة",
      en: "Student has booked a package"
    },
    lecture_booking: {
      ar: "قام الطالب بحجز محاضرة",
      en: "Student has booked a lecture"
    },
    discount_booking: {
      ar: "قام الطالب بالحجز خصم",
      en: "Student booked with discount"
    },
    lesson_booking: {
      ar: "قام الطالب بحجز جلسة تعليم",
      en: "Student has booked a driving session"
    }
  };

  const msg = types[type];
  if (!msg) return; // في حالة النوع غير معرف

  // 💬 إشعار للطالب
  await Notification.create({
    messageAr: msg.ar,
    messageEn: msg.en,
    userId: student.id,
    type:"student",
    userType:"payment_success"
  });

  // 💬 إشعار للمعلم
  if (teacher?.id) {
    await Notification.create({
      messageAr: `${msg.ar} من ${student.name}`,
      messageEn: `${msg.en} by ${student.name}`,
      userId: teacher.id,
      type:"teacher",
      userType:"payment_success"
    });
  }

  // 💬 إشعار للأدمن
  if (adminId) {
    await Notification.create({
      messageAr: `${msg.ar} من الطالب ${student.name}`,
      messageEn: `${msg.en} by student ${student.name}`,
      userId: adminId,
      type:"admin",
      userType:"payment_success"
    });
  }
};
module.exports = {
  sendNotification,
  sendBookingNotification
};
