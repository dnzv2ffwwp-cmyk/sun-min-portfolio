const p = require('C:/Users/Administrator/AppData/Local/Programs/Microsoft VS Code/6928394f91/resources/app/node_modules/playwright-core');
(async () => {
  const browser = await p.chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  console.log(await browser.version());
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
