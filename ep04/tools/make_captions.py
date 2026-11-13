"""Genera ep01/src/captions_data.js (TIPO E · subtítulos limpios) desde la transcripción con tiempos por palabra.
Para corregir texto o tiempos: editar FIX / KEYS / BREAK_AFTER aquí y volver a ejecutar; las escenas no cambian."""
import json, os, re
ROOT = os.path.join(os.path.dirname(__file__), '..')
W = json.load(open(os.path.join(ROOT, 'assets', 'transcripcion.json')))

# correcciones de la transcripción automática (índice: (texto, ...))
FIX = {'necesitas': 'necesita', 'puedes': 'puede'}   # la transcripción automática confundió la persona verbal
# unir tokens que la transcripción separa
words = []
for w, s, e in W:
    w = FIX.get(w, w)
    if w == '%' and words: words[-1][0] += ' %'; words[-1][2] = e; continue
    words.append([w, s, e])
# expresiones que nunca se separan entre grupos (se tratan como un único bloque)
GLUE = [('trato', 'especial'), ('centro', 'de'), ('falta', 'de'), ('segundo', 'plano')]
i = 0
while i < len(words) - 1:
    if (words[i][0].strip('¿¡,'), words[i + 1][0].strip('.,?!')) in GLUE:
        words[i] = [words[i][0] + '\u00a0' + words[i + 1][0], words[i][1], words[i + 1][2]]; del words[i + 1]
    i += 1

KEYS = {'narcisista', 'narcisistas', 'ama', 'cinco', 'señales', 'atención', 'centro', 'plano', 'crítica', 'lastimó', 'desprecio', 'enojo',
        'culpándote', 'consideración', 'sentimientos', 'minimizar', 'exageradas', 'especial', 'comprensión', 'concesiones', 'culpa', 'límite',
        'egoísta', 'diagnosticar', 'frecuencia', 'intensidad', 'contexto', 'patrón', 'manipulación', 'respeto', 'sana', 'límites', 'paz', 'peligrosa'}
MAXC, LINEC = 46, 23
FUNC = {'el', 'la', 'de', 'un', 'una', 'que', 'y', 'en', 'los', 'las', 'a', 'tu', 'tus', 'se', 'no', 'lo', 'del', 'por', 'como', 'qué', 'nuestra', 'nuestro', 'nuestros', 'su', 'pero', 'o', 'si', 'te', 'es', 'muy', 'tan', 'mucha', 'otros', 'al'}
def bare(w): return re.sub(r'[¿?¡!.,;:]', '', w).lower().split('\u00a0')[-1]

# 1) cláusulas: cortes obligatorios en puntuación fuerte o pausas
clauses, cur = [], []
for w, s, e in words:
    if cur and (s - cur[-1][2] > 0.3 or re.search(r'[.?!]$', cur[-1][0])):
        clauses.append(cur); cur = []
    cur.append([w, s, e])
clauses.append(cur)
# 2) cada cláusula se divide en grupos óptimos (programación dinámica)
def cost_chunk(ch):
    L = len(' '.join(x[0] for x in ch))
    if L > MAXC: return 1e9
    c = 10 + (8 if L < 12 else 0) + (14 if bare(ch[-1][0]) in FUNC else 0) - (4 if ch[-1][0].endswith(',') else 0)
    c += max(0, ch[-1][2] - ch[0][1] - 3.2) * 20
    c += max(0, 1.1 - (ch[-1][2] - ch[0][1])) * 18   # evita grupos que parpadean (< 1 s)
    return c
out = []
for cl in clauses:
    n = len(cl); best = [0] + [1e18] * n; arg = [0] * (n + 1)
    for j in range(1, n + 1):
        for i in range(max(0, j - 9), j):
            c = best[i] + cost_chunk(cl[i:j])
            if c < best[j]: best[j], arg[j] = c, i
    cuts = []; j = n
    while j > 0: cuts.append((arg[j], j)); j = arg[j]
    for i, j in reversed(cuts): out.append(cl[i:j])
# una palabra suelta muy corta se une a su vecino si cabe
merged = []
for g in out:
    if merged and len(' '.join(x[0] for x in g)) < 9 and len(' '.join(x[0] for x in merged[-1] + g)) <= MAXC and g[0][1] - merged[-1][-1][2] < 0.45 and not re.search(r'[.?!]$', merged[-1][-1][0]):
        merged[-1] += g
    else: merged.append(g)
out = merged

def lines(g):
    txt = [x[0] for x in g]
    if len(' '.join(txt)) <= LINEC or len(txt) == 1: return [list(range(len(g)))]
    best, bi = 1e9, 1
    for k in range(1, len(g)):
        a, b = len(' '.join(txt[:k])), len(' '.join(txt[k:]))
        cost = abs(a - b) + (0 if a >= b - 4 else 3) + (6 if bare(txt[k - 1]) in FUNC else 0)
        if cost < best: best, bi = cost, k
    return [list(range(bi)), list(range(bi, len(g)))]

caps = []
for i, g in enumerate(out):
    s = g[0][1]
    nxt = out[i + 1][0][1] if i + 1 < len(out) else g[-1][2] + 0.8
    e = min(nxt, g[-1][2] + 0.9)
    caps.append({'s': round(s, 2), 'e': round(e, 2), 'lines': [[[g[j][0], g[j][1], 1 if any(re.sub(r'[¿?¡!.,;:]', '', q).lower() in KEYS for q in g[j][0].split('\u00a0')) else 0] for j in ln] for ln in lines(g)]})

with open(os.path.join(ROOT, 'src', 'captions_data.js'), 'w') as f:
    f.write('// GENERADO por ep01/tools/make_captions.py desde assets/transcripcion.json — no editar a mano.\n')
    f.write('// lines: [[palabra, inicio_s, clave]] (máx. 2 líneas por grupo)\n')
    f.write('export const CAPTIONS = ' + json.dumps(caps, ensure_ascii=False) + ';\n')
    f.write(f'export const AUDIO_END = {words[-1][2]};\n')
print(len(caps), 'grupos')
for c in caps[:14]: print(c['s'], c['e'], ' / '.join(' '.join(w[0] for w in l) for l in c['lines']))
