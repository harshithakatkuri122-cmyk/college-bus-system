import puppeteer from 'puppeteer';
(async()=>{
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR', err.message));
    page.on('requestfailed', req => console.log('REQ FAILED', req.url(), req.failure()));
    await page.goto('http://localhost:5174/login', {waitUntil:'networkidle2'});
    console.log('login loaded');
    await browser.close();
  } catch(e) {
    console.error('puppeteer error', e);
  }
})();