const axios = require('axios');
const WhatsappMessage = require('../models/WhatsappMessage'); // تأكد من وجوده
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

/**
 * Send WhatsApp Template Message and log it to DB via Sequelize
 * @param {Object} options
 * @param {string} options.to - رقم الهاتف
 * @param {string} options.templateName - اسم القالب
 * @param {string[]} [options.variables] - المتغيرات التي ستظهر في نص الرسالة
 * @param {string} [options.language] - لغة القالب (افتراضي en_US)
 * @param {string} [options.recipientName] - اسم المستلم (افتراضي "unknown")
 */
async function sendWhatsAppTemplate({
  to,
  templateName,
  variables = [],
  language = "en_US",
  recipientName = "غير معروف"
}) {
  if (!TOKEN || !PHONE_NUMBER_ID) {
    console.error("❌ Missing WhatsApp credentials in environment variables!");
    return;
  }

  const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;

  // إعداد مكون body فقط إذا كانت هناك متغيرات
  const template = {
    name: templateName,
    language: { code: language }
  };

  if (variables.length > 0) {
    template.components = [
      {
        type: "body",
        parameters: variables.map(text => ({ type: "text", text }))
      }
    ];
  }

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template
  };

  try {
    const res = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("✅ WhatsApp message sent successfully:", res.data);

    // 📝 سجل الرسالة باستخدام Sequelize
    await WhatsappMessage.create({
      template_name: templateName,
      phone_number: to,
      recipient_name: recipientName,
      sent_at: new Date()
    });

    console.log("✅ تم حفظ الرسالة في قاعدة البيانات");

  } catch (error) {
    if (error.response) {
      console.error("❌ WhatsApp API Error:", error.response.data);
    } else {
      console.error("❌ Failed to send WhatsApp message:", error.message);
    }
  }
}

module.exports = { sendWhatsAppTemplate };
