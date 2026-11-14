// ESCENA 10 — CONCLUSIÓN (84.9 – 103.0 s)
// «…por qué su silencio sigue ocupando tanto espacio en tu mente»: la sombra del teléfono crece en la pared.
// «Pero no necesitas una respuesta…» (96.9): deja el teléfono sobre la mesa, sale a caminar por la calle y retoma
// su día; la cámara se aleja. «TU TRANQUILIDAD NO DEPENDE DE SU RESPUESTA» (fx_data). Logo inmediato.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson } from '/ep01/src/characters.js';
import { icon } from '/ep01/src/icons.js';
import { makeRoom, makeGirl, makeLogo } from '../common.js';

export const S10 = { start: 84.9, end: 103.0 };

export function create(layer) {
  // A: habitación con la sombra del teléfono
  const A = el('g', {}, layer);
  const room = makeRoom(A);
  const shadow = el('g', { opacity: 0 }, room.back);
  el('rect', { x: -200, y: -380, width: 400, height: 760, rx: 60, fill: '#9fd3ff', opacity: 0.3 }, shadow); el('rect', { x: -160, y: -300, width: 320, height: 600, rx: 30, fill: '#9fd3ff', opacity: 0.15 }, shadow);
  const table = el('g', { transform: 'translate(800,1180)' }, room.mid);
  el('rect', { x: -110, y: -170, width: 220, height: 22, rx: 8, fill: '#f6f3ec' }, table); el('rect', { x: -90, y: -150, width: 16, height: 150, fill: '#0b1636' }, table); el('rect', { x: 74, y: -150, width: 16, height: 150, fill: '#0b1636' }, table);
  const putPhone = el('g', { opacity: 0, transform: 'translate(0,-182) scale(0.32,0.12)' }, table); icon(putPhone, 'phone');
  const girlA = makeGirl(room.mid);
  // B: calle (ella camina)
  const B = el('g', { opacity: 0 }, layer);
  const street = el('g', {}, B);
  el('rect', { x: -2000, y: -600, width: 6000, height: 2000, fill: '#ffd98a' }, street);
  for (let i = 0; i < 16; i++) { const x = -1200 + i * 320; el('rect', { x, y: 380 + (i % 3) * 60, width: 260, height: 900, fill: ['#3a5cb8', '#ff7a6b', '#2a4796'][i % 3] }, street); for (let r = 0; r < 5; r++) el('rect', { x: x + 40, y: 460 + (i % 3) * 60 + r * 140, width: 70, height: 80, fill: '#f6f3ec', opacity: 0.8 }, street); }
  el('rect', { x: -2000, y: 1180, width: 6000, height: 140, fill: '#c9cfe0' }, street);
  el('rect', { x: -2000, y: 1320, width: 6000, height: 800, fill: '#5d6178' }, street);
  [[-600], [300], [1200], [2100]].forEach(([x]) => icon(street, 'plant', { transform: `translate(${x},1160) scale(1.4)` }));
  const girlB = makeGirl(B);
  set(girlB.P.held, { opacity: 0 });
  const black = el('rect', { width: 1080, height: 1920, fill: C.navy, opacity: 0 }, layer);
  const logo = makeLogo(layer);   // por encima del fundido
  return {
    render(t, ctx) {
      const out = ramp(t, 97.6, 98.2);
      set(A, { opacity: f3(1 - out), transform: `translate(540,900) scale(${f3(lerp(1.45, 1.3, ramp(t, 85, 97)))}) translate(-600,-950)` });
      set(B, { opacity: f3(out) });
      const sh = ramp(t, 89.4, 92.9, E.inOut) * (1 - ramp(t, 96.9, 97.6));
      set(shadow, { opacity: f3(sh), transform: `translate(560,${f1(560 - sh * 60)}) scale(${f3(lerp(0.4, 1.4, sh))})` });
      // deja el teléfono (96.9) y se levanta
      const put = ramp(t, 96.6, 97.2, E.inOut);
      drawPerson(girlA.P, { x: lerp(520, 640, put), y: 1180, s: 1.3, face: 1, sit: 1 - put, phase: 0, stride: 0, handB: { x: 34, y: -246 }, handF: put > 0.5 ? { x: 120, y: -150 } : { x: 54, y: -258 }, headR: lerp(16, -4, ramp(t, 95.6, 96.9)), smile: lerp(-0.2, 0.4, ramp(t, 96.9, 97.6)) });
      set(girlA.P.held, { opacity: f3(1 - put) }); set(putPhone, { opacity: f3(put) });
      set(girlA.glow, { opacity: f3(0.9 * (1 - put)) });
      // calle: camina con calma; la cámara se aleja
      const walk = t - 97.6, away = ramp(t, 98.0, 101.4, E.inOut);
      set(street, { transform: `translate(${f1(-walk * 180)},0)` });
      set(B, { transform: `translate(540,1000) scale(${f3(lerp(1.4, 0.95, away))}) translate(-540,-1000)` });
      drawPerson(girlB.P, { x: 540, y: 1250, s: 1.3, face: 1, phase: t * 8.5, stride: 1, handB: { x: -30, y: -150 }, handF: { x: 40, y: -150 }, headR: -6, smile: 0.7 });
      // logo inmediato tras la última palabra
      const lk = ramp(t, 101.55, 101.9, E.back);
      set(black, { opacity: f3(ramp(t, 101.45, 101.6)) });
      set(logo, { opacity: f3(clamp(lk * 2) * (1 - ramp(t, 102.7, 103.0))), transform: tr(540, 820, lerp(0.5, 1.1, lk)) });
      ctx.capHide = ramp(t, 101.45, 101.6);
    },
  };
}
