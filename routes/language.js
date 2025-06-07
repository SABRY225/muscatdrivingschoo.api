const express = require("express");

const languageRouter = express.Router();
const {
  getAllLanguages,
  addLanguageLevel,
} = require("../controllers/language");
const errorCatcher = require("../middlewares/errorCatcher");

languageRouter.post("/add", errorCatcher(addLanguageLevel));
languageRouter.get("/all", errorCatcher(getAllLanguages));

module.exports = languageRouter;
