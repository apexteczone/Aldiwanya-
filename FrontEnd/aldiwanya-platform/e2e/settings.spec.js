import { test, expect } from "@playwright/test";

test("platform settings save both sections, preserve drafts and keep visitor pages unchanged", async ({
  page,
  request,
}, info) => {
  await page.goto("/");
  const originalHome = await page.locator("h1").textContent();
  await page.goto("/login");
  await page
    .getByLabel("البريد الإلكتروني أو رقم الجوال", { exact: true })
    .fill("admin@example.com");
  await page
    .getByLabel("كلمة المرور", { exact: true })
    .fill("AldiwanyaLocal!2026");
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await page.goto("/admin/settings");
  await expect(
    page.getByRole("heading", { name: "إعدادات المنصة", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("اسم المنصة", { exact: true })).toBeEnabled();
  await page
    .getByLabel("اسم المنصة", { exact: true })
    .fill("منصة إعدادات الاختبار");
  await page
    .getByLabel("الوصف المختصر", { exact: true })
    .fill("وصف مختصر لتجربة حفظ إعدادات المنصة");
  await page
    .getByLabel("الوصف الكامل", { exact: true })
    .fill("معلومات تعليمية تجريبية\nتُحفظ في قاعدة الاختبار المنفصلة فقط.");
  await page.getByLabel("رابط الموقع", { exact: true }).fill("example.com");
  await page
    .getByLabel("البريد الإلكتروني", { exact: true })
    .fill("support@example.com");
  await page.getByLabel("رمز الدولة", { exact: true }).selectOption("+20");
  await page.getByLabel("رقم الهاتف", { exact: true }).fill("01012345678");
  await page
    .getByLabel("العنوان", { exact: true })
    .fill("عنوان تجربة الإعدادات");
  await page
    .getByLabel("رابط فيسبوك", { exact: true })
    .fill("https://facebook.com/test");
  await page
    .getByRole("button", { name: "حفظ التغييرات", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText(
    "تم حفظ المعلومات الأساسية.",
  );
  await expect(page.getByLabel("رابط فيسبوك", { exact: true })).toHaveValue(
    "https://facebook.com/test",
  );
  await page
    .getByLabel("رابط إنستجرام", { exact: true })
    .fill("https://instagram.com/test");
  await page
    .getByLabel("رابط يوتيوب", { exact: true })
    .fill("https://youtube.com/@test");
  await page.getByLabel("رابط إكس", { exact: true }).fill("https://x.com/test");
  await page
    .getByLabel("رابط لينكد إن", { exact: true })
    .fill("https://linkedin.com/company/test");
  await page
    .getByRole("button", { name: "حفظ روابط التواصل", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText(
    "تم حفظ روابط التواصل الاجتماعي.",
  );
  await page.reload();
  await expect(page.getByLabel("اسم المنصة", { exact: true })).toHaveValue(
    "منصة إعدادات الاختبار",
  );
  await expect(page.getByLabel("رابط الموقع", { exact: true })).toHaveValue(
    "example.com/",
  );
  await expect(page.getByLabel("رقم الهاتف", { exact: true })).toHaveValue(
    "01012345678",
  );
  await expect(page.getByLabel("رابط يوتيوب", { exact: true })).toHaveValue(
    "https://youtube.com/@test",
  );
  await page.setViewportSize({ width: 1536, height: 1200 });
  await page.screenshot({
    path: info.outputPath("platform-settings-desktop.png"),
    fullPage: true,
  });
  await page.getByText("أمان حساب الأدمن", { exact: true }).click();
  await expect(
    page.getByLabel("كلمة المرور الحالية", { exact: true }),
  ).toBeVisible();
  await page.getByText("أمان حساب الأدمن", { exact: true }).click();
  const token = await page.evaluate(
    () => sessionStorage.getItem("token") || localStorage.getItem("token"),
  );
  const headers = { Authorization: "Bearer " + token };
  const response = await request.get("/api/v1/admin/settings", { headers });
  expect(response.ok()).toBe(true);
  const snapshot = (await response.json()).data;
  const concurrent = await request.patch("/api/v1/admin/settings", {
    headers,
    data: {
      revision: snapshot.revision,
      general: { ...snapshot.general, address: "تعديل من جلسة أخرى" },
    },
  });
  expect(concurrent.ok()).toBe(true);
  await page.getByLabel("العنوان", { exact: true }).fill("تعديل لم يحفظ بعد");
  await page
    .getByRole("button", { name: "حفظ التغييرات", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "تم تعديل الإعدادات من جلسة أخرى",
  );
  await expect(page.getByLabel("العنوان", { exact: true })).toHaveValue(
    "تعديل لم يحفظ بعد",
  );
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "إعادة تحميل البيانات", exact: true })
    .click();
  await expect(page.getByLabel("العنوان", { exact: true })).toHaveValue(
    "تعديل من جلسة أخرى",
  );
  await page
    .getByLabel("رابط فيسبوك", { exact: true })
    .fill("https://facebook.com.evil.example/test");
  await page
    .getByRole("button", { name: "حفظ روابط التواصل", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("أدخل رابط HTTPS صالحًا");
  await page.getByLabel("رابط فيسبوك", { exact: true }).fill("");
  await page
    .getByRole("button", { name: "حفظ روابط التواصل", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText(
    "تم حفظ روابط التواصل الاجتماعي.",
  );
  await page.reload();
  await expect(page.getByLabel("رابط فيسبوك", { exact: true })).toHaveValue("");
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: "فتح القائمة الجانبية", exact: true })
    .click();
  await page
    .getByRole("button", { name: "إغلاق القائمة", exact: true })
    .click();
  await expect(page.locator("aside")).not.toBeInViewport();
  await page
    .locator("main")
    .first()
    .evaluate((el) => el.scrollTo({ top: 0, behavior: "instant" }));
  await expect(
    page.getByRole("heading", { name: "إعدادات المنصة", exact: true }),
  ).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath("platform-settings-mobile.png"),
    fullPage: true,
  });
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText(originalHome);
});
