const AdminWallet = require("../../models/AdminWallet");

const addToAdminWallet = async (amount) => {
  if (!amount || amount <= 0) {
    throw new Error("Invalid amount to add to admin wallet");
  }

  const admin = await AdminWallet.findByPk("1")// يفترض يوجد أدمن واحد فقط

  if (!admin) {
    throw new Error("Admin not found");
  }

  admin.amount += +amount;
  await admin.save();
};

module.exports = {
  addToAdminWallet,
};
