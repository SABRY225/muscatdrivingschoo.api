const { Student, Teacher } = require("../../models");
const Invite = require("../../models/Invite");

const addPointsForPurchase = async ({ studentId, teacherId }) => {
  const student = await Student.findByPk(studentId);
  const teacher = await Teacher.findByPk(teacherId);

  if (!student || !teacher) {
    throw new Error("Student or Teacher not found");
  }


  // Helper function to add or update invite record
  const upsertInvitePoints = async (userId) => {
    const existingInvite = await Invite.findOne({ where: { userId } });
    if (existingInvite) {
      existingInvite.amountPoints = +existingInvite.amountPoints + 3;
      await existingInvite.save();
    } else {
      await Invite.create({
        userId,
        amountPoints: 3,
        link: null, // optional
      });
    }
  };

  // Update or insert Invite for both student and teacher
  await upsertInvitePoints(studentId);
  await upsertInvitePoints(teacherId);

  return {
    studentPoints: student.points,
    teacherPoints: teacher.points,
  };
};

module.exports = {
  addPointsForPurchase,
};
