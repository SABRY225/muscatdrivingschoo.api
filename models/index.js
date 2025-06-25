const Admin = require("./Admin");
const Student = require("./Student");
const Parent = require("./Parent");
const Level = require("./Level");
const Wallet = require("./Wallet");
const Class = require("./Class");
const Subject = require("./Subject");
const SubjectCategory = require("./SubjectCategory");
const TeacherSubject = require("./TeacherSubject");
const Days = require("./Days");
const TeacherDay = require("./TeacherDay");
const ParentStudent = require("./ParentStudent");
const EducationDegree = require("./EducationDegree");
const Teacher = require("./Teacher");
const Experience = require("./Experience");
const Time = require("./Time");
const RemoteSession = require("./RemoteSession");
const F2FSessionStd = require("./F2FSessionStd");
const F2FSessionTeacher = require("./F2FSessionTeacher");
const Language = require("./Language");
const LangTeachStd = require("./LangTeachStd");
const Session = require("./Session");
const TeacherLevel = require("./TeacherLevel");
const CurriculumTeacher = require("./CurriculumTeacher");
const Curriculum = require("./Curriculum");
const CurriculumLevel = require("./CurriculumLevel");
const Certificates = require("./Certificates");
const LanguageLevel = require("./LanguageLevel");
const Rate = require("./Rate");
const FinancialRecord = require("./financialRecord");
const SocialMedia = require("./SocialMedia");
const CheckoutRequest      = require("./CheckoutRequest");
// ADD By eng.reem.shwky@gmail.com
const TrainingCategoryType = require("./TrainingCategoryType");
const TeacherTypes      = require("./TeacherTypes");
const LimeType          = require("./LimeType");
const TeacherLimits     = require("./TeacherLimits");
const TeacherLecture    = require("./TeacherLecture");
const TeacherLesson     = require("./TeacherLesson");
const StudentLecture    = require("./StudentLecture");
const Package           = require("./Package");
const StudentPackage          = require("./StudentPackage");
const StudentDiscount         = require("./StudentDiscount");
const DrivingLicenses         = require("./DrivingLicenses");
const TeacherQuestion         = require("./TeacherQuestion");
const TeacherQuestionChoose   = require("./TeacherQuestionChoose");
const CareerDepartment        = require("./CareerDepartment");
const Career                  = require("./Career");
const News                    = require("./News");
const Tests                   = require("./Tests");
const ExchangeRequestsTeacher = require("./ExchangeRequestsTeacher");
const ExchangeRequestsParent  = require("./ExchangeRequestsParent");
const ExchangeRequestsStudent = require("./ExchangeRequestsStudent");
const StudentTest             = require("./StudentTest");
const AdsDepartment           = require("./AdsDepartment");
const Ads                     = require("./Ads");
const AdsImages               = require("./AdsImages");
const Discounts               = require("./Discounts");
const StudentRefund           = require("./StudentRefund");
const TeacherRefund           = require("./TeacherRefund");
const Guest                   = require("./Guest");
const WhatsData               = require("./WhatsData");
const Evaluations = require("./Evaluation");

Teacher.hasMany(LangTeachStd);
LangTeachStd.belongsTo(Teacher);
Language.hasMany(LangTeachStd);
LangTeachStd.belongsTo(Language);
Student.hasMany(LangTeachStd);
LangTeachStd.belongsTo(Student);
Teacher.hasMany(Experience);
LangTeachStd.belongsTo(LanguageLevel);
LanguageLevel.hasMany(LangTeachStd);
Experience.belongsTo(Teacher);
Teacher.hasMany(Session);
Session.belongsTo(Teacher);
Student.hasMany(Session);
Session.belongsTo(Student);
Teacher.hasMany(EducationDegree);
EducationDegree.belongsTo(Teacher);
Teacher.hasMany(Certificates);
Certificates.belongsTo(Teacher);
Teacher.hasMany(TeacherDay);
TeacherDay.belongsTo(Teacher);
Days.hasMany(TeacherDay);
TeacherDay.belongsTo(Days);


