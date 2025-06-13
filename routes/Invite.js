const express = require("express");
const { getInviteInfo, createInvite } = require("../controllers/invite");
const inviteRouter = express.Router();

inviteRouter.post("/:userId",createInvite );
inviteRouter.get("/:userId",getInviteInfo );

module.exports = inviteRouter;
