// Escenas del episodio 08 (segundos del audio real, 101.8 s de locución + logo).
import { S01 } from './scenes/s01.js'; import { S02 } from './scenes/s02.js'; import { S03 } from './scenes/s03.js';
import { S04 } from './scenes/s04.js'; import { S05 } from './scenes/s05.js'; import { S06 } from './scenes/s06.js';
import { S07 } from './scenes/s07.js'; import { S08 } from './scenes/s08.js'; import { S09 } from './scenes/s09.js';
import { S10 } from './scenes/s10.js';
export const SCENES = [
  { id: 's01', ...S01 }, { id: 's02', ...S02 }, { id: 's03', ...S03 }, { id: 's04', ...S04 }, { id: 's05', ...S05 },
  { id: 's06', ...S06 }, { id: 's07', ...S07 }, { id: 's08', ...S08 }, { id: 's09', ...S09 }, { id: 's10', ...S10 },
];
export const DURATION = 103.0;
