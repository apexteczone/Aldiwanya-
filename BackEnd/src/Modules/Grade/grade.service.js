import GradeModel from "../../DB/models/Grade.js";
import CourseModel from "../../DB/models/Course.js";

export const createGrade = async (data) => {
  const { name, position, status, description } = data;

  const existingGrade = await GradeModel.findOne({ name });

  if (existingGrade) {
    throw new Error("Grade already exists");
  }

  return await GradeModel.create({
    name,
    description,
    position,
    status,
  });
};

export const getAllGrades = async () => {
  return await GradeModel.find()
    .sort({ position: 1, createdAt: 1 });
};

export const getGradeById = async (gradeId) => {
  const grade = await GradeModel.findById(gradeId);

  if (!grade) {
    throw new Error("Grade not found");
  }

  return grade;
};

export const updateGrade = async (gradeId, data) => {
  const grade = await GradeModel.findById(gradeId);

  if (!grade) {
    throw new Error("Grade not found");
  }

  if (data.name && data.name !== grade.name) {
    const existingGrade = await GradeModel.findOne({
      name: data.name,
      _id: { $ne: gradeId },
    });

    if (existingGrade) {
      throw new Error("Grade already exists");
    }
  }

  Object.assign(grade, data);

  return await grade.save();
};

export const deleteGrade = async (gradeId) => {
  const grade = await GradeModel.findById(gradeId);

  if (!grade) {
    throw new Error("Grade not found");
  }

  const coursesCount = await CourseModel.countDocuments({
    grade: gradeId,
  });

  if (coursesCount > 0) {
    throw new Error(
      "Cannot delete grade because it has courses"
    );
  }

  await grade.deleteOne();

  return grade;
};