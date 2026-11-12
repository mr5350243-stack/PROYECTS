// Orden y duración de las escenas (segundos del audio final). Cada escena se dibuja solo dentro de [start, end].
// Las transiciones se solapan: la escena siguiente empieza antes de que termine la anterior.
import { S01 } from './scenes/s01.js';
import { S02 } from './scenes/s02.js';
export const SCENES = [
  { id: 's01', ...S01 },
  { id: 's02', ...S02 },
  // s03 … s12: pendientes de aprobación de la prueba tipográfica
];
export const DURATION = 121.0;
