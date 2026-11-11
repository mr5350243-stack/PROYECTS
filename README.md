# ¿Por qué tu cerebro imagina lo peor? — Cortometraje motion graphics 3D

Video vertical **1080 × 1920, 30 fps, 118,5 s**, renderizado fotograma a fotograma con Three.js (WebGL) en Chromium headless
y sincronizado con la locución `assets/narracion.mp3`.

**Resultado final:** `output/cerebro_imagina_lo_peor_1080x1920.mp4`

## Estructura

| Ruta | Contenido |
|---|---|
| `video/src/timeline.js` | Línea de tiempo: escenas y transiciones alineadas con las pausas reales de la voz |
| `video/src/main.js` | Motor: render por escena, profundidad de campo, bloom, etalonaje, transiciones (iris, whip pan, disolución en partículas, destello), ACES, viñeta y grano |
| `video/src/character.js` | Personaje con rig (columna, brazos, manos articuladas, piernas), rostro esculpido, párpados, cejas, boca y mirada |
| `video/src/sets.js`, `common.js` | Apartamento, teléfono con pantalla dinámica, reloj, espacio mental, esferas, materiales "fantasma" |
| `video/src/scenes/s01…s12.js` | Las 12 escenas del guion (la 2 se divide en realidad + escena imaginada) |
| `tools/render.mjs` | Render determinista en paralelo por tramos (reanudable) |
| `tools/sfx.py` | Música y efectos procedurales sincronizados con la animación |
| `tools/mix.sh` | Mezcla: voz + música con *ducking* + efectos, normalizado a −14 LUFS |

## Reproducir

```bash
npm install
node tools/render.mjs 2 30          # render/chunk_*.mp4
python3 tools/sfx.py && ./tools/mix.sh
ffmpeg -f concat -safe 0 -i render/list.txt -i audio/mix.wav -map 0:v -map 1:a \
  -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -shortest output/video.mp4
```

Vista previa de un instante: `node tools/snap.mjs /tmp/out 0.5 12.3 45.0` (escala, segundos).
