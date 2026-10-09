import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },

    videoUrl: {type:String, default:null},
    description: {type:String, trim:true, maxlength:2000, default:''},
    thumbnailUrl: {type:String, default:null},
    provider: {
      type: String,
      default: null,
    },

    providerAssetId: {
      type: String,
      default: null,
    },

    storageKey: {
      type: String,
      default: null,
    },

    durationSeconds: {
      type: Number,
      default: null,
      min: 0,
    },

    accessLevel: {
      type: String,
      enum: ["free", "paid"],
      default: "paid",
      required: true,
    },

    processingStatus: {
      type: String,
      enum: [
        "pending",
        "processing",
        "ready",
        "failed",
      ],
      default: "pending",
    },

    status: {
      type: String,
      enum: [
        "draft",
        "published",
        "archived",
      ],
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

videoSchema.index({
  lessonId: 1,
  position: 1,
});

const VideoModel = mongoose.model(
  "Video",
  videoSchema
);

export default VideoModel;
