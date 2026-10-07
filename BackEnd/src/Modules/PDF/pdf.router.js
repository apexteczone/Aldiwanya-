import express from "express";

import authentication, {
  allowTo,
} from "../../middlewares/authMiddleware.js";
import validation from "../../middlewares/validation.middleware.js";
import { uploadPdf } from "../../middlewares/upload.middleware.js";

import * as pdfController from "./pdf.controller.js";
import {
  createPdfSchema,
  updatePdfSchema,
  pdfIdSchema,
  coursePdfsSchema,
} from "./pdf.validation.js";

const router = express.Router();

// ==================================================
// PUBLIC ROUTES
// ==================================================

// GET ALL PDFs FOR A COURSE
router.get(
  "/course/:courseId",
  validation(coursePdfsSchema, "params"),
  pdfController.getPdfsByCourse
);

// GET PDF BY ID
router.get(
  "/:id",
  validation(pdfIdSchema, "params"),
  pdfController.getPdfById
);

// ==================================================
// ADMIN ROUTES
// ==================================================

router.use(authentication(), allowTo(["admin", "Admin"]));

// GET ALL PDFs (ADMIN)
router.get("/", pdfController.getAllPdfsAdmin);

// CREATE PDF (WITH UPLOAD)
router.post(
  "/create",
  uploadPdf.single("file"),
  validation(createPdfSchema, "body"),
  pdfController.createPdf
);

// UPDATE PDF (WITH OPTIONAL FILE REPLACEMENT)
router.patch(
  "/:id",
  uploadPdf.single("file"),
  validation(pdfIdSchema, "params"),
  validation(updatePdfSchema, "body"),
  pdfController.updatePdf
);

// DELETE PDF
router.delete(
  "/:id",
  validation(pdfIdSchema, "params"),
  pdfController.deletePdf
);

export default router;