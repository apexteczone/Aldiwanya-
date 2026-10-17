import multer from "multer";
import sharp from "sharp";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises";
import User from "../../DB/models/User.js";
import { uploadRoot } from "../../middlewares/upload.middleware.js";
import { accountChanged } from "./realtime.js";

export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0 },
}).single("avatar");
const folder = path.join(uploadRoot, "avatars");
export async function removeAvatarFile(url) {
  // Only application-generated avatar names are eligible for deletion.
  if (!/^\/uploads\/avatars\/[a-f\d-]{36}\.webp$/.test(url || "")) return;
  const target = path.resolve(folder, path.basename(url));
  if (path.dirname(target) !== path.resolve(folder))
    throw new Error("Invalid avatar path");
  try {
    await fs.unlink(target);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
export async function uploadAvatar(req, res) {
  if (!req.file) throw new Error("اختر صورة الحساب.", { cause: 422 });
  let buffer;
  try {
    const image = sharp(req.file.buffer, {
      limitInputPixels: 20000000,
      failOn: "warning",
    });
    const metadata = await image.metadata();
    if (
      !["jpeg", "png", "webp"].includes(metadata.format) ||
      (metadata.pages || 1) > 1
    )
      throw new Error();
    buffer = await image
      .rotate()
      .resize(512, 512, {
        fit: "cover",
        position: "centre",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();
  } catch {
    throw new Error("اختر صورة JPG أو PNG أو WebP صالحة، حتى 5 ميجابايت.", {
      cause: 422,
    });
  }
  const filename = crypto.randomUUID() + ".webp",
    url = "/uploads/avatars/" + filename;
  await fs.mkdir(folder, { recursive: true });
  await fs.writeFile(path.join(folder, filename), buffer, { flag: "wx" });
  let previous;
  try {
    // The previous document is returned atomically, so simultaneous replacements
    // each delete the exact file they replaced, never the final account image.
    previous = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { avatarUrl: url } },
      { returnDocument: "before" },
    ).select("avatarUrl");
    if (!previous) throw new Error("User not found", { cause: 404 });
  } catch (error) {
    const referenced = await User.exists({ avatarUrl: url });
    if (!referenced) await removeAvatarFile(url);
    throw error;
  }
  let warning = "";
  try {
    await removeAvatarFile(previous.avatarUrl);
  } catch {
    warning =
      "تم حفظ الصورة، لكن تعذر حذف الملف السابق من التخزين. تواصل مع مسؤول السيرفر.";
  }
  accountChanged(req.user._id);
  res.json({
    success: true,
    data: {
      avatarUrl: (await User.findById(req.user._id).select("avatarUrl"))
        .avatarUrl,
      warning,
    },
  });
}
export async function deleteAvatar(req, res) {
  const previous = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: { avatarUrl: "" } },
    { returnDocument: "before" },
  ).select("avatarUrl");
  if (!previous) throw new Error("User not found", { cause: 404 });
  await removeAvatarFile(previous.avatarUrl);
  accountChanged(req.user._id);
  res.json({ success: true, data: { avatarUrl: "" } });
}
