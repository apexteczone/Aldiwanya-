import express from "express";
import authentication, { allowTo } from "../../middlewares/authMiddleware.js";
import validation from "../../middlewares/validation.middleware.js"; // مسار الـ validation middleware عندك
import { createGradeSchema, updateGradeSchema, gradeParamsSchema } from "./grade.validation.js";
import * as gradeController from "./grade.controller.js";

const router = express.Router();

router.get("/", gradeController.getAllGrades);

router.get(
  "/:gradeId",
  validation(gradeParamsSchema, "params"),
  gradeController.getGradeById
);

router.post(
  "/create",
  authentication(),
  allowTo(["Admin"]),
  validation(createGradeSchema), 
  gradeController.createGrade
);

router.patch(
  "/:gradeId",
  authentication(),
  allowTo(["Admin"]),
  validation(gradeParamsSchema, "params"),
  validation(updateGradeSchema),
  gradeController.updateGrade
);

router.delete(
  "/:gradeId",
  authentication(),
  allowTo(["Admin"]),
  validation(gradeParamsSchema, "params"),
  gradeController.deleteGrade
);

export default router;