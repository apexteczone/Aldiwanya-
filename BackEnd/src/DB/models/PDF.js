import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema(
  {
    type: {type:String,trim:true,maxlength:100,default:'مذكرة'},
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
      default: "",
    },

    pdfUrl: {
      type: String,
      required: true,
      trim: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
      index: true,
    },

    isFreePreview: {
      type: Boolean,
      default: true,
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

pdfSchema.index({
  course: 1,
  lesson: 1,
});

const PDFModel = mongoose.model("PDF", pdfSchema);

export default PDFModel;