// Momentos tipográficos destacados (TIPOS A–D). Tiempos en segundos del audio final (ver assets/transcripcion.json).
// Editar aquí textos, posiciones o tiempos no requiere tocar las escenas.
export const FX = [
  // ESCENA 01 — «tus ojos» (3.68 s): la palabra OJOS se convierte en un par de ojos ilustrados
  { type: 'B', text: 'OJOS', morph: 'eyes', s: 3.5, morphAt: 3.95, blink: 4.85, e: 5.55, x: 540, y: 420, size: 190 },
  // ESCENA 02 — «Parece imposible» (8.90 s)
  { type: 'A', text: 'IMPOSIBLE', s: 8.86, e: 10.35, x: 540, y: 330, size: 124, rot0: -12, rot: -3 },
  // ESCENA 02 — «experimento científico» (10.72 s): etiqueta anclada a la pantalla del laboratorio
  { type: 'D', text: 'EXPERIMENTO CIENTÍFICO', anchor: 'monitor', s: 10.65, e: 15.3, size: 40, dx: -150, dy: -95 },
];
