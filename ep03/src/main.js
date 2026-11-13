// Episodio 03 — mismo motor que el episodio 01 (componentes compartidos en /ep01/src).
import { el, set, C } from '/ep01/src/lib.js';
import { makeCaptionSystem } from '/ep01/src/captions.js';
import { SCENES, DURATION } from './timeline.js';
import { CAPTIONS } from './captions_data.js';
import { FX, SOBER } from './fx_data.js';
import { CORAL, CAP_Y } from './style.js';

const world = document.getElementById('world');
const scenes = [];
for (const S of SCENES) {
  const mod = await import(`./scenes/${S.id}.js`);
  const layer = el('g', { id: S.id, visibility: 'hidden' }, world);
  scenes.push({ ...S, layer, inst: mod.create(layer) });
}
[...scenes].sort((a, b) => (a.z ?? 0) - (b.z ?? 0)).forEach(s => world.appendChild(s.layer));
// subtítulos: franja inferior fija (70–83 % de la altura), cada línea entra al pronunciarse,
// modo sobrio en los tramos científicos y jurídicos (SOBER)
const sober = (t) => SOBER.some(([a, b]) => t >= a && t < b) ? 1 : 0;
const caps = makeCaptionSystem(document.getElementById('caps'), CAPTIONS, FX, { edge: [CORAL, C.orange, C.yellow], lineTiming: true, sober });

function renderFrame(t) {
  const ctx = { anchors: {}, capY: CAP_Y };
  for (const s of scenes) {
    const on = t >= s.start && t < s.end;
    set(s.layer, { visibility: on ? 'visible' : 'hidden' });
    if (on) s.inst.render(t, ctx);
  }
  caps.render(t, ctx);
}
window.renderFrame = renderFrame;
window.DURATION = DURATION;
await document.fonts.load('900 40px M'); await document.fonts.load('800 40px M');
renderFrame(Number(new URLSearchParams(location.search).get('t') || 0));
window.ready = true;
