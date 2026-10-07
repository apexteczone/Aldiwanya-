import * as lessonService from "./lesson.service.js";


// ==============================
// GET ALL LESSONS
// ==============================

export const getLessons = async (
  req,
  res,
  next
) => {
  try {
    const lessons =
      await lessonService.getLessons();

    return res.status(200).json({
      success: true,
      data: lessons,
    });
  } catch (error) {
    return next(error);
  }
};


// ==============================
// GET LESSONS BY COURSE
// ==============================

export const getLessonsByCourse = async (
  req,
  res,
  next
) => {
  try {
    const { courseId } = req.params;

    const lessons =
      await lessonService.getLessonsByCourse(
        courseId
      );

    return res.status(200).json({
      success: true,
      data: lessons,
    });
  } catch (error) {
    return next(error);
  }
};


// ==============================
// GET LESSON BY ID
// ==============================

export const getLessonById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const lesson =
      await lessonService.getLessonById(id);

    return res.status(200).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    return next(error);
  }
};


// ==============================
// CREATE LESSON
// ==============================

export const createLesson = async (
  req,
  res,
  next
) => {
  try {
    const lesson =
      await lessonService.createLesson(
        req.body
      );

    return res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      data: lesson,
    });
  } catch (error) {
    return next(error);
  }
};


// ==============================
// UPDATE LESSON
// ==============================

export const updateLesson = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const lesson =
      await lessonService.updateLesson(
        id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Lesson updated successfully",
      data: lesson,
    });
  } catch (error) {
    return next(error);
  }
};


// ==============================
// DELETE LESSON
// ==============================

export const deleteLesson = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    await lessonService.deleteLesson(id);

    return res.status(200).json({
      success: true,
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};


// ==============================
// PUBLISH LESSON
// ==============================

export const publishLesson = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const lesson =
      await lessonService.publishLesson(id);

    return res.status(200).json({
      success: true,
      message: "Lesson published successfully",
      data: lesson,
    });
  } catch (error) {
    return next(error);
  }
};


// ==============================
// HIDE LESSON
// ==============================

export const hideLesson = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const lesson =
      await lessonService.hideLesson(id);

    return res.status(200).json({
      success: true,
      message: "Lesson hidden successfully",
      data: lesson,
    });
  } catch (error) {
    return next(error);
  }
};


// ==============================
// REORDER LESSONS
// ==============================

export const reorderLessons = async (
  req,
  res,
  next
) => {
  try {
    const {
      courseId,
      ids,
    } = req.body;

    const lessons =
      await lessonService.reorderLessons(
        courseId,
        ids
      );

    return res.status(200).json({
      success: true,
      message: "Lessons reordered successfully",
      data: lessons,
    });
  } catch (error) {
    return next(error);
  }
};