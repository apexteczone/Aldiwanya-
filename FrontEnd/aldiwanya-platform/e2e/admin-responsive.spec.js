import { test, expect } from '@playwright/test';

test('admin logout remains reachable on laptops and short mobile screens', async ({page}, info) => {
  await page.goto('/login');
  await page.getByLabel('البريد الإلكتروني أو رقم الجوال', {exact:true}).fill('admin@example.com');
  await page.getByLabel('كلمة المرور', {exact:true}).fill('AldiwanyaLocal!2026');
  await page.getByRole('button', {name:'تسجيل الدخول',exact:true}).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  const logout = page.getByRole('button', {name:'تسجيل الخروج',exact:true});
  for (const [width,height] of [[1536,730],[1366,620],[1280,600],[1024,600],[768,600],[390,700],[844,390]]) {
    await page.setViewportSize({width,height});
    if (width<768) await page.getByRole('button', {name:'فتح القائمة الجانبية',exact:true}).click();
    await expect(logout).toBeVisible();
    await expect.poll(() => logout.evaluate(el => {
      const box=el.getBoundingClientRect();
      return box.top>=0 && box.bottom<=innerHeight && box.left>=0 && box.right<=innerWidth;
    }), {message:`Logout must fit within ${width}x${height}`}).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    await page.screenshot({path:info.outputPath(`admin-${width}x${height}.png`)});
    if (width<768) await page.getByRole('button', {name:'إغلاق القائمة',exact:true}).click();
  }
  // Scroll the menu to its last entry; the separate logout area must stay visible.
  await page.getByRole('link', {name:'إعدادات المنصة',exact:true}).click();
  await expect(page).toHaveURL(/\/admin\/settings$/);
  await expect(logout).toBeVisible();
  await logout.click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button',{name:'تسجيل الدخول',exact:true})).toBeVisible();
  await page.goto('/admin/dashboard');
  await expect(page).toHaveURL(/\/login/);
});
