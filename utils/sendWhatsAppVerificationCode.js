const axios = require('axios');

const WhatsappMessage = require('../models/WhatsappMessage');



const token = process.env.WHATSAPP_TOKEN; // من الأفضل تخزين التوكن في .env

const phoneNumberId = process.env.WHATSAPP_PHONE_ID || 677659998761159;



const sendWhatsAppVerificationCode = async (

  phoneNumber,

  code,

  recipientName = 'unknown',

  language = 'en_US'

) => {

  try {

    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;



    const templateName = language === 'ar' ? 'verify_code_ar' : 'verify_code';

    const langCode = language === 'ar' ? 'ar' : 'en_US';



    const payload = {

      messaging_product: "whatsapp",

      to: phoneNumber,

      type: "template",

      template: {

        name: templateName,

        language: { code: langCode },

        components: [

          {

            type: "body",

            parameters: [{ type: "text", text: code }]

          },

          {

            type: "button",

            sub_type: "url",

            index: "0",

            parameters: [{ type: "payload", payload: code }]

          }

        ]

      }

    };



    const headers = {

      Authorization: `Bearer ${token}`,

      "Content-Type": "application/json",

    };



    const response = await axios.post(url, payload, {

      headers,

      timeout: 3000, // تأكد من إضافة timeout

    });



    console.log("✅ WhatsApp verify code message sent:", response.data);



    // سجل الرسالة في قاعدة البيانات لو بتحب

    await WhatsappMessage.create({

      phone: phoneNumber,

      code,

      status: 'sent',

      lang: langCode,

      sentAt: new Date()

    });



    return response.data;

  } catch (error) {

    console.error("❌ فشل إرسال رسالة واتساب:", error.response?.data || error.message);

    throw new Error("WhatsApp message failed to send"); // مهم ترمي الخطأ علشان تقدر تتعامل معاه في الدالة الأساسية

  }

};



module.exports = sendWhatsAppVerificationCode;

