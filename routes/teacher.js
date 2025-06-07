const express = require("express");

const teacherRouter = express.Router();
const {
  signUp,               verifyCode,           signPassword,
  signAbout,            signAdditionalInfo,   settingNotification,
  getSingleTeacher,     signResume,           signAvailability,
  addSubjects,          uploadImage,          signVideoLink,
  addDescription,       searchTeacherFilterSide,
  searchTeacherFilterTop, resetPassword,       getAllSessions,
  getCredit,              getTeacherFinancial, updateNotification,
  getTeacherRate,         acceptLesson,        endLesson,
  getMyStudents,          requestCheckout,     getProfitRatio,
  //ADD by eng.reem.shwky@gmail.com
  getNumbers,
  getAllCertificates,     updateTeacherCertificates,  deleteTeacherCertificates,
  createLecture,          getLectureByTeacherId,      deleteLecture,    getSingleLecture,   updateLecture,
  createLesson,           getLessonByTeacherId,       getSingleLesson,  updateLesson,       deleteLesson,
  updateLogout,
  getPackageByTeacherId,  getSinglePackage,         createPackage,
  deletePackage,          updatePackage,            getPackageAcceptByTeacherId,
  getPackageAccept,       getAllTeachers,
  getQuestionByTeacherId, getSingleQuestion,        createQuestion,
  deleteQuestion,         updateQuestion,
  getQuestionChooseByTeacherId,                     getSingleQuestionChoose,
  createQuestionChoose,                             updateQuestionChoose,
  deleteQuestionChoose,
  getTestsByTeacherId,                    getSingleTest,
  createTest,                             updateTest,
  deleteTest,           getDiscountByTeacherId,   getSingleDiscount,       
  createDiscount,       deleteDiscount,           updateDiscount,
  getRefundTeacherById,getAllTeachersRating,      createExchangeRequestsTeacher,
} = require("../controllers/teacher");
const errorCatcher    = require("../middlewares/errorCatcher");
const verifyToken     = require("../middlewares/verifyToken");
const checkUserAuth   = require("../middlewares/checkUserAuth");

teacherRouter.post("/signup", errorCatcher(signUp));
teacherRouter.post("/signup/code", errorCatcher(verifyCode));
teacherRouter.post("/signup/pass", errorCatcher(signPassword));

teacherRouter.post("/search/side", errorCatcher(searchTeacherFilterSide));
teacherRouter.post("/search/top", errorCatcher(searchTeacherFilterTop));

teacherRouter.post( "/about/:teacherId",  verifyToken,  checkUserAuth("teacher"),   errorCatcher(signAbout) );
teacherRouter.post( "/image/:teacherId",  verifyToken,  checkUserAuth("teacher"),   errorCatcher(uploadImage));
teacherRouter.post( "/additionalInfo/:teacherId",verifyToken,checkUserAuth("teacher"),errorCatcher(signAdditionalInfo));
teacherRouter.post( "/subjects/:teacherId", verifyToken,  checkUserAuth("teacher"), errorCatcher(addSubjects));
// Developer by eng.reem.shwky@gmail.com
teacherRouter.post("/setting/:teacherId",  verifyToken,  checkUserAuth("teacher"),  errorCatcher(settingNotification));
teacherRouter.post("/resume/:teacherId",   verifyToken,  checkUserAuth("teacher"),  errorCatcher(signResume));
teacherRouter.post("/availability/:teacherId",  verifyToken,  checkUserAuth("teacher"), errorCatcher(signAvailability) );
teacherRouter.post("/VideoLink/:teacherId",     verifyToken,  checkUserAuth("teacher"), errorCatcher(signVideoLink) );
teacherRouter.post("/description/:teacherId",verifyToken,checkUserAuth("teacher"),errorCatcher(addDescription));
teacherRouter.get(  "/getSingleTeacher/:teacherId", errorCatcher(getSingleTeacher)  );
teacherRouter.put(
  "/resetPassword/:TeacherId",
  verifyToken,
  checkUserAuth("teacher"),
  errorCatcher(resetPassword)
);

teacherRouter.get("/sessions/:TeacherId",verifyToken,checkUserAuth("teacher"),errorCatcher(getAllSessions));
teacherRouter.get("/students/:TeacherId",verifyToken,checkUserAuth("teacher"),errorCatcher(getMyStudents));
teacherRouter.get("/credit/:TeacherId",verifyToken,  checkUserAuth("teacher"), errorCatcher(getCredit) );
teacherRouter.get("/financialTeacher/:TeacherId",verifyToken,checkUserAuth("teacher"),errorCatcher(getTeacherFinancial));
teacherRouter.put("/updateNotification/:TeacherId",verifyToken,checkUserAuth("teacher"),errorCatcher(updateNotification));
teacherRouter.get("/teacherRate/:TeacherId", errorCatcher(getTeacherRate));

teacherRouter.patch(
  "/acceptLesson/:TeacherId",
  verifyToken,
  checkUserAuth("teacher"),
  errorCatcher(acceptLesson)
);
teacherRouter.patch("/endLesson/:TeacherId",verifyToken,checkUserAuth("teacher"),errorCatcher(endLesson));

