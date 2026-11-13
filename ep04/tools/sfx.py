"""Música y efectos del episodio 04: tono íntimo y serio (Mi menor, piano lento, pad suave),
efectos discretos que se apartan de la voz. Salida: ep02/audio/mix.wav"""
import os, sys, wave
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'tools'))
from audiolib import SR, add, whoosh, sweep_whoosh, thump, click, bloop, chime, shimmer, drone, tone, note, lp_fast, rustle

ROOT = os.path.join(os.path.dirname(__file__), '..')
D = 82.0
music = np.zeros((int(D * SR), 2)); fx = np.zeros_like(music)
# pad grave continuo + piano lento (Dm – Bb – Gm – A)
add(music, 0, drone([note('E2'), note('B2'), note('G3')], D, 1.0, 800) * np.minimum(1, np.arange(int(D * SR)) / SR / 2), 0.07)
prog = [['E3', 'G3', 'B3'], ['C3', 'E3', 'G3'], ['G3', 'B3', 'D4'], ['D3', 'F#3', 'A3']]
beat = 60 / 84; t = 0.5; i = 0
while t < D - 3:
    ch = prog[(i // 4) % 4]
    n = ch[[0, 2, 1, 2][i % 4]]
    add(music, t, tone(note(n), 2.2, 0.004, 1.6, 2.6, (1, 0.35, 0.12)), 0.07, pan=(i % 3 - 1) * 0.3)
    if i % 4 == 0: add(music, t, tone(note(ch[0]) / 2, 3.0, 0.01, 2.5, 2, (1, 0.4)), 0.07)
    t += beat; i += 1
E = [
    (0.0, whoosh(1.2, 200, 1500, 0.8), 0.05), (8.75, bloop(500, 800, 0.14), 0.04), (8.91, bloop(550, 850, 0.14), 0.04), (9.07, bloop(600, 900, 0.14), 0.04),
    (9.23, bloop(650, 950, 0.14), 0.04), (9.39, bloop(700, 1000, 0.14), 0.04), (10.0, sweep_whoosh(0.8, 400, 3000), 0.07), (11.0, whoosh(0.8, 250, 3000, 0.6), 0.1),
]
E += [(11.0, whoosh(0.7, 300, 2500, 0.5), 0.07), (12.0, bloop(500, 800, 0.14), 0.04), (13.25, thump(60, 0.3), 0.08), (13.6, shimmer(1.2, 1500), 0.04),
      (15.0, bloop(700, 1100, 0.14), 0.04), (20.55, sweep_whoosh(0.8, 3000, 300), 0.07), (21.2, whoosh(0.7, 300, 2500, 0.5), 0.07), (25.0, sweep_whoosh(1.1, 600, 2000), 0.05),
      (25.9, thump(55, 0.4), 0.1), (27.0, sweep_whoosh(1.0, 2000, 500), 0.07), (27.95, thump(70, 0.3), 0.1), (30.6, whoosh(0.7, 300, 2000, 0.5), 0.07),
      (35.2, drone([note('E3'), note('G3')], 3.2, 1.0, 500), 0.035), (39.3, whoosh(0.7, 300, 2000, 0.5), 0.07), (42.76, thump(80, 0.25), 0.08), (43.88, thump(80, 0.25), 0.08),
      (44.72, thump(80, 0.25), 0.08), (45.6, bloop(500, 900, 0.15), 0.05), (48.0, whoosh(0.7, 300, 2000, 0.5), 0.07), (52.1, chime(note('E5'), 0.8), 0.04),
      (53.3, thump(55, 0.4), 0.1), (53.6, sweep_whoosh(1.1, 400, 1500), 0.06), (54.7, thump(60, 0.4), 0.1), (56.1, whoosh(0.7, 300, 2000, 0.5), 0.07),
      (57.5, thump(55, 0.5), 0.1), (60.6, whoosh(1.0, 300, 2500, 0.6), 0.07), (71.0, whoosh(0.7, 300, 2000, 0.5), 0.07), (72.0, chime(note('B4'), 0.9), 0.04),
      (74.28, chime(note('E5'), 0.9), 0.04), (75.0, chime(note('G5'), 0.9), 0.04), (76.5, thump(55, 0.5), 0.1), (80.3, chime(note('E5'), 1.2), 0.06), (80.33, chime(note('B5'), 1.1), 0.04)]
for k in range(3): E += [(61.76 + k * 0.9, click(2200, 0.05), 0.04)]
for k in range(9): E += [(64.6 + k * 0.3, bloop(400 + k * 30, 600 + k * 30, 0.12), 0.02)]
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
