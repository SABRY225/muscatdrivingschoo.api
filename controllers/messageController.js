const { Student } = require("../models");
const Messages = require("../models/Messages");
const Notification = require("../models/Notification");
const { sendNotification } = require("../services/shared/notification.service");

exports.getMessages = async (req, res) => {
  try {
    const messages = await Messages.findAll();
    const messagesData = await Promise.all(
        messages.map(async (message) => {
          const student = await Student.findOne({
            where: {
              id: message.from_user, 
            },
          });
          return {
            ...message.dataValues, 
            from_user: student ? student.dataValues : null
          };
        })
      );
    res.send({
        status: 200,
        data:messagesData,
        message: {
          ar: "عملية ناجحة",
          en: "process successfully"
        }
      });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.postMessage = async (req, res) => {
  try {
    const { message, from_user,title } = req.body;
    if (!message || !from_user || !title) {
      return res.status(400).json({ message: {
        ar:"جميع الحقول مطلوبة" ,
        en:"All fields are required" 
      }});
    }

    await Messages.create({ text:message, from_user,title });
    await sendNotification("شكوي جديدة","New complaint","1","complaint","admin")
    res.json({ success: true,message: {
        ar:"تم ارسال الشكوي بنجاح ",
        en:"Complaint sent successfully" 
      }});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: {
      ar:`لقد حدثت مشكلة في السيرفر`,
      en:`There was a problem with the server`
     }});
  }
};

exports.replyMessage = async (req, res) => {
    try {
      const { reply,messageId,studentId } = req.body;
      if (!reply || !messageId || !studentId) {
        return res.status(400).json({ message: {
          ar:"جميع الحقول مطلوبة" ,
          en:"All fields are required" 
        }});
      }
      const messageToUpdate = await Messages.findOne({
        where: {
          id:messageId
        }
      });
      if (!messageToUpdate) {
        return res.status(404).send({
          status: 404,
          message: {
            ar: "الرسالة غير موجودة",
            en: "Message not found"
          }
        });
      }
      messageToUpdate.reply = reply || messageToUpdate.reply;
      messageToUpdate.isReply = 1;

      const notificationData = await Notification.create(
        {
            userId: studentId,
            userType: "Student",
            type: "complaint",
            messageAr: reply,
            messageEn: reply
        }
    );
    await notificationData.save();
      await messageToUpdate.save();
      res.json({ success: true,message: {
          ar:"تم ارسال الرد علي الشكوي بنجاح ",
          en:"The response to the complaint has been sent successfully." 
        }});
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: {
        ar:`لقد حدثت مشكلة في السيرفر`,
        en:`There was a problem with the server`
       }});
    }
};

exports.removeMessage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: {
        ar:"معرف الرسالة مطلوب" ,
        en:"Message ID is required" 
      }});
    }
    const messageToDelete = await Messages.findOne({
      where: { id }
    });
    if (!messageToDelete) {
      return res.status(404).json({ message: {
        ar:"الرسالة غير موجودة",
        en:"Message not found"
      }});
    }
    await messageToDelete.destroy();
    res.json({ success: true, message: {
      ar:"تم حذف الرسالة بنجاح",
      en:"Message deleted successfully"
    }});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: {
      ar:`لقد حدثت مشكلة في السيرفر`,
      en:`There was a problem with the server`
     }});
  }
}