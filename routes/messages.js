const express = require("express");
const { postMessage, getMessages, replyMessage, removeMessage } = require("../controllers/messageController");
const messagerouter = express.Router();

messagerouter.get("/messages", getMessages);
messagerouter.post("/messages", postMessage);
messagerouter.put("/reply-message", replyMessage);
messagerouter.delete("/remove/:id", removeMessage);
module.exports = messagerouter;