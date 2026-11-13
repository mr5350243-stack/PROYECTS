// ESCENA 04 — LOS PERFILES (26.6 – 34.3 s)
// Interfaz inspirada en redes sociales con perfiles masculinos ilustrados. Una participante los observa.
// Travelling lateral entre los perfiles. «…información diferente sobre cuánto interés tenían en ellas»: los
// perfiles se organizan en tres grupos (mucho interés · moderado · incierto).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { makePerson, drawPerson, ARMS } from '/ep01/src/characters.js';
import { makeProfile, interestChip } from '../common.js';
import { CORAL } from '../style.js';

export const S04 = { start: 26.6, end: 34.3 };
const GROUP_COL = [CORAL, C.orange, C.yellow];

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: '#e9edf6' }, layer);
  const ui = el('g', {}, layer);
  el('rect', { x: 0, y: 0, width: 1080, height: 150, fill: '#3a5cb8' }, ui);
  el('circle', { cx: 90, cy: 85, r: 34, fill: '#c9d4f2' }, ui);
  el('rect', { x: 150, y: 70, width: 300, height: 28, rx: 14, fill: '#c9d4f2' }, ui);
  const cam = el('g', {}, layer);
  const cards = Array.from({ length: 9 }, (_, i) => { const p = makeProfile(cam, i); const grp = i % 3; const chip = interestChip(p.chip, [3, 1, -1][grp], GROUP_COL[grp]); set(chip, { opacity: 0 }); return { ...p, chipG: chip, i, grp }; });
  const heads = [['MUCHO INTERÉS', CORAL], ['INTERÉS MODERADO', C.orange], ['INTERÉS INCIERTO', C.yellow]].map(([txt, col], i) => {
    const g = el('g', { opacity: 0 }, layer);
    el('rect', { x: -160, y: -34, width: 320, height: 68, rx: 34, fill: col }, g);
    el('text', { x: 0, y: 11, 'font-size': 28, 'font-weight': 900, fill: C.ink, 'text-anchor': 'middle', 'letter-spacing': 1 }, g).textContent = txt;
    return g;
  });
  // participante (abajo a la izquierda, por encima de la franja de subtítulos)
  const viewer = makePerson(layer, { shirt: C.orange, pants: '#1d2b5c', skin: '#a8714b', hair: '#14110f', style: 1, shadow: '#000' });
  return {
    render(t, ctx) {
      const ent = ramp(t, 26.6, 27.3, E.out5);
      const sort = ramp(t, 30.4, 32.0, E.inOut);
      const pan = ramp(t, 26.8, 30.3, E.inOut);
      cards.forEach(c => {
        // fila larga que recorre la cámara → tres columnas
        const rowX = 260 + c.i * 280 - pan * 1500, rowY = 640;
        const col = c.grp, slot = Math.floor(c.i / 3);
        const gx = 190 + col * 350, gy = 420 + slot * 250;
        set(c.g, { transform: tr(lerp(rowX, gx, sort), lerp(rowY, gy, sort), lerp(1.15, 0.7, sort) * lerp(1.3, 1, ent), lerp(0, (c.i % 2 ? 2 : -2), sort)) });
        set(c.chipG, { opacity: f3(ramp(t, 31.4 + col * 0.35, 31.7 + col * 0.35)) });
        set(c.ring, { opacity: f3(0) });
      });
      heads.forEach((h, i) => { const k = ramp(t, 31.2 + i * 0.35, 31.6 + i * 0.35, E.back); set(h, { opacity: f3(clamp(k * 2)), transform: tr(190 + i * 350, 270, lerp(0.6, 0.95, k)) }); });
      drawPerson(viewer, { x: lerp(160, 140, pan), y: 1310, s: 1.1, face: 1, phase: 0, stride: 0, ...ARMS.chin(), headR: lerp(-16, -4, sort) + Math.sin(t * 1.3) * 3, smile: 0.5, opacity: ent * (1 - ramp(t, 30.4, 31.0)) });
    },
  };
}
