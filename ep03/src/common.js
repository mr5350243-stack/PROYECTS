// Piezas del episodio 03: habitación nocturna en capas, burbujas de chat, la protagonista con su teléfono, mini-perfil.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { makePerson } from '/ep01/src/characters.js';
import { icon } from '/ep01/src/icons.js';
import { CORAL } from './style.js';

// habitación: capas (pared/ventana · cama · primer plano) para paralaje
export function makeRoom(parent) {
  const back = el('g', {}, parent), mid = el('g', {}, parent);
  el('rect', { x: -800, y: -600, width: 2700, height: 2000, fill: '#16285e' }, back);
  for (let i = 0; i < 22; i++) el('rect', { x: -800 + i * 130, y: -600, width: 65, height: 2000, fill: '#1a2e68', opacity: 0.55 }, back);
  const win = el('g', { transform: 'translate(700,330)' }, back);
  const sky = el('rect', { x: 0, y: 0, width: 330, height: 420, rx: 10, fill: '#2a3f8a' }, win);
  for (let i = 0; i < 7; i++) el('rect', { x: 20 + i * 44, y: 420 - 80 - (i * 37) % 120, width: 34, height: 80 + (i * 37) % 120, fill: '#0e1b44' }, win);
  for (let i = 0; i < 14; i++) el('rect', { x: 28 + (i * 53) % 290, y: 300 + (i * 29) % 100, width: 8, height: 10, fill: C.yellow, opacity: 0.8 }, win);
  el('circle', { cx: 250, cy: 90, r: 34, fill: '#f6f3ec', opacity: 0.9 }, win);
  el('rect', { x: -10, y: -10, width: 350, height: 440, rx: 14, fill: 'none', stroke: C.white, 'stroke-width': 18 }, win);
  el('rect', { x: 160, y: -10, width: 10, height: 440, fill: C.white }, win);
  const lamp = el('g', { transform: 'translate(150,940)' }, back);
  el('circle', { cx: 0, cy: -260, r: 260, fill: 'url(#lampWarm)' }, lamp);
  el('rect', { x: -60, y: -40, width: 120, height: 40, rx: 8, fill: '#0b1636' }, lamp);
  el('rect', { x: -8, y: -220, width: 16, height: 180, fill: '#0b1636' }, lamp);
  el('path', { d: 'M -70 -300 L 70 -300 L 50 -220 L -50 -220 Z', fill: C.orange }, lamp);
  el('rect', { x: -800, y: 1180, width: 2700, height: 1000, fill: '#0e1b44' }, back);
  // cama
  el('rect', { x: 220, y: 1080, width: 760, height: 120, rx: 30, fill: '#f6f3ec' }, mid);
  el('rect', { x: 220, y: 1150, width: 760, height: 90, rx: 20, fill: '#c9cfe0' }, mid);
  el('rect', { x: 760, y: 990, width: 200, height: 110, rx: 40, fill: CORAL, opacity: 0.85 }, mid);
  el('rect', { x: 200, y: 1236, width: 800, height: 40, rx: 10, fill: '#3a4f8f' }, mid);
  return { back, mid, sky };
}
// burbuja de chat (saliente, coral) con estado «Enviado → Visto» e indicador «escribiendo…»
export function makeChat(parent, text) {
  const g = el('g', { opacity: 0 }, parent);
  const t = el('text', { x: 0, y: 0, 'font-size': 40, 'font-weight': 800, fill: C.white }, g); t.textContent = text;
  const w = t.getComputedTextLength() + 64;
  g.insertBefore(el('path', { d: `M 0 -50 h ${w} a 26 26 0 0 1 26 26 v 46 a 26 26 0 0 1 -26 26 h -${w - 30} l -26 22 v -22 a 26 26 0 0 1 -26 -26 v -46 a 26 26 0 0 1 26 -26 Z`, fill: CORAL, transform: 'translate(-26,0)' }), t);
  set(t, { x: 6, y: 8 });
  const st = el('text', { x: w - 30, y: 82, 'font-size': 24, 'font-weight': 800, fill: '#c9cfe0', 'text-anchor': 'end' }, g);
  const typing = el('g', { transform: `translate(-10,150)`, opacity: 0 }, g);
  el('rect', { x: -10, y: -34, width: 130, height: 68, rx: 34, fill: '#2a3a6e' }, typing);
  const dots = [0, 1, 2].map(i => el('circle', { cx: 25 + i * 32, cy: 0, r: 9, fill: C.white }, typing));
  return { g, w, show(t, a, x, y, seen) {
    const k = ramp(t, a, a + 0.4, E.back);
    set(g, { opacity: f3(clamp(k * 2)), transform: `translate(${f1(x)},${f1(y + 30 * (1 - k))}) scale(${f3(lerp(0.6, 1, k) * 1.25)})` });
    st.textContent = t > seen ? 'Visto ✓✓' : 'Enviado ✓';
    set(st, { fill: t > seen ? '#7ec8ff' : '#c9cfe0' });
  }, typing(t, a, b) { const k = ramp(t, a, a + 0.2) * (1 - ramp(t, b - 0.2, b)); set(typing, { opacity: f3(k) }); dots.forEach((d, i) => set(d, { cy: f1(-8 * Math.max(0, Math.sin(t * 9 - i * 0.8))) })); } };
}
// protagonista
export function makeGirl(parent) {
  const P = makePerson(parent, { shirt: CORAL, pants: '#1d2b5c', skin: '#c98d63', hair: '#2a1b12', style: 3, shadow: '#000' });
  const ph = el('g', { transform: 'rotate(-70) scale(0.36)' }, P.held); icon(ph, 'phone');
  const glow = el('circle', { r: 90, fill: 'url(#phoneGlow)' }, P.held);
  return { P, glow };
}
// mini-perfil (avatar redondo) para burbujas de pensamiento y tarjetas
export function makeAvatar(parent, { r = 40, shirt = '#3a5cb8', skin = '#e8b48c', hair = '#3b2416' } = {}) {
  const g = el('g', {}, parent);
  el('circle', { r, fill: '#c9d4f2' }, g);
  const cp = el('clipPath', { id: `av${Math.round(Math.random() * 1e9)}` }, g); el('circle', { r }, cp);
  const inner = el('g', { 'clip-path': `url(#${cp.id})` }, g);
  el('ellipse', { cx: 0, cy: r * 0.95, rx: r * 0.75, ry: r * 0.55, fill: shirt }, inner);
  el('circle', { cx: 0, cy: -r * 0.1, r: r * 0.38, fill: skin }, inner);
  el('path', { d: `M ${-r * 0.4} ${-r * 0.2} Q 0 ${-r * 0.75} ${r * 0.4} ${-r * 0.2} Q ${r * 0.1} ${-r * 0.42} ${-r * 0.4} ${-r * 0.2} Z`, fill: hair }, inner);
  return g;
}
