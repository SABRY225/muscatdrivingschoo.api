const express = require("express");

const adminRouter = express.Router();
const {
  login,                        signUp,                       getLevels,
  getSubjectCategories,         getSingleSubjectCategory,     getSubjects,
  getSingleSubject,             getClasses,                   getSingleClass,
  getSingleLevel,               getCurriculums,               getSingleCurriculum,
  createSubjectCategory,        createStudent,                createTeacher,
  createSubject,                createLevel,                  createClass,
  createCurriculum,             linkedCurriculumLevel,        acceptStudent,
  rejectStudent,                getParentStudentWaiting,      getParentStudentAccOrRej,
  acceptTeacher,                getAcceptedTeachers,          rejectTeacher,
  getWaitingTeacher,            getLanguageLevel,
  updateLevel,                  updateSubCategories,          updateSubject,
  updateClass,                  updateCurriculum,             payDues,
  //developer by eng.reem.shwky@gmail.com
  deleteFinancialRecords,
  getAllSessions,                     deleteSessions,
  getAllWallets,            getStudentWallets,         getThawaniSession,
  getAllTeachers,           getTeacherFinancial,       getNumbers,
  getAllWalletsPdf,         getAllStudentsPDF,         getAllParentsPDF,
  getAllTeachersPDF,
  getSessionsForStudent,          getSessionsForTeacher,          editWhatsappPhone,
  createSocialMedia,
  editSocialMedia,                getSocialMedia,             getWatsappPhone,
  allReports,                     updateProfitRatio,          deleteTeacher,
  deleteStudent,                  getProfitRatio,             getNewCheckoutRequests,
  getProcessedCheckoutRequests,   acceptCheckout,             rejectCheckout,
  signAbout,                      signAdditionalInfo,         uploadImage,
  addSubjects,      signResume,       signVideoLink,          signAvailability,
  addDescription,   deleteLevel,      deleteClass,
  deleteCurriculum, deleteSubjectCategory,  deleteSubject,
  suspendTeacher,   unSuspendTeacher,       suspendStudent,
  unSuspendStudent, suspendParent,          unSuspendParent,
  getAllFinancialRecords,
  // Developer by eng.reem.shwky@gmail.com
  getTrainingCategoryTypes,
  getSingleTrainingCategoryType,
  createTrainingCategoryType,
  deleteTrainingCategoryType,
  updateTrainingCategoryType,

  getLimeTypes,         getSingleLimeType,
  createLimeType,       deleteLimeType,     updateLimeType,
  getSingleAdmin,       getAdmins,
  createAdmin,          updateAdmin,        deleteAdmin,
  acceptPackage,        rejectPackage,
  getPackageByStatus,   getAllPackages,     deleteParentStudent,
  getRates,             deleteRates,
  getSingleDrivingLicenses,                   getDrivingLicenses,
  createDrivingLicenses,                      updateDrivingLicenses,
  deleteDrivingLicenses,
  getAllParents,                              sendMail,
  rejectTeacherLecture,                       acceptTeacherLecture,
  getAllLecture,
  getAllCareerDeparment,    getSingleCareerDepartment,    createCareerDepartment,
  deleteCareerDepartment,   updateCareerDepartment,
  getAllCareer,             createCareer,                 deleteCareer,
  getSingleCareer,          updateCareer,                 getCareerByDepartment,
  getSingleNews,            getNews,                      createNews,
  deleteNews,               updateNews,                   deleteWallets,
  getTests,                 acceptTests,                  rejectTests,
  getSingleExchangeRequestsTeacher,   getExchangeRequestsTeachers,
  createExchangeRequestsTeacher,      deleteExchangeRequestsTeacher,
  updateExchangeRequestsTeacher,
  getSingleExchangeRequestsParent,    getExchangeRequestsParents,
  createExchangeRequestsParent,       deleteExchangeRequestsParent,
  updateExchangeRequestsParent,
  getSingleExchangeRequestsStudent,   getExchangeRequestsStudents,
  createExchangeRequestsStudent,      deleteExchangeRequestsStudent,
  updateExchangeRequestsStudent,      getNumbersExchangeRequests,
  updateExchangeRequestsStudentByStatus,
  updateExchangeRequestsParentByStatus,
  updateExchangeRequestsTeacherByStatus,
  getSingleAds,               getAllAds,                createAds,
  deleteAds,                  updateAds,                getAllDiscounts,
  updateDiscountStatus,       getAllCashBoxStudent,     getAllCashBoxTeacher,
  getSingleCashBoxStudent,    getSingleCashBoxTeacher,  createRefundStudent,
  createRefundTeacher,
  getAllAdsDeparment,         getSingleAdsDepartment,   createAdsDepartment,
  deleteAdsDepartment,        updateAdsDepartment,      updateAdsStatus,
  updateCareerStatus,         getAllDiscountsAgree,     sendWhatsapp,
  sendWhatsappWaitingSendMessage,     getWhatsData,
} = require("../controllers/admin");
const checkUserAuth = require("../middlewares/checkUserAuth");
const logout = require("../middlewares/logout");
const verifyToken = require("../middlewares/verifyToken");
const errorCatcher = require("../middlewares/errorCatcher");
const { getCredit } = require("../controllers/teacher");
const { editPersonalInformation } = require("../controllers/student");

