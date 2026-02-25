import puppeteer from 'puppeteer';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Navigate to homepage and login
  await page.goto('http://localhost:6173', { waitUntil: 'networkidle2' });
  await sleep(1000);
  
  // Click "Log In" button
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a'));
    const loginBtn = buttons.find(b => b.textContent?.includes('Log In'));
    if (loginBtn) loginBtn.click();
  });
  await sleep(2000);
  
  // Fill in login credentials
  await page.type('input[type="email"], input[name="email"], input[name="username"]', 'pranay.suyash@gmail.com');
  await page.type('input[type="password"]', 'pranaysuyash');
  await sleep(500);
  
  // Submit login form
  await page.keyboard.press('Enter');
  await sleep(3000);
  
  // Right-click on Advay's profile to open edit modal
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const advayBtn = buttons.find(b => b.textContent?.includes('Advay'));
    if (advayBtn) {
      const event = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      advayBtn.dispatchEvent(event);
    }
  });
  await sleep(1000);
  
  // Take screenshot of context menu
  await page.screenshot({ path: 'screenshots/profile-context-menu.png', fullPage: true });
  console.log('Context menu screenshot saved');
  
  // Click "Edit" option
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const editBtn = buttons.find(b => b.textContent?.includes('Edit'));
    if (editBtn) editBtn.click();
  });
  await sleep(2000);
  
  // Take screenshot of Edit Profile modal
  await page.screenshot({ path: 'screenshots/edit-profile-modal.png', fullPage: true });
  console.log('Edit profile modal screenshot saved');

  // Click "Change Avatar" button
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const changeAvatarBtn = buttons.find(b => b.textContent?.includes('Change Avatar'));
    if (changeAvatarBtn) changeAvatarBtn.click();
  });
  await sleep(2000);
  
  // Take screenshot of Avatar Picker
  await page.screenshot({ path: 'screenshots/avatar-picker.png', fullPage: true });
  console.log('Avatar picker screenshot saved');

  await browser.close();
})();
