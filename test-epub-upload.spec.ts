import { test, expect } from '@playwright/test';
import path from 'path';

test('EPUB upload page count test', async ({ page }) => {
  // Navigate to admin panel
  await page.goto('http://localhost:4175/admin');

  // Set up console logging
  const logs: string[] = [];
  page.on('console', msg => {
    logs.push(msg.text());
    console.log('[Browser Console]', msg.text());
  });

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Check if login is required
  const loginButton = page.getByText('Login');
  if (await loginButton.isVisible()) {
    console.log('Login required - skipping test (would need credentials)');
    await page.screenshot({ path: 'epub-upload-login.png', fullPage: true });
    return;
  }

  // Take initial screenshot to see what's on the page
  await page.screenshot({ path: 'epub-upload-initial.png', fullPage: true });

  // Look for any button with "EPUB" in the text
  const allButtons = await page.locator('button').all();
  console.log('Found buttons:', allButtons.length);

  for (const button of allButtons) {
    const text = await button.textContent();
    console.log('Button text:', text);
    if (text?.includes('EPUB')) {
      await button.click();
      break;
    }
  }

  // Wait a moment for UI to update
  await page.waitForTimeout(2000);

  // Look for file input
  const fileInput = page.locator('input[type="file"]');
  const fileInputVisible = await fileInput.isVisible().catch(() => false);
  console.log('File input visible:', fileInputVisible);

  if (fileInputVisible) {
    await fileInput.setInputFiles('C:/Users/65966/Downloads/comic/12-Oct/KhinKhinHtoo/ခမည်းကြိုး.epub');

    // Wait for the preview to load
    await page.waitForTimeout(15000);

    // Check for EPUB logs
    const epubLogs = logs.filter(log => log.includes('[EPUB]'));
    console.log('\n=== EPUB Logs ===');
    epubLogs.forEach(log => console.log(log));

    // Check the page count display
    const pageCountText = await page.locator('.admin-book-upload-summary').textContent();
    console.log('\n=== Page Count Display ===');
    console.log(pageCountText);
  }

  // Get all console logs
  console.log('\n=== All Console Logs ===');
  logs.forEach(log => console.log(log));

  // Take a screenshot
  await page.screenshot({ path: 'epub-upload-result.png', fullPage: true });
});
