// Cancha + partido de la prueba aprobada como componente reutilizable (escenas 01, 02, 03, 04 y 10).
// makeGame(parent, opts) → { g, proj, render(t, extra) }
//   opts.t0: inicio de los pases · opts.gorilla: { enter, center, resume, exit, uFrom, uStop, uTo } o null
//   opts.trail: estela amarilla del balón blanco · opts.curtain: cortina de fondo (escena 10)
import { el, set, clamp, lerp, ramp, E, C, f1, f3 } from './lib.js';
import { makePerson, drawPerson, makeGorilla, drawGorilla, SKIN, HAIR } from './characters.js';

const HOR = 640;
export function proj(u, v) {
  const y = HOR + 40 + Math.pow(v, 1.15) * 1080;
  const half = lerp(330, 760, v);
  return { x: 540 + u * half, y, s: lerp(0.58, 1.18, v) };
}

function drawCourtBG(court, opts) {
  // márgenes amplios para que la cancha no muestre bordes al escalarla
  el('rect', { x: -1400, y: -1400, width: 3880, height: HOR + 1460, fill: '#0c1a44' }, court);
  el('rect', { x: -1400, y: HOR + 40, width: 3880, height: 2600, fill: '#f6c47e' }, court);
  el('rect', { width: 1080, height: HOR + 60, fill: 'url(#wall)' }, court);
  for (let r = 0; r < 4; r++) {
    const y = 300 + r * 82;
    el('rect', { x: 0, y, width: 1080, height: 70, fill: r % 2 ? '#162a63' : '#13255a' }, court);
    for (let i = 0; i < 16; i++) {
      const x = 30 + i * 68 + (r % 2) * 34;
      const c = ['#24408a', '#2c4c9e', '#1f3a80'][(i + r) % 3];
      el('circle', { cx: x, cy: y + 18, r: 17, fill: c }, court);
      el('rect', { x: x - 24, y: y + 34, width: 48, height: 36, rx: 16, fill: c }, court);
    }
  }
  let curtain = null;
  if (opts.curtain) {  // cortina detrás de la canasta (cambia de color en la escena 10)
    curtain = el('g', {}, court);
    const c1 = el('path', { d: 'M 120 250 L 960 250 L 960 612 L 120 612 Z', fill: '#c0392b' }, curtain);
    for (let i = 0; i < 14; i++) el('rect', { x: 130 + i * 60, y: 250, width: 22, height: 362, fill: '#000', opacity: 0.12 }, curtain);
    el('rect', { x: 110, y: 236, width: 860, height: 22, rx: 11, fill: '#0a1638' }, curtain);
    curtain.fill = c1;
  }
  el('rect', { x: 0, y: 610, width: 1080, height: 40, fill: '#0a1638' }, court);
  for (let i = 0; i < 9; i++) el('rect', { x: 20 + i * 120, y: 622, width: 70, height: 16, rx: 8, fill: i % 2 ? C.orange : C.yellow, opacity: 0.55 }, court);
  const a = proj(-1.25, 0), b = proj(1.25, 0);
  el('path', { d: `M ${a.x - 300} ${HOR + 40} L ${b.x + 300} ${HOR + 40} L 1500 1920 L -420 1920 Z`, fill: 'url(#floor)' }, court);
  for (let i = -10; i <= 10; i++) {
    const p0 = proj(i * 0.16, 0), p1 = proj(i * 0.16, 1.3);
    el('line', { x1: p0.x, y1: p0.y, x2: p1.x, y2: p1.y, stroke: '#d08a40', 'stroke-width': 2, opacity: 0.35 }, court);
  }
  const line = (pts) => el('path', { d: 'M ' + pts.map(p => `${f1(p.x)} ${f1(p.y)}`).join(' L '), fill: 'none', stroke: '#fff7ea', 'stroke-width': 7, opacity: 0.9, 'stroke-linejoin': 'round' }, court);
  line([proj(-1, 0.02), proj(1, 0.02)]);
  line([proj(-1, 0.02), proj(-1, 1.3)]); line([proj(1, 0.02), proj(1, 1.3)]);
  line([proj(-0.36, 0.02), proj(-0.36, 0.42), proj(0.36, 0.42), proj(0.36, 0.02)]);
  const arc = []; for (let i = 0; i <= 24; i++) { const an = Math.PI * i / 24; arc.push(proj(Math.cos(an) * 0.36, 0.42 + Math.sin(an) * 0.2)); }
  line(arc);
  el('rect', { x: 470, y: 470, width: 140, height: 92, rx: 6, fill: '#f6f3ec', opacity: 0.95 }, court);
  el('rect', { x: 512, y: 512, width: 56, height: 40, fill: 'none', stroke: C.orange, 'stroke-width': 5 }, court);
  el('ellipse', { cx: 540, cy: 566, rx: 34, ry: 7, fill: 'none', stroke: C.orange, 'stroke-width': 6 }, court);
  el('path', { d: 'M 508 568 L 520 610 M 540 572 L 540 612 M 572 568 L 560 610', stroke: '#fff', 'stroke-width': 3, opacity: 0.8 }, court);
  return { curtain };
}

