import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    grade: {
      type: Number,
      enum: [10, 11, 12],
      required: true,
    },

    track: {
      type: String,
      trim: true,
    },

    term: {
      type: String,
      trim: true,
    },

    academic_year: {
      type: String,
      trim: true,
    },

    thumbnail: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    position: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;