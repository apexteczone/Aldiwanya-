import joi from "joi";

// Helper للتأكد من صحة الـ Mongo ObjectId (24 Hex characters)
const objectIdPattern = joi.string().hex().length(24).messages({
  "string.hex": "يجب أن يكون معرف ID صالح (Hexadecimal)",
  "string.length": "يجب أن يكون طول معرف ID بالضبط 24 حرفاً",
});

// 1. Validation للـ Params (مثل courseId)
export const courseIdSchema = joi.object({
  id: objectIdPattern.required().messages({
    "any.required": "معرف الكورس (ID) مطلوب في الـ Params",
  }),
});

// 2. Validation لطلب إنشاء كورس جديد (Create Course)
export const createCourseSchema = joi.object({
  title: joi.string().trim().min(2).max(150).required().messages({
    "string.empty": "عنوان الكورس مطلوب",
    "string.min": "عنوان الكورس يجب أن يكون على الأقل حرفين",
    "string.max": "عنوان الكورس لا يمكن أن يتجاوز 150 حرفاً",
    "any.required": "عنوان الكورس حقل إجباري",
  }),

  description: joi.string().trim().max(2000).allow("").optional(),

  subject: joi.string().trim().max(100).required().messages({
    "string.empty": "اسم المادة مطلوب",
    "any.required": "اسم المادة حقل إجباري",
  }),

  grade: objectIdPattern.required().messages({
    "any.required": "يجب ربط الكورس بصف دراسي (Grade)",
  }),

  position: joi.number().integer().min(0).optional().default(0).messages({
    "number.base": "الترتيب يجب أن يكون رقماً",
    "number.min": "الترتيب لا يمكن أن يكون بالسالب",
  }),

  status: joi.string().valid("active", "inactive").optional().default("active").messages({
    "any.only": "الحالة يجب أن تكون إما active أو inactive",
  }),
});

export const updateCourseSchema = joi
  .object({
    title: joi.string().trim().min(2).max(150).optional(),
    description: joi.string().trim().max(2000).allow("").optional(),
    subject: joi.string().trim().max(100).optional(),
    grade: objectIdPattern.optional(),
    position: joi.number().integer().min(0).optional(),
    status: joi.string().valid("active", "inactive").optional(),
  })
  .min(1)
  .messages({
    "object.min": "يجب تقديم حقل واحد على الأقل لتعديله",
  });

export const reorderCoursesSchema = joi.object({
  ids: joi.array().items(objectIdPattern.required()).min(1).required().messages({
    "array.base": "قائمة المعرفات يجب أن تكون مصفوفة (Array)",
    "array.min": "يجب إرسال كورس واحد على الأقل لإعادة الترتيب",
    "any.required": "مصفوفة المعرفات (ids) مطلوبة",
  }),
});