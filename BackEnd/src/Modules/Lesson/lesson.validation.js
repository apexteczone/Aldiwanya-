import Joi from 'joi';
const id=Joi.string().hex().length(24);
const fields={courseId:id,moduleId:id,title:Joi.string().trim().min(2).max(150),description:Joi.string().max(2000).allow(''),internalNotes:Joi.string().max(2000).allow(''),position:Joi.number().integer().min(0),isFreePreview:Joi.boolean(),status:Joi.string().valid('draft','published')};
export const getLessonByIdSchema=Joi.object({id:id.required()});
export const lessonIdSchema=getLessonByIdSchema;
export const courseLessonsSchema=Joi.object({courseId:id.required()});
export const createLessonSchema=Joi.object({...fields,title:fields.title.required()}).or('courseId','moduleId');
export const updateLessonSchema=Joi.object(fields).min(1);
export const reorderLessonsSchema=Joi.object({courseId:id,moduleId:id,ids:Joi.array().items(id).unique().min(1).required()}).xor('courseId','moduleId');
