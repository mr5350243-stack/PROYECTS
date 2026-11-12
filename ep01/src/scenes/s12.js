// ESCENA 12 — CIERRE MEMORABLE (111.2 – 121.0 s)
// Volvemos al ojo del comienzo (el mosaico de la escena 11 se encoge dentro de su pupila). La pelota vuelve a botar;
// el personaje sale de detrás del ojo y esta vez, con «visto todo», el ojo se gira hacia él. Con «recuerda esto» la
// pupila se convierte en un círculo amarillo que se expande y revela «MIRAR NO SIEMPRE SIGNIFICA VER.»
// («MIRAR» entra con máscara; «VER.» se reconstruye con las piezas en que se rompió en la escena 01).
// Transición breve a la identidad «DETRÁS DEL PORQUÉ».
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr, rng } from '../lib.js';
import { makeEye } from '../eye.js';
import { makePerson, drawPerson, ARMS } from '../characters.js';

export const S12 = { start: 111.2, end: 121.0 };
const EYE = { x: 540, y: 880 };

export function create(layer) {
  for (let i = 0; i < 60; i++) el('circle', { cx: (i * 197) % 1080, cy: (i * 331) % 1920, r: 2 + (i % 3), fill: '#2a4796', opacity: 0.35 }, layer);
  const eyeCam = el('g', {}, layer);
  const guy = makePerson(eyeCam, { shirt: C.white, pants: '#1d2b5c', skin: '#e8b48c', hair: '#3b2416', style: 0, shadow: '#050b20' });
  const eye = makeEye(el('g', { transform: `translate(${EYE.x},${EYE.y})` }, eyeCam));
  const yb = el('circle', { r: 28, fill: 'url(#yball)' }, layer);
  const yPos = (t) => ({ x: 540 + 300 * Math.sin(t * 2.3 - 0.4), y: 1330 - 220 * Math.abs(Math.sin(t * 4.6)) });
  // círculo amarillo que crece desde la pupila
  const disc = el('circle', { r: 0, fill: C.yellow }, layer);
  const txt = el('g', {}, layer);
  const mk = (s, size, color, y) => { const t = el('text', { x: 540, y, 'font-size': size, 'font-weight': 900, 'text-anchor': 'middle', fill: color, 'letter-spacing': -size * 0.02 }, txt); t.textContent = s; return t; };
  el('rect', { x: -200, y: 470, width: 1480, height: 240 }, el('clipPath', { id: 's12mirar' }, txt));
  const mirarG = el('g', { 'clip-path': 'url(#s12mirar)' }, txt);
  const tMirar = mk('MIRAR', 210, C.ink, 660); mirarG.appendChild(tMirar);
  const tNo = mk('NO SIEMPRE', 100, C.ink, 800), tSig = mk('SIGNIFICA', 100, C.orange2, 915);
  const tVer = mk('VER.', 330, C.ink, 1220);
  const R = rng(11), shards = [];
  for (let i = 0; i < 46; i++) {
    const sz = 16 + R() * 34, kind = i % 3, col = [C.ink, C.orange, C.white][i % 3];
    const s = kind === 0 ? el('path', { d: `M 0 ${-sz} L ${sz * 0.9} ${sz * 0.6} L ${-sz * 0.9} ${sz * 0.6} Z`, fill: col }, txt)
      : kind === 1 ? el('rect', { x: -sz / 2, y: -sz / 2, width: sz, height: sz, rx: 3, fill: col }, txt) : el('circle', { r: sz * 0.5, fill: col }, txt);
    shards.push({ s, ox: (R() - 0.5) * 520, oy: (R() - 0.5) * 230, vx: (R() - 0.5) * 1700, vy: (R() - 0.65) * 1500, rot: (R() - 0.5) * 720, d: R() * 0.12 });
  }
  // identidad final
  const wipe = el('circle', { cx: 540, cy: 960, r: 0, fill: C.navy }, layer);
  const brand = el('g', { opacity: 0 }, layer);
  el('rect', { x: -80, y: -80, width: 160, height: 160, rx: 40, fill: C.orange }, brand);
  el('text', { x: 0, y: 46, 'font-size': 128, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle' }, brand).textContent = '?';
  el('circle', { cx: 62, cy: -62, r: 22, fill: C.yellow, stroke: C.navy, 'stroke-width': 6 }, brand);
  const b1 = el('text', { x: 0, y: 160, 'font-size': 44, 'font-weight': 800, fill: C.white, 'text-anchor': 'middle', 'letter-spacing': 10 }, brand); b1.textContent = 'DETRÁS DEL';
  const b2 = el('text', { x: 0, y: 250, 'font-size': 104, 'font-weight': 900, fill: C.yellow, 'text-anchor': 'middle' }, brand); b2.textContent = 'PORQUÉ';
  return {
    render(t, ctx) {
      const yp = yPos(t);
      // mirada: sigue la pelota… hasta la doble mirada hacia el personaje con «visto todo»
      const wx = ramp(t, 112.6, 113.5, E.inOut);
      const gx = lerp(620, 990, wx), gy = 1075;
      const take = ramp(t, 114.9, 115.15, E.out5) * (1 - ramp(t, 116.2, 116.5));
      const target = { x: lerp(yp.x, gx, take), y: lerp(yp.y, gy - 230, take) };
      const dx = target.x - EYE.x, dy = target.y - EYE.y, d = Math.hypot(dx, dy) || 1, off = Math.min(d * 0.2, 110);
      const blink = 1 - Math.max(0, Math.sin(clamp((t - 114.6) / 0.2) * Math.PI)) * 0.95;
      const wide = 1 + 0.12 * take;
      const pupilR = lerp(82, 66, ramp(t, 111.95, 112.5, E.out)) * (1 + 0.5 * ramp(t, 116.3, 116.65, E.in));
      const center = ramp(t, 116.2, 116.6, E.inOut);
      eye.render({ o: blink * Math.min(wide, 1.1), look: { x: dx / d * off * (1 - center), y: dy / d * off * 0.55 * (1 - center) }, pupilR, highlights: 1 - center });
      set(eye.pupil, { fill: t > 116.55 ? C.yellow : C.ink });
      set(yb, { cx: f1(yp.x), cy: f1(yp.y), opacity: f3(ramp(t, 112.0, 112.3) * (1 - ramp(t, 116.4, 116.6))) });
      // personaje: sale de detrás del ojo y saluda; sonríe cuando el ojo por fin lo mira
      const waving = t > 113.5 && t < 116.4;
      drawPerson(guy, { x: gx, y: gy, s: 0.8, face: waving ? -1 : 1, phase: t * 9, stride: t > 112.6 && t < 113.5 ? 1 : 0.15, ...(waving ? ARMS.wave(t) : ARMS.rest()), headR: waving ? -6 : 0, smile: take > 0.5 ? 1 : 0.5 });
      set(guy.sh, { opacity: 0.25 });
      const brth = 1 + 0.03 * Math.sin(t * 1.3) + 0.05 * ramp(t, 115, 116.6, E.inOut);
      set(eyeCam, { transform: `translate(540,880) scale(${f3(brth)}) translate(-540,-880)` });
      // la pupila → círculo amarillo que llena la pantalla
      const dk = ramp(t, 116.55, 117.3, E.inExpo);
      set(disc, { cx: EYE.x, cy: EYE.y, r: f1(dk > 0 ? lerp(66 * 1.5, 1500, dk) : 0) });
      // texto final
      const km = ramp(t, 117.25, 117.7, E.out5);
      set(tMirar, { opacity: t > 117.2 ? 1 : 0, transform: `translate(${f1(-700 * (1 - km))},0)`, 'letter-spacing': f1(lerp(40, -4, km)) });
      const kn = ramp(t, 118.1, 118.5, E.back), ks = ramp(t, 118.6, 119.0, E.back);
      set(tNo, { opacity: f3(clamp(kn * 2)), transform: `translate(0,${f1(30 * (1 - kn))})` });
      set(tSig, { opacity: f3(clamp(ks * 2)), transform: `translate(540,880) scale(${f3(lerp(0.6, 1, ks))}) rotate(${f1(lerp(-6, -2, ks))}) translate(-540,-880)` });
      shards.forEach(s => {
        const k = 1 - clamp((t - 118.75 - s.d) / 0.55);          // las piezas vuelven a su sitio
        const kk = 1 - Math.pow(1 - k, 2);
        const x = 540 + s.ox + s.vx * kk * 0.55, y = 1120 + s.oy + s.vy * kk * 0.55 + 300 * k * k;
        set(s.s, { transform: tr(x, y, lerp(1, 2.6, k), s.rot * k), opacity: f3(t < 118.75 ? 0 : (t < 119.4 ? 1 : 1 - ramp(t, 119.4, 119.55))) });
      });
      const kv = ramp(t, 119.32, 119.7, E.back);
      set(tVer, { opacity: f3(clamp(kv * 3)), transform: `translate(540,1110) scale(${f3(lerp(0.5, 1, kv))}) rotate(${f1(lerp(-10, -3, kv))}) translate(-540,-1110)` });
      set(txt, { opacity: f3(1 - ramp(t, 120.0, 120.2)) });
      // identidad
      set(wipe, { r: f1(1500 * ramp(t, 119.85, 120.3, E.inOut)) });
      const bk = ramp(t, 120.15, 120.6, E.back);
      set(brand, { opacity: f3(clamp(bk * 2) * (1 - ramp(t, 120.75, 121.0))), transform: tr(540, 860, lerp(0.5, 1.15, bk), lerp(-8, 0, bk)) });
      ctx.capY = t > 117.0 ? 1520 : 1440;
    },
  };
}
