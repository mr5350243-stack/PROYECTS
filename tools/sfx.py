"""Diseño sonoro procedural sincronizado con la línea de tiempo del video.

Genera audio/music.wav (cama musical) y audio/sfx.wav (efectos), 48 kHz estéreo.
Los tiempos replican la lógica de animación de cada escena (video/src/scenes/*.js).
Uso: python3 tools/sfx.py
"""
import math
import os
import wave

import numpy as np

SR = 48000
DUR = 118.5
N = int(SR * DUR)
rng = np.random.default_rng(7)
OUT = os.path.join(os.path.dirname(__file__), '..', 'audio')
os.makedirs(OUT, exist_ok=True)

music = np.zeros((N, 2))
sfx = np.zeros((N, 2))


def t_arr(d):
    return np.arange(int(d * SR)) / SR


def env(n, a=0.005, r=0.2, shape=4.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * shape / max(r, 1e-4))
    return e


def lp(x, cutoff):
    """filtro paso bajo de un polo"""
    a = math.exp(-2 * math.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def lp_fast(x, cutoff):
    # versión vectorizada aproximada vía FFT
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    H = 1 / np.sqrt(1 + (f / cutoff) ** 4)
    return np.fft.irfft(X * H, len(x))


def hp_fast(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    H = 1 / np.sqrt(1 + (cutoff / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X * H, len(x))


def bp_fast(x, lo, hi):
    return hp_fast(lp_fast(x, hi), lo)


def add(buf, t0, sig, gain=1.0, pan=0.0):
    i0 = int(t0 * SR)
    if i0 >= N:
        return
    if i0 < 0:
        sig = sig[-i0:]
        i0 = 0
    n = min(len(sig), N - i0)
    l = math.cos((pan + 1) * math.pi / 4)
    r = math.sin((pan + 1) * math.pi / 4)
    buf[i0:i0 + n, 0] += sig[:n] * gain * l * 1.4142
    buf[i0:i0 + n, 1] += sig[:n] * gain * r * 1.4142


def noise(d):
    return rng.standard_normal(int(d * SR))


# ---------------- efectos básicos ----------------
def whoosh(d=1.0, lo=300, hi=3000, rise=0.6):
    n = noise(d)
    t = t_arr(d)
    k = np.clip(t / (d * rise), 0, 1)
    shape = np.where(t < d * rise, k ** 2, np.exp(-(t - d * rise) * 7 / d))
    sig = bp_fast(n, lo, hi) * shape
    return sig / (np.abs(sig).max() + 1e-9)


def sweep_whoosh(d=0.8, f0=200, f1=4000):
    n = noise(d)
    t = t_arr(d)
    out = np.zeros_like(n)
    seg = 8
    for s in range(seg):
        a, b = s * len(n) // seg, (s + 1) * len(n) // seg
        fc = f0 * (f1 / f0) ** (s / seg)
        out[a:b] = bp_fast(n, fc * 0.6, fc * 1.6)[a:b]
    shape = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
    out = out * shape
    return out / (np.abs(out).max() + 1e-9)


def tone(f, d, a=0.01, r=0.5, shape=3, harm=(1, 0.3, 0.1)):
    t = t_arr(d)
    s = sum(h * np.sin(2 * np.pi * f * (i + 1) * t) for i, h in enumerate(harm))
    return s * env(len(t), a, r, shape)


def chime(f, d=2.0):
    t = t_arr(d)
    s = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 3) + 0.25 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 6)
    return s * env(len(t), 0.003, d, 3.5)


def click(f=2500, d=0.05, q=1.0):
    n = noise(d)
    s = bp_fast(n, f * 0.6, f * 1.6) * env(len(n), 0.0005, d, 6)
    s += tone(f * 0.4, d, 0.0005, d, 8, (1,)) * 0.3
    return s / (np.abs(s).max() + 1e-9)


def thump(f=55, d=0.35):
    t = t_arr(d)
    freq = f * (1 + 1.5 * np.exp(-t * 30))
    ph = 2 * np.pi * np.cumsum(freq) / SR
    return np.sin(ph) * env(len(t), 0.002, d, 5)


def bloop(f0=300, f1=700, d=0.25):
    t = t_arr(d)
    freq = f0 + (f1 - f0) * (1 - np.exp(-t * 18))
    ph = 2 * np.pi * np.cumsum(freq) / SR
    return np.sin(ph) * env(len(t), 0.003, d, 5)


def rustle(d=0.6):
    n = noise(d)
    am = np.abs(lp_fast(noise(d), 18)) * 4
    s = bp_fast(n, 1500, 7000) * np.clip(am, 0, 1.5) * np.sin(np.pi * np.clip(t_arr(d) / d, 0, 1))
    return s / (np.abs(s).max() + 1e-9)


def step(d=0.18, bright=1.0):
    n = noise(d)
    s = bp_fast(n, 150, 1800 * bright) * env(len(n), 0.002, 0.08, 5)
    s += thump(70, d) * 0.6
    return s / (np.abs(s).max() + 1e-9)


def creak(d=1.0, f=180):
    t = t_arr(d)
    freq = f * (1 + 0.25 * np.sin(2 * np.pi * 1.3 * t) + 0.05 * noise(d) * 0)
    pulses = (np.sin(2 * np.pi * np.cumsum(freq) / SR) > 0.97).astype(float)
    s = bp_fast(pulses + 0.02 * noise(d), 300, 2500) * np.sin(np.pi * np.clip(t / d, 0, 1))
    return s / (np.abs(s).max() + 1e-9)


def bird(d=0.4, f=3200):
    t = t_arr(d)
    freq = f * (1 + 0.25 * np.sin(2 * np.pi * 18 * t)) * (1 + 0.3 * t / d)
    s = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    return s


def shimmer(d=2.0, base=1200):
    s = np.zeros(int(d * SR))
    for k in range(10):
        f = base * (1 + k * 0.37) * (1 + rng.random() * 0.02)
        st = rng.random() * d * 0.5
        c = chime(f, d - st) * 0.2
        i = int(st * SR)
        s[i:i + len(c)] += c[:len(s) - i]
    return s / (np.abs(s).max() + 1e-9)


def drone(freqs, d, amp=1.0, bright=900):
    t = t_arr(d)
    s = np.zeros(len(t))
    for f in freqs:
        for det in (-0.12, 0.0, 0.13):
            ff = f * (1 + det / 100)
            saw = 2 * ((ff * t + rng.random()) % 1) - 1
            s += saw * 0.25 + np.sin(2 * np.pi * ff * t) * 0.6
    s = lp_fast(s, bright)
    return s / (np.abs(s).max() + 1e-9) * amp


def note(name):
    names = {'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2}
    n, o = name[:-1], int(name[-1])
    return 440 * 2 ** ((names[n] + (o - 4) * 12) / 12)


# ---------------- música (cama armónica por secciones) ----------------
sections = [
    # (inicio, fin, acorde, brillo, ganancia)
    (0.0, 4.2, ['F2', 'C3', 'A3', 'E4'], 1400, 0.8),           # calma inicial (Fmaj7)
    (3.6, 20.5, ['A2', 'E3', 'C4', 'B3'], 700, 0.8),           # inquietud (Am add9)
    (19.5, 30.0, ['D2', 'A2', 'F3', 'G#3'], 600, 0.85),        # hospital (tensión disminuida)
    (29.0, 38.8, ['E2', 'B2', 'G3', 'D4'], 1500, 0.8),         # mente (Em7)
    (38.0, 48.4, ['C2', 'G2', 'E3', 'B3'], 1100, 0.75),        # bosque (Cmaj7)
    (47.5, 61.8, ['A2', 'E3', 'G3', 'D4'], 900, 0.8),          # puertas (Am11)
    (61.0, 76.2, ['F2', 'C3', 'G#3', 'D#4'], 800, 1.0),        # crece / dominó (tensión)
    (75.6, 87.0, ['D2', 'A2', 'F3', 'C4'], 700, 0.85),         # corazón (Dm7)
    (86.3, 99.2, ['F2', 'C3', 'A3', 'G4'], 1100, 0.8),         # realidad (Fadd9)
    (98.3, 110.3, ['C2', 'G2', 'E3', 'D4'], 1500, 0.8),        # perspectiva (Cadd9)
    (109.4, 118.5, ['F2', 'C3', 'A3', 'E4', 'G4'], 1700, 0.85),  # cierre (Fmaj9)
]
for a, b, chord, bright, g in sections:
    d = b - a
    s = drone([note(n) for n in chord], d, 1.0, bright)
    t = t_arr(d)
    fade = np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.6)
    s *= fade * g
    add(music, a, s, 0.5, -0.15)
    add(music, a, np.roll(s, 2400), 0.5, 0.15)
# sub-pulso de tensión en escenas de ansiedad
for a, b, bpm in [(4.0, 20.0, 70), (61.4, 73.0, 96)]:
    k = 0
    while a + k * 60 / bpm < b:
        add(music, a + k * 60 / bpm, thump(48, 0.5), 0.35 * min(1, (k + 1) / 6))
        k += 1
# arpegio suave al final (resolución)
arp = ['F4', 'A4', 'C5', 'E5', 'G5', 'E5', 'C5', 'A4']
for k in range(16):
    tt = 110.4 + k * 0.42
    add(music, tt, chime(note(arp[k % 8]), 1.6), 0.10 * (1 - k / 20), (k % 2) * 0.4 - 0.2)
music_t = np.arange(N) / SR
music *= np.minimum(1, music_t / 1.0)[:, None] * np.minimum(1, (DUR - music_t) / 2.4)[:, None]

# ---------------- efectos sincronizados ----------------
# transiciones (whoosh / destellos)
for t0, kind in [(9.8, 'into'), (16.9, 'whip'), (20.0, 'diss'), (29.3, 'flash'), (38.3, 'flash'), (47.9, 'diss'), (61.4, 'whip'),
                 (67.6, 'flash'), (76.0, 'diss'), (86.7, 'whip'), (98.75, 'soft'), (109.8, 'soft')]:
    if kind == 'whip':
        add(sfx, t0 - 0.35, sweep_whoosh(0.7, 300, 5000), 0.35, 0.5)
    elif kind == 'into':
        add(sfx, t0 - 1.2, whoosh(1.6, 80, 1200, 0.75), 0.45)
        add(sfx, t0 - 0.05, chime(880, 1.5), 0.08)
    elif kind == 'diss':
        add(sfx, t0 - 0.65, shimmer(1.8, 1500), 0.18)
        add(sfx, t0 - 0.65, whoosh(1.3, 1500, 9000, 0.5), 0.12)
    elif kind == 'flash':
        add(sfx, t0 - 0.9, whoosh(1.2, 200, 6000, 0.75), 0.35)
        add(sfx, t0 - 0.02, chime(1320, 2.0), 0.07)
    else:
        add(sfx, t0 - 0.6, whoosh(1.4, 150, 2000, 0.5), 0.12)

# ESCENA 1: notificaciones al hacer scroll, cambio de humor (golpe grave)
for k in range(5):
    add(sfx, 0.8 + k * 0.6, click(3800, 0.03), 0.05, 0.2)
add(sfx, 3.75, thump(42, 1.2), 0.5)
add(sfx, 3.8, whoosh(1.5, 60, 400, 0.2), 0.2)
# ESCENA 2: mensaje enviado, reloj acelerado, comprobaciones
add(sfx, 10.3, bloop(500, 1100, 0.18), 0.12, 0.3)
tt = 14.2
k = 0
while tt < 15.75:
    add(sfx, tt, click(3000 + (k % 2) * 600, 0.025), 0.12, -0.3)
    tt += max(0.035, 0.32 * (0.82 ** k))
    k += 1
for tt in [15.95, 16.45, 16.7]:
    add(sfx, tt, click(1800, 0.02), 0.05, 0.2)
# escena imaginada: golpe sordo al darse la vuelta el amigo
add(sfx, 17.8, thump(38, 1.4), 0.45)
add(sfx, 17.8, whoosh(0.9, 100, 900, 0.3), 0.15)
# ESCENA 3: transformación al pasillo, zumbido fluorescente y alarma roja
add(sfx, 23.3, whoosh(2.2, 60, 900, 0.85), 0.3)
d = 27.9 - 23.5
t = t_arr(d)
hum = (np.sin(2 * np.pi * 120 * t) + 0.4 * np.sin(2 * np.pi * 240 * t)) * np.minimum(1, t / 1.0)
add(sfx, 23.5, hum, 0.05)
for k in range(40):
    tb = 20.0 + (math.pi / 2 + 2 * math.pi * k) / 7.5  # picos de sin(t*7.5)
    if 23.6 < tb < 27.85:
        add(sfx, tb - 0.04, tone(880, 0.22, 0.005, 0.18, 6, (1, 0.2)), 0.07, 0.4)
add(sfx, 27.9, click(500, 0.08), 0.3)
add(sfx, 27.9, shimmer(1.0, 900), 0.05)
# ESCENA 4: crepitar neuronal, señal que llega, activación roja
for k in range(140):
    tt = 29.3 + rng.random() * 9.0
    add(sfx, tt, click(4000 + rng.random() * 4000, 0.015), 0.025 + rng.random() * 0.02, rng.random() * 2 - 1)
for k in range(6):
    add(sfx, 29.3 + 3.9 + k * 0.22, bloop(600 + k * 120, 900 + k * 150, 0.12), 0.05)
add(sfx, 34.4, thump(36, 2.0), 0.6)
add(sfx, 34.45, tone(110, 2.4, 0.01, 2.0, 2, (1, 0.5, 0.3, 0.2)), 0.12)
add(sfx, 34.8, whoosh(2.5, 300, 4000, 0.3), 0.1)
# ESCENA 5: bosque — ambiente, pájaros, pasos, arbusto, rama, conejo
d = 9.6
amb = bp_fast(noise(d), 200, 2500) * 0.08
add(sfx, 38.3, amb * np.minimum(1, t_arr(d) / 1) * np.minimum(1, (d - t_arr(d)) / 0.8), 0.6)
for k in range(9):
    add(sfx, 38.5 + rng.random() * 9, bird(0.25 + rng.random() * 0.3, 2600 + rng.random() * 1800), 0.03, rng.random() * 2 - 1)
prev = 0
for i in range(1, 300):
    lt = i / 100
    if lt > 2.6:
        break
    dist = 1.15 * lt - 0.25 * max(0, lt - 2.0) ** 2
    ph = int(dist / 1.25 * 2)
    if ph != prev:
        add(sfx, 38.3 + lt, step(0.18, 0.8), 0.18, 0.1)
        prev = ph
add(sfx, 38.3 + 2.62, step(0.2), 0.15)
add(sfx, 38.3 + 2.4, rustle(0.75), 0.22, 0.5)
add(sfx, 38.3 + 3.6, rustle(2.6), 0.25, 0.5)
add(sfx, 38.3 + 4.62, click(1200, 0.12), 0.35, 0.5)   # rama
add(sfx, 38.3 + 4.45, step(0.2), 0.2)                  # paso atrás
add(sfx, 38.3 + 4.0, thump(50, 0.8), 0.25)
for k in range(8):
    add(sfx, 38.3 + 5.9 + (k + 1) * 3.5 / 8, step(0.1, 2.0), 0.05, 0.3 - k * 0.05)
add(sfx, 38.3 + 7.2, chime(660, 1.2), 0.04)
# ESCENA 6: puertas que se abren, atravesar puertas, discusión
for k, tt in enumerate([48.5, 48.85, 49.2]):
    add(sfx, tt, creak(1.5, 160 + k * 30), 0.06, (k - 1) * 0.6)
    add(sfx, tt + 0.1, shimmer(1.6, 800 + k * 300), 0.05, (k - 1) * 0.6)
for tt in [54.2, 56.0, 57.6, 59.4]:
    add(sfx, tt, whoosh(1.0, 200, 2000, 0.5), 0.12)
for k in range(10):
    add(sfx, 57.2 + k * 0.26, thump(90 + (k % 3) * 20, 0.15), 0.05)
# ESCENA 7: esferas que aparecen, se dividen y lo rodean
add(sfx, 61.8, bloop(200, 500, 0.6), 0.15)
add(sfx, 61.8, tone(220, 1.6, 0.3, 1.4, 1.5, (1, 0.4)), 0.05)
for k in range(15):
    add(sfx, 61.4 + 2.0 + k * 0.16 + 0.05, bloop(400 + k * 40, 900 + k * 40, 0.14), 0.07, (k % 5) / 2.5 - 0.8)
for tt in [64.25, 64.7, 65.15, 65.6]:
    add(sfx, tt, sweep_whoosh(0.35, 400, 3000), 0.12, 0.3)
add(sfx, 66.5, whoosh(1.1, 100, 3000, 0.85), 0.2)
# ESCENA 8: fichas de dominó (impactos), congelación, burbuja
T = 0.6
for i in range(21):
    tau = 0.155 * 1.047 ** i
    if i < 20:
        add(sfx, 67.6 + T + tau, click(4200 / (1 + i * 0.22), 0.06 + i * 0.01), 0.12 + i * 0.02, math.sin(i) * 0.5)
        if i > 10:
            add(sfx, 67.6 + T + tau, thump(90 - i * 2.5, 0.4 + i * 0.03), 0.12 + (i - 10) * 0.04)
    T += tau
add(sfx, 72.95, sweep_whoosh(0.5, 3000, 200), 0.25)
add(sfx, 72.95, tone(55, 3.0, 0.01, 3.0, 1.5, (1, 0.3)), 0.12)
add(sfx, 73.3, shimmer(2.8, 1100), 0.2)
add(sfx, 73.4, whoosh(2.5, 300, 5000, 0.5), 0.15)
# ESCENA 9: latido y respiración (replica la animación del corazón)
last_beat = -1
for i in range(int(10.7 * 200)):
    lt = i / 200
    calm = min(1, max(0, (lt - 8.0) / 2.5))
    calm = calm * calm * (3 - 2 * calm)
    bpm = 1.7 + (1.1 - 1.7) * calm
    b = math.floor(lt * bpm)
    if b != last_beat:
        last_beat = b
        g = 0.5 if 0.6 < lt < 10.5 else 0.2
        add(sfx, 76.0 + lt, thump(52, 0.3), g)
        add(sfx, 76.0 + lt + 0.18, thump(46, 0.3), g * 0.6)
for i in range(16):
    rate = 0.85 if i < 10 else 0.5
    tt = 76.2 + i / rate * 0.9
    if tt > 86.5:
        break
    add(sfx, tt, bp_fast(noise(0.6), 500, 2500) * np.sin(np.pi * t_arr(0.6) / 0.6) ** 2, 0.03)
# ESCENA 10: cruzar el cristal, fusión de espacios
add(sfx, 90.6, shimmer(1.8, 2000), 0.18)
add(sfx, 90.7, sweep_whoosh(0.8, 500, 6000), 0.15)
for k in range(10):
    add(sfx, 86.7 + 6 + k * 0.08, click(2600 + (k % 3) * 300, 0.02), 0.02, 0.5)   # teclear
add(sfx, 95.5, shimmer(2.5, 1300), 0.15)
add(sfx, 95.5, whoosh(2.2, 400, 4000, 0.4), 0.08)
# ESCENA 11: esferas que se abren (campanas), alejamiento
for tt, f in [(101.55, 784), (103.75, 659), (105.75, 523)]:
    add(sfx, tt, chime(f, 2.5), 0.12)
    add(sfx, tt, whoosh(0.8, 800, 5000, 0.4), 0.05)
add(sfx, 107.75, whoosh(2.4, 200, 3000, 0.6), 0.12)
# ESCENA 12: deja el teléfono sobre la mesa, respiración tranquila
add(sfx, 112.2, click(1400, 0.06), 0.25, 0.1)
add(sfx, 112.2, thump(120, 0.12), 0.1)
add(sfx, 113.4, bp_fast(noise(1.6), 300, 1800) * np.sin(np.pi * t_arr(1.6) / 1.6) ** 2, 0.05)
# tono de sala del apartamento (escenas 1, 2, 9, 12)
for a, b in [(0, 16.9), (76.0, 86.7), (109.8, 118.5)]:
    d = b - a
    rt = lp_fast(noise(d), 250) * 0.6
    tt = t_arr(d)
    add(sfx, a, rt * np.minimum(1, tt / 0.5) * np.minimum(1, (d - tt) / 0.5), 0.05)

sfx *= np.minimum(1, (DUR - music_t) / 2.4)[:, None]


def write(name, buf, peak=0.7):
    buf = buf / (np.abs(buf).max() + 1e-9) * peak
    data = (np.clip(buf, -1, 1) * 32767).astype('<i2')
    with wave.open(os.path.join(OUT, name), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


write('music.wav', music, 0.7)
write('sfx.wav', sfx, 0.8)
print('ok', N / SR, 's')
