
import mongoose from "mongoose";

import Course from "../../DB/models/Course.js";
import Module from "../../DB/models/Module.js";
import Lesson from "../../DB/models/Lesson.js";
import Grade from "../../DB/models/Grade.js";
import Subscription from "../../DB/models/Subscription.js";
import SubscriptionPeriod from "../../DB/models/Subscription.js";

export const visibleCourse = {
  status: { $in: ["published", "active"] },
};

const valid = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Content not found", { cause: 404 });
  }
};

// Public lesson data must never expose videoId by default.
const toPublicLesson = (lesson) => {
  const { videoId, ...safeLesson } = lesson;

  return {
    ...safeLesson,
    hasVideo: Boolean(videoId),
  };
};

// Support active subscriptions stored in either model.
const hasActiveSubscription = async (userId) => {
  const now = new Date();

  const criteria = {
    userId,
    startsAt: { $lte: now },
    endsAt: { $gt: now },
  };

  const [subscription, subscriptionPeriod] = await Promise.all([
    Subscription.exists(criteria),
    SubscriptionPeriod.exists(criteria),
  ]);

  return Boolean(subscription || subscriptionPeriod);
};

export async function getPublicGrades(req, res) {
  const grades = await Grade.find({ status: "active" })
    .select("name description position")
    .sort({ position: 1, name: 1, _id: 1 })
    .lean();

  return res.json({ success: true, data: grades });
}

export async function getPublishedCourses(req, res) {
  const courses = await Course.find(visibleCourse)
    .populate("grade", "name")
    .sort({ position: 1, _id: 1 })
    .lean();

  const courseIds = courses.map((course) => course._id);

  const modules = await Module.find({
    courseId: { $in: courseIds },
    status: "published",
  })
    .select("_id")
    .lean();

  const moduleIds = modules.map((module) => module._id);

  const counts = await Lesson.aggregate([
    {
      $match: {
        status: "published",
        courseId: { $in: courseIds },
        $or: [
          { moduleId: null },
          { moduleId: { $in: moduleIds } },
        ],
      },
    },
    {
      $group: {
        _id: "$courseId",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map(
    counts.map((item) => [String(item._id), item.count])
  );

  const data = courses.map((course) => ({
    ...course,
    lessonsCount: countMap.get(String(course._id)) || 0,
  }));

  return res.json({ success: true, data });
}

export async function getPublishedCourseById(req, res) {
  valid(req.params.id);

  const course = await Course.findOne({
    _id: req.params.id,
    ...visibleCourse,
  })
    .populate("grade", "name")
    .lean();

  if (!course) {
    throw new Error("Course not found", { cause: 404 });
  }

  // Keep backward compatibility with existing modules.
  const modules = await Module.find({
    courseId: course._id,
    status: "published",
  })
    .sort({ position: 1, _id: 1 })
    .lean();

  const moduleIds = modules.map((module) => module._id);

  const lessons = await Lesson.find({
    courseId: course._id,
    status: "published",
    $or: [
      { moduleId: null },
      { moduleId: { $in: moduleIds } },
    ],
  })
    .sort({ position: 1, _id: 1 })
    .lean();

  // Never send actual video IDs in public course details.
  const safeLessons = lessons.map(toPublicLesson);

  const safeModules = modules.map((module) => ({
    ...module,
    lessons: lessons
      .filter(
        (lesson) => String(lesson.moduleId) === String(module._id)
      )
      .map(toPublicLesson),
  }));

  return res.json({
    success: true,
    data: {
      ...course,
      lessons: safeLessons,
      modules: safeModules,
    },
  });
}

export async function getPublishedLessonById(req, res) {
  valid(req.params.id);

  const lesson = await Lesson.findOne({
    _id: req.params.id,
    status: "published",
  }).lean();

  if (!lesson) {
    throw new Error("Lesson not found", { cause: 404 });
  }

  // The courseId on Lesson is required in the current schema.
  const course = await Course.findOne({
    _id: lesson.courseId,
    ...visibleCourse,
  }).lean();

  if (!course) {
    throw new Error("Course not found", { cause: 404 });
  }

  // Validate the old module relationship only if this lesson has one.
  let module = null;

  if (lesson.moduleId) {
    module = await Module.findOne({
      _id: lesson.moduleId,
      courseId: lesson.courseId,
      status: "published",
    }).lean();

    if (!module) {
      throw new Error("Lesson not found", { cause: 404 });
    }
  }

  let canWatchVideo = Boolean(
    lesson.videoId && lesson.isFreePreview
  );

  // Paid video: Admin may preview it; Student needs an active subscription.
  if (lesson.videoId && !lesson.isFreePreview) {
    if (!req.user) {
      throw new Error("Login required to watch this video", {
        cause: 401,
      });
    }

    if (!["Admin", "Student"].includes(req.user.role)) {
      throw new Error("Forbidden", { cause: 403 });
    }

    if (req.user.role === "Student") {
      const active = await hasActiveSubscription(req.user._id);

      if (!active) {
        throw new Error("An active subscription is required", {
          cause: 403,
        });
      }
    }

    canWatchVideo = true;
  }

  const safeLesson = toPublicLesson(lesson);

  // Include videoId only after access has been approved.
  if (canWatchVideo) {
    safeLesson.videoId = lesson.videoId;
  }

  return res.json({
    success: true,
    data: {
      lesson: safeLesson,
      module,
      course,
    },
  });
}

