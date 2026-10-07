import mongoose from "mongoose";

import CourseModel from "../../DB/models/Course.js";
import ModuleModel from "../../DB/models/Module.js";
import LessonModel from "../../DB/models/Lesson.js";

export const getPublishedCourses = async (req, res, next) => {
  const courses = await CourseModel.find({
    status: "published",
  })
    .sort({
      position: 1,
      _id: 1,
    })
    .select(
      "title description grade track term academicYear thumbnail status position"
    )
    .lean();

  return res.status(200).json({
    success: true,
    data: courses,
  });
};

export const getPublishedCourseById = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(
      new Error("Course not found", {
        cause: 404,
      })
    );
  }

  const course = await CourseModel.findOne({
    _id: id,
    status: "published",
  })
    .select(
      "title description grade track term academicYear thumbnail status position"
    )
    .lean();

  if (!course) {
    return next(
      new Error("Course not found", {
        cause: 404,
      })
    );
  }

  const modules = await ModuleModel.find({
    courseId: course._id,
    status: "published",
  })
    .sort({
      position: 1,
      _id: 1,
    })
    .select("title description status position")
    .lean();

  const moduleIds = modules.map((module) => module._id);

  const lessons = moduleIds.length
    ? await LessonModel.find({
        moduleId: { $in: moduleIds },
        status: "published",
      })
        .sort({
          position: 1,
          _id: 1,
        })
        .select("moduleId title description status position")
        .lean()
    : [];

  const modulesWithLessons = modules.map((module) => ({
    ...module,
    lessons: lessons.filter(
      (lesson) => lesson.moduleId.toString() === module._id.toString()
    ),
  }));

  return res.status(200).json({
    success: true,
    data: {
      ...course,
      modules: modulesWithLessons,
    },
  });
};

export const getPublishedLessonById = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(
      new Error("Lesson not found", {
        cause: 404,
      })
    );
  }

  const lesson = await LessonModel.findOne({
    _id: id,
    status: "published",
  })
    .select("moduleId title description status position")
    .lean();

  if (!lesson) {
    return next(
      new Error("Lesson not found", {
        cause: 404,
      })
    );
  }

  const module = await ModuleModel.findOne({
    _id: lesson.moduleId,
    status: "published",
  })
    .select("courseId title description status position")
    .lean();

  if (!module) {
    return next(
      new Error("Lesson not found", {
        cause: 404,
      })
    );
  }

  const course = await CourseModel.findOne({
    _id: module.courseId,
    status: "published",
  })
    .select(
      "title description grade track term academicYear thumbnail status position"
    )
    .lean();

  if (!course) {
    return next(
      new Error("Lesson not found", {
        cause: 404,
      })
    );
  }

  return res.status(200).json({
    success: true,
    data: {
      lesson,
      module,
      course,
    },
  });
};