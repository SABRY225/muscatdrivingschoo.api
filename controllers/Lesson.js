const { Student, Teacher } = require("../models");
const Lessons = require("../models/Lesson");
const Notification = require("../models/Notification");
const {sendEmailRequest} = require("../utils/sendEmailRequestLession");
const nodemailer = require('nodemailer');
const dotenv = require("dotenv");
dotenv.config();

const createRequest = async (req, res, next) => {
    try {
        const {
            studentId,
            studentName,
            teacherId,
            date,
            period,
            currency,
            price,
            type,
            lang
        } = req.body;

        // إنشاء درس وحفظه مباشرة
        const lessonPromise = Lessons.create({ studentId, teacherId, date, period, currency, price, type });

        // إشعارات المعلم والمدير
        const notifications = [
            Notification.create({
                userId: teacherId,
                userType: "teacher",
                type: "lesson_booking",
                messageAr: "طلب بحجز درس جديد",
                messageEn: "Request to book a new lesson"
            }),
            Notification.create({
                userId: 1,
                userType: "admin",
                type: "lesson_booking",
                messageAr: "طلب بحجز درس جديد",
                messageEn: "Request to book a new lesson"
            })
        ];

        // تنفيذ العمليات بالتوازي
        const [lesson] = await Promise.all([lessonPromise, ...notifications]);

        // البحث عن المعلم
        const teacher = await Teacher.findOne({ where: { id: teacherId } });

        if (teacher?.email) {
            const transporter = nodemailer.createTransport({
                host: "premium174.web-hosting.com",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.APP_EMAIL,
                    pass: process.env.APP_EMAIL_PASSWORD,
                },
            });

            const emailHtml = lang === "ar" ? generateArabicEmail(studentName) : generateEnglishEmail(studentName);
            console.log("teacher.email",teacher.email);
            
            const mailOptions = {
                from: process.env.APP_EMAIL,
                to: teacher.email,
                subject: lang === "ar" ? 'طلب حجز درس جديد' : 'Request to book a new lesson',
                html: emailHtml,
            };

            try {
                const info = await transporter.sendMail(mailOptions);
                console.log('✅ Email sent:', info.response);
            } catch (emailErr) {
                console.error('❌ Failed to send email:', emailErr.message);
            }
        } else {
            console.warn('⚠️ No email found for teacher ID:', teacherId);
        }

        res.status(200).send({
            status: 200,
            message: {
                arabic: "تم إرسال الطلب والإشعارات بنجاح",
                english: "Request and notifications sent successfully"
            }
        });

    } catch (error) {
        console.error('Error in createRequest:', error);
        res.status(500).send({
            status: 500,
            error: error.message,
            message: {
                arabic: "حدث خطأ ما",
                english: "Something went wrong"
            }
        });
    }
};

const generateArabicEmail = (studentName) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; direction: rtl;">
    <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
        <h1>مرحباً بك في منصة مسقط لتعليم قيادة السيارات!</h1>
    </div>
    <div style="padding: 20px;">
        <p>
          تم إرسال طلب حجز درس جديد من الطالب ${studentName}. برجاء مراجعة الطلب.
        </p>
        <p>إذا كان لديك أي أسئلة أو تحتاج إلى مساعدة إضافية، لا تتردد في التواصل مع فريق الدعم لدينا على 
        <a href="mailto:info@muscatdrivingschool.com">info@muscatdrivingschool.com</a>.</p>
        <p>شكراً لاختيارك منصة مسقط لتعليم قيادة السيارات. نتطلع لخدمتك!</p>
    </div>
    <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
        <p>أطيب التحيات،</p>
        منصة مسقط لتعليم قيادة السيارات<br>
        <a href="https://muscatdrivingschool.com/">muscatdrivingschool.com</a><br>
        <p>© منصة مسقط لتعليم قيادة السيارات. جميع الحقوق محفوظة.</p>
        <p>بإرسال هذا البريد الإلكتروني، فإنك تقر وتوافق على 
        <a href="https://muscatdrivingschool.com/TermsAndConditions">شروط الخدمة</a> و 
        <a href="https://muscatdrivingschool.com/PrivacyPolicy">سياسة الخصوصية</a> الخاصة بنا.</p>
    </div>
  </div>
