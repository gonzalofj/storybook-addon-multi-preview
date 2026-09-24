import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto('http://localhost:6007/?path=/story/base-button--primary&viewMode=story', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const info = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('button')) {
    const cs = getComputedStyle(el);
    out.push({
      label: el.getAttribute('aria-label') || el.title || el.textContent?.slice(0, 12),
      cls: el.className,
      bg: cs.backgroundColor,
      pad: cs.padding,
    });
  }
  return out;
});
for (const b of info) console.log(JSON.stringify(b));
const btn = page.locator('button[aria-label="Compare story across viewports"]');
await btn.hover();
await page.waitForTimeout(900);
await page.screenshot({ path: '/tmp/ghost-hover.png', clip: { x: 280, y: 0, width: 640, height: 130 } });
await browser.close();
