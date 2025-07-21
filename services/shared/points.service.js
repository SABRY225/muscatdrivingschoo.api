const { Student, Teacher } = require("../../models");
const Invite = require("../../models/Invite");
const { sendWhatsAppTemplate } = require("../../utils/sendWhatsAppVerificationCode");
const { VERIFICATION_TEMPLATES } = require("../../config/whatsapp-templates");
const Notification = require("../../models/Notification");

const addPointsForPurchase = async ({ studentId, teacherId }) => {
  const student = await Student.findByPk(studentId);
  const teacher = await Teacher.findByPk(teacherId);

  if (!student || !teacher) {
    throw new Error("Student or Teacher not found");
  }


  // Helper function to add or update invite record
  const upsertInvitePoints = async (user,userType) => {
    const isStudent = userType === 'student';
    const pointsToAdd = 3;
    const existingInvite = await Invite.findOne({ where: { userId: user.id } });
    let totalPoints;
    if (existingInvite) {
      existingInvite.amountPoints = +existingInvite.amountPoints + pointsToAdd;
      await existingInvite.save();
      totalPoints = existingInvite.amountPoints;
    } else {
      await Invite.create({
        userId: user.id,
        amountPoints: pointsToAdd,
        link: '', // اجعلها نص فارغ وليس null
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
