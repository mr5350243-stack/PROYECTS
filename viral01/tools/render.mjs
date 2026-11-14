// Render del prueba viral (SVG) fotograma a fotograma (Chromium headless) → MP4.
// Uso: SCALE=0.5 OUT=viral01/output/preview.mp4 node gorila/tools/render.mjs   |   STILLS="0.5,2.8" para fotos sueltas
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { startServer } from '../../tools/serve.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');

const SCALE = Number(process.env.SCALE || 0.5), FPS = 30;
const OUT = process.env.OUT || 'viral01/output/preview.mp4';
const server = await startServer(0);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: SCALE });
page.on('pageerror', e => console.log('pageerror', e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/viral01/index.html`);
await page.waitForFunction(() => window.ready === true);

if (process.env.STILLS) {
  const dir = process.env.STILL_DIR || 'viral01/output/stills'; fs.mkdirSync(dir, { recursive: true });
  for (const s of process.env.STILLS.split(',')) {
    await page.evaluate(t => window.renderFrame(t), Number(s));
    await page.screenshot({ path: path.join(dir, `t_${Number(s).toFixed(2)}.png`) });
  }
} else {
  const FROM = Number(process.env.FROM || 0), TO = Number(process.env.TO || await page.evaluate(() => window.DURATION));
  const F0 = Math.round(FROM * FPS), N = Math.round(TO * FPS);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    ...(process.env.AUDIO ? ['-ss', String(FROM), '-t', String(TO - FROM), '-i', process.env.AUDIO, '-c:a', 'aac', '-b:a', '192k', '-shortest'] : []),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', process.env.CRF || '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = F0; f < N; f++) {
    await page.evaluate(t => window.renderFrame(t), f / FPS);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 60 === 0) console.log(`${f}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log('listo', OUT, ((Date.now() - t0) / 1000).toFixed(0), 's');
}
await browser.close(); server.close();