adminRouter.post("/signup", errorCatcher(signUp));
adminRouter.post("/login", errorCatcher(login));
adminRouter.post("/logout", logout);

adminRouter.post("/createStudent",verifyToken,checkUserAuth("admin"),errorCatcher(createStudent));
adminRouter.post("/createTeacher",verifyToken,checkUserAuth("admin"),errorCatcher(createTeacher));
adminRouter.post("/edit/student/:StudentId",verifyToken, checkUserAuth("admin"), errorCatcher(editPersonalInformation));
// -----------------------------------
adminRouter.post(
  "/edit/teacher/about/:teacherId",
  verifyToken,
  checkUserAuth("admin"),
  errorCatcher(signAbout)
);
adminRouter.post(
  "/edit/teacher/image/:teacherId",
  verifyToken,
  checkUserAuth("admin"),
  errorCatcher(uploadImage)
);

adminRouter.post("/edit/teacher/additionalInfo/:teacherId",verifyToken,checkUserAuth("admin"),errorCatcher(signAdditionalInfo));
adminRouter.post("/edit/teacher/subjects/:teacherId",verifyToken,checkUserAuth("admin"),errorCatcher(addSubjects));
adminRouter.post("/edit/teacher/resume/:teacherId", verifyToken, checkUserAuth("admin"), errorCatcher(signResume));

adminRouter.post(
  "/edit/teacher/availability/:teacherId", verifyToken,
  checkUserAuth("admin"),
  errorCatcher(signAvailability)
);

adminRouter.post(
  "/edit/teacher/VideoLink/:teacherId",
  verifyToken,
  checkUserAuth("admin"),
  errorCatcher(signVideoLink)
);

adminRouter.post("/edit/teacher/description/:teacherId",verifyToken,checkUserAuth("admin"),errorCatcher(addDescription));

// ------------------------------------

adminRouter.post("/subjectCategory",verifyToken,checkUserAuth("admin"),errorCatcher(createSubjectCategory));
adminRouter.post("/subject",verifyToken,checkUserAuth("admin"),errorCatcher(createSubject));
adminRouter.post("/level",verifyToken,checkUserAuth("admin"),errorCatcher(createLevel));
adminRouter.post("/class",verifyToken,checkUserAuth("admin"),errorCatcher(createClass));
adminRouter.post("/curriculum",verifyToken,checkUserAuth("admin"),errorCatcher(createCurriculum));
adminRouter.post("/curriculumLevel",verifyToken,checkUserAuth("admin"),errorCatcher(linkedCurriculumLevel));

adminRouter.post("/studentParent/accept/:ParentStudentId", verifyToken, checkUserAuth("admin"), errorCatcher(acceptStudent));

adminRouter.post(
  "/studentParent/reject/:ParentStudentId",
  verifyToken,
  checkUserAuth("admin"),
  errorCatcher(rejectStudent)
);

adminRouter.post(
  "/reject/:teacherId",
  verifyToken,
  checkUserAuth("admin"),
  errorCatcher(rejectTeacher)
);

