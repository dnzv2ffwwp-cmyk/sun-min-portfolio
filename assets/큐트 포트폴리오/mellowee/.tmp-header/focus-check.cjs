const { chromium } = require('C:/Users/Administrator/AppData/Local/Programs/Microsoft VS Code/6928394f91/resources/app/node_modules/playwright-core');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await page.route('https://**/*', route => route.abort());
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    await page.screenshot({ path: path.join(__dirname, 'header-390.png') });
    await page.locator('.menu-toggle').click();
    await page.screenshot({ path: path.join(__dirname, 'menu-390.png') });
    await page.locator('[data-overlay-depth1]').nth(2).click();
    await page.screenshot({ path: path.join(__dirname, 'menu-390-depth2.png') });
    await page.locator('[data-overlay-depth2]').first().click();
    await page.screenshot({ path: path.join(__dirname, 'menu-390-depth3.png') });
    await page.locator('[data-overlay-back]').click();
    await page.locator('[data-overlay-back]').click();
    for (let i = 0; i < 21; i++) {
      console.log(i, await page.evaluate(() => ({ active: document.activeElement?.outerHTML.slice(0, 150), inside: document.querySelector('dialog').contains(document.activeElement) })));
      await page.keyboard.press('Tab');
    }
  } finally { await browser.close(); }
})();
