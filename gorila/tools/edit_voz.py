# Ajusta la locución a 10 s sin cambiar la velocidad: recorta palabras en límites naturales y acorta pausas.
# Texto resultante: «¿Puedes mirar algo directamente y aún así no verlo? En un experimento, muchas personas
# no notaron a un gorila que cruzaba la escena. Ceguera por falta de atención.»
import subprocess, sys, numpy as np, wave
SR = 48000
src = sys.argv[1]; dst = sys.argv[2]
a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, dtype=np.float32)
PIECES = [(0.660, 3.790), ('gap', 0.22), (4.430, 4.640), (4.970, 9.220), ('gap', 0.18), (10.585, 12.530)]
F = int(0.008 * SR)
out = []
for p in PIECES:
    if p[0] == 'gap': out.append(np.zeros(int(p[1] * SR), np.float32)); continue
    seg = a[int(p[0] * SR):int(p[1] * SR)].copy()
    seg[:F] *= np.linspace(0, 1, F); seg[-F:] *= np.linspace(1, 0, F)
    out.append(seg)
y = np.concatenate(out); y = np.concatenate([y, np.zeros(int(10.0 * SR) - len(y), np.float32)])
w = wave.open(dst, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.clip(y, -1, 1) * 32767).astype('<i2').tobytes()); w.close()
print(len(y) / SR)
