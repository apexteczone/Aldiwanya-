import mongoose from "mongoose";
import fs from "fs";
import path from "path";

import PDFModel from "../../DB/models/PDF.js"; 
import CourseModel from "../../DB/models/Course.js";
import LessonModel from "../../DB/models/Lesson.js";

const checkId = (id, name) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error(`Invalid ${name}`, {
      cause: 422,
    });
  }
};


const deleteLocalFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// CREATE PDF
export const createPdf = async (data, file) => {
  if (!file) {
    throw new Error("PDF file is required", { cause: 400 });
  }

  const { course, lesson } = data;

  checkId(course, "course ID");
  const courseExists = await CourseModel.findById(course);
  if (!courseExists) {
    deleteLocalFile(file.path);
    throw new Error("Course not found", { cause: 404 });
  }

  if (lesson) {
    checkId(lesson, "lesson ID");
    const lessonExists = await LessonModel.findById(lesson);
    if (!lessonExists) {
      deleteLocalFile(file.path);
      throw new Error("Lesson not found", { cause: 404 });
    }
  }

  // حفظ مسار الملف السليم
  const pdfUrl = file.path.replace(/\\/g, "/");

  const pdf = await PDFModel.create({
    ...data,
    pdfUrl,
  });

  return pdf;
};

// GET ALL PDFs (ADMIN)
export const getAllPdfsAdmin = async () => {
  return await PDFModel.find()
    .populate("course", "title")
    .populate("lesson", "title")
    .sort({ createdAt: -1 });
};

// GET PDFs BY COURSE
export const getPdfsByCourse = async (courseId) => {
  checkId(courseId, "course ID");

  const courseExists = await CourseModel.findById(courseId);
  if (!courseExists) {
    throw new Error("Course not found", { cause: 404 });
  }

  return await PDFModel.find({ course: courseId, status: "active" })
    .populate("lesson", "title")
    .sort({ createdAt: -1 });
};

// GET PDF BY ID
export const getPdfById = async (id) => {
  checkId(id, "PDF ID");

  const pdf = await PDFModel.findById(id)
    .populate("course", "title")
    .populate("lesson", "title");

  if (!pdf) {
    throw new Error("PDF not found", { cause: 404 });
  }

  return pdf;
};

// UPDATE PDF
export const updatePdf = async (id, data, file) => {
  checkId(id, "PDF ID");

  const pdf = await PDFModel.findById(id);
  if (!pdf) {
    if (file) deleteLocalFile(file.path);
    throw new Error("PDF not found", { cause: 404 });
  }

  if (data.course) {
    checkId(data.course, "course ID");
    const courseExists = await CourseModel.findById(data.course);
    if (!courseExists) {
      if (file) deleteLocalFile(file.path);
      throw new Error("Course not found", { cause: 404 });
    }
  }

  if (data.lesson) {
    checkId(data.lesson, "lesson ID");
    const lessonExists = await LessonModel.findById(data.lesson);
    if (!lessonExists) {
      if (file) deleteLocalFile(file.path);
      throw new Error("Lesson not found", { cause: 404 });
    }
  }

  // لو رفع ملف جديد نمسح القديم ونستبدل المسار
  if (file) {
    deleteLocalFile(pdf.pdfUrl);
    data.pdfUrl = file.path.replace(/\\/g, "/");
  }

  Object.assign(pdf, data);
  await pdf.save();

  return pdf;
};

// DELETE PDF
export const deletePdf = async (id) => {
  checkId(id, "PDF ID");

  const pdf = await PDFModel.findById(id);
  if (!pdf) {
    throw new Error("PDF not found", { cause: 404 });
  }

  // مسح الملف من الهارد ديسك أولاً
  deleteLocalFile(pdf.pdfUrl);

  await PDFModel.findByIdAndDelete(id);

  return true;
};