adminRouter.get("/subCategories", getSubjectCategories);
adminRouter.get(
  "/subCategory/:subjectCategoryId",
  errorCatcher(getSingleSubjectCategory)
);
adminRouter.get("/subjects", getSubjects);
adminRouter.get("/subject/:subjectId", errorCatcher(getSingleSubject));
adminRouter.get("/classes", getClasses);
adminRouter.get("/class/:classId", errorCatcher(getSingleClass));
adminRouter.get("/levels", getLevels);
adminRouter.get("/level/:levelId", errorCatcher(getSingleLevel));
adminRouter.get("/Curriculums", getCurriculums);
adminRouter.get("/Curriculum/:curriculumId", errorCatcher(getSingleCurriculum));
adminRouter.get("/languageLevel", errorCatcher(getLanguageLevel));

adminRouter.get("/getStudentsWaiting",verifyToken,checkUserAuth("admin"),errorCatcher(getParentStudentWaiting));
adminRouter.get(
  "/getStudentsAccOrRej", verifyToken,  checkUserAuth("admin"), errorCatcher(getParentStudentAccOrRej)
);

adminRouter.get("/getNewCheckoutRequests",verifyToken,  checkUserAuth("admin"), errorCatcher(getNewCheckoutRequests));
adminRouter.get(
  "/getProcessedCheckoutRequests",
  verifyToken,
  checkUserAuth("admin"),
  errorCatcher(getProcessedCheckoutRequests)
);
adminRouter.get("/checkout/accept/:checkoutId",verifyToken,checkUserAuth("admin"),errorCatcher(acceptCheckout));
adminRouter.get("/checkout/reject/:checkoutId",verifyToken,checkUserAuth("admin"),errorCatcher(rejectCheckout));
adminRouter.post("/accept/:teacherId",verifyToken,checkUserAuth("admin"),errorCatcher(acceptTeacher));
adminRouter.get(
  "/acceptedTeachers",
  verifyToken,
  checkUserAuth("admin"),
  errorCatcher(getAcceptedTeachers)
);
adminRouter.get(
  "/waitingTeachers",
  verifyToken,
  checkUserAuth("admin"),
  errorCatcher(getWaitingTeacher)
);

adminRouter.put(
  "/updateLevel/:LevelId",
  verifyToken,
  checkUserAuth("admin"),
  errorCatcher(updateLevel)
);

adminRouter.put(
  "/updateSubCategories/:SubjectCategoryId",  verifyToken,  checkUserAuth("admin"), errorCatcher(updateSubCategories)
);
adminRouter.put( "/updateSubject/:SubjectId", verifyToken,  checkUserAuth("admin"), errorCatcher(updateSubject) );
adminRouter.put(
  "/updateClass/:ClassId",
  verifyToken,
  checkUserAuth("admin"),
  errorCatcher(updateClass)
);

adminRouter.put(
  "/updateCurriculum/:CurriculumId",
  verifyToken,
  checkUserAuth("admin"),
  errorCatcher(updateCurriculum)
);

adminRouter.post(
  "/pay",
  verifyToken,
  checkUserAuth("admin"),
  errorCatcher(payDues)
);

adminRouter.get("/sessions", verifyToken, checkUserAuth("admin"), errorCatcher(getAllSessions));
adminRouter.get("/wallets",      verifyToken,  checkUserAuth("admin"), errorCatcher(getAllWallets));
//Developer by eng.reem.shwky@gmail.com
adminRouter.delete("/wallets/:walletId", verifyToken,  checkUserAuth("admin"), errorCatcher(deleteWallets));


adminRouter.get( "/studentWallet/:StudentId",  verifyToken,  checkUserAuth("admin"), errorCatcher(getStudentWallets) );
adminRouter.get("/thawaniSession/:StudentId",  verifyToken,checkUserAuth("admin"),errorCatcher(getThawaniSession) );
adminRouter.get("/teachers",  verifyToken,     checkUserAuth("admin"), errorCatcher(getAllTeachers) );
adminRouter.get("/financialTeacher/:TeacherId", verifyToken,  checkUserAuth("admin"), errorCatcher(getTeacherFinancial));

// Modify by eng.reem.shwky@gmail.com
adminRouter.get("/numbers",  verifyToken, checkUserAuth("admin"), errorCatcher(getNumbers));

