const axios = require("axios");
const WhatsappMessage = require("../models/WhatsappMessage"); // تأكد من وجوده
const {
  getTemplateName,
  templateExists,
  ALL_TEMPLATES,
} = require("../config/whatsapp-templates");
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

/**
 * فحص الأخطاء المتعلقة بعدد المعاملات
 */
function isParameterMismatchError(error) {
  if (!error.response?.data?.error) return false;

  const errorData = error.response.data.error;
  return (
    errorData.code === 132000 ||
    errorData.message?.includes("Number of parameters does not match") ||
    errorData.error_data?.details?.includes("number of localizable_params")
  );
}

/**
 * فحص الأخطاء المتعلقة بعدم وجود القالب
 */
function isTemplateNotFoundError(error) {
  if (!error.response?.data?.error) return false;

  const errorData = error.response.data.error;
  return (
    errorData.code === 132001 ||
    errorData.message?.includes("Template name does not exist") ||
    errorData.message?.includes("template not found")
  );
}

/**
 * الحصول على المكافئ الإنجليزي للقالب العربي
 */
function getEnglishEquivalent(arabicTemplateName) {
  if (arabicTemplateName.endsWith("_ar")) {
    return arabicTemplateName.replace("_ar", "_en");
  }
  if (arabicTemplateName.includes("_student_ar")) {
    return arabicTemplateName.replace("_student_ar", "_student_en");
  }
  if (arabicTemplateName.includes("_teacher_ar")) {
    return arabicTemplateName.replace("_teacher_ar", "_teacher_en");
  }
  const specialMappings = {
    verify_code_1: "verify_code_en",
    welcome_student_ar: "welcome_student_en",
    // ... أضف المزيد إذا لزم الأمر
  };
  return specialMappings[arabicTemplateName] || arabicTemplateName;
}

/**
 * إرسال رسالة قالب واتساب وتسجيلها في قاعدة البيانات
 */
async function sendWhatsAppTemplate({
  to,
  templateName,
  variables = [],
  language = "en_US",
  recipientName = "غير معروف",
  messageType = "general",
  fallbackToEnglish = true,
}) {
  if (!TOKEN || !PHONE_NUMBER_ID) {
    console.error("❌ Missing WhatsApp credentials in environment variables!");
    return;
  }
  const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;

  const template = {
    name: templateName,
    language: { code: language },
  };
  if (variables.length > 0) {
    template.components = [
      {
        type: "body",
        parameters: variables.map((text) => ({ type: "text", text })),
      },
    ];
  }
  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template,
  };
  try {
    const res = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      timeout: 3000,
    });
    console.log("✅ WhatsApp message sent:", res.data);
    await WhatsappMessage.create({
      template_name: templateName,
      phone_number: to,
      recipient_name: recipientName,
      sent_at: new Date(),
    });
    return res.data;
  } catch (error) {
    if (isParameterMismatchError(error) && fallbackToEnglish) {
      // جرب إرسال القالب بالإنجليزية
      const englishTemplate = getEnglishEquivalent(templateName);
      if (englishTemplate !== templateName) {
        return sendWhatsAppTemplate({
          to,
          templateName: englishTemplate,
          variables,
          language: "en_US",
          recipientName,
          messageType,
          fallbackToEnglish: false,
        });
      }
    }
    if (isTemplateNotFoundError(error) && fallbackToEnglish) {
      const englishTemplate = getEnglishEquivalent(templateName);
      if (englishTemplate !== templateName) {
        return sendWhatsAppTemplate({
          to,
          templateName: englishTemplate,
          variables,
          language: "en_US",
          recipientName,
          messageType,
          fallbackToEnglish: false,
        });
      }
    }
    throw error;
  }
}

/**
 * إرسال رسالة نصية بسيطة (غير قالب)
 */
async function sendWhatsAppTextMessage({
  to,
  message,
  recipientName = "غير معروف",
  messageType = "text",
}) {
  if (!TOKEN || !PHONE_NUMBER_ID) {
    console.error("❌ Missing WhatsApp credentials in environment variables!");
    return;
  }
  const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: message },
  };
  try {
    const res = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      timeout: 3000,
    });
    console.log("✅ WhatsApp text message sent:", res.data);
    await WhatsappMessage.create({
      template_name: "text",
      phone_number: to,
      recipient_name: recipientName,
      sent_at: new Date(),
    });
    return res.data;
  } catch (error) {
    // طباعة كل تفاصيل الخطأ الممكنة
    console.error("❌ Error sending WhatsApp text message:");
    try {
      if (error.response) {
        console.error("- Status:", error.response.status);
        console.error("- Headers:", error.response.headers);
        console.error("- Data:", error.response.data);
      }
      console.error("- Message:", error.message);
      if (error.stack) console.error("- Stack:", error.stack);
      // طباعة الكائن كاملاً إذا أمكن
      try {
        console.error("- Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      } catch (jsonErr) {
        console.error("- Full error object (raw):", error);
      }
      // طباعة كل المفاتيح المتوفرة
      for (const key of Object.keys(error)) {
        console.error(`- error['${key}']:`, error[key]);
      }
    } catch (printErr) {
      console.error("خطأ أثناء محاولة طباعة تفاصيل الخطأ:", printErr);
    }
    throw error;
  }
}

module.exports = {
  sendWhatsAppTemplate,
  sendWhatsAppTextMessage,
};
