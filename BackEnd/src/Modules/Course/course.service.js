import mongoose from "mongoose";
import CourseModel from "../../DB/models/Course.js";
import GradeModel from "../../DB/models/Grade.js";
import LessonModel from "../../DB/models/Lesson.js";

const checkId = (id, name) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error(`Invalid ${name}`, { cause: 422 });
  }
};

// GET ALL COURSES
export const getCourses = async () => {
  return await CourseModel.find()
    .populate("grade", "name")
    .sort({
      position: 1,
      createdAt: -1, // الترتيب من الأحدث للأقدم
    });
};

// GET COURSE BY ID
export const getCourseById = async (id) => {
  checkId(id, "course ID");

  const course = await CourseModel.findById(id).populate("grade", "name");

  if (!course) {
    throw new Error("Course not found", { cause: 404 });
  }

  return course;
};

// CREATE COURSE
export const createCourse = async (data, file) => {
  const { grade } = data;

  checkId(grade, "grade ID");

  const gradeExists = await GradeModel.findById(grade);
  if (!gradeExists) {
    throw new Error("Grade not found", { cause: 404 });
  }

  const lastCourse = await CourseModel.findOne({ grade })
    .sort({ position: -1 })
    .select("position");

  const position = lastCourse ? lastCourse.position + 1 : 0;

  let coverImage = "";
  if (file) {
    coverImage = file.path || file.filename; // يدعم الرفع المحلي أو Cloudinary
  }

  const course = await CourseModel.create({
    ...data,
    coverImage,
    position,
  });

  return course;
};

// UPDATE COURSE
export const updateCourse = async (id, data, file) => {
  checkId(id, "course ID");

  const course = await CourseModel.findById(id);

  if (!course) {
    throw new Error("Course not found", { cause: 404 });
  }

  if (data.grade) {
    checkId(data.grade, "grade ID");

    const gradeExists = await GradeModel.findById(data.grade);

    if (!gradeExists) {
      throw new Error("Grade not found", { cause: 404 });
    }
  }

  if (file) {
    data.coverImage = file.path || file.filename;
  }

  Object.assign(course, data);
  await course.save();

  return course;
};

// DELETE COURSE
export const deleteCourse = async (id) => {
  checkId(id, "course ID");

  const course = await CourseModel.findById(id);

  if (!course) {
    throw new Error("Course not found", { cause: 404 });
  }

  // Delete all lessons belonging to course
  await LessonModel.deleteMany({ courseId: id });
  await CourseModel.findByIdAndDelete(id);
};

// PUBLISH COURSE
export const publishCourse = async (id) => {
  checkId(id, "course ID");

  const course = await CourseModel.findById(id);
  if (!course) throw new Error("Course not found", { cause: 404 });

  course.status = "active";
  await course.save();
  return course;
};

// HIDE COURSE
export const hideCourse = async (id) => {
  checkId(id, "course ID");

  const course = await CourseModel.findById(id);
  if (!course) throw new Error("Course not found", { cause: 404 });

  course.status = "inactive";
  await course.save();
  return course;
};

// REORDER COURSES
export const reorderCourses = async (grade, ids) => {
  checkId(grade, "grade ID");

  const gradeExists = await GradeModel.findById(grade);
  if (!gradeExists) {
    throw new Error("Grade not found", { cause: 404 });
  }

  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    throw new Error("Duplicate course IDs are not allowed", { cause: 422 });
  }

  const courses = await CourseModel.find({ grade }).select("_id");
  if (courses.length !== ids.length) {
    throw new Error("You must provide all course IDs for this grade", { cause: 422 });
  }

  const existingIds = new Set(courses.map((course) => course._id.toString()));

  for (const id of ids) {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("Invalid course ID", { cause: 422 });
    }

    if (!existingIds.has(id)) {
      throw new Error("Invalid course ordering", { cause: 422 });
    }
  }

  await CourseModel.bulkWrite(
    ids.map((id, index) => ({
      updateOne: {
        filter: { _id: id, grade },
        update: { $set: { position: index } },
      },
    }))
  );

  return await CourseModel.find({ grade })
    .populate("grade", "name")
    .sort({ position: 1 });
};