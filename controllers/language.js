const { Language, LanguageLevel } = require("../models");
// const { serverErrs } = require("../middlewares/customError");

const getAllLanguages = async (req, res) => {
  const languages = await Language.findAll();
  res.send({
    status: 201,
    data: languages,
    msg: {arabic: "تم ارجاع جميع اللغات", english: "successful get all languages"},
  });
};

const addLanguageLevel = async (req, res) => {
  const LanguageLevelData = [
    {
      titleAR: "مبتدئ",
      titleEN: "beginner",
    }, //1
    {
      titleAR: "متوسط",
      titleEN: "intermediate",
    }, //2
    {
      titleAR: "فوق متوسط",
      titleEN: "Above average",
    }, //3
    {
      titleAR: "متقدم",
      titleEN: "advanced",
    }, //4
    {
      titleAR: "اللغة الأم",
      titleEN: "native language",
    }, //5
  ];
  await LanguageLevel.bulkCreate(LanguageLevelData);
  res.send({
    status: 201,
    msg: {arabic: "ادخال مستويات اللغة بنجاح", english: "Language Level data have been saved"},
  });
};

module.exports = {
  getAllLanguages,
  addLanguageLevel,
};