// Time.belongsTo(TeacherDay);
// Teacher.hasMany(Conversation);
// Conversation.belongsTo(Teacher);
// Student.hasMany(Conversation);
// Conversation.belongsTo(Student);
// Conversation.hasMany(Message);
// Message.belongsTo(Conversation);
Evaluations.belongsTo(Teacher, { foreignKey: "TeacherId" });
Teacher.hasMany(Evaluations, { foreignKey: "TeacherId" });

Teacher.hasOne(F2FSessionStd);
F2FSessionStd.belongsTo(Teacher);
Teacher.hasOne(RemoteSession);
RemoteSession.belongsTo(Teacher);
Teacher.hasOne(F2FSessionTeacher);
F2FSessionTeacher.belongsTo(Teacher);
Parent.hasMany(ParentStudent);
ParentStudent.belongsTo(Parent);
Student.hasMany(ParentStudent);
ParentStudent.belongsTo(Student);
Curriculum.hasMany(CurriculumLevel);
CurriculumLevel.belongsTo(Curriculum);
Level.hasMany(CurriculumLevel);
CurriculumLevel.belongsTo(Level);
Level.hasMany(Class);
Class.belongsTo(Level);
Level.hasMany(Student);
Student.belongsTo(Level);
Class.hasMany(Student);
Student.belongsTo(Class);
Level.hasMany(TeacherLevel);
TeacherLevel.belongsTo(Level);
Teacher.hasMany(TeacherLevel);
TeacherLevel.belongsTo(Teacher);
Curriculum.hasMany(CurriculumTeacher);
CurriculumTeacher.belongsTo(Curriculum);
Teacher.hasMany(CurriculumTeacher);
CurriculumTeacher.belongsTo(Teacher);
Curriculum.hasMany(Student);
Student.belongsTo(Curriculum);
SubjectCategory.hasMany(Subject);
Subject.belongsTo(SubjectCategory);
Subject.hasMany(TeacherSubject);
TeacherSubject.belongsTo(Subject);
Teacher.hasMany(TeacherSubject);
TeacherSubject.belongsTo(Teacher);
Student.hasMany(Wallet);
Wallet.belongsTo(Student);
Student.belongsTo(Parent);
Parent.hasMany(Student);
Teacher.hasMany(Rate);
Rate.belongsTo(Teacher);
Student.hasMany(Rate);
Rate.belongsTo(Student);
Teacher.hasMany(FinancialRecord);
FinancialRecord.belongsTo(Teacher);
Student.hasMany(FinancialRecord);
FinancialRecord.belongsTo(Student);
Teacher.hasMany(CheckoutRequest);
CheckoutRequest.belongsTo(Teacher);

// ADD By eng.reem.shwky@gamil.com
Teacher.hasMany(TeacherTypes);
TeacherTypes.belongsTo(Teacher);
TrainingCategoryType.hasMany(TeacherTypes);
TeacherTypes.belongsTo(TrainingCategoryType);

Teacher.hasMany(TeacherLimits);
TeacherLimits.belongsTo(Teacher);
LimeType.hasMany(TeacherLimits);
TeacherLimits.belongsTo(LimeType);
Teacher.hasMany(TeacherLecture);
TeacherLecture.belongsTo(Teacher);

Teacher.hasMany(TeacherLesson);
TeacherLesson.belongsTo(Teacher);
TeacherLecture.hasMany(TeacherLesson);
TeacherLesson.belongsTo(TeacherLecture);
TeacherLecture.hasMany(StudentLecture);
StudentLecture.belongsTo(TeacherLecture);

Student.hasMany(StudentLecture);
StudentLecture.belongsTo(Student);

Teacher.hasMany(Package);
Package.belongsTo(Teacher);
TrainingCategoryType.hasMany(Package);
Package.belongsTo(TrainingCategoryType);
LimeType.hasMany(Package);
Package.belongsTo(LimeType);
Level.hasMany(Package);
Package.belongsTo(Level);
SubjectCategory.hasMany(Package);
Package.belongsTo(SubjectCategory);

