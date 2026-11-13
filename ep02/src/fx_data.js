// Momentos tipográficos destacados del episodio 02. Tiempos del audio real (assets/transcripcion.json).
// A = WORD IMPACT · B = TYPOGRAPHIC MORPH · D = palabra integrada en la animación · S = título apilado.
// SOBER: tramos con subtítulos sobrios (explicaciones científicas y jurídicas).
const Y = '#ffc93c', WH = '#f6f3ec', RED = '#b3273a';
export const FX = [
  { type: 'D', text: 'PSICOLOGÍA FORENSE', anchor: 'folder', s: 13.4, e: 15.85, size: 40, dx: 60, dy: -90, bg: '#081128' },
  { type: 'A', text: 'MOTIVACIONES', s: 29.0, e: 30.5, x: 540, y: 300, size: 110, rot0: -10, rot: -3, accent: '#8f1d2c' },
  // 03 — hipótesis (31.3)
  { type: 'S', s: 31.35, e: 34.4, y: 280, lines: [['HIPÓTESIS', WH, 120], ['PSICOLÓGICAS', Y, 104]] },
  // 04 — «temer al abandono» (43–44)
  { type: 'S', s: 41.0, e: 47.3, y: 390, rot: -1, lines: [['MIEDO AL', WH, 100], ['ABANDONO', Y, 140]] },
  // 05 — «control extremo» (49.4): la O de CONTROL se cierra en círculo
  { type: 'B', text: 'CONTROL', morph: 'ring', s: 48.9, morphAt: 49.5, e: 52.4, x: 540, y: 300, size: 140, color: WH },
  { type: 'A', text: 'EXTREMO', s: 50.0, e: 52.4, x: 540, y: 430, size: 100, rot0: 8, rot: -2, color: Y, accent: '#8f1d2c' },
  // 06 — «fantasías sexuales violentas» (65.5–67.3)
  { type: 'S', s: 65.4, e: 67.9, y: 300, lines: [['FANTASÍAS', WH, 116], ['VIOLENTAS', RED, 130]] },
  // 07 — la pregunta (71.0)
  { type: 'S', s: 71.0, e: 74.4, y: 300, lines: [['¿ENFERMEDAD MENTAL', WH, 84], ['O RESPONSABILIDAD?', Y, 84]] },
  // 08 — conclusiones diferentes (77.6)
  { type: 'S', s: 75.4, e: 80.0, y: 200, lines: [['LOS EXPERTOS', WH, 88], ['NO COINCIDIERON', Y, 88]] },
  // 09 — planificación
  { type: 'S', s: 86.0, e: 90.9, y: 300, lines: [['PLANIFICACIÓN', WH, 100], ['Y CONCIENCIA', Y, 100]] },
  // 10 — «legalmente responsable» (93.0)
  { type: 'S', s: 92.9, e: 95.6, y: 300, lines: [['RESPONSABILIDAD', Y, 100], ['PENAL', WH, 120]] },
  // 12 — «la responsabilidad» (114.6) y texto final
  { type: 'A', text: 'RESPONSABILIDAD', s: 114.5, e: 116.6, x: 540, y: 300, size: 104, rot0: -8, rot: -2, accent: '#8f1d2c' },
  { type: 'S', s: 116.7, e: 118.75, y: 360, lines: [['COMPRENDER', WH, 110], ['NO ES', RED, 90], ['JUSTIFICAR.', Y, 120]] },
];
export const SOBER = [[10.3, 22.6], [47.6, 58.8], [71.0, 105.0]];
