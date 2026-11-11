// ESCENA 05 — El sistema de protección (38.3–47.9 s)
// Bosque al atardecer: camina con su linterna, oye un ruido, se detiene, retrocede, se prepara… sale un conejo. Se relaja.
import * as THREE from 'three';
import { Character, walkPose } from '../character.js';
import { M, v3, ramp, aim, lerp, noise1, rng, skyDome, keyLight, smoother, easeOut, clamp, glowTex } from '../lib.js';
import { makeHero, P, glow } from '../common.js';
import { setEnvIntensity } from '../sets.js';

function rabbit() {
  const g = new THREE.Group();
  const fur = M.phys(0x9a7a62, { roughness: 0.9, sheen: 1, sheenColor: new THREE.Color(0xe8d0b8) });
  const light = M.phys(0xefe3d6, { roughness: 0.9, sheen: 1, sheenColor: new THREE.Color(0xffffff) });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 18), fur); body.scale.set(0.85, 0.8, 1.2); body.position.y = 0.12; g.add(body);
  const head = new THREE.Group(); head.position.set(0, 0.22, 0.12); g.add(head);
  const hm = new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 16), fur); head.add(hm);
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.1, 4, 8), fur); ear.position.set(0.03 * s, 0.1, -0.02); ear.rotation.set(-0.3, 0, 0.18 * s); ear.scale.z = 0.5; head.add(ear);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), M.phys(0x050505, { roughness: 0.1, clearcoat: 1 })); eye.position.set(0.045 * s, 0.015, 0.045); head.add(eye);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 6), M.std(0xd08a8a, 0.5)); nose.position.set(0, 0, 0.07); head.add(nose);
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), light); tail.position.set(0, 0.14, -0.15); g.add(tail);
  for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 0.08, 4, 8), fur); f.rotation.x = Math.PI / 2; f.position.set(0.06 * s, 0.03, 0.0); g.add(f); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { g, head, body };
}

