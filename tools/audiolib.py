"""Funciones de síntesis compartidas (extraídas de tools/sfx.py): envolventes, filtros, whoosh, golpes, drones…"""
import math
import os
import wave

import numpy as np

SR = 48000
rng = np.random.default_rng(7)


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
    N = len(buf)
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


