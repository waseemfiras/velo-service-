const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR STACK:', error.stack));
  await page.goto('http://localhost:3000', {waitUntil: 'networkidle0', timeout: 8000}).catch(e => console.log('Goto Error', e.message));
  await browser.close();
})();
