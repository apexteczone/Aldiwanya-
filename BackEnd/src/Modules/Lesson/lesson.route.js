import express from "express";

import authentication, {
  allowTo,
} from "../../middlewares/authMiddleware.js";

import validation from "../../middlewares/validation.middleware.js";

import * as lessonController from "./lesson.controller.js";

import {
  getLessonByIdSchema,
  createLessonSchema,
  updateLessonSchema,
  lessonIdSchema,
  courseLessonsSchema,
  reorderLessonsSchema,
} from "./lesson.validation.js";


const router = express.Router();


// ==================================================
// PUBLIC ROUTES
// ==================================================


// GET ALL LESSONS

router.get(
  "/",
  lessonController.getLessons
);


// GET LESSONS BY COURSE

router.get(
  "/course/:courseId",
  validation(
    courseLessonsSchema,
    "params"
  ),
  lessonController.getLessonsByCourse
);


// GET LESSON BY ID

router.get(
  "/:id",
  validation(
    getLessonByIdSchema,
    "params"
  ),
  lessonController.getLessonById
);


// ==================================================
// ADMIN ROUTES
// ==================================================


// REORDER LESSONS

router.patch(
  "/reorder",

  authentication(),

  allowTo(["admin","Admin"]),

  validation(
    reorderLessonsSchema,
    "body"
  ),

  lessonController.reorderLessons
);


// CREATE LESSON

router.post(
  "/createLesson",

  authentication(),

  allowTo(["admin","Admin"]),

  validation(
    createLessonSchema,
    "body"
  ),

  lessonController.createLesson
);


// UPDATE LESSON

router.patch(
  "/:id",

  authentication(),

  allowTo(["admin","Admin"]),

  validation(
    lessonIdSchema,
    "params"
  ),

  validation(
    updateLessonSchema,
    "body"
  ),

  lessonController.updateLesson
);


// DELETE LESSON

router.delete(
  "/:id",

  authentication(),

  allowTo(["admin","Admin"]),

  validation(
    lessonIdSchema,
    "params"
  ),

  lessonController.deleteLesson
);


// PUBLISH LESSON

router.patch(
  "/:id/publish",

  authentication(),

  allowTo(["admin","Admin"]),

  validation(
    lessonIdSchema,
    "params"
  ),

  lessonController.publishLesson
);


// HIDE LESSON

router.patch(
  "/:id/hide",

  authentication(),

  allowTo(["admin","Admin"]),

  validation(
    lessonIdSchema,
    "params"
  ),

  lessonController.hideLesson
);


export default router;