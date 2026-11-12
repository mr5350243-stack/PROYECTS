"""Música y efectos del episodio 01 (síntesis propia, misma paleta sonora que la prueba aprobada) + mezcla con la voz.
Los tiempos coinciden con los de las escenas y fx_data.js. Salida: ep01/audio/mix.wav"""
import os, sys, wave
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'tools'))
from audiolib import SR, add, whoosh, sweep_whoosh, thump, click, bloop, chime, shimmer, drone, tone, note, lp_fast, rustle, step

ROOT = os.path.join(os.path.dirname(__file__), '..')
D = 121.0
music = np.zeros((int(D * SR), 2)); fx = np.zeros_like(music)

# --- música: pulso editorial (112 bpm) con progresión Dm–Bb–F–C; el bajo entra con el laboratorio
bpm = 112; beat = 60 / bpm
prog = [('D3', ['D4', 'F4', 'A4']), ('A#2', ['A#3', 'D4', 'F4']), ('F3', ['F4', 'A4', 'C5']), ('C3', ['C4', 'E4', 'G4'])]
t = 0.0; i = 0
while t < D - 2:
    root, chord = prog[(i // 4) % 4]
    add(music, t, tone(note(root), beat * 0.9, 0.005, 0.25, 4, (1, 0.5, 0.2)), 0.2 if t > 8.1 else 0.12)
    if i % 2 == 1:
        for k, n in enumerate(chord): add(music, t + k * 0.01, tone(note(n) * 2, beat * 0.6, 0.002, 0.14, 7, (1, 0.25)), 0.05, pan=(k - 1) * 0.5)
    if t > 8.1 and i % 4 in (0, 2): add(music, t, thump(52, 0.3), 0.3)
    if t > 8.1: add(music, t + beat / 2, click(7000, 0.03), 0.035, pan=0.3)
    t += beat; i += 1
add(music, 0, drone([note('D3'), note('A3'), note('F4')], D, 1.0, 1000) * np.minimum(1, np.arange(int(D * SR)) / SR / 1.5), 0.06)

# --- efectos de las escenas 01–02
E = [
    (0.05, sweep_whoosh(0.5, 300, 3000), 0.18), (0.5, bloop(500, 900, 0.12), 0.05), (0.95, bloop(550, 950, 0.12), 0.05), (1.45, bloop(650, 1100, 0.14), 0.05),
    (1.7, whoosh(0.5, 600, 3000, 0.4), 0.06), (2.1, click(3000, 0.04), 0.05),
    (3.5, bloop(400, 800, 0.2), 0.07), (3.95, shimmer(0.8, 1600), 0.06), (4.85, click(2500, 0.04), 0.06),
    (4.85, sweep_whoosh(0.5, 600, 4000), 0.12), (5.35, whoosh(2.0, 150, 3500, 0.95), 0.2),
    (6.75, bloop(500, 900, 0.14), 0.13), (7.0, thump(70, 0.4), 0.3), (7.72, sweep_whoosh(0.35, 5000, 400), 0.22), (7.72, thump(45, 0.6), 0.35),
    (7.85, whoosh(0.5, 300, 3000, 0.5), 0.18), (8.12, whoosh(0.6, 250, 2500, 0.4), 0.18),
    (8.86, thump(60, 0.5), 0.35), (8.9, sweep_whoosh(0.3, 800, 5000), 0.12),
    (10.65, bloop(700, 1000, 0.12), 0.1), (15.55, sum(click(2200, 0.05) * 1 for _ in [0]), 0.08), (15.71, click(2400, 0.05), 0.08), (15.87, click(2600, 0.05), 0.08),
    (16.05, chime(note('A5'), 0.8), 0.08), (18.45, bloop(600, 1000, 0.15), 0.11), (19.5, bloop(650, 1100, 0.15), 0.11), (22.3, whoosh(1.2, 200, 4000, 0.9), 0.3),
]
# --- escenas 03–12
E += [
    (23.2, thump(55, 0.5), 0.3), (27.3, bloop(500, 900, 0.14), 0.12), (28.68, thump(60, 0.5), 0.3), (28.7, sweep_whoosh(0.3, 800, 5000), 0.1),
    (37.95, thump(90, 0.12), 0.13), (38.07, thump(90, 0.12), 0.13), (38.19, thump(90, 0.12), 0.13), (38.31, thump(90, 0.12), 0.13), (38.43, thump(90, 0.12), 0.13),
    (40.5, thump(45, 0.8), 0.45), (40.5, sweep_whoosh(0.35, 4000, 300), 0.2), (40.6, bloop(500, 900, 0.14), 0.12), (41.52, thump(60, 0.5), 0.32),
    (42.2, whoosh(0.8, 250, 3000, 0.6), 0.2), (47.4, chime(note('A5'), 1.0), 0.09), (48.45, bloop(600, 1000, 0.15), 0.12), (51.36, thump(60, 0.5), 0.3),
    (52.9, shimmer(1.4, 1300), 0.08), (52.9, whoosh(1.1, 300, 4000, 0.5), 0.15), (53.85, bloop(300, 800, 0.3), 0.18),
    (59.45, bloop(650, 1000, 0.14), 0.1), (65.65, thump(55, 0.5), 0.3), (67.3, thump(50, 0.6), 0.35), (67.2, sweep_whoosh(0.5, 400, 4000), 0.14),
    (71.75, whoosh(0.7, 250, 3000, 0.5), 0.2), (72.3, bloop(500, 850, 0.14), 0.1), (72.4, rustle(1.4), 0.05), (74.85, rustle(0.9), 0.05),
    (77.0, chime(note('E6'), 0.9), 0.1), (77.05, chime(note('B6'), 0.85), 0.06), (80.7, whoosh(0.8, 300, 1500, 0.5), 0.05), (81.85, thump(60, 0.5), 0.3),
    (82.25, whoosh(1.0, 200, 4000, 0.9), 0.3), (83.6, thump(60, 0.5), 0.3), (86.4, bloop(700, 1000, 0.12), 0.1), (90.9, chime(note('A5'), 0.8), 0.1),
    (95.9, sweep_whoosh(0.6, 4000, 300), 0.22), (97.3, bloop(600, 1000, 0.15), 0.12), (97.9, bloop(650, 1100, 0.15), 0.12), (99.25, thump(55, 0.5), 0.32),
    (101.9, whoosh(1.2, 200, 3500, 0.7), 0.25), (107.9, thump(60, 0.5), 0.3), (111.0, whoosh(1.0, 3000, 300, 0.2), 0.22), (114.9, click(3000, 0.04), 0.08),
    (116.4, whoosh(1.0, 200, 4000, 0.95), 0.3), (117.25, thump(55, 0.5), 0.35), (118.1, bloop(500, 900, 0.14), 0.12), (118.6, bloop(600, 1000, 0.14), 0.12),
    (118.75, sweep_whoosh(0.55, 300, 5000), 0.15), (119.32, thump(45, 0.8), 0.45), (119.85, whoosh(0.6, 300, 3000, 0.5), 0.2),
    (120.15, chime(note('D5'), 0.9), 0.1), (120.18, chime(note('F#5'), 0.87), 0.08), (120.21, chime(note('A5'), 0.84), 0.07),
]
for k in range(46): E.append((46.15 + k * 1.3 / 46, click(2600 + k * 30, 0.03), 0.03))        # el número se construye
for tt in (54.6, 57.0, 59.4, 61.6, 63.5, 103.2, 104.9, 106.6, 108.1): E += [(tt, sweep_whoosh(0.3, 600, 3000), 0.08), (tt + 0.25, click(2200, 0.05), 0.06)]
for k in range(8):                                                                                # pasos del gorila
    for a, b in ((35.7, 37.9), (38.75, 40.45)):
        ts = a + k * 0.6
        if ts < b: E.append((ts, step(0.18, 0.6), 0.05))
for k in range(150, 175):                                                                          # pelota amarilla (escena 12)
    tb = k * np.pi / 4.6
    if 112.0 < tb < 116.5: E.append((tb, bloop(700, 350, 0.1), 0.03))
for t0, sig, g in E: add(fx, t0, sig, g)
# pelota amarilla: rebotes (|sin(4.6 t)| = 0)
for k in range(1, 8):
    tb = k * np.pi / 4.6
    if tb < 4.85: add(fx, tb, bloop(700, 350, 0.1), 0.035, pan=0.25 * np.sin(tb * 2.3 - 0.4))

def read(path):
    w = wave.open(path); a = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32768
    return a.reshape(-1, w.getnchannels())
os.system(f"ffmpeg -v error -y -i {ROOT}/assets/narracion.mp3 -ac 1 -ar {SR} {ROOT}/audio/voz.wav")
voice = read(f'{ROOT}/audio/voz.wav')[:, 0]
v = np.zeros_like(music); n = min(len(voice), len(v)); v[:n, 0] = voice[:n]; v[:n, 1] = voice[:n]
envv = lp_fast(np.abs(v[:, 0]), 4); envv /= envv.max() + 1e-9
speech = np.clip(envv * 4, 0, 1)
duck = 1 - 0.65 * speech             # música bajo la voz
duck_fx = 1 - 0.6 * speech           # efectos bajo la voz
# suavizar los ataques de los efectos (sin golpes repentinos)
fxs = fx.copy()
for ch in range(2): fxs[:, ch] = lp_fast(fx[:, ch], 6500)
mix = v * 1.12 + music * duck[:, None] * 0.8 + fxs * duck_fx[:, None] * 0.6
fade = np.ones(len(mix)); nf = int(0.6 * SR); fade[-nf:] = np.linspace(1, 0, nf) ** 1.5
mix *= fade[:, None]; mix /= max(1.0, np.abs(mix).max() / 0.95)
w = wave.open(f'{ROOT}/audio/mix_pre.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype('<i2').tobytes()); w.close()