`;

const generateEnglishEmail = (studentName) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <div style="text-align: center; padding: 10px 0; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
        <h1>Welcome to Muscat Driving School Platform!</h1>
    </div>
    <div style="padding: 20px;">
        <p>A new lesson reservation request has been sent from student ${studentName}. Please review the request.</p>
        <p>Should you have any questions or need further assistance, feel free to reach out to our support team at 
        <a href="mailto:info@muscatdrivingschool.com">info@muscatdrivingschool.com</a>.</p>
        <p>Thank you for choosing Muscat Driving School Platform. We look forward to serving you!</p>
    </div>
    <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #ddd;">
        <p>Best regards,</p>
        Muscat Driving School Platform<br>
        <a href="https://muscatdrivingschool.com/">muscatdrivingschool.com</a><br>
        <p>© Muscat Driving School Platform. All rights reserved.</p>
        <p>By sending this email, you acknowledge and agree to our 
        <a href="https://muscatdrivingschool.com/TermsAndConditions">Terms of Service</a> and 
        <a href="https://muscatdrivingschool.com/PrivacyPolicy">Privacy Policy</a>.</p>
    </div>
  </div>
`;



const getAllLessonRequest = async (req, res, next) => {
    try {
        const lessions = await Lessons.findAll();
        if (!lessions) {
            res.send({
                status: 404,
                data: [],
                message: {
                    arabic: "لا يتوفر طلبات حجز حصص حاليا",
                    english: "No lessions available at the moment"
                }
            });
        }
        const lessionsData = await Promise.all(
            lessions.map(async (lession) => {
                const teacher = await Teacher.findOne({
                    where: {
                        id: lession.teacherId,
                    },
                });
                const student = await Student.findOne({
                    where: {
                        id: lession.studentId,
                    },
                });
                return {
                    ...lession.dataValues,
                    teacher: teacher ? teacher.dataValues : null,
                    student: student ? student.dataValues : null,
                };
            })
        );
        res.send({
            status: 200,
            data: lessionsData
        });
    } catch (error) {
        res.status(400).send({
            status: 400,
            error: error,
            message: {
                arabic: "حدث خطأ ما",
                english: "Something went wrong"
            }
        });
    }
}
const getLessonRequest = async (req, res, next) => {
    try {
        // Retrieve lesson ID from request parameters
        const { id } = req.params;

        // Find lesson by primary key
        const lesson = await Lessons.findByPk(id);
        if (!lesson) {
            return res.status(404).send({
                status: 404,
                data: [],
                message: {
                    arabic: "لا يتوفر طلبات حجز حصص حاليا",
                    english: "No lessons available at the moment"
                }
            });
        }

        // Fetch teacher and student data
        const teacher = await Teacher.findOne({ where: { id: lesson.teacherId } });
        const student = await Student.findOne({ where: { id: lesson.studentId } });

        // Construct response data
        const lessonData = {
            ...lesson.dataValues,
            teacher: teacher ? teacher.dataValues : null,
            student: student ? student.dataValues : null,
        };

        // Send response
        res.status(200).send({
            status: 200,
            data: lessonData
        });

    } catch (error) {
        console.error("Error fetching lesson request:", error);
        res.status(500).send({
            status: 500,
            error: error.message,
            message: {
                arabic: "حدث خطأ ما",
                english: "Something went wrong"
            }
        });
    }
};

const deleteLesson = async (req, res) => {
    try {
        const { id } = req.params;
        const lesson = await Lessons.findByPk(id);
        if (!lesson) {
            return res.status(404).send({
                status: 404,
                data: [],
                message: {
                    arabic: "الطلبات غير موجودة",
                    english: "Lessons not found"
                }
            });
        }
        await lesson.destroy();
        res.send({
            status: 200,
            message: {
                arabic: "تم حذف طلب الحجز بنجاح",
                english: "ٌRequest Lesson deleted successfully"
            }
        });
    } catch (error) {
        console.error("Error deleting lesson:", error);
        res.status(500).send({
            status: 500,
            error: error.message,
            message: {
                arabic: "حدث خطأ ما",
                english: "Something went wrong"
            }
        });

    }
}

