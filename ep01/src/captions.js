// Sistema tipográfico editorial reutilizable.
//   TIPO E · CLEAN CAPTIONS   — grupos de palabras (máx. 2 líneas) desde la temporización real; resaltado selectivo.
//   TIPO A · WORD IMPACT      — palabra con escala, ligera rotación y rebote controlado.
//   TIPO B · OBJECT MORPH     — una palabra se transforma en un objeto ilustrado (registro MORPHS).
//   TIPO C · NUMBER REVEAL    — número que se construye + gráfico circular que se completa.
//   TIPO D · TRACKING         — frase anclada a un elemento de la escena con su perspectiva 2.5D.
// Tiempos y textos viven en captions_data.js (generado) y fx_data.js (editable); las escenas solo publican anclas.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr, win } from './lib.js';

const STROKE = { stroke: C.ink, 'paint-order': 'stroke', 'stroke-linejoin': 'round' };

// ---------------------------------------------------------------- TIPO E
// Rótulos editoriales: cada línea entra sobre una banda inclinada azul oscuro (con canto naranja) que se despliega;
// el texto sube desde una máscara. Las palabras clave son más grandes y, al pronunciarse, un marcador amarillo
// las barre (el texto pasa a azul). Salida: el texto sube y la banda se recoge. Inclinación alterna por grupo.
export function makeClean(parent, CAPS) {
  const root = el('g', { id: 'clean' }, parent);
  const SIZE = 54, KSIZE = 68, LH = 104, SKEW = -9, MAXW = 940;
  CAPS.forEach((c, gi) => {
    c.g = el('g', { visibility: 'hidden' }, root);
    c.words = []; c.idx = gi;
    c.lineEls = c.lines.map((ln, li) => {
      const lr = el('g', {}, c.g);
      const strip = el('path', { fill: C.ink, opacity: 0.9, filter: 'url(#capShadow)' }, lr);
      const edge = el('path', { fill: gi % 3 === 2 ? C.yellow : C.orange }, lr);
      const cid = `capclip${gi}_${li}`;
      const clipR = el('rect', {}, el('clipPath', { id: cid }, lr));
      const mask = el('g', { 'clip-path': `url(#${cid})` }, lr);
      const move = el('g', {}, mask);
      const hls = el('g', {}, move);
      const t = el('text', { x: 0, y: 0, 'text-anchor': 'middle', 'font-weight': 800, 'font-size': SIZE, fill: C.white, 'letter-spacing': 0.5 }, move);
      const words = [];
      ln.forEach(([w, ws, key], wi) => {
        if (wi) { const sp = el('tspan', { 'font-size': SIZE }, t); sp.textContent = ' '; }
        const sp = el('tspan', key ? { 'font-size': KSIZE, 'font-weight': 900, fill: C.yellow } : {}, t);
        sp.textContent = w.replace(/ /g, ' ').toUpperCase();
        const W_ = { sp, ws, key, text: sp.textContent };
        words.push(W_); c.words.push(W_);
      });
      return { lr, strip, edge, clipR, move, hls, t, words, hasKey: ln.some(x => x[2]) };
    });
  });
  // medidas (una vez cargadas las fuentes)
  function layout(c) {
    c.lineEls.forEach((L, li) => {
      let w = L.t.getComputedTextLength();
      L.fit = Math.min(1, MAXW / (w + 80)); 
      const h = L.hasKey ? 96 : 80, pad = L.hasKey ? 56 : 40;
      L.w = w + pad * 2; L.h = h;
      const sk = Math.tan(SKEW * Math.PI / 180) * h;
      const x0 = -L.w / 2, top = -h * 0.7, bot = h * 0.3;
      L.shape = { x0, top, bot, sk };
      set(L.strip, { d: `M ${f1(x0 - sk / 2)} ${f1(top)} L ${f1(x0 + L.w - sk / 2)} ${f1(top)} L ${f1(x0 + L.w + sk / 2)} ${f1(bot)} L ${f1(x0 + sk / 2)} ${f1(bot)} Z` });
      set(L.edge, { d: `M ${f1(x0 - sk / 2)} ${f1(top)} L ${f1(x0 - sk / 2 + 14)} ${f1(top)} L ${f1(x0 + sk / 2 + 14)} ${f1(bot)} L ${f1(x0 + sk / 2)} ${f1(bot)} Z` });
      set(L.clipR, { x: f1(x0 - 40), y: f1(top + 4), width: f1(L.w + 80), height: f1(h - 8) });
      // marcadores de las palabras clave
      let ci = 0;
      L.words.forEach(W_ => {
        const n = W_.sp.textContent.length;
        if (W_.key) {
          const xa = L.t.getStartPositionOfChar(ci).x, xb = L.t.getEndPositionOfChar(ci + n - 1).x;
          W_.hl = el('rect', { x: f1(xa - 8), y: f1(-KSIZE * 0.82), width: f1(xb - xa + 16), height: f1(KSIZE * 1.0), rx: 6, fill: C.yellow, transform: `skewX(${SKEW})` }, L.hls);
          W_.hx = xa - 8; W_.hw = xb - xa + 16;
        }
        ci += n + 1;
      });
    });
    c.laid = true;
  }
  function render(t, ctx = {}) {
    const y0 = ctx.capY ?? 1440, hide = ctx.capHide ?? 0;
    CAPS.forEach(c => {
      const on = t >= c.s && t < c.e && hide < 1;
      set(c.g, { visibility: on ? 'visible' : 'hidden' });
      if (!on) return;
      if (!c.laid) layout(c);
      const n = c.lineEls.length;
      const rot = (c.idx % 2 ? 1.3 : -1.6) * (1 - 0.4 * ramp(t, c.s, c.e));
      const fy = Math.sin(t * 1.7 + c.idx) * 3;
      set(c.g, { opacity: f3(1 - hide), transform: `translate(540,${f1(y0 + fy)}) rotate(${f1(rot)})` });
      const ke = ramp(t, c.e - 0.17, c.e - 0.01, E.in);
      c.lineEls.forEach((L, li) => {
        const d = li * 0.08, off = n > 1 ? (li ? 26 : -26) : 0;
        const ly = (li - (n - 1) / 2) * LH + 24;
        set(L.lr, { transform: `translate(${f1(off)},${f1(ly)}) scale(${f3(L.fit)})` });
        // banda: se despliega desde la izquierda y se recoge hacia la derecha
        const k1 = ramp(t, c.s + d, c.s + d + 0.22, E.out5);
        const sx = k1 * (1 - ke), ox = ke > 0 ? L.shape.x0 + L.w : L.shape.x0;
        const st = `translate(${f1(ox)},0) scale(${f3(Math.max(0.001, sx))},1) translate(${f1(-ox)},0)`;
        set(L.strip, { transform: st }); set(L.edge, { transform: st, opacity: f3(k1 * (1 - ke)) });
        // texto: sube desde la máscara; al salir sigue subiendo
        const k2 = ramp(t, c.s + d + 0.03, c.s + d + 0.32, E.out5);
        set(L.move, { transform: `translate(0,${f1((1 - k2) * 90 - ke * 90)})` });
        L.words.forEach(W_ => {
          if (!W_.key) return;
          const kh = ramp(t, W_.ws - 0.06, W_.ws + 0.16, E.out);
          set(W_.hl, { transform: `translate(${f1(W_.hx)},0) scale(${f3(Math.max(0.001, kh))},1) translate(${f1(-W_.hx)},0) skewX(${SKEW})` });
          set(W_.sp, { fill: kh > 0.45 ? C.ink : C.yellow });
        });
      });
    });
  }
  return { render };
}

