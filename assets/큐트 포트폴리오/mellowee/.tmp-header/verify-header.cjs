const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const playwright = require('C:/Users/Administrator/AppData/Local/Programs/Microsoft VS Code/6928394f91/resources/app/node_modules/playwright-core');

const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  const filepath = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
  if (!filepath.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
  fs.readFile(filepath, (error, data) => {
    response.writeHead(error ? 404 : 200, { 'Content-Type': types[path.extname(filepath)] || 'application/octet-stream' });
    response.end(error ? 'Not found' : data);
  });
});
const results = [];
const report = (label, detail = {}) => { const row = { label, ...detail }; results.push(row); console.log(JSON.stringify(row)); };

async function dimensions(page) {
  return page.evaluate(() => ({
    width: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    headerWidth: document.querySelector('.site-header').scrollWidth,
    headerRect: document.querySelector('.site-header').getBoundingClientRect().width,
    focus: document.activeElement?.className,
  }));
}

async function mobileChecks(browser, origin, file, width, full, height = 844) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  await page.goto(origin + '/' + file, { waitUntil: 'load' });
  const toggle = page.locator('.menu-toggle');
  const overlay = page.locator('dialog#mobile-menu');
  assert.equal(await toggle.count(), 1, 'one mobile toggle');
  assert.equal(await toggle.isVisible(), true, 'toggle visible');
  assert.equal(await overlay.evaluate(element => element.open), false, 'dialog initially closed');
  assert.equal(await page.locator('.main-nav').isVisible(), false, 'desktop nav hidden');
  const before = await dimensions(page);
  assert.ok(before.headerWidth <= width + 1, 'header must not overflow viewport: ' + JSON.stringify(before));
  await toggle.click();
  assert.equal(await overlay.evaluate(element => element.open), true, 'dialog opens');
  assert.equal(await toggle.getAttribute('aria-expanded'), 'true', 'toggle expanded');
  assert.equal(await overlay.locator('[data-overlay-depth1]').count(), 9, 'nine primary menus');
  assert.equal(await overlay.evaluate(element => element.contains(document.activeElement)), true, 'focus enters dialog');
  const rect = await overlay.boundingBox();
  assert.ok(rect.x >= -1 && rect.x + rect.width <= width + 1, 'dialog fits viewport');
  assert.ok(rect.height <= height + 1, 'dialog fits viewport height');
  const dialogDimensions = await overlay.evaluate(element => ({ width: element.clientWidth, scrollWidth: element.scrollWidth, contentWidth: element.querySelector('[data-overlay-content]').clientWidth, contentScrollWidth: element.querySelector('[data-overlay-content]').scrollWidth }));
  assert.ok(dialogDimensions.scrollWidth <= dialogDimensions.width + 1, 'dialog has no horizontal overflow');
  assert.ok(dialogDimensions.contentScrollWidth <= dialogDimensions.contentWidth + 1, 'dialog content has no horizontal overflow');
  if (full) {
    for (let index = 0; index < 9; index++) {
      await overlay.locator('[data-overlay-depth1]').nth(index).click();
      assert.ok(await overlay.locator('[data-overlay-depth2]').count() > 0, 'second level ' + index);
      await overlay.locator('[data-overlay-depth2]').first().click();
      assert.ok(await overlay.locator('.overlay-depth3 a').count() > 0, 'third level ' + index);
      await overlay.locator('[data-overlay-back]').click();
      assert.ok(await overlay.locator('[data-overlay-depth2]').count() > 0, 'back to second');
      await overlay.locator('[data-overlay-back]').click();
      assert.equal(await overlay.locator('[data-overlay-depth1]').count(), 9, 'back to root');
    }
    for (let index = 0; index < 18; index++) {
      await page.keyboard.press('Tab');
      assert.equal(await overlay.evaluate(element => element.contains(document.activeElement)), true, 'Tab stays in dialog');
    }
    await page.keyboard.press('Shift+Tab');
    assert.equal(await overlay.evaluate(element => element.contains(document.activeElement)), true, 'Shift Tab stays in dialog');
  }
  if (file === 'index.html' && [390, 768].includes(width)) await page.screenshot({ path: path.join(__dirname, `menu-${width}.png`) });
  await page.keyboard.press('Escape');
  assert.equal(await overlay.evaluate(element => element.open), false, 'Escape closes dialog');
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false', 'toggle collapsed');
  assert.equal(await toggle.evaluate(element => document.activeElement === element), true, 'focus returns to toggle');
  assert.equal(await page.locator('body').evaluate(element => element.classList.contains('header-overlay-open')), false, 'scroll lock removed');
  if (full) {
    await toggle.click();
    await overlay.locator('[data-overlay-close]').click();
    assert.equal(await overlay.evaluate(element => element.open), false, 'close button closes dialog');
    await toggle.click();
    const bounds = await overlay.boundingBox();
    if (bounds.x + bounds.width < width - 2) {
      await page.mouse.click(width - 2, 350);
      assert.equal(await overlay.evaluate(element => element.open), false, 'backdrop closes dialog');
    } else {
      await page.keyboard.press('Escape');
    }
    await page.evaluate(() => scrollTo({ top: 300, behavior: 'instant' }));
    await page.waitForTimeout(60);
    const scrollY = await page.evaluate(() => window.scrollY);
    await toggle.evaluate(element => element.click());
    await page.keyboard.press('Escape');
    await page.waitForTimeout(60);
    assert.ok(Math.abs((await page.evaluate(() => window.scrollY)) - scrollY) <= 1, 'scroll position restored');
    await toggle.evaluate(element => element.click());
    await page.setViewportSize({ width: 1440, height: 844 });
    assert.equal(await overlay.evaluate(element => element.open), false, 'desktop resize closes dialog');
    assert.equal(await page.locator('body').evaluate(element => element.classList.contains('header-overlay-open')), false, 'desktop resize unlocks scroll');
  }
  report('mobile pass', { file, width, height, dimensions: before, dialogDimensions, errors });
  await page.close();
}

