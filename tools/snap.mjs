// Renderiza fotogramas sueltos para revisión: node tools/snap.mjs out_dir scale t1 t2 ...
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'node:fs';
import { startServer } from './serve.mjs';
const [out, scale, ...times] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const server = await startServer(0);
const port = server.address().port;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1080 * scale | 0, height: 1920 * scale | 0 } });
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text().slice(0, 300)); });
page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.goto(`http://127.0.0.1:${port}/?scale=${scale}${process.env.MSAA ? '&msaa=' + process.env.MSAA : ''}${process.env.EXTRA || ''}${process.env.SCENE ? '&scene=' + process.env.SCENE : ''}`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
for (const t of times) {
  const t0 = Date.now();
  await page.evaluate(async t => { await window.renderFrame(t); }, Number(t));
  const t1 = Date.now();
  const data = await page.evaluate(() => window.grab(0.92));
  fs.writeFileSync(`${out}/f_${Number(t).toFixed(2).padStart(7, '0')}.jpg`, Buffer.from(data.split(',')[1], 'base64'));
  console.log(`t=${t} render ${t1 - t0}ms grab ${Date.now() - t1}ms`);
}
await browser.close(); server.close();
// hoja de contactos
import { execFileSync } from 'node:child_process';
const files = times.map(t => `${out}/f_${Number(t).toFixed(2).padStart(7, '0')}.jpg`);
if (files.length > 1) {
  const cols = Math.min(files.length, 4);
  const args = files.flatMap(f => ['-i', f]);
  const rows = Math.ceil(files.length / cols);
  const layout = files.map((_, i) => `${(i % cols) ? (Array.from({length: i % cols}, (_, j) => 'w' + 0).join('+')) : '0'}_${Math.floor(i / cols) ? Array.from({length: Math.floor(i / cols)}, () => 'h0').join('+') : '0'}`).join('|');
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args, '-filter_complex', `xstack=inputs=${files.length}:layout=${layout}:fill=black`, `${out}/sheet.jpg`]);
}