const getAllLessonRequestPanding = async (req, res, next) => {
    try {
        const lessions = await Lessons.findAll({
            where: {
                status: "pending"
            },
        });
        if (!lessions) {
            res.send({
                status: 404,
                data: [],
                message: {
                    arabic: "لا يتوفر طلبات حجز حصص حاليا",
                    english: "No lessions available at the moment"
                }
            });
        }
        const lessionsData = await Promise.all(
            lessions.map(async (lession) => {
                const teacher = await Teacher.findOne({
                    where: {
                        id: lession.teacherId,
                    },
                });
                const student = await Student.findOne({
                    where: {
                        id: lession.studentId,
                    },
                });
                return {
                    ...lession.dataValues,
                    teacher: teacher ? teacher.dataValues : null,
                    student: student ? student.dataValues : null,
                };
            })
        );
        res.send({
            status: 200,
            data: lessionsData
        });
    } catch (error) {
        res.status(400).send({
            status: 400,
            error: error,
            message: {
                arabic: "حدث خطأ ما",
                english: "Something went wrong"
            }
        });
    }
}

const getAllLessonRequestByStudent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const lessons = await Lessons.findAll({
            where: { studentId: id },
        });

        // إذا لم يكن هناك دروس، يتم إرجاع استجابة 404
        if (!lessons || lessons.length === 0) {
            return res.status(404).send({
                status: 404,
                data: [],
                message: {
                    arabic: "لا يتوفر طلبات حجز حصص حاليا",
                    english: "No lessons available at the moment",
                }
            });
        }

        // تاريخ اليوم للتحقق من انتهاء الدرس
        const currentDate = new Date();

        // معالجة كل درس وإضافة بيانات المدرس + تعديل paymentLink إذا كان الدرس منتهيًا
        const lessonsData = await Promise.all(
            lessons.map(async (lesson) => {
                const teacher = await Teacher.findOne({
                    where: { id: lesson.teacherId },
                });

                // التحقق مما إذا كان تاريخ الدرس قد انتهى
                const isLessonExpired = new Date(lesson.date) < currentDate;
                console.log(isLessonExpired);

                return {
                    ...lesson.dataValues,
                    teacher: teacher ? teacher.dataValues : null,
                    paymentLink: isLessonExpired ? false : lesson.paymentLink, // إذا انتهى، يتم تعيين false
                };
            })
        );

        res.status(200).send({
            status: 200,
            data: lessonsData
        });

    } catch (error) {
        console.error("Error fetching lesson requests:", error);
        res.status(500).send({
            status: 500,
            error: error.message,
            message: {
                arabic: "حدث خطأ ما",
                english: "Something went wrong",
            }
        });
    }
};


