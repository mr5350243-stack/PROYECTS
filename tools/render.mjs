// Render determinista fotograma a fotograma en Chromium headless (WebGL), en paralelo por tramos.
// Uso: node tools/render.mjs [workers=3] [fps=30] [desde_s] [hasta_s]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { startServer } from './serve.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');

const WORKERS = Number(process.argv[2] || 3), FPS = Number(process.argv[3] || 30);
const OUT = path.resolve('render');
fs.mkdirSync(OUT, { recursive: true });
const server = await startServer(0);
const url = `http://127.0.0.1:${server.address().port}/?scale=1`;

const probe = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const pp = await probe.newPage({ viewport: { width: 1080, height: 1920 } });
await pp.goto(url); await pp.waitForFunction(() => window.ready === true);
const DURATION = await pp.evaluate(() => window.DURATION);
await probe.close();
const from = Number(process.argv[4] || 0), to = Number(process.argv[5] || DURATION);
const F0 = Math.round(from * FPS), F1 = Math.round(to * FPS);
const total = F1 - F0, CH = 240;
const queue = []; for (let a = F0; a < F1; a += CH) queue.push([a, Math.min(F1, a + CH)]);
console.log(`Duración ${DURATION}s → fotogramas ${F0}..${F1} (${total}) en ${queue.length} tramos, ${WORKERS} procesos`);

async function worker(w) {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.log(`[w${w}] pageerror`, e.message));
  await page.goto(url); await page.waitForFunction(() => window.ready === true);
  while (queue.length) { const [a, b] = queue.shift(); await chunk(w, page, a, b); }
  await browser.close();
}
async function chunk(w, page, a, b) {
  const file = path.join(OUT, `chunk_${String(a).padStart(5, '0')}.mp4`);
  const done = file + '.done';
  if (fs.existsSync(done)) { console.log(`[w${w}] ya existe ${file}`); return; }
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', String(FPS), file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = a; f < b; f++) {
    const data = await page.evaluate(async t => { await window.renderFrame(t); return window.grab(0.94); }, f / FPS);
    const buf = Buffer.from(data.split(',')[1], 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - a) % 30 === 0) { const el = (Date.now() - t0) / 1000, n = f - a + 1; console.log(`[w${w}] ${n}/${b - a}  ${(el / n).toFixed(2)} s/fot  ETA ${((b - a - n) * el / n / 60).toFixed(1)} min`); }
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  fs.writeFileSync(done, 'ok');
  console.log(`[w${w}] listo ${file}`);
}
await Promise.all(Array.from({ length: WORKERS }, (_, w) => worker(w)));
server.close();
// lista para concatenar
const chunks = fs.readdirSync(OUT).filter(f => /^chunk_\d+\.mp4$/.test(f)).sort();
fs.writeFileSync(path.join(OUT, 'list.txt'), chunks.map(c => `file '${c}'`).join('\n') + '\n');
console.log('Tramos:', chunks.join(', '));
