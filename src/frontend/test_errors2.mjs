import puppeteer from 'puppeteer';
(async () => {
    // Run puppeteer without sandbox so it works here
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    let errorCount = 0;
    
    page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
            console.log('LOG:', msg.text());
        }
    });
    
    page.on('requestfailed', request => {
        errorCount++;
    });
    
    page.on('response', response => {
        if (response.status() >= 400) {
            errorCount++;
        }
    });

    console.log("Navigating to Alphabet Game...");
    
    // Disable timeout as the page might hang, but we just want to collect errors for 5 secs
    page.goto('http://localhost:6173/games/alphabet-tracing').catch(e => console.log("Goto error:", e.message));
    
    await new Promise(r => setTimeout(r, 4000));
    console.log(`Total HTTP errors or failed requests in 4 seconds: ${errorCount}`);
    
    await browser.close().catch(() => {});
    process.exit(0);
})();
