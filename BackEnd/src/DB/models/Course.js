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
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",
      required: true,
      index: true,
    },
    coverImage: {
      type: String,
      default: "",
    },
    position: {
      type: Number,
      default: 0,
      index: true,
    },
    lessonsCount: {
      type: Number,
      default: 0,
    },
    videosCount: {
      type: Number,
      default: 0,
    },
    enrolledCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true, 
  }
);

courseSchema.index({
  grade: 1,
  subject: 1,
});

const CourseModel = mongoose.model("Course", courseSchema);

export default CourseModel;