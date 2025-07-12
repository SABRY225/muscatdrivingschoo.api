require('dotenv').config();
const { 
  sendAdminWhatsApp 
} = require('../utils/adminWhatsapp');
const { 
  BOOKING_TEMPLATES,
  PAYMENT_TEMPLATES,
  COMPLAINT_TEMPLATES
} = require('../config/whatsapp-templates');

async function testAdminNotifications() {
  try {
    console.log('🚀 بدء اختبار إشعارات الأدمن...');
    
    // اختبار إشعار حجز جديد باستخدام قالب حجز الاختبار للمعلم (3 متغيرات فقط)
    console.log('\n📅 اختبار إشعار حجز جديد...');
    await sendAdminWhatsApp({
      templateName: 'test_booking_notification_teacher_ar',
      variables: [
        'أحمد محمد',
        'حجز حصة قيادة',
        new Date().toLocaleString('ar-OM')
      ],
      messageType: 'booking_notification'
    });

    // انتظار ثانية بين الإشعارات
    await new Promise(resolve => setTimeout(resolve, 1000));

    // اختبار إشعار دفع جديد (تم التأكد من عمله)
    console.log('\n💰 اختبار إشعار دفع جديد...');
    await sendAdminWhatsApp({
      templateName: 'payment_confirmation_ar',
      variables: [
        'أحمد محمد',
        '15 OMR',
        'حصة قيادة',
        'INV-' + Math.floor(Math.random() * 10000)
      ],
      messageType: 'payment_confirmation'
    });

    // انتظار ثانية بين الإشعارات
    await new Promise(resolve => setTimeout(resolve, 1000));

    // اختبار إشعار شكوى جديدة باستخدام قالب تأكيد الدفع كبديل
    console.log('\n📝 اختبار إشعار شكوى جديدة...');
    await sendAdminWhatsApp({
      templateName: 'payment_confirmation_ar',
      variables: [
        'إشعار شكوى',
        'مشكلة تقنية',
        'تم تقديم شكوى جديدة من أحمد محمد',
        new Date().toLocaleString('ar-OM')
      ],
      messageType: 'complaint_submitted'
    });

    console.log('\n🏁 تم إكمال جميع اختبارات الإشعارات بنجاح!');
  } catch (error) {
    console.error('❌ حدث خطأ أثناء اختبار الإشعارات:', error);
  }
}

// تشغيل الاختبار
testAdminNotifications();
