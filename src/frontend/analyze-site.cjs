const { chromium } = require('playwright');

async function analyzeSite() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  const warnings = [];
  
  // Capture console messages
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
    if (msg.type() === 'warning') warnings.push(msg.text());
  });
  
  page.on('pageerror', err => errors.push(err.message));
  
  const baseUrl = 'http://localhost:6173';
  const pages = [
    { name: 'home', url: '/' },
    { name: 'games', url: '/games' },
    { name: 'login', url: '/login' },
    { name: 'register', url: '/register' },
    { name: 'alphabet-game', url: '/games/alphabet-tracing' },
    { name: 'finger-number', url: '/games/finger-number-show' },
    { name: 'shape-pop', url: '/games/shape-pop' },
    { name: 'connect-dots', url: '/games/connect-the-dots' },
  ];
  
  console.log('=== PAGE LOAD ANALYSIS ===\n');
  
  for (const p of pages) {
    try {
      await page.goto(baseUrl + p.url, { waitUntil: 'networkidle', timeout: 15000 });
      console.log(`✅ ${p.name}: Loaded successfully`);
    } catch (e) {
      console.log(`❌ ${p.name}: FAILED - ${e.message.substring(0, 50)}`);
    }
  }
  
  console.log('\n=== CONSOLE ERRORS ===');
  if (errors.length === 0) {
    console.log('No critical errors found!');
  } else {
    errors.forEach(e => console.log('ERROR: ' + e.substring(0, 100)));
  }
  
  console.log('\n=== CONSOLE WARNINGS ===');
  if (warnings.length === 0) {
    console.log('No warnings!');
  } else {
    warnings.slice(0, 10).forEach(w => console.log('WARN: ' + w.substring(0, 100)));
  }
  
  await browser.close();
}

analyzeSite();
