import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright-core';

const webRoot = path.resolve(process.argv[2] || 'game');
const output = path.resolve('artifacts/performance/report.json');
const browserPath = [
  process.env.BROWSER_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].filter(Boolean).find((candidate) => fs.existsSync(candidate));
if (!browserPath) throw new Error('Chrome or Edge was not found.');

const mime = new Map([['.html', 'text/html'], ['.js', 'text/javascript'], ['.css', 'text/css'], ['.webp', 'image/webp'], ['.woff2', 'font/woff2']]);
const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    const relative = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const filename = path.resolve(webRoot, `.${relative}`);
    if (!filename.startsWith(`${webRoot}${path.sep}`)) throw new Error('outside game root');
    const stat = await fs.promises.stat(filename);
    response.writeHead(200, { 'Content-Type': mime.get(path.extname(filename)) ?? 'application/octet-stream', 'Content-Length': stat.size });
    fs.createReadStream(filename).pipe(response);
  } catch { response.writeHead(404).end('Not found'); }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

const errors = [];
let browser;
try {
  browser = await chromium.launch({ executablePath: browserPath, headless: true, args: ['--enable-webgl', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  const startedAt = performance.now();
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__READY__ === true);
  const readyMilliseconds = performance.now() - startedAt;
  await page.locator('#startb').click();
  await page.waitForFunction(() => window.__GAME__?.started === true);
  const frame = await page.evaluate(async () => {
    const intervals = [];
    let previous = performance.now();
    const end = previous + 5000;
    await new Promise((resolve) => requestAnimationFrame(function sample(now) {
      intervals.push(now - previous); previous = now;
      if (now >= end) resolve(); else requestAnimationFrame(sample);
    }));
    intervals.sort((a, b) => a - b);
    return { frames: intervals.length, averageMs: intervals.reduce((sum, value) => sum + value, 0) / intervals.length, p95Ms: intervals[Math.floor(intervals.length * 0.95)], state: window.__GAME__ };
  });
  const report = { readyMilliseconds, frame, errors };
  await fs.promises.mkdir(path.dirname(output), { recursive: true });
  await fs.promises.writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (errors.length) process.exitCode = 1;
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
