const AdminWallet = require("../../models/AdminWallet");

const addToAdminWallet = async ( amount) => {
  if (!amount || amount <= 0) {
    throw new Error("Invalid amount to add to admin wallet");
  }

  await AdminWallet.create({
    userId:"1",
    amount,
  });

};

module.exports = {
  addToAdminWallet,
};
