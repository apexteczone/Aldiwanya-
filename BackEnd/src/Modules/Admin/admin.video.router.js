import { Router } from "express";
import Joi from "joi";
import Video from "../../DB/models/Video.js";
import Lesson from "../../DB/models/Lesson.js";
import validation from "../../middlewares/validation.middleware.js";
import { uploadImage } from "../../middlewares/upload.middleware.js";
const router = Router();
const id = Joi.string().hex().length(24);
const fields = {
  title: Joi.string().trim().min(2).max(200),
  lessonId: id,
  videoUrl: Joi.string().uri({ scheme: ["https"] }),
  thumbnailUrl: Joi.string()
    .uri({ scheme: ["https"] })
    .allow(""),
  description: Joi.string().max(2000).allow(""),
  durationSeconds: Joi.number().min(0),
  position: Joi.number().integer().min(0),
  accessLevel: Joi.string().valid("free", "paid"),
  status: Joi.string().valid("draft", "published", "archived"),
};
router.get("/videos", async (req, res) => {
  const videos = await Video.find()
    .populate({
      path: "lessonId",
      select: "title courseId",
      populate: { path: "courseId", select: "title" },
    })
    .sort({ position: 1, createdAt: 1 })
    .lean();
  res.json({
    success: true,
    data: videos.map((v) => ({
      ...v,
      id: v._id,
      lesson: v.lessonId?.title || "",
      duration: v.durationSeconds || 0,
      uploadDate: v.createdAt.toISOString().slice(0, 10),
      status: v.status === "published" ? "active" : "inactive",
      publicationStatus: v.status,
      thumbnail: v.thumbnailUrl || "",
    })),
  });
});
router.post(
  "/videos",
  uploadImage.single("thumbnail"),
  validation(
    Joi.object({
      ...fields,
      title: fields.title.required(),
      lessonId: id.required(),
      videoUrl: fields.videoUrl.required(),
      accessLevel: fields.accessLevel.default("paid"),
      status: fields.status.default("draft"),
    }),
  ),
  async (req, res) => {
    if (!(await Lesson.exists({ _id: req.body.lessonId })))
      throw new Error("Lesson not found", { cause: 404 });
    const data = { ...req.body, processingStatus: "ready" };
    if (req.file) data.thumbnailUrl = "/uploads/images/" + req.file.filename;
    const video = await Video.create(data);
    res.status(201).json({ success: true, data: video });
  },
);
router.patch(
  "/videos/:id",
  validation(Joi.object({ id: id.required() }), "params"),
  uploadImage.single("thumbnail"),
  validation(Joi.object(fields)),
  async (req, res) => {
    if (req.body.lessonId && !(await Lesson.exists({ _id: req.body.lessonId })))
      throw new Error("Lesson not found", { cause: 404 });
    const data = { ...req.body };
    if (req.file) data.thumbnailUrl = "/uploads/images/" + req.file.filename;
    if (req.body.videoUrl) data.processingStatus = "ready";
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $set: data },
      { returnDocument: "after", runValidators: true },
    );
    if (!video) throw new Error("Video not found", { cause: 404 });
    res.json({ success: true, data: video });
  },
);
router.delete(
  "/videos/:id",
  validation(Joi.object({ id: id.required() }), "params"),
  async (req, res) => {
    const v = await Video.findByIdAndDelete(req.params.id);
    if (!v) throw new Error("Video not found", { cause: 404 });
    res.json({ success: true });
  },
);
export default router;
