import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
test.describe.configure({ mode: "serial" });
let courseId, lessonId;
const studentEmail = "browser-student@example.com",
  studentPassword = "BrowserStudent!2026";
async function login(page, email, password) {
  await page.goto("/login");
  await page
    .getByLabel("البريد الإلكتروني أو رقم الجوال", { exact: true })
    .fill(email);
  await page.getByLabel("كلمة المرور", { exact: true }).fill(password);
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
}
async function screenshot(page, info, name) {
  await page.screenshot({
    path: info.outputPath(name + ".png"),
    fullPage: true,
  });
}
test("public pages show real empty states and separate login and registration", async ({
  page,
}, info) => {
  await page.goto("/");
  await expect(
    page.getByText("لا توجد دورات منشورة بعد.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("لا توجد مذكرات منشورة بعد.", { exact: true }),
  ).toBeVisible();
  await screenshot(page, info, "home-empty-desktop");
  await page.getByRole("link", { name: "تسجيل الدخول", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "تسجيل الدخول", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("الاسم الكامل", { exact: true })).toHaveCount(0);
  await screenshot(page, info, "login-desktop");
  await page
    .getByRole("link", { name: "إنشاء حساب جديد", exact: true })
    .click();
  await expect(page.getByLabel("الاسم الكامل", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "تسجيل الدخول", exact: true }),
  ).toHaveCount(0);
  await screenshot(page, info, "register-desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/library",
    "/courses",
    "/plans",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await screenshot(page, info, "mobile-" + (route.slice(1) || "home"));
  }
});
test("dashboard publishing produces public courses, plans, free video and PDFs", async ({
  request,
  page,
}, info) => {
  const signed = await request.post("/api/v1/auth/login", {
    data: { identifier: "admin@example.com", password: "AldiwanyaLocal!2026" },
  });
  expect(signed.ok()).toBe(true);
  const token = (await signed.json()).data.accessToken,
    headers = { Authorization: "Bearer " + token };
  async function create(url, data) {
    const r = await request.post("/api/v1" + url, { data, headers });
    expect(r.ok(), await r.text()).toBe(true);
    return (await r.json()).data;
  }
  const grade = await create("/admin/grades/create", {
    name: "صف اختبار آلي",
    status: "active",
  });
  const emptyGrade = await create("/admin/grades/create", { name: "صف بدون كورسات", status: "active" });
  await create("/admin/grades/create", { name: "صف غير متاح", status: "inactive" });
  const course = await create("/admin/courses", {
    title: "كورس اختبار الربط",
    description: "محتوى مؤقت داخل قاعدة الاختبار فقط.",
    grade: grade._id,
    subject: "مادة اختبار",
    status: "published",
  });
  courseId = course._id;
  await create("/admin/courses", { title: "كورس غير منشور", grade: grade._id, subject: "مادة اختبار", status: "draft" });
  const lesson = await create("/admin/lessons", {
    title: "درس اختبار منشور",
    courseId,
    status: "published",
  });
  lessonId = lesson._id;
  await create("/admin/lessons", { title: "درس غير منشور", courseId, status: "draft" });
  await create("/admin/videos", {
    title: "معاينة اختبار مجانية",
    lessonId,
    videoUrl: "https://media.example.test/flower.mp4",
    accessLevel: "free",
    status: "published",
    durationSeconds: 5,
  });
  await create("/plan/CreatePlan", {
    title: "خطة اختبار شهرية",
    durationMonths: 1,
    amountMinor: 1500,
    currency: "KWD",
  });
  const pdf = await request.post("/api/v1/admin/pdfs", {
    headers,
    multipart: {
      title: "مذكرة اختبار مجانية",
      type: "مذكرة",
      course: courseId,
      file: {
        name: "test.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF"),
      },
    },
  });
  expect(pdf.ok(), await pdf.text()).toBe(true);
  await page.goto("/");
  await expect(page.getByRole("heading", {name:"صف بدون كورسات",exact:true})).toBeVisible();
  await expect(page.getByText("صف غير متاح", {exact:true})).toHaveCount(0);
  await screenshot(page, info, "home-public-grades");
  await page.setViewportSize({width:390,height:844});
  await screenshot(page, info, "home-public-grades-mobile");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.getByRole("link", {name:/صف بدون كورسات/}).click();
  await expect(page).toHaveURL(new RegExp("grade=" + emptyGrade._id));
  await expect(page.getByText("لا توجد كورسات منشورة لهذا الصف بعد.")).toBeVisible();
  await page.getByRole("navigation", {name:"مسار التصفح"}).getByRole("link", {name:"الصفوف الدراسية"}).click();
  await page.getByRole("link", {name:/صف اختبار آلي/}).click();
  await expect(page.locator("h1")).toHaveText("صف اختبار آلي");
  await expect(page.getByText("كورس غير منشور", {exact:true})).toHaveCount(0);
  await page.getByRole("heading", {name:"كورس اختبار الربط",exact:true}).click();
  await expect(page).toHaveURL(new RegExp("/courses/" + courseId));
  await expect(page.getByRole("button", {name:"درس اختبار منشور",exact:true})).toBeVisible();
  await expect(page.getByText("درس غير منشور", {exact:true})).toHaveCount(0);
  await page.getByRole("button", {name:"درس اختبار منشور",exact:true}).click();
  await expect(page).toHaveURL(new RegExp("lesson=" + lessonId));
  await page.reload();
  await expect(page.getByRole("heading", {name:"درس اختبار منشور",exact:true})).toBeVisible();
  await page.setViewportSize({width:1440,height:1000});
  await page.goto("/courses");
  await expect(
    page.getByRole("heading", { name: "كورس اختبار الربط", exact: true }),
  ).toBeVisible();
  await page.getByLabel("ابحث في الدورات", { exact: true }).fill("غير موجود");
  await expect(page.getByText("لا توجد دورات تطابق البحث.")).toBeVisible();
  await page.getByRole("button", { name: "إعادة تعيين الفلاتر" }).click();
  await expect(
    page.getByRole("heading", { name: "كورس اختبار الربط" }),
  ).toBeVisible();
  await screenshot(page, info, "courses-published");
  await page.goto("/library");
  await expect(
    page.getByRole("heading", { name: "مذكرة اختبار مجانية" }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "تحميل الملف", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("document.pdf");
  expect(
    (await readFile(await download.path())).toString().startsWith("%PDF-"),
  ).toBe(true);
  await screenshot(page, info, "library-published");
  await page.goto("/plans");
  await page.getByRole("button", { name: "اختر الخطة", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "متابعة الدفع" }),
  ).toBeDisabled();
  await expect(
    page.getByText(
      "الدفع غير متاح حاليًا. سيُتاح بعد اكتمال الربط مع ماي فاتورة.",
    ),
  ).toBeVisible();
  await screenshot(page, info, "plans-published");
  await login(page, "admin@example.com", "AldiwanyaLocal!2026");
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await page.goto("/admin/courses");
  await expect(
    page.getByText("كورس اختبار الربط", { exact: true }),
  ).toBeVisible();
});
test("registration, playback, favorites, progress and profile persist through the real API", async ({
  page,
}, info) => {
  await page.goto("/register");
  await page
    .getByLabel("الاسم الكامل", { exact: true })
    .fill("طالب اختبار الواجهة");
  await page
    .getByLabel("البريد الإلكتروني", { exact: true })
    .fill(studentEmail);
  await page.getByLabel("رقم الجوال", { exact: true }).fill("50000007");
  await page.getByLabel("كلمة المرور", { exact: true }).fill(studentPassword);
  await page
    .getByLabel("تأكيد كلمة المرور", { exact: true })
    .fill(studentPassword);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "إنشاء حساب", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByText("لم تبدأ أي دورة بعد. استكشف المحتوى وابدأ التعلم."),
  ).toBeVisible();
  await page.route("https://media.example.test/flower.mp4", (route) =>
    route.fulfill({
      path: fileURLToPath(new URL("./fixtures/flower.mp4", import.meta.url)),
      contentType: "video/mp4",
    }),
  );
  await page.goto("/courses/" + courseId);
  await expect(
    page.getByRole("heading", { name: "درس اختبار منشور", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "إضافة إلى المفضلة" }).click();
  await expect(
    page.getByRole("button", { name: "إزالة من المفضلة" }),
  ).toBeVisible();
  await page.locator("video").evaluate((video) => video.play());
  await expect
    .poll(() => page.locator("video").evaluate((video) => video.currentTime))
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: "تحديد الدرس كمكتمل" }).click();
  await expect(
    page.getByRole("button", { name: "إلغاء تحديد الدرس كمكتمل" }),
  ).toBeVisible();
  expect(await page.locator('.course-summary').evaluate(panel => panel.querySelector('h2').getBoundingClientRect().bottom <= panel.getBoundingClientRect().bottom)).toBe(true);
  await screenshot(page, info, "course-player");
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "كورس اختبار الربط", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "معاينة اختبار مجانية", exact: true }),
  ).toBeVisible();
  await expect(page.locator("progress")).toHaveAttribute("value", "100");
  await screenshot(page, info, "student-dashboard");
  await page.reload();
  await expect(page.locator("progress")).toHaveAttribute("value", "100");
  await page.goto("/account");
  await page
    .getByLabel("الاسم الكامل", { exact: true })
    .fill("طالب بعد التعديل");
  await page.getByRole("button", { name: "حفظ التغييرات" }).click();
  await expect(page.getByRole("status")).toHaveText("تم حفظ بيانات حسابك.");
  await page.reload();
  await expect(page.getByLabel("الاسم الكامل", { exact: true })).toHaveValue(
    "طالب بعد التعديل",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "/dashboard",
    "/courses/" + courseId,
    "/courses/" + courseId + "/preview",
    "/account",
    "/subscriptions",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await screenshot(
      page,
      info,
      "student-mobile-" + route.replaceAll("/", "-"),
    );
  }
});
