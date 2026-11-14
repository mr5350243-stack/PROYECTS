// PRUEBA DE ATENCIÓN (vídeo interactivo sin locución, 40 s). Reutiliza la cancha del episodio 01.
// 0–4.4 gancho y cuenta atrás · 4.5–19.5 juego (15 s) · 19.5 congelado: «¿cuántos pases?» (pausa para comentar)
// 23.6 respuesta · 26.2 rebobinado: ¿viste al gorila? · 29.2 antes/después: cortina y jugador que se fue
// 33.2 explicación · 36.2 llamada a comentar y compartir · 39.4–40 regreso al primer fotograma (bucle).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { makeGame, proj } from '/ep01/src/court.js';

export const PLAY = { a: 4.5, b: 19.5 };
const OPTS = { t0: 4.5, trail: false, curtain: true,
  gorilla: { enter: 8.3, center: 10.6, resume: 11.4, exit: 13.7, uFrom: 1.45, uStop: 0.02, uTo: -1.5, v: 0.47 },
  leave: { team: 1, i: 1, s: 12.6, e: 15.2 } };
const curtainK = (gt) => ramp(gt, 9.5, 16.0, E.inOut);
const YEL = '#ffc93c', WH = '#f6f3ec', CO = '#ff7a6b', RD = '#b3273a';

function txt(parent, s, size, fill, opts = {}) {
  const t = el('text', { x: 0, y: 0, 'font-size': size, 'font-weight': 900, fill, 'text-anchor': 'middle', stroke: C.ink, 'stroke-width': size * 0.12, 'paint-order': 'stroke', 'stroke-linejoin': 'round', 'letter-spacing': -size * 0.015, ...opts }, parent);
  t.textContent = s; return t;
}
function pill(parent, s, size, bg, fg) {
  const g = el('g', {}, parent);
  const t = el('text', { x: 0, y: size * 0.35, 'font-size': size, 'font-weight': 900, fill: fg, 'text-anchor': 'middle', 'letter-spacing': 2 }, g); t.textContent = s;
  const w = t.getComputedTextLength() + size * 1.6;
  g.insertBefore(el('rect', { x: -w / 2, y: -size * 0.95, width: w, height: size * 1.9, rx: size * 0.95, fill: bg }), t);
  return g;
}
// aparición con rebote: k = 0..1
const pop = (g, k, x, y, s = 1, r = 0) => set(g, { opacity: f3(clamp(k * 2)), transform: tr(x, y + 30 * (1 - k), lerp(0.4, s, k), r) });

