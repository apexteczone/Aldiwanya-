import Router from "express";

import asyncHandler from "../../utils/errorHandling/asyncHandler.js";

import {
  getPublicGrades,
  getPublishedCourses,
  getPublishedCourseById,
  getPublishedLessonById,
} from "./content.service.js";

const router = Router();
router.get('/grades', asyncHandler(getPublicGrades));

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
