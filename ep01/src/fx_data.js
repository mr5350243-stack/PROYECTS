// Momentos tipográficos destacados (TIPOS A, B, C, D y S). Tiempos en segundos del audio final
// (ver assets/transcripcion.json). Editar aquí textos, posiciones o tiempos no requiere tocar las escenas.
const Y = '#ffc93c', WH = '#f6f3ec', OR = '#ff7a2f';
export const FX = [
  // 01 — «tus ojos» (3.68 s): OJOS se convierte en un par de ojos ilustrados
  { type: 'B', text: 'OJOS', morph: 'eyes', s: 3.5, morphAt: 3.95, blink: 4.85, e: 5.55, x: 540, y: 420, size: 190 },
  // 02 — «Parece imposible» (8.90 s) · «experimento científico» (10.72 s) anclado a la pantalla
  { type: 'A', text: 'IMPOSIBLE', s: 8.86, e: 10.35, x: 540, y: 330, size: 124, rot0: -12, rot: -3 },
  { type: 'D', text: 'EXPERIMENTO CIENTÍFICO', anchor: 'monitor', s: 10.65, e: 15.3, size: 40, dx: -150, dy: -95 },
  // 03 — «Contar los pases» (28.72 s)
  { type: 'S', s: 28.68, e: 31.6, y: 300, lines: [['CUENTA', WH, 120], ['LOS PASES', Y, 150]] },
  // 04 — tras el congelado
  { type: 'S', s: 40.6, e: 41.5, y: 300, lines: [['¿LO', WH, 120], ['NOTASTE?', Y, 150]] },
  { type: 'A', text: 'INCREÍBLE', s: 41.52, e: 42.45, x: 540, y: 330, size: 140, rot0: 10, rot: -3 },
  // 05 — «46 %» (46.12 s) con gráfico circular (mismo anillo en que se convirtió la cancha)
  { type: 'C', value: 46, suffix: '%', s: 45.95, e: 53.0, x: 540, y: 800, r: 230, size: 210 },
  { type: 'A', text: '¡CASI LA MITAD!', s: 51.36, e: 52.85, x: 540, y: 330, size: 110, rot0: -10, rot: -3 },
  // 06 — «ATENCIÓN SELECTIVA» viaja con el haz de la linterna
  { type: 'D', text: 'ATENCIÓN SELECTIVA', anchor: 'beam', s: 59.45, e: 65.3, size: 46, dx: 0, dy: -150, bg: '#081128' },
  // 08 / 09 — ejemplos cotidianos
  { type: 'A', text: 'NO LO NOTÓ', s: 81.85, e: 82.7, x: 540, y: 330, size: 130, rot0: -12, rot: -3 },
  // 10 — segundo descubrimiento
  { type: 'A', text: 'DESCUBRIMIENTO', s: 83.6, e: 86.2, x: 540, y: 205, size: 96, rot0: -10, rot: -2 },
  { type: 'D', text: 'INVESTIGACIÓN POSTERIOR', anchor: 'screen', s: 86.4, e: 88.4, size: 38, dx: 120, dy: -120 },
  { type: 'S', s: 99.25, e: 101.8, y: 660, lines: [['DETECTAR UNA COSA', WH, 84], ['NO ES', OR, 74], ['DETECTARLO TODO', Y, 100]] },
  // 11 — «nuestra atención selecciona» (107.94 s)
  { type: 'S', s: 107.9, e: 110.95, y: 300, lines: [['TU ATENCIÓN', WH, 110], ['SELECCIONA', Y, 140]] },
];
