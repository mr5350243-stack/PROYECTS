// ESCENA 05 — La incertidumbre (40.1–53.6 s)
// El protagonista sobre una plataforma circular rodeado de relojes que marchan desincronizados y cambian de sitio.
// Una señal de advertencia aparece en momentos impredecibles; él se sobresalta un instante. La cámara gira
// alrededor. Al final un reloj vuela hacia la cámara, gira y se convierte en un teléfono (→ escena 06).
import * as THREE from 'three';
import { POSES, Character, makeHero, makeClock, makePhone, mindSpace, M, glow, v3, ramp, aim, lerp, noise1, rng, smoother, easeInOut, easeOut, easeOutBack, clamp } from '../shared.js';

const startle = (t, t0) => t < t0 ? 0 : Math.min(1, (t - t0) / 0.07) * Math.exp(-(t - t0) * 3.0);

function warningSign() {
  const g = new THREE.Group();
  const s = new THREE.Shape(); const R = 0.32;
  for (let i = 0; i < 3; i++) { const a = Math.PI / 2 + i * Math.PI * 2 / 3; const x = Math.cos(a) * R, y = Math.sin(a) * R; i ? s.lineTo(x, y) : s.moveTo(x, y); }
  const tri = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.02, bevelSegments: 4 }),
    new THREE.MeshStandardMaterial({ color: 0xffb020, emissive: 0xff8a00, emissiveIntensity: 0.9, roughness: 0.35 }));
  tri.position.z = -0.025; g.add(tri);
  const ink = new THREE.MeshBasicMaterial({ color: 0x1a1206 });
  const bar = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 0.12, 4, 8), ink); bar.position.set(0, 0.0, 0.05); g.add(bar);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), ink); dot.position.set(0, -0.12, 0.05); g.add(dot);
  const gl = glow(0xffa030, 1.6, 0.5); gl.position.z = -0.05; g.add(gl);
  return { g, gl };
}

