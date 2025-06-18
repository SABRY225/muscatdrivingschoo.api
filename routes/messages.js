const express = require("express");
// const errorCatcher = require("../middlewares/errorCatcher");
const { postMessage, getMessages, replyMessage } = require("../controllers/messageController");
const messagerouter = express.Router();

messagerouter.get("/messages", getMessages);
messagerouter.post("/messages", postMessage);
messagerouter.put("/reply-message", replyMessage);
module.exports = messagerouter;