// ESCENA 12 — CONCLUSIÓN (111.6 – 120.5 s)
// La carpeta del comienzo reaparece abierta y se cierra lentamente; las 17 luces vuelven al fondo.
// «RESPONSABILIDAD» (fx_data, con «la responsabilidad») · texto final «COMPRENDER NO ES JUSTIFICAR.» (fx_data).
// La cámara se aleja; aparece la identidad «DETRÁS DEL PORQUÉ» y fundido a negro.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { makeFolder, makeLights, ringPts } from '../common.js';
import { RED } from '../style.js';

export const S12 = { start: 111.6, end: 120.5 };

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: C.navy }, layer);
  const cam = el('g', {}, layer);
  el('ellipse', { cx: 540, cy: 860, rx: 600, ry: 680, fill: 'url(#spot2)' }, cam);
  const lights = makeLights(cam, ringPts(540, 820, 450, 500));
  const folder = makeFolder(el('g', {}, cam));
  const brand = el('g', { opacity: 0 }, layer);
  el('rect', { x: -80, y: -80, width: 160, height: 160, rx: 40, fill: C.orange }, brand);
  el('text', { x: 0, y: 46, 'font-size': 128, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle' }, brand).textContent = '?';
  el('circle', { cx: 62, cy: -62, r: 22, fill: C.yellow, stroke: C.navy, 'stroke-width': 6 }, brand);
  el('text', { x: 0, y: 160, 'font-size': 44, 'font-weight': 800, fill: C.white, 'text-anchor': 'middle', 'letter-spacing': 10 }, brand).textContent = 'DETRÁS DEL';
  el('text', { x: 0, y: 250, 'font-size': 104, 'font-weight': 900, fill: C.yellow, 'text-anchor': 'middle' }, brand).textContent = 'PORQUÉ';
  const black = el('rect', { width: 1080, height: 1920, fill: '#000', opacity: 0 }, layer);
  return {
    render(t, ctx) {
      const ent = ramp(t, 111.6, 112.4, E.out5);
      const away = ramp(t, 116.4, 119.0, E.inOut);
      set(cam, { transform: `translate(540,860) scale(${f3(lerp(1.1, 1, ent) * lerp(1, 0.72, away))}) translate(-540,-860)`, opacity: f3(ent * (1 - ramp(t, 118.6, 119.1))) });
      set(folder.g, { transform: tr(540, 900 + 60 * (1 - ent), 1, 0) });
      folder.open(1 - ramp(t, 112.4, 114.2, E.inOut));   // se cierra lentamente
      lights.forEach((g, i) => set(g, { opacity: f3(ramp(t, 112.6 + i * 0.1, 112.9 + i * 0.1) * (0.85 + 0.15 * Math.sin(t * 2 + i))) }));
      const bk = ramp(t, 118.9, 119.4, E.back);
      set(brand, { opacity: f3(clamp(bk * 2) * (1 - ramp(t, 119.9, 120.3))), transform: tr(540, 820, lerp(0.5, 1.1, bk), lerp(-8, 0, bk)) });
      set(black, { opacity: f3(ramp(t, 120.0, 120.45)) });
      ctx.capHide = ramp(t, 118.6, 118.9);
    },
  };
}
