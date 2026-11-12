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
from audiolib import SR, add, drone, note, t_arr, whoosh, sweep_whoosh, thump, shimmer, click, env, noise, lp_fast, hp_fast, bp_fast, tone, chime, bloop, rustle, step, bird  # noqa: E402

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


def amb(d, lo, hi, gain=1.0, fade=0.6):
    """Ambiente de ruido filtrado con fundidos."""
    t = t_arr(d)
    x = bp_fast(noise(d), lo, hi)
    x = x / (np.abs(x).max() + 1e-9)
    return x * np.minimum(1, t / fade) * np.minimum(1, (d - t) / fade) * gain


def buzz(d=0.35, f=140):
    """Estímulo desagradable (zumbido áspero)."""
    t = t_arr(d)
    sq = np.sign(np.sin(2 * np.pi * f * t)) * 0.6 + bp_fast(noise(d), 800, 4000) * 0.5
    return sq * env(len(t), 0.002, d, 4)


def siren_beep(d=0.28, f=880):
    t = t_arr(d)
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2 * t)) * env(len(t), 0.005, d, 3)


def murmur(d):
    """Murmullo de público: ruido de banda vocal con modulación lenta."""
    t = t_arr(d)
    x = bp_fast(noise(d), 250, 1800)
    am = 0.6 + 0.4 * lp_fast(noise(d), 3) * 6
    x = x * np.clip(am, 0.1, 1.4)
    return x / (np.abs(x).max() + 1e-9) * np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 0.8)


def tick_seq(t0, t1, period, gain, f=3200, pan=0.0):
    k = t0
    while k < t1:
        add(sfx, k, click(f, 0.03) * gain, 1.0, pan)
        k += period


# títulos cinéticos: golpe suave + destello
for ts in (30.7, 43.4, 68.4, 72.4, 80.8, 95.0):
    add(sfx, ts - 0.15, whoosh(0.4, 600, 5000, 0.8) * 0.25)
    add(sfx, ts, title_hit() * 0.45)

# ---------------- ESCENA 02 (11.05–19.9): el cuerpo en alerta ----------------
S2 = 11.05
add(sfx, S2 - 0.3, sweep_whoosh(0.9, 2400, 120) * 0.45)                 # la onda se contrae en el corazón
for k in range(16):                                                      # latido rápido (1.75 Hz)
    tt = S2 + 0.3 + k / 1.75
    if tt < S2 + 8.6:
        add(sfx, tt, heartbeat(0.75))
add(sfx, S2 + 1.5, riser(1.2, 60, 260) * 0.35)                           # tensión en hombros
add(sfx, S2 + 3.0, shimmer(3.2, 900) * 0.18)                             # partículas que suben
add(sfx, S2 + 3.0, riser(2.6, 300, 1600) * 0.22)
add(sfx, S2 + 4.8, chime(note('E5'), 2.0) * 0.25)                        # aparece el cerebro
add(sfx, S2 + 7.2, whoosh(1.7, 200, 2500, 0.9) * 0.5)                   # entrada en el cerebro

# ---------------- ESCENA 03 (19.9–23.9): red protectora ----------------
S3 = 19.9
for k in range(14):
    add(sfx, S3 + 0.3 + k * 0.27, bloop(500 + (k * 137) % 600, 900 + (k * 211) % 700, 0.16) * 0.12, 1.0, ((k * 37) % 10 - 5) / 6)
add(sfx, S3 + 0.6, sweep_whoosh(2.4, 150, 3000) * 0.3)                   # se enciende el escudo
add(sfx, S3 + 2.6, chime(note('B4'), 2.0) * 0.25)
add(sfx, S3 + 2.6, whoosh(1.6, 300, 4000, 0.85) * 0.55)                  # vuelo a través de la red
add(sfx, S3 + 3.95, boom(1.6, 55) * 0.35)

# ---------------- ESCENA 03b (23.9–30.3): bosque ----------------
S3b = 23.9
add(sfx, S3b, amb(6.6, 300, 2500, 0.22), 1.0)                            # viento suave
for k, (dt, f) in enumerate([(0.4, 3400), (1.3, 2900), (3.9, 3600), (5.2, 3100)]):
    add(sfx, S3b + dt, bird(0.35, f) * 0.12, 1.0, -0.5 + k * 0.3)
for k in range(5):                                                       # pasos hasta detenerse
    add(sfx, S3b + 0.15 + k * 0.38, step(0.18, 0.8) * 0.4, 1.0, -0.2)
