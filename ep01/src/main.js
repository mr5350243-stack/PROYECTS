// Motor de la animación: construye las escenas y dibuja el fotograma t (determinista) → window.renderFrame(t)
import { el, set } from './lib.js';
import { SCENES, DURATION } from './timeline.js';
import { CAPTIONS } from './captions_data.js';
import { FX } from './fx_data.js';
import { makeCaptionSystem } from './captions.js';

const svg = document.getElementById('svg');
const world = document.getElementById('world');
const scenes = [];
for (const S of SCENES) {
  const mod = await import(`./scenes/${S.id}.js`);
  const layer = el('g', { id: S.id, visibility: 'hidden' }, world);
  scenes.push({ ...S, layer, inst: mod.create(layer) });
}
// orden de capas: por defecto el de la línea de tiempo; una escena puede pedir quedar encima (z)
[...scenes].sort((a, b) => (a.z ?? 0) - (b.z ?? 0)).forEach(s => world.appendChild(s.layer));
const caps = makeCaptionSystem(document.getElementById('caps'), CAPTIONS, FX);

function renderFrame(t) {
  const ctx = { anchors: {}, capY: 1440 };
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
const q = new URLSearchParams(location.search);
renderFrame(Number(q.get('t') || 0));
window.ready = true;
