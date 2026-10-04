import joi from "joi";

export const moduleIdSchema = joi.object({
  id: joi.string().hex().length(24).required(),
});

export const createModuleSchema = joi.object({
  courseId: joi
    .string()
    .hex()
    .length(24)
    .required(),

  title: joi
    .string()
    .min(2)
    .max(150)
    .required(),

  description: joi
    .string()
    .max(2000)
    .allow("")
    .optional(),
});

export const updateModuleSchema = joi
  .object({
    courseId: joi
      .string()
      .hex()
      .length(24)
      .optional(),

    title: joi
      .string()
      .min(2)
      .max(150)
      .optional(),

    description: joi
      .string()
      .max(2000)
      .allow("")
      .optional(),
  })
  .min(1);

export const reorderModulesSchema = joi.object({
  courseId: joi
    .string()
    .hex()
    .length(24)
    .required(),

  ids: joi
    .array()
    .items(
      joi.string().hex().length(24)
    )
    .min(1)
    .required(),
});