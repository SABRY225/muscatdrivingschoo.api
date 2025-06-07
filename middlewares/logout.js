
const { Parent, Student, Teacher } = require("../models");

//Developer By eng.reem.shwky@gmail.com
const logout = async (req, res) => {
  const parent = await Parent.findOne({ where: { email, isSuspended: false } });

  const student = await Student.findOne({
    where: { email, isRegistered: true, isSuspended: false },
  });

  const teacher = await Teacher.findOne({
    where: { email, isRegistered: true, isSuspended: false },
  });

  console.log("Logout Student");
  console.log(student.id);

  const data = teacher ? teacher : student ? student : parent;
  const isOnline = false;
  await data.update({isOnline});

  res.clearCookie('token');
  res.send({ status: 200, msg: 'Logged Out' });
};

module.exports = logout