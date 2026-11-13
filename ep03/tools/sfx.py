"""Música y efectos del episodio 03: tono intrigante y ligero (La menor, piano a medio tempo, pad suave),
efectos discretos que se apartan de la voz. Salida: ep02/audio/mix.wav"""
import os, sys, wave
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'tools'))
from audiolib import SR, add, whoosh, sweep_whoosh, thump, click, bloop, chime, shimmer, drone, tone, note, lp_fast, rustle

ROOT = os.path.join(os.path.dirname(__file__), '..')
D = 80.0
music = np.zeros((int(D * SR), 2)); fx = np.zeros_like(music)
# pad grave continuo + piano lento (Dm – Bb – Gm – A)
add(music, 0, drone([note('A2'), note('E3'), note('C4')], D, 1.0, 900) * np.minimum(1, np.arange(int(D * SR)) / SR / 2), 0.07)
prog = [['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4']]
beat = 60 / 96; t = 0.5; i = 0
while t < D - 3:
    ch = prog[(i // 4) % 4]
    n = ch[[0, 2, 1, 2][i % 4]]
    add(music, t, tone(note(n), 2.2, 0.004, 1.6, 2.6, (1, 0.35, 0.12)), 0.07, pan=(i % 3 - 1) * 0.3)
    if i % 4 == 0: add(music, t, tone(note(ch[0]) / 2, 3.0, 0.01, 2.5, 2, (1, 0.4)), 0.07)
    t += beat; i += 1
E = [
    (0.35, bloop(700, 1200, 0.12), 0.05), (1.7, click(3200, 0.04), 0.03), (2.9, click(2600, 0.03), 0.02), (3.2, click(2600, 0.03), 0.02),
    (7.1, whoosh(0.9, 300, 3000, 0.6), 0.1), (7.95, whoosh(0.6, 250, 2500, 0.4), 0.1), (8.3, bloop(700, 1200, 0.12), 0.05), (9.25, click(3200, 0.04), 0.03),
    (10.55, click(1800, 0.05), 0.03), (11.55, click(1800, 0.05), 0.03), (12.5, click(1800, 0.05), 0.03), (16.66, thump(55, 0.5), 0.1),
]
for k in range(20): E.append((8.0 + k * 0.4, click(5000, 0.02), 0.012))      # tic-tac del reloj veloz
for k in range(7): E.append((13.4 + k * 0.35, bloop(500 + k * 40, 800 + k * 40, 0.14), 0.025))   # burbujas de pensamiento
# escenas 03–09
E += [(19.5, whoosh(0.7, 300, 2500, 0.5), 0.08), (19.8, bloop(500, 900, 0.14), 0.05), (25.9, whoosh(1.1, 200, 3500, 0.9), 0.14),
      (30.4, sweep_whoosh(0.8, 400, 2500), 0.06), (34.1, bloop(600, 1000, 0.14), 0.05), (36.6, bloop(650, 1050, 0.14), 0.05), (39.3, bloop(500, 400, 0.2), 0.06),
      (41.7, sweep_whoosh(0.8, 300, 2000), 0.06), (45.6, sweep_whoosh(1.4, 200, 1600), 0.06), (46.9, thump(55, 0.5), 0.12), (47.7, bloop(600, 1100, 0.15), 0.05),
      (50.0, whoosh(0.7, 300, 2000, 0.5), 0.07), (53.3, thump(55, 0.5), 0.1), (57.15, thump(50, 0.6), 0.14), (61.6, sweep_whoosh(0.4, 500, 4000), 0.06),
      (62.4, whoosh(1.0, 250, 2500, 0.6), 0.08), (64.5, thump(70, 0.4), 0.08), (65.4, thump(55, 0.5), 0.1), (67.6, sweep_whoosh(0.8, 3000, 400), 0.05),
      (69.7, whoosh(0.7, 300, 2000, 0.5), 0.07), (71.9, bloop(600, 1000, 0.14), 0.05), (75.0, bloop(650, 1100, 0.14), 0.05), (76.9, thump(50, 0.6), 0.14),
      (77.3, thump(55, 0.5), 0.1), (79.0, chime(note('A5'), 1.2), 0.06), (79.03, chime(note('E6'), 1.1), 0.04)]
for k in range(8): E.append((50.3 + k * 0.25, bloop(500 + k * 30, 800 + k * 30, 0.14), 0.02))
for t0, sig, g in E: add(fx, t0, sig, g)

def read(path):
    w = wave.open(path); a = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32768
    return a.reshape(-1, w.getnchannels())
os.system(f"ffmpeg -v error -y -i {ROOT}/assets/narracion.mp3 -ac 1 -ar {SR} {ROOT}/audio/voz.wav")
voice = read(f'{ROOT}/audio/voz.wav')[:, 0]
v = np.zeros_like(music); n = min(len(voice), len(v)); v[:n, 0] = voice[:n]; v[:n, 1] = voice[:n]
envv = lp_fast(np.abs(v[:, 0]), 4); envv /= envv.max() + 1e-9
speech = np.clip(envv * 4, 0, 1)
duck, duck_fx = 1 - 0.6 * speech, 1 - 0.6 * speech
fxs = fx.copy()
for ch in range(2): fxs[:, ch] = lp_fast(fx[:, ch], 6500)
mix = v * 1.12 + music * duck[:, None] * 0.85 + fxs * duck_fx[:, None] * 0.6
fade = np.ones(len(mix)); nf = int(1.0 * SR); fade[-nf:] = np.linspace(1, 0, nf) ** 1.5
mix *= fade[:, None]; mix /= max(1.0, np.abs(mix).max() / 0.95)
w = wave.open(f'{ROOT}/audio/mix_pre.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype('<i2').tobytes()); w.close()