teacherRouter.get("/request-checkout/:TeacherId", verifyToken,  checkUserAuth("teacher"), errorCatcher(requestCheckout) );
teacherRouter.get("/profit-ratio", errorCatcher(getProfitRatio));
//ADD By eng.reem.shwky@gamil.com
teacherRouter.post("/exchangerequestteachers",errorCatcher(createExchangeRequestsTeacher));
teacherRouter.get("/numbers/:teacherId",  verifyToken, checkUserAuth("teacher"), errorCatcher(getNumbers));
teacherRouter.get("/getTeacherCertificates/:teacherId",  verifyToken, checkUserAuth("teacher"), errorCatcher(getAllCertificates));
teacherRouter.put("/updateTeacherCertificates/:certificatesId",verifyToken,  checkUserAuth("teacher"), errorCatcher(updateTeacherCertificates));
teacherRouter.delete( "/deleteTeacherCertificates/:certificatesId",  verifyToken,  checkUserAuth("teacher"), errorCatcher(deleteTeacherCertificates) );
teacherRouter.post("/createLecture",                    errorCatcher(createLecture));
teacherRouter.get("/getLectureByTeacherId/:teacherId",     errorCatcher(getLectureByTeacherId));
teacherRouter.get("/lecture/:lectureId",                errorCatcher(getSingleLecture));
teacherRouter.delete( "/deleteLecture/:lectureId",      verifyToken,  checkUserAuth("teacher"),    errorCatcher(deleteLecture) );
teacherRouter.put("/updateLecture/:lectureId",           errorCatcher(updateLecture));

teacherRouter.post("/createLesson",                     verifyToken,checkUserAuth("teacher"),errorCatcher(createLesson));
teacherRouter.get("/getLessonByTeacherId/:teacherId",   verifyToken,  checkUserAuth("teacher"),    errorCatcher(getLessonByTeacherId));
teacherRouter.get("/getSingleLesson/:lessonId",         verifyToken,  checkUserAuth("teacher"),          errorCatcher(getSingleLesson));
teacherRouter.put("/updateLesson/:lessonId",            verifyToken,  checkUserAuth("teacher"),           errorCatcher(updateLesson));
teacherRouter.delete( "/deleteLesson/:lessonId",        verifyToken,  checkUserAuth("teacher"),      errorCatcher(deleteLesson) );
teacherRouter.post( "/updatelogout/:teacherId",         errorCatcher(updateLogout));

teacherRouter.post("/createPackage",                    errorCatcher(createPackage));
teacherRouter.get("/getPackageByTeacherId/:teacherId",  verifyToken,  checkUserAuth("teacher"),    errorCatcher(getPackageByTeacherId));
teacherRouter.get("/getSinglePackage/:packageId",       errorCatcher(getSinglePackage));
teacherRouter.delete("/deletePackage/:packageId",       verifyToken,  checkUserAuth("teacher"),     errorCatcher(deletePackage) );
teacherRouter.put("/updatePackage/:packageId",               errorCatcher(updatePackage));
teacherRouter.get("/getPackageAcceptByTeacherId/:teacherId",   errorCatcher(getPackageAcceptByTeacherId));
teacherRouter.get("/getPackageAccept",                  errorCatcher(getPackageAccept));
teacherRouter.get("/teachers",                          errorCatcher(getAllTeachers));
teacherRouter.get("/teachersRates",                     errorCatcher(getAllTeachersRating));

teacherRouter.post("/question",                         verifyToken,  checkUserAuth("teacher"),    errorCatcher(createQuestion));
teacherRouter.get("/questions/:teacherId",              verifyToken,  checkUserAuth("teacher"),    errorCatcher(getQuestionByTeacherId));
teacherRouter.get("/question/:questionId",               errorCatcher(getSingleQuestion));
teacherRouter.delete( "/question/:questionId",           verifyToken,  checkUserAuth("teacher"),    errorCatcher(deleteQuestion) );
teacherRouter.put("/question/:questionId",               verifyToken,  checkUserAuth("teacher"), errorCatcher(updateQuestion));

teacherRouter.post("/questionchoose",                         verifyToken,    checkUserAuth("teacher"),    errorCatcher(createQuestionChoose));
teacherRouter.get("/questionchooses/:teacherId",              verifyToken,    checkUserAuth("teacher"),    errorCatcher(getQuestionChooseByTeacherId));
teacherRouter.get("/questionchoose/:questionChooseId",        errorCatcher(getSingleQuestionChoose));
teacherRouter.delete( "/questionchoose/:questionChooseId",    verifyToken,    checkUserAuth("teacher"),     errorCatcher(deleteQuestionChoose) );
teacherRouter.put("/questionchoose/:questionChooseId",        verifyToken,    checkUserAuth("teacher"),     errorCatcher(updateQuestionChoose));

teacherRouter.post("/tests",                    errorCatcher(createTest));
teacherRouter.get("/tests/:teacherId",      verifyToken,    checkUserAuth("teacher"),    errorCatcher(getTestsByTeacherId));
teacherRouter.get("/testsTeacherId/:teacherId",   errorCatcher(getTestsByTeacherId));

teacherRouter.get("/test/:testId",          errorCatcher(getSingleTest));
teacherRouter.delete( "/tests/:testId",     verifyToken,    checkUserAuth("teacher"),     errorCatcher(deleteTest) );
teacherRouter.put("/tests/:testId",            updateTest);

teacherRouter.post("/discount",               verifyToken,  checkUserAuth("teacher"),    errorCatcher(createDiscount));
teacherRouter.get("/discounts/:teacherId",    verifyToken,  checkUserAuth("teacher"),     errorCatcher(getDiscountByTeacherId));
teacherRouter.get("/discount/:discountId",    errorCatcher(getSingleDiscount));
teacherRouter.delete("/discount/:discountId", verifyToken,  checkUserAuth("teacher"),    errorCatcher(deleteDiscount) );
teacherRouter.put("/discount/:discountId",    verifyToken,  checkUserAuth("teacher"),    errorCatcher(updateDiscount));
teacherRouter.get("/refunds/:TeacherId",      errorCatcher(getRefundTeacherById));

module.exports = teacherRouter;