add(sfx, S3b + 1.7, rustle(0.6) * 0.6, 1.0, 0.4)                         # ruido en el arbusto
add(sfx, S3b + 2.55, rustle(1.9) * 0.55, 1.0, 0.4)
add(sfx, S3b + 2.8, riser(0.9, 90, 300) * 0.25)                          # tensión
for k in range(7):                                                       # saltitos del conejo
    add(sfx, S3b + 4.15 + k * 0.31, thump(160, 0.12) * 0.25, 1.0, 0.2)
add(sfx, S3b + 4.8, chime(note('G5'), 1.5) * 0.15)                       # alivio
add(sfx, S3b + 5.1, whoosh(1.4, 400, 3000, 0.8) * 0.35, 1.0, -0.3)       # la hoja gira hacia la cámara

# ---------------- ESCENA 04 (30.3–40.1): laboratorio ----------------
S4 = 30.3
add(sfx, S4, amb(9.8, 80, 400, 0.12))                                    # zumbido del laboratorio
add(sfx, S4 + 0.1, whoosh(1.2, 500, 4000, 0.3) * 0.3)                    # la tarjeta se posa
add(sfx, S4 + 1.45, click(1800, 0.05) * 0.3)
for c0, s0 in ((2.6, 3.5), (6.2, 7.15)):                                 # A: aviso luminoso → estímulo
    add(sfx, S4 + c0, tone(1320, 0.5, 0.005, 0.4, 4, (1, 0.2)) * 0.3, 1.0, -0.4)
    add(sfx, S4 + s0, buzz(0.32) * 0.45, 1.0, -0.4)
for s0 in (4.4, 8.95):                                                   # B: estímulo sin aviso
    add(sfx, S4 + s0, buzz(0.36, 120) * 0.6, 1.0, 0.4)
    add(sfx, S4 + s0, thump(80, 0.3) * 0.35, 1.0, 0.4)
add(sfx, S4 + 7.6, whoosh(0.9, 300, 2000, 0.5) * 0.25)                   # travelling al otro lado

# ---------------- ESCENA 05 (40.1–53.6): incertidumbre ----------------
S5 = 40.1
add(sfx, S5 - 0.25, boom(1.4, 50) * 0.4)
for i, (per, f, pan) in enumerate([(0.5, 3300, -0.6), (0.37, 2600, 0.5), (0.71, 4100, 0.1), (0.29, 3000, -0.2)]):
    tick_seq(S5 + 0.1 + i * 0.07, S5 + 11.6, per, 0.07, f, pan)          # relojes desincronizados
for s0 in (2.35, 5.15, 6.05, 8.75, 11.1):                                # señales de advertencia impredecibles
    add(sfx, S5 + s0, siren_beep(0.12, 1250) * 0.35)
    add(sfx, S5 + s0 + 0.13, siren_beep(0.16, 940) * 0.35)
    add(sfx, S5 + s0 + 0.02, thump(90, 0.25) * 0.45)
add(sfx, S5 + 11.6, whoosh(1.6, 300, 3500, 0.85) * 0.45)                 # el reloj vuela a la cámara
add(sfx, S5 + 13.0, bloop(400, 900, 0.2) * 0.3)                          # se convierte en teléfono

# ---------------- ESCENA 06 (53.6–60.75): mensaje sin respuesta ----------------
S6 = 53.6
add(sfx, S6 + 0.15, bloop(700, 1100, 0.15) * 0.25)                       # mensaje enviado
add(sfx, S6 + 1.6, tone(220, 4.5, 1.5, 3.0, 1.0, (1, 0.5, 0.2)) * 0.12)  # espera inquieta
for k, s0 in enumerate((2.6, 3.3, 4.0)):                                 # aparecen las burbujas
    add(sfx, S6 + s0, bloop(300 + k * 120, 650 + k * 160, 0.22) * 0.35, 1.0, (-0.5, 0.0, 0.5)[k])
add(sfx, S6 + 4.9, riser(1.3, 150, 900) * 0.3)                           # crecen y le rodean
add(sfx, S6 + 6.2, whoosh(0.9, 400, 3000, 0.6) * 0.4)                    # se convierte en calendario

# ---------------- ESCENA 07 (60.75–66.5): presentación ----------------
S7 = 60.75
add(sfx, S7 + 0.85, thump(130, 0.18) * 0.3)                              # el calendario en la pared
tick_seq(S7 + 0.4, S7 + 1.2, 0.09, 0.08, 2200, 0.2)                      # teclear
add(sfx, S7 + 1.3, chime(note('A5'), 1.2) * 0.2)                         # la fecha marcada
add(sfx, S7 + 2.3, sweep_whoosh(1.4, 120, 2500) * 0.4)                   # la habitación se transforma
add(sfx, S7 + 2.4, boom(1.8, 45) * 0.3)
add(sfx, S7 + 2.9, murmur(3.0) * 0.18)                                   # público
add(sfx, S7 + 3.2, thump(60, 0.4) * 0.4)                                 # se enciende el foco
for k in range(4):
    add(sfx, S7 + 3.6 + k * 0.58, heartbeat(0.45))
