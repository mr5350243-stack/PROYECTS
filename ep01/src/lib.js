// Utilidades compartidas: creación SVG, interpolación, curvas de easing y paleta (misma que la prueba aprobada).
export const NS = 'http://www.w3.org/2000/svg';
export const W = 1080, H = 1920;
export function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
export const set = (e, attrs) => { for (const k in attrs) e.setAttribute(k, attrs[k]); };
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const E = {
  lin: (x) => x,
  out: (x) => 1 - Math.pow(1 - x, 3),
  out5: (x) => 1 - Math.pow(1 - x, 5),
  inOut: (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  in: (x) => x * x * x,
  inExpo: (x) => x === 0 ? 0 : Math.pow(2, 10 * x - 10),
  back: (x) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  backSoft: (x) => { const c1 = 1.2, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  elastic: (x) => x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * (2 * Math.PI) / 3.2) + 1,
};
export const ramp = (t, a, b, e = E.lin) => e(clamp((t - a) / (b - a)));
// ventana: sube en [a, a+fi], baja en [b-fo, b]
export const win = (t, a, b, fi = 0.2, fo = 0.2, e = E.out) => ramp(t, a, a + fi, e) * (1 - ramp(t, b - fo, b, E.in));
export const C = { navy: '#0b1636', navy2: '#16285e', navy3: '#1f3a80', white: '#f6f3ec', yellow: '#ffc93c', orange: '#ff7a2f', orange2: '#e2581f', ink: '#081128', grey: '#a9b3cf' };
export const tr = (x, y, s = 1, r = 0) => `translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(${r.toFixed(2)}) scale(${s.toFixed(4)})`;
export const f1 = (x) => x.toFixed(1), f3 = (x) => x.toFixed(3);
// pseudo-aleatorio determinista
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export const noise1 = (x, seed = 0) => { const a = Math.sin((x + seed * 17.3) * 1.7) * 0.6 + Math.sin((x + seed * 3.1) * 3.3 + 1.3) * 0.3 + Math.sin((x + seed) * 7.1) * 0.1; return a; };
// cámara 2.5D: cada capa se desplaza según su profundidad (0 = fondo inmóvil, 1 = plano de referencia, >1 primer plano)
export function parallax(g, cam, depth, cx = 540, cy = 960) {
  const s = 1 + (cam.zoom - 1) * depth;
  set(g, { transform: `translate(${f1(cx - cam.x * depth)},${f1(cy - cam.y * depth)}) scale(${f3(s)}) translate(${-cx},${-cy})` });
}
let uid = 0; export const id = (p = 'u') => `${p}${++uid}`;
