import {mockYouTube} from './youtube-double.js';
import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
test.describe.configure({ mode: "serial" });
test.beforeEach(async({page})=>mockYouTube(page));
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
  await expect(page).toHaveTitle("الرئيسية | الديوانية");
  await expect(
    page.getByText("لا توجد صفوف متاحة حاليًا.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("ستظهر المعاينات المجانية هنا عند نشرها.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "آراء طلابنا" })).toHaveCount(0);
  await expect(page.locator('.brand img')).toHaveAttribute('src', '/diwaniya-logo-colored.png');
  await page.getByRole('link', {name: /اختبارات تجريبية/}).click();
  await expect(page.getByText('لا توجد اختبارات منشورة بعد.')).toBeVisible();
  await page.goBack();
  await screenshot(page, info, "home-empty-desktop");
  await page.getByRole("link", { name: "تسجيل الدخول", exact: true }).click();
  await expect(page).toHaveTitle("تسجيل الدخول | الديوانية");
  await expect(
    page.getByRole("heading", { name: "تسجيل الدخول", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("الاسم الكامل", { exact: true })).toHaveCount(0);
  await screenshot(page, info, "login-desktop");
  await page
    .getByRole("link", { name: "إنشاء حساب جديد", exact: true })
    .click();
  await expect(page.getByLabel("الاسم الكامل", { exact: true })).toBeVisible();
  await expect(page).toHaveTitle("إنشاء حساب جديد | الديوانية");
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
  const emptyGrade = await create("/admin/grades/create", { name: "صف بدون مواد", status: "active" });
  await create("/admin/grades/create", { name: "صف غير متاح", status: "inactive" });
  const course = await create("/admin/courses", {
    title: "مادة اختبار الربط",
    description: "محتوى مؤقت داخل قاعدة الاختبار فقط.",
    grade: grade._id,
    subject: "مادة اختبار",
    status: "published",
  });
  courseId = course._id;
  await create("/admin/courses", { title: "مادة غير منشورة", grade: grade._id, subject: "مادة اختبار", status: "draft" });
  const lesson = await create("/admin/lessons", {
    title: "درس اختبار منشور",
    youtubeUrl:"https://youtu.be/aqz-KE-bpKQ",
    isFreePreview:true,
    durationSeconds:5,
    courseId,
    status: "published",
  });
  lessonId = lesson._id;
  await create("/admin/lessons", { title: "درس غير منشور", courseId, status: "draft",youtubeUrl:"https://youtu.be/dQw4w9WgXcQ" });
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
  const exam = await request.post('/api/v1/admin/pdfs', {
    headers,
    multipart: {
      title: 'امتحان اختبار مجاني', type: 'امتحانات', course: courseId,
      file: { name: 'exam.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF') },
    },
  });
  expect(exam.ok(), await exam.text()).toBe(true);
  await page.goto("/");
  await expect(page.locator('.home-videos').getByRole('heading', {name: 'درس اختبار منشور', exact:true})).toBeVisible();
  await page.locator('.home-videos').getByRole('link', {name: /درس اختبار منشور/}).click();
  await expect(page).toHaveURL(new RegExp('/lessons/' + lessonId));
  await page.goto('/');
  await page.getByRole('link', {name: /اختبارات تجريبية/}).click();
  await expect(page.getByRole('heading', {name: 'امتحان اختبار مجاني', exact:true})).toBeVisible();
  await expect(page.getByRole('heading', {name: 'مذكرة اختبار مجانية', exact:true})).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', {name: 'امتحان اختبار مجاني', exact:true})).toBeVisible();
  await page.getByRole('button', {name: 'الكل', exact:true}).click();
  await expect(page.getByRole('heading', {name: 'مذكرة اختبار مجانية', exact:true})).toBeVisible();
  await page.goto('/');
  await expect(page.getByRole("heading", {name:"صف بدون مواد",exact:true})).toBeVisible();
  await expect(page.getByText("صف غير متاح", {exact:true})).toHaveCount(0);
  await screenshot(page, info, "home-public-grades");
  await page.setViewportSize({width:390,height:844});
  await screenshot(page, info, "home-public-grades-mobile");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.getByRole("link", {name:/صف بدون مواد/}).click();
  await expect(page).toHaveURL(new RegExp("grade=" + emptyGrade._id));
  await expect(page.getByText("لا توجد مواد منشورة لهذا الصف بعد.")).toBeVisible();
  await page.getByRole("button", {name:"فتح القائمة",exact:true}).click();
  await page.getByRole("navigation", {name:"التنقل الرئيسي"}).getByRole("link", {name:"الرئيسية", exact:true}).click();
  await page.getByRole("link", {name:/صف اختبار آلي/}).click();
  await expect(page.locator("h1")).toHaveText("صف اختبار آلي");
  await expect(page.getByText("مادة غير منشورة", {exact:true})).toHaveCount(0);
  await page.getByRole("heading", {name:"مادة اختبار الربط",exact:true}).click();
  await expect(page).toHaveURL(new RegExp("/courses/" + courseId));
  await expect(page).toHaveTitle("مادة اختبار الربط | الديوانية");
  await expect(page.getByRole("button", {name:"درس اختبار منشور",exact:true})).toBeVisible();
  await expect(page.getByText("درس غير منشور", {exact:true})).toHaveCount(0);
  await page.getByRole("button", {name:"درس اختبار منشور",exact:true}).click();
  await expect(page).toHaveURL(new RegExp("/lessons/" + lessonId));
  await page.reload();
  await expect(page).toHaveTitle("درس اختبار منشور | الديوانية");
  await expect(page.getByRole("heading", {name:"درس اختبار منشور",exact:true})).toBeVisible();
  await page.setViewportSize({width:1440,height:1000});
  await page.goto("/courses");
  await expect(
    page.getByRole("heading", { name: "مادة اختبار الربط", exact: true }),
  ).toBeVisible();
  await page.getByLabel("ابحث في المواد", { exact: true }).fill("غير موجود");
  await expect(page.getByText("لا توجد مواد تطابق البحث.")).toBeVisible();
  await page.getByRole("button", { name: "إعادة تعيين الفلاتر" }).click();
  await expect(
    page.getByRole("heading", { name: "مادة اختبار الربط" }),
  ).toBeVisible();
  await screenshot(page, info, "courses-published");
  await page.goto("/library");
  await expect(
    page.getByRole("heading", { name: "مذكرة اختبار مجانية" }),
  ).toBeVisible();
  await screenshot(page, info, "library-published");
  await page.goto("/plans");
  await page.getByRole("button", { name: "اختر الخطة", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "سجّل الدخول للمتابعة" }),
  ).toBeDisabled();
  await expect(
    page.getByText(
      "الدفع غير متاح حاليًا. المعاينات والمكتبة المجانية متاحة للجميع.",
    ),
  ).toBeVisible();
  await screenshot(page, info, "plans-published");
  await login(page, "admin@example.com", "AldiwanyaLocal!2026");
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await page.goto("/admin/courses");
  await expect(
    page.getByText("مادة اختبار الربط", { exact: true }),
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
    page.getByText("لم تبدأ أي مادة بعد. استكشف المحتوى وابدأ التعلم."),
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
    page.getByRole("heading", { name: "مادة اختبار الربط", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "درس اختبار منشور", exact: true }),
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
 await page.getByLabel('اختر المادة',{exact:true}).selectOption(courseId);
 await page.getByLabel('عنوان الدرس',{exact:true}).fill('درس تصميم الإدارة');
 await page.getByLabel('ترتيب الدرس',{exact:true}).fill('5');
 await page.getByLabel('وصف الدرس',{exact:true}).fill('وصف منشور من نموذج الإدارة.');
 await page.getByLabel('ملاحظات داخلية',{exact:true}).fill('ملاحظة سرية للمدير فقط');
 await page.getByLabel('رابط فيديو YouTube',{exact:true}).fill('https://youtu.be/aqz-KE-bpKQ');
 await page.getByLabel('صورة مصغرة للدرس',{exact:true}).setInputFiles({name:'thumbnail.png',mimeType:'image/png',buffer:await readFile(fileURLToPath(new URL('../public/diwaniya-majlis.png',import.meta.url)))});
 await page.getByRole('checkbox',{name:'الدرس مجاني — متاح للجميع بدون اشتراك'}).check();
 await page.getByLabel('مدة الفيديو بالثواني',{exact:true}).fill('5');
 await page.getByRole('button',{name:'إضافة الدرس',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('تم حفظ الدرس والفيديو معًا.');
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
 await expect(page).toHaveURL(/\/admin\/lessons$/);
 await page.getByRole('button',{name:'تعديل درس تصميم الإدارة',exact:true}).click();
 await expect(page.getByLabel('رابط فيديو YouTube',{exact:true})).toHaveValue('https://www.youtube.com/watch?v=aqz-KE-bpKQ');
 await page.getByRole('button',{name:'تشغيل الفيديو',exact:true}).click();
 await expect.poll(()=>page.locator('video').evaluate(v=>v.currentTime)).toBeGreaterThan(0);
 await expect(page.getByRole('button',{name:'إيقاف مؤقت',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'إيقاف مؤقت',exact:true}).click();
 await screenshot(page,info,'admin-unified-lesson-video');
 await expect(page.locator('aside').getByRole('link',{name:'الفيديوهات',exact:true})).toHaveCount(0);
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


test('paid lesson returns through registration, checkout and verified payment',async({page,request},info)=>{
 const auth=await request.post('/api/v1/auth/login',{data:{identifier:'admin@example.com',password:'AldiwanyaLocal!2026'}});
 const token=(await auth.json()).data.accessToken;
 const response=await request.post('/api/v1/admin/lessons',{headers:{Authorization:'Bearer '+token},data:{courseId,title:'درس دورة الاشتراك',youtubeUrl:'https://youtu.be/dQw4w9WgXcQ',status:'published',isFreePreview:false}});
 expect(response.ok(),await response.text()).toBe(true);
 const lesson=(await response.json()).data;
 await page.goto('/lessons/'+lesson._id);
 await expect(page).toHaveURL(/\/login\?next=/);
 await page.getByRole('link',{name:'إنشاء حساب جديد',exact:true}).click();
 await expect(page).toHaveURL(/\/register\?next=/);
 await page.getByLabel('الاسم الكامل',{exact:true}).fill('طالب تجربة الاشتراك');
 await page.getByLabel('البريد الإلكتروني',{exact:true}).fill('payment-browser@example.com');
 await page.getByLabel('رقم الجوال',{exact:true}).fill('50000092');
 await page.getByLabel('كلمة المرور',{exact:true}).fill('PaymentBrowser!2026');
 await page.getByLabel('تأكيد كلمة المرور',{exact:true}).fill('PaymentBrowser!2026');
 await page.getByRole('checkbox').check();
 await page.getByRole('button',{name:'إنشاء حساب',exact:true}).click();
 await expect(page).toHaveURL(new RegExp('/plans\\?next=.*'+lesson._id));
 await request.post('/__test/payments/enable');
 await page.reload();
 await page.getByRole('button',{name:'اختر الخطة',exact:true}).first().click();
 await expect(page.getByLabel('وسيلة الدفع',{exact:true})).toHaveValue('2');
 await screenshot(page,info,'checkout-plan-selected');
 await page.route('https://demo.myfatoorah.com/e2e/*',async route=>{
  const invoice=route.request().url().split('/').pop();
  const result=await request.post('/__test/payments/'+invoice+'/paid');
  const {returnUrl}=await result.json();
  // Simulated external gateway redirect; settlement still calls the backend verifier.
  await route.fulfill({status:302,headers:{location:'http://127.0.0.1:5099'+returnUrl},body:''});
 });
 await page.getByRole('button',{name:'متابعة الدفع',exact:true}).click();
 await expect(page).toHaveURL(new RegExp('/lessons/'+lesson._id+'$'),{timeout:20000});
 await expect(page.getByRole('heading',{name:'درس دورة الاشتراك',exact:true})).toBeVisible();
 await expect(page.locator('video')).toHaveAttribute('data-youtube-id','dQw4w9WgXcQ');
 await page.getByRole('button',{name:'تشغيل الفيديو',exact:true}).click();
 await expect.poll(()=>page.locator('video').evaluate(v=>v.currentTime)).toBeGreaterThan(0);
 await screenshot(page,info,'paid-lesson-after-subscription');
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await screenshot(page,info,'paid-lesson-mobile');
});

// Keep the browser's actual save-to-disk check separate from the learning/payment flow.
test('public PDF downloads save the expected file', async ({page}) => {
  await page.goto('/library');
  const documentCard = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'مذكرة اختبار مجانية', exact: true }),
  });
  await expect(documentCard).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    documentCard.getByRole('link', { name: 'تحميل الملف', exact: true }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("document.pdf");
  expect(
    (await readFile(await download.path())).toString().startsWith("%PDF-"),
  ).toBe(true);

});
