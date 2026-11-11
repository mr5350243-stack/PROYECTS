// Elementos comunes: amigo, poses extra, espacio mental surrealista, sprites de brillo.
import * as THREE from 'three';
import { Character } from './character.js';
import { skyDome, glowTex, M, v3, rng, lerp, dustField } from './lib.js';
import { setEnvIntensity } from './sets.js';

export const makeHero = () => new Character({ seed: 1 });
export const makeFriend = () => new Character({ seed: 2, shirt: 0x3c9a6a, pants: 0x3b3f4a, hair: 0x5a3a22, hairStyle: 'tall', skin: 0xc48a66, iris: 0x2e4a2c, shoes: 0x2b2b2b, sole: 0xeeeeee });

export const P = {
  armsCrossed: { lFlex: 0.35, lAbd: 0.28, lElb: 1.85, lTw: -1.0, lCurl: 0.6, rFlex: 0.42, rAbd: 0.28, rElb: 1.8, rTw: -1.05, rCurl: 0.6 },
  handBelly: { lFlex: 0.45, lAbd: 0.0, lElb: 1.55, lTw: -1.25, lWr: 0.15, lCurl: 0.25 },
  handChest: { lFlex: 0.55, lAbd: 0.12, lElb: 2.1, lTw: -1.15, lWr: 0.2, lCurl: 0.2 },
  defensive: { hipsY: 0.9, lKnee: 0.25, rKnee: 0.25, lHip: 0.15, rHip: 0.1, spineX: 0.12, lFlex: 0.7, lElb: 1.3, lAbd: 0.25, rFlex: 0.7, rElb: 1.3, rAbd: 0.25, lCurl: 0.5, rCurl: 0.5 },
  gestureA: { rFlex: 0.6, rElb: 1.2, rAbd: 0.3, rTw: -0.3, rCurl: 0.1, lFlex: 0.2, lElb: 0.6 },
  sit: { hipsY: 0.53, spineX: -0.04, lHip: 1.45, rHip: 1.45, lKnee: 1.45, rKnee: 1.45, lHipAbd: 0.08, rHipAbd: 0.08, lAnk: 0.05, rAnk: 0.05, lFlex: 0.35, lElb: 0.9, lAbd: 0.15, rFlex: 0.35, rElb: 0.9, rAbd: 0.15 },
};
export const pose = (...parts) => Object.assign({}, ...parts);

/** Espacio mental surrealista: cúpula de degradado, suelo brillante, niebla, motas */
export function mindSpace(scene, { top = 0x140a33, mid = 0x4a2a8a, bottom = 0x0a0618, fog = 0x2a1650, floor = 0x120b22, fogDensity = 0.045, dust = true } = {}) {
  const dome = skyDome(top, mid, bottom, 40); scene.add(dome);
  scene.fog = new THREE.FogExp2(fog, fogDensity);
  const fl = new THREE.Mesh(new THREE.CircleGeometry(30, 64), M.phys(floor, { roughness: 0.18, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.1 }));
  fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl);
  let pts = null;
  if (dust) { pts = dustField(500, new THREE.Box3(v3(-8, 0, -10), v3(8, 6, 6)), 0xc9b8ff, 0.035, 12, 0.7); scene.add(pts); }
  return { dome, floor: fl, dust: pts, update(t) { dome.material.uniforms.time.value = t; dome.material.uniforms.swirl.value = 1; pts && pts.userData.update(t); } };
}

/** Sprite de brillo aditivo */
export function glow(color, size, opacity = 1) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
  s.scale.setScalar(size);
  return s;
}

/** Esfera de preocupación: núcleo naranja brillante con capa de vidrio */
export function worryOrb(radius = 0.12, color = 0xff8a2a) {
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.55, 24, 16), M.emit(color, 2.2));
  const shell = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 24), new THREE.MeshPhysicalMaterial({ color, roughness: 0.08, metalness: 0, transmission: 0.0, transparent: true, opacity: 0.35, clearcoat: 1, emissive: color, emissiveIntensity: 0.4, depthWrite: false }));
  const halo = glow(color, radius * 4, 0.3);
  g.add(core, shell, halo);
  const light = new THREE.PointLight(color, 0.3, 2.0, 2); g.add(light);
  g.userData = { core, shell, halo, light };
  return g;
}

/** Material "fantasma" (fresnel) para figuras imaginarias */
export function ghostMaterial(color = 0x9d7bff, strength = 1) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { color: { value: new THREE.Color(color) }, strength: { value: strength } },
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 color; uniform float strength; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1. - abs(dot(vN, vV)), 2.2); gl_FragColor = vec4(color * (f*1.6 + 0.12) * strength, 1.); }`,
  });
}
export function ghostify(character, color, strength = 1) {
  const mat = ghostMaterial(color, strength);
  character.root.traverse(o => { if (o.isMesh) { o.material = mat; o.castShadow = false; o.receiveShadow = false; } });
  character.mouthMat = mat; character.mouth.material = mat;
  return mat;
}

/** Tinte de todos los materiales del personaje (para escenas imaginadas) */
export function tintCharacter(character, color, emissive = 0.25) {
  const c = new THREE.Color(color);
  character.root.traverse(o => {
    if (o.isMesh && o.material && o.material.emissive) {
      o.material = o.material.clone();
      o.material.emissive = c.clone(); o.material.emissiveIntensity = emissive;
    }
  });
  character.mouthMat = character.mouth.material;
}

export { setEnvIntensity, lerp, rng };
