import * as pdfService from "./pdf.service.js";

// CREATE PDF
export const createPdf = async (req, res, next) => {
  try {
    const pdf = await pdfService.createPdf(req.body, req.file);

    return res.status(201).json({
      success: true,
      message: "PDF uploaded and created successfully",
      data: pdf,
    });
  } catch (error) {
    return next(error);
  }
};

// GET ALL PDFs (ADMIN)
export const getAllPdfsAdmin = async (req, res, next) => {
  try {
    const pdfs = await pdfService.getAllPdfsAdmin();

    return res.status(200).json({
      success: true,
      data: pdfs,
    });
  } catch (error) {
    return next(error);
  }
};

// GET PDFs BY COURSE
export const getPdfsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const pdfs = await pdfService.getPdfsByCourse(courseId);

    return res.status(200).json({
      success: true,
      data: pdfs,
    });
  } catch (error) {
    return next(error);
  }
};

// GET PDF BY ID
export const getPdfById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pdf = await pdfService.getPdfById(id);

    return res.status(200).json({
      success: true,
      data: pdf,
    });
  } catch (error) {
    return next(error);
  }
};

// UPDATE PDF
export const updatePdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pdf = await pdfService.updatePdf(id, req.body, req.file);

    return res.status(200).json({
      success: true,
      message: "PDF updated successfully",
      data: pdf,
    });
  } catch (error) {
    return next(error);
  }
};

// DELETE PDF
export const deletePdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pdfService.deletePdf(id);

    return res.status(200).json({
      success: true,
      message: "PDF deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};