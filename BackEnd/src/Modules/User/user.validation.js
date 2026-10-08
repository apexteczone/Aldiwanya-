import Joi from 'joi';
export const updateMyProfileSchema=Joi.object({fullName:Joi.string().trim().min(3).max(100),email:Joi.string().trim().lowercase().email(),phoneNumber:Joi.string().pattern(/^\+965[569]\d{7}$/),gradePreference:Joi.number().valid(10,11,12)}).min(1);

