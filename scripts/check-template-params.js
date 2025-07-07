require('dotenv').config();
const axios = require('axios');

// دالة لإنشاء رسالة واتساب باستخدام القالب
async function sendTestMessage(templateName, variables) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: process.env.ADMIN_PHONE_NUMBER, // إرسال إلى رقم الأدمن للتحقق
        type: "template",
        template: {
          name: templateName,
          language: {
            code: templateName.endsWith('_ar') ? 'ar' : 'en'
          },
          components: [
            {
              type: "body",
              parameters: variables.map(value => ({
                type: "text",
                text: value
              }))
            }
          ]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ تم إرسال الرسالة بنجاح:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ فشل إرسال الرسالة:', error.response?.data || error.message);
    throw error;
  }
}

// اختبار القوالب المختلفة
async function testTemplates() {
  try {
    console.log('🚀 بدء اختبار إرسال الرسائل...\n');
    
    // 1. اختبار قالب حجز الاختبار للمعلم
    console.log('📌 اختبار قالب حجز الاختبار للمعلم (test_booking_notification_teacher_ar)');
    try {
      await sendTestMessage(
        'test_booking_notification_teacher_ar',
        [
          'إدارة التطبيق',
          'أحمد محمد',
          'حجز اختبار قيادة',
          new Date().toLocaleString('ar-OM')
        ]
      );
    } catch (error) {
      console.log('❌ فشل اختبار قالب حجز الاختبار للمعلم');
    }
    
    console.log('\n----------------------------------------\n');
    
    // 2. اختبار قالب تأكيد الدفع
    console.log('📌 اختبار قالب تأكيد الدفع (payment_confirmation_ar)');
    try {
      await sendTestMessage(
        'payment_confirmation_ar',
        [
          'أحمد محمد',
          '15 OMR',
          'حصة قيادة',
          'INV-' + Math.floor(Math.random() * 10000)
        ]
      );
    } catch (error) {
      console.log('❌ فشل اختبار قالب تأكيد الدفع');
    }
    
    console.log('\n----------------------------------------\n');
    
    // 3. اختبار قالب تأكيد الحجز
    console.log('📌 اختبار قالب تأكيد الحجز (booking_confirmation_ar)');
    try {
      await sendTestMessage(
        'booking_confirmation_ar',
        [
          'أحمد محمد',
          'حصة قيادة',
          'السبت 15 يونيو 2025',
          '04:30 مساءً',
          '15 OMR',
          'سيارة تعليمية - تويوتا ياريس'
        ]
      );
    } catch (error) {
      console.log('❌ فشل اختبار قالب تأكيد الحجز');
    }
    
  } catch (error) {
    console.error('حدث خطأ غير متوقع:', error);
  }
}

// تشغيل الاختبار
testTemplates();
