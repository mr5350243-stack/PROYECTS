// Línea de tiempo sincronizada con la locución (narracion.mp3, 114.2 s).
// Los cortes caen en las pausas reales de la voz detectadas con silencedetect.
export const TIMELINE = [
  { id: 's01', start: 0.0,   end: 9.8,   name: 'Algo malo va a pasar' },
  { id: 's02', start: 9.8,   end: 16.9,  name: 'El mensaje sin respuesta' },
  { id: 's02b', start: 16.9, end: 20.0,  name: 'El mensaje sin respuesta (escena imaginada)' },
  { id: 's03', start: 20.0,  end: 29.3,  name: 'Imaginar lo peor' },
  { id: 's04', start: 29.3,  end: 38.3,  name: 'Dentro de la mente' },
  { id: 's05', start: 38.3,  end: 47.9,  name: 'El sistema de protección' },
  { id: 's06', start: 47.9,  end: 61.4,  name: 'Muchos futuros posibles' },
  { id: 's07', start: 61.4,  end: 67.6,  name: 'La preocupación crece' },
  { id: 's08', start: 67.6,  end: 76.0,  name: 'El efecto dominó' },
  { id: 's09', start: 76.0,  end: 86.7,  name: 'La respuesta física' },
  { id: 's10', start: 86.7,  end: 98.75, name: 'Imaginación frente a realidad' },
  { id: 's11', start: 98.75, end: 109.8, name: 'Cambiar de perspectiva' },
  { id: 's12', start: 109.8, end: 118.5, name: 'No todo lo que piensas es real' },
];

// Transiciones centradas en el inicio de la escena destino (bias = fracción antes del corte).
export const TRANSITIONS = [
  { from: 's01', to: 's02', type: 'iris', dur: 0.9, bias: 0.5 },
  { from: 's02', to: 's02b', type: 'whip', dur: 0.6 },
  { from: 's02b', to: 's03', type: 'dissolve', dur: 1.3, color: [1.0, 0.55, 0.9] },
  { from: 's03', to: 's04', type: 'flash', dur: 0.8, color: [0.35, 0.55, 1.0] },
  { from: 's04', to: 's05', type: 'flash', dur: 0.8, color: [1.0, 0.75, 0.4] },
  { from: 's05', to: 's06', type: 'dissolve', dur: 1.2, color: [0.6, 0.4, 1.0] },
  { from: 's06', to: 's07', type: 'whip', dur: 0.7 },
  { from: 's07', to: 's08', type: 'flash', dur: 0.7, color: [1.0, 0.5, 0.15] },
  { from: 's08', to: 's09', type: 'dissolve', dur: 1.0, color: [0.7, 0.85, 1.0] },
  { from: 's09', to: 's10', type: 'whip', dur: 0.7 },
  { from: 's10', to: 's11', type: 'fade', dur: 1.0 },
  { from: 's11', to: 's12', type: 'fade', dur: 1.3 },
];

// Escala global: la duración de la locución.
export const VOICE_DURATION = 114.21;
