// ESCENA 03 — EL ESTUDIO (19.5 – 27.0 s)
// Laboratorio universitario en capas 2.5D. Aparece el año 2011 (con «En 2011»). Tres investigadores ilustrados
// observan documentos y perfiles digitales en una gran pantalla. Etiquetas de las universidades citadas en la
// narración. «EXPERIMENTO CIENTÍFICO» (fx_data). La cámara atraviesa la pantalla (escena 04).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { makePerson, drawPerson, ARMS } from '/ep01/src/characters.js';
import { makeDoc } from '/ep02/src/docs.js';
import { makeProfile } from '../common.js';
import { CORAL } from '../style.js';

export const S03 = { start: 19.5, end: 27.0 };
const SCR = { x: 150, y: 330, w: 780, h: 470 };

export function create(layer) {
  const clip = el('circle', { cx: 540, cy: 700, r: 0 }, el('clipPath', { id: 'e3s03' }, layer));
  const root = el('g', { 'clip-path': 'url(#e3s03)' }, layer);
  const cam = el('g', {}, root);
  el('rect', { x: -600, y: -600, width: 2300, height: 2400, fill: 'url(#labWall)' }, cam);
  for (let i = 0; i < 12; i++) el('rect', { x: -300 + i * 170, y: -600, width: 4, height: 2400, fill: '#0f1f4c', opacity: 0.5 }, cam);
  // pantalla con perfiles
  el('rect', { x: SCR.x - 20, y: SCR.y - 20, width: SCR.w + 40, height: SCR.h + 40, rx: 24, fill: C.ink }, cam);
  el('clipPath', { id: 'e3scr' }, cam).appendChild(el('rect', { x: SCR.x, y: SCR.y, width: SCR.w, height: SCR.h, rx: 8 }));
  const scr = el('g', { 'clip-path': 'url(#e3scr)' }, cam);
  el('rect', { x: SCR.x, y: SCR.y, width: SCR.w, height: SCR.h, fill: '#e9edf6' }, scr);
  el('rect', { x: SCR.x, y: SCR.y, width: SCR.w, height: 56, fill: '#3a5cb8' }, scr);
  const strip = el('g', {}, scr);
  for (let i = 0; i < 8; i++) { const p = makeProfile(strip, i); set(p.g, { transform: `translate(${SCR.x + 140 + i * 250},${SCR.y + 260}) scale(0.95)` }); }
  // año 2011
  const year = el('g', { opacity: 0 }, cam);
  el('rect', { x: -150, y: -70, width: 300, height: 140, rx: 20, fill: C.white }, year);
  el('rect', { x: -150, y: -70, width: 300, height: 36, rx: 18, fill: CORAL }, year);
  el('text', { x: 0, y: 52, 'font-size': 92, 'font-weight': 900, fill: C.ink, 'text-anchor': 'middle', 'letter-spacing': -2 }, year).textContent = '2011';
  // etiquetas de las universidades (citadas en la narración)
  const unis = ['UNIVERSIDAD DE VIRGINIA', 'UNIVERSIDAD DE HARVARD'].map((u, i) => {
    const g = el('g', { opacity: 0 }, cam);
    const t = el('text', { x: 0, y: 10, 'font-size': 28, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle', 'letter-spacing': 2 }, g); t.textContent = u;
    const w = t.getComputedTextLength() + 60;
    g.insertBefore(el('rect', { x: -w / 2, y: -30, width: w, height: 60, rx: 30, fill: C.ink, stroke: C.yellow, 'stroke-width': 3 }), t);
    return g;
  });
  // mesa e investigadores
  el('rect', { x: -600, y: 1130, width: 2300, height: 900, fill: '#c3c9db' }, cam);
  el('path', { d: 'M -600 1070 L 1700 1070 L 1700 1130 L -600 1130 Z', fill: C.white }, cam);
  const people = [
    makePerson(cam, { shirt: CORAL, pants: '#1d2b5c', skin: '#f1c7a1', hair: '#6b3f1f', style: 1, coat: '#f6f3ec', glasses: true, shadow: '#000' }),
    makePerson(cam, { shirt: '#3a5cb8', pants: '#1d2b5c', skin: '#8a5a3c', hair: '#14110f', style: 0, coat: '#f6f3ec', shadow: '#000' }),
    makePerson(cam, { shirt: C.orange, pants: '#1d2b5c', skin: '#e8b48c', hair: '#2a1b12', style: 3, coat: '#f6f3ec', shadow: '#000' }),
  ];
  const docs = people.map((P, i) => { const d = el('g', {}, P.held); makeDoc(el('g', { transform: 'rotate(-14) translate(12,-46)' }, d), { w: 80, h: 104, lines: 4, seed: i }); return d; });
  // mesa delante de las piernas
  const deskFront = el('rect', { x: -600, y: 1100, width: 2300, height: 900, fill: '#c3c9db' }, cam);
  return {
    render(t, ctx) {
      set(clip, { r: f1(1500 * ramp(t, 19.5, 20.1, E.inOut)) });
      const push = ramp(t, 25.9, 27.0, E.inExpo);
      const z = lerp(1.08, 1, ramp(t, 19.5, 21, E.out)) * lerp(1, 4.2, push);
      const fx = SCR.x + SCR.w / 2, fy = SCR.y + SCR.h / 2;
      set(cam, { transform: `translate(540,${f1(lerp(760, 700, push))}) scale(${f3(z)}) translate(${f1(-lerp(560, fx, push))},${f1(-lerp(780, fy, push))})` });
      set(strip, { transform: `translate(${f1(-((t - 19.5) * 60) % 250)},0)` });
      const yk = ramp(t, 19.8, 20.25, E.back);
      set(year, { opacity: f3(clamp(yk * 2) * (1 - ramp(t, 25.6, 25.9))), transform: tr(870, 210, lerp(0.5, 1, yk), lerp(-10, -4, yk)) });
      unis.forEach((u, i) => { const k = ramp(t, [21.3, 22.7][i], [21.7, 23.1][i], E.back); cam.appendChild(u); set(u, { opacity: f3(clamp(k * 2) * (1 - ramp(t, 25.6, 25.9))), transform: tr([400, 680][i], [1170, 1250][i], lerp(0.6, 1, k), -2) }); });
      people.forEach((P, i) => {
        const look = Math.sin(t * 1.2 + i * 2);
        drawPerson(P, { x: [250, 540, 830][i], y: 1260, s: 1.15, face: i === 2 ? -1 : 1, phase: 0, stride: 0, ...(i === 1 ? ARMS.point(ramp(t, 23.4, 23.8) * (1 - ramp(t, 25.0, 25.4))) : ARMS.phone()), headR: (i === 1 ? -14 : 8) + look * 3, smile: 0.5, lean: look });
      });
      set(deskFront, { y: 1110 });
    },
  };
}
