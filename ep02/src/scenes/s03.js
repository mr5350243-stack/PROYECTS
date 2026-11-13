// ESCENA 03 — LAS HIPÓTESIS (31.2 – 35.9 s)
// Silueta humana en el centro; tres símbolos orbitan a su alrededor en 2.5D: una puerta (abandono), un círculo
// cerrado (control) y una nube de pensamientos (fantasías). Órbita de cámara suave. «HIPÓTESIS PSICOLÓGICAS» (fx_data).
// Nota: «Hipótesis, no causas demostradas». Con «miedo al abandono» la puerta avanza y abre la escena 04.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { makeSilhouette } from '../silhouette.js';
import { makeSymbol, makeNote } from '../common.js';

export const S03 = { start: 31.2, end: 35.9 };
const CEN = { x: 540, y: 820 };

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: C.navy }, layer);
  const grid = el('g', { opacity: 0.16 }, layer);
  for (let i = -6; i < 20; i++) el('line', { x1: i * 80, y1: -400, x2: i * 80, y2: 2300, stroke: '#2a4796', 'stroke-width': 2 }, grid);
  el('ellipse', { cx: CEN.x, cy: CEN.y + 300, rx: 470, ry: 110, fill: 'none', stroke: '#2a4796', 'stroke-width': 4, 'stroke-dasharray': '6 14' }, layer);
  const back = el('g', {}, layer), mid = el('g', {}, layer), front = el('g', {}, layer);
  const sil = makeSilhouette(el('g', {}, mid));
  set(sil.g, { transform: tr(CEN.x, CEN.y, 0.78) });
  const syms = [makeSymbol(front, 'door', 'ABANDONO'), makeSymbol(front, 'ring', 'CONTROL'), makeSymbol(front, 'cloud', 'FANTASÍAS')];
  const note = makeNote(layer, 'Hipótesis, no causas demostradas');
  return {
    render(t, ctx) {
      const ent = ramp(t, 31.2, 32.0, E.out5);
      // «órbita de cámara»: el plano del suelo gira y la silueta se desplaza ligeramente en sentido contrario
      const orb = lerp(-0.35, 0.35, ramp(t, 31.2, 35.9, E.inOut));
      set(grid, { transform: `translate(${f1(-orb * 160)},0)` });
      set(sil.g, { transform: tr(CEN.x - orb * 40, CEN.y + 40 * (1 - ent), 0.78 * lerp(0.9, 1, ent)), opacity: f3(ent) });
      const door = ramp(t, 34.3, 35.9, E.inExpo);   // la puerta se adelanta hacia la cámara
      syms.forEach((S, i) => {
        const a = orb * 2.2 + i * (Math.PI * 2 / 3) + t * 0.35 - Math.PI / 2;
        const depth = Math.sin(a);
        let x = CEN.x + Math.cos(a) * 420, y = CEN.y + 300 + depth * 110 - 220, s = lerp(0.7, 1.15, (depth + 1) / 2);
        if (i === 0) { x = lerp(x, 540, door); y = lerp(y, 880, door); s = lerp(s, 9, door); }
        const k = ramp(t, 31.5 + i * 0.25, 32.1 + i * 0.25, E.back);
        set(S.g, { transform: tr(x, y, s * lerp(0.3, 1, k), Math.sin(t * 1.2 + i) * 5), opacity: f3(clamp(k * 2)) });
        set(S.lt, { opacity: f3(i === 0 ? 1 - door * 3 : 1) });
        (depth < 0 && i !== 0 ? back : (i === 0 && door > 0 ? layer : front)).appendChild(S.g);
      });
      note.show(t, 32.6, 34.6, 540, 1250);
    },
  };
}
