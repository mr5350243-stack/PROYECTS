// Línea de tiempo sincronizada con la locución real (assets/narracion.mp3, 98.3 s).
// Los cortes caen en las pausas de la voz (silencedetect + marcas por palabra de la transcripción).
export const TIMELINE = [
  { id: 's01', start: 0.0,  end: 11.05, name: 'La alarma invisible' },
  { id: 's02', start: 11.05, end: 19.9, name: 'El cuerpo en alerta' },
  { id: 's03', start: 19.9, end: 23.9,  name: 'El sistema de protección (cerebro)' },
  { id: 's03b', start: 23.9, end: 30.3, name: 'El sistema de protección (bosque)' },
  { id: 's04', start: 30.3, end: 40.1,  name: 'El experimento científico' },
  { id: 's05', start: 40.1, end: 53.6,  name: 'La incertidumbre' },
  { id: 's06', start: 53.6, end: 60.75, name: 'El mensaje sin respuesta' },
  { id: 's07', start: 60.75, end: 66.5, name: 'La presentación' },
  { id: 's08', start: 66.5, end: 72.0,  name: 'Sensaciones reales' },
  { id: 's09', start: 72.0, end: 77.0,  name: 'Alarma no significa peligro' },
  { id: 's10', start: 77.0, end: 86.0,  name: 'La ciencia del tratamiento' },
  { id: 's11', start: 86.0, end: 94.6,  name: 'Comprender la respuesta' },
  { id: 's12', start: 94.6, end: 100.6, name: 'Cierre' },
];

// Las transiciones creativas (objeto que se transforma) ocurren dentro de las escenas;
// aquí sólo se define el empalme de imagen entre ellas.
export const TRANSITIONS = [
  { from: 's01', to: 's02', type: 'dissolve', dur: 0.8, color: [1.0, 0.25, 0.3] },   // el resplandor del pecho → la onda que forma el corazón
  { from: 's02', to: 's03', type: 'fade', dur: 0.6 },                                 // dentro del cerebro → el cerebro
  { from: 's03', to: 's03b', type: 'flash', dur: 0.7, color: [1.0, 0.7, 0.4] },       // a través de la red → luz del atardecer
];

export const FADE_OUT = 1.6;
