const { Student, Teacher, Notification } = require("../../models");
const Invite = require("../../models/Invite");
const { sendWhatsAppTemplate } = require("../../utils/sendWhatsAppVerificationCode");
const { VERIFICATION_TEMPLATES } = require("../../config/whatsapp-templates");
<<<<<<< HEAD
=======
const Notification = require("../../models/Notification");
>>>>>>> master

const addPointsForPurchase = async ({ studentId, teacherId }) => {
  const student = await Student.findByPk(studentId);
  const teacher = await Teacher.findByPk(teacherId);

  if (!student || !teacher) {
    throw new Error("Student or Teacher not found");
  }

<<<<<<< HEAD
  // Helper function to add or update invite record and send notification
  const upsertInvitePoints = async (user, userType) => {
    const isStudent = userType === 'student';
    const existingInvite = await Invite.findOne({ where: { userId: user.id } });
    const pointsToAdd = 3;
    
    if (existingInvite) {
      existingInvite.amountPoints += pointsToAdd;
=======

  // Helper function to add or update invite record
  const upsertInvitePoints = async (user,userType) => {
    const isStudent = userType === 'student';
    const pointsToAdd = 3;
    const existingInvite = await Invite.findOne({ where: { userId: user.id } });
    let totalPoints;
    if (existingInvite) {
      existingInvite.amountPoints = +existingInvite.amountPoints + pointsToAdd;
>>>>>>> master
      await existingInvite.save();
      totalPoints = existingInvite.amountPoints;
    } else {
      await Invite.create({
        userId: user.id,
        amountPoints: pointsToAdd,
<<<<<<< HEAD
        link: '',
=======
        link: '', // اجعلها نص فارغ وليس null
>>>>>>> master
      });
      totalPoints = pointsToAdd;
    }
    // إرسال إشعار في التطبيق
    await Notification.create({
      userId: user.id,
      userType: isStudent ? 'student' : 'teacher',
      title: isStudent ? "تم إضافة نقاط جديدة" : "New Points Added",
      messageAr: `تمت إضافة ${pointsToAdd} نقاط لحسابك. النقاط الإجمالية: ${totalPoints}`,
      messageEn: `${pointsToAdd} points have been added to your account. Total points: ${totalPoints}`,
      type: "points_update",
    });

    // إرسال رسالة واتساب
    try {
      const templateName = user.language === "ar" 
        ? VERIFICATION_TEMPLATES.POINTS_ADDED_AR 
        : VERIFICATION_TEMPLATES.POINTS_ADDED_EN;
      let phone = isStudent ? user.phoneNumber : user.phone;
      await sendWhatsAppTemplate({
        to: phone.startsWith('+') ? phone : `+${phone}`,
        templateName,
        variables: [
          isStudent ? user.name : user.firstName,
          pointsToAdd.toString(),
          totalPoints.toString()
        ],
        language: user.language === "ar" ? "ar" : "en_US",
        recipientName: isStudent ? user.name : user.firstName,
        messageType: "points_update",
        fallbackToEnglish: true,
      });
    } catch (error) {
      console.error(`Error sending WhatsApp to ${userType}:`, error);
      // لا نوقف العملية في حالة فشل إرسال الرسالة
    }

    // إرسال إشعار في التطبيق
    await Notification.create({
      userId: user.id,
      userType: isStudent ? 'student' : 'teacher',
      title: isStudent ? "تم إضافة نقاط جديدة" : "New Points Added",
      messageAr: `تمت إضافة ${pointsToAdd} نقاط لحسابك. النقاط الإجمالية: ${(existingInvite?.amountPoints || 0) + pointsToAdd}`,
      messageEn: `${pointsToAdd} points have been added to your account. Total points: ${(existingInvite?.amountPoints || 0) + pointsToAdd}`,
      type: "points_update",
    });

    // إرسال رسالة واتساب
    try {
      const templateName = user.language === "ar" 
        ? VERIFICATION_TEMPLATES.POINTS_ADDED_AR 
        : VERIFICATION_TEMPLATES.POINTS_ADDED_EN;

      await sendWhatsAppTemplate({
        to: user.phone.startsWith('+') ? user.phone : `+${user.phone}`,
        templateName,
        variables: [
          user.name || (isStudent ? "طالبنا العزيز" : "معلمنا الفاضل"),
          pointsToAdd.toString(),
          ((existingInvite?.amountPoints || 0) + pointsToAdd).toString()
        ],
        language: user.language === "ar" ? "ar" : "en_US",
        recipientName: user.name || (isStudent ? "الطالب" : "المعلم"),
        messageType: "points_update",
        fallbackToEnglish: true,
      });
    } catch (error) {
      console.error(`Error sending WhatsApp to ${userType}:`, error);
      // لا نوقف العملية في حالة فشل إرسال الرسالة
    }
  };

  // Update points and send notifications for both student and teacher
  await Promise.all([
    upsertInvitePoints(student, 'student'),
    upsertInvitePoints(teacher, 'teacher')
  ]);

  return {
    studentPoints: (await Invite.findOne({ where: { userId: studentId } }))?.amountPoints || 0,
    teacherPoints: (await Invite.findOne({ where: { userId: teacherId } }))?.amountPoints || 0,
  };
};

module.exports = {
  addPointsForPurchase,
};