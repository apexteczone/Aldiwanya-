import Joi from "joi";


// ==============================
// MongoDB ObjectId
// ==============================

const objectId = Joi.string()
  .hex()
  .length(24);


// ==============================
// GET LESSON BY ID
// ==============================

export const getLessonByIdSchema =
  Joi.object({
    id: objectId.required(),
  });


// ==============================
// GET LESSONS BY COURSE
// ==============================

export const courseLessonsSchema =
  Joi.object({
    courseId: objectId.required(),
  });


// ==============================
// CREATE LESSON
// ==============================

export const createLessonSchema =
  Joi.object({
    courseId: objectId.required(),

    title: Joi.string()
      .trim()
      .min(2)
      .max(150)
      .required(),

    description: Joi.string()
      .trim()
      .max(2000)
      .allow("")
      .default(""),

    isFreePreview: Joi.boolean()
      .default(false),
  });


// ==============================
// UPDATE LESSON
// ==============================

export const updateLessonSchema =
  Joi.object({
    courseId: objectId.optional(),

    title: Joi.string()
      .trim()
      .min(2)
      .max(150)
      .optional(),

    description: Joi.string()
      .trim()
      .max(2000)
      .allow("")
      .optional(),

    isFreePreview: Joi.boolean()
      .optional(),

    status: Joi.string()
      .valid("draft", "published")
      .optional(),
  }).min(1);


// ==============================
// LESSON ID
// ==============================

export const lessonIdSchema =
  Joi.object({
    id: objectId.required(),
  });


// ==============================
// REORDER LESSONS
// ==============================

export const reorderLessonsSchema =
  Joi.object({
    courseId: objectId.required(),

    ids: Joi.array()
      .items(objectId)
      .min(1)
      .required(),
  });