import User from "../../DB/models/User.js";
import Notification from "../../DB/models/Notification.js";
import NotificationEvent from "../../DB/models/NotificationEvent.js";
import Course from "../../DB/models/Course.js";
import Lesson from "../../DB/models/Lesson.js";
import Module from "../../DB/models/Module.js";
import { notificationsChanged,hasRealtimeServer } from "./realtime.js";
export async function verifyNotificationIndexes() {
  let indexes = [];
  try {
    indexes = await Notification.collection.indexes();
  } catch (error) {
    if (error.code !== 26) throw error;
  }
  if (
    !indexes.some(
      (index) =>
        index.unique &&
        !index.partialFilterExpression &&
        Object.keys(index.key).length === 2 &&
        index.key.recipient === 1 &&
        index.key.eventKey === 1,
    )
  )
    throw new Error(
      "Notification indexes are missing. Run the reviewed db:indexes step before production startup.",
    );
}

async function deliver(event) {
  if (event.deliveredAt && event.announcedAt) return;
  const filter =
    event.audience === "user"
      ? { _id: event.recipient }
      : { role: event.audience, createdAt: { $lte: event.createdAt } };
  const cursor = User.find(filter).select("_id").lean().cursor();
  let batch = [];
  const flush = async () => {
    if (!batch.length) return;
    await Notification.bulkWrite(
      batch.map((user) => ({
        updateOne: {
          filter: { recipient: user._id, eventKey: event._id },
          update: {
            $setOnInsert: {
              recipient: user._id,
              eventKey: event._id,
              type: event.type,
              title: event.title,
              message: event.message,
              href: event.href,
              readAt: null,
              createdAt: event.createdAt,
            },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );
    for (const user of batch) notificationsChanged(user._id);
    batch = [];
  };
  for await (const user of cursor) {
    batch.push(user);
    if (batch.length === 250) await flush();
  }
  await flush();
  await NotificationEvent.updateOne(
    { _id: event._id },
    { $set: { deliveredAt: new Date(),...(hasRealtimeServer()?{announcedAt:new Date()}: {}) } },
  );
}
export async function enqueueNotification({ _id, ...data }) {
  // Notification delivery must not roll back a successful registration/payment.
  try {
    const event = await NotificationEvent.findOneAndUpdate(
      { _id },
      { $setOnInsert: data },
      { upsert: true, returnDocument: "after" },
    );
    await deliver(event);
  } catch {
    console.error(
      "Notification queue or delivery failed; stored events are retried by the worker.",
    );
  }
}
export async function retryNotifications() {
  const events = await NotificationEvent.find({ $or:[{deliveredAt:null},{announcedAt:null}] })
    .sort({ createdAt: 1 })
    .limit(100);
  for (const event of events) {
    try {
      await deliver(event);
    } catch {
      console.error("Notification delivery retry failed.");
    }
  }
}
export function startNotificationWorker() {
  let busy = false;
  const run = async () => {
    if (busy) return;
    busy = true;
    try {
      await retryNotifications();
    } catch {
      console.error("Notification worker unavailable.");
    } finally {
      busy = false;
    }
  };
  void run();
  const timer = setInterval(run, 30000);
  timer.unref();
  return () => clearInterval(timer);
}
export async function notifyCourse(course) {
  if (!["published", "active"].includes(course.status)) return;
  await enqueueNotification({
    _id: "course:" + course._id,
    audience: "Student",
    type: "course_published",
    title: "كورس جديد",
    message: "متاح الآن: " + course.title,
    href: "/courses/" + course._id,
  });
  const lessons = await Lesson.find({
    courseId: course._id,
    status: "published",
  });
  for (const lesson of lessons) await notifyLesson(lesson);
}
export async function notifyLesson(lesson) {
  if (
    lesson.status !== "published" ||
    !(await Course.exists({
      _id: lesson.courseId,
      status: { $in: ["published", "active"] },
    }))
  )
    return;
  if (
    lesson.moduleId &&
    !(await Module.exists({ _id: lesson.moduleId, status: "published" }))
  )
    return;
  await enqueueNotification({
    _id: "lesson:" + lesson._id,
    audience: "Student",
    type: "lesson_published",
    title: "درس جديد",
    message: "متاح الآن: " + lesson.title,
    href: "/lessons/" + lesson._id,
  });
}
export async function notifyPayment(order) {
  await enqueueNotification({
    _id: "payment-student:" + order._id,
    audience: "user",
    recipient: order.user_id,
    type: "subscription_confirmed",
    title: "تم تأكيد اشتراكك",
    message: "تم تأكيد الدفع وإضافة مدة الاشتراك إلى حسابك.",
    href: "/subscriptions",
  });
  await enqueueNotification({
    _id: "payment-admin:" + order._id,
    audience: "Admin",
    type: "payment_succeeded",
    title: "عملية دفع ناجحة",
    message: "تم تأكيد دفع اشتراك جديد وتحديث حساب الطالب.",
    href: "/admin/payments",
  });
}
