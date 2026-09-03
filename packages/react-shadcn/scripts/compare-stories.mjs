// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
//
// Side-by-side screenshots of storybook.medplum.com (Mantine, left) and this package's Storybook (right) for
// every story ID of the given items, written to artifacts/<storyId>.png. Not a pixel diff: the look is
// supposed to change. Reviewers check that the same information and interactions are present.
//
//   npm run build-storybook && node scripts/compare-stories.mjs human-name-input [...]
//   node scripts/compare-stories.mjs --url http://localhost:6007 human-name-input   (against a running `npm run storybook`)
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';
import { items } from '../registry/items.mjs';
import { PACKAGE_ROOT } from './lib.mjs';
import { storyIdsFor } from './registry-lib.mjs';

const UPSTREAM = 'https://storybook.medplum.com';
const args = process.argv.slice(2);
const urlIndex = args.indexOf('--url');
let localBase = urlIndex >= 0 ? args[urlIndex + 1] : undefined;
const names = args.filter((a, i) => !a.startsWith('--') && (urlIndex < 0 || i !== urlIndex + 1));
const selected = items.filter((i) => names.includes(i.name));
if (!selected.length) {
  console.error('usage: node scripts/compare-stories.mjs [--url <local storybook url>] <item> [...]');
  process.exit(2);
}

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

function serveStatic(dir) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const path = join(dir, decodeURIComponent((req.url ?? '/').split('?')[0]));
      if (!existsSync(path) || statSync(path).isDirectory()) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' });
      createReadStream(path).pipe(res);
    });
    server.listen(0, () => resolve(server));
  });
}

const staticDir = join(PACKAGE_ROOT, 'storybook-static');
let server;
if (!localBase) {
  if (!existsSync(staticDir)) {
    console.error('storybook-static not found; run `npm run build-storybook` or pass --url');
    process.exit(1);
  }
  server = await serveStatic(staticDir);
  localBase = `http://localhost:${server.address().port}`;
}

const artifacts = join(PACKAGE_ROOT, 'artifacts');
mkdirSync(artifacts, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 700 }, deviceScaleFactor: 1 });

async function shoot(url) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  return (await page.screenshot({ fullPage: true })).toString('base64');
}

for (const item of selected) {
  for (const id of storyIdsFor(item.files[0])) {
    const left = await shoot(`${UPSTREAM}/iframe.html?id=${id}&viewMode=story`);
    const right = await shoot(`${localBase}/iframe.html?id=${id}&viewMode=story`);
    const html = `<html><body style="margin:0;background:#888;font:14px system-ui"><div style="display:flex;gap:8px;padding:8px"><figure style="margin:0"><figcaption style="padding:4px 0">upstream (Mantine) · ${id}</figcaption><img src="data:image/png;base64,${left}"></figure><figure style="margin:0"><figcaption style="padding:4px 0">medplum-shadcn · ${id}</figcaption><img src="data:image/png;base64,${right}"></figure></div></body></html>`;
    await page.setContent(html);
    const out = join(artifacts, `${id}.png`);
    writeFileSync(out, await page.screenshot({ fullPage: true }));
    console.log(`wrote artifacts/${id}.png`);
  }
}

await browser.close();
server?.close();