const getAllLessonRequestByTeacher = async (req, res, next) => {
    try {
        const { id } = req.params;
        const lessions = await Lessons.findAll(
            {
                where: { teacherId: id },
            }
        );
        if (!lessions) {
            res.send({
                status: 404,
                data: [],
                message: {
                    arabic: "لا يتوفر طلبات حجز حصص حاليا",
                    english: "No lessions available at the moment"
                }
            });
        }
        const lessionsData = await Promise.all(
            lessions.map(async (lession) => {
                const student = await Student.findOne({
                    where: {
                        id: lession.studentId,
                    },
                });
                return {
                    ...lession.dataValues,
                    student: student ? student.dataValues : null,
                };
            })
        );
        res.send({
            status: 200,
            data: lessionsData
        });
    } catch (error) {
        res.status(400).send({
            status: 400,
            error: error,
            message: {
                arabic: "حدث خطأ ما",
                english: "Something went wrong"
            }
        });
    }
}
const getAllLessonRequestByTeacherPending = async (req, res, next) => {
    try {
        const { id } = req.params;
        const lessions = await Lessons.findAll(
            {
                where: { teacherId: id, status: "pending" },
            }
        );
        if (!lessions) {
            res.send({
                status: 404,
                data: [],
                message: {
                    arabic: "لا يتوفر طلبات حجز حصص حاليا",
                    english: "No lessions available at the moment"
                }
            });
        }
        const lessionsData = await Promise.all(
            lessions.map(async (lession) => {
                const student = await Student.findOne({
                    where: {
                        id: lession.studentId,
                    },
                });
                return {
                    ...lession.dataValues,
                    student: student ? student.dataValues : null,
                };
            })
        );
        res.send({
            status: 200,
            data: lessionsData
        });
    } catch (error) {
        res.status(400).send({
            status: 400,
            error: error,
            message: {
                arabic: "حدث خطأ ما",
                english: "Something went wrong"
            }
        });
    }
}
const acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { lang } = req.body;

    const lession = await Lessons.findByPk(id);
    if (!lession) {
      return res.status(404).send({
        status: 404,
        message: {
          arabic: "طلب حجز الدرس غير موجود",
          english: "Request lesson not found",
        },
      });
    }

    const studentPromise = Student.findOne({ where: { id: lession.studentId } });
    const notificationPromise = Notification.create({
      userId: lession.studentId,
      userType: "Student",
      type: "lesson_approved_request",
      messageAr: "تأكيد طلب الحجز الدرس",
      messageEn: "Confirm lesson reservation request",
    });

    lession.status = "approved";

    const [student, notification] = await Promise.all([
      studentPromise,
      notificationPromise,
      lession.save(),
    ]);

    const message =
      lang === "ar"
        ? "تم تأكيد طلبك بنجاح، الرجاء الذهاب إلى قسم مدفوعات طلبات حجز الحصص لإتمام عملية الدفع."
        : "Your request has been confirmed. Please proceed to Class Reservation Payments to complete payment.";

    await sendEmailRequest(student.email, lang, message);

    return res.status(200).send({
      status: 200,
      message: {
        arabic: "تم تأكيد طلب الحجز بنجاح",
        english: "Lesson reservation confirmed successfully",
      },
    });
  } catch (error) {
    return res.status(500).send({
      status: 500,
      error: error.message,
      message: {
        arabic: "حدث خطأ ما",
        english: "Something went wrong",
      },
    });
  }
};


const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { lang } = req.body;

    // ابحث عن الحجز
    const lession = await Lessons.findByPk(id);
    if (!lession) {
      return res.status(404).send({
        status: 404,
        message: {
          arabic: "طلب حجز الدرس غير موجود",
          english: "Lesson reservation request not found",
        },
      });
    }

    // جهز العمليات المطلوبة
    const studentPromise = Student.findOne({ where: { id: lession.studentId } });
    const updateStatusPromise = lession.update({ status: "canceled" });
    const notificationPromise = Notification.create({
      userId: lession.studentId,
      userType: "Student",
      type: "lesson_canceled_request",
      messageAr: "تم رفض طلب الحجز الدرس",
      messageEn: "The lesson reservation request was rejected.",
    });

    // نفذهم مع بعض
    const [student] = await Promise.all([
      studentPromise,
      updateStatusPromise,
      notificationPromise,
    ]);

    // إرسال البريد الإلكتروني
    const message =
      lang === "ar"
        ? "تم رفض طلبك بخصوص حجز الحصة. يمكنك اختيار معلم آخر وطلب حجز حصة جديدة."
        : "Your request to reserve a class has been rejected. You can choose another teacher and request to reserve a class.";

    await sendEmailRequest(student.email, lang, message);

    // الرد
    return res.status(200).send({
      status: 200,
      message: {
        arabic: "تم رفض طلب الحجز الدرس",
        english: "The lesson reservation request was rejected.",
      },
    });

  } catch (error) {
    return res.status(500).send({
      status: 500,
      error: error.message,
      message: {
        arabic: "حدث خطأ ما",
        english: "Something went wrong",
      },
    });
  }
};


const getCountsLesson=async(req, res)=>{
    try {
        const {teacherId}=req.params;
        const pendingCount = await Lessons.count({
          where: {
            status: 'pending',
            teacherId
          }
        });
    
        res.status(200).json({ count: pendingCount });
      } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
      }
}
module.exports = {
    getAllLessonRequest,
    getAllLessonRequestByTeacher,
    getAllLessonRequestByStudent,
    createRequest,
    acceptRequest,
    rejectRequest,
    getAllLessonRequestPanding,
    getAllLessonRequestByTeacherPending,
    getLessonRequest,
    deleteLesson,
    getCountsLesson
}