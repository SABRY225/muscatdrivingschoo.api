const express     = require("express");
const guestRouter = express.Router();
const {
  signUp,               verifyCode,         signUpData,
  guestLogin,           getSingleGuest,     editProfile,
  editPhoto,            getCareerByGuest,
  createCareer,         deleteCareer,       updateCareer,
  createAdsStepOne,     createAdsStepTwo,   createAdsStepThree, 
  resetPassword,        getAdsSingle,       getAdsAll,
  getAdsImagesByAdsId,  deleteAds,
  createCareerStepOne,  createCareerStepTwo,  createAdsStepFour,
} = require("../controllers/guest");
const errorCatcher    = require("../middlewares/errorCatcher");
const verifyToken     = require("../middlewares/verifyToken");
const checkUserAuth   = require("../middlewares/checkUserAuth");

guestRouter.post("/signup",                   errorCatcher(signUp));
guestRouter.post("/signup/data",              errorCatcher(signUpData));

guestRouter.post("/signup/code",            errorCatcher(verifyCode));
guestRouter.post("/login" ,                 errorCatcher(guestLogin ));
guestRouter.get("/get/:guestId" ,           errorCatcher(getSingleGuest));
guestRouter.post("/editProfile/:GuestId",   errorCatcher(editProfile));
guestRouter.post("/editPhoto/:GuestId",     errorCatcher(editPhoto));
guestRouter.put("/resetPassword/:GuestId",  verifyToken,checkUserAuth("guest"),errorCatcher(resetPassword));

guestRouter.post("/career",                         verifyToken,    checkUserAuth("guest"),    errorCatcher(createCareer));
guestRouter.get("/careers/:GuestId",                errorCatcher(getCareerByGuest));
guestRouter.delete("/career/:careerId",             verifyToken,    checkUserAuth("guest"),     errorCatcher(deleteCareer) );
guestRouter.put("/career/:careerId",                verifyToken,    checkUserAuth("guest"),     errorCatcher(updateCareer));

guestRouter.post("/addcareer/step1/:GuestId" ,        errorCatcher(createCareerStepOne) );
guestRouter.post("/addcareer/step2/:CareerId" ,       errorCatcher(createCareerStepTwo) );

guestRouter.post("/addads/step1/:GuestId" ,        errorCatcher(createAdsStepOne) );
guestRouter.post("/addads/step2/:AdsId" ,          errorCatcher(createAdsStepTwo) );
guestRouter.post("/addads/step3/:AdsId" ,          errorCatcher(createAdsStepThree) );
guestRouter.post("/addads/step4/:AdsId" ,          errorCatcher(createAdsStepFour) );
guestRouter.get("/ads/:GuestId" ,                  errorCatcher(getAdsAll) );
guestRouter.get("/adsimages/:AdsId" ,              errorCatcher(getAdsImagesByAdsId) );
guestRouter.get("/adssingle/:AdsId" ,              errorCatcher(getAdsSingle) );
guestRouter.delete("/ads/:AdsId",                  errorCatcher(deleteAds) );

module.exports = guestRouter;
