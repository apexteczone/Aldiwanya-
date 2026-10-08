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
  allowTo(["Student", "Admin"]),
  asyncHandler(getMyProfile)
);

router.patch(
  "/me",
  authentication(),
  allowTo(["Student", "Admin"]),
  validation(updateMyProfileSchema),
  asyncHandler(updateMyProfile)
);

export default router;
