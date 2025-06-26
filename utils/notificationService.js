const ChatMessage = require("../models/ChatMessage");
const Notification = require("../models/Notification");


async function checkUnreadMessages() {
    const tenMinutesAgo = new Date(Date.now() - 5 * 60 * 1000); // قبل 5 دقائق

    const unreadMessages = await ChatMessage.findAll({
        where: {
            seen: false,
            createdAt: { [Op.lt]: tenMinutesAgo }, // الرسائل الأقدم من 5 دقائق
        },
    });

    unreadMessages.forEach(async (message) => {
        await Notification.create({
            userId: message.receiverId,
            type: "chat_message",
            messageAr: "لديك رسالة غير مقروءة!",
            messageEn: "You have an unread message!",
        });

    });
}

// فحص الرسائل غير المقروءة كل 5 دقائق
setInterval(checkUnreadMessages, 5 * 60 * 1000);
