import * as gradeService from "./grade.service.js";

export const createGrade = async (req, res, next) => {
  try {
    const grade = await gradeService.createGrade(req.body);

    res.status(201).json({
      success: true,
      message: "Grade created successfully",
      data: grade,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllGrades = async (req, res, next) => {
  try {
    const grades = await gradeService.getAllGrades();

    res.status(200).json({
      success: true,
      data: grades,
    });
  } catch (error) {
    next(error);
  }
};

export const getGradeById = async (req, res, next) => {
  try {
    const grade = await gradeService.getGradeById(
      req.params.gradeId
    );

    res.status(200).json({
      success: true,
      data: grade,
    });
  } catch (error) {
    next(error);
  }
};

export const updateGrade = async (req, res, next) => {
  try {
    const grade = await gradeService.updateGrade(
      req.params.gradeId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Grade updated successfully",
      data: grade,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGrade = async (req, res, next) => {
  try {
    await gradeService.deleteGrade(req.params.gradeId);

    res.status(200).json({
      success: true,
      message: "Grade deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};