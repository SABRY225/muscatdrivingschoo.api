const { serverErrs } = require("../middlewares/customError");
const {
  AdsTeachers, AdsDepartment, AdsImages, Guest,
} = require("../models");

const createAdsTeachersStepOne = async (req, res) => {
  const { AdsDepartmentId, advertiserPhone } = req.body;
  const { TeacherId } = req.params;

  const objAdsTeachersDept = await AdsDepartment.findByPk(AdsDepartmentId[0].AdsDepartmentId);
  if (!objAdsTeachersDept)
    throw serverErrs.BAD_REQUEST("AdsTeachers department not found");

  const newAdsTeachers = await AdsTeachers.create({
    AdsDepartmentId: AdsDepartmentId[0].AdsDepartmentId,
    TeacherId,
    titleAR: "", titleEN: "", descriptionAR: "",
    descriptionEN: "", link: "", image: "",
    advertiserPhone, advertiserAddress: "", status: "1"
  });

  res.status(201).send({
    data: newAdsTeachers,
    msg: {
      arabic: "تم إنشاء الخطوه الأولى بنجاح",
      english: "Step one AdsTeachers created successfully",
    },
  });
};

const createAdsTeachersStepTwo = async (req, res) => {
  const { AdsTeachersId } = req.params;
  const AdsTeachers = await AdsTeachers.findByPk(AdsTeachersId);
  if (!AdsTeachers)
    throw serverErrs.BAD_REQUEST("Ad not found");

  const image = req.files[0].filename;
  const newAdsImages = await AdsImages.create({
    AdsTeacherId: AdsTeachersId,
    image,
  });

  res.status(201).send({
    newAdsImages,
    msg: {
      arabic: "تم رفع الصورة بنجاح",
      english: "Image uploaded successfully",
    },
  });
};

const createAdsTeachersStepThree = async (req, res) => {
  const { titleAR, titleEN, descriptionAR, descriptionEN, link } = req.body;
  const { AdsTeachersId } = req.params;

  const objAdsTeachers = await AdsTeachers.findByPk(AdsTeachersId);
  if (!objAdsTeachers)
    throw serverErrs.BAD_REQUEST("Ad not found");

  await objAdsTeachers.update({ titleAR, titleEN, descriptionAR, descriptionEN, link });

  res.status(201).send({
    data: objAdsTeachers,
    msg: {
      arabic: "تم تعديل بيانات الإعلان بنجاح",
      english: "Ad details updated successfully",
    },
  });
};

const createAdsTeachersStepFour = async (req, res) => {
  const { carModel, yearManufacture, carPrice, currency } = req.body;
  const { AdsTeachersId } = req.params;

  const objAdsTeachers = await AdsTeachers.findByPk(AdsTeachersId);
  if (!objAdsTeachers)
    throw serverErrs.BAD_REQUEST("Ad not found");

  await objAdsTeachers.update({ carModel, yearManufacture, carPrice, currency });

  res.status(201).send({
    data: objAdsTeachers,
    msg: {
      arabic: "تم تعديل بيانات السيارة بنجاح",
      english: "Car details updated successfully",
    },
  });
};

const getAdsTeachersSingle = async (req, res) => {
  const { AdsTeachersId } = req.params;

  const objAdsTeachers = await AdsTeachers.findOne({
    where: { id: AdsTeachersId },
    include: [{ model: AdsDepartment }],
  });

  if (!objAdsTeachers)
    throw serverErrs.BAD_REQUEST("Ad not found");

  res.status(201).send({
    data: objAdsTeachers,
    msg: {
      arabic: "تم ارجاع بيانات الإعلان بنجاح",
      english: "Ad retrieved successfully",
    },
  });
};

const getAdsTeachersAll = async (req, res) => {
  const { TeacherId } = req.params;

  const guest = await Guest.findByPk(TeacherId);
  if (!guest)
    throw serverErrs.BAD_REQUEST("Guest not found");

  const listAdsTeachers = await AdsTeachers.findAll({
    where: { TeacherId },
    include: [{ model: AdsDepartment }],
  });

  const newArr = await Promise.all(listAdsTeachers.map(async (ad) => {
    const images = await AdsImages.findAll({ where: { AdsTeacherId: ad.id } });
    return {
      ...ad.toJSON(),
      images,
    };
  }));

  res.status(201).send({
    data: newArr,
    msg: {
      arabic: "تم ارجاع جميع الإعلانات بنجاح",
      english: "All AdsTeachers retrieved successfully",
    },
  });
};

const getAdsImagesByAdsTeachersId = async (req, res) => {
  const { AdsTeachersId } = req.params;

  const ad = await AdsTeachers.findByPk(AdsTeachersId);
  if (!ad)
    throw serverErrs.BAD_REQUEST("Ad not found");

  const images = await AdsImages.findAll({ where: { AdsTeacherId: AdsTeachersId } });

  res.status(201).send({
    data: images,
    msg: {
      arabic: "تم ارجاع صور الإعلان بنجاح",
      english: "Ad images retrieved successfully",
    },
  });
};

const deleteAdsTeachers = async (req, res) => {
  const { AdsTeachersId } = req.params;

  const ad = await AdsTeachers.findByPk(AdsTeachersId);
  if (!ad)
    throw serverErrs.BAD_REQUEST("Ad not found");

  await ad.destroy();
  res.status(201).send({
    msg: {
      arabic: "تم حذف الإعلان بنجاح",
      english: "Ad deleted successfully",
    },
  });
};

module.exports = {
  createAdsTeachersStepOne,
  createAdsTeachersStepTwo,
  createAdsTeachersStepThree,
  createAdsTeachersStepFour,
  getAdsTeachersSingle,
  getAdsTeachersAll,
  getAdsImagesByAdsTeachersId,
  deleteAdsTeachers,
};