// ---------------------------------------------------------------- TIPO A
export function makeImpact(parent, f) {
  const g = el('g', { opacity: 0 }, parent);
  const burst = el('g', {}, g);
  const rays = [];
  for (let i = 0; i < 10; i++) rays.push(el('line', { stroke: f.accent || C.orange, 'stroke-width': 9, 'stroke-linecap': 'round' }, burst));
  const t = el('text', { x: 0, y: 0, 'font-size': f.size || 150, 'font-weight': 900, 'text-anchor': 'middle', fill: f.color || C.yellow, 'stroke-width': (f.size || 150) * 0.11, ...STROKE, 'letter-spacing': -(f.size || 150) * 0.02 }, g);
  t.textContent = f.text;
  const bar = el('rect', { height: 16, rx: 8, fill: f.accent || C.orange }, g);
  function render(time) {
    if (time < f.s - 0.1 || time > f.e + 0.1) { set(g, { opacity: 0 }); return; }
    const k = ramp(time, f.s, f.s + 0.5, E.back), out = ramp(time, f.e - 0.25, f.e, E.in);
    const w = t.getComputedTextLength();
    const rot = lerp(f.rot0 ?? -14, f.rot ?? -3, ramp(time, f.s, f.s + 0.6, E.backSoft));
    const s = lerp(0.25, 1, k) * (1 + 0.012 * Math.sin((time - f.s) * 3)) * (1 + 0.12 * out);
    set(g, { opacity: f3(clamp(k * 2.2) * (1 - out)), transform: tr(f.x ?? 540, f.y ?? 330, s, rot) });
    const bk = ramp(time, f.s + 0.15, f.s + 0.45, E.out);
    set(bar, { x: f1(-w / 2 * bk), y: f1((f.size || 150) * 0.22), width: f1(w * bk) });
    const rk = ramp(time, f.s + 0.05, f.s + 0.5, E.out);
    rays.forEach((r, i) => {
      const a = (i / 10) * Math.PI * 2 + 0.3, R0 = w * 0.42 + rk * 70, R1 = R0 + 46 * (1 - rk);
      set(r, { x1: f1(Math.cos(a) * R0), y1: f1(Math.sin(a) * R0 * 0.55 - 40), x2: f1(Math.cos(a) * R1), y2: f1(Math.sin(a) * R1 * 0.55 - 40), opacity: f3((1 - rk) * (rk > 0 ? 1 : 0)) });
    });
  }
  return { render };
}

