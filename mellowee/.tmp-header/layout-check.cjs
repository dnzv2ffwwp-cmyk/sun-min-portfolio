const assert = require('node:assert/strict');
const { chromium } = require('C:/Users/Administrator/AppData/Local/Programs/Microsoft VS Code/6928394f91/resources/app/node_modules/playwright-core');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const fs = require('node:fs');
const results = [];
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    await page.route('https://**/*', route => route.abort());
    for (const file of ['index.html', 'product-list.html']) {
      for (const [width, height] of [[320, 844], [390, 844], [768, 844], [1024, 844], [667, 375]]) {
        await page.setViewportSize({ width, height });
        await page.goto(pathToFileURL(path.resolve(__dirname, '..', file)).href);
        const toggle = page.locator('.menu-toggle');
        const toggleRect = await toggle.boundingBox();
        assert.ok(toggleRect.width >= 44 && toggleRect.height >= 44, '44px toggle');
        const header = await page.locator('.site-header').boundingBox();
        assert.ok(header.width <= width, 'header fits viewport');
        await toggle.click();
        const dialog = page.locator('#mobile-menu');
        const closeRect = await page.locator('[data-overlay-close]').boundingBox();
        assert.ok(closeRect.width >= 44 && closeRect.height >= 44, '44px close');
        const checkContent = async () => {
          const data = await dialog.evaluate(element => {
            const content = element.querySelector('[data-overlay-content]');
            return { width: element.clientWidth, scrollWidth: element.scrollWidth, height: element.clientHeight,
              contentWidth: content.clientWidth, contentScrollWidth: content.scrollWidth,
              contentHeight: content.clientHeight, contentScrollHeight: content.scrollHeight,
              documentWidth: document.documentElement.scrollWidth };
          });
          assert.ok(data.documentWidth <= width, 'document fits viewport');
          assert.ok(data.scrollWidth <= data.width, 'dialog has no horizontal overflow');
          assert.ok(data.contentScrollWidth <= data.contentWidth, 'content has no horizontal overflow');
          assert.ok(data.height <= height && data.contentHeight > 0, 'dialog fits height with scrollable content');
          return data;
        };
        const rootLayout = await checkContent();
        assert.ok(await page.locator('[data-overlay-depth1]').first().evaluate(element => parseFloat(getComputedStyle(element).fontSize)) >= 14, 'readable 14px root label');
        if (file === 'index.html' && width === 390) await page.screenshot({ path: path.join(__dirname, 'menu-390-final.png') });
        if (file === 'index.html' && height === 375) await page.screenshot({ path: path.join(__dirname, 'menu-landscape-final.png') });
        await page.locator('[data-overlay-depth1]').nth(2).click();
        const backRect = await page.locator('[data-overlay-back]').boundingBox();
        assert.ok(backRect.width >= 44 && backRect.height >= 44, '44px back');
        await checkContent();
        await page.locator('[data-overlay-depth2]').first().click();
        await checkContent();
        if (file === 'index.html' && width === 390) await page.screenshot({ path: path.join(__dirname, 'menu-390-depth3-final.png') });
        await page.locator('[data-overlay-close]').click();
        const row = { file, width, height, toggle: toggleRect.width, close: closeRect.width, back: backRect.width, rootLayout };
        results.push(row);
        console.log(JSON.stringify(row));
      }
    }
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(__dirname, 'layout-results.json'), JSON.stringify(results, null, 2));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
