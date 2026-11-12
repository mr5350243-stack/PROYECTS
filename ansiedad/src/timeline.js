// Línea de tiempo sincronizada con la locución real (assets/narracion.mp3, 98.3 s).
// Los cortes caen en las pausas de la voz (silencedetect + marcas por palabra de la transcripción).
export const TIMELINE = [
  { id: 's01', start: 0.0,  end: 11.05, name: 'La alarma invisible' },
  { id: 's02', start: 11.05, end: 19.9, name: 'El cuerpo en alerta' },
  { id: 's03', start: 19.9, end: 30.3,  name: 'El sistema de protección' },
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
export const TRANSITIONS = [];

export const FADE_OUT = 1.6;
