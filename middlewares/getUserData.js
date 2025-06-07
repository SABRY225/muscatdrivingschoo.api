const getUserData = async (req, res) => {
  const { user } = req;

  res.send({ status: 200, data: user });
};

module.exports = getUserData;
