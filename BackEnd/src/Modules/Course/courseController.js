import Router from "express";

import authentication, {
  allowTo,
} from "../../middlewares/authMiddleware.js";

import asyncHandler from "../../utils/errorHandling/asyncHandler.js";

import validation from "../../middlewares/validation.middleware.js";

import * as courseServices from "./course.service.js";

import {
  courseIdSchema,
  createCourseSchema,
  updateCourseSchema,
  reorderCoursesSchema,
} from "./course.validation.js";

const router = Router();


router.use(authentication());

router.use(allowTo(["Admin"]));


router.get(
  "/courses",
  asyncHandler(courseServices.getCourses)
);


router.get(
  "/courses/:id",
  validation(courseIdSchema, "params"),
  asyncHandler(courseServices.getCourseById)
);


router.post(
  "/courses/CreateCourse",
  validation(createCourseSchema),
  asyncHandler(courseServices.createCourse)
);


router.patch(
  "/courses/:id/update",
  validation(courseIdSchema, "params"),
  validation(updateCourseSchema),
  asyncHandler(courseServices.updateCourse)
);



router.delete(
  "/courses/:id/delete",
  validation(courseIdSchema, "params"),
  asyncHandler(courseServices.deleteCourse)
);



router.patch(
  "/courses/:id/publish",
  validation(courseIdSchema, "params"),
  asyncHandler(courseServices.publishCourse)
);


router.patch(
  "/courses/:id/hide",
  validation(courseIdSchema, "params"),
  asyncHandler(courseServices.hideCourse)
);


router.put(
  "/courses/order",
  validation(reorderCoursesSchema),
  asyncHandler(courseServices.reorderCourses)
);

export default router;