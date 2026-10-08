import joi from "joi";


export const userRegisterSchema =
  joi.object({

    fullName: joi
      .string()
      .min(3)
      .max(100)
      .required(),

    email: joi
      .string()
      .trim().lowercase().email()
      .required(),

    phoneNumber: joi
      .string()
      .pattern(/^\+965[569]\d{7}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Invalid Kuwait phone number",
      }),

    password: joi
      .string()
      .min(12)
      .max(72)
      .required(),

    confirmPassword: joi
      .string()
      .valid(
        joi.ref("password")
      )
      .required()
      .messages({
        "any.only":
          "Password confirmation does not match",
      }),

    termsAccepted: joi
      .boolean()
      .valid(true)
      .required()
      .messages({
        "any.only":
          "You must accept the terms and privacy policy",
      }),

  });


export const userLoginSchema =
  joi.object({

    identifier: joi
      .string()
      .required(),

    password: joi
      .string()
      .required(),

    rememberMe: joi
      .boolean()
      .default(false),

  });


export const forgotPasswordSchema =
  joi.object({

    email: joi
      .string()
      .trim().lowercase().email()
      .required(),

  });


export const resetPasswordSchema =
  joi.object({

    token: joi
      .string()
      .required(),

    newPassword: joi
      .string()
      .min(12)
      .max(72)
      .required(),

    confirmPassword: joi
      .string()
      .valid(
        joi.ref("newPassword")
      )
      .required()
      .messages({
        "any.only":
          "Password confirmation does not match",
      }),

  });
