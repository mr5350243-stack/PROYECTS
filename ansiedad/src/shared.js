// Recursos compartidos del proyecto ANSIEDAD (reutiliza el motor, personaje y decorados de /video/src).
import * as THREE from 'three';
export * from '../../video/src/lib.js';
export { Character, POSES } from '../../video/src/character.js';
export { buildApartment, makePhone, makeClock, setEnvIntensity } from '../../video/src/sets.js';
export { makeHero, makeFriend, P, mindSpace, glow, worryOrb, ghostMaterial, ghostify, tintCharacter } from '../../video/src/common.js';
import { ghostMaterial } from '../../video/src/common.js';

/** Congelación del tiempo: devuelve el tiempo "del mundo" que avanza casi nada entre a y b. */
export function freezeTime(t, a, b, slow = 0.04, ease = 0.18) {
  // integral de una velocidad que baja a `slow` entre a y b con rampas suaves de `ease` s
  const sp = x => {
    const k = Math.min(1, Math.max(0, (x - a) / ease)) * Math.min(1, Math.max(0, (b - x) / ease));
    return 1 - (1 - slow) * k;
  };
  if (t <= a) return t;
  const n = Math.ceil((Math.min(t, b + ease) - a) / 0.01);
  let acc = a, x = a, dx = (Math.min(t, b + ease) - a) / Math.max(1, n);
  for (let i = 0; i < n; i++) { acc += sp(x + dx / 2) * dx; x += dx; }
  return acc + Math.max(0, t - (b + ease));
}

/** Corazón anatómico estilizado (geometría deformada desde una esfera). */
export function heartGeo() {
  const g = new THREE.SphereGeometry(1, 72, 54), p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const y = v.y;
    let x = v.x * (1 + 0.25 * Math.max(0, y)), z = v.z * 0.75;
    let yy = y < 0 ? y * (1.35 - 0.2 * Math.abs(v.x)) : y * 0.85;
    yy -= Math.abs(v.x) < 0.25 && y > 0.4 ? (0.25 - Math.abs(v.x)) * 0.8 * (y - 0.4) : 0;
    if (y < 0) { x *= 1 + y * 0.55; z *= 1 + y * 0.4; }
    p.setXYZ(i, x, yy, z);
  }
  g.computeVertexNormals();
  return g;
}

/** Onda de alarma: cáscara translúcida roja (fresnel) + anillo en el suelo + destello. */
export function alarmWave(color = 0xff2a3a) {
  const g = new THREE.Group();
  // sólo borde (fresnel), sin relleno: se lee como una onda y no lava la imagen
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide,
    uniforms: { color: { value: new THREE.Color(color) }, strength: { value: 1 } },
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 color; uniform float strength; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1. - abs(dot(vN, vV)), 5.0); gl_FragColor = vec4(color * (f*1.5 + 0.02) * strength, 1.); }`,
  });
  const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 40), mat); g.add(shell);
  const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(2.2), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 8, 128), ringMat); ring.rotation.x = Math.PI / 2; g.add(ring);
  return {
    g, shell, ring, mat, ringMat,
    /** r: radio; a: intensidad 0–1; floorY: altura del suelo relativa al centro */
    set(r, a, floorY = -1) {
      g.visible = a > 0.003 && r > 0.001;
      shell.scale.setScalar(Math.max(0.001, r));
      mat.uniforms.strength.value = a;
      const h = Math.min(r * 0.999, Math.abs(floorY));
      const rr = Math.sqrt(Math.max(0, r * r - h * h));
      ring.position.y = floorY; ring.scale.setScalar(Math.max(0.001, rr)); ringMat.opacity = a * (rr > 0.01 ? 1 : 0);
    },
  };
}

/** Cerebro estilizado: elipsoide con cisura central y circunvoluciones (desplazamiento procedural). */
export function brainGeo(detail = 1) {
  const g = new THREE.SphereGeometry(1, 120 * detail, 90 * detail), p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = v.clone();
    // circunvoluciones: patrón de pliegues sinuosos
    const f1 = Math.sin(16 * n.z + 5 * Math.sin(7 * n.y + 2 * n.x)) * Math.sin(13 * n.y + 4 * Math.sin(9 * n.z));
    const f2 = Math.sin(23 * n.x * 0.5 + 21 * n.y * 0.3 + 6 * Math.sin(11 * n.z));
    let r = 1 + 0.045 * (Math.abs(f1) * 1.4 - 0.5) + 0.015 * f2;
    // cisura interhemisférica
    const mid = Math.exp(-Math.pow(n.x / 0.07, 2)) * Math.max(0, n.y + 0.2);
    r -= 0.16 * mid;
    // lóbulo temporal algo más bajo, base más plana
    let y = n.y * 0.78; if (y < -0.35) y = -0.35 + (y + 0.35) * 0.4;
    p.setXYZ(i, n.x * 0.82 * r, y * r, n.z * 1.05 * r);
  }
  g.computeVertexNormals();
  return g;
}

export function brainMaterial() {
  return new THREE.MeshPhysicalMaterial({ color: 0xf2a7b9, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.3, sheen: 0.6, sheenColor: new THREE.Color(0xffd0dc), emissive: 0x7a2040, emissiveIntensity: 0.25 });
}
