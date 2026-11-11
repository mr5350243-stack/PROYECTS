// ESCENA 04 — Dentro de la mente (29.3–38.3 s)
// Cámara flotante atravesando una red neuronal luminosa; órbita alrededor de la estructura cerebral;
// una señal se vuelve esfera roja y activa conexiones cercanas (anticipación de amenazas, sin un "centro" único).
import * as THREE from 'three';
import { v3, ramp, aim, lerp, noise1, rng, skyDome, glowTex, smoother, easeIn, clamp } from '../lib.js';
import { ghostMaterial, glow } from '../common.js';

export function create() {
  const scene = new THREE.Scene();
  const dome = skyDome(0x02030c, 0x0b1440, 0x03020a, 50); scene.add(dome);
  scene.fog = new THREE.FogExp2(0x03051a, 0.03);
  const r = rng(44);

  // --- nodos con forma de cerebro (dos hemisferios) ---
  const N = 460, nodes = [];
  while (nodes.length < N) {
    const p = v3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1);
    if (p.length() > 1) continue;
    p.set(p.x * 2.3, p.y * 1.6 + 0.1, p.z * 2.9);
    if (Math.abs(p.x) < 0.18) continue;
    if (p.y < -0.9 && Math.abs(p.z) < 1.0 && Math.abs(p.x) > 0.8) continue;
    nodes.push(p);
  }
  // aristas: 3 vecinos más cercanos
  const edges = [], seen = new Set(), adj = nodes.map(() => []);
  nodes.forEach((a, i) => {
    const near = nodes.map((b, j) => [a.distanceToSquared(b), j]).filter(x => x[1] !== i).sort((x, y) => x[0] - y[0]).slice(0, 3);
    for (const [, j] of near) { const key = Math.min(i, j) + '_' + Math.max(i, j); if (seen.has(key)) continue; seen.add(key); edges.push([i, j]); adj[i].push(j); adj[j].push(i); }
  });
  const nodeMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }), N);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), col = new THREE.Color();
  nodes.forEach((p, i) => { m.compose(p, q, sc.setScalar(0.7 + r() * 0.8)); nodeMesh.setMatrixAt(i, m); nodeMesh.setColorAt(i, col.setRGB(0.3, 0.5, 1.1)); });
  scene.add(nodeMesh);
  const edgeMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.006, 0.006, 1, 5, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }), edges.length);
  const up = v3(0, 1, 0);
  edges.forEach(([i, j], k) => {
    const a = nodes[i], b = nodes[j], d = b.clone().sub(a), len = d.length();
    q.setFromUnitVectors(up, d.normalize());
    m.compose(a.clone().add(b).multiplyScalar(0.5), q, sc.set(1, len, 1)); edgeMesh.setMatrixAt(k, m);
    edgeMesh.setColorAt(k, col.setRGB(0.15, 0.3, 0.8));
  });
  scene.add(edgeMesh);

  // --- membrana translúcida del cerebro (circunvoluciones) ---
  const shellMat = ghostMaterial(0x4a6bff, 0.35);
  for (const s of [-1, 1]) {
    const g = new THREE.SphereGeometry(1, 96, 64); const p = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const fold = 1 + 0.035 * Math.sin(v.x * 9 + v.y * 13) * Math.sin(v.z * 11 - v.y * 7) + 0.02 * Math.sin(v.z * 23 + v.x * 17);
      p.setXYZ(i, v.x * 1.25 * fold, v.y * 1.75 * fold, v.z * 3.0 * fold);
    }
    g.computeVertexNormals();
    const mesh = new THREE.Mesh(g, shellMat); mesh.position.set(s * 1.2, 0.15, 0); scene.add(mesh);
  }

  // --- señales que viajan por las conexiones ---
  const S = 220, sig = [];
  for (let i = 0; i < S; i++) sig.push({ e: Math.floor(r() * edges.length), ph: r(), sp: 0.6 + r() * 0.9, dir: r() < 0.5 });
  const sigGeo = new THREE.BufferGeometry(); sigGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(S * 3), 3));
  const sigPts = new THREE.Points(sigGeo, new THREE.PointsMaterial({ color: 0xff9030, size: 0.13, map: glowTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  sigPts.frustumCulled = false; scene.add(sigPts);

  // --- la señal que se convierte en esfera roja ---
  let hub = 0, best = 1e9;
  nodes.forEach((p, i) => { const d = p.distanceTo(v3(0.9, 0.2, 1.3)); if (d < best) { best = d; hub = i; } });
  const hop = new Array(N).fill(99); hop[hub] = 0; const queue = [hub];
  while (queue.length) { const i = queue.shift(); for (const j of adj[i]) if (hop[j] > hop[i] + 1) { hop[j] = hop[i] + 1; queue.push(j); } }
  const red = new THREE.Mesh(new THREE.SphereGeometry(0.16, 32, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 0.25, 0.12) }));
  red.position.copy(nodes[hub]); scene.add(red);
  const redGlow = glow(0xff3020, 1.6, 0.9); red.add(redGlow);
  const runner = glow(0xffb050, 0.45, 1); scene.add(runner);
  const pathNodes = [hub]; { let cur = hub; for (let k = 0; k < 5; k++) { const nx = adj[cur].sort((a, b) => nodes[b].z - nodes[a].z)[0]; if (nx === undefined) break; pathNodes.unshift(nx); cur = nx; } }

  const camera = new THREE.PerspectiveCamera(50, 9 / 16, 0.05, 120);
  const hubP = nodes[hub];

  return {
    scene, camera,
    update(t) {
      dome.material.uniforms.time.value = t; dome.material.uniforms.swirl.value = 0.6;
      // señales
      const arr = sigGeo.attributes.position.array;
      sig.forEach((s, i) => {
        const [a, b] = edges[s.e]; let f = (s.ph + t * s.sp) % 1; if (s.dir) f = 1 - f;
        const pa = nodes[a], pb = nodes[b];
        arr[i * 3] = lerp(pa.x, pb.x, f); arr[i * 3 + 1] = lerp(pa.y, pb.y, f); arr[i * 3 + 2] = lerp(pa.z, pb.z, f);
      });
      sigGeo.attributes.position.needsUpdate = true;
      // señal "runner" que viaja hacia el hub y se transforma (4.2–5.2 s)
      const rk = ramp(t, 3.9, 5.2, k => k) * (pathNodes.length - 1);
      const ri = Math.min(pathNodes.length - 2, Math.floor(rk)), rf = rk - ri;
      runner.position.copy(nodes[pathNodes[ri]]).lerp(nodes[pathNodes[ri + 1]], rf);
      runner.material.opacity = t > 3.9 && t < 5.3 ? 1 : 0;
      const grow = ramp(t, 5.1, 5.7, smoother);
      const beat = 1 + Math.sin(t * 9) * 0.08 * grow;
      red.scale.setScalar(Math.max(0.001, grow * beat));
      redGlow.material.opacity = 0.9 * grow;
      // activación en cadena alrededor del hub
      const wave = Math.max(0, (t - 5.5) * 3.2);
      edges.forEach(([i, j], k) => {
        const h = Math.min(hop[i], hop[j]);
        const a = clamp(wave - h) * (h < 7 ? 1 : 0) * (1 - Math.max(0, (wave - h - 3) * 0.15));
        const base = 0.6 + 0.4 * Math.sin(t * 2 + k);
        col.setRGB(lerp(0.08 * base, 2.4, a), lerp(0.16 * base, 0.45, a), lerp(0.5 * base, 0.1, a));
        edgeMesh.setColorAt(k, col);
      });
      nodes.forEach((p, i) => {
        const a = clamp(wave - hop[i]) * (hop[i] < 7 ? 1 : 0);
        const tw = 0.7 + 0.5 * Math.max(0, Math.sin(t * 3 + i * 1.7));
        nodeMesh.setColorAt(i, col.setRGB(lerp(0.25 * tw, 3, a), lerp(0.45 * tw, 0.6, a), lerp(1.0 * tw, 0.15, a)));
      });
      edgeMesh.instanceColor.needsUpdate = true; nodeMesh.instanceColor.needsUpdate = true;

      // cámara
      let pos, tgt, fov = 50;
      if (t < 3.6) {
        // travelling frontal atravesando la red
        const k = ramp(t, -0.4, 3.6, k2 => k2);
        pos = v3(0.9 + Math.sin(k * 3) * 0.5, 0.3 + Math.sin(k * 2.2) * 0.3, lerp(6.5, -1.5, k));
        tgt = pos.clone().add(v3(Math.cos(k * 3) * 0.6 - 0.3, -0.1, -3));
      } else if (t < 7.6) {
        // salir y orbitar alrededor de la estructura cerebral
        const k = ramp(t, 3.6, 7.6);
        const a = lerp(Math.PI * 1.05, Math.PI * 0.32, k);
        const R = lerp(2.2, 8.0, ramp(t, 3.6, 5.4));
        pos = v3(Math.sin(a) * R, lerp(0.3, 1.8, k), Math.cos(a) * R);
        const out = ramp(t, 3.6, 5.0);
        tgt = v3(0.4, 0.2, -2.5).lerp(hubP.clone().multiplyScalar(0.6), out);
        fov = lerp(50, 38, k);
      } else {
        // la cámara se lanza hacia la señal luminosa (se convertirá en la linterna)
        const k = ramp(t, 7.6, 9.4, easeIn);
        const start = v3(Math.sin(Math.PI * 0.32) * 8, 1.8, Math.cos(Math.PI * 0.32) * 8);
        pos = start.lerp(hubP.clone().add(v3(0.12, 0.05, 0.25)), k);
        tgt = hubP.clone().multiplyScalar(0.6).lerp(hubP, ramp(t, 7.6, 8.4)); fov = 38;
      }
      aim(camera, pos, tgt, fov, noise1(t * 0.5, 7) * 0.05);
      return { focus: pos.distanceTo(tgt), aperture: 1.2, maxBlur: 0.012, bloom: 0.75, bloomRadius: 0.6, bloomThreshold: 0.9, exposure: 0.85, saturation: 1.2, contrast: 1.1, vignette: 0.5, ca: 0.004 };
    },
  };
}
