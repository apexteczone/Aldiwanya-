import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    legacyNumber: {type:Number,enum:[10,11,12],unique:true,sparse:true},
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    position: {
      type: Number,
      required: true,
      default: 0,
      index: true,
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

gradeSchema.index(
  { name: 1 },
  { unique: true }
);

const GradeModel = mongoose.model("Grade", gradeSchema);

export default GradeModel;
