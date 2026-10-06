import Router from "express";

import asyncHandler from "../../utils/errorHandling/asyncHandler.js";

import {
  getPublishedCourses,
  getPublishedCourseById,
  getPublishedLessonById,
} from "./content.service.js";

const router = Router();

router.get(
  "/courses",
  asyncHandler(getPublishedCourses)
);

router.get(
  "/courses/:id",
  asyncHandler(getPublishedCourseById)
);

router.get(
  "/lessons/:id",
  asyncHandler(getPublishedLessonById)
);

export default router;