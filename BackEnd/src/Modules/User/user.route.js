import Router from "express";
import {rateLimit} from 'express-rate-limit';
import {avatarUpload,uploadAvatar,deleteAvatar} from './avatar.controller.js';

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
const avatarLimit=rateLimit({windowMs:60000,limit:15,standardHeaders:'draft-8',legacyHeaders:false});
router.post('/me/avatar',authentication(),avatarLimit,avatarUpload,uploadAvatar);
router.delete('/me/avatar',authentication(),avatarLimit,deleteAvatar);

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
