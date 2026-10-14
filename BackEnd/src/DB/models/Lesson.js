import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    moduleId: {type: mongoose.Schema.Types.ObjectId, ref:'Module', index:true},
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

    isFreePreview: {
  type: Boolean,
  default: false,
  index: true,
},


videoId: {
  type: String,
  trim: true,
  default: null,
  match: /^[A-Za-z0-9_-]{11}$/,
},

internalNotes: {
  type: String,
  trim: true,
  maxlength: 2000,
  default: "",
  select: false,
},

    position: {
      type: Number,
      required: true,
      default: 0,
      index: true,
    },
    status:{type:String,enum:['draft','published'],default:'draft',index:true}
  },
  {
    timestamps: true,
  }
);

lessonSchema.index({
  courseId: 1,
  position: 1,
});

const LessonModel = mongoose.model("Lesson", lessonSchema);

export default LessonModel;