export function create() {
  const scene = new THREE.Scene();
  const env = mindSpace(scene, { top: 0x0c0620, mid: 0x3a1f6a, bottom: 0x07040f, fog: 0x1a0e36, fogDensity: 0.035, floor: 0x0d0818 });
  env.floor.visible = false;
  // plataforma
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.18, 96), M.phys(0x1c1730, { roughness: 0.25, metalness: 0.3, clearcoat: 1 }));
  plat.position.y = 0.09; plat.receiveShadow = true; scene.add(plat);
  const edge = new THREE.Mesh(new THREE.TorusGeometry(1.52, 0.015, 8, 128), M.emit(0xb98aff, 3)); edge.rotation.x = Math.PI / 2; edge.position.y = 0.18; scene.add(edge);
  for (const r of [0.6, 1.05]) { const c = new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 6, 96), M.emit(0x7a5ad0, 1.5)); c.rotation.x = Math.PI / 2; c.position.y = 0.185; scene.add(c); }
  const hero = makeHero(); scene.add(hero.root);
  const key = new THREE.SpotLight(0xe8dcff, 16, 12, 0.55, 0.6, 1.4); key.position.set(1.5, 5, 3); key.target.position.set(0, 1, 0); key.castShadow = true; scene.add(key, key.target);
  scene.add(new THREE.HemisphereLight(0x9a80ff, 0x120a22, 0.5));
  const warmRim = new THREE.PointLight(0xffa040, 0, 5, 2); scene.add(warmRim);

  // relojes flotantes, cada uno con su propio ritmo (algunos hacia atrás)
  const R = rng(55), clocks = [];
  for (let i = 0; i < 11; i++) {
    const c = makeClock(); const s = 1.2 + R() * 1.4; c.scale.setScalar(s); scene.add(c);
    clocks.push({ c, a0: (i / 11) * Math.PI * 2 + R() * 0.3, rad: 2.1 + R() * 1.4, y: 0.7 + R() * 2.2, sp: (R() - 0.5) * 0.35, rate: (R() < 0.3 ? -1 : 1) * (2 + R() * 30), phase: R() * 600, jump: R() * 10, wob: R() * 6 });
  }
  // señales de advertencia en momentos impredecibles
  const SIGNS = [[2.35, 0.55, 0.95, 0.6], [5.15, -0.6, 0.45, 0.9], [6.05, 0.62, -0.2, 0.3], [8.75, -0.5, 0.8, 1.0], [11.1, 0.5, 0.55, 1.2]];
  const signs = SIGNS.map(() => { const w = warningSign(); scene.add(w.g); return w; });
  // reloj final que se transforma en teléfono
  const morphClock = makeClock(); morphClock.scale.setScalar(1.6); scene.add(morphClock);
  const phone = makePhone(); phone.scale.setScalar(2.4); scene.add(phone);
  const camera = new THREE.PerspectiveCamera(40, 9 / 16, 0.02, 80);

  return {
    scene, camera,
    update(t) {
      env.update(t + 40);
      // ---- cámara: órbita lenta → un reloj se acerca y se convierte en teléfono ----
      const a = lerp(-0.7, 1.25, ramp(t, -0.3, 11.6, easeInOut));
      const d = lerp(4.6, 3.9, ramp(t, 0, 11.6));
      const pos = v3(Math.sin(a) * d, lerp(1.5, 2.1, ramp(t, 0, 11.6)), Math.cos(a) * d);
      const tgt = v3(0, 1.15, 0);
      pos.add(v3(noise1(t * 0.5, 61) * 0.01, noise1(t * 0.5, 62) * 0.01, 0));
      aim(camera, pos, tgt, 40, noise1(t * 0.3, 63) * 0.03);
      camera.updateMatrixWorld(true);
      // ---- protagonista: de pie, inquieto; sobresaltos en cada señal ----
      let sk = 0; SIGNS.forEach(([s0]) => { sk = Math.max(sk, startle(t, s0 + 0.05)); });
      const look = SIGNS.reduce((acc, [s0, x]) => t > s0 ? x * 1.2 : acc, -0.3);
      const p = Character.mix({ ry: 0.25, lFlex: 0.12, rFlex: 0.12, lAbd: 0.1, rAbd: 0.1, lElb: 0.35, rElb: 0.35, lCurl: 0.4, rCurl: 0.4, headY: noise1(t * 0.6, 3) * 0.5, headX: -0.08, y: 0.18 },
        { ry: 0.25, y: 0.18, hipsY: 0.93, lKnee: 0.3, rKnee: 0.3, lHip: 0.15, rHip: 0.15, spineX: -0.15, lFlex: 0.7, rFlex: 0.7, lElb: 1.4, rElb: 1.4, lAbd: 0.35, rAbd: 0.35, lCurl: 0.8, rCurl: 0.8, headX: -0.2, headY: clamp(look - 0.25, -0.9, 0.9) }, Math.min(1, sk));
      p.breathRate = 0.45 + sk * 0.3; p.breath = 1.2 + sk;
      hero.setPose(p);
      hero.setExpr({ worry: 0.7 + sk * 0.3, smile: -0.25 - sk * 0.3, eyeOpen: 1.05 + sk * 0.35, mouthOpen: sk * 0.3, gazeX: noise1(t * 1.3, 5) * 0.35 * (1 - sk), gazeY: 0.15 });
      hero.apply(t + 40);
      // ---- relojes: órbitas, saltos de posición y agujas a ritmos distintos ----
      clocks.forEach((k, i) => {
        const jumpK = Math.floor((t + k.jump) / 3.1);           // cada ~3 s cambian de órbita bruscamente
        const jr = rng(100 + i * 7 + jumpK);
        const slide = ramp(((t + k.jump) % 3.1), 0, 0.5, easeOut);
        const a = k.a0 + t * k.sp + (jr() - 0.5) * 1.2 * slide;
        const y = k.y + Math.sin(t * 0.8 + k.wob) * 0.15 + (jr() - 0.5) * 0.6 * slide;
        k.c.position.set(Math.sin(a) * k.rad, y, Math.cos(a) * k.rad);
        k.c.lookAt(0, y * 0.6 + 0.6, 0);
        k.c.rotateZ(Math.sin(t * 0.7 + k.wob) * 0.2);
        k.c.userData.set(k.phase + t * k.rate);
        k.c.visible = true;
      });
      // ---- señales ----
      let warm = 0;
      signs.forEach((w, i) => {
        const [s0, x, y, z] = SIGNS[i];
        const k = t - s0;
        const vis = k > 0 && k < 1.3;
        w.g.visible = vis;
        if (!vis) return;
        const pop = easeOutBack(clamp(k / 0.22)) * (1 - ramp(k, 0.9, 1.3));
        const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), upv = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
        const toCam = camera.position.clone().sub(v3(0, 1.15, 0)).normalize();
        w.g.position.copy(v3(0, 1.15, 0)).addScaledVector(right, y * 0 + x).addScaledVector(upv, y).addScaledVector(toCam, z); w.g.lookAt(camera.position); w.g.scale.setScalar(Math.max(0.001, pop * 0.9));
        w.gl.material.opacity = 0.6 * pop * (0.7 + 0.3 * Math.sin(k * 30));
        warm = Math.max(warm, pop);
        warmRim.position.copy(w.g.position);
      });
      warmRim.intensity = warm * 3;

      // reloj final: desde detrás del personaje hasta delante de la cámara, gira y se vuelve teléfono
      const mk = ramp(t, 11.6, 13.2, easeInOut);
      const fwd = new THREE.Vector3(); camera.getWorldDirection(fwd);
      const near = camera.position.clone().addScaledVector(fwd, 1.0);
      const far = v3(-1.6, 2.2, -1.8);
      const mp = far.clone().lerp(near, mk);
      const spin = ramp(t, 12.6, 13.4, easeInOut) * Math.PI;   // a 90° se intercambian
      morphClock.position.copy(mp); phone.position.copy(mp);
      morphClock.quaternion.copy(camera.quaternion); morphClock.rotateY(spin);
      phone.quaternion.copy(camera.quaternion); phone.rotateY(spin - Math.PI);
      morphClock.visible = t > 11.5 && spin < Math.PI / 2;
      phone.visible = spin >= Math.PI / 2;
      morphClock.userData.set(t * 40);
      phone.userData.draw('chat', 1, { sent: 1 }); phone.userData.light.intensity = 0.2;
      const focus = t > 12.0 ? camera.position.distanceTo(mp) : pos.distanceTo(tgt);
      return { focus, aperture: lerp(1.0, 2.0, ramp(t, 11.6, 12.4)), maxBlur: 0.014, exposure: 0.95, saturation: 1.1, contrast: 1.08, tint: [1.02, 0.98, 1.04], bloom: 0.5, bloomThreshold: 1.2, vignette: 0.42 + warm * 0.1, ca: 0.002 + warm * 0.004 };
    },
  };
}
