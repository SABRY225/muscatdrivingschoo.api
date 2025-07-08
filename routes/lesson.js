const express = require("express");
const { getAllLessonRequest, getAllLessonRequestByStudent,getAllLessonRequestByTeacher, createRequest, acceptRequest, rejectRequest, getAllLessonRequestPanding, getAllLessonRequestByTeacherPending, getLessonRequest, deleteLesson, getCountsLesson } = require("../controllers/Lesson");
const lessionRouter = express.Router();

lessionRouter.patch("/accept-request/:id", acceptRequest);
lessionRouter.get("/get-lessions-request", getAllLessonRequest);
lessionRouter.get("/panding", getAllLessonRequestPanding);
lessionRouter.get("/:id", getLessonRequest);
lessionRouter.get("/teacher/panding/:id", getAllLessonRequestByTeacherPending);
lessionRouter.get("/get-lessions-request-student/:id", getAllLessonRequestByStudent);
lessionRouter.get("/get-lessions-request-teacher/:id", getAllLessonRequestByTeacher);
lessionRouter.get("/pending/count/:teacherId", getCountsLesson);
lessionRouter.post("/create-request", createRequest);
lessionRouter.patch("/reject-request/:id", rejectRequest);
lessionRouter.delete("/:id", deleteLesson);

module.exports = lessionRouter;