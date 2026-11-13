// ESCENA 01 — GANCHO (0 – 11.8 s)
// La pareja sentada frente a frente. Ella lo observa con expresión de duda. Con «cinco señales» (8.7 s) aparecen
// cinco símbolos alrededor de ambos, que se transforman en cinco tarjetas. Acercamiento de cámara.
// «¿TU PAREJA TIENE ESTAS SEÑALES?» (fx_data).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson, ARMS } from '/ep01/src/characters.js';
import { makeWoman, makeMan, makeLiving, makeChair, makeTable, SYMBOLS, makeCard } from '../common.js';

export const S01 = { start: 0, end: 11.8 };
const W = { x: 330, y: 1180 }, M = { x: 750, y: 1180 }, S = 1.3;

export function create(layer) {
  const cam = el('g', {}, layer);
  makeLiving(cam);
  const chW = makeChair(cam, 1), chM = makeChair(cam, -1);
  set(chW, { transform: `translate(${W.x},${W.y})` }); set(chM, { transform: `translate(${M.x},${M.y}) scale(-1,1)` });
  const woman = makeWoman(cam), man = makeMan(cam);
  const table = makeTable(cam); set(table, { transform: 'translate(540,1180)' });
  const syms = SYMBOLS.map((fn, i) => { const g = el('g', { opacity: 0 }, layer); el('circle', { r: 76, fill: C.navy, stroke: C.yellow, 'stroke-width': 4 }, g); fn(el('g', {}, g)); return g; });
  const cards = [0, 1, 2, 3, 4].map(i => { const c = makeCard(layer, i); set(c.g, { opacity: 0 }); return c; });
  return {
    render(t, ctx) {
      const ent = ramp(t, 0, 0.8, E.out);
      const push = ramp(t, 0.5, 8.4, E.inOut);
      set(cam, { transform: `translate(540,${f1(lerp(880, 860, push))}) scale(${f3(lerp(1.25, 1.55, push) * lerp(1.06, 1, ent))}) translate(${f1(-lerp(540, 470, push))},-940)`, opacity: f3(ent) });
      // ella: duda (mano en la barbilla, cabeza inclinada) · él: habla animado
      const doubt = ramp(t, 2.6, 3.6, E.inOut);
      drawPerson(woman, { x: W.x, y: W.y, s: S, face: 1, sit: 1, phase: 0, stride: 0, ...(doubt > 0.5 ? ARMS.chin() : { handB: { x: 60, y: -150 }, handF: { x: 80, y: -148 } }), headR: lerp(-2, 10, doubt) + Math.sin(t * 0.8) * 2, smile: lerp(0.5, -0.15, doubt), lean: lerp(0, -3, doubt) });
      const talk = Math.sin(t * 7) * 18;
      drawPerson(man, { x: M.x, y: M.y, s: S, face: -1, sit: 1, phase: 0, stride: 0, handB: { x: 60, y: -170 }, handF: { x: 110 + talk, y: -230 - talk * 0.6 }, headR: -4 + Math.sin(t * 2.3) * 3, smile: 0.7 });
      // cinco símbolos alrededor de ambos (8.7 s) → cinco tarjetas en abanico
      const toCard = ramp(t, 10.0, 11.0, E.inOut);
      syms.forEach((g, i) => {
        const a = Math.PI * 1.12 + (i / 4) * Math.PI * 0.76, k = ramp(t, 8.75 + i * 0.16, 9.15 + i * 0.16, E.back);
        const x = 540 + Math.cos(a) * 420, y = 800 + Math.sin(a) * 520 + Math.sin(t * 1.5 + i) * 10;   // arco alto: no tapa los rostros
        set(g, { opacity: f3(clamp(k * 2) * (1 - ramp(toCard, 0.3, 0.6))), transform: tr(x, y, lerp(0.3, 1, k) * lerp(1, 0.8, toCard)) });
        const cx = 140 + i * 200, cy = 640 + Math.abs(i - 2) * 40;
        set(cards[i].g, { opacity: f3(ramp(toCard, 0.3, 0.6)), transform: tr(lerp(x, cx, toCard), lerp(y, cy, toCard), lerp(0.5, 0.82, toCard), (i - 2) * 5 * toCard) });
      });
      set(cam, { opacity: f3(ent * (1 - 0.55 * toCard)) });
      // salida: la tarjeta 1 se adelanta (escena 02)
      const go = ramp(t, 11.0, 11.8, E.inOut);
      cards.forEach((c, i) => { if (go > 0) set(c.g, { opacity: f3(i === 0 ? 1 - ramp(go, 0.7, 1) : 1 - go), transform: tr(lerp(140 + i * 200, 540, i === 0 ? go : 0), lerp(640 + Math.abs(i - 2) * 40, 600, i === 0 ? go : 0), lerp(0.82, i === 0 ? 1.6 : 0.6, go), (i - 2) * 5 * (1 - go)) }); });
    },
  };
}
