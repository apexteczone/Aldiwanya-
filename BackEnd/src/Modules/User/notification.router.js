import { Router } from "express";
import Joi from "joi";
import Notification from "../../DB/models/Notification.js";
import authentication from "../../middlewares/authMiddleware.js";
import validation from "../../middlewares/validation.middleware.js";
import { notificationsChanged } from "./realtime.js";
const router = Router();
router.use(authentication(), (req, res, next) => {
  res.set("Cache-Control", "private, no-store");
  next();
});
router.get(
  "/",
  validation(Joi.object({ before: Joi.string().hex().length(24) }), "query"),
  async (req, res) => {
    const filter = {
      recipient: req.user._id,
      ...(req.query.before ? { _id: { $lt: req.query.before } } : {}),
    };
    const [rows, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ _id: -1 })
        .limit(21)
        .select("type title message href readAt createdAt")
        .lean(),
      Notification.countDocuments({ recipient: req.user._id, readAt: null }),
    ]);
    const items = rows.slice(0, 20);
    res.json({
      success: true,
      data: {
        items,
        unreadCount,
        nextCursor: rows.length > 20 ? String(items.at(-1)._id) : null,
      },
    });
  },
);
router.patch("/read-all", async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, readAt: null },
    { $set: { readAt: new Date() } },
  );
  notificationsChanged(req.user._id);
  res.json({ success: true });
});
router.patch(
  "/:id/read",
  validation(
    Joi.object({ id: Joi.string().hex().length(24).required() }),
    "params",
  ),
  async (req, res) => {
    const row = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { $set: { readAt: new Date() } },
      { returnDocument: "after" },
    );
    if (!row) throw new Error("Notification not found", { cause: 404 });
    notificationsChanged(req.user._id);
    res.json({ success: true });
  },
);
export default router;
