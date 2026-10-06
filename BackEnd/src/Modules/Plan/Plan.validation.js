import joi from "joi";

export const planIdSchema = joi.object({
  id: joi.string().hex().length(24).required(),
});

export const createPlanSchema = joi.object({
  title: joi
    .string()
    .min(2)
    .max(100)
    .required(),

  durationMonths: joi
    .number()
    .valid(3, 12)
    .required(),

  amountMinor: joi
    .number()
    .integer()
    .min(1)
    .required(),

  currency: joi
    .string()
    .length(3)
    .uppercase()
    .required(),

  active: joi
    .boolean()
    .optional(),
});

export const updatePlanSchema = joi
  .object({
    title: joi
      .string()
      .min(2)
      .max(100)
      .optional(),

    amountMinor: joi
      .number()
      .integer()
      .min(1)
      .optional(),

    currency: joi
      .string()
      .length(3)
      .uppercase()
      .optional(),

    active: joi
      .boolean()
      .optional(),
  })
  .min(1);