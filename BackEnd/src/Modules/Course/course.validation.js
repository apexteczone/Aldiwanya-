import Joi from 'joi';
const id=Joi.string().hex().length(24);
const grade=Joi.alternatives().try(Joi.number().valid(10,11,12),id);
const fields={price:Joi.number().min(0),durationHours:Joi.number().min(0),lessonsCount:Joi.number().integer().min(0),title:Joi.string().trim().min(2).max(150),description:Joi.string().max(2000).allow(''),
 subject:Joi.string().max(100).allow(''),grade,track:Joi.string().allow('',null),term:Joi.string().allow('',null),
 academicYear:Joi.string().allow('',null),thumbnail:Joi.string().uri({scheme:['https']}).allow('',null),
 position:Joi.number().integer().min(0),status:Joi.string().valid('draft','published','active','inactive')};
export const courseIdSchema=Joi.object({id:id.required()});
export const createCourseSchema=Joi.object({...fields,title:fields.title.required(),grade:grade.required()});
export const updateCourseSchema=Joi.object(fields).min(1);
export const reorderCoursesSchema=Joi.object({gradeId:grade.required(),ids:Joi.array().items(id).unique().min(1).required()});

