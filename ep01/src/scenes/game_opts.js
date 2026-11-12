// Configuración compartida del partido de las escenas 03 y 04 (misma simulación determinista → corte invisible).
export const GAME = {
  t0: 23.0, trail: true,
  // el gorila entra con «Una persona disfrazada…» (36.9 s), se detiene en el centro con «gorila» (38.3 s) y sale antes del congelado
  gorilla: { enter: 35.7, center: 37.9, resume: 38.75, exit: 40.45, uFrom: 1.45, uStop: 0.02, uTo: -1.5, v: 0.44 },
};
export const FREEZE = 40.5;
