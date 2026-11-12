// ESCENA 03a — El sistema de protección: el cerebro (19.9–23.9 s)
// Desde dentro del cerebro la cámara retrocede: aparece rodeado de una red luminosa que se enciende como un
// escudo ("sistema de protección"). La cámara atraviesa las conexiones hacia una luz cálida (→ bosque).
import * as THREE from 'three';
import { v3, ramp, aim, lerp, noise1, rng, skyDome, glowTex, smoother, easeIn, easeInOut, clamp, glow, brainGeo, brainMaterial } from '../shared.js';

export function create() {
  const scene = new THREE.Scene();
  const dome = skyDome(0x02030c, 0x0b1440, 0x03020a, 50); scene.add(dome);
  scene.fog = new THREE.FogExp2(0x03051a, 0.035);
  const r = rng(303);

  const brain = new THREE.Mesh(brainGeo(), brainMaterial()); brain.scale.setScalar(1.0); scene.add(brain);
  const key = new THREE.DirectionalLight(0xbfd2ff, 1.1); key.position.set(2, 3, 4); scene.add(key);
  const rimL = new THREE.PointLight(0x5a8cff, 6, 8, 2); rimL.position.set(-2, 1, -2); scene.add(rimL);
  const warmL = new THREE.PointLight(0xff9ac0, 0.8, 4, 2); warmL.position.set(0.5, 0.6, 1.6); scene.add(warmL);
  scene.add(new THREE.HemisphereLight(0x405080, 0x080610, 0.5));

  // red protectora: nodos sobre una cáscara alrededor del cerebro + conexiones a vecinos
  const N = 340, nodes = [];
  for (let i = 0; i < N; i++) {
    // distribución de Fibonacci en una esfera alargada, con algo de ruido
    const y = 1 - (i + 0.5) / N * 2, rad = Math.sqrt(1 - y * y), th = i * 2.39996;
    const shell = 1.75 + (r() - 0.5) * 0.35;
    nodes.push(v3(Math.cos(th) * rad * shell * 0.95, y * shell * 0.85, Math.sin(th) * rad * shell * 1.2));
  }
  const edges = [], seen = new Set();
  nodes.forEach((a, i) => {
    nodes.map((b, j) => [a.distanceToSquared(b), j]).filter(x => x[1] !== i).sort((x, y) => x[0] - y[0]).slice(0, 3)
      .forEach(([, j]) => { const k = Math.min(i, j) + '_' + Math.max(i, j); if (!seen.has(k)) { seen.add(k); edges.push([i, j]); } });
  });
  // algunas conexiones radiales del cerebro a la red
  for (let i = 0; i < N; i += 9) edges.push([i, -1]);
  const center = (i) => i < 0 ? nodes[0].clone().multiplyScalar(0) : nodes[i];
  const radialEnd = (i) => nodes[i].clone().normalize().multiplyScalar(0.95);
  const nodeMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.03, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }), N);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), col = new THREE.Color(), upV = v3(0, 1, 0);
  nodes.forEach((p, i) => { m.compose(p, q, sc.setScalar(0.7 + r() * 0.9)); nodeMesh.setMatrixAt(i, m); nodeMesh.setColorAt(i, col.setRGB(0.3, 0.5, 1.1)); });
  nodeMesh.frustumCulled = false; scene.add(nodeMesh);
  const edgeMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.005, 0.005, 1, 5, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), edges.length);
  const E = edges.map(([i, j]) => { const a = j < 0 ? radialEnd(i) : nodes[i], b = nodes[j < 0 ? i : j]; return [a, b]; });
  E.forEach(([a, b], k) => {
    const d = b.clone().sub(a), len = d.length();
    q.setFromUnitVectors(upV, d.normalize()); m.compose(a.clone().add(b).multiplyScalar(0.5), q, sc.set(1, len, 1)); edgeMesh.setMatrixAt(k, m);
    edgeMesh.setColorAt(k, col.setRGB(0.15, 0.3, 0.8));
  });
  edgeMesh.frustumCulled = false; scene.add(edgeMesh);
  // señales que viajan por las conexiones
  const S = 260, sig = Array.from({ length: S }, () => ({ e: Math.floor(r() * E.length), ph: r(), sp: 0.5 + r() * 0.9 }));
  const sigGeo = new THREE.BufferGeometry(); sigGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(S * 3), 3));
  const sigPts = new THREE.Points(sigGeo, new THREE.PointsMaterial({ color: 0x9fd0ff, size: 0.07, map: glowTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  sigPts.frustumCulled = false; scene.add(sigPts);
  // luz cálida al fondo (la salida hacia el bosque)
  const exit = glow(0xffb070, 2.5, 0); exit.position.set(0.6, 0.4, -6); scene.add(exit);
  const flight = new THREE.CatmullRomCurve3([v3(Math.sin(1.1) * 4.6, 0.9, Math.cos(1.1) * 4.6), v3(1.9, 0.6, 1.1), v3(1.2, 0.45, -0.6), v3(0.9, 0.4, -2.6), v3(0.6, 0.4, -4.6)]);
  exit.position.set(0.5, 0.4, -8);
  const camera = new THREE.PerspectiveCamera(42, 9 / 16, 0.02, 120);

  return {
    scene, camera,
    update(t) {
      dome.material.uniforms.time.value = t + 20; dome.material.uniforms.swirl.value = 0.6;
      brain.rotation.y = 0.35 + t * 0.12;
      brain.material.emissiveIntensity = 0.1 + 0.05 * Math.sin(t * 4);
      // la red se enciende como escudo con "sistema de protección" (≈ 2.9–3.4 s)
      const shield = ramp(t, 0.6, 3.2, smoother);
      const sweep = (t - 0.6) * 1.2;
      E.forEach(([a, b], k) => {
        const h = (a.y + b.y) * 0.5 * -0.5 + 0.9; // de arriba abajo
        const on = clamp((sweep - h) * 2);
        const base = 0.5 + 0.5 * Math.sin(t * 2 + k);
        col.setRGB(lerp(0.04 * base, 0.16, on), lerp(0.08 * base, 0.55, on), lerp(0.3 * base, 1.3, on));
        edgeMesh.setColorAt(k, col);
      });
      nodes.forEach((p, i) => {
        const on = clamp((sweep - (p.y * -0.5 + 0.9)) * 2);
        const tw = 0.7 + 0.5 * Math.max(0, Math.sin(t * 3 + i * 1.7));
        nodeMesh.setColorAt(i, col.setRGB(lerp(0.15, 0.5, on) * tw, lerp(0.3, 1.2, on) * tw, lerp(0.7, 2.0, on) * tw));
      });
      edgeMesh.instanceColor.needsUpdate = true; nodeMesh.instanceColor.needsUpdate = true;
      const arr = sigGeo.attributes.position.array;
      sig.forEach((s, i) => { const [a, b] = E[s.e]; const f = (s.ph + t * s.sp) % 1; arr[i * 3] = lerp(a.x, b.x, f); arr[i * 3 + 1] = lerp(a.y, b.y, f); arr[i * 3 + 2] = lerp(a.z, b.z, f); });
      sigGeo.attributes.position.needsUpdate = true;
      sigPts.material.opacity = 0.4 + shield * 0.6;
      exit.material.opacity = ramp(t, 2.8, 4.0) * 0.6;
      exit.scale.setScalar(lerp(2.0, 6, ramp(t, 3.2, 4.3, easeIn)));

      // cámara: retrocede desde la superficie del cerebro → órbita → vuela a través de la red
      let pos, tgt;
      if (t < 2.7) {
        const k = ramp(t, -0.3, 2.7, easeInOut);
        const a = lerp(0.2, 1.1, k);
        const d = lerp(2.3, 4.6, ramp(t, -0.3, 2.0, easeInOut));
        pos = v3(Math.sin(a) * d, lerp(0.25, 0.9, k), Math.cos(a) * d);
        tgt = v3(0, lerp(0.1, 0.0, k), 0);
      } else {
        const k = ramp(t, 2.6, 4.45, easeInOut);
        // entra en la red, pasa entre el cerebro y las conexiones y sale por el otro lado hacia la luz
        pos = flight.getPointAt(Math.min(1, k));
        tgt = flight.getPointAt(Math.min(1, k + 0.12)).lerp(v3(0, 0, 0), (1 - ramp(t, 2.6, 3.3)) * 0.7);
        if (k > 0.88) tgt = pos.clone().add(v3(-0.05, 0, -1));
      }
      pos.add(v3(noise1(t * 0.6, 41) * 0.01, noise1(t * 0.6, 42) * 0.01, 0));
      aim(camera, pos, tgt, 42, noise1(t * 0.4, 43) * 0.04);
      return { focus: pos.distanceTo(v3(0, 0, 0)), aperture: 1.0, maxBlur: 0.012, bloom: 0.5, bloomRadius: 0.5, bloomThreshold: 1.3, exposure: 0.85, saturation: 1.15, contrast: 1.08, vignette: 0.45, ca: 0.003 };
    },
  };
}
