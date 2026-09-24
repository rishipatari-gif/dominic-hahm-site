// Screenshot a localhost URL into ./temporary screenshots/
//
//   node screenshot.mjs http://localhost:3000
//   node screenshot.mjs http://localhost:3000 hero-fix
//   node screenshot.mjs http://localhost:3000 hero-fix --mobile
//   node screenshot.mjs http://localhost:3000 wide --width=1920 --height=1080
//   node screenshot.mjs http://localhost:3000 above-fold --no-full-page
//
// Files land at ./temporary screenshots/screenshot-N.png (or -N-label.png),
// auto-incremented, never overwritten.

import { mkdir, readdir, access } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const OUT_DIR = join(ROOT, 'temporary screenshots');

// Puppeteer pins one Chrome build, but the cache can hold several — and a
// partially-extracted one launches and then dies on a missing framework.
// Prefer the newest install whose framework binary is actually on disk.
async function resolveChrome() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;

  const cache = join(homedir(), '.cache', 'puppeteer', 'chrome');
  const entries = await readdir(cache).catch(() => []);
  const builds = entries
    .map((name) => /^mac_arm-(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(name))
    .filter(Boolean)
    .map((m) => ({ dir: m[0], version: m[0].slice('mac_arm-'.length), parts: m.slice(1, 5).map(Number) }))
    .sort((a, b) => {
      for (let i = 0; i < 4; i++) if (a.parts[i] !== b.parts[i]) return b.parts[i] - a.parts[i];
      return 0;
    });

  for (const b of builds) {
    const app = join(cache, b.dir, 'chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents');
    const exe = join(app, 'MacOS', 'Google Chrome for Testing');
    const framework = join(app, 'Frameworks', 'Google Chrome for Testing Framework.framework',
      'Versions', b.version, 'Google Chrome for Testing Framework');
    try {
      await access(exe);
      await access(framework); // the bit a truncated extract is missing
      return exe;
    } catch { /* incomplete install — try the next one */ }
  }
  return undefined; // let puppeteer use its own default
}

const argv = process.argv.slice(2);
const flags = argv.filter((a) => a.startsWith('--'));
const positional = argv.filter((a) => !a.startsWith('--'));

const url = positional[0];
const label = positional[1];

if (!url) {
  console.error('Usage: node screenshot.mjs <url> [label] [--mobile] [--width=N] [--height=N] [--no-full-page]');
  process.exit(1);
}

if (url.startsWith('file://')) {
  console.error('Refusing to screenshot a file:// URL. Start the server (node serve.mjs) and use http://localhost:3000');
  process.exit(1);
}

const flagValue = (name, fallback) => {
  const hit = flags.find((f) => f.startsWith(`--${name}=`));
  return hit ? Number(hit.split('=')[1]) : fallback;
};

const isMobile = flags.includes('--mobile');
const fullPage = !flags.includes('--no-full-page');
const width = flagValue('width', isMobile ? 390 : 1440);
const height = flagValue('height', isMobile ? 844 : 900);

await mkdir(OUT_DIR, { recursive: true });

// Next index: one past the highest screenshot-N already on disk.
const existing = await readdir(OUT_DIR).catch(() => []);
const highest = existing.reduce((max, name) => {
  const m = /^screenshot-(\d+)(?:-.*)?\.png$/.exec(name);
  return m ? Math.max(max, Number(m[1])) : max;
}, 0);
const index = highest + 1;

const safeLabel = label ? label.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') : '';
const filename = safeLabel ? `screenshot-${index}-${safeLabel}.png` : `screenshot-${index}.png`;
const outPath = join(OUT_DIR, filename);

const executablePath = await resolveChrome();

const browser = await puppeteer.launch({
  headless: true,
  executablePath,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-color-profile=srgb'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({
    width,
    height,
    deviceScaleFactor: 2,
    isMobile,
    hasTouch: isMobile,
  });

  const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 30_000 });
  if (response && !response.ok()) {
    console.error(`Warning: ${url} responded ${response.status()} ${response.statusText()}`);
  }

  // Walk the page so loading="lazy" images actually decode — otherwise a full-page
  // capture shows empty boxes below the fold and looks like a broken layout.
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const step = Math.max(200, window.innerHeight);

    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await sleep(60);
    }

    // Wait at the bottom, where every lazy image has been triggered. Race a
    // deadline: an image that never fires load/error must not hang the run.
    await Promise.race([
      Promise.all(
        [...document.images]
          .filter((i) => !i.complete)
          .map((i) => new Promise((r) => { i.onload = i.onerror = r; })),
      ),
      sleep(3000),
    ]);

    window.scrollTo(0, 0);
    await sleep(120);
  });

  // Let webfonts settle so text metrics are real, then give CSS transitions a beat.
  await page.evaluate(() => document.fonts?.ready);
  await new Promise((r) => setTimeout(r, 400));

  await page.screenshot({ path: outPath, fullPage, type: 'png' });

  console.log(`Saved: temporary screenshots/${filename}`);
  console.log(`  ${width}x${height} @2x${isMobile ? ' (mobile)' : ''}${fullPage ? ', full page' : ''}`);
} catch (err) {
  if (err.message?.includes('ERR_CONNECTION_REFUSED')) {
    console.error(`Connection refused at ${url} — is the server running? Start it with: node serve.mjs`);
    process.exit(1);
  }
  throw err;
} finally {
  await browser.close();
}
