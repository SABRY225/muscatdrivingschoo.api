const express         = require("express");
const router = express.Router();
router.get('/', function(req, res, next) {
  const response = {}
  res.status(200).json({ 'message' :  response})
});

const inviteRouter = require("./Invite");
const adminRouter     = require("./admin");
const studentRouter   = require("./student");
const teacherRouter   = require("./teacher");
const subjectRouter = require("./subject");
const guestRouter     = require("./guest");
const parentRouter    = require("./parent");
const LanguageRouter  = require("./language");
const login           = require("../middlewares/login");
const logout          = require("../middlewares/logout");
const errorCatcher    = require("../middlewares/errorCatcher");
const { getSingleTeacher } = require("../controllers/student");
const messagerouter = require("./messages");
const notificationRouter = require("./notification");
const { getCounts } = require("../controllers/admin");
const paymentRouter   = require("./payment");
const {forgetPassword,verifyCodeForgottenPassword,editForgottenPassword,} = require("../middlewares/forgetPassword");
const currencyRouter = require("./currency");
const { getHomeData } = require("../middlewares/allservices");
router.use("/admin",    adminRouter);
router.use("/teacher",  teacherRouter);
router.use("/guest" ,   guestRouter);
router.use("/student",  studentRouter);
router.use("/parent",   parentRouter);
router.use("/language", LanguageRouter);
router.use("/payment",  paymentRouter);
router.use("/subject", subjectRouter);
router.post("/login",   errorCatcher(login));
router.get("/logout",   logout);
router.get("/allservices",   getHomeData);
router.use("/teacherSession/:teacherId", getSingleTeacher);
router.post("/forgetPassword", errorCatcher(forgetPassword));
router.post("/forgetPassword/code", errorCatcher(verifyCodeForgottenPassword));
router.post("/forgetPassword/edit", errorCatcher(editForgottenPassword));
router.use("/currency", currencyRouter);
router.use("/invite", inviteRouter);
router.use("/notification", notificationRouter);
router.use("/message", messagerouter);
router.get("/dashboard/counts", getCounts);

module.exports = router;
