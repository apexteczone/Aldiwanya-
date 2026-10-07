import Router from "express";

import authentication, {
  allowTo,
} from "../../middlewares/authMiddleware.js";

import asyncHandler from "../../utils/errorHandling/asyncHandler.js";

import validation from "../../middlewares/validation.middleware.js";

import {
  getMyProfile,
  updateMyProfile,
} from "./userController.js";

import {
  updateMyProfileSchema,
} from "./user.validation.js";

const router = Router();

router.get(
  "/me",
  authentication(),
  allowTo(["Student"]),
  asyncHandler(getMyProfile)
);

router.patch(
  "/me",
  authentication(),
  allowTo(["Student"]),
  validation(updateMyProfileSchema),
  asyncHandler(updateMyProfile)
);

export default router;