import Router from "express";

import authentication, {
  allowTo,
} from "../../middlewares/authMiddleware.js";

import asyncHandler from "../../utils/errorHandling/asyncHandler.js";

import validation from "../../middlewares/validation.middleware.js";

import * as lessonServices from "./lesson.service.js";

import {
  lessonIdSchema,
  createLessonSchema,
  updateLessonSchema,
  reorderLessonsSchema,
} from "./lesson.validation.js";

const router = Router();

router.use(authentication());

router.use(allowTo(["Admin"]));

// GET ALL
router.get(
  "/lessons",
  asyncHandler(lessonServices.getLessons)
);

// GET BY ID
router.get(
  "/lessons/:id",
  validation(lessonIdSchema, "params"),
  asyncHandler(lessonServices.getLessonById)
);

// CREATE
router.post(
  "/lessons/CreateLesson",
  validation(createLessonSchema),
  asyncHandler(lessonServices.createLesson)
);

// UPDATE
router.patch(
  "/lessons/:id/update",
  validation(lessonIdSchema, "params"),
  validation(updateLessonSchema),
  asyncHandler(lessonServices.updateLesson)
);

// DELETE
router.delete(
  "/lessons/:id/delete",
  validation(lessonIdSchema, "params"),
  asyncHandler(lessonServices.deleteLesson)
);

// PUBLISH
router.patch(
  "/lessons/:id/publish",
  validation(lessonIdSchema, "params"),
  asyncHandler(lessonServices.publishLesson)
);

// HIDE
router.patch(
  "/lessons/:id/hide",
  validation(lessonIdSchema, "params"),
  asyncHandler(lessonServices.hideLesson)
);

// REORDER
router.put(
  "/lessons/order",
  validation(reorderLessonsSchema),
  asyncHandler(lessonServices.reorderLessons)
);

export default router;