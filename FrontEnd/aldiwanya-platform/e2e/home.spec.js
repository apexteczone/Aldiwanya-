import { test, expect } from "@playwright/test";

test("homepage retries unavailable data and supports reduced motion on narrow screens", async ({
  page,
}) => {
  let attempts = 0;
  await page.route("**/api/v1/grades", async (route) => {
    attempts += 1;
    if (attempts === 1)
      return route.fulfill({
        status: 503,
        json: { error: { message: "المحتوى غير متاح مؤقتًا" } },
      });
    return route.continue();
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  const grades = page.getByRole("region", {
    name: "المواد الدراسية",
    exact: true,
  });
  await expect(grades.getByRole("alert")).toContainText(
    "المحتوى غير متاح مؤقتًا",
  );
  await grades.getByRole("button", { name: "إعادة المحاولة" }).click();
  await expect(grades.getByText("لا توجد صفوف متاحة حاليًا.")).toBeVisible();
  expect(attempts).toBe(2);
  expect(
    await page
      .locator(".home-trial-art")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  const trial = page.getByRole("link", { name: /دروس تفاعلية/ });
  await trial.focus();
  await expect(trial).toBeFocused();
  await trial.press("Enter");
  await expect(page).toHaveURL(/\/previews$/);
  await expect(page.locator("h1")).toBeVisible();
});