const TEAM = [
  { shirt: C.white, pants: '#1d2b5c', base: [[-0.62, 0.30], [0.55, 0.22], [0.05, 0.66]], nums: ['3', '7', '9'] },
  { shirt: '#1f2340', pants: '#11142a', base: [[-0.15, 0.20], [0.62, 0.58], [-0.6, 0.62]], nums: ['2', '5', '8'] },
];

export function makeGame(parent, opts = {}) {
  const g = el('g', {}, parent);
  const court = el('g', {}, g), actors = el('g', {}, g), ballsFx = el('g', {}, g);
  const bg = drawCourtBG(court, opts);
  const people = [];
  TEAM.forEach((tm, ti) => tm.base.forEach((b, i) => {
    const k = ti * 3 + i;
    people.push({ P: makePerson(actors, { shirt: tm.shirt, pants: tm.pants, skin: SKIN[k], hair: HAIR[k], style: k % 3 }), team: ti, i, b, num: tm.nums[i], ph: k * 1.7 });
  }));
  const gor = opts.gorilla ? makeGorilla(actors) : null;
  const T0 = opts.t0 ?? 0;
  function personPos(pp, t) {
    const w = 0.55 + pp.team * 0.12;
    let u = pp.b[0] + 0.13 * Math.sin(w * t + pp.ph), v = pp.b[1] + 0.07 * Math.sin(w * 1.3 * t + pp.ph * 1.4);
    if (opts.leave && pp.team === opts.leave.team && pp.i === opts.leave.i) u += -1.9 * ramp(t, opts.leave.s, opts.leave.e, E.inOut);
    return { u, v };
  }
  function passes(team) {
    const order = team === 0 ? [0, 1, 2, 0, 2, 1, 0, 1] : [0, 2, 1, 0, 1, 2, 0, 2];
    const out = []; let t = T0 + (team === 0 ? 0.05 : 0.35); const hold = 0.26, fly = 0.44;
    for (let i = 0; i < (opts.nPasses || 40); i++) {
      const from = order[i % order.length], to = order[(i + 1) % order.length];
      out.push({ from, to, t0: t + hold, t1: t + hold + fly, bounce: (i + team) % 3 === 1 });
      t += hold + fly + (i % 2 ? 0.08 : 0.0);
    }
    return out;
  }
  const PASSES = [passes(0), passes(1)];
  const ballEls = [0, 1].map(() => {
    const bg_ = el('g', {}, ballsFx);
    const trail = el('path', { fill: 'none', stroke: C.yellow, 'stroke-width': 6, 'stroke-dasharray': '2 16', 'stroke-linecap': 'round', opacity: 0 }, bg_);
    const sh = el('ellipse', { rx: 22, ry: 6, fill: '#7a4316', opacity: 0.4 }, bg_);
    const b = el('g', {}, bg_);
    el('circle', { r: 26, fill: 'url(#ballGrad)' }, b);
    el('path', { d: 'M -26 0 L 26 0 M 0 -26 L 0 26 M -18 -18 Q 0 0 -18 18 M 18 -18 Q 0 0 18 18', stroke: '#8a2f0c', 'stroke-width': 2.5, fill: 'none' }, b);
    return { g: bg_, trail, sh, b };
  });
  function chestOf(pp, t) { const q = personPos(pp, t), p = proj(q.u, q.v); return { x: p.x, y: p.y - 228 * p.s, s: p.s, floor: p.y }; }
  function ballState(team, t) {
    const list = PASSES[team], tp = people.filter(p => p.team === team);
    for (let i = 0; i < list.length; i++) {
      const ps = list[i];
      if (t < ps.t0) return { holder: ps.from, pos: chestOf(tp[ps.from], t), flying: false, count: i };
      if (t < ps.t1) {
        const k = (t - ps.t0) / (ps.t1 - ps.t0);
        const a = chestOf(tp[ps.from], ps.t0), b = chestOf(tp[ps.to], ps.t1);
        let x = lerp(a.x, b.x, k), y = lerp(a.y, b.y, k); const s = lerp(a.s, b.s, k), fl = lerp(a.floor, b.floor, k);
        if (ps.bounce) { const kk = k < 0.5 ? k / 0.5 : (1 - k) / 0.5; y = lerp(y, fl - 24 * s, kk * (2 - kk)); } else y -= Math.sin(k * Math.PI) * 70 * s;
        return { holder: -1, from: ps.from, to: ps.to, k, pos: { x, y, s, floor: fl }, flying: true, count: i, a, b, bounce: ps.bounce };
      }
    }
    const last = list[list.length - 1];
    return { holder: last.to, pos: chestOf(tp[last.to], t), flying: false, count: list.length };
  }
  function gorillaState(t) {
    const G = opts.gorilla, v = G.v ?? 0.44;
    const k1 = ramp(t, G.enter, G.center), k2 = ramp(t, G.resume, G.exit);
    let u = lerp(G.uFrom ?? 1.45, G.uStop ?? 0.02, k1); if (t > G.resume) u = lerp(G.uStop ?? 0.02, G.uTo ?? -1.5, k2);
    const walking = (t > G.enter && t < G.center) || (t > G.resume && t < G.exit);
    const thump = G.thump !== false && t > G.center + 0.1 && t < G.center + 0.7;
    return { u, v, walking, thump, visible: t > G.enter - 0.1 && t < G.exit + 0.1 };
  }

  function render(t, extra = {}) {
    const st = [0, 1].map(team => ballState(team, t));
    const items = [];
    people.forEach(pp => {
      const q = personPos(pp, t), q2 = personPos(pp, t + 0.05);
      const speed = Math.hypot(q2.u - q.u, q2.v - q.v) / 0.05;
      const bs = st[pp.team];
      let handB = { x: -36, y: -150 }, handF = { x: 40, y: -150 }, lean = 0;
      const me = pp.i, myp = proj(q.u, q.v);
      let face = bs.pos.x >= myp.x ? 1 : -1;
      if (opts.leave && pp.team === opts.leave.team && pp.i === opts.leave.i && t > opts.leave.s) face = -1;
      if (bs.holder === me) { handB = { x: 20, y: -232 }; handF = { x: 52, y: -226 }; }
      if (bs.flying && bs.from === me && bs.k < 0.35) { const e = bs.k / 0.35; handB = { x: lerp(20, 98, e), y: lerp(-232, -250, e) }; handF = { x: lerp(52, 112, e), y: lerp(-226, -240, e) }; lean = 6 * Math.sin(e * Math.PI); }
      if (bs.flying && bs.to === me && bs.k > 0.45) { const e = (bs.k - 0.45) / 0.55; handB = { x: lerp(-30, 82, e), y: lerp(-170, -246, e) }; handF = { x: lerp(40, 96, e), y: lerp(-160, -236, e) }; }
      items.push({ v: q.v, g: pp.P.g, fn: () => drawPerson(pp.P, { x: myp.x, y: myp.y, s: myp.s, face, phase: t * 8.5 + pp.ph, stride: clamp(0.35 + speed * 4.5, 0, 1), handB, handF, num: pp.num, lean }) });
    });
    let gs = null;
    if (gor) {
      gs = gorillaState(t);
      set(gor.g, { visibility: gs.visible ? 'visible' : 'hidden' });
      items.push({ v: gs.v, g: gor.g, fn: () => {
        let handB = { x: -40, y: -110 }, handF = { x: 60, y: -100 }, headR = 0, face = -1;
        const ph = t * 5.2, c = opts.gorilla.center;
        if (gs.walking) { handB = { x: -30 + Math.sin(ph) * 40, y: -96 }; handF = { x: 50 - Math.sin(ph) * 40, y: -92 }; }
        if (gs.thump) { const b = Math.abs(Math.sin((t - c - 0.1) * Math.PI * 5)); handB = { x: 10, y: -250 + b * 30 }; handF = { x: 30, y: -246 + b * 30 }; face = 1; headR = -6; }
        if (t > c && t < opts.gorilla.resume && !gs.thump) face = 1;
        const p = proj(gs.u, gs.v);
        drawGorilla(gor, { x: p.x, y: p.y, s: p.s, face, phase: gs.walking ? ph : 0, stride: gs.walking ? 1 : 0, handB, handF, headR });
      } });
    }
    items.sort((a, b) => a.v - b.v);
    items.forEach(it => { it.fn(); actors.appendChild(it.g); });
    st.forEach((bs, team) => {
      const B = ballEls[team], p = bs.pos, x = p.x, y = bs.flying ? p.y : p.y - 4 * p.s;
      set(B.b, { transform: `translate(${f1(x)},${f1(y)}) scale(${f3(p.s)}) rotate(${(t * 400 % 360).toFixed(0)})` });
      set(B.sh, { cx: f1(x), cy: f1(p.floor + 6 * p.s), rx: f1(22 * p.s), ry: f1(6 * p.s), opacity: bs.flying ? 0.35 : 0 });
      if (team === 0 && bs.flying && opts.trail !== false && (extra.trail ?? 1) > 0) {
        const a = bs.a, b = bs.b, pts = [];
        for (let i = 0; i <= 16; i++) {
          const k = i / 16 * bs.k; let yy = lerp(a.y, b.y, k); const xx = lerp(a.x, b.x, k), fl = lerp(a.floor, b.floor, k), s = lerp(a.s, b.s, k);
          if (bs.bounce) { const kk = k < 0.5 ? k / 0.5 : (1 - k) / 0.5; yy = lerp(yy, fl - 24 * s, kk * (2 - kk)); } else yy -= Math.sin(k * Math.PI) * 70 * s;
          pts.push(`${f1(xx)} ${f1(yy)}`);
        }
        set(B.trail, { d: 'M ' + pts.join(' L '), opacity: f3(0.85 * (extra.trail ?? 1)) });
      } else set(B.trail, { opacity: 0 });
    });
    if (bg.curtain && extra.curtain !== undefined) {
      const k = extra.curtain; // 0 rojo → 1 dorado
      const c = (a, b) => Math.round(lerp(a, b, k));
      set(bg.curtain.fill, { fill: `rgb(${c(192, 233)},${c(57, 176)},${c(43, 52)})` });
    }
    const gp = gs ? proj(gs.u, gs.v) : null;
    return { whiteCount: Math.max(0, st[0].count), gor: gs ? { ...gs, x: gp.x, y: gp.y, s: gp.s } : null, people: people.map(pp => { const q = personPos(pp, t); return { ...proj(q.u, q.v), team: pp.team, i: pp.i }; }) };
  }
  return { g, court, actors, proj, render, people };
}