adminRouter.get("/credit/:TeacherId",verifyToken,checkUserAuth("admin"),errorCatcher(getCredit));
adminRouter.get( "/wallets/pdf",verifyToken,checkUserAuth("admin"),errorCatcher(getAllWalletsPdf));
adminRouter.get("/allStudentsPDF",verifyToken,checkUserAuth("admin"),errorCatcher(getAllStudentsPDF));
adminRouter.get("/allTeachersPDF",verifyToken,checkUserAuth("admin"),errorCatcher(getAllTeachersPDF));
adminRouter.get("/allParentsPDF",verifyToken,checkUserAuth("admin"),errorCatcher(getAllParentsPDF));
adminRouter.get("/allReportsPDF",verifyToken,checkUserAuth("admin"),errorCatcher(allReports));
adminRouter.get( "/studentSessions/:StudentId",verifyToken,checkUserAuth("admin"),errorCatcher(getSessionsForStudent));
adminRouter.get("/teacherSessions/:TeacherId",  verifyToken,  checkUserAuth("admin"), errorCatcher(getSessionsForTeacher));
adminRouter.get("/socialMedia/all", errorCatcher(getSocialMedia));
adminRouter.get("/whatsappPhone", errorCatcher(getWatsappPhone));
adminRouter.put( "/editWhatsappPhone",verifyToken,checkUserAuth("admin"),errorCatcher(editWhatsappPhone));

adminRouter.post(
  "/createSocialMedia",
  verifyToken,
  checkUserAuth("admin"),
  errorCatcher(createSocialMedia)
);

adminRouter.put(
  "/editSocialMedia/:SocialMediaId",
  verifyToken,
  checkUserAuth("admin"),
  errorCatcher(editSocialMedia)
);
adminRouter.put(
  "/updateProfitRatio",
  verifyToken,
  checkUserAuth("admin"),
  errorCatcher(updateProfitRatio)
);

adminRouter.delete(
  "/deleteTeacher/:TeacherId",
  verifyToken,
  checkUserAuth("admin"),
  errorCatcher(deleteTeacher)
);

adminRouter.delete("/deleteStudent/:StudentId",  verifyToken,  checkUserAuth("admin"),  errorCatcher(deleteStudent));
adminRouter.get("/profitRatio",   verifyToken,    checkUserAuth("admin"), errorCatcher(getProfitRatio));


adminRouter.delete("/level/:levelId", verifyToken,checkUserAuth("admin"),errorCatcher(deleteLevel));
adminRouter.delete(
  "/class/:classId",
  verifyToken,
  checkUserAuth("admin"),
  errorCatcher(deleteClass)
);

adminRouter.delete(
  "/curriculum/:curriculumId",
  verifyToken,
  checkUserAuth("admin"),
  errorCatcher(deleteCurriculum)
);

adminRouter.delete(
  "/subjectCategory/:categoryId",
  verifyToken,
  checkUserAuth("admin"),
  errorCatcher(deleteSubjectCategory)
);

adminRouter.delete(
  "/subject/:subjectId",
  verifyToken,
  checkUserAuth("admin"),
  errorCatcher(deleteSubject)
);

adminRouter.get(
  "/suspend/teacher/:teacherId",
  verifyToken,
  checkUserAuth("admin"),
  errorCatcher(suspendTeacher)
);
adminRouter.get(
  "/unsuspend/teacher/:teacherId",
  verifyToken,
  checkUserAuth("admin"),
  errorCatcher(unSuspendTeacher)
);

adminRouter.get("/suspend/student/:studentId",verifyToken,checkUserAuth("admin"),errorCatcher(suspendStudent));
adminRouter.get("/unsuspend/student/:studentId",verifyToken,checkUserAuth("admin"),errorCatcher(unSuspendStudent));

adminRouter.get("/suspend/parent/:parentId",verifyToken,checkUserAuth("admin"),errorCatcher(suspendParent));
adminRouter.get("/unsuspend/parent/:parentId",verifyToken, checkUserAuth("admin"),errorCatcher(unSuspendParent));
adminRouter.get("/financialRecords",    verifyToken,  checkUserAuth("admin"), errorCatcher(getAllFinancialRecords) );
adminRouter.delete("/financialRecords/:financialRecordsId",  verifyToken,  checkUserAuth("admin"), errorCatcher(deleteFinancialRecords) );

