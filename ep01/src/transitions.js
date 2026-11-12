// Transición editorial de formas geométricas (la misma de la escena 01): círculo → cuadrado → triángulo.
import { el, set, ramp, lerp, E, C, f1 } from './lib.js';
export function makeGeoWipe(parent, colors = [C.yellow, C.orange, C.navy2]) {
  const g = el('g', {}, parent);
  const c = el('circle', { r: 0, fill: colors[0] }, g), s = el('rect', { fill: colors[1] }, g), tri = el('path', { fill: colors[2] }, g);
  return (t, t0, cx = 540, cy = 960) => {
    const c1 = ramp(t, t0, t0 + 0.35, E.inOut), c2 = ramp(t, t0 + 0.12, t0 + 0.45, E.inOut), c3 = ramp(t, t0 + 0.2, t0 + 0.53, E.inOut);
    set(c, { cx, cy, r: f1(1300 * c1) });
    const sq = 2600 * c2; set(s, { x: f1(cx - sq / 2), y: f1(cy - sq / 2), width: f1(sq), height: f1(sq), transform: `rotate(${f1(lerp(45, 0, c2))} ${cx} ${cy})` });
    const tr = 3600 * c3; set(tri, { d: `M ${cx} ${f1(cy - tr)} L ${f1(cx + tr)} ${f1(cy + tr * 0.8)} L ${f1(cx - tr)} ${f1(cy + tr * 0.8)} Z` });
  };
}
