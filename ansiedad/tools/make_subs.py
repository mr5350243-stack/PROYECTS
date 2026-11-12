# Genera ansiedad/src/subs.js a partir de la transcripción con marcas de tiempo por palabra
# (assets/transcripcion.json). Agrupa en bloques de 1–2 líneas cortadas en pausas/puntuación
# y marca las palabras clave que se destacan en amarillo.
# Uso: python3 ansiedad/tools/make_subs.py
import json, re, os

ROOT = os.path.join(os.path.dirname(__file__), '..')
segs = json.load(open(os.path.join(ROOT, 'assets', 'transcripcion.json')))

# correcciones ortográficas de la transcripción automática (no cambian el contenido de la locución)
FIX = {('un', 'alarma'): ('una', 'alarma')}
JOIN = {('cognitivo', 'conductual'): 'cognitivo-conductual'}

KEY = {'ansiedad', 'alarma', 'peligro', 'corazón', 'músculos', 'protección', 'amenazas', 'experimento',
       'incertidumbre', 'sobresalto', 'mensaje', 'discusión', 'presentación', 'nervios', 'físicas', 'reales',
       'amenaza', 'esperanzador', 'terapia', 'cognitivo-conductual', 'comprenderla', 'primer', 'paso', 'manejarla'}

words = []
for s in segs:
    for w in s['words']:
        words.append({'t': w['w'].strip(), 's': round(w['s'], 2), 'e': round(w['e'], 2)})
# aplicar correcciones
i = 0
out = []
while i < len(words):
    w = words[i]
    nxt = words[i + 1] if i + 1 < len(words) else None
    if nxt and (w['t'].lower(), re.sub(r'\W', '', nxt['t'].lower())) in JOIN:
        punct = re.sub(r'[\wáéíóúñü]', '', nxt['t'])
        out.append({'t': JOIN[(w['t'].lower(), re.sub(r'\W', '', nxt['t'].lower()))] + punct, 's': w['s'], 'e': nxt['e']}); i += 2; continue
    if nxt and (w['t'].lower(), nxt['t'].lower()) in FIX:
        a, b = FIX[(w['t'].lower(), nxt['t'].lower())]
        out.append({**w, 't': a}); out.append({**nxt, 't': b}); i += 2; continue
    out.append(w); i += 1
words = out
for w in words:
    w['k'] = 1 if re.sub(r'[^\wáéíóúñü-]', '', w['t'].lower()) in KEY else 0

# agrupar: corte en puntuación fuerte, pausa > 0.35 s o al superar ~30 caracteres
MAXC = 38
FUNC = {'un','una','la','el','los','las','de','que','y','a','en','tu','tus','no','ante','para','se','nos','es','como','o','sin','lo','al','del','por','cuando','hay'}
chunks, cur = [], []
def flush():
    if cur: chunks.append(list(cur)); cur.clear()
for j, w in enumerate(words):
    if cur:
        gap = w['s'] - cur[-1]['e']
        txt = ' '.join(x['t'] for x in cur)
        hard = gap > 0.35 or re.search(r'[.?!]$', cur[-1]['t']) or (re.search(r',$', cur[-1]['t']) and len(txt) > 16)
        if hard: flush()
        elif len(txt) + 1 + len(w['t']) > MAXC:
            # no terminar un bloque en palabra funcional: se pasa al siguiente
            carry = []
            while len(cur) > 1 and cur[-1]['t'].lower() in FUNC: carry.insert(0, cur.pop())
            flush(); cur.extend(carry)
    cur.append(w)
flush()
# fusionar fragmentos huérfanos cortos con el bloque anterior si caben en dos líneas
merged = []
for c in chunks:
    t = ' '.join(x['t'] for x in c)
    if merged and not re.search(r'[.?!]$', merged[-1][-1]['t']) and len(t) <= 12 and len(' '.join(x['t'] for x in merged[-1])) + 1 + len(t) <= 46 and c[0]['s'] - merged[-1][-1]['e'] < 0.5:
        merged[-1].extend(c)
    else: merged.append(c)
chunks = merged

# tiempos de cada bloque: desde la primera palabra hasta el inicio del siguiente (máx. 0.6 s tras la última)
blocks = []
for k, c in enumerate(chunks):
    start = c[0]['s'] - 0.05
    end = c[-1]['e'] + 0.6
    if k + 1 < len(chunks): end = min(end, chunks[k + 1][0]['s'] - 0.05)
    blocks.append({'s': round(start, 2), 'e': round(end, 2), 'w': [[x['t'], x['s'], x['e'], x['k']] for x in c]})

js = '// Generado por ansiedad/tools/make_subs.py a partir de assets/transcripcion.json — no editar a mano.\n'
js += '// Cada bloque: s/e = inicio/fin en segundos; w = [palabra, inicio, fin, clave(1=amarillo)]\n'
js += 'export const SUBS = ' + json.dumps(blocks, ensure_ascii=False) + ';\n'
open(os.path.join(ROOT, 'src', 'subs.js'), 'w').write(js)
for b in blocks: print(f"{b['s']:6.2f}-{b['e']:6.2f}  " + ' '.join(('*' if x[3] else '') + x[0] for x in b['w']))