add(sfx, S7 + 5.0, riser(0.75, 300, 2500) * 0.35)                        # las luces se vuelven pulsos

# ---------------- ESCENA 08 (66.5–72.0): sensaciones reales ----------------
S8 = 66.5
add(sfx, S8 + 0.4, sweep_whoosh(1.0, 3000, 300) * 0.3)                   # aparece el modelo translúcido
for k in range(10):
    tt = S8 + 0.3 + k / 1.55
    if tt < S8 + 5.4:
        add(sfx, tt, heartbeat(0.7))
        add(sfx, tt + 0.02, chime(note('C6'), 0.6) * 0.04)
add(sfx, S8 + 4.9, sweep_whoosh(0.8, 2000, 200) * 0.3)

# ---------------- ESCENA 09 (72.0–77.0): alarma ≠ peligro ----------------
S9 = 72.0
for k in range(12):                                                      # alarma de dos tonos que se calma
    tt = S9 + 0.1 + k * 0.36
    g = 0.45 * max(0.08, 1 - max(0, tt - (S9 + 2.6)) / 1.8)
    add(sfx, tt, siren_beep(0.16, 1040 if k % 2 == 0 else 780) * g)
add(sfx, S9 + 1.0, whoosh(2.4, 200, 1500, 0.4) * 0.25)                   # dolly-out
add(sfx, S9 + 2.0, amb(3.0, 2000, 6000, 0.05))                           # habitación tranquila
add(sfx, S9 + 2.6, bird(0.3, 3300) * 0.1, 1.0, -0.6)
add(sfx, S9 + 4.1, chime(note('F5'), 1.8) * 0.22)                        # la luz se vuelve cálida

# ---------------- ESCENA 10 (77.0–86.0): terapia ----------------
S10 = 77.0
add(sfx, S10, amb(9.0, 100, 600, 0.06))
for k, s0 in enumerate((1.6, 1.95, 2.3)):                                # aparecen los tres objetos
    add(sfx, S10 + s0, bloop(500 + k * 150, 900 + k * 200, 0.2) * 0.3, 1.0, (-0.3, 0.0, 0.3)[k])
add(sfx, S10 + 3.2, whoosh(0.7, 800, 5000, 0.5) * 0.2)                   # la lupa examina
add(sfx, S10 + 4.0, chime(note('E5'), 1.5) * 0.15)                       # la interpretación cambia de color
for k in range(4):                                                       # sube un peldaño cada vez
    add(sfx, S10 + 4.8 + k * 0.55, tone(note('C5') * (1.122 ** (k * 2)), 0.35, 0.005, 0.3, 5, (1, 0.25)) * 0.18)
add(sfx, S10 + 8.0, riser(1.0, 300, 2000) * 0.25)                        # la escalera se ilumina
add(sfx, S10 + 8.5, chime(note('G5'), 2.0) * 0.2)

# ---------------- ESCENA 11 (86.0–94.6): comprender la respuesta ----------------
S11 = 86.0
for k in range(9):                                                       # pasos tranquilos
    add(sfx, S11 + 0.4 + k * 0.92, step(0.16, 0.6) * 0.25, 1.0, 0.1 if k % 2 else -0.1)
for k, z in enumerate((3.0, 2.0, 1.0, 0.0, -1.0, -2.0)):                 # pasa junto a cada viñeta
    tt = S11 + (3.6 - z) / 0.68 - 0.3
    add(sfx, tt, shimmer(1.2, 1400 + k * 120) * 0.08, 1.0, -0.5 if k % 2 == 0 else 0.5)
add(sfx, S11 + 6.4, riser(2.2, 200, 1800) * 0.3)                         # hacia la puerta
add(sfx, S11 + 7.9, shimmer(2.0, 1800) * 0.18)

# ---------------- ESCENA 12 (94.6–100.6): cierre ----------------
S12 = 94.6
add(sfx, S12, amb(6.0, 2500, 7000, 0.04))
add(sfx, S12 + 1.2, bird(0.35, 3500) * 0.08, 1.0, -0.6)
add(sfx, S12 + 2.6, bird(0.3, 3100) * 0.07, 1.0, -0.6)


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
