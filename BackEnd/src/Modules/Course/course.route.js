import Router from "express";
import authentication, { allowTo } from "../../middlewares/authMiddleware.js";
import asyncHandler from "../../utils/errorHandling/asyncHandler.js";
import validation from "../../middlewares/validation.middleware.js";
import { uploadImage } from "../../middlewares/upload.middleware.js"; 
import {parseCourseData} from "../../middlewares/parseCourseData.js";
import * as courseController from "./courseController.js";
import {
  courseIdSchema,
  createCourseSchema,
  updateCourseSchema,
  reorderCoursesSchema,
} from "./course.validation.js";

const router = Router();

router.use(authentication());
router.use(allowTo(["Admin"]));

// Get all courses
router.get(["/", "/getall"], asyncHandler(courseController.getCourses));

// Get course by ID
router.get(
  "/:id",
  validation(courseIdSchema, "params"),
  asyncHandler(courseController.getCourseById)
);

// Create course (دعم رفع ملف coverImage عبر Multer)
router.post(
  ["/", "/Create", "/CreateCourse"],
  uploadImage.single("coverImage"),
  parseCourseData,
  validation(createCourseSchema),
  asyncHandler(courseController.createCourse)
);

// Update course
router.patch(
  ["/:id", "/:id/update"],
  uploadImage.single("coverImage"), // 👈 تم التعديل من upload إلى uploadImage
  validation(courseIdSchema, "params"),
  validation(updateCourseSchema),
  asyncHandler(courseController.updateCourse)
);

// Delete course
router.delete(
  ["/:id", "/:id/delete"],
  validation(courseIdSchema, "params"),
  asyncHandler(courseController.deleteCourse)
);

// Publish course
router.patch(
  "/:id/publish",
  validation(courseIdSchema, "params"),
  asyncHandler(courseController.publishCourse)
);

// Hide course
router.patch(
  "/:id/hide",
  validation(courseIdSchema, "params"),
  asyncHandler(courseController.hideCourse)
);

// Reorder courses inside a grade
router.put(
  "/order",
  validation(reorderCoursesSchema),
  asyncHandler(courseController.reorderCourses)
);

export default router;
