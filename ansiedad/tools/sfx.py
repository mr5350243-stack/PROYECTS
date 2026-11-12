"""Diseño sonoro de ANSIEDAD: cama musical por escenas + efectos sincronizados con la animación.

Genera ansiedad/audio/music.wav y ansiedad/audio/sfx.wav (48 kHz estéreo).
Los tiempos de los efectos replican la lógica de cada escena (ansiedad/src/scenes/*.js).
Uso: python3 ansiedad/tools/sfx.py
"""
import os
import sys
import wave as wavmod

import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'tools'))
from audiolib import SR, add, drone, note, t_arr, whoosh, sweep_whoosh, thump, shimmer, click, env, noise, lp_fast, hp_fast, tone, chime  # noqa: E402

DUR = 100.6
N = int(SR * DUR)
OUT = os.path.join(os.path.dirname(__file__), '..', 'audio')
os.makedirs(OUT, exist_ok=True)
music = np.zeros((N, 2))
sfx = np.zeros((N, 2))


def freeze_time(t, a, b, slow=0.04, ease=0.18):
    """Igual que freezeTime() de shared.js: tiempo del mundo durante una congelación."""
    def sp(x):
        k = min(1, max(0, (x - a) / ease)) * min(1, max(0, (b - x) / ease))
        return 1 - (1 - slow) * k
    if t <= a:
        return t
    end = min(t, b + ease)
    n = int(np.ceil((end - a) / 0.01))
    dx = (end - a) / max(1, n)
    acc, x = a, a
    for _ in range(n):
        acc += sp(x + dx / 2) * dx
        x += dx
    return acc + max(0, t - (b + ease))


def world_to_t(wt, a, b):
    """Inversa numérica de freeze_time (para colocar efectos que ocurren en el tiempo del mundo)."""
    lo, hi = 0.0, DUR
    for _ in range(50):
        m = (lo + hi) / 2
        if freeze_time(m, a, b) < wt:
            lo = m
        else:
            hi = m
    return lo


def heartbeat(gain=1.0):
    """Latido doble (lub-dub)."""
    s = thump(52, 0.32) * 1.0
    d = thump(46, 0.28) * 0.7
    out = np.zeros(int(SR * 0.6))
    out[:len(s)] += s
    o = int(SR * 0.19)
    out[o:o + len(d)] += d[:len(out) - o]
    return out * gain


def riser(d=1.2, f0=120, f1=900):
    t = t_arr(d)
    f = f0 * (f1 / f0) ** (t / d)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * 0.4 + lp_fast(noise(d), 3000) * 0.5
    return s * (t / d) ** 2


def boom(d=2.5, f=38):
    t = t_arr(d)
    s = np.sin(2 * np.pi * f * t * (1 + 0.6 * np.exp(-t * 6))) * np.exp(-t * 1.6)
    s += lp_fast(noise(d), 400) * np.exp(-t * 3) * 0.6
    return s


def title_hit():
    t = t_arr(1.6)
    s = thump(70, 0.5) * 0.9
    out = np.zeros(len(t))
    out[:len(s)] += s
    out += shimmer(1.6, 1800)[:len(t)] * 0.25 * np.exp(-t * 2.5)
    return out


