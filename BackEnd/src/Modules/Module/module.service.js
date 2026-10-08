import mongoose from "mongoose";

import ModuleModel from "../../DB/models/Module.js";
import CourseModel from "../../DB/models/Course.js";
import LessonModel from "../../DB/models/Lesson.js";

// Check ID
const checkId = (id, name) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error(`Invalid ${name}`, {
      cause: 422,
    });
  }
};


// GET ALL MODULES
export const getModules = async (req, res, next) => {
  try {
    const modules = await ModuleModel.find().sort({
      position: 1,
      createdAt: 1,
    });

    return res.status(200).json({
      success: true,
      data: modules,
    });
  } catch (error) {
    return next(error);
  }
};


// GET MODULE BY ID
export const getModuleById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    checkId(id, "module ID");

    const module = await ModuleModel.findById(id);

    if (!module) {
      return next(
        new Error("Module not found", {
          cause: 404,
        })
      );
    }

    return res.status(200).json({
      success: true,
      data: module,
    });
  } catch (error) {
    return next(error);
  }
};


// CREATE MODULE

export const createModule = async (
  req,
  res,
  next
) => {
  try {
    const { courseId } = req.body;

    checkId(courseId, "course ID");

    const course = await CourseModel.findById(
      courseId
    );

    if (!course) {
      return next(
        new Error("Course not found", {
          cause: 404,
        })
      );
    }

    const lastModule = await ModuleModel.findOne({
      courseId,
    }).sort({
      position: -1,
    });

    const position = lastModule
      ? lastModule.position + 1
      : 0;

    const module = await ModuleModel.create({
      ...req.body,
      position,
      status: "draft",
    });

    return res.status(201).json({
      success: true,
      message: "Module created successfully",
      data: module,
    });
  } catch (error) {
    return next(error);
  }
};


// UPDATE MODULE
export const updateModule = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    checkId(id, "module ID");

    const module = await ModuleModel.findById(id);

    if (!module) {
      return next(
        new Error("Module not found", {
          cause: 404,
        })
      );
    }

    Object.assign(module, req.body);

    await module.save();

    return res.status(200).json({
      success: true,
      message: "Module updated successfully",
      data: module,
    });
  } catch (error) {
    return next(error);
  }
};


// DELETE MODULE
export const deleteModule = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    checkId(id, "module ID");

    const module = await ModuleModel.findById(id);

    if (!module) {
      return next(
        new Error("Module not found", {
          cause: 404,
        })
      );
    }

  
    if(await LessonModel.exists({moduleId:id})) throw new Error('Remove or reassign lessons first',{cause:409});


    await ModuleModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Module deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// PUBLISH MODULE
export const publishModule = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    checkId(id, "module ID");

    const module = await ModuleModel.findById(id);

    if (!module) {
      return next(
        new Error("Module not found", {
          cause: 404,
        })
      );
    }

    const course = await CourseModel.findById(
      module.courseId
    );

    if (!course || course.status !== "published") {
      return next(
        new Error(
          "Module cannot be published before its course is published",
          {
            cause: 400,
          }
        )
      );
    }

    module.status = "published";

    await module.save();

    return res.status(200).json({
      success: true,
      message: "Module published successfully",
      data: module,
    });
  } catch (error) {
    return next(error);
  }
};


// HIDE MODULE
export const hideModule = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    checkId(id, "module ID");

    const module = await ModuleModel.findById(id);

    if (!module) {
      return next(
        new Error("Module not found", {
          cause: 404,
        })
      );
    }

    module.status = "draft";

    await module.save();

    return res.status(200).json({
      success: true,
      message: "Module hidden successfully",
      data: module,
    });
  } catch (error) {
    return next(error);
  }
};


// REORDER MODULES
export const reorderModules = async (
  req,
  res,
  next
) => {
  try {
    const { courseId, ids } = req.body;

    checkId(courseId, "course ID");

    const uniqueIds = new Set(ids);

    if (uniqueIds.size !== ids.length) {
      return next(
        new Error(
          "Duplicate module IDs are not allowed",
          {
            cause: 422,
          }
        )
      );
    }

    const modules = await ModuleModel.find({
      courseId,
    }).select("_id");

    if (modules.length !== ids.length) {
      return next(
        new Error(
          "You must provide all module IDs of this course",
          {
            cause: 422,
          }
        )
      );
    }

    const existingIds = new Set(
      modules.map((module) =>
        module._id.toString()
      )
    );

    for (const id of ids) {
      if (!existingIds.has(id)) {
        return next(
          new Error("Invalid module ordering", {
            cause: 422,
          })
        );
      }
    }

    await ModuleModel.bulkWrite(
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

    const updatedModules =
      await ModuleModel.find({
        courseId,
      }).sort({
        position: 1,
      });

    return res.status(200).json({
      success: true,
      message: "Modules reordered successfully",
      data: updatedModules,
    });
  } catch (error) {
    return next(error);
  }
};
