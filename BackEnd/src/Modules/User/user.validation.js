import Joi from "joi";

export const updateMyProfileSchema = Joi.object({
  fullName: Joi.string()
    .trim()
    .min(3)
    .max(100),

  gradePreference: Joi.number()
    .valid(10, 11, 12),
})
  .min(1)
  .unknown(false);