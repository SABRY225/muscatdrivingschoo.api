const express = require("express");
const { getFriends, createMessage, getMessages, seenMessage, addFriend } = require("../controllers/ChatMessage");
const chatMessageRouter = express.Router();

chatMessageRouter.patch("/seen/:messageId", seenMessage);
chatMessageRouter.get("/friends/:userId", getFriends);
chatMessageRouter.get("/:user1Id/:user2Id", getMessages);
chatMessageRouter.post("/message", createMessage);
chatMessageRouter.post("/add", addFriend);
module.exports = chatMessageRouter;