adminRouter.get("/studentFinancialRecords",    verifyToken,  checkUserAuth("admin"), errorCatcher(getAllCashBoxStudent) );
adminRouter.get("/rowStudentFinancialRecords/:studentId",    verifyToken,  checkUserAuth("admin"), errorCatcher(getSingleCashBoxStudent) );
adminRouter.get("/rowTeacherFinancialRecords/:teacherId",    verifyToken,  checkUserAuth("admin"), errorCatcher(getSingleCashBoxTeacher) );
adminRouter.get("/teacherFinancialRecords",    verifyToken,  checkUserAuth("admin"), errorCatcher(getAllCashBoxTeacher) );

// ----------------------------
// This code added by eng.reem.shwky@gamil.com
// ADD
adminRouter.post(
  "/trainingcategorytype", verifyToken, checkUserAuth("admin"), errorCatcher(createTrainingCategoryType)
);
// Update
adminRouter.put( "/updateTrainingCategoryType/:trainingcategorytypeId",verifyToken, checkUserAuth("admin"),errorCatcher(updateTrainingCategoryType));
// Delete
adminRouter.delete( "/trainingcategorytype/:trainingcategorytypeId",  verifyToken,  checkUserAuth("admin"), errorCatcher(deleteTrainingCategoryType) );
adminRouter.get("/trainingcategorytypes", getTrainingCategoryTypes);
adminRouter.get("/TrainingCategoryType/:trainingcategorytypeId", errorCatcher(getSingleTrainingCategoryType));

// ADD
adminRouter.post("/limetype",verifyToken,checkUserAuth("admin"), errorCatcher(createLimeType));
adminRouter.put("/updateLimeType/:limetypeId",  verifyToken,  checkUserAuth("admin"),  errorCatcher(updateLimeType) );
adminRouter.delete( "/limetype/:limetypeId",  verifyToken,  checkUserAuth("admin"), errorCatcher(deleteLimeType));
adminRouter.get("/limetypes", getLimeTypes);                                    // View ALL
adminRouter.get("/LimeType/:limetypeId", errorCatcher(getSingleLimeType));      // View By ID

adminRouter.get("/get/:AdminId", errorCatcher(getSingleAdmin));      // View By Admin ID
adminRouter.post("/addAdmin",  verifyToken,  checkUserAuth("admin"), errorCatcher(createAdmin) );
adminRouter.put( "/updateAdmin/:AdminId",  verifyToken,  checkUserAuth("admin"), errorCatcher(updateAdmin) );
adminRouter.delete( "/deleteAdmin/:AdminId",  verifyToken,  checkUserAuth("admin"), errorCatcher(deleteAdmin) );
adminRouter.get( "/getAdmins/", errorCatcher(getAdmins)); 

adminRouter.get( "/getPackageByStatus/:status", errorCatcher(getPackageByStatus)); 
adminRouter.get( "/getAllPackages", errorCatcher(getAllPackages)); 
adminRouter.post("/acceptPackage/:packageId",   verifyToken,  checkUserAuth("admin"), errorCatcher(acceptPackage));
adminRouter.post("/rejectPackage/:packageId",   verifyToken,  checkUserAuth("admin"), errorCatcher(rejectPackage));
adminRouter.delete( "/deleteParentStudent/:parentStudentId",  verifyToken,  checkUserAuth("admin"), errorCatcher(deleteParentStudent) );
adminRouter.get("/rates", getRates);
adminRouter.delete( "/deleteRates/:rateId",  verifyToken,  checkUserAuth("admin"), errorCatcher(deleteRates) );


adminRouter.get("/drivinglicenses", getDrivingLicenses);                                    
adminRouter.get("/getSingleDrivingLicense/:drivingLicensesId", errorCatcher(getSingleDrivingLicenses));
adminRouter.post("/drivinglicense",verifyToken,checkUserAuth("admin"), errorCatcher(createDrivingLicenses));
adminRouter.put("/updateDrivingLicense/:drivingLicensesId",  verifyToken,  checkUserAuth("admin"),  errorCatcher(updateDrivingLicenses) );
adminRouter.delete("/drivinglicense/:drivingLicensesId",  verifyToken,  checkUserAuth("admin"), errorCatcher(deleteDrivingLicenses));

