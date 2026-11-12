// ESCENA 08 — LAS LLAVES (72.15 – 78.15 s) · ejemplo cotidiano ilustrativo (no reproduce el experimento)
// Un personaje busca sus llaves: revisa la mochila, luego un cajón. Las llaves están sobre la mesa, parcialmente
// rodeadas de otros objetos. Travelling lateral; al final dirige su atención a las llaves.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '../lib.js';
import { makePerson, drawPerson, ARMS } from '../characters.js';
import { icon } from '../icons.js';

export const S08 = { start: 72.15, end: 78.15 };
const KEYS = { x: 820, y: 1062 };

export function create(layer) {
  const cam = el('g', {}, layer);
  // pared, cuadro, ventana y suelo
  el('rect', { x: -600, y: -400, width: 2900, height: 1700, fill: '#1d2f63' }, cam);
  for (let i = 0; i < 18; i++) el('rect', { x: -600 + i * 160, y: -400, width: 80, height: 1700, fill: '#22376f', opacity: 0.6 }, cam);
  el('rect', { x: -600, y: 1290, width: 2900, height: 900, fill: '#c98b55' }, cam);
  for (let i = 0; i < 30; i++) el('line', { x1: -600 + i * 100, y1: 1290, x2: -900 + i * 130, y2: 2190, stroke: '#a96f3f', 'stroke-width': 3 }, cam);
  el('rect', { x: -600, y: 1280, width: 2900, height: 20, fill: '#0b1636' }, cam);
  const frame = el('g', { transform: 'translate(800,560)' }, cam);
  el('rect', { x: -170, y: -120, width: 340, height: 240, rx: 8, fill: C.white }, frame);
  el('rect', { x: -150, y: -100, width: 300, height: 200, fill: '#ffd98a' }, frame);
  el('circle', { cx: 60, cy: -30, r: 34, fill: C.orange }, frame);
  el('path', { d: 'M -150 100 L -60 10 L 10 70 L 70 20 L 150 100 Z', fill: '#2f8a5f' }, frame);
  el('rect', { x: 120, y: 330, width: 260, height: 360, rx: 14, fill: '#ffd98a', opacity: 0.85 }, cam);
  el('rect', { x: 110, y: 320, width: 280, height: 380, rx: 18, fill: 'none', stroke: C.white, 'stroke-width': 16 }, cam);
  // silla con mochila (izquierda)
  const chair = el('g', { transform: 'translate(240,1290)' }, cam);
  el('rect', { x: -90, y: -240, width: 18, height: 240, fill: '#0b1636' }, chair); el('rect', { x: 72, y: -150, width: 18, height: 150, fill: '#0b1636' }, chair);
  el('rect', { x: -96, y: -170, width: 196, height: 26, rx: 10, fill: '#3a5cb8' }, chair); el('rect', { x: -96, y: -400, width: 26, height: 250, rx: 10, fill: '#3a5cb8' }, chair);
  const bag = el('g', { transform: 'translate(10,-170)' }, chair);
  el('path', { d: 'M -70 0 Q -80 -160 0 -170 Q 80 -160 70 0 Z', fill: C.orange }, bag);
  el('rect', { x: -44, y: -70, width: 88, height: 50, rx: 12, fill: C.orange2 }, bag);
  const flap = el('path', { d: 'M -66 -120 Q 0 -190 66 -120 L 60 -90 Q 0 -120 -60 -90 Z', fill: '#c94a14' }, bag);
  // mueble con cajón (derecha)
  const cab = el('g', { transform: 'translate(1340,1290)' }, cam);
  el('rect', { x: -150, y: -380, width: 300, height: 380, rx: 10, fill: C.white }, cab);
  el('rect', { x: -130, y: -170, width: 260, height: 150, rx: 8, fill: '#d7dbe8' }, cab);
  el('rect', { x: -30, y: -105, width: 60, height: 14, rx: 7, fill: '#9aa3bf' }, cab);
  const drawerBox = el('rect', { x: -126, y: -360, width: 252, height: 40, rx: 4, fill: '#9aa3bf' }, cab);
  const drawer = el('g', {}, cab);
  el('rect', { x: -136, y: -360, width: 272, height: 160, rx: 8, fill: '#e3e6ef', stroke: '#c3c9db', 'stroke-width': 4 }, drawer);
  el('rect', { x: -30, y: -290, width: 60, height: 14, rx: 7, fill: '#9aa3bf' }, drawer);
  icon(cab, 'plant', { transform: 'translate(-60,-450) scale(0.9)' }); icon(cab, 'book', { transform: 'translate(70,-428) scale(0.7)' });
  // personaje (detrás de la mesa cuando pasa por el centro)
  const guy = makePerson(cam, { shirt: '#3a5cb8', pants: '#1d2b5c', skin: '#e8b48c', hair: '#3b2416', style: 0, shadow: '#000' });
  // mesa con objetos; las llaves quedan medio ocultas tras los libros
  const table = el('g', {}, cam);
  el('rect', { x: 560, y: 1100, width: 22, height: 300, fill: '#0b1636' }, table); el('rect', { x: 1058, y: 1100, width: 22, height: 300, fill: '#0b1636' }, table);
  el('path', { d: 'M 520 1080 L 1120 1080 L 1140 1112 L 500 1112 Z', fill: C.white }, table);
  el('rect', { x: 500, y: 1112, width: 640, height: 26, fill: '#c3c9db' }, table);
  const keyG = icon(table, 'key', { transform: `translate(${KEYS.x},${KEYS.y}) rotate(-12) scale(0.55)` });
  icon(table, 'book', { transform: 'translate(745,1040) scale(0.95) rotate(-4)' }); icon(table, 'book', { transform: 'translate(752,990) scale(0.85) rotate(5)' });
  icon(table, 'mug', { transform: 'translate(930,1032) scale(0.6)' }); icon(table, 'plant', { transform: 'translate(610,1010) scale(0.8)' });
  el('rect', { x: 860, y: 1066, width: 110, height: 12, rx: 3, fill: '#eef0f6', transform: 'rotate(-6 915 1072)' }, table);
  icon(table, 'glasses', { transform: 'translate(1040,1060) scale(0.5)' });
  const ring = el('circle', { cx: KEYS.x, cy: KEYS.y, r: 0, fill: 'none', stroke: C.yellow, 'stroke-width': 9 }, cam);
  // etiqueta
  const tag = el('g', { opacity: 0 }, layer);
  el('rect', { x: -210, y: -38, width: 420, height: 76, rx: 38, fill: C.ink, opacity: 0.9 }, tag);
  el('circle', { cx: -170, cy: 0, r: 12, fill: C.orange }, tag);
  const tt = el('text', { x: 14, y: 11, 'font-size': 30, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle', 'letter-spacing': 3 }, tag); tt.textContent = 'EJEMPLO COTIDIANO';
  return {
    render(t, ctx) {
      // recorrido del personaje
      const w1 = ramp(t, 73.9, 74.85, E.inOut), w2 = ramp(t, 76.35, 76.9, E.inOut);
      const x = lerp(lerp(330, 1150, w1), 1080, w2);
      const walking = (t > 73.9 && t < 74.85) || (t > 76.35 && t < 76.9);
      let arms = ARMS.rest(), lean = 0, face = 1, headR = 0, smile = 0.4;
      if (t < 73.9) { const r = Math.sin(t * 11) * 12; arms = { handB: { x: -40 + r, y: -60 }, handF: { x: -10 - r, y: -70 } }; lean = -24; face = -1; headR = 14; smile = 0.2; }
      else if (t > 74.85 && t < 75.95) { const r = Math.sin(t * 12) * 12; arms = { handB: { x: 70 + r, y: -120 }, handF: { x: 100 - r, y: -110 } }; lean = 18; headR = 14; smile = 0.2; }
      else if (t >= 75.95 && t < 76.35) { arms = ARMS.hips(); headR = Math.sin(t * 18) * 8; smile = 0; }
      else if (t >= 76.35) { face = -1; headR = lerp(0, 16, ramp(t, 76.6, 76.9)); smile = lerp(0.2, 1, ramp(t, 77.1, 77.4)); arms = t > 77.15 ? ARMS.point(ramp(t, 77.15, 77.45, E.out)) : ARMS.rest(); }
      drawPerson(guy, { x, y: 1300, s: 1.25, face, phase: t * 9, stride: walking ? 1 : 0, ...arms, lean, headR, smile });
      set(flap, { transform: `translate(0,${f1(-30 * ramp(t, 72.3, 72.6) * (1 - ramp(t, 73.8, 74.0)))}) rotate(${f1(-25 * ramp(t, 72.3, 72.6) * (1 - ramp(t, 73.8, 74.0)))})` });
      const dr = ramp(t, 74.85, 75.15, E.out) * (1 - ramp(t, 75.95, 76.2, E.in));
      set(drawer, { transform: `translate(0,${f1(dr * 70)}) scale(1,${f3(1 + dr * 0.06)})` });
      set(drawerBox, { height: f1(40 + dr * 70) });
      // travelling lateral que acompaña la búsqueda; al final se acerca a las llaves
      const follow = lerp(x, 800, 0.35);
      const push = ramp(t, 76.8, 77.7, E.inOut);
      const cx = lerp(follow, KEYS.x, push), cy = lerp(1000, KEYS.y, push), z = lerp(1.0, 1.45, push) * lerp(1.06, 1, ramp(t, 72.15, 72.8, E.out));
      set(cam, { transform: `translate(540,${f1(lerp(980, 1000, push))}) scale(${f3(z)}) translate(${f1(-cx)},${f1(-cy)})` });
      const rk = ramp(t, 77.0, 77.35, E.back);
      set(ring, { r: f1(70 * rk), opacity: f3(clamp(rk * 2)) });
      set(keyG, { transform: `translate(${KEYS.x},${KEYS.y}) rotate(-12) scale(${f3(0.55 * (1 + 0.15 * Math.sin(clamp((t - 77.0) / 0.4) * Math.PI)))})` });
      const tk = ramp(t, 72.3, 72.7, E.back);
      set(tag, { opacity: f3(clamp(tk * 2) * (1 - ramp(t, 77.8, 78.1))), transform: tr(540, 250, lerp(0.6, 1, tk), -2) });
    },
  };
}
