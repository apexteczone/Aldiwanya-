import mongoose from "mongoose";

import LessonModel from "../../DB/models/Lesson.js";
import CourseModel from "../../DB/models/Course.js";


// ==============================
// Check MongoDB ObjectId
// ==============================

const checkId = (id, name) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error(`Invalid ${name}`, {
      cause: 422,
    });
  }
};


// ==============================
// GET ALL LESSONS
// ==============================

export const getLessons = async () => {
  const lessons = await LessonModel.find()
    .populate("courseId")
    .sort({
      position: 1,
      createdAt: 1,
    });

  return lessons;
};


// ==============================
// GET LESSONS BY COURSE
// ==============================

export const getLessonsByCourse = async (
  courseId
) => {
  checkId(courseId, "course ID");

  const course = await CourseModel.findById(
    courseId
  );

  if (!course) {
    throw new Error("Course not found", {
      cause: 404,
    });
  }

  const lessons = await LessonModel.find({
    courseId,
  }).sort({
    position: 1,
    createdAt: 1,
  });

  return lessons;
};


// ==============================
// GET LESSON BY ID
// ==============================

export const getLessonById = async (id) => {
  checkId(id, "lesson ID");

  const lesson = await LessonModel.findById(
    id
  ).populate("courseId");

  if (!lesson) {
    throw new Error("Lesson not found", {
      cause: 404,
    });
  }

  return lesson;
};


// ==============================
// CREATE LESSON
// ==============================

export const createLesson = async (data) => {
  const {
    courseId,
    title,
    description,
    isFreePreview,
  } = data;

  checkId(courseId, "course ID");

  const course = await CourseModel.findById(
    courseId
  );

  if (!course) {
    throw new Error("Course not found", {
      cause: 404,
    });
  }

  // Get the last lesson position
  const lastLesson =
    await LessonModel.findOne({
      courseId,
    }).sort({
      position: -1,
    });

  const position = lastLesson
    ? lastLesson.position + 1
    : 0;

  const lesson = await LessonModel.create({
    courseId,
    title,
    description,
    isFreePreview,
    position,
    status: "draft",
  });

  return lesson;
};


// ==============================
// UPDATE LESSON
// ==============================

export const updateLesson = async (
  id,
  data
) => {
  checkId(id, "lesson ID");

  const lesson = await LessonModel.findById(
    id
  );

  if (!lesson) {
    throw new Error("Lesson not found", {
      cause: 404,
    });
  }

  // If courseId is being changed
  if (data.courseId) {
    checkId(data.courseId, "course ID");

    const course = await CourseModel.findById(
      data.courseId
    );

    if (!course) {
      throw new Error("Course not found", {
        cause: 404,
      });
    }
  }

  Object.assign(lesson, data);

  await lesson.save();

  return lesson;
};


// ==============================
// DELETE LESSON
// ==============================

export const deleteLesson = async (id) => {
  checkId(id, "lesson ID");

  const lesson = await LessonModel.findById(
    id
  );

  if (!lesson) {
    throw new Error("Lesson not found", {
      cause: 404,
    });
  }

  await lesson.deleteOne();

  return true;
};


// ==============================
// PUBLISH LESSON
// ==============================

export const publishLesson = async (id) => {
  checkId(id, "lesson ID");

  const lesson = await LessonModel.findById(
    id
  );

  if (!lesson) {
    throw new Error("Lesson not found", {
      cause: 404,
    });
  }

  lesson.status = "published";

  await lesson.save();

  return lesson;
};


// ==============================
// HIDE LESSON
// ==============================

export const hideLesson = async (id) => {
  checkId(id, "lesson ID");

  const lesson = await LessonModel.findById(
    id
  );

  if (!lesson) {
    throw new Error("Lesson not found", {
      cause: 404,
    });
  }

  lesson.status = "draft";

  await lesson.save();

  return lesson;
};


// ==============================
// REORDER LESSONS
// ==============================

export const reorderLessons = async (
  courseId,
  ids
) => {
  checkId(courseId, "course ID");

  const course = await CourseModel.findById(
    courseId
  );

  if (!course) {
    throw new Error("Course not found", {
      cause: 404,
    });
  }

  // Check duplicate IDs
  const uniqueIds = new Set(ids);

  if (uniqueIds.size !== ids.length) {
    throw new Error(
      "Duplicate lesson IDs are not allowed",
      {
        cause: 422,
      }
    );
  }

  // Get all lessons of this course
  const lessons = await LessonModel.find({
    courseId,
  }).select("_id");

  // Make sure all lessons were provided
  if (lessons.length !== ids.length) {
    throw new Error(
      "You must provide all lesson IDs of this course",
      {
        cause: 422,
      }
    );
  }

  const existingIds = new Set(
    lessons.map((lesson) =>
      lesson._id.toString()
    )
  );

  // Validate IDs
  for (const id of ids) {
    checkId(id, "lesson ID");

    if (!existingIds.has(id)) {
      throw new Error(
        "Invalid lesson ordering",
        {
          cause: 422,
        }
      );
    }
  }

  // Update positions
  await LessonModel.bulkWrite(
    ids.map((id, index) => ({
      updateOne: {
        filter: {
          _id: id,
          courseId,
        },
        update: {
          $set: {
            position: index,
          },
        },
      },
    }))
  );

  const updatedLessons =
    await LessonModel.find({
      courseId,
    }).sort({
      position: 1,
    });

  return updatedLessons;
};