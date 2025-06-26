const express = require("express");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const morgan = require("morgan");
const router = require("./routes");
const dotenv = require("dotenv");
const { clientError, serverError } = require("./middlewares/error");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const Notifications = require("./firebaseConfig");
const ChatMessage = require("./models/ChatMessage");
const Notification = require("./models/Notification");
const { Op } = require("sequelize");

dotenv.config();
const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});


app.set("port", process.env.PORT || 5007);
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,DELETE,POST,PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type , Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use([
  express.json(),
  cookieParser(),
  compression(),
  express.urlencoded({ extended: false }),
]);

app.use(multer({ storage: fileStorage }).any());


if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use('/images', express.static(path.join(__dirname,'images')));

app.use("/api/v1", router);

app.use(clientError);
app.use(serverError);

async function checkUnreadMessages() {
  const tenMinutesAgo = new Date(Date.now() - 3 * 60 * 1000); // قبل 3 دقائق

  const unreadMessages = await ChatMessage.findAll({
      where: {
          seen: false,
          isNotified: false, // لم يتم إرسال إشعار عنها
          createdAt: { [Op.lt]: tenMinutesAgo }, 
      },
  });

  unreadMessages.forEach(async (message) => {
      await Notification.create({
          userId: message.receiverId,
          userType: "student",
          type: "chat_message",
          messageAr: "لديك رسالة غير مقروءة!",
          messageEn: "You have an unread message!",
      });

      // تحديث الرسالة انه تم إرسال الإشعار عليها
      await message.update({ isNotified: true });
  });
}


// فحص الرسائل غير المقروءة كل 5 دقائق
setInterval(checkUnreadMessages, 3 * 60 * 1000);
module.exports = app;
