

const Invite = require("../models/Invite");
const { v4: uuidv4 } = require('uuid'); 

const createInvite = async (req, res) => {
  try {
    const { userId } = req.params;

    const existingInvite = await Invite.findOne({ where: { userId } });

    if (existingInvite) {
      return res.status(400).json({ message: "Invite link already exists for this user." });
    }

    const inviteLink = uuidv4();

    await Invite.create({
      userId,
      link: inviteLink,
      amountPoints: 0
    });

    res.status(201).json({ message: {
        ar:"تم إنشاء رابط الدعوة بنجاح.",
        en:"Invite link created successfully.",
    }});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." ,error});
  }
};


const getInviteInfo = async (req, res) => {
    try {
      const { userId } = req.params;
  
      const invite = await Invite.findOne({ where: { userId } });
  
      if (!invite) {
        return res.status(404).json({ message: "Invite not found for this user." });
      }
  
      res.status(200).json({ invite });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  };
  
module.exports = {
    createInvite,
    getInviteInfo
}