async function desktopChecks(browser, origin, file, width) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  await page.goto(origin + '/' + file, { waitUntil: 'load' });
  assert.equal(await page.locator('.menu-toggle').isVisible(), false, 'toggle hidden desktop');
  assert.equal(await page.locator('.main-nav').isVisible(), true, 'desktop navigation visible');
  const mega = page.locator('.mega-menu');
  assert.equal(await mega.evaluate(element => element.hidden), true, 'mega initially hidden');
  const before = await dimensions(page);
  assert.ok(before.headerWidth <= width + 1, 'desktop header must not overflow viewport: ' + JSON.stringify(before));
  const links = page.locator('.main-nav > ul > li > a');
  for (let index = 0; index < await links.count(); index++) {
    await links.nth(index).hover();
    assert.equal(await mega.evaluate(element => element.hidden), false, 'mega opens on hover');
    assert.ok(await mega.locator('.mega-menu__depth2-title').count() > 0, 'mega second level');
    assert.ok(await mega.locator('.mega-menu__depth3 a').count() > 0, 'mega third level');
  }
  await page.keyboard.press('Escape');
  assert.equal(await mega.evaluate(element => element.hidden), true, 'Escape closes mega');
  await links.first().focus();
  assert.equal(await mega.evaluate(element => element.hidden), false, 'keyboard focus opens mega');
  if (file === 'index.html' && width === 1440) await page.screenshot({ path: path.join(__dirname, 'desktop-1440.png') });
  report('desktop pass', { file, width, dimensions: before, errors });
  await page.close();
}

async function linkChecks(browser, origin) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await page.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  await page.goto(origin + '/index.html', { waitUntil: 'load' });
  await page.locator('.menu-toggle').click();
  await page.locator('[data-overlay-depth1]').nth(3).click();
  await page.locator('[data-overlay-depth2]').first().click();
  await page.locator('.overlay-depth3 a').first().click();
  await page.waitForURL('**/product-list.html?category=baby');
  assert.equal(await page.locator('#mobile-menu').evaluate(element => element.open), false, 'destination menu initially closed');
  await page.goto(origin + '/index.html', { waitUntil: 'load' });
  await page.locator('.menu-toggle').click();
  await page.locator('[data-overlay-depth1]').nth(8).click();
  await page.locator('[data-overlay-depth2]').first().click();
  await page.locator('.overlay-depth3 a').first().click();
  assert.equal(new URL(page.url()).hash, '#instagram', 'event retains existing anchor');
  assert.equal(await page.locator('#mobile-menu').evaluate(element => element.open), false, 'event navigation closes dialog');
  assert.equal(await page.locator('body').evaluate(element => getComputedStyle(element).position), 'static', 'event navigation unlocks body');
  report('links pass', { destination: 'product-list.html?category=baby', eventHash: '#instagram' });
  await page.close();
}

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await playwright.chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const checks = [];
    for (const file of ['index.html', 'product-list.html']) {
      for (const width of [320, 390, 768, 1024]) {
        checks.push(async () => {
          try { await mobileChecks(browser, origin, file, width, true); }
          catch (error) { report('FAIL mobile', { file, width, error: error.message, stack: error.stack }); }
        });
      }
      for (const width of [1025, 1440]) {
        checks.push(async () => {
          try { await desktopChecks(browser, origin, file, width); }
          catch (error) { report('FAIL desktop', { file, width, error: error.message, stack: error.stack }); }
        });
      }
    }
    for (let index = 0; index < checks.length; index += 4) await Promise.all(checks.slice(index, index + 4).map(check => check()));
    try { await mobileChecks(browser, origin, 'index.html', 667, true, 375); }
    catch (error) { report('FAIL landscape', { error: error.message, stack: error.stack }); }
    try { await linkChecks(browser, origin); }
    catch (error) { report('FAIL link navigation', { error: error.message, stack: error.stack }); }
    for (const file of ['brand-story.html', 'product-detail.html', 'login.html', 'recently-viewed.html']) {
      try { await mobileChecks(browser, origin, file, 390, false); }
      catch (error) { report('FAIL page smoke', { file, error: error.message, stack: error.stack }); }
    }
  } finally {
    await browser.close();
    server.close();
    fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify(results, null, 2));
    if (results.some(row => row.label.startsWith('FAIL'))) process.exitCode = 1;
  }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
