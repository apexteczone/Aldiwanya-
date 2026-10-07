// src/middlewares/parseCourseData.js

export const parseCourseData = (req, res, next) => {
  if (req.body) {
    // 1. تحديد الحقول المسموح بها في Joi Schema
    const allowedFields = ['title', 'grade', 'description', 'subject', 'position', 'status'];

    // 2. تنظيف req.body وحذف أي حقل إضافي مش موجود في Schema (مثل price, lessonsCount, durationHours)
    Object.keys(req.body).forEach((key) => {
      if (!allowedFields.includes(key)) {
        delete req.body[key];
      }
    });

    // 3. تحويل الحقول الرقمية من String إلى Number
    if (req.body.position !== undefined) {
      req.body.position = Number(req.body.position) || 0;
    }

    // 4. إسناد عنوان المادة إلى subject تلقائياً لو مش موجود
    if (!req.body.subject && req.body.title) {
      req.body.subject = req.body.title;
    }
  }

  next();
};