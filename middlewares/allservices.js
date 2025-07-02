// controllers/homeController.js
const { TeacherLecture, Package, Tests, Discounts, Ads, News, AdsImages, AdsDepartment, AdsTeachers } = require("../models");

const getHomeData = async (req, res) => {
  try {
    // جلب الكيانات الرئيسية بحالة status = 2
    const [lectures, packages, exams, discounts, news] = await Promise.all([
      TeacherLecture.findAll({ where: { status: 2 } }),
      Package.findAll({ where: { status: 2 } }),
      Tests.findAll({ where: { status: 2 } }),
      Discounts.findAll({ where: { status: 2 } }),
      News.findAll(), // الأخبار ليس لها شرط حالة
    ]);

    // جلب الإعلانات العامة
    const listAds = await Ads.findAll({
      where: { status: 2 },
      include: [{ model: AdsDepartment }],
    });

    // جلب إعلانات المعلمين
    const listAdsTeacher = await AdsTeachers.findAll({
      where: { status: 2 },
      include: [{ model: AdsDepartment }],
    });

    // تجهيز الإعلانات العامة
    const advertisements = [];
    for (let i = 0; i < listAds.length; i++) {
      const ad = listAds[i];
      const arrImages = await AdsImages.findAll({ where: { AdId: ad.id } });
      const image = arrImages?.[0]?.image || "";

      advertisements.push({
        id: ad.id,
        images: arrImages,
        image,
        createdAt: ad.createdAt,
        updatedAt: ad.updatedAt,
        titleAR: ad.titleAR,
        titleEN: ad.titleEN,
        descriptionAR: ad.descriptionAR,
        descriptionEN: ad.descriptionEN,
        link: ad.link,
        advertiserPhone: ad.advertiserPhone,
        advertiserAddress: ad.advertiserAddress,
        status: ad.status,
        GuestId: ad.GuestId,
        AdsDepartmentId: ad.AdsDepartmentId,
        carModel: ad.carModel,
        yearManufacture: ad.yearManufacture,
        carPrice: ad.carPrice,
        currency: ad.currency,
        type: "guest",
      });
    }

    // تجهيز إعلانات المعلمين
    for (let i = 0; i < listAdsTeacher.length; i++) {
      const ad = listAdsTeacher[i];
      const arrImages = await AdsImages.findAll({ where: { AdsTeacherId: ad.id } });
      const image = arrImages?.[0]?.image || "";

      advertisements.push({
        id: ad.id,
        images: arrImages,
        image,
        createdAt: ad.createdAt,
        updatedAt: ad.updatedAt,
        titleAR: ad.titleAR,
        titleEN: ad.titleEN,
        descriptionAR: ad.descriptionAR,
        descriptionEN: ad.descriptionEN,
        link: ad.link,
        advertiserPhone: ad.advertiserPhone,
        advertiserAddress: ad.advertiserAddress,
        status: ad.status,
        TeacherId: ad.TeacherId,
        AdsDepartmentId: ad.AdsDepartmentId,
        carModel: ad.carModel,
        yearManufacture: ad.yearManufacture,
        carPrice: ad.carPrice,
        currency: ad.currency,
        type: "teacher",
      });
    }

    // الرد النهائي
    res.status(200).json({
      lectures,
      packages,
      exams,
      discounts,
      news,
      advertisements,
    });

  } catch (error) {
    console.error("Error in getHomeData:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getHomeData };