adminRouter.delete("/sessions/:sessionId",            verifyToken,    checkUserAuth("admin"), errorCatcher(deleteSessions));
adminRouter.get("/parents",                           getAllParents);
adminRouter.post("/sendMail",                         verifyToken,    checkUserAuth("admin"), errorCatcher(sendMail));
adminRouter.post("/sendWhatsapp",                     verifyToken,    checkUserAuth("admin"), errorCatcher(sendWhatsapp));
adminRouter.post("/sendWhatsappWaitingSendMessage",   verifyToken,    checkUserAuth("admin"), errorCatcher(sendWhatsappWaitingSendMessage));
adminRouter.post("/acceptLecture/:lectrueId",         verifyToken,    checkUserAuth("admin"), errorCatcher(acceptTeacherLecture));
adminRouter.post("/rejectLecture/:lectrueId",         verifyToken,    checkUserAuth("admin"), errorCatcher(rejectTeacherLecture));
adminRouter.get("/lectures", getAllLecture);
adminRouter.post("/careerdepartment",                           verifyToken,    checkUserAuth("admin"),    errorCatcher(createCareerDepartment));
adminRouter.get("/careerdepartments",                           getAllCareerDeparment);
adminRouter.get("/careerdepartment/:careerDepartmentId",        getSingleCareerDepartment);
adminRouter.delete("/careerdepartment/:careerDepartmentId",     verifyToken,    checkUserAuth("admin"),     errorCatcher(deleteCareerDepartment) );
adminRouter.put("/careerdepartment/:careerDepartmentId",        verifyToken,    checkUserAuth("admin"),     errorCatcher(updateCareerDepartment));

adminRouter.post("/career",                 verifyToken,        checkUserAuth("admin"),    errorCatcher(createCareer));
adminRouter.get("/careers",                 getAllCareer);
adminRouter.get("/career/:careerId",        getSingleCareer);
adminRouter.delete( "/career/:careerId",    verifyToken,    checkUserAuth("admin"),     errorCatcher(deleteCareer) );
adminRouter.put("/career/:careerId",        verifyToken,    checkUserAuth("admin"),     errorCatcher(updateCareer));
adminRouter.post("/searchcareer/all",       errorCatcher(getAllCareer));
adminRouter.post("/searchcareer/:departmentId",       errorCatcher(getCareerByDepartment));

adminRouter.post("/news",                                   verifyToken,    checkUserAuth("admin"),    errorCatcher(createNews));
adminRouter.get("/news",                                    getNews);
adminRouter.get("/newsrow/:newId",                          getSingleNews);
adminRouter.delete("/news/:newId",      verifyToken,        checkUserAuth("admin"),     errorCatcher(deleteNews) );
adminRouter.put("/news/:newId",         verifyToken,        checkUserAuth("admin"),     errorCatcher(updateNews));

adminRouter.get("/tests",                  getTests);
adminRouter.post("/acceptTests/:testId",   verifyToken,  checkUserAuth("admin"), errorCatcher(acceptTests));
adminRouter.post("/rejectTests/:testId",   verifyToken,  checkUserAuth("admin"), errorCatcher(rejectTests));

adminRouter.post("/exchangerequestteachers",                                verifyToken,    checkUserAuth("admin"),    errorCatcher(createExchangeRequestsTeacher));
adminRouter.get("/exchangerequestteachers",                                 getExchangeRequestsTeachers);
adminRouter.get("/exchangerequestteacher/:exchangeRequestsTeacherId",       getSingleExchangeRequestsTeacher);
adminRouter.delete("/exchangerequestteachers/:exchangeRequestsTeacherId",    verifyToken,         checkUserAuth("admin"),      errorCatcher(deleteExchangeRequestsTeacher) );
adminRouter.put("/exchangerequestteachers/:exchangeRequestsTeacherId",       verifyToken,         checkUserAuth("admin"),     errorCatcher(updateExchangeRequestsTeacher));
adminRouter.put("/exchangerequestteachersbystatus/:exchangeRequestsTeacherId",       verifyToken,         checkUserAuth("admin"),   errorCatcher(updateExchangeRequestsTeacherByStatus));

