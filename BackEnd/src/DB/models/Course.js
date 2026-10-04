import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    grade: {
      type: Number,
      enum: [10, 11, 12],
      required: true,
    },

    track: {
      type: String,
      trim: true,
      default: null,
    },

    term: {
      type: String,
      trim: true,
      default: null,
    },

    academicYear: {
      type: String,
      trim: true,
      default: null,
    },

    thumbnail: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },

    position: {
      type: Number,
      required: true,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

courseSchema.index({
  grade: 1,
  position: 1,
});

const CourseModel = mongoose.model(
  "Course",
  courseSchema
);

export default CourseModel;