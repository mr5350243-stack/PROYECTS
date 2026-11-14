// Prueba de atención interactiva — vídeo sin locución (texto, música y efectos).
import { el, set } from '/ep01/src/lib.js';
import { create } from './test.js';
const world = document.getElementById('world');
const layer = el('g', {}, world);
const inst = create(layer);
function renderFrame(t) { const ctx = { anchors: {} }; inst.render(t, ctx); window.ANSWER = ctx.answer; }
window.renderFrame = renderFrame;
window.DURATION = 40.0;
await document.fonts.load('900 40px M'); await document.fonts.load('800 40px M');
renderFrame(Number(new URLSearchParams(location.search).get('t') || 0));
window.ready = true;
