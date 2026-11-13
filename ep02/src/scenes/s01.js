// ESCENA 01 — LA PREGUNTA (0 – 9.6 s)
// Fondo azul oscuro; una silueta editorial aparece lentamente desde la penumbra. Diecisiete pequeñas luces se
// distribuyen alrededor (con «17 personas»). Dolly-in suave. «¿QUÉ LO LLEVÓ A MATAR?»: las letras se separan y se
// convierten en documentos de investigación que caen hacia el escritorio de la escena 02 (la cámara baja).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr, rng } from '/ep01/src/lib.js';
import { makeSilhouette } from '../silhouette.js';
import { makeDoc } from '../docs.js';
import { RED } from '../style.js';

export const S01 = { start: 0, end: 9.6 };
const CEN = { x: 540, y: 860 };

export function create(layer) {
  const cam = el('g', {}, layer);
  // textura: retícula tenue de expediente
  const grid = el('g', { opacity: 0.18 }, cam);
  for (let i = -2; i < 16; i++) el('line', { x1: i * 80, y1: -200, x2: i * 80, y2: 2100, stroke: '#2a4796', 'stroke-width': 2 }, grid);
  for (let j = -2; j < 28; j++) el('line', { x1: -200, y1: j * 80, x2: 1300, y2: j * 80, stroke: '#2a4796', 'stroke-width': 2 }, grid);
  el('ellipse', { cx: CEN.x, cy: CEN.y - 40, rx: 560, ry: 640, fill: 'url(#spot2)' }, cam);
  const pulse = el('circle', { cx: CEN.x, cy: CEN.y - 120, r: 300, fill: 'none', stroke: RED, 'stroke-width': 6, opacity: 0 }, cam);
  // 17 luces alrededor (cada una representa a una víctima)
  const lights = [];
  for (let i = 0; i < 17; i++) {
    const a = (-200 + i * (220 / 16)) * Math.PI / 180;
    const x = CEN.x + Math.cos(a) * 430, y = CEN.y - 70 + Math.sin(a) * 470;
    const g = el('g', { transform: `translate(${f1(x)},${f1(y)})`, opacity: 0 }, cam);
    el('circle', { r: 30, fill: '#ffe9a0', opacity: 0.25, filter: 'url(#soft)' }, g);
    el('circle', { r: 8, fill: '#fff6d8' }, g);
    lights.push(g);
  }
  const sil = makeSilhouette(el('g', {}, cam));
  // título: letras independientes que luego se separan y se convierten en documentos
  const title = el('g', {}, layer);
  const LINES = [['¿QUÉ LO LLEVÓ', 96, C.white, 285], ['A MATAR?', 132, C.yellow, 420]];
  const letters = [];
  LINES.forEach(([txt, size, color, y], li) => {
    const probe = el('text', { 'font-size': size, 'font-weight': 900, 'letter-spacing': -size * 0.02 }, title);
    const chars = [...txt], ws = chars.map(ch => { probe.textContent = ch === ' ' ? ' ' : ch; return probe.getComputedTextLength(); });
    probe.remove();
    const total = ws.reduce((a, b) => a + b, 0); let x = 540 - total / 2;
    chars.forEach((ch, i) => {
      const cx = x + ws[i] / 2; x += ws[i];
      if (ch === ' ') return;
      const t = el('text', { x: f1(cx), y, 'font-size': size, 'font-weight': 900, fill: color, 'text-anchor': 'middle', stroke: C.ink, 'stroke-width': size * 0.1, 'paint-order': 'stroke' }, title);
      t.textContent = ch;
      letters.push({ t, cx, cy: y - size * 0.35, li, i });
    });
  });
  const R = rng(3);
  const docs = letters.map((L, k) => {
    const d = makeDoc(title, { w: 70, h: 92, lines: 3, seed: k });
    return { d, L, vx: (R() - 0.5) * 300, rot: (R() - 0.5) * 80, delay: R() * 0.25 };
  });
  return {
    render(t, ctx) {
      // dolly-in suave + bajada de cámara hacia el escritorio (transición a la escena 02)
      const tilt = ramp(t, 8.55, 9.6, E.inOut);
      const z = lerp(1, 1.12, ramp(t, 0, 8.6, E.inOut));
      set(cam, { transform: `translate(${CEN.x},${f1(CEN.y - 1300 * tilt)}) scale(${f3(z)}) translate(${-CEN.x},${-CEN.y})` });
      const appear = ramp(t, 0.1, 2.4, E.inOut);
      set(sil.g, { transform: tr(CEN.x, CEN.y + lerp(80, 0, appear), lerp(0.95, 1, appear)), opacity: f3(appear) });
      set(sil.rim, { opacity: f3(0.55 * ramp(t, 1.0, 3.0)) });
      set(sil.glint, { opacity: f3(0.8 * ramp(t, 2.0, 2.6) * (0.6 + 0.4 * Math.sin(t * 2))) });
      lights.forEach((g, i) => {
        const k = ramp(t, 3.55 + i * 0.13, 3.85 + i * 0.13, E.out);
        set(g, { opacity: f3(k * (0.85 + 0.15 * Math.sin(t * 2.3 + i))), transform: g.getAttribute('transform').replace(/ scale\([^)]*\)/, '') + ` scale(${f3(lerp(0.4, 1, k))})` });
      });
      // «una conducta tan extrema»: pulso en rojo oscuro detrás de la silueta
      const pk = ramp(t, 7.8, 8.3) * (1 - ramp(t, 8.6, 9.0));
      set(pulse, { opacity: f3(0.7 * pk), r: f1(300 + 60 * ramp(t, 7.8, 8.6)) });
      // título: entrada por líneas (máscara implícita: suben y se asientan) y separación en documentos
      const brk = ramp(t, 8.05, 9.2);
      letters.forEach((L, k) => {
        const kin = ramp(t, 0.3 + L.li * 0.45 + L.i * 0.025, 0.75 + L.li * 0.45 + L.i * 0.025, E.back);
        const sep = ramp(t, 7.6, 8.05, E.inOut);
        const spread = (L.cx - 540) * 0.12 * sep;
        const out = ramp(t, 8.05 + docs[k].delay, 8.3 + docs[k].delay);
        set(L.t, { opacity: f3(clamp(kin * 2) * (1 - out)), transform: `translate(${f1(spread)},${f1((1 - kin) * 60 - sep * 6)})` });
        const D = docs[k], dk = ramp(t, 8.05 + D.delay, 9.4 + D.delay, E.in);
        set(D.d, { opacity: f3(t < 8.05 + D.delay ? 0 : 1), transform: tr(L.cx + spread + D.vx * dk, L.cy + 1500 * dk * dk, lerp(0.4, 1, ramp(t, 8.05 + D.delay, 8.35 + D.delay, E.back)), D.rot * dk) });
      });
    },
  };
}
