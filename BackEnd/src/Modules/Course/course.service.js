import mongoose from "mongoose";

import CourseModel from "../../DB/models/Course.js";
import ModuleModel from "../../DB/models/Module.js";
import LessonModel from "../../DB/models/Lesson.js";

// Check ID
const checkId = (id, name) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error(`Invalid ${name}`, {
      cause: 422,
    });
  }
};


// GET ALL COURSES
export const getCourses = async (req, res, next) => {
  try {
    const courses = await CourseModel.find().sort({
      position: 1,
      createdAt: 1,
    });

    return res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    return next(error);
  }
};


// GET COURSE BY ID
export const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    checkId(id, "course ID");

    const course = await CourseModel.findById(id);

    if (!course) {
      return next(
        new Error("Course not found", {
          cause: 404,
        })
      );
    }

    return res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    return next(error);
  }
};


// CREATE COURSE
export const createCourse = async (req, res, next) => {
  try {
    const lastCourse = await CourseModel.findOne()
      .sort({
        position: -1,
      })
      .select("position");

    const position = lastCourse
      ? lastCourse.position + 1
      : 0;

    const course = await CourseModel.create({
      ...req.body,
      position,
      status: "draft",
    });

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

    checkId(id, "course ID");

    const course = await CourseModel.findById(id);

    if (!course) {
      return next(
        new Error("Course not found", {
          cause: 404,
        })
      );
    }

    Object.assign(course, req.body);

    await course.save();

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

    checkId(id, "course ID");

    const course = await CourseModel.findById(id);

    if (!course) {
      return next(
        new Error("Course not found", {
          cause: 404,
        })
      );
    }

    
    const modules = await ModuleModel.find({
      courseId: id,
    }).select("_id");

    const moduleIds = modules.map(
      (module) => module._id
    );

  
    if (moduleIds.length > 0) {
      await LessonModel.deleteMany({
        moduleId: {
          $in: moduleIds,
        },
      });
    }

   
    await ModuleModel.deleteMany({
      courseId: id,
    });

  
    await CourseModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};


// PUBLISH COURSE
export const publishCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    checkId(id, "course ID");

    const course = await CourseModel.findById(id);

    if (!course) {
      return next(
        new Error("Course not found", {
          cause: 404,
        })
      );
    }

    course.status = "published";

    await course.save();

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

    checkId(id, "course ID");

    const course = await CourseModel.findById(id);

    if (!course) {
      return next(
        new Error("Course not found", {
          cause: 404,
        })
      );
    }

    course.status = "draft";

    await course.save();

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
    const { ids } = req.body;

    const uniqueIds = new Set(ids);

    if (uniqueIds.size !== ids.length) {
      return next(
        new Error(
          "Duplicate course IDs are not allowed",
          {
            cause: 422,
          }
        )
      );
    }

    const courses = await CourseModel.find().select("_id");

    if (courses.length !== ids.length) {
      return next(
        new Error(
          "You must provide all course IDs",
          {
            cause: 422,
          }
        )
      );
    }

    const existingIds = new Set(
      courses.map((course) =>
        course._id.toString()
      )
    );

    for (const id of ids) {
      if (!existingIds.has(id)) {
        return next(
          new Error("Invalid course ordering", {
            cause: 422,
          })
        );
      }
    }

    await CourseModel.bulkWrite(
      ids.map((id, index) => ({
        updateOne: {
          filter: {
            _id: id,
          },
          update: {
            $set: {
              position: index,
            },
          },
        },
      }))
    );

    const updatedCourses = await CourseModel.find().sort({
      position: 1,
    });

    return res.status(200).json({
      success: true,
      message: "Courses reordered successfully",
      data: updatedCourses,
    });
  } catch (error) {
    return next(error);
  }
};