// Capa de texto: subtítulos sincronizados palabra a palabra + títulos cinéticos.
// Se dibuja en un canvas 2D que el motor compone sobre la imagen final (sin grano ni etalonaje).
import { SUBS } from './subs.js';
import { TITLES } from './titles.js';

const YELLOW = '#FFD43B';
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = k => 1 - Math.pow(1 - k, 3);
const easeOutBack = k => { const c = 1.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };

async function loadFonts() {
  const base = '/node_modules/@fontsource/montserrat/files/montserrat-latin-';
  for (const w of [700, 800, 900]) {
    const f = new FontFace('Montserrat', `url(${base}${w}-normal.woff2)`, { weight: String(w) });
    document.fonts.add(await f.load());
  }
}

export async function createOverlay(W, H) {
  await loadFonts();
  const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
  const g = canvas.getContext('2d');
  const U = W / 1080; // unidad: píxel a 1080 de ancho

  // ---------------- subtítulos ----------------
  const SUB_SIZE = 64 * U, SUB_Y = 0.715 * H, LINE_H = SUB_SIZE * 1.22, MAXW = W * 0.84;
  const subFont = `800 ${SUB_SIZE}px Montserrat, "DejaVu Sans", sans-serif`;
  // reparto en 1–2 líneas equilibradas (precalculado)
  g.font = subFont;
  const space = g.measureText(' ').width;
  const layouts = SUBS.map(b => {
    const ws = b.w.map(([t]) => g.measureText(t).width);
    const total = ws.reduce((a, x) => a + x, 0) + space * (ws.length - 1);
    let lines = [b.w.map((_, i) => i)];
    if (total > MAXW * 0.62 && b.w.length > 1) {
      // corte que minimiza la línea más larga
      let best = null;
      for (let k = 1; k < b.w.length; k++) {
        const l1 = ws.slice(0, k).reduce((a, x) => a + x, 0) + space * (k - 1);
        const l2 = total - l1 - space;
        const m = Math.max(l1, l2) + (l2 > l1 ? 0 : 4 * U); // preferir línea inferior algo más larga
        if (!best || m < best.m) best = { k, m };
      }
      lines = [b.w.map((_, i) => i).slice(0, best.k), b.w.map((_, i) => i).slice(best.k)];
    }
    return { lines, ws };
  });

  function drawSubs(t) {
    const bi = SUBS.findIndex(b => t >= b.s && t < b.e);
    if (bi < 0) return;
    const b = SUBS[bi], L = layouts[bi];
    const kin = easeOutBack(ramp(t, b.s, b.s + 0.18));
    const kout = ramp(t, b.e - 0.12, b.e);
    const alpha = clamp(ramp(t, b.s, b.s + 0.1) * (1 - kout));
    g.save();
    g.font = subFont; g.textBaseline = 'middle'; g.lineJoin = 'round';
    const y0 = SUB_Y - (L.lines.length - 1) * LINE_H / 2 + (1 - kin) * 18 * U;
    L.lines.forEach((line, li) => {
      const lw = line.reduce((a, i) => a + L.ws[i], 0) + space * (line.length - 1);
      let x = W / 2 - lw / 2;
      const y = y0 + li * LINE_H;
      for (const i of line) {
        const [txt, ws, we, key] = b.w[i];
        const spoken = t >= ws - 0.04;
        const active = t >= ws - 0.04 && t < we + 0.05;
        const pop = active ? 1 + 0.035 * Math.sin(Math.PI * clamp((t - ws + 0.04) / Math.max(0.12, we - ws + 0.09))) : 1;
        const cx = x + L.ws[i] / 2;
        g.save();
        g.translate(cx, y); g.scale(pop, pop);
        g.globalAlpha = alpha;
        // contorno + sombra para legibilidad sobre cualquier fondo
        g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 14 * U; g.shadowOffsetY = 4 * U;
        g.lineWidth = 11 * U; g.strokeStyle = 'rgba(10,10,20,0.92)';
        g.textAlign = 'center';
        g.strokeText(txt, 0, 0);
        g.shadowColor = 'transparent';
        g.fillStyle = spoken ? (key ? YELLOW : '#FFFFFF') : '#AEB4C2';
        g.fillText(txt, 0, 0);
        g.restore();
        x += L.ws[i] + space;
      }
    });
    g.restore();
  }

  // ---------------- títulos cinéticos ----------------
  function drawTitle(T, t) {
    if (t < T.s || t > T.e) return;
    const size = (T.size || 112) * U;
    const lines = T.lines; // [[texto, color], ...] una entrada por línea
    const out = ramp(t, T.e - 0.4, T.e);
    g.save();
    g.textBaseline = 'middle'; g.textAlign = 'left';
    let li = 0, letterIdx = 0;
    const lh = size * 1.08;
    const y0 = (T.y ?? 0.2) * H - (lines.length - 1) * lh / 2;
    for (const [text, color, scaleL] of lines) {
      const sz = size * (scaleL || 1);
      g.font = `900 ${sz}px Montserrat, "DejaVu Sans", sans-serif`;
      const k0 = ramp(t, T.s, T.s + 0.9);
      const track = (0.05 + 0.25 * (1 - easeOut(k0))) * sz; // el espaciado se cierra
      const chars = [...text];
      const cw = chars.map(c => g.measureText(c).width);
      let lw = cw.reduce((a, x) => a + x, 0) + track * (chars.length - 1);
      const fit = Math.min(1, (W * 0.88) / lw);
      const y = y0 + li * lh;
      g.save(); g.translate(W / 2, y); g.scale(fit, fit);
      let x = -lw / 2;
      chars.forEach((c, i) => {
        const st = T.s + letterIdx * 0.035;
        const k = clamp((t - st) / 0.45);
        const e = easeOutBack(k);
        const ko = clamp((out * 1.6) - (i / chars.length) * 0.6);
        const a = clamp(k * 2) * (1 - ko);
        if (a > 0.001) {
          g.save();
          g.translate(x + cw[i] / 2, (1 - e) * sz * 0.55 - ko * sz * 0.4);
          const sc = 0.6 + 0.4 * e; g.scale(sc, sc);
          g.globalAlpha = a;
          g.shadowColor = color === YELLOW ? 'rgba(255,200,40,0.55)' : 'rgba(0,0,0,0.6)'; g.shadowBlur = 28 * U;
          g.lineWidth = 12 * U; g.strokeStyle = 'rgba(8,8,18,0.9)'; g.lineJoin = 'round'; g.textAlign = 'center';
          g.strokeText(c, 0, 0);
          g.shadowBlur = 0; g.fillStyle = color; g.fillText(c, 0, 0);
          g.restore();
        }
        x += cw[i] + track; letterIdx++;
      });
      g.restore();
      li++;
    }
    // barra de acento que se despliega bajo el título
    const bk = easeOut(ramp(t, T.s + 0.25, T.s + 0.85)) * (1 - easeOut(out));
    if (bk > 0) {
      const bw = 220 * U * bk, by = y0 + (lines.length - 0.5) * lh + 16 * U;
      g.fillStyle = YELLOW; g.globalAlpha = 0.95;
      g.beginPath(); g.roundRect(W / 2 - bw / 2, by, bw, 10 * U, 5 * U); g.fill();
    }
    // etiqueta pequeña opcional (p. ej. "recreación simplificada")
    if (T.note) {
      const na = clamp(ramp(t, T.s + 0.5, T.s + 0.9)) * (1 - out);
      g.globalAlpha = na; g.font = `700 ${30 * U}px Montserrat, sans-serif`; g.textAlign = 'center';
      const ny = y0 + (lines.length - 0.5) * lh + 62 * U;
      const nw = g.measureText(T.note).width + 40 * U;
      g.fillStyle = 'rgba(10,12,24,0.6)'; g.beginPath(); g.roundRect(W / 2 - nw / 2, ny - 26 * U, nw, 52 * U, 26 * U); g.fill();
      g.fillStyle = '#FFFFFF'; g.fillText(T.note, W / 2, ny + 2 * U);
    }
    g.restore();
  }

  return {
    canvas,
    draw(t) {
      g.clearRect(0, 0, W, H);
      for (const T of TITLES) drawTitle(T, t);
      drawSubs(t);
    },
  };
}
