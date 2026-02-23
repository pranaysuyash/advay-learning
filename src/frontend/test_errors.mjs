import puppeteer from 'puppeteer';
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let errorCount = 0;
    
    page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
            console.log('LOG:', msg.text());
        }
    });
    
    page.on('requestfailed', request => {
        console.log(`REQ FAILED: ${request.url()} - ${request.failure()?.errorText}`);
        errorCount++;
    });
    
    page.on('response', response => {
        if (response.status() >= 400) {
            console.log(`REQ ERROR: ${response.status()} ${response.url()}`);
            errorCount++;
        }
    });

    console.log("Navigating to Alphabet Game...");
    
    // Disable timeout as the page might hang, but we just want to collect errors for 5 secs
    page.goto('http://localhost:6173/games/alphabet-tracing').catch(e => console.log("Goto error:", e.message));
    
    await new Promise(r => setTimeout(r, 4000));
    console.log(`Total errors captured: ${errorCount}`);
    
    await browser.close().catch(() => {});
    process.exit(0);
})();
