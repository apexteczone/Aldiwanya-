import Joi from "joi";

const objectIdPattern = Joi.string().hex().length(24).messages({
  "string.hex": "يجب أن يكون معرف ID صالح",
  "string.length": "يجب أن يكون طول ID بالضبط 24 حرفاً",
});

export const createPdfSchema = Joi.object({
  type: Joi.string().trim().max(100).optional(),
  title: Joi.string().trim().min(2).max(150).required().messages({
    "string.empty": "عنوان الملف مطلوب",
    "any.required": "عنوان الملف حقل إجباري",
  }),

  description: Joi.string().trim().max(2000).allow("").optional(),

  course: objectIdPattern.required().messages({
    "any.required": "يجب ربط الملف بكورس (Course)",
  }),

  lesson: objectIdPattern.optional().allow(null, ""),

  isFreePreview: Joi.boolean().optional().default(true),

  status: Joi.string().valid("active", "inactive").optional().default("active"),
});

export const updatePdfSchema = Joi.object({
  type: Joi.string().trim().max(100).optional(),
  title: Joi.string().trim().min(2).max(150).optional(),
  description: Joi.string().trim().max(2000).allow("").optional(),
  course: objectIdPattern.optional(),
  lesson: objectIdPattern.optional().allow(null, ""),
  isFreePreview: Joi.boolean().optional(),
  status: Joi.string().valid("active", "inactive").optional(),
}).min(0);

export const pdfIdSchema = Joi.object({
  id: objectIdPattern.required(),
});

export const coursePdfsSchema = Joi.object({
  courseId: objectIdPattern.required(),
});