Student.hasMany(StudentPackage);
StudentPackage.belongsTo(Student);
Package.hasMany(StudentPackage);
StudentPackage.belongsTo(Package);

Student.hasMany(StudentDiscount);
StudentDiscount.belongsTo(Student);
Discounts.hasMany(StudentDiscount);
StudentDiscount.belongsTo(Discounts);

Teacher.hasMany(TeacherQuestion);
TeacherQuestion.belongsTo(Teacher);
TeacherLecture.hasMany(TeacherQuestion);
TeacherQuestion.belongsTo(TeacherLecture);
TeacherQuestion.hasMany(TeacherQuestionChoose);
TeacherQuestionChoose.belongsTo(TeacherQuestion);
Teacher.hasMany(TeacherQuestionChoose);
TeacherQuestionChoose.belongsTo(Teacher);
CareerDepartment.hasMany(Career);
Career.belongsTo(CareerDepartment);

Teacher.hasMany(Tests);
Tests.belongsTo(Teacher);

Level.hasMany(Tests);
Tests.belongsTo(Level);

Teacher.hasMany(ExchangeRequestsTeacher);
ExchangeRequestsTeacher.belongsTo(Teacher);
Admin.hasMany(ExchangeRequestsTeacher);
ExchangeRequestsTeacher.belongsTo(Admin);

Student.hasMany(ExchangeRequestsStudent);
ExchangeRequestsStudent.belongsTo(Student);
Admin.hasMany(ExchangeRequestsStudent);
ExchangeRequestsStudent.belongsTo(Admin);

Parent.hasMany(ExchangeRequestsParent);
ExchangeRequestsParent.belongsTo(Parent);
Admin.hasMany(ExchangeRequestsParent);
ExchangeRequestsParent.belongsTo(Admin);

Student.hasMany(StudentTest);
StudentTest.belongsTo(Student);
Tests.hasMany(StudentTest);
StudentTest.belongsTo(Tests);

Teacher.hasMany(Discounts);
Discounts.belongsTo(Teacher);

Student.hasMany(StudentRefund);
StudentRefund.belongsTo(Student);
Admin.hasMany(StudentRefund);
StudentRefund.belongsTo(Admin);

Teacher.hasMany(TeacherRefund);
TeacherRefund.belongsTo(Teacher);
Admin.hasMany(TeacherRefund);
TeacherRefund.belongsTo(Admin);

Guest.hasMany(Career);
Career.belongsTo(Guest);

Guest.hasMany(Ads);
Ads.belongsTo(Guest);

AdsDepartment.hasMany(Ads);
Ads.belongsTo(AdsDepartment);

Ads.hasMany(AdsImages);
AdsImages.belongsTo(Ads);

module.exports = {
  Admin,
  Student,            Parent,             Level,
  Wallet,             Class,              Subject,
  SubjectCategory,    Days,               TeacherDay,
  ParentStudent,      EducationDegree,
  Teacher,            Experience,         Time,
  RemoteSession,      F2FSessionStd,      F2FSessionTeacher,
  Language,           LangTeachStd,
  Session,            TeacherLevel,
  Curriculum,         Certificates,       CurriculumLevel,
  CurriculumTeacher,  LanguageLevel,      FinancialRecord,
  Rate,               SocialMedia,        CheckoutRequest,

  // Developer By eng.reem.shwky@gmail.com
  TrainingCategoryType,     LimeType,
  TeacherTypes,             TeacherLimits,
  TeacherLecture,           TeacherLesson,          
  TeacherQuestion,          TeacherQuestionChoose,      Package,
  StudentPackage,           DrivingLicenses,
  CareerDepartment,         Career,
  News,                     Tests,                    Guest,
  ExchangeRequestsParent,   ExchangeRequestsStudent,  ExchangeRequestsTeacher,
  StudentTest,              Ads,                      AdsDepartment,
  Discounts,                StudentRefund,            TeacherRefund,       
  AdsImages,                StudentDiscount,          WhatsData,
};