// ---------------------------------------------------------------- TIPO B
// Registro de transformaciones palabra → objeto. Cada una recibe las letras (con su centro) y devuelve render(k, time, ctx).
export const MORPHS = {
  // «OJOS»: las dos O se convierten en ojos ilustrados que parpadean y miran; la J y la S se desvanecen.
  eyes(g, letters, f) {
    const eyes = letters.filter(L => L.ch === 'O').map(L => {
      const e = el('g', { opacity: 0 }, g);
      const scl = el('ellipse', { fill: C.white, stroke: C.ink, 'stroke-width': 10 }, e);
      const iris = el('g', {}, e);
      el('circle', { r: 30, fill: 'url(#iris)' }, iris);
      el('circle', { r: 14, fill: C.ink }, iris);
      el('circle', { cx: -9, cy: -10, r: 6, fill: '#fff' }, iris);
      const lid = el('path', { fill: C.navy2 }, e);
      const lashes = [0, 1, 2].map(() => el('line', { stroke: C.white, 'stroke-width': 7, 'stroke-linecap': 'round' }, e));
      return { L, e, scl, iris, lid, lashes };
    });
    return (k, time, ctx) => {
      letters.forEach(L => {
        const fade = L.ch === 'O' ? ramp(k, 0.15, 0.45) : ramp(k, 0.0, 0.35, E.in);
        set(L.t, { opacity: f3(1 - fade), transform: L.ch === 'O' ? '' : `translate(${f1(L.cx)},${f1(L.cy)}) scale(${f3(1 - 0.6 * fade)}) translate(${f1(-L.cx)},${f1(-L.cy)})` });
      });
      eyes.forEach((E_, i) => {
        const m = ramp(k, 0.1, 0.6, E.backSoft), gather = ramp(k, 0.35, 0.9, E.inOut);
        const cx = lerp(E_.L.cx, (eyes[0].L.cx + eyes[eyes.length - 1].L.cx) / 2 + (i ? 1 : -1) * (f.size * 0.5 + 26), gather), cy = E_.L.cy;
        const rx = lerp(f.size * 0.36, f.size * 0.5, m), ry = lerp(f.size * 0.36, f.size * 0.3, m);
        set(E_.e, { opacity: f3(ramp(k, 0.08, 0.3)), transform: `translate(${f1(cx)},${f1(cy)})` });
        set(E_.scl, { rx: f1(rx), ry: f1(ry) });
        // mirada: hacia el punto que publique la escena (ctx.lookAt) o de lado a lado
        let lx = Math.sin(time * 2.2) * 0.6, ly = 0.1;
        if (ctx.lookAt) { const dx = ctx.lookAt.x - (f.x - 0) - cx, dy = ctx.lookAt.y - (f.y) - cy, d = Math.hypot(dx, dy) || 1; lx = dx / d; ly = dy / d; }
        set(E_.iris, { transform: `translate(${f1(lx * rx * 0.42)},${f1(ly * ry * 0.4)}) scale(${f3(clamp(m * 1.2) * ry / 34)})` });
        const blink = Math.max(0, Math.sin(clamp((time - (f.blink ?? f.s + 1.2)) / 0.2) * Math.PI));
        const o = 1 - blink * 0.95;
        set(E_.lid, { d: `M ${f1(-rx)} 0 Q 0 ${f1(-ry * 2)} ${f1(rx)} 0 Q 0 ${f1(-ry * 2 + ry * 2 * (1 - o) * 2)} ${f1(-rx)} 0 Z`, opacity: f3(m) });
        E_.lashes.forEach((l, j) => { const a = -Math.PI / 2 + (j - 1) * 0.5; const px = Math.cos(a) * rx * 0.6, py = -ry * o * 0.95 + Math.abs(j - 1) * ry * 0.25 * o; set(l, { x1: f1(px), y1: f1(py), x2: f1(px + Math.cos(a) * 20), y2: f1(py + Math.sin(a) * 20), opacity: f3(m) }); });
      });
    };
  },
};
export function makeMorph(parent, f) {
  const g = el('g', { opacity: 0 }, parent);
  const letters = [...f.text].map(ch => {
    const t = el('text', { 'font-size': f.size, 'font-weight': 900, 'text-anchor': 'middle', fill: f.color || C.white, 'stroke-width': f.size * 0.1, ...STROKE }, g);
    t.textContent = ch; return { ch, t, cx: 0, cy: 0 };
  });
  let laid = false, morph;
  function layout() {
    const ws = letters.map(L => L.t.getComputedTextLength()), gap = f.size * 0.02, total = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
    let x = -total / 2;
    letters.forEach((L, i) => { L.cx = x + ws[i] / 2; L.cy = -f.size * 0.36; set(L.t, { x: f1(L.cx), y: 0 }); x += ws[i] + gap; });
    morph = MORPHS[f.morph](g, letters, f); laid = true;
  }
  function render(time, ctx = {}) {
    if (time < f.s - 0.1 || time > f.e + 0.1) { set(g, { opacity: 0 }); return; }
    if (!laid) layout();
    const k = ramp(time, f.s, f.s + 0.45, E.back), out = ramp(time, f.e - 0.3, f.e, E.in);
    set(g, { opacity: f3(clamp(k * 2) * (1 - out)), transform: tr(f.x, f.y, lerp(0.4, 1, k) * (1 - 0.3 * out), lerp(-6, 0, clamp(k))) });
    morph(ramp(time, f.morphAt, f.morphAt + 0.7), time, ctx);
  }
  return { render };
}

