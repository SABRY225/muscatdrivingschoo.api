const { Student, Teacher, Admin } = require("../../models");
const Invite = require("../../models/Invite");
const { sendWhatsAppTemplate } = require("../../utils/sendWhatsAppVerificationCode");
const { VERIFICATION_TEMPLATES, PAYMENT_TEMPLATES } = require("../../config/whatsapp-templates");
const Notification = require("../../models/Notification");

const addPointsForPurchase = async ({ studentId, teacherId, session }) => {
  try {
    // التحقق من وجود المعرفات
    if (!studentId || !teacherId) {
      throw new Error("معرف الطالب أو المعلم غير صالح");
    }

    const [student, teacher] = await Promise.all([
      Student.findByPk(studentId),
      Teacher.findByPk(teacherId)
    ]);

    if (!student || !teacher) {
      throw new Error("لم يتم العثور على الطالب أو المعلم");
    }

    // دالة مساعدة لإضافة أو تحديث سجل الدعوة
    const upsertInvitePoints = async (user, userType) => {
      try {
        const isStudent = userType === 'student';
        const pointsToAdd = 3;
        
        // البحث عن سجل الدعوة الحالي
        const existingInvite = await Invite.findOne({ where: { userId: user.id } });
        let totalPoints;
        
        // تحديث أو إنشاء سجل النقاط
        if (existingInvite) {
          existingInvite.amountPoints = parseInt(existingInvite.amountPoints || 0, 10) + pointsToAdd;
          await existingInvite.save();
          totalPoints = existingInvite.amountPoints;
        } else {
          const newInvite = await Invite.create({
            userId: user.id,
            amountPoints: pointsToAdd,
            link: '',
          });
          totalPoints = newInvite.amountPoints;
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

        // إرسال رسالة واتساب إذا كان رقم الهاتف متوفراً
        const phone = isStudent ? user.phoneNumber : user.phone;
        if (phone) {
          try {
            const templateName = user.language === "ar" 
              ? VERIFICATION_TEMPLATES.POINTS_ADDED_AR 
              : VERIFICATION_TEMPLATES.POINTS_ADDED_EN;
              
            await sendWhatsAppTemplate({
              to: phone.startsWith('+') ? phone : `+${phone}`,
              templateName,
              variables: [
                // {{1}} - اسم المستلم
                isStudent ? (user.name || 'عميلنا العزيز') : (user.firstName || 'المعلم'),
                // {{2}} - عدد النقاط المضافة
                pointsToAdd.toString(),
                // {{3}} - إجمالي النقاط
                totalPoints.toString()
              ],
              language: user.language === "ar" ? "ar" : "en_US",
              recipientName: isStudent ? (user.name || 'عميلنا العزيز') : (user.firstName || 'المعلم'),
              messageType: "points_update",
              fallbackToEnglish: true,
            });
          } catch (error) {
            console.error(`فشل إرسال إشعار الواتساب إلى ${userType}:`, error);
            // تسجيل الخطأ في سجل الأخطاء
            await Notification.create({
              userId: user.id,
              userType: isStudent ? 'student' : 'teacher',
              title: isStudent ? "تنبيه" : "Alert",
              messageAr: `تعذر إرسال إشعار النقاط عبر الواتساب`,
              messageEn: `Failed to send points notification via WhatsApp`,
              type: "system_alert",
            });
          }
        }

        return totalPoints;
      } catch (error) {
        console.error(`خطأ في تحديث نقاط ${userType}:`, error);
        throw error;
      }
    };

    // تحديث النقاط وإرسال الإشعارات للطالب والمعلم
    const [studentPoints, teacherPoints] = await Promise.all([
      upsertInvitePoints(student, 'student'),
      upsertInvitePoints(teacher, 'teacher')
    ]);

    // إرسال إشعار للمشرفين
    try {
      const admins = await Admin.findAll({
        where: { isActive: true },
        attributes: ['phone', 'name']
      });

      for (const admin of admins) {
        if (admin.phone) {
          await sendWhatsAppTemplate({
            to: admin.phone.startsWith('+') ? admin.phone : `+${admin.phone}`,
            templateName: PAYMENT_TEMPLATES.WALLET_CHARGE_ADMIN_AR,
            variables: [
              student.name || 'طالب',
              teacher ? `${teacher.firstName} ${teacher.lastName}` : 'معلم',
              '3', // عدد النقاط المضافة
              studentPoints.toString() // إجمالي النقاط
            ],
            language: 'ar',
            recipientName: admin.name || 'مدير النظام',
            messageType: 'points_update_admin',
            fallbackToEnglish: false
          });
        }
      }
    } catch (error) {
      console.error('خطأ في إرسال إشعار النقاط للمشرفين:', error);
      // لا نوقف العملية في حالة فشل إرسال الإشعار للمشرفين
    }

    return {
      studentPoints: studentPoints || 0,
      teacherPoints: teacherPoints || 0,
    };
  } catch (error) {
    console.error('خطأ في إضافة النقاط:', error);
    throw new Error(`فشل في تحديث النقاط: ${error.message}`);
  }
};

module.exports = {
  addPointsForPurchase,
};