# ---------------- música: cama armónica por escenas ----------------
sections = [
    # (inicio, fin, acorde, brillo, ganancia)
    (0.0, 4.6, ['F2', 'C3', 'A3', 'E4'], 1400, 0.8),            # calma en el sofá
    (4.2, 11.4, ['A2', 'E3', 'C4', 'B3'], 650, 0.95),           # la alarma
    (10.8, 20.3, ['D2', 'A2', 'F3', 'C4'], 700, 0.9),           # el cuerpo en alerta
    (19.6, 30.6, ['C2', 'G2', 'E3', 'B3'], 1300, 0.8),          # protección / bosque
    (30.0, 40.5, ['E2', 'B2', 'G3', 'D4'], 1500, 0.75),         # laboratorio
    (39.8, 53.9, ['F2', 'C3', 'G#3', 'D#4'], 800, 0.9),         # incertidumbre
    (53.3, 61.0, ['A2', 'E3', 'G3', 'D4'], 900, 0.8),           # mensaje
    (60.4, 66.8, ['D2', 'A2', 'F3', 'G#3'], 700, 0.85),         # presentación
    (66.2, 72.3, ['D2', 'A2', 'F3', 'C4'], 800, 0.8),           # sensaciones reales
    (71.7, 77.3, ['A2', 'E3', 'C4', 'G4'], 1100, 0.75),         # alarma ≠ peligro
    (76.7, 86.3, ['F2', 'C3', 'A3', 'G4'], 1400, 0.8),          # terapia (esperanza)
    (85.7, 94.9, ['C2', 'G2', 'E3', 'D4'], 1500, 0.8),          # comprender
    (94.3, DUR, ['F2', 'C3', 'A3', 'E4', 'G4'], 1700, 0.85),    # cierre
]
for a, b, chord, bright, g in sections:
    d = b - a
    s = drone([note(n) for n in chord], d, 1.0, bright)
    t = t_arr(d)
    s *= np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.6) * g
    add(music, a, s, 1.0, 0.0)
# pulso suave de fondo (tic) que da ritmo, más presente en las escenas de tensión
for k in np.arange(0, DUR, 0.5):
    tense = 1.0 if 4.5 < k < 20 or 40 < k < 54 or 60.5 < k < 72 else 0.4
    add(music, k, click(1800, 0.03) * 0.05 * tense, 1.0, 0.2 if int(k * 2) % 2 else -0.2)

# ---------------- ESCENA 01 (0–11.05) ----------------
F0, F1 = 5.95, 7.15
add(sfx, 0.0, lp_fast(noise(5.0), 500) * 0.05 * np.minimum(1, t_arr(5.0) / 1.0) * np.minimum(1, (5.0 - t_arr(5.0)) / 1.0), 1.0)  # ambiente exterior
add(sfx, 0.4, whoosh(2.4, 200, 1500, 0.5) * 0.25, 1.0, -0.4)       # travelling a través de la ventana
add(sfx, 4.15, thump(90, 0.25) * 0.5)                              # sobresalto
add(sfx, 4.6, sweep_whoosh(0.7, 300, 1800) * 0.25, 1.0, 0.2)       # mano al pecho
add(sfx, 5.4, boom(2.6, 40) * 0.9)                                 # sale la onda
add(sfx, 5.4, riser(0.55, 200, 1400) * 0.4)
add(sfx, F0, title_hit() * 0.7)                                    # congelación + "ANSIEDAD"
add(sfx, F0, shimmer(1.3, 2400) * 0.12 * np.exp(-t_arr(1.3) * 0.8)[:len(shimmer(1.3, 2400))])
add(sfx, F1 - 0.3, riser(0.45, 300, 2200) * 0.35)                  # el tiempo se reanuda
add(sfx, F1 + 0.35, sweep_whoosh(0.9, 2500, 150) * 0.5)            # la onda atraviesa la cámara
# latidos (en tiempo del mundo, periodo 0.8 s desde 5.4)
for k in range(12):
    wt = 5.4 + k * 0.8
    tt = world_to_t(wt, F0, F1)
    if F0 - 0.05 < tt < F1 + 0.1 or tt > 11.0:
        continue
    add(sfx, tt, heartbeat(0.55 + 0.25 * min(1, k / 5)))
add(sfx, 10.3, riser(0.8, 80, 600) * 0.45)                         # entrada al pecho (transición)


def write(name, buf, peak=0.7):
    buf = buf / (np.abs(buf).max() + 1e-9) * peak
    data = (np.clip(buf, -1, 1) * 32767).astype('<i2')
    with wavmod.open(os.path.join(OUT, name), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


write('music.wav', music, 0.7)
write('sfx.wav', sfx, 0.8)
print('ok', DUR, 's')
