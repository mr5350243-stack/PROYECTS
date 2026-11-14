"""Música y efectos del episodio 08: tono íntimo e intrigante (La menor, piano a medio tempo, pad suave),
efectos discretos que se apartan de la voz. Salida: ep02/audio/mix.wav"""
import os, sys, wave
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'tools'))
from audiolib import SR, add, whoosh, sweep_whoosh, thump, click, bloop, chime, shimmer, drone, tone, note, lp_fast, rustle

ROOT = os.path.join(os.path.dirname(__file__), '..')
D = 103.0
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
E = [(0.35, bloop(700, 1200, 0.12), 0.05), (2.6, whoosh(0.9, 300, 2000, 0.5), 0.05), (4.6, whoosh(0.6, 2000, 300, 0.4), 0.05),
     (4.9, click(3200, 0.04), 0.03), (5.5, click(3000, 0.04), 0.03), (6.0, click(3200, 0.04), 0.03), (6.5, click(3000, 0.04), 0.03), (7.0, click(3200, 0.04), 0.03),
     (7.5, bloop(500, 900, 0.18), 0.05), (8.3, whoosh(1.0, 200, 3000, 0.9), 0.1), (9.5, bloop(600, 1000, 0.14), 0.05), (10.2, whoosh(0.5, 300, 2000, 0.4), 0.05),
     (11.15, sweep_whoosh(0.8, 2000, 300), 0.06)]
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
