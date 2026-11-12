"""Música ligera + efectos para la prueba de 10 s (síntesis propia) y mezcla con la voz editada.
Salida: gorila/audio/mix.wav"""
import os, sys, wave
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'tools'))
from audiolib import SR, add, whoosh, sweep_whoosh, thump, click, bloop, chime, shimmer, drone, tone, note, noise, bp_fast, env, lp_fast

D = 10.0
music = np.zeros((int(D * SR), 2)); fx = np.zeros_like(music)

# --- música: pulso suave en Re menor; se detiene en el congelado y resuelve en mayor en el cierre
bpm = 112; beat = 60 / bpm
prog = [('D3', ['D4', 'F4', 'A4']), ('A#2', ['A#3', 'D4', 'F4']), ('F3', ['F4', 'A4', 'C5']), ('C3', ['C4', 'E4', 'G4'])]
t = 0.0; i = 0
while t < 7.85 - 0.01:
    root, chord = prog[(i // 4) % 4]
    add(music, t, tone(note(root), beat * 0.9, 0.005, 0.25, 4, (1, 0.5, 0.2)), 0.22)
    if i % 2 == 1:
        for k, n in enumerate(chord):
            add(music, t + k * 0.01, tone(note(n) * 2, beat * 0.6, 0.002, 0.14, 7, (1, 0.25)), 0.05, pan=(k - 1) * 0.5)
    if i % 4 in (0, 2): add(music, t, thump(52, 0.3), 0.32)
    if t > 3.2: add(music, t + beat / 2, click(7000, 0.03), 0.04, pan=0.3)
    t += beat; i += 1
pad = drone([note('D3'), note('A3'), note('F4')], 7.9, 1.0, 1100) * np.minimum(1, np.arange(int(7.9 * SR)) / SR / 1.5)
add(music, 0, pad, 0.07)
# cierre: acorde mayor brillante
for k, n in enumerate(['D4', 'F#4', 'A4', 'D5']):
    add(music, 8.0 + k * 0.03, tone(note(n), 2.0, 0.01, 1.8, 2.2, (1, 0.3, 0.1)), 0.08, pan=(k - 1.5) * 0.3)
add(music, 7.95, drone([note('D3'), note('A3')], 2.05, 1.0, 900), 0.08)

# --- efectos
add(fx, 0.05, sweep_whoosh(0.5, 300, 3000), 0.18)                   # entrada del ojo
for s in (0.25, 0.45, 0.62): add(fx, s, bloop(500, 900, 0.12), 0.12)  # palabras del título
# rebotes de la pelota amarilla (|sin(4.6 t)| = 0)
for k in range(0, 4):
    tb = k * np.pi / 4.6
    if 0.2 < tb < 1.9: add(fx, tb, bloop(700, 350, 0.1), 0.12, pan=0.2 * np.sin(tb * 2.3 - 0.4))
add(fx, 1.05, click(3000, 0.04), 0.05)                                # parpadeo
add(fx, 1.85, sweep_whoosh(0.5, 600, 4000), 0.12)                     # la pelota salta a la pupila
add(fx, 2.25, whoosh(1.0, 200, 4000, 0.9), 0.38)                      # zoom dentro de la pupila
add(fx, 3.18, thump(60, 0.5), 0.35)
# pases (mismo calendario que la animación)
def passes(team):
    out = []; t = 3.25 if team == 0 else 3.55
    for i in range(14):
        out.append((t + 0.26, t + 0.70, (i + team) % 3 == 1)); t += 0.70 + (0.08 if i % 2 else 0)
    return out
for team in (0, 1):
    for t0, t1, bounce in passes(team):
        if t1 > 7.85: break
        pan = -0.3 if team == 0 else 0.3
        if bounce and (t0 + t1) / 2 < 7.85: add(fx, (t0 + t1) / 2, thump(120, 0.14) * 0.8 + click(1800, 0.14) * 0.3, 0.16, pan)
        add(fx, t1, click(1200, 0.1) * 0.6 + thump(150, 0.1) * 0.6, 0.11, pan)
# pasos del gorila y golpes en el pecho
for k in range(12):
    ts = 3.6 + k * 0.6
    if 5.45 < ts < 6.25 or ts > 7.85: continue
    add(fx, ts, thump(70, 0.15), 0.08, 0.2)
for k in range(5): add(fx, 5.58 + k * 0.11, thump(90, 0.12) + 0.2 * bp_fast(noise(0.12), 200, 900) * env(int(0.12 * SR), 0.001, 0.05, 6), 0.14)
# congelado, círculo, lupa, cerebro, títulos e identidad
add(fx, 7.85, thump(45, 0.8), 0.5); add(fx, 7.85, sweep_whoosh(0.35, 4000, 300), 0.18)
add(fx, 7.9, sweep_whoosh(0.4, 800, 5000), 0.12)
add(fx, 8.05, whoosh(0.4, 400, 3000, 0.5), 0.15)
add(fx, 8.5, whoosh(0.5, 300, 2500, 0.6), 0.15)
add(fx, 8.88, bloop(300, 900, 0.3), 0.2); add(fx, 8.9, shimmer(1.0, 1500), 0.06)
for s, f in ((7.9, 600), (8.5, 700), (9.22, 800)): add(fx, s, bloop(f, f * 1.6, 0.16), 0.13)
add(fx, 9.3, chime(note('D6'), 0.7), 0.1); add(fx, 9.33, chime(note('A6'), 0.67), 0.07)

def read(path):
    w = wave.open(path); a = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32768
    return a.reshape(-1, w.getnchannels())
voice = read(os.path.join(os.path.dirname(__file__), '..', 'assets', 'voz_10s.wav'))[:, 0]
v = np.zeros_like(music); n = min(len(voice), len(v)); v[:n, 0] = voice[:n]; v[:n, 1] = voice[:n]
# ducking de la música bajo la voz
envv = lp_fast(np.abs(v[:, 0]), 6); envv = envv / (envv.max() + 1e-9)
duck = 1 - 0.55 * np.clip(envv * 3, 0, 1)
mix = v * 1.0 + music * duck[:, None] * 0.9 + fx * 0.9
fade = np.ones(len(mix)); nf = int(0.35 * SR); fade[-nf:] = np.linspace(1, 0, nf) ** 1.5
mix *= fade[:, None]
mix /= max(1.0, np.abs(mix).max() / 0.95)
os.makedirs('gorila/audio', exist_ok=True)
w = wave.open('gorila/audio/mix_pre.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype('<i2').tobytes()); w.close()
