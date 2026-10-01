import Router from "express";
import * as authServices from "./auth.service.js";
import * as authValidation from "./auth.validation.js";
import authentication from "../../middlewares/authMiddleware.js";
import asyncHandler from "../../utils/errorHandling/asyncHandler.js";
import validation from "../../middlewares/validation.middleware.js";

const router = Router();

router.post("/register",
    validation(authValidation.userRegisterSchema),
    asyncHandler(authServices.userRegister)
);

// Login

router.post(

  "/login",

  validation(
    authValidation.userLoginSchema
  ),

  asyncHandler(
    authServices.userLogin
  )

);


// Logout

router.post(

  "/logout",

  authentication(),

  asyncHandler(
    authServices.logout
  )

);


// Forgot Password

router.post(

  "/forgot-password",

  validation(
    authValidation.forgotPasswordSchema
  ),

  asyncHandler(
    authServices.forgotPassword
  )

);


// Reset Password

router.post(

  "/reset-password",

  validation(
    authValidation.resetPasswordSchema
  ),

  asyncHandler(
    authServices.resetPassword
  )

);


export default router;