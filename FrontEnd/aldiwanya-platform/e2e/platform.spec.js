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
  if (new URL(page.url()).pathname.startsWith('/admin/')) {
    await page.locator('main').first().evaluate(el => el.scrollTo({top:0,behavior:'instant'}));
  }
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

test('admin reference pages save lessons, video thumbnails and subscription plans',async({page,request},info)=>{
 test.setTimeout(90000);
 await page.setViewportSize({width:1536,height:1200});
 await login(page,'admin@example.com','AldiwanyaLocal!2026');
 await expect(page).toHaveURL(/\/admin\/dashboard$/);
 await page.goto('/admin/lessons');
 await page.getByLabel('اختر الكورس',{exact:true}).selectOption(courseId);
 await page.getByLabel('عنوان الدرس',{exact:true}).fill('درس تصميم الإدارة');
 await page.getByLabel('ترتيب الدرس',{exact:true}).fill('5');
 await page.getByLabel('وصف الدرس',{exact:true}).fill('وصف منشور من نموذج الإدارة.');
 await page.getByLabel('ملاحظات داخلية',{exact:true}).fill('ملاحظة سرية للمدير فقط');
 await page.getByRole('button',{name:'إضافة الدرس',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('تم إضافة الدرس.');
 await page.getByRole('button',{name:'تعديل درس تصميم الإدارة',exact:true}).click();
 await expect(page.getByLabel('ترتيب الدرس',{exact:true})).toHaveValue('5');
 await expect(page.getByLabel('ملاحظات داخلية',{exact:true})).toHaveValue('ملاحظة سرية للمدير فقط');
 await screenshot(page,info,'admin-reference-lessons');
 await page.getByRole('button',{name:'إلغاء',exact:true}).click();
 await page.getByRole('button',{name:'نشر درس تصميم الإدارة',exact:true}).click();
 await expect(page.getByRole('button',{name:'إخفاء درس تصميم الإدارة',exact:true})).toBeVisible();
 const publicCourse=await (await request.get('/api/v1/courses/'+courseId)).json();
 const lesson=publicCourse.data.lessons.find(l=>l.title==='درس تصميم الإدارة');
 expect(lesson.position).toBe(4);expect(lesson.internalNotes).toBeUndefined();
 await page.goto('/admin/upload');
 await page.route('https://media.example.test/flower.mp4',route=>route.fulfill({path:fileURLToPath(new URL('./fixtures/flower.mp4',import.meta.url)),contentType:'video/mp4'}));
 await page.getByLabel('اختر الكورس',{exact:true}).selectOption(courseId);
 await page.getByLabel('اختر الدرس',{exact:true}).selectOption(lesson._id);
 await page.getByLabel('عنوان الفيديو',{exact:true}).fill('فيديو تصميم الإدارة');
 await page.getByLabel('رابط الفيديو',{exact:true}).fill('https://media.example.test/flower.mp4');
 await page.getByLabel('وصف الفيديو',{exact:true}).fill('وصف الفيديو من لوحة الإدارة.');
 await page.getByLabel('صورة مصغرة للفيديو',{exact:true}).setInputFiles({name:'thumbnail.png',mimeType:'image/png',buffer:await readFile(fileURLToPath(new URL('../public/diwaniya-majlis.png',import.meta.url)))});
 await page.getByText('إعدادات النشر والوصول',{exact:true}).click();
 await page.getByLabel('وصول الفيديو',{exact:true}).selectOption('free');
 await page.getByLabel('حالة الفيديو',{exact:true}).selectOption('published');
 await page.getByLabel('مدة الفيديو بالثواني',{exact:true}).fill('5');
 await page.getByRole('button',{name:'حفظ الفيديو',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('تم حفظ الفيديو وربطه بالدرس.');
 await page.getByRole('button',{name:'تعديل فيديو تصميم الإدارة',exact:true}).click();
 await expect(page.getByLabel('وصف الفيديو',{exact:true})).toHaveValue('وصف الفيديو من لوحة الإدارة.');
 await page.locator('video').evaluate(v=>v.play());
 await expect.poll(()=>page.locator('video').evaluate(v=>v.currentTime)).toBeGreaterThan(0);
 await page.getByText('إعدادات النشر والوصول',{exact:true}).click();
 await screenshot(page,info,'admin-reference-video');
 await page.getByRole('button',{name:'إلغاء',exact:true}).click();
 await page.getByLabel('رابط الفيديو',{exact:true}).fill('https://youtu.be/dQw4w9WgXcQ');
 await expect(page.locator('iframe')).toHaveAttribute('src','https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
 await page.getByLabel('رابط الفيديو',{exact:true}).fill('https://vimeo.com/123456');
 await expect(page.locator('iframe')).toHaveAttribute('src','https://player.vimeo.com/video/123456');
 await page.goto('/admin/plans');
 await expect(page).toHaveURL(/\/admin\/subscriptions$/);
 await page.getByRole('button',{name:'ترم',exact:true}).click();
 await page.getByLabel('مدة الخطة',{exact:true}).selectOption('6');
 await page.getByLabel('اسم الخطة',{exact:true}).fill('اشتراك الترم التجريبي');
 await page.getByLabel('سعر الخطة',{exact:true}).fill('12.345');
 await page.getByLabel('وصف الخطة',{exact:true}).fill('خطة اختبار من نموذج الإدارة.');
 await page.getByRole('button',{name:'إضافة الخطة',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('تم حفظ خطة الاشتراك.');
 await page.getByRole('button',{name:'تعديل اشتراك الترم التجريبي',exact:true}).click();
 await expect(page.getByLabel('سعر الخطة',{exact:true})).toHaveValue('12.345');
 await expect(page.getByLabel('مدة الخطة',{exact:true})).toHaveValue('6');
 await screenshot(page,info,'admin-reference-subscriptions');
 await page.getByRole('button',{name:'إلغاء',exact:true}).click();
 page.once('dialog',d=>d.accept());
 await page.getByRole('button',{name:'إيقاف اشتراك الترم التجريبي',exact:true}).click();
 await expect(page.getByRole('button',{name:'تفعيل اشتراك الترم التجريبي',exact:true})).toBeVisible();
 const publicPlans=await (await request.get('/api/v1/plan/getActivePlans')).json();expect(publicPlans.data.some(p=>p.title==='اشتراك الترم التجريبي')).toBe(false);
 await page.getByRole('button',{name:'تفعيل اشتراك الترم التجريبي',exact:true}).click();
 await expect(page.getByRole('button',{name:'إيقاف اشتراك الترم التجريبي',exact:true})).toBeVisible();
 await page.getByRole('tab',{name:'اشتراكات الطلاب',exact:true}).click();
 await expect(page.getByText('إجمالي الاشتراكات',{exact:true})).toBeVisible();
 await page.setViewportSize({width:390,height:844});
 for(const route of ['lessons','upload','subscriptions']){
   await page.goto('/admin/'+route);
   await expect(page.locator('fieldset')).toBeEnabled();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
   await screenshot(page,info,'admin-reference-mobile-'+route);
 }
});

