import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
const require = createRequire(
  new URL("../../../BackEnd/package.json", import.meta.url),
);
const sharp = require("sharp");

test("admin and student avatars replace files and notifications arrive live with persistent read state", async ({
  browser,
  request,
}, info) => {
  const adminContext = await browser.newContext(),
    studentContext = await browser.newContext();
  const admin = await adminContext.newPage(),
    student = await studentContext.newPage();
  let cleanupHeaders, gradeId, courseId, lessonId, studentId;
  const png = await sharp({
    create: { width: 120, height: 120, channels: 3, background: "#0088ee" },
  })
    .png()
    .toBuffer();
  const png2 = await sharp({
    create: { width: 120, height: 120, channels: 3, background: "#7e40de" },
  })
    .png()
    .toBuffer();
  const upload = async (page, buffer) =>
    page
      .getByLabel("رفع صورة الحساب", { exact: true })
      .setInputFiles({ name: "avatar.png", mimeType: "image/png", buffer });
  try {
    await admin.goto("/login");
    await admin
      .getByLabel("البريد الإلكتروني أو رقم الجوال", { exact: true })
      .fill("admin@example.com");
    await admin
      .getByLabel("كلمة المرور", { exact: true })
      .fill("AldiwanyaLocal!2026");
    await admin
      .getByRole("button", { name: "تسجيل الدخول", exact: true })
      .click();
    await expect(admin).toHaveURL(/\/admin\/dashboard$/);
    cleanupHeaders = {
      Authorization:
        "Bearer " +
        (await admin.evaluate(
          () =>
            localStorage.getItem("token") || sessionStorage.getItem("token"),
        )),
    };
    await admin
      .getByRole("link", { name: "إعدادات حساب الأدمن", exact: true })
      .click();
    await upload(admin, png);
    await expect(admin.getByRole("status")).toContainText(
      "تم تحديث صورة حسابك",
    );
    const adminAvatar = admin.locator("header .account-avatar img");
    await expect(adminAvatar).toBeVisible();
    const first = await adminAvatar.getAttribute("src");
    await upload(admin, png2);
    await expect(adminAvatar).not.toHaveAttribute("src", first);
    expect((await request.get(first)).status()).toBe(404);
    await expect(admin.locator("header details")).toHaveCount(0);
    await admin.getByRole("button", { name: "الإشعارات", exact: true }).click();
    await expect(
      admin.getByText("متصل بالتحديثات المباشرة", { exact: true }),
    ).toBeVisible();

    const email = "avatar-student@example.com",
      password = "AvatarStudent!2026";
    const registered = await request.post("/api/v1/auth/register", {
      data: {
        fullName: "طالب الإشعارات",
        email,
        phoneNumber: "+96550000075",
        password,
        confirmPassword: password,
        termsAccepted: true,
      },
    });
    expect(registered.ok()).toBe(true);
    studentId = (await registered.json()).data.id;
    await expect(
      admin.getByRole("button", { name: /طالب جديد.*طالب الإشعارات/ }),
    ).toBeVisible();
    await admin.screenshot({
      path: info.outputPath("admin-avatar-notifications.png"),
      fullPage: true,
    });
    await student.goto("/login");
    await student
      .getByLabel("البريد الإلكتروني أو رقم الجوال", { exact: true })
      .fill(email);
    await student.getByLabel("كلمة المرور", { exact: true }).fill(password);
    await student
      .getByRole("button", { name: "تسجيل الدخول", exact: true })
      .click();
    await expect(student).toHaveURL(/\/dashboard$/);
    await student.goto("/account");
    await upload(student, png);
    await expect(student.getByRole("status")).toContainText(
      "تم تحديث صورة حسابك",
    );
    const studentAvatar = student.locator("header .account-avatar img");
    await expect(studentAvatar).toBeVisible();
    const firstStudent = await studentAvatar.getAttribute("src");
    await upload(student, png2);
    await expect(studentAvatar).not.toHaveAttribute("src", firstStudent);
    expect((await request.get(firstStudent)).status()).toBe(404);
    await student.reload();
    await expect(studentAvatar).toBeVisible();
    await student
      .getByRole("button", { name: "الإشعارات", exact: true })
      .click();
    await expect(
      student.getByText("متصل بالتحديثات المباشرة", { exact: true }),
    ).toBeVisible();

    const token = await admin.evaluate(
      () => localStorage.getItem("token") || sessionStorage.getItem("token"),
    );
    const headers = { Authorization: "Bearer " + token };
    const grade = (
      await (
        await request.post("/api/v1/admin/grades/create", {
          headers,
          data: { name: "صف إشعارات الاختبار", status: "active" },
        })
      ).json()
    ).data;
    const courseResponse = await request.post("/api/v1/admin/courses", {
      headers,
      data: {
        title: "مادة إشعارات الاختبار",
        grade: grade._id,
        subject: "اختبار",
        status: "published",
      },
    });
    expect(courseResponse.ok()).toBe(true);
    const course = (await courseResponse.json()).data;
    gradeId = grade._id;
    courseId = course._id;
    await expect(
      student.getByRole("button", { name: /مادة جديدة.*مادة إشعارات الاختبار/ }),
    ).toBeVisible();
    const lessonResponse = await request.post("/api/v1/admin/lessons", {
      headers,
      data: {
        title: "درس إشعارات الاختبار",
        courseId: course._id,
        youtubeUrl: "https://youtu.be/dQw4w9WgXcQ",
        status: "published",
        isFreePreview: true,
      },
    });
    expect(lessonResponse.ok()).toBe(true);
    lessonId = (await lessonResponse.json()).data._id;
    await expect(
      student.getByRole("button", { name: /درس جديد.*درس إشعارات الاختبار/ }),
    ).toBeVisible();
    await student.screenshot({
      path: info.outputPath("student-avatar-notifications.png"),
      fullPage: true,
    });
    await student
      .getByRole("button", { name: "تحديد الكل كمقروء", exact: true })
      .click();
    await expect(student.locator(".notification-count")).toHaveCount(0);
    await student.reload();
    await student
      .getByRole("button", { name: "الإشعارات", exact: true })
      .click();
    await expect(
      student.getByRole("button", { name: /درس جديد.*درس إشعارات الاختبار/ }),
    ).toBeVisible();
    await expect(student.locator(".notification-item.unread")).toHaveCount(0);
    await student
      .getByRole("button", { name: /مادة جديدة.*مادة إشعارات الاختبار/ })
      .click();
    await expect(student).toHaveURL(new RegExp("/courses/" + course._id + "$"));
    await student.goto("/account");
    await student
      .getByRole("button", { name: "حذف الصورة", exact: true })
      .click();
    await expect(studentAvatar).toHaveCount(0);
    await admin
      .getByRole("button", { name: "إغلاق الإشعارات", exact: true })
      .click();
    await admin.setViewportSize({ width: 390, height: 844 });
    await expect(admin.locator("aside")).not.toBeInViewport();
    await admin.getByRole("button", { name: "الإشعارات", exact: true }).click();
    await expect(admin.locator(".notification-panel")).toBeInViewport();
    expect(
      await admin.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await admin.screenshot({
      path: info.outputPath("admin-notifications-mobile.png"),
      fullPage: true,
    });
  } finally {
    await adminContext.close();
    await studentContext.close();
    if (cleanupHeaders) {
      for (const route of [
        lessonId && "/api/v1/admin/lessons/" + lessonId,
        courseId && "/api/v1/admin/courses/" + courseId,
        gradeId && "/api/v1/admin/grades/" + gradeId,
        studentId && "/api/v1/admin/students/" + studentId,
        "/api/v1/user/me/avatar",
      ].filter(Boolean)) {
        const result = await request.delete(route, { headers: cleanupHeaders });
        expect(result.ok(), route).toBe(true);
      }
    }
  }
});