adminRouter.post("/exchangerequestparents",                                verifyToken,    checkUserAuth("admin"),        errorCatcher(createExchangeRequestsParent));
adminRouter.get("/exchangerequestparents",                                 getExchangeRequestsParents);
adminRouter.get("/exchangerequestparent/:exchangeRequestsParentId",        getSingleExchangeRequestsParent);
adminRouter.delete("/exchangerequestparents/:exchangeRequestsParentId",    verifyToken,         checkUserAuth("admin"),   errorCatcher(deleteExchangeRequestsParent) );
adminRouter.put("/exchangerequestparents/:exchangeRequestsParentId",       verifyToken,         checkUserAuth("admin"),   errorCatcher(updateExchangeRequestsParent));
adminRouter.put("/exchangerequestparentsbystatus/:exchangeRequestsParentId",       verifyToken,         checkUserAuth("admin"),   errorCatcher(updateExchangeRequestsParentByStatus));

adminRouter.post("/exchangerequeststudents",                                 verifyToken,    checkUserAuth("admin"),        errorCatcher(createExchangeRequestsStudent));
adminRouter.get("/exchangerequeststudents",                                  getExchangeRequestsStudents);
adminRouter.get("/exchangerequeststudent/:exchangeRequestsStudentId",        getSingleExchangeRequestsStudent);
adminRouter.delete("/exchangerequeststudents/:exchangeRequestsStudentId",    verifyToken,         checkUserAuth("admin"),   errorCatcher(deleteExchangeRequestsStudent) );
adminRouter.put("/exchangerequeststudents/:exchangeRequestsStudentId",       verifyToken,         checkUserAuth("admin"),   errorCatcher(updateExchangeRequestsStudent));
adminRouter.put("/exchangerequeststudentsbystatus/:exchangeRequestsStudentId",       verifyToken,         checkUserAuth("admin"),   errorCatcher(updateExchangeRequestsStudentByStatus));

adminRouter.post("/ads",                                   verifyToken,    checkUserAuth("admin"),    errorCatcher(createAds));
adminRouter.get("/ads",                                    getAllAds);
adminRouter.get("/adsrow/:adsId",                          getSingleAds);
adminRouter.delete("/ads/:adsId",            verifyToken,        checkUserAuth("admin"),     errorCatcher(deleteAds) );
adminRouter.put("/ads/:adsId",               verifyToken,        checkUserAuth("admin"),     errorCatcher(updateAds));

adminRouter.get("/numbersExchangeRequests",   verifyToken, checkUserAuth("admin"), errorCatcher(getNumbersExchangeRequests));
adminRouter.get("/discounts",                 verifyToken, checkUserAuth("admin"), errorCatcher(getAllDiscounts));
adminRouter.get("/discountsAll",              errorCatcher(getAllDiscounts));
adminRouter.get("/discounts/agree",           errorCatcher(getAllDiscountsAgree));
adminRouter.put("/discounts/:discountId",     verifyToken, checkUserAuth("admin"), errorCatcher(updateDiscountStatus));
adminRouter.post("/createRefundStudent",      verifyToken, checkUserAuth("admin"), errorCatcher(createRefundStudent));
adminRouter.post("/createRefundTeacher",      verifyToken, checkUserAuth("admin"), errorCatcher(createRefundTeacher));

adminRouter.post("/adsdepartment",                       verifyToken,    checkUserAuth("admin"),    errorCatcher(createAdsDepartment));
adminRouter.get("/adsdepartments",                       getAllAdsDeparment);

adminRouter.get("/adsdepartment/:adsDepartmentId",       getSingleAdsDepartment);
adminRouter.delete("/adsdepartment/:adsDepartmentId",    verifyToken,    checkUserAuth("admin"),     errorCatcher(deleteAdsDepartment) );
adminRouter.put("/adsdepartment/:adsDepartmentId",       verifyToken,    checkUserAuth("admin"),     errorCatcher(updateAdsDepartment));

adminRouter.put("/adsStatus/:AdsId",                verifyToken, checkUserAuth("admin"), errorCatcher(updateAdsStatus));
adminRouter.put("/updateCareerStatus/:CareerId",    verifyToken, checkUserAuth("admin"), errorCatcher(updateCareerStatus));
adminRouter.get("/getwhatsurl",                     verifyToken, checkUserAuth("admin"),  getWhatsData);
module.exports = adminRouter;
