const { serverErrs } = require("../middlewares/customError");
const { SubjectCategory, Subject } = require("../models");

async function getAllSubjectCategories(req, res) {
  const subCategories = await SubjectCategory.findAll();
  res.send({
    status: 200,
    data: subCategories,
    message: {
      ar: "تم ارجاع المناهج بنجاح",
      en: "The educational subjects has been returned successfully"
    }
  });
}

const getAllSubjectsByCatId = async (req, res) => {
  const { id } = req.params;
  const allSubjects = await Subject.findAll({
    where: {
      SubjectCategoryId: id,
    },
    limit: 4,
  });
  if (!allSubjects) {
    throw new serverErrs.BAD_REQUEST("Not found subjects by this id");
  }
  res.send({
    status: 200,
    data: allSubjects,
    message: {
      ar: "عملية ناجحة",
      en: "Process successfully"
    }
  });
}

async function getSubjects(req, res) {
  try {
    // جلب جميع المواد الدراسية
    const data = await Subject.findAll();

    // التحقق من وجود بيانات
    if (!data || data.length === 0) {
      return res.status(404).send({
        status: 404,
        msg: {
          arabic: "لم يتم العثور على مواد دراسية",
          english: "No subjects found",
        },
      });
    }

    // إرسال البيانات كاستجابة
    res.status(200).send({
      status: 200,
      data,
      msg: {
        arabic: "تم جلب المواد الدراسية بنجاح",
        english: "Subjects retrieved successfully",
      },
    });
  } catch (error) {
    // التعامل مع الأخطاء
    res.status(500).send({
      status: 500,
      msg: {
        arabic: "حدث خطأ أثناء جلب المواد الدراسية",
        english: "An error occurred while retrieving subjects",
      },
      error: error.message,
    });
  }
}


module.exports = { getAllSubjectCategories, getAllSubjectsByCatId, getSubjects };