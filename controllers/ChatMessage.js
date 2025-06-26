const { Op } = require("sequelize");
const ChatMessage = require("../models/ChatMessage");
const { Teacher, Student, Parent, Admin } = require("../models");
const Friend = require("../models/Friend");


const getFriends = async (req, res) => {
    try {
      const { userId } = req.params;
  
      const friends = await Friend.findAll({
        where: {
          [Op.or]: [{ user1Id: userId }, { user2Id: userId }]
        }
      });
     
      const friendList = friends.map(friend => ({
        id: friend.user1Id == parseInt(userId) ? friend.user2Id : friend.user1Id,
        type: friend.user1Id == parseInt(userId) ? friend.user2Type : friend.user1Type
    }));
     console.log(friendList);
      
      const lessionsData = await Promise.all(
        friendList.map(async ({ id, type }) => {
            // الحصول على آخر رسالة
          const lastMessage = await ChatMessage.findOne({
            where: {
              [Op.or]: [
                { senderId: userId, receiverId: id },
                { senderId: id, receiverId: userId }
              ]
            },
            order: [['createdAt', 'DESC']],
            attributes: ['message', 'createdAt', 'seen']
          });
  
          // حساب الرسائل غير المقروءة
          const unreadCount = await ChatMessage.count({
            where: {
              receiverId: userId,
              senderId: id,
              seen: false
            }
          });
          if (type=="student") {
            const student = await Student.findOne({
                where: {
                 id, 
                },
              });
                return {
                    id: student.dataValues.id,
                    name: student.dataValues?.name,
                    image: student.dataValues?.image,
                    lastMessage: lastMessage ? {
                        text: lastMessage.message,
                        time: lastMessage.createdAt
                      } : null,
                      unreadCount: unreadCount
                  };
          }else if (type=="parent"){
            const parent = await Parent.findOne({
                where: {
                  id, 
                },
              });
                return {
                    id: parent.dataValues.id,
                    name: parent.dataValues.name,
                    lastMessage: lastMessage ? {
                        text: lastMessage.message,
                        time: lastMessage.createdAt
                      } : null,
                      unreadCount: unreadCount
                  };
          }else if (type=="teacher") {
            const teacher = await Teacher.findOne({
                where: {
                  id:id, 
                },
              });
                return {
                    id: teacher.dataValues.id,
                    name: teacher.dataValues.firstName+" "+teacher.dataValues.lastName,
                    image: teacher.dataValues.image,
                    lastMessage: lastMessage ? {
                        text: lastMessage.message,
                        time: lastMessage.createdAt
                      } : null,
                      unreadCount: unreadCount
                  };
          }else if (type=="admin"){
            const admin = await Admin.findOne({
                where: {
                  id: id, 
                },
              });
                return {
                    id: admin.dataValues.id,
                    name: admin.dataValues.name,
                    lastMessage: lastMessage ? {
                        text: lastMessage.message,
                        time: lastMessage.createdAt
                      } : null,
                      unreadCount: unreadCount
                  };
          }
        })
      );
      res.status(200).json({ status: 200, data: lessionsData });
    } catch (error) {
      res.status(500).json({ 
        message: error.message,
        error: "خطأ في جلب البيانات"
      });
    }
};
const createMessage = async (req, res) => {
    try {
        const { senderId, receiverId, message } = req.body;
        let fileUrl = null;
        if (req?.files) {
            fileUrl = req.files[0]?.filename;
        }
        const newMessage = await ChatMessage.create({ senderId, receiverId, message, fileUrl});

        res.status(201).json({status: 200,newMessage});
    } catch (error) {
        res.status(500).json({ message:error.message,error: "خطأ في إنشاء الرسالة" });
    }
};
const getMessages = async (req, res) => {
    try {
        const { user1Id, user2Id } = req.params;

        const messages = await ChatMessage.findAll({
            where: {
                [Op.or]: [
                    { senderId: user1Id, receiverId: user2Id },
                    { senderId: user2Id, receiverId: user1Id }
                ]
            },
            order: [["createdAt", "ASC"]]
        });

        res.status(200).json({messages});
    } catch (error) {
        res.status(500).json({ error: "خطأ في جلب الرسائل" });
    }
};
const seenMessage= async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await ChatMessage.findByPk(messageId);

        if (!message) {
            return res.status(404).json({ error: "الرسالة غير موجودة" });
        }

        // تحديث حالة "seen" للرسالة
        await message.update({status: 200, seen: true });

        res.status(200).json({ message: "تم تحديث حالة الرسالة إلى مقروءة" });
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء تحديث حالة الرسالة" });
    }
};

const addFriend = async (req, res) => {
    try {
        const { user1Id, user1Type, user2Id, user2Type } = req.body;

        if (user1Id === user2Id) {
            return res.status(400).json({ message: "لا يمكنك إضافة نفسك كصديق!" });
        }

        const existingFriendship = await Friend.findOne({
            where: {
                user1Id,
                user2Id
            }
        });

        if (existingFriendship) {
            return res.status(400).json({ message: "الصداقة موجودة بالفعل!" });
        }

        // إضافة الصديق
        const newFriend = await Friend.create({ user1Id, user1Type, user2Id, user2Type });

        return res.status(201).json({ message: "تمت إضافة الصديق بنجاح", friend: newFriend });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "حدث خطأ أثناء إضافة الصديق" });
    }
};


module.exports = {
    getFriends,
    createMessage,
    getMessages,
    seenMessage,
    addFriend
 };  // End of module.exports