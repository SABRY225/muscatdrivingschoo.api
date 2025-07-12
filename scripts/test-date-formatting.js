require('dotenv').config();
const { sendWhatsAppTemplate, formatArabicDateTime } = require('../utils/whatsapp');
const { sendInvoiceWhatsApp } = require('../utils/invoiceWhatsApp');
const { PAYMENT_TEMPLATES } = require('../config/whatsapp-templates');

// رقم الهاتف الافتراضي للاختبار (يجب استبداله برقم حقيقي)
const TEST_PHONE_NUMBER = process.env.TEST_PHONE_NUMBER || '1234567890';

// دالة مساعدة لتأخير التنفيذ
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// رسائل اختبارية تحتوي على تواريخ
const testMessages = [
  {
    type: 'invoice',
    name: 'اختبار فاتورة شحن رصيد',
    data: {
      to: TEST_PHONE_NUMBER,
      customerName: 'عميل تجريبي',
      invoiceNumber: 'WALLET-' + Math.floor(Math.random() * 10000),
      totalAmount: 25.5,
      currency: 'OMR',
      paymentMethod: 'wallet',
      language: 'ar',
      invoiceType: 'wallet_charge'
    }
  },
  {
    type: 'invoice',
    name: 'اختبار فاتورة حجز حصة',
    data: {
      to: TEST_PHONE_NUMBER,
      customerName: 'طالب تجريبي',
      invoiceNumber: 'LESSON-' + Math.floor(Math.random() * 10000),
      totalAmount: 15.0,
      currency: 'OMR',
      paymentMethod: 'wallet',
      language: 'ar',
      invoiceType: 'lesson',
      items: [
        { name: 'حصة قيادة', price: 15.0, quantity: 1 }
      ],
      sessionDetails: {
        lessonType: 'قيادة نهارية',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // بعد يومين من الآن
        time: '02:00 م',
        instructorName: 'أحمد محمد',
        location: 'فرع القرم - مسقط'
      }
    }
  }
];

async function runTests() {
  console.log('🚀 بدء اختبار إرسال الرسائل...');
  
  for (const [index, test] of testMessages.entries()) {
    try {
      console.log(`\n📤 اختبار ${index + 1}: ${test.name}`);
      
      if (test.type === 'invoice') {
        console.log('🧾 إرسال فاتورة واتساب...');
        console.log('بيانات الفاتورة:', JSON.stringify(test.data, null, 2));
        
        const result = await sendInvoiceWhatsApp(test.data);
        console.log('✅ تم إرسال الفاتورة بنجاح');
      }
      
      // انتظار ثانيتين قبل الرسالة التالية
      if (index < testMessages.length - 1) {
        await delay(2000);
      }
      
    } catch (error) {
      console.error(`❌ خطأ في الاختبار ${index + 1}:`, error.message);
      console.error('تفاصيل الخطأ:', error.response?.data || error.stack);
    }
  }
  
  console.log('\n🏁 تم الانتهاء من جميع الاختبارات');
}

// تشغيل الاختبارات
runTests().catch(console.error);
