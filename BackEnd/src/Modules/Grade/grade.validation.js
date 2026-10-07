import Joi from "joi";

// Helper لضمان صحة الـ Mongo ObjectId في الـ Params
const objectIdValidation = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message("Invalid ObjectId format");
  }
  return value;
};

export const createGradeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Grade name is required",
    "string.min": "Grade name must be at least 2 characters long",
    "string.max": "Grade name cannot exceed 100 characters",
    "any.required": "Grade name is required",
  }),
  description: Joi.string().allow("").optional(),
  position: Joi.number().integer().min(0).optional().default(0).messages({
    "number.base": "Position must be a number",
    "number.min": "Position cannot be negative",
  }),

  status: Joi.string().valid("active", "inactive").optional().default("active").messages({
    "any.only": "Status must be either 'active' or 'inactive'",
  }),
}).required();

export const updateGradeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  position: Joi.number().integer().min(0).optional(),
  status: Joi.string().valid("active", "inactive").optional(),
  description: Joi.string().allow("").optional(),
}).required();

export const gradeParamsSchema = Joi.object({
  gradeId: Joi.string().custom(objectIdValidation).required().messages({
    "any.required": "Grade ID is required",
  }),
}).required();