export function create(layer) {
  const cam = el('g', {}, layer);
  const game = makeGame(cam, OPTS);
  // respuesta correcta calculada a partir de la propia animación
  const n0 = game.render(PLAY.a).whiteCount, n1 = game.render(PLAY.b).whiteCount;
  const ANSWER = n1 - n0;
  const dim = el('rect', { width: 1080, height: 1920, fill: C.ink, opacity: 0 }, layer);
  const scan = el('g', { opacity: 0 }, layer);
  for (let i = 0; i < 60; i++) el('rect', { x: 0, y: i * 32, width: 1080, height: 6, fill: '#9fd3ff', opacity: 0.2 }, scan);
  const ring = el('circle', { r: 0, fill: 'none', stroke: YEL, 'stroke-width': 12 }, layer);
  // paneles antes / después
  const panels = [6.0, 19.2].map((gt, i) => {
    const g = el('g', { opacity: 0 }, layer);
    const cid = `vp${i}`;
    el('clipPath', { id: cid }, g).appendChild(el('rect', { x: 60, y: 0, width: 960, height: 560, rx: 24 }));
    const inner = el('g', { 'clip-path': `url(#${cid})` }, g);
    const gg = makeGame(el('g', { transform: 'translate(216,0) scale(0.6) translate(0,-250)' }, inner), OPTS);
    gg.render(gt, { curtain: curtainK(gt) });
    el('rect', { x: 60, y: 0, width: 960, height: 560, rx: 24, fill: 'none', stroke: WH, 'stroke-width': 6 }, g);
    const lab = pill(g, i ? 'DESPUÉS' : 'ANTES', 30, i ? YEL : WH, C.ink); set(lab, { transform: 'translate(190,50)' });
    const c1 = el('ellipse', { cx: 540, cy: 108, rx: 0, ry: 0, fill: 'none', stroke: YEL, 'stroke-width': 9 }, g);   // cortina
    // posición del jugador que se va (equipo oscuro, n.º 5) en el instante «antes»
    const pl = game.render(6.0).people.find(p => p.team === 1 && p.i === 1);
    const px = 216 + pl.x * 0.6, py = (pl.y - 170 * pl.s - 250) * 0.6;
    const c2 = el('ellipse', { cx: f1(px), cy: f1(py), rx: 0, ry: 0, fill: 'none', stroke: CO, 'stroke-width': 9 }, g);
    return { g, c1, c2 };
  });
  game.render(0);
  // textos
  const T = el('g', {}, layer);
  const h1 = pill(T, 'PRUEBA DE ATENCIÓN', 34, YEL, C.ink);
  const h2 = txt(T, 'CUENTA LOS PASES', 92, WH), h3 = txt(T, 'DEL EQUIPO BLANCO', 84, YEL);
  const h4 = pill(T, 'NO PESTAÑEES', 30, C.ink, WH);
  const cd = ['3', '2', '1', '¡YA!'].map(s => txt(T, s, 300, YEL));
  const bar = el('g', { opacity: 0 }, T);
  el('rect', { x: 140, y: 196, width: 800, height: 18, rx: 9, fill: C.ink, opacity: 0.7 }, bar);
  const barFill = el('rect', { x: 140, y: 196, width: 800, height: 18, rx: 9, fill: YEL }, bar);
  const tag = pill(bar, 'EQUIPO BLANCO · CUENTA', 28, C.ink, WH); set(tag, { transform: 'translate(540,140)' });
  const q1 = txt(T, '¿CUÁNTOS PASES', 96, WH), q2 = txt(T, 'CONTASTE?', 136, YEL);
  const q3 = pill(T, 'ESCRÍBELO EN LOS COMENTARIOS', 32, CO, C.ink), q4 = txt(T, 'ANTES DE SEGUIR', 56, WH);
  const pauseBar = el('rect', { x: 240, y: 1120, width: 600, height: 16, rx: 8, fill: CO }, T);
  const a1 = txt(T, 'RESPUESTA', 70, WH), a2 = txt(T, String(ANSWER), 340, YEL), a3 = txt(T, 'PASES', 90, WH), a4 = pill(T, '¿ACERTASTE?', 34, C.ink, WH);
  const g1 = txt(T, 'PERO…', 80, WH), g2 = txt(T, '¿VISTE AL GORILA?', 92, YEL);
  const c1 = txt(T, '¿Y ESTO?', 120, YEL), c2 = pill(T, 'LA CORTINA CAMBIÓ DE COLOR', 30, YEL, C.ink), c3 = pill(T, 'UN JUGADOR SE FUE', 30, CO, C.ink);
  const e1 = txt(T, 'TU CEREBRO FILTRA', 84, WH), e2 = txt(T, 'LO QUE NO BUSCA', 84, YEL), e3 = pill(T, 'CEGUERA POR FALTA DE ATENCIÓN', 32, CO, C.ink);
  const e4 = el('text', { x: 540, y: 1180, 'font-size': 26, 'font-weight': 800, fill: '#a9b3cf', 'text-anchor': 'middle' }, T); e4.textContent = 'Recreación inspirada en los experimentos de Simons y Chabris';
  const k1 = txt(T, 'COMENTA', 120, YEL);
  const k2 = [['1', '¿CUÁNTOS PASES?'], ['2', '¿VISTE AL GORILA?'], ['3', '¿VISTE LA CORTINA?']].map(([n, s]) => { const g = el('g', {}, T); el('circle', { cx: -290, cy: 0, r: 36, fill: YEL }, g); el('text', { x: -290, y: 15, 'font-size': 44, 'font-weight': 900, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = n; el('text', { x: -230, y: 18, 'font-size': 52, 'font-weight': 900, fill: WH }, g).textContent = s; return g; });
  const k3 = pill(T, 'ENVÍASELO A QUIEN DICE QUE LO VE TODO', 28, CO, C.ink);
  const brand = el('g', {}, T);
  el('rect', { x: -40, y: -40, width: 80, height: 80, rx: 20, fill: C.orange }, brand);
  el('text', { x: 0, y: 24, 'font-size': 64, 'font-weight': 900, fill: '#fff', 'text-anchor': 'middle' }, brand).textContent = '?';
  el('text', { x: 60, y: -4, 'font-size': 24, 'font-weight': 800, fill: WH, 'letter-spacing': 5 }, brand).textContent = 'DETRÁS DEL';
  el('text', { x: 58, y: 34, 'font-size': 44, 'font-weight': 900, fill: YEL }, brand).textContent = 'PORQUÉ';
  const flash = el('rect', { width: 1080, height: 1920, fill: '#fff', opacity: 0 }, layer);
  const all = [h1, h2, h3, h4, ...cd, q1, q2, q3, q4, pauseBar, a1, a2, a3, a4, g1, g2, c1, c2, c3, e1, e2, e3, e4, k1, ...k2, k3, brand];

  return {
    render(t, ctx) {
      all.forEach(g => set(g, { opacity: 0 }));
      // reloj del partido: juego → congelado → rebobinado hasta el gorila
      let gt = Math.min(t, PLAY.b);
      if (t >= 26.2 && t < 29.2) gt = lerp(PLAY.b, 10.7, ramp(t, 26.2, 26.9, E.inOut));
      const r = game.render(gt, { curtain: curtainK(gt) });
      // cámara: muy ligera respiración durante el juego; acercamiento al gorila en el rebobinado
      const gz = ramp(t, 26.9, 27.6, E.inOut) * (1 - ramp(t, 28.9, 29.2));
      const gp = r.gor && r.gor.visible ? { x: r.gor.x, y: r.gor.y - 190 * r.gor.s } : { x: 540, y: 1100 };
      set(cam, { transform: `translate(${f1(lerp(540, 540, gz))},${f1(lerp(960, 900, gz))}) scale(${f3(1 + 0.4 * gz)}) translate(${f1(-lerp(540, gp.x, gz))},${f1(-lerp(960, gp.y, gz))})` });
      // oscurecido de fondo según la fase
      const dimK = t < 4.4 ? 0.62 : t < 19.5 ? 0 : t < 26.2 ? 0.7 : t < 29.2 ? 0.15 : 0.82;
      set(dim, { opacity: f3(t < 4.4 ? lerp(0.62, 0, ramp(t, 4.2, 4.5)) : (t < 19.5 ? 0 : lerp(0.15, dimK, ramp(t, t < 26.2 ? 19.5 : t < 29.2 ? 26.2 : 29.2, (t < 26.2 ? 19.5 : t < 29.2 ? 26.2 : 29.2) + 0.25)))) });
      if (t > 39.4) set(dim, { opacity: f3(lerp(0.82, 0.62, ramp(t, 39.4, 40))) });
      set(flash, { opacity: f3(0.5 * (1 - ramp(t, 19.5, 19.8)) * (t >= 19.5 ? 1 : 0) + 0.35 * (1 - ramp(t, 4.45, 4.75)) * (t >= 4.45 ? 1 : 0) * (t < 5 ? 1 : 0)) });
      // 0–4.4: gancho y cuenta atrás
      if (t < 4.6 || t > 39.4) {
        const L = t > 39.4 ? 1 : 0;
        pop(h1, L || ramp(t, 0.0, 0.3, E.back), 540, 330); pop(h2, L || ramp(t, 0.25, 0.6, E.back), 540, 520, 1, -2); pop(h3, L || ramp(t, 0.6, 0.95, E.back), 540, 630, 1, -2);
        pop(h4, L || ramp(t, 1.2, 1.5, E.back), 540, 740);
        const out = t > 39.4 ? 0 : ramp(t, 2.4, 2.6);
        [h1, h2, h3, h4].forEach(g => set(g, { opacity: f3((+g.getAttribute('opacity')) * (1 - out)) }));
        cd.forEach((g, i) => { const s = 2.5 + i * 0.6, k = ramp(t, s, s + 0.2, E.back), o = ramp(t, s + 0.45, s + 0.6); if (t < 4.6) { pop(g, k, 540, 1060, 1, 0); set(g, { opacity: f3(clamp(k * 2) * (1 - o)) }); } });
      }
      // 4.5–19.5: temporizador del juego
      const pl = ramp(t, 4.4, 4.7) * (1 - ramp(t, 19.4, 19.6));
      set(bar, { opacity: f3(pl) }); set(barFill, { width: f1(800 * (1 - ramp(t, PLAY.a, PLAY.b))) });
      // 19.5–23.5: ¿cuántos pases? (pausa para comentar)
      if (t > 19.5 && t < 23.7) {
        const o = ramp(t, 23.3, 23.6);
        pop(q1, ramp(t, 19.6, 19.95, E.back), 540, 620, 1, -2); pop(q2, ramp(t, 19.8, 20.15, E.back), 540, 770, 1, -2);
        pop(q3, ramp(t, 20.3, 20.6, E.back), 540, 930); pop(q4, ramp(t, 20.5, 20.8, E.back), 540, 1030);
        [q1, q2, q3, q4].forEach(g => set(g, { opacity: f3((+g.getAttribute('opacity')) * (1 - o)) }));
        set(pauseBar, { opacity: f3(ramp(t, 20.6, 20.8) * (1 - o)), width: f1(600 * (1 - ramp(t, 20.7, 23.3))), x: f1(240 + 300 * ramp(t, 20.7, 23.3)) });
      }
      // 23.6–26.1: respuesta
      if (t > 23.6 && t < 26.2) {
        const o = ramp(t, 25.9, 26.15);
        pop(a1, ramp(t, 23.6, 23.9, E.back), 540, 560); pop(a2, ramp(t, 23.8, 24.2, E.back), 540, 860, 1, -3); pop(a3, ramp(t, 24.0, 24.3, E.back), 540, 980); pop(a4, ramp(t, 24.9, 25.2, E.back), 540, 1110);
        [a1, a2, a3, a4].forEach(g => set(g, { opacity: f3((+g.getAttribute('opacity')) * (1 - o)) }));
      }
      // 26.2–29.1: rebobinado → el gorila
      set(scan, { opacity: f3(0.8 * ramp(t, 26.2, 26.3) * (1 - ramp(t, 26.8, 26.95))) });
      const rk = ramp(t, 27.4, 27.8, E.back) * (1 - ramp(t, 28.9, 29.15));
      const gs = { x: 540 + (gp.x - lerp(540, gp.x, gz)) * (1 + 0.4 * gz), y: lerp(960, 900, gz) + (gp.y - lerp(960, gp.y, gz)) * (1 + 0.4 * gz) };
      set(ring, { cx: f1(gs.x), cy: f1(gs.y), r: f1(230 * rk), opacity: f3(clamp(rk * 2)) });
      if (t > 26.9 && t < 29.2) { const o = ramp(t, 28.9, 29.15); pop(g1, ramp(t, 26.9, 27.2, E.back), 540, 300); pop(g2, ramp(t, 27.1, 27.45, E.back), 540, 410, 1, -2); [g1, g2].forEach(g => set(g, { opacity: f3((+g.getAttribute('opacity')) * (1 - o)) })); }
      // 29.2–33.0: antes / después
      panels.forEach((P, i) => {
        const k = ramp(t, 29.4 + i * 0.25, 29.8 + i * 0.25, E.backSoft) * (1 - ramp(t, 32.9, 33.2));
        set(P.g, { opacity: f3(clamp(k * 2)), transform: `translate(0,${f1([440, 1030][i] + 40 * (1 - k))})` });
        const m1 = ramp(t, 30.6, 31.0, E.back), m2 = ramp(t, 31.4, 31.8, E.back);
        set(P.c1, { rx: f1(280 * m1), ry: f1(120 * m1) }); set(P.c2, { rx: f1(50 * m2), ry: f1(95 * m2) });
      });
      if (t > 29.2 && t < 33.2) { const o = ramp(t, 32.9, 33.15); pop(c1, ramp(t, 29.2, 29.5, E.back), 540, 330, 1, -3); pop(c2, ramp(t, 30.7, 31.0, E.back), 540, 1660); pop(c3, ramp(t, 31.5, 31.8, E.back), 540, 1750); [c1, c2, c3].forEach(g => set(g, { opacity: f3((+g.getAttribute('opacity')) * (1 - o)) })); }
      // 33.2–36.0: explicación
      if (t > 33.2 && t < 36.2) { const o = ramp(t, 35.9, 36.15); pop(e1, ramp(t, 33.3, 33.6, E.back), 540, 700, 1, -2); pop(e2, ramp(t, 33.6, 33.9, E.back), 540, 810, 1, -2); pop(e3, ramp(t, 34.3, 34.6, E.back), 540, 960); set(e4, { opacity: f3(ramp(t, 34.6, 34.9) * (1 - o)) }); [e1, e2, e3].forEach(g => set(g, { opacity: f3((+g.getAttribute('opacity')) * (1 - o)) })); }
      // 36.2–39.4: comenta y comparte
      if (t > 36.2 && t < 39.6) {
        const o = ramp(t, 39.2, 39.5);
        pop(k1, ramp(t, 36.2, 36.5, E.back), 540, 470, 1, -3);
        k2.forEach((g, i) => { pop(g, ramp(t, 36.6 + i * 0.25, 36.9 + i * 0.25, E.back), 600, 640 + i * 120); });
        pop(k3, ramp(t, 37.6, 37.9, E.back), 540, 1060); pop(brand, ramp(t, 38.0, 38.3, E.back), 470, 1220);
        [k1, ...k2, k3, brand].forEach(g => set(g, { opacity: f3((+g.getAttribute('opacity')) * (1 - o)) }));
      }
      ctx.answer = ANSWER;
    },
  };
}
