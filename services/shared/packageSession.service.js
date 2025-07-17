const Session = require("../../models/Session");
const Package = require("../../models/Package");


function generateSessionDates(startDate, totalLessons, lessonsPerWeek) {
  const sessionDates = [];
  const start = new Date(startDate);
  const weeks = Math.ceil(totalLessons / lessonsPerWeek);

  for (let week = 0; week < weeks; week++) {
    for (let i = 0; i < lessonsPerWeek && sessionDates.length < totalLessons; i++) {
      const sessionDate = new Date(start);
      sessionDate.setDate(start.getDate() + (week * 7) + i);
      sessionDates.push(sessionDate.toISOString().split("T")[0]);
    }
  }

  return sessionDates;
}

// 🔍 تحقق من وجود الحصص وإنشاء الباقي إن لزم
const checkAndCreateSessions=async({studentId, packageId, teacherId}) =>{
  const studentPackage = await Package.findByPk(packageId);
  if (!studentPackage) throw new Error("Package not found");

  const totalLessons = studentPackage.numTotalLesson;
  const lessonsPerWeek = studentPackage.numWeekLesson;
  const startDate = studentPackage.startDate;


  const sessionDates = generateSessionDates(startDate, totalLessons, lessonsPerWeek);

  const sessionsToCreate = sessionDates.map(date => ({
    title: "Lesson Session",
    date,
    time: "16:00",
    place: "Online",
    period: "1",
    type: "Package Lesson",
    typeOfPayment: "package",
    currency: studentPackage.currency,
    price: studentPackage.price / totalLessons,
    totalPrice: studentPackage.price,
    isPaid: true,
    sessionId: `${studentId}-${packageId}-${date}`,
    teacherAccept: false,
    studentAccept: false,
    StudentId: studentId,
    TeacherId: teacherId,
  }));

  await Session.bulkCreate(sessionsToCreate);

  return {
    created: sessionsToCreate.length,
    message: "Sessions created successfully",
  };
}

module.exports = {
  generateSessionDates,
  checkAndCreateSessions,
};
