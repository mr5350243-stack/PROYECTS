// ESCENA 08 — El efecto dominó (67.6–76.0 s)
// Fichas cada vez más grandes caen en espiral hasta formar una torre sobre el protagonista; se congela;
// la cámara se aleja y revela que todo ocurre dentro de una burbuja imaginaria.
import * as THREE from 'three';
import { setEnvIntensity } from '../sets.js';
import { M, rbox, v3, ramp, aim, lerp, noise1, rng, skyDome, clamp, smoother, easeIn, easeInOut, dustField } from '../lib.js';
import { makeHero, glow } from '../common.js';

export function create() {
  const scene = new THREE.Scene();
  const dome = skyDome(0x04030c, 0x120a2e, 0x020108, 70); scene.add(dome);
  const stars = (() => { const n = 1200, a = new Float32Array(n * 3), rr = rng(5); for (let i = 0; i < n; i++) { const d = v3(rr() * 2 - 1, rr() * 2 - 1, rr() * 2 - 1).normalize().multiplyScalar(30 + rr() * 30); a.set([d.x, d.y, d.z], i * 3); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3)); const p = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xbfc8ff, size: 0.18, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending })); p.userData.update = () => {}; return p; })(); scene.add(stars);
  const r = rng(88);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(8.2, 96), M.phys(0x0f1022, { roughness: 0.15, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const rimRing = new THREE.Mesh(new THREE.TorusGeometry(8.2, 0.03, 8, 160), M.emit(0x6a7aff, 2)); rimRing.rotation.x = Math.PI / 2; scene.add(rimRing);

  // ---- fichas de dominó en espiral ----
  const N = 21, doms = [];
  const domM = M.phys(0xf3eee4, { roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12 });
  const pipM = M.std(0x15151a, 0.4);
  let theta = 0.4, T = 0.6;
  for (let i = 0; i < N; i++) {
    const h = 0.07 * Math.pow(1.215, i), w = h * 0.5, d = h * 0.17;
    const rr = lerp(7.0, 2.0, Math.pow(i / (N - 1), 0.85));
    const pos = v3(Math.cos(theta) * rr, 0, Math.sin(theta) * rr);
    const tangent = v3(-Math.sin(theta), 0, Math.cos(theta));     // dirección de caída
    const pivot = new THREE.Group(); pivot.position.copy(pos).add(tangent.clone().multiplyScalar(d / 2)); scene.add(pivot);
    pivot.lookAt(pivot.position.clone().add(tangent));            // +z local = dirección de caída
    const body = rbox(w, h, d, Math.min(d * 0.25, 0.04), domM, 0, h / 2, -d / 2, pivot);
    // línea central y puntos (cara frontal)
    const line = rbox(w * 0.8, h * 0.012, d * 0.08, 0.002, pipM, 0, h / 2, 0.0, pivot);
    const pipGeo = new THREE.CylinderGeometry(w * 0.07, w * 0.07, d * 0.08, 16); pipGeo.rotateX(Math.PI / 2);
    const nA = 1 + Math.floor(r() * 5), nB = 1 + Math.floor(r() * 5);
    const layout = [[0, 0], [-1, -1], [1, 1], [-1, 1], [1, -1], [-1, 0], [1, 0]];
    for (const [half, n] of [[1, nA], [-1, nB]]) for (let k = 0; k < n; k++) {
      const [px, py] = layout[k];
      const pip = new THREE.Mesh(pipGeo, pipM); pip.position.set(px * w * 0.26, h / 2 + half * h * 0.25 + py * h * 0.1, 0.0); pivot.add(pip);
    }
    const next = h * 0.62;
    const tau = 0.155 * Math.pow(1.047, i);
    doms.push({ pivot, h, w, d, T, tau, pos, tangent, theta, rr });
    T += tau;
    if (i < N - 1) theta += (next + d) / rr;
  }
  // la última ficha (la "torre") se orienta para caer sobre el protagonista
  const last = doms[N - 1];
  last.pivot.lookAt(v3(0, 0, 0));
  const hero = makeHero(); scene.add(hero.root);
  const heroRY = Math.atan2(last.pos.x, last.pos.z);

  // ---- burbuja imaginaria ----
  const bubbleMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { k: { value: 0 }, time: { value: 0 } },
    vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); vP = position; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform float k, time; varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main(){ float f = pow(1. - abs(dot(vN, vV)), 2.5);
        float h = vP.y*0.25 + vP.x*0.15 + time*0.2 + f*2.;
        vec3 irid = 0.5 + 0.5*cos(6.2831*(vec3(0.,0.33,0.67) + h));
        gl_FragColor = vec4(mix(vec3(0.6,0.7,1.), irid, 0.55) * (f*0.7 + 0.015) * k, 1.); }`,
  });
  const bubble = new THREE.Mesh(new THREE.SphereGeometry(9.2, 96, 64), bubbleMat); bubble.position.y = 1.2; scene.add(bubble);

  const key = new THREE.SpotLight(0xffa25a, 22, 30, 0.6, 0.5, 1.2); key.position.set(4, 9, 5); key.target.position.set(0, 0, 0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  const rim1 = new THREE.PointLight(0x4a6aff, 5, 18, 1.6); rim1.position.set(-6, 3, -5); scene.add(rim1);
  const rim2 = new THREE.PointLight(0xa04aff, 2.0, 16, 1.6); rim2.position.set(5, 2, -6); scene.add(rim2);
  scene.add(new THREE.HemisphereLight(0x5a6aff, 0x0a0614, 0.35));
  const heroL = new THREE.PointLight(0xffc89a, 0.6, 4, 2); heroL.position.set(0.8, 2.6, 1.5); scene.add(heroL);
  setEnvIntensity(scene, 0.12);
  const camera = new THREE.PerspectiveCamera(40, 9 / 16, 0.01, 200);
  const FREEZE = 5.35;

  function angleOf(i, t) {
    const D = doms[i];
    const hit = Math.asin(clamp((D.h * 0.62 + 0.0) / D.h, 0, 1)); // ≈38°
    if (t < D.T) return 0;
    const k = (t - D.T) / D.tau;
    if (k < 1) return hit * k * k;
    if (i === N - 1) return hit;
    // después del impacto se apoya sobre la siguiente mientras ésta cae
    const nk = clamp((t - doms[i + 1].T) / (doms[i + 1].tau * 1.6));
    return lerp(hit, 1.25, nk);
  }

  return {
    scene, camera,
    update(t) {
      const tt = Math.min(t, FREEZE);
      dome.material.uniforms.time.value = tt; stars.userData.update(tt);
      doms.forEach((D, i) => {
        let a = angleOf(i, tt);
        if (i === N - 1) a = ramp(tt, D.T, FREEZE + 0.6, k => k * k) * 0.55;   // la torre empieza a inclinarse sobre él
        D.pivot.rotation.x = 0; D.pivot.rotateX(a);
        D.pivot.rotation.set(0, 0, 0);
        D.pivot.lookAt(D.pivot.position.clone().add(i === N - 1 ? v3(-D.pos.x, 0, -D.pos.z).normalize() : D.tangent));
        D.pivot.rotateX(a);
      });
      // protagonista: mira cómo crece, se encoge ante la torre
      const fear = ramp(tt, 3.6, 5.0);
      hero.setPose({ ry: heroRY, spineX: -0.08 * fear, neckX: -0.2 - fear * 0.25, headX: -0.25 - fear * 0.2, lFlex: 0.3 + fear * 0.9, lElb: 0.6 + fear * 0.9, lAbd: 0.3, rFlex: 0.3 + fear * 0.9, rElb: 0.6 + fear * 0.9, rAbd: 0.3, lCurl: 0.5, rCurl: 0.5, hipsY: 0.95 - fear * 0.06, lKnee: fear * 0.15, rKnee: fear * 0.15, breathRate: 0.6, breath: 1 });
      hero.setExpr({ smile: -0.5, worry: 1, eyeOpen: 1.2, gazeY: 0.6, mouthOpen: fear * 0.4, blink: t < FREEZE });
      hero.apply(tt + 67);
      bubbleMat.uniforms.k.value = ramp(t, FREEZE + 0.2, FREEZE + 1.3); bubbleMat.uniforms.time.value = t;

      // cámara
      const front = (() => { let f = 0; for (let i = 0; i < N; i++) { if (tt >= doms[i].T) f = i + clamp((tt - doms[i].T) / doms[i].tau); } return f; })();
      let pos, tgt, fov = 40, focus, ap = 1;
      if (t < 1.7) {
        const D = doms[0], k = ramp(t, -0.5, 1.7);
        const side = v3(Math.cos(D.theta), 0, Math.sin(D.theta));
        pos = D.pos.clone().add(side.clone().multiplyScalar(0.22 - k * 0.04)).add(D.tangent.clone().multiplyScalar(lerp(0.05, 0.16, k))).add(v3(0, 0.06, 0));
        tgt = D.pos.clone().add(D.tangent.clone().multiplyScalar(0.1)).add(v3(0, 0.05, 0));
        focus = pos.distanceTo(tgt); ap = 6; fov = 34;
      } else if (t < 4.3) {
        const fi = clamp(front, 0, N - 2), i0 = Math.floor(fi), fr = fi - i0;
        const P0 = doms[i0].pos.clone().lerp(doms[i0 + 1].pos, fr), H = lerp(doms[i0].h, doms[i0 + 1].h, fr);
        const th = lerp(doms[i0].theta, doms[i0 + 1].theta, fr);
        const outward = v3(Math.cos(th), 0, Math.sin(th)), tan = v3(-Math.sin(th), 0, Math.cos(th));
        pos = P0.clone().add(outward.multiplyScalar(0.35 + H * 1.9)).add(tan.clone().multiplyScalar(-0.2 - H * 0.6)).add(v3(0, 0.12 + H * 0.9, 0));
        tgt = P0.clone().add(tan.multiplyScalar(H * 0.6)).add(v3(0, H * 0.5, 0));
        focus = pos.distanceTo(tgt); ap = 2.2; fov = 40;
        // mezcla desde el plano macro
        const b = ramp(t, 1.7, 2.3);
        if (b < 1) { const D = doms[0]; const side = v3(Math.cos(D.theta), 0, Math.sin(D.theta)); const p0 = D.pos.clone().add(side.multiplyScalar(0.18)).add(D.tangent.clone().multiplyScalar(0.16)).add(v3(0, 0.06, 0)); pos = p0.lerp(pos, smoother(b)); }
      } else if (t < FREEZE + 0.15) {
        // contrapicado: desde el suelo junto al protagonista, la torre sobre él
        const k = ramp(t, 4.3, FREEZE);
        const dir = v3(Math.sin(heroRY), 0, Math.cos(heroRY));
        const sideV = v3(Math.cos(heroRY), 0, -Math.sin(heroRY));
        pos = dir.clone().multiplyScalar(-1.5 - k * 0.25).add(sideV.multiplyScalar(0.7)).add(v3(0, 0.12, 0)); tgt = last.pos.clone().multiplyScalar(0.55).add(v3(0, last.h * 0.85, 0));
        focus = pos.distanceTo(v3(0, 1.4, 0)); ap = 1.0; fov = 62;
      } else {
        // dolly-out rápido: aparece la burbuja
        const k = ramp(t, FREEZE + 0.15, 8.4, easeInOut);
        const dir = v3(Math.sin(heroRY), 0, Math.cos(heroRY));
        const start = dir.clone().multiplyScalar(-1.75).add(v3(Math.cos(heroRY) * 0.7, 0.12, -Math.sin(heroRY) * 0.7));
        const end = v3(-14, 9, 22);
        pos = start.lerp(end, k); tgt = last.pos.clone().multiplyScalar(0.55).add(v3(0, last.h * 0.85, 0)).lerp(v3(0, 1.2, 0), ramp(t, FREEZE + 0.15, 7.0));
        focus = pos.distanceTo(v3(0, 1.2, 0)); ap = lerp(1.0, 0.3, k); fov = lerp(62, 38, k);
      }
      aim(camera, pos, tgt, fov, t > FREEZE ? 0 : noise1(t, 4) * 0.01);
      const frozen = ramp(t, FREEZE, FREEZE + 0.3);
      return { focus, aperture: ap, maxBlur: 0.016, exposure: 0.95, saturation: lerp(1.1, 0.75, frozen * (1 - ramp(t, 6.5, 8))), contrast: 1.12, tint: [1.02, 0.97, lerp(1, 1.1, frozen)], bloom: 0.7, bloomThreshold: 0.9, vignette: 0.45, ca: 0.002 + frozen * 0.002 };
    },
  };
}
