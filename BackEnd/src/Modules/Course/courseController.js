import * as courseService from "./course.service.js";

// GET ALL COURSES
export const getCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getCourses();
    return res.status(200).json({ success: true, data: courses });
  } catch (error) {
    return next(error);
  }
};

// GET COURSE BY ID
export const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await courseService.getCourseById(id);
    return res.status(200).json({ success: true, data: course });
  } catch (error) {
    return next(error);
  }
};

// CREATE COURSE
export const createCourse = async (req, res, next) => {
  try {
    const course = await courseService.createCourse(req.body, req.file);
    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    return next(error);
  }
};

// UPDATE COURSE
export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await courseService.updateCourse(id, req.body, req.file);
    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    return next(error);
  }
};

// DELETE COURSE
export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    await courseService.deleteCourse(id);
    return res.status(200).json({
      success: true,
      message: "Course and its lessons deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// PUBLISH COURSE
export const publishCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await courseService.publishCourse(id);
    return res.status(200).json({
      success: true,
      message: "Course published successfully",
      data: course,
    });
  } catch (error) {
    return next(error);
  }
};

// HIDE COURSE
export const hideCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await courseService.hideCourse(id);
    return res.status(200).json({
      success: true,
      message: "Course hidden successfully",
      data: course,
    });
  } catch (error) {
    return next(error);
  }
};

// REORDER COURSES
export const reorderCourses = async (req, res, next) => {
  try {
    const { gradeId, ids } = req.body;
    const courses = await courseService.reorderCourses(gradeId, ids);
    return res.status(200).json({
      success: true,
      message: "Courses reordered successfully",
      data: courses,
    });
  } catch (error) {
    return next(error);
  }
};