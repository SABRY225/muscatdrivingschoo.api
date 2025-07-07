const axios = require("axios");
const WhatsappMessage = require("../models/WhatsappMessage");
const {
  getTemplateName,
  templateExists,
  ALL_TEMPLATES,
} = require("../config/whatsapp-templates");
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

/**
 * تنسيق التاريخ والوقت بالعربية
 */
function formatArabicDateTime(date = new Date()) {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Muscat',
    locale: 'ar-OM'
  };
  
  // تنسيق التاريخ والوقت
  const formattedDate = date.toLocaleDateString('ar-OM', options);
  
  // تحويل الأرقام الإنجليزية إلى عربية
  return formattedDate
    .replace(/0/g, '٠')
    .replace(/1/g, '١')
    .replace(/2/g, '٢')
    .replace(/3/g, '٣')
    .replace(/4/g, '٤')
    .replace(/5/g, '٥')
    .replace(/6/g, '٦')
    .replace(/7/g, '٧')
    .replace(/8/g, '٨')
    .replace(/9/g, '٩');
}

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
    // تنسيق التاريخ والوقت قبل إرسال الرسالة
    const currentDate = new Date();
    const formattedDate = formatArabicDateTime(currentDate);
    
    // تحديث المتغيرات لتضمين التاريخ المنسق
    const updatedVariables = [...variables];
    
    // البحث عن المتغير الذي قد يحتوي على تاريخ غير منسق
    const dateVariableIndex = updatedVariables.findIndex(v => 
      v && (v.includes('T') || v.includes('Z') || v.match(/\d{4}-\d{2}-\d{2}/))
    );
    
    if (dateVariableIndex !== -1) {
      updatedVariables[dateVariableIndex] = formattedDate;
    }
    
    // تحديث الجسم مع المتغيرات المحدثة
    if (updatedVariables.length > 0) {
      body.template.components = [{
        type: "body",
        parameters: updatedVariables.map((text) => ({ type: "text", text })),
      }];
    }
    
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
      sent_at: currentDate,
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
    // تنسيق التاريخ والوقت للرسائل النصية
    const currentDate = new Date();
    const formattedDate = formatArabicDateTime(currentDate);
    
    // تحديث نص الرسالة ليتضمن التاريخ المنسق إذا كان يحتوي على تاريخ
    if (message && (message.includes('T') || message.includes('Z') || message.match(/\d{4}-\d{2}-\d{2}/))) {
      message = message.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?/, formattedDate);
      body.text.body = message;
    }
    
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
      sent_at: currentDate,
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
  formatArabicDateTime,
};
