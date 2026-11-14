"""Música y efectos de la prueba de atención (sin locución). Pulso enérgico (120 bpm), tic-tac de tensión durante el
juego, golpe al congelar, campanilla en la respuesta, rebobinado, y cierre que enlaza con el inicio (bucle)."""
import os, sys, wave
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'tools'))
from audiolib import SR, add, whoosh, sweep_whoosh, thump, click, bloop, chime, shimmer, drone, tone, note, lp_fast

D = 40.0
music = np.zeros((int(D * SR), 2)); fx = np.zeros_like(music)
beat = 60 / 120
prog = [('A2', ['A3', 'C4', 'E4']), ('F2', ['F3', 'A3', 'C4']), ('C3', ['C4', 'E4', 'G4']), ('G2', ['G3', 'B3', 'D4'])]
t = 0.0; i = 0
while t < D - 0.5:
    root, ch = prog[(i // 8) % 4]
    play = 4.5 <= t < 19.5
    calm = 19.5 <= t < 23.6
    if not calm:
        add(music, t, tone(note(root), beat * 0.8, 0.004, 0.2, 5, (1, 0.5, 0.2)), 0.22)
        if i % 2 == 0: add(music, t, thump(55, 0.25), 0.3 if play else 0.2)
        if i % 2 == 1: add(music, t, click(6500, 0.03), 0.06)
        if i % 4 == 2:
            for k, n in enumerate(ch): add(music, t + k * 0.01, tone(note(n) * 2, beat * 0.5, 0.002, 0.12, 7, (1, 0.25)), 0.05, pan=(k - 1) * 0.5)
    t += beat / 2 if play else beat; i += 1
add(music, 19.5, drone([note('A2'), note('E3')], 4.1, 1.0, 700), 0.12)     # pausa para comentar: fondo suspendido
E = [(0.0, sweep_whoosh(0.5, 300, 3000), 0.18), (0.25, thump(55, 0.5), 0.3), (0.6, thump(60, 0.4), 0.22), (1.2, bloop(600, 1000, 0.14), 0.12),
     (2.5, tone(880, 0.25, 0.002, 0.2, 6, (1, 0.3)), 0.2), (3.1, tone(880, 0.25, 0.002, 0.2, 6, (1, 0.3)), 0.2), (3.7, tone(880, 0.25, 0.002, 0.2, 6, (1, 0.3)), 0.2),
     (4.3, tone(1320, 0.5, 0.002, 0.4, 4, (1, 0.4)), 0.25),
     (19.5, thump(45, 0.9), 0.5), (19.5, sweep_whoosh(0.4, 5000, 300), 0.25), (19.6, bloop(500, 900, 0.14), 0.12), (20.3, bloop(700, 1100, 0.14), 0.1),
     (23.8, chime(note('E6'), 1.2), 0.15), (23.83, chime(note('B6'), 1.1), 0.1), (24.0, thump(55, 0.5), 0.3),
     (26.2, sweep_whoosh(0.7, 4000, 200), 0.3), (27.4, thump(50, 0.6), 0.4), (29.2, thump(55, 0.5), 0.3), (30.6, bloop(500, 900, 0.16), 0.12), (31.4, bloop(600, 1000, 0.16), 0.12),
     (33.3, whoosh(0.6, 300, 2500, 0.5), 0.15), (34.3, shimmer(1.0, 1400), 0.05), (36.2, thump(55, 0.5), 0.3), (36.6, bloop(600, 1000, 0.12), 0.1), (36.85, bloop(650, 1050, 0.12), 0.1),
     (37.1, bloop(700, 1100, 0.12), 0.1), (37.6, bloop(800, 1200, 0.12), 0.1), (39.3, sweep_whoosh(0.7, 300, 3000), 0.15)]
for k in range(30): E.append((4.5 + k * 0.5, click(4200 if k % 2 else 3200, 0.03), 0.06))   # tic-tac del temporizador
for t0, sig, g in E: add(fx, t0, sig, g)
mix = music * 0.9 + fx
fade = np.ones(len(mix)); nf = int(0.25 * SR); fade[-nf:] = np.linspace(1, 0.4, nf)
mix *= fade[:, None]; mix /= max(1.0, np.abs(mix).max() / 0.95)
os.makedirs('viral01/audio', exist_ok=True)
w = wave.open('viral01/audio/mix_pre.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype('<i2').tobytes()); w.close()
