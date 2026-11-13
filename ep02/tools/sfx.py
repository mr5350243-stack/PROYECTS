"""Música y efectos del episodio 02: tono documental serio (Re menor lento, pad grave, notas de piano sintetizado),
efectos discretos que se apartan de la voz. Salida: ep02/audio/mix.wav"""
import os, sys, wave
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'tools'))
from audiolib import SR, add, whoosh, sweep_whoosh, thump, click, bloop, chime, shimmer, drone, tone, note, lp_fast, rustle

ROOT = os.path.join(os.path.dirname(__file__), '..')
D = 119.0
music = np.zeros((int(D * SR), 2)); fx = np.zeros_like(music)
# pad grave continuo + piano lento (Dm – Bb – Gm – A)
add(music, 0, drone([note('D2'), note('A2'), note('F3')], D, 1.0, 700) * np.minimum(1, np.arange(int(D * SR)) / SR / 3), 0.09)
prog = [['D4', 'F4', 'A4'], ['A#3', 'D4', 'F4'], ['G3', 'A#3', 'D4'], ['A3', 'C#4', 'E4']]
beat = 60 / 72; t = 0.5; i = 0
while t < D - 3:
    ch = prog[(i // 4) % 4]
    n = ch[[0, 2, 1, 2][i % 4]]
    add(music, t, tone(note(n), 2.2, 0.004, 1.6, 2.6, (1, 0.35, 0.12)), 0.07, pan=(i % 3 - 1) * 0.3)
    if i % 4 == 0: add(music, t, tone(note(ch[0]) / 2, 3.0, 0.01, 2.5, 2, (1, 0.4)), 0.07)
    t += beat; i += 1
E = [
    (0.1, whoosh(2.5, 100, 1200, 0.9), 0.08),                                   # aparece la silueta
    (7.8, thump(45, 1.0), 0.18),                                                # pulso rojo
    (8.05, sweep_whoosh(0.5, 3000, 400), 0.08), (8.55, whoosh(1.0, 200, 2500, 0.6), 0.12),
    (9.0, rustle(0.8), 0.04), (10.5, rustle(0.8), 0.05), (15.9, rustle(1.6), 0.04),
    (29.0, thump(55, 0.6), 0.16), (30.2, whoosh(1.0, 300, 3000, 0.7), 0.12),
]
for k in range(17): E.append((3.55 + k * 0.13, chime(note('A5') * (1 + 0.02 * (k % 3)), 0.9), 0.012))   # las 17 luces, muy suaves
for k in range(9): E.append((8.8 + k * 0.08, click(1800, 0.05), 0.02))                                   # papeles sobre la mesa
E += [
    (31.2, whoosh(0.8, 200, 2500, 0.5), 0.1), (35.6, whoosh(1.0, 2500, 200, 0.3), 0.1), (40.1, thump(60, 0.5), 0.14),
    (40.55, click(2400, 0.06), 0.06), (40.55, sweep_whoosh(0.4, 3000, 600), 0.06), (45.2, sweep_whoosh(0.35, 600, 4000), 0.08),
    (47.4, whoosh(0.8, 200, 2500, 0.5), 0.1), (49.5, sweep_whoosh(1.0, 200, 1200), 0.07), (50.6, thump(50, 0.6), 0.12),
    (55.6, rustle(0.8), 0.04), (56.6, whoosh(0.8, 300, 2000, 0.5), 0.08), (64.4, drone([note('D2'), note('G#2')], 2.4, 1.0, 400), 0.05),
    (66.3, whoosh(1.8, 150, 3000, 0.95), 0.14), (67.9, thump(45, 0.8), 0.12), (74.0, chime(note('D5'), 1.0), 0.04),
    (75.2, whoosh(0.7, 300, 2500, 0.5), 0.08), (85.2, sweep_whoosh(0.6, 400, 3000), 0.08), (86.8, rustle(1.5), 0.04),
    (91.0, whoosh(0.8, 200, 2000, 0.5), 0.08), (93.0, thump(55, 0.6), 0.18), (95.6, sweep_whoosh(1.0, 3000, 300), 0.07),
    (105.1, thump(50, 0.6), 0.12), (110.7, whoosh(1.1, 2000, 200, 0.2), 0.08), (111.6, whoosh(0.8, 200, 2000, 0.5), 0.07),
    (114.2, thump(60, 0.4), 0.08), (114.5, thump(55, 0.5), 0.12), (116.7, thump(50, 0.6), 0.14), (118.9, chime(note('D5'), 1.4), 0.07), (118.93, chime(note('A5'), 1.3), 0.05),
]
for k in range(14): E.append((59.2 + k * 0.32, bloop(300 + k * 15, 500 + k * 20, 0.18), 0.02))   # burbujas de pensamiento
for k in range(17): E.append((112.6 + k * 0.1, chime(note('A5'), 0.8), 0.008))                      # las 17 luces vuelven
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
fade = np.ones(len(mix)); nf = int(1.5 * SR); fade[-nf:] = np.linspace(1, 0, nf) ** 1.5
mix *= fade[:, None]; mix /= max(1.0, np.abs(mix).max() / 0.95)
w = wave.open(f'{ROOT}/audio/mix_pre.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype('<i2').tobytes()); w.close()
