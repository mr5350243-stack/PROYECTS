// Portada del episodio 01 (1080×1920, zona segura 3:4 centrada). Reutiliza ojo, partido, personajes y la marca.
import { el, set, C, f1 } from './lib.js';
import { makeEye } from './eye.js';
import { makeGame } from './court.js';
import { makePerson, drawPerson, ARMS } from './characters.js';
import { GAME } from './scenes/game_opts.js';

const world = document.getElementById('world');
await document.fonts.load('900 40px M'); await document.fonts.load('800 40px M');
for (let i = 0; i < 70; i++) el('circle', { cx: (i * 197) % 1080, cy: (i * 331) % 1920, r: 2 + (i % 3), fill: '#2a4796', opacity: 0.4 }, world);
// rayos editoriales detrás del ojo
const rays = el('g', { transform: 'translate(540,860)', opacity: 0.55 }, world);
for (let i = 0; i < 24; i++) el('path', { d: 'M 0 0 L 1400 -90 L 1400 90 Z', fill: i % 2 ? '#1f3a80' : '#132661', transform: `rotate(${i * 15})` }, rays);
// el ojo, con la pupila agrandada y la cancha (gorila incluido) dentro
const eyeG = el('g', { transform: 'translate(540,860) scale(1.22)' }, world);
const eye = makeEye(eyeG);
eye.render({ o: 1, look: { x: -18, y: 6 }, pupilR: 118 });
const clipC = el('circle', { r: 112 }, el('clipPath', { id: 'cvPupil' }, eye.pupilSlot));
const slot = el('g', { 'clip-path': 'url(#cvPupil)' }, eye.pupilSlot);
const courtG = el('g', {}, slot);
const game = makeGame(courtG, GAME);
const r = game.render(38.12);                               // instante en que el gorila se golpea el pecho en el centro
const gx = r.gor.x, gy = r.gor.y - 170 * r.gor.s;
set(courtG, { transform: `scale(0.36) translate(${f1(-gx)},${f1(-gy)})` });
el('circle', { r: 112, fill: 'none', stroke: C.ink, 'stroke-width': 10 }, eye.pupilSlot);
// personaje que saluda detrás del ojo
const guy = makePerson(world, { shirt: C.white, pants: '#1d2b5c', skin: '#e8b48c', hair: '#3b2416', style: 0, shadow: '#050b20' });
drawPerson(guy, { x: 995, y: 1120, s: 0.95, face: -1, phase: 0, stride: 0, ...ARMS.wave(0.4), headR: -6, smile: 1 });
set(guy.sh, { opacity: 0.25 });
// anillo de atención alrededor de la pupila + pelota amarilla
el('circle', { cx: 540 - 18 * 1.22, cy: 860 + 6 * 1.22, r: 168, fill: 'none', stroke: C.yellow, 'stroke-width': 12, 'stroke-dasharray': '30 18', 'stroke-linecap': 'round' }, world);
el('circle', { cx: 250, cy: 1210, r: 34, fill: 'url(#yball)' }, world);
el('ellipse', { cx: 250, cy: 1262, rx: 34, ry: 8, fill: '#020617', opacity: 0.4 }, world);
// marca y número de episodio (arriba, dentro de la zona segura)
const top = el('g', { transform: 'translate(540,300)' }, world);
el('rect', { x: -310, y: -50, width: 100, height: 100, rx: 26, fill: C.orange }, top);
el('text', { x: -260, y: 30, 'font-size': 80, 'font-weight': 900, fill: '#fff', 'text-anchor': 'middle' }, top).textContent = '?';
el('circle', { cx: -218, cy: -42, r: 15, fill: C.yellow, stroke: C.navy, 'stroke-width': 5 }, top);
el('text', { x: -186, y: -6, 'font-size': 28, 'font-weight': 800, fill: C.white, 'letter-spacing': 6 }, top).textContent = 'DETRÁS DEL';
el('text', { x: -188, y: 46, 'font-size': 56, 'font-weight': 900, fill: C.yellow }, top).textContent = 'PORQUÉ';
el('rect', { x: 150, y: -30, width: 170, height: 60, rx: 30, fill: 'none', stroke: C.white, 'stroke-width': 4 }, top);
el('text', { x: 235, y: 11, 'font-size': 28, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle', 'letter-spacing': 3 }, top).textContent = 'EP. 01';
// titular: «¿LO VISTE?» grande + bandas editoriales (mismo lenguaje que los subtítulos)
const T = el('g', { transform: 'translate(540,1430) rotate(-3)' }, world);
el('text', { x: 0, y: 0, 'font-size': 190, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle', stroke: C.ink, 'stroke-width': 22, 'paint-order': 'stroke', 'letter-spacing': -4 }, T).textContent = '¿LO';
const vis = el('g', { transform: 'translate(0,175)' }, T);
el('rect', { x: -330, y: -158, width: 660, height: 182, rx: 10, fill: C.yellow, transform: 'skewX(-9)' }, vis);
el('text', { x: 0, y: 0, 'font-size': 190, 'font-weight': 900, fill: C.ink, 'text-anchor': 'middle', 'letter-spacing': -4 }, vis).textContent = 'VISTE?';
const band = (txt, y, x, size, col) => {
  const g = el('g', { transform: `translate(${x},${y}) rotate(-2)` }, world);
  const t = el('text', { x: 0, y: 0, 'font-size': size, 'font-weight': 900, fill: col, 'text-anchor': 'middle', 'letter-spacing': 1 }, g); t.textContent = txt;
  const w = t.getComputedTextLength() + 70, h = size * 1.5;
  const strip = el('path', { d: `M ${-w / 2 + 8} ${-h * 0.72} L ${w / 2 + 8} ${-h * 0.72} L ${w / 2 - 8} ${h * 0.28} L ${-w / 2 - 8} ${h * 0.28} Z`, fill: C.ink, opacity: 0.94, filter: 'url(#capShadow)' }, g);
  const edge = el('path', { d: `M ${-w / 2 + 8} ${-h * 0.72} L ${-w / 2 + 22} ${-h * 0.72} L ${-w / 2 + 6} ${h * 0.28} L ${-w / 2 - 8} ${h * 0.28} Z`, fill: C.orange }, g);
  g.insertBefore(edge, t); g.insertBefore(strip, edge);
};
band('CEGUERA POR FALTA DE ATENCIÓN', 1745, 540, 46, C.white);
window.ready = true;