// ---------------------------------------------------------------- TIPO C
export function makeNumber(parent, f) {
  const g = el('g', { opacity: 0 }, parent);
  const R = f.r || 230, SW = f.sw || 54, circ = 2 * Math.PI * R;
  el('circle', { r: R, fill: 'none', stroke: C.navy3, 'stroke-width': SW, opacity: 0.9 }, g);
  const arc = el('circle', { r: R, fill: 'none', stroke: C.orange, 'stroke-width': SW, 'stroke-linecap': 'butt', transform: 'rotate(-90)' }, g);
  const glowArc = el('circle', { r: R, fill: 'none', stroke: C.yellow, 'stroke-width': SW * 0.35, transform: 'rotate(-90)', opacity: 0 }, g);
  const ticks = el('g', {}, g);
  for (let i = 0; i < 20; i++) el('line', { x1: 0, y1: -R - SW / 2 - 14, x2: 0, y2: -R - SW / 2 - 26, stroke: C.grey, 'stroke-width': 4, transform: `rotate(${i * 18})`, opacity: 0.5 }, ticks);
  const num = el('text', { x: -10, y: 70, 'font-size': f.size || 230, 'font-weight': 900, 'text-anchor': 'middle', fill: C.white, 'stroke-width': 16, ...STROKE, 'letter-spacing': -8 }, g);
  const pct = el('text', { 'font-size': (f.size || 230) * 0.45, 'font-weight': 900, fill: C.yellow, 'stroke-width': 10, ...STROKE }, g);
  pct.textContent = f.suffix ?? '%';
  function render(time) {
    if (time < f.s - 0.1 || time > f.e + 0.1) { set(g, { opacity: 0 }); return; }
    const k = ramp(time, f.s, f.s + 0.5, E.backSoft), fill = ramp(time, f.s + 0.2, f.s + 1.5, E.inOut), out = ramp(time, f.e - 0.3, f.e, E.in);
    set(g, { opacity: f3(clamp(k * 2) * (1 - out)), transform: tr(f.x, f.y, lerp(0.6, 1, k)) });
    const v = Math.round(f.value * fill);
    num.textContent = String(v);
    const w = num.getComputedTextLength();
    const pk = ramp(time, f.s + 1.35, f.s + 1.7, E.back);
    set(pct, { x: f1(-10 + w / 2 + 8), y: 70, transform: `translate(${f1(-10 + w / 2 + 40)},40) scale(${f3(pk)}) translate(${f1(-(-10 + w / 2 + 40))},-40)` });
    set(arc, { 'stroke-dasharray': `${f1(circ * f.value / 100 * fill)} ${f1(circ)}` });
    const glow = ramp(time, f.s + 1.6, f.s + 2.0) * (0.6 + 0.4 * Math.sin(time * 6));
    set(glowArc, { 'stroke-dasharray': `${f1(circ * f.value / 100 * fill)} ${f1(circ)}`, opacity: f3(glow) });
  }
  return { render, g };
}

