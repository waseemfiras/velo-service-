const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', {waitUntil: 'domcontentloaded', timeout: 5000});
  await new Promise(r => setTimeout(r, 4000)); // wait 4 seconds for app to initialize
  const html = await page.evaluate(() => document.body.innerHTML);
  fs.writeFileSync('dom.html', html);
  await browser.close();
  console.log('DOM saved');
})();
