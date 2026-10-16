import "dotenv/config";
import mongoose from "mongoose";
import { pathToFileURL } from "node:url";
import { extractYouTubeVideoId } from "../Modules/Lesson/youtube.js";
export async function migrateLessonVideos({ apply = false } = {}) {
  const db = mongoose.connection.db,
    lessons = await db.collection("lessons").find({}).toArray(),
    videos = await db.collection("videos").find({}).toArray();
  const byLesson = new Map(),
    problems = [],
    changes = [];
  for (const video of videos) {
    const key = String(video.lessonId);
    byLesson.set(key, [...(byLesson.get(key) || []), video]);
  }
  for (const [id, rows] of byLesson) {
    const lesson = lessons.find((l) => String(l._id) === id);
    if (!lesson) {
      problems.push({ lessonId: id, reason: "orphan_video" });
      continue;
    }
    if (rows.length !== 1) {
      problems.push({
        lessonId: id,
        reason: "multiple_videos_require_manual_review",
      });
      continue;
    }
    const video = rows[0];
    if (String(video.migratedToLessonId) === id) continue;
    let videoId;
    try {
      videoId = extractYouTubeVideoId(video.videoUrl);
    } catch {
      problems.push({ lessonId: id, reason: "unsupported_video_url" });
      continue;
    }
    if (
      lesson.videoId &&
      (lesson.videoId !== videoId ||
        Boolean(lesson.isFreePreview) !== (video.accessLevel === "free"))
    ) {
      problems.push({ lessonId: id, reason: "existing_lesson_video_conflict" });
      continue;
    }
    changes.push({
      lesson,
      video,
      fields: {
        videoId,
        legacyVideoId: video._id,
        thumbnailUrl: video.thumbnailUrl || lesson.thumbnailUrl || "",
        durationSeconds: video.durationSeconds || lesson.durationSeconds || 0,
        description: lesson.description || video.description || "",
        isFreePreview: video.accessLevel === "free",
        status:
          lesson.status === "published" &&
          video.status === "published" &&
          video.processingStatus === "ready"
            ? "published"
            : "draft",
      },
    });
  }
  const report = { videos: changes.length, problems, applied: false };
  if (!apply || problems.length) return report;
  // Run with the application stopped; preserve the original records for rollback.
  for (const { lesson, video, fields } of changes) {
    await db
      .collection("lesson_video_migration_backups")
      .updateOne(
        { _id: lesson._id },
        { $setOnInsert: { lesson, video, savedAt: new Date() } },
        { upsert: true },
      );
    const result = await db
      .collection("lessons")
      .updateOne(
        { _id: lesson._id, videoId: lesson.videoId ?? null },
        { $set: fields },
      );
    if (result.matchedCount !== 1)
      throw new Error(
        "Lesson changed during migration; stop application writes and retry",
      );
    await db
      .collection("studentactivities")
      .updateMany(
        { favoriteVideos: video._id },
        { $addToSet: { favoriteLessons: lesson._id } },
      );
    await db
      .collection("videos")
      .updateOne(
        { _id: video._id },
        { $set: { migratedToLessonId: lesson._id } },
      );
  }
  return { ...report, applied: true };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    if (!process.env.DB_URI) throw new Error("DB_URI required");
    await mongoose.connect(process.env.DB_URI, { autoIndex: false });
    const report = await migrateLessonVideos({
      apply: process.argv.includes("--apply"),
    });
    console.log(JSON.stringify(report, null, 2));
    if (report.problems.length) process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
