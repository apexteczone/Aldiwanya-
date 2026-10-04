import joi from "joi";

export const courseIdSchema = joi.object({
  id: joi.string().hex().length(24).required(),
});

export const createCourseSchema = joi.object({
  title: joi.string().min(2).max(150).required(),

  description: joi
    .string()
    .max(2000)
    .allow("")
    .optional(),

  grade: joi
    .number()
    .valid(10, 11, 12)
    .required(),

  track: joi
    .string()
    .max(100)
    .allow("")
    .optional(),

  term: joi
    .string()
    .max(100)
    .allow("")
    .optional(),

  academicYear: joi
    .string()
    .max(50)
    .allow("")
    .optional(),

  thumbnail: joi
    .string()
    .allow(null, "")
    .optional(),
});

export const updateCourseSchema = joi
  .object({
    title: joi.string().min(2).max(150).optional(),

    description: joi
      .string()
      .max(2000)
      .allow("")
      .optional(),

    grade: joi
      .number()
      .valid(10, 11, 12)
      .optional(),

    track: joi
      .string()
      .max(100)
      .allow("")
      .optional(),

    term: joi
      .string()
      .max(100)
      .allow("")
      .optional(),

    academicYear: joi
      .string()
      .max(50)
      .allow("")
      .optional(),

    thumbnail: joi
      .string()
      .allow(null, "")
      .optional(),
  })
  .min(1);

export const reorderCoursesSchema = joi.object({
  ids: joi
    .array()
    .items(
      joi.string().hex().length(24)
    )
    .min(1)
    .required(),
});