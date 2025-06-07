const express = require("express");
const { getAllSubjectCategories, getAllSubjectsByCatId, getSubjects } = require("../controllers/subject.js");
const errorCatcher = require("../middlewares/errorCatcher");

const subjectRouter = express.Router();

subjectRouter.get("/subCategories", errorCatcher(getAllSubjectCategories));
subjectRouter.get("/subjectsById/:id", errorCatcher(getAllSubjectsByCatId));
subjectRouter.get("/allSubjects", errorCatcher(getSubjects));


module.exports = subjectRouter;