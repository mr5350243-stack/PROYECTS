// Piezas del episodio 08: protagonista y su habitación (episodio 03), el otro personaje y un teléfono grande con
// pantallas intercambiables (chat, videollamada, calendario) para los primeros planos.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr, id } from '/ep01/src/lib.js';
import { makePerson } from '/ep01/src/characters.js';
export { makeRoom, makeGirl, makeAvatar, makeChat } from '/ep03/src/common.js';
import { makeAvatar } from '/ep03/src/common.js';
import { CORAL } from './style.js';

export const HIM = { shirt: '#3a5cb8', skin: '#e8b48c', hair: '#14110f' };
export const makeHim = (p) => makePerson(p, { shirt: HIM.shirt, pants: '#1d2b5c', skin: HIM.skin, hair: HIM.hair, style: 0, shadow: '#000' });
const HEART = 'M 0 10 C -24 -6 -14 -26 0 -14 C 14 -26 24 -6 0 10 Z';

// teléfono grande (520 × 1000) con cabecera de chat
export function makeBigPhone(parent) {
  const g = el('g', {}, parent);
  el('rect', { x: -270, y: -520, width: 540, height: 1040, rx: 70, fill: '#081128' }, g);
  const scr = el('g', {}, g);
  const cid = id('bpclip');   // identificador único por teléfono
  el('clipPath', { id: cid }, g).appendChild(el('rect', { x: -245, y: -495, width: 490, height: 990, rx: 50 }));
  const view = el('g', { 'clip-path': `url(#${cid})` }, g);
  el('rect', { x: -245, y: -495, width: 490, height: 990, fill: '#eef1f8' }, view);
  // cabecera: avatar y nombre (barras, sin nombres reales)
  el('rect', { x: -245, y: -495, width: 490, height: 130, fill: '#3a5cb8' }, view);
  makeAvatar(el('g', { transform: 'translate(-170,-425)' }, view), { r: 38, shirt: HIM.shirt, skin: HIM.skin, hair: HIM.hair });
  el('rect', { x: -115, y: -445, width: 170, height: 22, rx: 11, fill: '#c9d4f2' }, view);
  const status = el('text', { x: -115, y: -395, 'font-size': 22, 'font-weight': 800, fill: '#c9d4f2' }, view); status.textContent = 'en línea';
  const chat = el('g', {}, view), call = el('g', { opacity: 0 }, view), cal = el('g', { opacity: 0 }, view);
  // videollamada
  el('rect', { x: -245, y: -495, width: 490, height: 990, fill: '#1f3a80' }, call);
  makeAvatar(el('g', { transform: 'translate(0,-60) scale(3.2)' }, call), { r: 60, shirt: HIM.shirt, skin: HIM.skin, hair: HIM.hair });
  const pip = el('g', { transform: 'translate(150,320)' }, call);
  el('rect', { x: -70, y: -100, width: 140, height: 200, rx: 18, fill: '#2a4796', stroke: '#fff', 'stroke-width': 4 }, pip);
  makeAvatar(el('g', { transform: 'scale(1.1)' }, pip), { r: 50, shirt: CORAL, skin: '#c98d63', hair: '#2a1b12' });
  el('circle', { cx: -110, cy: 400, r: 40, fill: '#e85d50' }, call);
  // calendario
  el('rect', { x: -245, y: -495, width: 490, height: 990, fill: '#f6f3ec' }, cal);
  el('rect', { x: -245, y: -495, width: 490, height: 150, fill: CORAL }, cal);
  el('text', { x: 0, y: -400, 'font-size': 46, 'font-weight': 900, fill: '#fff', 'text-anchor': 'middle' }, cal).textContent = 'CALENDARIO';
  const days = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) { const x = -200 + c * 66, y = -280 + r * 80; el('rect', { x: x - 26, y: y - 26, width: 52, height: 52, rx: 10, fill: '#e3e6ef' }, cal); el('text', { x, y: 9, 'font-size': 24, 'font-weight': 800, fill: '#5d6178', 'text-anchor': 'middle', transform: `translate(0,${y})` }, cal).textContent = String(r * 7 + c + 1); days.push({ x, y }); }
  const mark = el('circle', { r: 0, fill: 'none', stroke: CORAL, 'stroke-width': 8 }, cal);
  const plan = el('g', { opacity: 0 }, cal);
  el('rect', { x: -200, y: 140, width: 400, height: 120, rx: 22, fill: CORAL }, plan);
  el('path', { d: HEART, fill: '#fff', transform: 'translate(-150,200) scale(1.4)' }, plan);
  el('text', { x: -110, y: 216, 'font-size': 40, 'font-weight': 900, fill: '#fff' }, plan).textContent = 'Cita · 20:00';
  return { g, chat, call, cal, status, mark, plan, days };
}
// burbuja de chat en la pantalla grande (entrante: blanca a la izquierda · saliente: coral a la derecha)
export function phoneMsg(parent, { w = 300, out = false, heart = false, text = null, lines = 2 } = {}) {
  const g = el('g', { opacity: 0 }, parent);
  el('rect', { x: out ? -w : 0, y: -40, width: w, height: 80 + (lines - 1) * 26, rx: 34, fill: out ? CORAL : '#fff' }, g);
  if (text) { const t = el('text', { x: out ? -w + 28 : 28, y: 12, 'font-size': 32, 'font-weight': 800, fill: out ? '#fff' : '#0b1636' }, g); t.textContent = text; if (heart) el('path', { d: HEART, fill: CORAL, transform: `translate(${(out ? -w : 0) + 50 + t.getComputedTextLength()},2) scale(1.2)` }, g); }
  else for (let k = 0; k < lines; k++) el('rect', { x: (out ? -w : 0) + 26, y: -14 + k * 26, width: (w - 52) * (k ? 0.6 : 1), height: 12, rx: 6, fill: out ? '#ffd0c8' : '#c9cfe0' }, g);
  return g;
}
