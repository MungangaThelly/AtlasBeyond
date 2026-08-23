import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:4173)/, route => route.abort());
});

test('primary routes render usable landmarks without browser exceptions', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of ['/', '/atlas.html', '/region-player.html?expedition=patagonia-continents-end', '/community.html', '/daily.html', '/seals.html', '/synthesis.html', '/offline.html']) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    if (route === '/') await expect(page.locator('#onboarding')).toBeVisible();
    else await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();
    const layout = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      offenders: [...document.querySelectorAll('body *')].map(element => ({ tag: element.tagName, id: element.id, className: typeof element.className === 'string' ? element.className : '', right: Math.round(element.getBoundingClientRect().right) })).filter(item => item.right > innerWidth + 2).slice(0, 8)
    }));
    expect(layout.overflow, `${route} has horizontal viewport overflow: ${JSON.stringify(layout.offenders)}`).toBeLessThanOrEqual(2);
  }
  expect(errors).toEqual([]);
});

test('explorer completes onboarding and records the first Iceland discovery', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Begin your journey/i }).click();
  await page.locator('#explorer-name').fill('Aster');
  await page.locator('input[name="interest"][value="geology"]').check();
  await page.locator('#profile-form button[type="submit"]').click();
  await expect(page.locator('#profile-greeting')).toContainText('Aster');
  await page.locator('[data-expedition="iceland-fire-ice"]').click();
  await expect(page.locator('#onboarding')).toBeHidden();
  await page.locator('#tour-skip').click();
  await page.locator('#investigate').click();
  await expect(page.locator('#investigation-dialog')).toBeVisible();
  for (const card of await page.locator('#evidence-grid .evidence-card').all()) await card.click();
  await expect(page.locator('#deduction-form')).toBeVisible();
  await page.locator('input[name="deduction"][value="1"]').check();
  await page.locator('#deduction-form button[type="submit"]').click();
  await expect(page.locator('#discovery-dialog')).toBeVisible();
  await page.locator('#record').click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('atlas-journal') || '[]').length)).toBe(1);
});

test('language selection updates the document and survives navigation', async ({ page }) => {
  await page.goto('/offline.html');
  await page.locator('#offline-language').selectOption('fr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.locator('#offline-title')).toHaveText('Gardez votre place.');
  await page.goto('/daily.html');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await page.locator('#daily-language').selectOption('sv');
  await expect(page.locator('html')).toHaveAttribute('lang', 'sv');
});

test('regional atmosphere controls and journey navigation respond', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('atlas-profile', JSON.stringify({ name: 'Nova', language: 'en', interests: [] })));
  await page.goto('/region-player.html?expedition=patagonia-continents-end');
  await page.locator('#region-time-toggle').click();
  await expect(page.locator('html')).toHaveClass(/night-mode/);
  await expect(page.locator('#region-time-toggle')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.journey-footer')).toBeVisible();
  await expect(page.locator('.journey-footer a').first()).toHaveAttribute('href', /atlas\.html/);
});

test('keyboard entry exposes skip navigation and names dialogs', async ({ page }) => {
  await page.goto('/');
  const skip = page.locator('.skip-link');
  await expect(skip).toHaveText(/Skip to main content/);
  await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();
  for (const dialog of await page.locator('dialog').all()) {
    const name = await dialog.getAttribute('aria-label') || await dialog.getAttribute('aria-labelledby');
    expect(name).toBeTruthy();
  }
});
