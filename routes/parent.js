const express = require("express");

const parentRouter = express.Router();
const {
  signUp,
  getSingleParent,
  addStudentToParent,
  getStudentsByParentId,
  editPersonalInformation,
  // Code by eng.reem.shwky@gmail.com
  settingNotification,
  editImageParent,
  resetPassword,
  updateLogout,
} = require("../controllers/parent");
const checkUserAuth = require("../middlewares/checkUserAuth");
const errorCatcher  = require("../middlewares/errorCatcher");
const login         = require("../middlewares/login");
const verifyToken   = require("../middlewares/verifyToken");

parentRouter.post("/signup", errorCatcher(signUp));
parentRouter.post("/login", errorCatcher(login));
parentRouter.post(
  "/add",
  verifyToken,
  checkUserAuth("parent"),
  errorCatcher(addStudentToParent)
);

// Developer By eng.reem.shwky@gamil.com
parentRouter.get(
  "/getStudents/:ParentId", verifyToken,  checkUserAuth("parent"),  errorCatcher(getStudentsByParentId)
);
parentRouter.get("/get/:ParentId",        verifyToken,checkUserAuth("parent"),errorCatcher(getSingleParent));
parentRouter.post("/editProfile/:ParentId",verifyToken,checkUserAuth("parent"),errorCatcher(editPersonalInformation));
parentRouter.post(
  "/setting/:PatentId", verifyToken,  checkUserAuth("parent"),  errorCatcher(settingNotification) 
);

parentRouter.post("/editImage/:ParentId",verifyToken,checkUserAuth("parent"), errorCatcher(editImageParent)
);
parentRouter.put(
  "/resetPassword/:ParentId",verifyToken,checkUserAuth("parent"),errorCatcher(resetPassword)
);
parentRouter.post( "/updatelogout/:parentId",       errorCatcher(updateLogout));

module.exports = parentRouter;
