const path = require("path");
const fs = require("fs");
const { Career, CareerDepartment } = require("../models");
const { serverErrs } = require("../middlewares/customError");
// getCareerByGuest
const getCareerByGuest = async (req, res) => {
  const { TeacherId } = req.params;
  const arrCareer = await Career.findAll({
    where: { TeacherId },
    include: { all: true },
  });
  res.status(201).send({
    data: arrCareer,
    msg: {
      arabic: "تم ارجاع جميع الوظائف بنجاح",
      english: "successful get all careers",
    },
  });
};
// createCareer
const createCareer = async (req, res) => {
  const {
    titleAR, titleEN, country,
    descriptionAr, descriptionEn,
    advertiserName, advertiserPhone,
    CareerDepartmentId, TeacherId
  } = req.body;
  const image = req.files[0].filename;

  const objCareerDepartment = await CareerDepartment.findByPk(CareerDepartmentId);
  if (!objCareerDepartment) {
    throw serverErrs.BAD_REQUEST({
      arabic: "قسم الوظيفة غير موجود",
      english: "Career Department not found",
    });
  }

  const newCareer = await Career.create({
    titleAR, titleEN, country,
    descriptionAr, descriptionEn,
    CareerDepartmentId, image,
    advertiserName, advertiserPhone,
    TeacherId, status: "1"
  });

  res.status(201).send({
    data: newCareer,
    msg: {
      arabic: "تم إنشاء وظيفه جديده بنجاح",
      english: "Successful career creation",
    },
  });
};
// deleteCareer
const deleteCareer = async (req, res) => {
  const { careerId } = req.params;
  const objCareer = await Career.findByPk(careerId);
  if (!objCareer) throw serverErrs.BAD_REQUEST("Career not found");
  await objCareer.destroy();
  res.status(201).send({
    msg: {
      arabic: "تم حذف الوظيفة بنجاح",
      english: "Career deleted successfully",
    },
  });
};
// updateCareer
const updateCareer = async (req, res) => {
  const { titleAR, titleEN, country, descriptionAr, descriptionEn, advertiserName, advertiserPhone, CareerDepartmentId } = req.body;
  const { careerId } = req.params;

  const objCareer = await Career.findByPk(careerId);
  if (!objCareer) {
    throw serverErrs.BAD_REQUEST({
      arabic: "الوظيفة غير موجودة",
      english: "Career not found",
    });
  }

  await objCareer.update({
    titleAR, titleEN, country, descriptionAr, descriptionEn,
    advertiserName, advertiserPhone, CareerDepartmentId
  });

  if (req.files && objCareer.image) {
    const filePath = path.join(__dirname, "..", "images", objCareer.image);
    fs.unlink(filePath, () => {});
  }

  if (req.files) {
    await objCareer.update({ image: req.files[0].filename});
  }

  res.status(201).send({
    data: objCareer,
    msg: {
      arabic: "تم تعديل الوظيفة بنجاح",
      english: "Career updated successfully",
    },
  });
};

const createCareerStepOne = async (req, res) => {
  const { CareerDepartmentId } = req.body;
  const { TeacherId } = req.params;

  const objDepartment = await CareerDepartment.findByPk(CareerDepartmentId[0].CareerDepartmentId);
  if (!objDepartment) throw serverErrs.BAD_REQUEST("Invalid Career Department");

  const newCareer = await Career.create({
    CareerDepartmentId: CareerDepartmentId[0].CareerDepartmentId,
    TeacherId,
    titleAR: "", titleEN: "", descriptionAr: "",
    descriptionEn: "", country: "", image: "",
    advertiserName: "", advertiserPhone: "", status: "1"
  });

  res.status(201).send({
    data: newCareer,
    msg: {
      arabic: "تم إنشاء الخطوة الأولى بنجاح",
      english: "Step one career created successfully",
    },
  });
};

const createCareerStepTwo = async (req, res) => {
  const { titleAR, titleEN, descriptionAR, descriptionEN } = req.body;
  const { CareerId } = req.params;

  const objCareer = await Career.findByPk(CareerId);
  if (!objCareer) throw serverErrs.BAD_REQUEST("Career not found");

  await objCareer.update({
    titleAR, titleEN, descriptionAr: descriptionAR, descriptionEn: descriptionEN
  });

  if (req.files && objCareer.image) {
    const filePath = path.join(__dirname, "..", "images", objCareer.image);
    fs.unlink(filePath, () => {});
  }

  if (req.files) {
    await objCareer.update({ image: req.files[0].filename });
  }

  res.status(201).send({
    data: objCareer,
    msg: {
      arabic: "تم إنشاء الخطوة الثانية بنجاح",
      english: "Step two career created successfully",
    },
  });
};

module.exports = {
  getCareerByGuest,
  createCareer,
  deleteCareer,
  updateCareer,
  createCareerStepOne,
  createCareerStepTwo,
};
