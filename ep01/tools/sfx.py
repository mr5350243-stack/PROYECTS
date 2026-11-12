"""Música y efectos del episodio 01 (síntesis propia, misma paleta sonora que la prueba aprobada) + mezcla con la voz.
Los tiempos coinciden con los de las escenas y fx_data.js. Salida: ep01/audio/mix.wav"""
import os, sys, wave
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'tools'))
from audiolib import SR, add, whoosh, sweep_whoosh, thump, click, bloop, chime, shimmer, drone, tone, note, lp_fast

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
    (0.05, sweep_whoosh(0.5, 300, 3000), 0.18), (0.5, bloop(500, 900, 0.12), 0.12), (0.95, bloop(550, 950, 0.12), 0.12), (1.45, bloop(650, 1100, 0.14), 0.14),
    (1.7, whoosh(0.5, 600, 3000, 0.4), 0.06), (2.1, click(3000, 0.04), 0.05),
    (3.5, bloop(400, 800, 0.2), 0.16), (3.95, shimmer(0.8, 1600), 0.06), (4.85, click(2500, 0.04), 0.06),
    (4.85, sweep_whoosh(0.5, 600, 4000), 0.12), (5.35, whoosh(2.0, 150, 3500, 0.95), 0.32),
    (6.75, bloop(500, 900, 0.14), 0.13), (7.0, thump(70, 0.4), 0.3), (7.72, sweep_whoosh(0.35, 5000, 400), 0.22), (7.72, thump(45, 0.6), 0.35),
    (7.85, whoosh(0.5, 300, 3000, 0.5), 0.18), (8.12, whoosh(0.6, 250, 2500, 0.4), 0.18),
    (8.86, thump(60, 0.5), 0.35), (8.9, sweep_whoosh(0.3, 800, 5000), 0.12),
    (10.65, bloop(700, 1000, 0.12), 0.1), (15.55, sum(click(2200, 0.05) * 1 for _ in [0]), 0.08), (15.71, click(2400, 0.05), 0.08), (15.87, click(2600, 0.05), 0.08),
    (16.05, chime(note('A5'), 0.8), 0.08), (18.45, bloop(600, 1000, 0.15), 0.11), (19.5, bloop(650, 1100, 0.15), 0.11), (22.3, whoosh(1.2, 200, 4000, 0.9), 0.3),
]
for t0, sig, g in E: add(fx, t0, sig, g)
# pelota amarilla: rebotes (|sin(4.6 t)| = 0)
for k in range(1, 8):
    tb = k * np.pi / 4.6
    if tb < 4.85: add(fx, tb, bloop(700, 350, 0.1), 0.1, pan=0.25 * np.sin(tb * 2.3 - 0.4))

def read(path):
    w = wave.open(path); a = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32768
    return a.reshape(-1, w.getnchannels())
os.system(f"ffmpeg -v error -y -i {ROOT}/assets/narracion.mp3 -ac 1 -ar {SR} {ROOT}/audio/voz.wav")
voice = read(f'{ROOT}/audio/voz.wav')[:, 0]
v = np.zeros_like(music); n = min(len(voice), len(v)); v[:n, 0] = voice[:n]; v[:n, 1] = voice[:n]
envv = lp_fast(np.abs(v[:, 0]), 6); envv /= envv.max() + 1e-9
duck = 1 - 0.55 * np.clip(envv * 3, 0, 1)
mix = v + music * duck[:, None] * 0.9 + fx * 0.9
fade = np.ones(len(mix)); nf = int(0.6 * SR); fade[-nf:] = np.linspace(1, 0, nf) ** 1.5
mix *= fade[:, None]; mix /= max(1.0, np.abs(mix).max() / 0.95)
w = wave.open(f'{ROOT}/audio/mix_pre.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype('<i2').tobytes()); w.close()