export function create() {
  const scene = new THREE.Scene();
  const dome = skyDome(0x2b3a78, 0xff9b62, 0x2a1d2a, 70); scene.add(dome);
  scene.fog = new THREE.FogExp2(0xc9806a, 0.035);
  const r = rng(77);

  // suelo con variación de color
  const gg = new THREE.PlaneGeometry(90, 90, 120, 120); gg.rotateX(-Math.PI / 2);
  const gp = gg.attributes.position, cols = [];
  for (let i = 0; i < gp.count; i++) {
    const x = gp.getX(i), z = gp.getZ(i);
    const onPath = Math.exp(-((z + Math.sin(x * 0.3) * 0.3) ** 2) / 0.5);
    gp.setY(i, noise1(x * 0.3, 1) * 0.08 * (1 - onPath) + noise1(z * 0.25, 2) * 0.1 * (1 - onPath));
    const n = noise1(x * 0.7 + z * 0.3, 5) * 0.5 + 0.5;
    const c = new THREE.Color().setRGB(lerp(0.16, 0.26, n), lerp(0.24, 0.3, n), lerp(0.08, 0.1, n)).lerp(new THREE.Color(0.45, 0.33, 0.22), onPath * 0.9);
    cols.push(c.r, c.g, c.b);
  }
  gg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); gg.computeVertexNormals();
  const ground = new THREE.Mesh(gg, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })); ground.receiveShadow = true; scene.add(ground);

  // hierba instanciada
  const G = 9000;
  const blade = new THREE.ConeGeometry(0.018, 0.28, 3, 1); blade.translate(0, 0.14, 0);
  const grass = new THREE.InstancedMesh(blade, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }), G);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), col = new THREE.Color();
  for (let i = 0; i < G; i++) {
    let x, z; do { x = (r() - 0.5) * 30 - 1; z = (r() - 0.5) * 22 - 4; } while (Math.abs(z + Math.sin(x * 0.3) * 0.3) < 0.75);
    e.set((r() - 0.5) * 0.5, r() * 6, (r() - 0.5) * 0.5); q.setFromEuler(e);
    m.compose(v3(x, 0, z), q, sc.set(1, 0.6 + r() * 1.1, 1)); grass.setMatrixAt(i, m);
    grass.setColorAt(i, col.setHSL(0.22 + r() * 0.08, 0.5, 0.18 + r() * 0.14));
  }
  grass.receiveShadow = true; scene.add(grass);

  // árboles
  const trunkM = M.std(0x4a3426, 0.9), leafMs = [0x2f5a35, 0x3d6b3a, 0x27482d, 0x4f7a3a].map(c => M.std(c, 0.85, 0, { flatShading: true }));
  const trees = [];
  const addTree = (x, z, s) => {
    const t = new THREE.Group(); t.position.set(x, 0, z); t.scale.setScalar(s); scene.add(t);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 3.2, 8), trunkM); tr.position.y = 1.6; tr.castShadow = true; t.add(tr);
    for (let k = 0; k < 4; k++) {
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9 + r() * 0.5, 1), leafMs[Math.floor(r() * 4)]);
      c.position.set((r() - 0.5) * 1.2, 3.1 + k * 0.55 + r() * 0.3, (r() - 0.5) * 1.2); c.castShadow = true; c.receiveShadow = true; t.add(c);
    }
    trees.push(t);
  };
  for (let i = 0; i < 46; i++) { const x = (r() - 0.5) * 34, z = -3 - r() * 22; addTree(x, z, 0.8 + r() * 0.7); }
  for (let i = 0; i < 9; i++) { const x = (r() - 0.5) * 22, z = 5.5 + r() * 6; addTree(x, z, 0.9 + r() * 0.5); }
  addTree(3.8, -3.0, 1.1); addTree(-2.5, -3.4, 1.0);

  // arbustos (el que se mueve)
  const bush = new THREE.Group(); bush.position.set(1.7, 0, -1.6); scene.add(bush);
  const bushM = M.std(0x3a6a34, 0.85, 0, { flatShading: true }), bushM2 = M.std(0x2e5a2c, 0.85, 0, { flatShading: true });
  const lobes = [];
  for (let i = 0; i < 9; i++) {
    const l = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35 + r() * 0.2, 1), i % 2 ? bushM : bushM2);
    l.position.set((r() - 0.5) * 1.1, 0.35 + r() * 0.35, (r() - 0.5) * 0.7); l.castShadow = l.receiveShadow = true; bush.add(l); lobes.push({ l, base: l.position.clone(), ph: r() * 6 });
  }
  const branch = new THREE.Group(); branch.position.set(-0.4, 0.5, 0.25); bush.add(branch);
  const br = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.025, 0.7, 6), trunkM); br.position.y = 0.3; branch.add(br);
  const brLeaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), bushM); brLeaf.position.y = 0.65; branch.add(brLeaf);
  branch.rotation.z = 0.5;
  for (const [x, z] of [[-1.5, -1.8], [5.2, -2.2], [-4.5, 2.4], [3.5, 2.2]]) {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 1), bushM2); b.position.set(x, 0.3, z); b.scale.y = 0.7; b.castShadow = true; scene.add(b);
  }
  // rocas
  for (let i = 0; i < 10; i++) { const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1 + r() * 0.2, 0), M.std(0x77706a, 0.9, 0, { flatShading: true })); s.position.set((r() - 0.5) * 14, 0.05, (r() < 0.5 ? -1 : 1) * (1 + r() * 2)); scene.add(s); }

  const bunny = rabbit(); scene.add(bunny.g);
  const hero = makeHero(); scene.add(hero.root);
  // linterna
  const flash = new THREE.Group(); scene.add(flash);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.018, 0.2, 16), M.std(0x2a2a2e, 0.35, 0.7)); body.rotation.x = Math.PI / 2; flash.add(body);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.022, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.6, 1.8) })); lens.position.z = 0.101; flash.add(lens);
  const spot = new THREE.SpotLight(0xffe2b0, 6, 9, 0.38, 0.6, 1.5); spot.position.z = 0.1; spot.castShadow = false; flash.add(spot); flash.add(spot.target); spot.target.position.set(0, 0, 3);
  const beam = new THREE.Mesh(new THREE.ConeGeometry(0.55, 3.2, 32, 1, true), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: `varying float vY; varying vec3 vN; varying vec3 vV; void main(){ vY = position.y; vec4 mv = modelViewMatrix*vec4(position,1.); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `varying float vY; varying vec3 vN; varying vec3 vV; void main(){ float a = smoothstep(-1.6, 1.6, vY); float f = pow(abs(dot(vN,vV)), 1.5); gl_FragColor = vec4(vec3(1.,.88,.65) * a * f * 0.18, 1.); }`,
  }));
  beam.rotation.x = -Math.PI / 2; beam.position.z = 1.7; flash.add(beam);
  const flareG = glow(0xfff0d0, 0.25, 0.9); flareG.position.z = 0.11; flash.add(flareG);

  const sun = keyLight(0xffa066, 3.4, v3(14, 4.5, -6), v3(0, 0, 0), 9, 2048); scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight(0x8a8fd8, 0x4a3020, 0.7); scene.add(hemi);
  const rim = new THREE.DirectionalLight(0xff7aa8, 0.8); rim.position.set(-6, 3, -8); scene.add(rim);
  setEnvIntensity(scene, 0.35);
  const camera = new THREE.PerspectiveCamera(38, 9 / 16, 0.05, 120);

  return {
    scene, camera,
    update(t) {
      dome.material.uniforms.time.value = t;
      // ---- posición del protagonista: camina en +x y se detiene ----
      const walkEnd = 2.6;
      const dist = t < walkEnd ? 1.15 * t - 0.25 * Math.max(0, t - 2.0) ** 2 / 0.6 * 0.6 : 1.15 * walkEnd - 0.25 * 0.36;
      let hx = -3.0 + dist;
      const stepBack = ramp(t, 4.0, 4.5, easeOut) * 0.32;
      hx -= stepBack;
      const walking = 1 - ramp(t, 2.1, 2.7);
      const ph = dist / 1.25;
      let p = Character.mix({}, walkPose(ph, 1), walking);
      // linterna sostenida al frente
      p = { ...p, rFlex: lerp(p.rFlex, 0.75, 0.85), rElb: 0.55, rAbd: 0.18, rTw: 0, rCurl: 0.8, rWr: -0.1 };
      const alert = ramp(t, 2.8, 3.3) * (1 - ramp(t, 7.2, 8.2));
      const def = ramp(t, 4.0, 4.4) * (1 - ramp(t, 6.9, 7.8));
      if (t > 2.6) p = Character.mix(p, { rFlex: 0.75, rElb: 0.55, rAbd: 0.18, rCurl: 0.8, spineX: 0.08, headY: 0.55, neckY: 0.2 }, alert);
      p = Character.mix(p, { ...P.defensive, rFlex: 0.9, rElb: 0.5, rCurl: 0.8, headY: 0.5, neckY: 0.15 }, def);
      if (t > 4.0 && t < 4.5) { const k = ramp(t, 4.0, 4.5); p.rHip = -Math.sin(k * Math.PI) * 0.35; p.rKnee = Math.sin(k * Math.PI) * 0.5; }
      if (t > 6.0) { p.headY = lerp(p.headY, 0.15, ramp(t, 6.0, 7.0)); }
      p.x = hx; p.z = 0; p.ry = Math.PI / 2;
      p.breathRate = lerp(0.3, 0.55, alert); p.breath = 0.6 + alert * 0.5;
      hero.setPose(p);
      const relax = ramp(t, 7.0, 8.2);
      hero.setExpr({ smile: lerp(lerp(0.25, -0.35, alert), 0.5, relax), worry: alert * 0.9 * (1 - relax), eyeOpen: 1 + alert * 0.2, gazeX: alert * 0.2, gazeY: -0.05 });
      hero.apply(t + 38);
      // linterna: en la mano, apuntando hacia donde mira
      hero.root.updateMatrixWorld(true);
      flash.position.copy(hero.handPos('R'));
      const aimAt = t < 2.8 ? v3(hx + 3, 0.2, 0) : v3(hx + 3, 0.2, 0).lerp(v3(1.7, 0.4, -1.6), ramp(t, 2.8, 3.6));
      flash.lookAt(aimAt);
      // ---- arbusto que se mueve ----
      const rustle = Math.max(ramp(t, 2.4, 2.6) * (1 - ramp(t, 3.0, 3.3)), ramp(t, 3.6, 3.8) * (1 - ramp(t, 6.1, 6.4)));
      lobes.forEach(({ l, base, ph: f }) => { l.position.set(base.x + Math.sin(t * 31 + f) * 0.03 * rustle, base.y + Math.sin(t * 27 + f) * 0.02 * rustle, base.z); l.rotation.z = Math.sin(t * 25 + f) * 0.12 * rustle; });
      branch.rotation.z = 0.5 + Math.sin(t * 18) * 0.35 * rustle + ramp(t, 4.6, 5.0) * (1 - ramp(t, 5.2, 5.8)) * 0.6;
      // ---- conejo ----
      const bk = ramp(t, 5.9, 9.4, k => k);
      const hopN = bk * 8, hf = hopN % 1;
      const bx = lerp(1.5, 0.5, bk), bz = lerp(-1.2, 3.2, bk);
      bunny.g.position.set(bx, Math.sin(hf * Math.PI) * 0.12 * (t > 5.9 ? 1 : 0), bz);
      bunny.g.rotation.y = Math.atan2(-1.0, 4.4);
      bunny.g.visible = t > 5.85;
      bunny.body.scale.set(0.85, 0.8 - Math.sin(hf * Math.PI) * 0.08, 1.2 + Math.sin(hf * Math.PI) * 0.12);
      bunny.head.rotation.y = Math.sin(t * 3) * 0.3;

      // ---- cámara ----
      const head = hero.headPos(v3(0, 0.11, 0));
      let pos, tgt, fov = 36, focus, ap = 1.2;
      if (t < 2.4) { // tracking lateral
        pos = v3(hx + 0.3, 1.2, 3.6); tgt = v3(hx + 0.1, 1.0, 0); focus = 3.6;
      } else if (t < 3.3) { // detalle de los pies deteniéndose
        const k = ramp(t, 2.4, 3.3);
        pos = v3(hx + 0.95 - k * 0.1, 0.24, 1.35); tgt = v3(hx + 0.32, 0.14, 0); focus = pos.distanceTo(tgt); ap = 3; fov = 34;
      } else if (t < 6.1) { // sobre el hombro hacia los arbustos
        const k = ramp(t, 3.3, 6.1);
        pos = v3(hx - 1.35 - k * 0.15, 1.85, 1.15); tgt = v3(1.7, lerp(0.55, 0.45, k), -1.6); focus = pos.distanceTo(tgt); ap = 1.6; fov = lerp(34, 30, k);
      } else { // dolly-out para revelar al animal
        const k = ramp(t, 6.1, 9.6, smoother);
        pos = v3(lerp(hx - 1.5, hx + 0.5, k), lerp(1.85, 2.0, k), lerp(1.15, 5.6, k)); tgt = v3(lerp(1.7, hx + 0.75, k), lerp(0.45, 0.75, k), lerp(-1.6, -0.3, k)); focus = pos.distanceTo(v3(hx, 1, 0)); ap = lerp(1.6, 0.6, k); fov = lerp(30, 40, k);
      }
      pos.add(v3(noise1(t * 0.9, 31) * 0.01, noise1(t * 0.9, 32) * 0.01, 0));
      aim(camera, pos, tgt, fov);
      return { focus, aperture: ap, maxBlur: 0.014, exposure: 1.0 - alert * 0.1, saturation: 1.1, contrast: 1.08, tint: [1.04, 0.98, 0.95], bloom: 0.55, vignette: 0.38 + alert * 0.12 };
    },
  };
}
