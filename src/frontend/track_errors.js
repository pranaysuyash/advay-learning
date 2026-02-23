const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('requestfailed', request => {
        console.log(`REQ FAILED: ${request.url()} - ${request.failure().errorText}`);
    });
    page.on('response', response => {
        if (response.status() >= 400) {
            console.log(`REQ ERROR: ${response.status()} ${response.url()}`);
        }
    });
    await page.goto('http://localhost:6173/games/alphabet-tracing', { waitUntil: 'networkidle2', timeout: 10000 }).catch(e => console.log(e));
    await new Promise(r => setTimeout(r, 5000));
    await browser.close();
})();