// ---------------------------------------------------------------- TIPO D
export function makeTracking(parent, f) {
  const g = el('g', { opacity: 0 }, parent);
  const inner = el('g', {}, g);
  const pill = el('rect', { rx: 14, fill: f.bg || C.navy, opacity: 0.9 }, inner);
  const t = el('text', { x: 0, y: 0, 'font-size': f.size || 54, 'font-weight': 900, fill: f.color || C.white, 'text-anchor': 'middle', 'letter-spacing': 2 }, inner);
  t.textContent = f.text;
  const line = el('line', { stroke: f.lineColor || C.yellow, 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
  const dot = el('circle', { r: 9, fill: f.lineColor || C.yellow }, g);
  function render(time, ctx = {}) {
    const A = ctx.anchors && ctx.anchors[f.anchor];
    if (!A || time < f.s - 0.1 || time > f.e + 0.1) { set(g, { opacity: 0 }); return; }
    const k = ramp(time, f.s, f.s + 0.45, E.out), out = ramp(time, f.e - 0.25, f.e, E.in);
    const w = t.getComputedTextLength(), hgt = (f.size || 54) * 1.3;
    set(pill, { x: f1(-w / 2 - 24), y: f1(-hgt * 0.78), width: f1(w + 48), height: f1(hgt), opacity: f3(0.88) });
    // perspectiva: la etiqueta adopta la inclinación y escala de su ancla
    const ox = f.dx ?? 0, oy = f.dy ?? -120;
    const reveal = ramp(time, f.s + 0.05, f.s + 0.5, E.out5);
    set(inner, { transform: `translate(${f1(A.x + ox * A.s)},${f1(A.y + oy * A.s)}) skewY(${f1(A.skew || 0)}) scale(${f3(A.s * lerp(0.85, 1, k))}) translate(0,${f1(20 * (1 - k))})` });
    set(line, { x1: f1(A.x), y1: f1(A.y), x2: f1(lerp(A.x, A.x + ox * A.s, reveal)), y2: f1(lerp(A.y, A.y + (oy + 14) * A.s, reveal)) });
    set(dot, { cx: f1(A.x), cy: f1(A.y) });
    set(g, { opacity: f3(clamp(k * 2) * (1 - out)) });
  }
  return { render };
}

// ---------------------------------------------------------------- TIPO S (título apilado, variante de A para frases)
// lines: [[texto, color, tamaño]] — cada línea sube desde una máscara con rebote controlado y ligera rotación.
export function makeStack(parent, f) {
  const g = el('g', { opacity: 0 }, parent);
  let y = 0;
  const L = f.lines.map(([txt, color, size], i) => {
    y += size * (i ? 1.02 : 0.8);
    const cid = `stk${Math.round(f.s * 100)}_${i}`;
    el('rect', { x: -700, y: f1(y - size * 0.9), width: 1400, height: f1(size * 1.12) }, el('clipPath', { id: cid }, g));
    const m = el('g', { 'clip-path': `url(#${cid})` }, g);
    const t = el('text', { x: 0, y: f1(y), 'font-size': size, 'font-weight': 900, 'text-anchor': 'middle', fill: color, 'stroke-width': size * 0.1, ...STROKE, 'letter-spacing': -size * 0.02 }, m);
    t.textContent = txt; return { t, size, y };
  });
  const total = y;
  function render(time) {
    if (time < f.s - 0.1 || time > f.e + 0.1) { set(g, { opacity: 0 }); return; }
    const out = ramp(time, f.e - 0.3, f.e, E.in);
    set(g, { opacity: f3(1 - out), transform: tr(f.x ?? 540, (f.y ?? 300) - total / 2 - out * 40, 1, f.rot ?? -2) });
    L.forEach((l, i) => {
      const k = ramp(time, f.s + i * (f.stagger ?? 0.16), f.s + i * (f.stagger ?? 0.16) + 0.45, E.back);
      set(l.t, { transform: `translate(0,${f1((1 - k) * l.size * 1.1)})` });
    });
  }
  return { render };
}

// ---------------------------------------------------------------- orquestador
export function makeCaptionSystem(parent, CAPS, FX) {
  const fxLayer = el('g', { id: 'fx' }, parent);
  const clean = makeClean(el('g', {}, parent), CAPS);
  const make = { A: makeImpact, B: makeMorph, C: makeNumber, D: makeTracking, S: makeStack };
  const items = FX.map(f => ({ f, r: make[f.type](fxLayer, f) }));
  return {
    render(t, ctx) { items.forEach(it => it.r.render(t, ctx)); clean.render(t, ctx); },
  };
}
