const axios = require("axios");
const WhatsappMessage = require("../models/WhatsappMessage");
const { VERIFICATION_TEMPLATES } = require("../config/whatsapp-templates");
const token = process.env.WHATSAPP_TOKEN; // من الأفضل تخزين التوكن في .env
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || 677659998761159;

const sendWhatsAppVerificationCode = async (
  phoneNumber,
  code,
  language = "ar",
  recipientName = "unknown"
) => {
  try {
    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
    console.log(`🔄 إرسال رمز التحقق للرقم ${phoneNumber} باللغة ${language}`);
    const templateName =
      language === "ar"
        ? VERIFICATION_TEMPLATES.VERIFY_CODE_AR
        : VERIFICATION_TEMPLATES.VERIFY_CODE_EN;
    const langCode = language === "ar" ? "ar" : "en_US";
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
            parameters: [{ type: "text", text: code }],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "payload", payload: code }],
          },
        ],
      },
    };
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const response = await axios.post(url, payload, {
      headers,
      timeout: 3000,
    });
    console.log("✅ WhatsApp verify code message sent:", response.data);
    await WhatsappMessage.create({
      template_name: templateName,
      phone_number: phoneNumber,
      recipient_name: recipientName,
      sent_at: new Date(),
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error sending WhatsApp verification code:", error.response?.data || error);
    throw error;
  }
};

module.exports = sendWhatsAppVerificationCode;
