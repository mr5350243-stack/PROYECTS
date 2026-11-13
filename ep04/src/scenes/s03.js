// ESCENA 03 — SEÑAL 2: NO ACEPTA CRÍTICAS (21.2 – 30.8 s)
// De pie, frente a frente. Ella expresa una preocupación: su burbuja viaja hacia él. Él cruza los brazos y responde
// con enojo; la burbuja se convierte en una flecha que regresa hacia ella. «TE CULPA POR RECLAMAR» (fx_data).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson, ARMS } from '/ep01/src/characters.js';
import { makeWoman, makeMan, makeLiving, makeSpeech, makeBadge, CROSS } from '../common.js';
import { CORAL, GREY } from '../style.js';

export const S03 = { start: 21.2, end: 30.8 };
const W = { x: 300, y: 1250 }, M = { x: 790, y: 1250 }, S = 1.35;

export function create(layer) {
  const iris = el('circle', { cx: 540, cy: 760, r: 0 }, el('clipPath', { id: 'e4s03iris' }, layer));
  const root = el('g', { 'clip-path': 'url(#e4s03iris)' }, layer);
  const cam = el('g', {}, root);
  makeLiving(cam);
  const woman = makeWoman(cam), man = makeMan(cam);
  const angry = el('circle', { cx: M.x, cy: M.y - 340 * S, r: 150, fill: CORAL, opacity: 0, filter: 'url(#soft)' }, cam);
  cam.insertBefore(angry, man.g);
  const bub = makeSpeech(cam, { w: 220, h: 130, fill: C.white, tail: 1 });
  // icono «algo me dolió»: corazón con tirita
  el('path', { d: 'M 0 34 C -60 -6 -44 -56 0 -24 C 44 -56 60 -6 0 34 Z', fill: CORAL }, bub.inner);
  el('rect', { x: -30, y: -16, width: 60, height: 20, rx: 8, fill: '#f6e3c4', transform: 'rotate(-30)' }, bub.inner);
  const arrow = el('g', { opacity: 0 }, cam);
  el('path', { d: 'M -90 0 L 40 0', stroke: CORAL, 'stroke-width': 26, 'stroke-linecap': 'round' }, arrow);
  el('path', { d: 'M 30 -46 L 96 0 L 30 46 Z', fill: CORAL }, arrow);
  const hit = el('circle', { r: 0, fill: 'none', stroke: CORAL, 'stroke-width': 8 }, cam);
  const badge = makeBadge(layer, 1);
  return {
    render(t, ctx) {
      set(iris, { r: f1(1800 * ramp(t, 21.2, 21.9, E.inOut)) });
      set(cam, { transform: `translate(540,860) scale(1.35) translate(-545,-960)` });
      // 24.6 «cuando señalas algo que te lastimó»: la burbuja viaja hacia él
      const send = ramp(t, 25.0, 26.2, E.inOut);
      const cross = ramp(t, 25.9, 26.4, E.out);
      const ret = ramp(t, 27.0, 28.0, E.in);
      const flinch = ramp(t, 27.9, 28.2, E.out) * (1 - ramp(t, 29.2, 30.0));
      const herTalk = t > 24.5 && t < 25.6 ? Math.sin(t * 8) * 10 : 0;
      drawPerson(woman, { x: W.x - 30 * flinch, y: W.y, s: S, face: 1, phase: 0, stride: 0, handB: { x: -30, y: -160 }, handF: { x: 90 + herTalk, y: -210 }, headR: lerp(0, -10, flinch) + Math.sin(t) * 1.5, smile: lerp(-0.1, -0.45, flinch), lean: -8 * flinch });
      const shake = cross > 0 && t < 28 ? Math.sin(t * 20) * 2 : 0;
      drawPerson(man, { x: M.x, y: M.y, s: S, face: -1, phase: 0, stride: 0, ...(cross > 0.5 ? CROSS : ARMS.rest()), headR: lerp(0, -10, cross) + shake, smile: lerp(0.4, -0.7, cross), lean: lerp(0, 5, cross) });
      set(angry, { opacity: f3(0.45 * cross * (1 - ramp(t, 29.8, 30.6)) * (0.8 + 0.2 * Math.sin(t * 6))) });
      const bk = ramp(t, 24.55, 24.9, E.back);
      const bx = lerp(W.x + 170, M.x - 170, send), by = 780 - Math.sin(send * Math.PI) * 50;   // por debajo del título
      set(bub.g, { opacity: f3(clamp(bk * 2) * (1 - ramp(t, 26.6, 26.9))), transform: tr(bx, by, lerp(0.4, 1, bk) * lerp(1, 0.8, send)) });
      // la burbuja se transforma en flecha que regresa hacia ella (culpándote, 29.2)
      const ax = lerp(M.x - 170, W.x + 120, ret), ay = 800 + Math.sin(ret * Math.PI) * -30;
      set(arrow, { opacity: f3(ramp(t, 26.6, 26.9) * (1 - ramp(t, 28.3, 28.6))), transform: tr(ax, ay, lerp(0.6, 1.1, ramp(t, 26.6, 27.0, E.back)), 180) });
      const hk = ramp(t, 27.95, 28.5);
      set(hit, { cx: W.x + 80, cy: 800, r: f1(90 * hk), opacity: f3((1 - hk) * (hk > 0 ? 1 : 0)) });
      badge.show(t, 21.4, 30.5);
    },
  };
}
