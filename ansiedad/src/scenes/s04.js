// ESCENA 04 — El experimento científico (30.3–40.1 s) · recreación simplificada, no imágenes reales del estudio
// La hoja se convierte en una tarjeta de protocolo que se posa sobre la mesa del investigador; la cámara revela el
// laboratorio: dos estaciones separadas por un cristal. En la A una luz anuncia el estímulo desagradable; en la B
// llega sin aviso. Travelling lateral continuo de A a B; el sobresalto final da paso a la escena 05.
import * as THREE from 'three';
import { Character, POSES, M, box, rbox, v3, ramp, aim, lerp, noise1, smoother, easeInOut, easeOut, clamp, glow, track, setEnvIntensity } from '../shared.js';

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return { tex: t, g, c };
}

/** sobresalto: arranque brusco y vuelta suave */
const startle = (t, t0, dur = 0.9) => t < t0 ? 0 : Math.min(1, (t - t0) / 0.07) * Math.exp(-(t - t0) * 3.2 / dur);

export function create() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x9fb9c0);
  // ---- sala ----
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), M.phys(0xc3ced4, { roughness: 0.35, clearcoat: 0.4 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const wallM = M.std(0xb4d3d8, 0.9);
  box(14, 4, 0.1, wallM, 0, 2, -2.4, scene).receiveShadow = true;
  box(14, 0.12, 0.02, M.std(0x3fb1b8, 0.5), 0, 1.15, -2.34, scene);              // franja turquesa
  for (const x of [-3.2, 0, 3.2]) box(1.8, 0.04, 0.6, M.emit(0xffffff, 1.4), x, 3.0, -0.4, scene);   // paneles de techo
  // cristal esmerilado entre estaciones
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.1, 2.6), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.35, transmission: 0.0, transparent: true, opacity: 0.35, clearcoat: 1 }));
  glass.position.set(0, 1.05, -0.9); scene.add(glass);
  box(0.06, 2.1, 0.06, M.std(0x9aa7ad, 0.4, 0.6), 0, 1.05, 0.4, scene);

  // ---- estaciones ----
  const stations = [];
  const mkStation = (x, withCue, person) => {
    const st = new THREE.Group(); st.position.x = x; scene.add(st);
    rbox(0.44, 0.45, 0.4, 0.05, M.std(0x5b6670, 0.6), 0, 0.225, -0.55, st);      // taburete
    rbox(1.1, 0.06, 0.55, 0.02, M.std(0xf6f7f8, 0.4), 0, 0.74, 0.12, st);         // mesa
    box(0.05, 0.72, 0.05, M.std(0x9aa7ad, 0.4, 0.6), -0.48, 0.36, 0.3, st); box(0.05, 0.72, 0.05, M.std(0x9aa7ad, 0.4, 0.6), 0.48, 0.36, 0.3, st);
    // dispositivo: panel con lámpara de aviso y emisor del estímulo, mirando al participante
    const dev = new THREE.Group(); dev.position.set(0.36, 0.77, 0.05); dev.rotation.y = Math.PI + 0.75; dev.scale.setScalar(0.8); st.add(dev);
    rbox(0.42, 0.26, 0.12, 0.03, M.std(0x2b3440, 0.4), 0, 0.13, 0, dev);
    const lampM = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0xffc83a, emissiveIntensity: 0, roughness: 0.3 });
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.06, 24, 16), lampM); lamp.position.set(-0.1, 0.42, 0); dev.add(lamp);
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 8), M.std(0x9aa7ad, 0.4, 0.6)); stalk.position.set(-0.1, 0.32, 0); dev.add(stalk); if (!withCue) stalk.visible = false;
    const lampGlow = glow(0xffd04a, 0.8, 0); lamp.add(lampGlow);
    if (!withCue) { lamp.visible = false; }
    const em = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.045, 0.04, 24), M.std(0x8b97a3, 0.3, 0.7)); em.rotation.x = Math.PI / 2; em.position.set(0.1, 0.13, 0.07); dev.add(em);
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(1, 0.02, 8, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.0, 0.4, 0.35), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      r.position.set(0.1, 0.13, 0.1); dev.add(r); rings.push(r);
    }
    // sensores en el antebrazo (detalle de laboratorio)
    scene.add(person.root); person.root.position.x = x;
    const o = { st, dev, lamp, lampM, lampGlow, rings, person, x, withCue };
    stations.push(o);
    return o;
  };
  const pA = new Character({ seed: 2, shirt: 0x3c9a6a, pants: 0x3b3f4a, hair: 0x5a3a22, hairStyle: 'tall', skin: 0xc48a66, iris: 0x2e4a2c });
  const pB = new Character({ seed: 3, shirt: 0xe07a3a, pants: 0x34394a, hair: 0x1d1612, skin: 0xd9a07c, iris: 0x3a2a1a });
  const A = mkStation(-1.25, true, pA), B = mkStation(1.25, false, pB);

  // ---- mesa del investigador en primer plano: monitor con las respuestas y la tarjeta de protocolo ----
  const desk = new THREE.Group(); desk.position.set(-0.1, 0, 2.7); scene.add(desk);
  rbox(1.4, 0.05, 0.6, 0.02, M.std(0xf2f2f0, 0.5), 0, 0.76, 0, desk);
  box(0.05, 0.74, 0.05, M.std(0x9aa7ad, 0.4, 0.6), -0.6, 0.37, 0.2, desk); box(0.05, 0.74, 0.05, M.std(0x9aa7ad, 0.4, 0.6), 0.6, 0.37, 0.2, desk);
  const scr = canvasTex(512, 300, () => {});
  const mon = new THREE.Group(); mon.position.set(0.5, 0.79, -0.1); mon.rotation.y = Math.PI + 0.55; desk.add(mon);
  rbox(0.62, 0.38, 0.03, 0.015, M.std(0x1c2228, 0.4), 0, 0.3, 0, mon);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.34), new THREE.MeshBasicMaterial({ map: scr.tex })); screen.position.set(0, 0.3, -0.017); screen.rotation.y = Math.PI; mon.add(screen);
  box(0.04, 0.12, 0.04, M.std(0x1c2228, 0.4), 0, 0.06, 0, mon);
  const clip = rbox(0.26, 0.012, 0.34, 0.01, M.std(0x8a5a32, 0.6), -0.35, 0.79, 0.02, desk); clip.rotation.y = 0.2;
  const cardTex = canvasTex(256, 340, (g, w, h) => {
    g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3fb1b8'; g.fillRect(0, 0, w, 46);
    g.fillStyle = '#c9cfd3'; for (let i = 0; i < 9; i++) g.fillRect(22, 70 + i * 26, i % 3 === 2 ? 120 : 200, 8);
    g.fillStyle = '#ffc83a'; g.beginPath(); g.arc(46, 310, 12, 0, 7); g.fill();
    g.strokeStyle = '#e5384f'; g.lineWidth = 4; g.beginPath(); g.arc(96, 310, 12, 0, 7); g.stroke();
  });
  const card = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.27), new THREE.MeshStandardMaterial({ map: cardTex.tex, roughness: 0.7, side: THREE.DoubleSide }));
  scene.add(card);

  // ---- luz ----
  const sun = new THREE.DirectionalLight(0xfff6ea, 2.0); sun.position.set(2, 5, 4); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 }); sun.shadow.radius = 4; scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xeaf6ff, 0x8a989e, 0.55));
  scene.traverse(o => { if (o.isMesh) { o.castShadow = o.castShadow || false; o.receiveShadow = true; } });
  [pA, pB].forEach(p => p.root.traverse(o => { if (o.isMesh) o.castShadow = true; }));
  setEnvIntensity(scene, 0.5);
  const camera = new THREE.PerspectiveCamera(38, 9 / 16, 0.02, 60);

  // eventos (tiempo local): A = aviso luminoso → estímulo; B = estímulo sin aviso
  const EV = { A: [[2.6, 3.5], [6.2, 7.15]], B: [4.4, 8.95] };
  const camPos = track([
    [0.0, v3(-0.4, 1.33, 3.12)], [1.9, v3(0.0, 2.6, 5.6)], [5.6, v3(-0.85, 1.6, 3.0)],
    [6.4, v3(-0.82, 1.32, 1.85)], [7.6, v3(-0.75, 1.32, 1.8)], [8.5, v3(1.1, 1.32, 1.8)], [9.9, v3(1.2, 1.3, 1.4)],
  ], easeInOut);
  const camTgt = track([
    [0.0, v3(-0.45, 0.82, 2.72)], [1.9, v3(0, 0.75, -0.4)], [5.6, v3(-1.15, 0.95, -0.4)],
    [6.4, v3(-1.07, 0.98, -0.4)], [7.6, v3(-1.03, 0.98, -0.4)], [8.5, v3(1.25, 0.98, -0.4)], [9.9, v3(1.25, 1.02, -0.45)],
  ], easeInOut);
  const fovT = track([[0, 38], [1.9, 50], [5.6, 40], [6.4, 38], [9.9, 36]], easeInOut);

  return {
    scene, camera,
    update(t) {
      // ---- participantes ----
      stations.forEach((s, si) => {
        let sk = 0, cue = 0, stim = [];
        if (s.withCue) {
          EV.A.forEach(([c0, s0]) => { cue = Math.max(cue, ramp(t, c0, c0 + 0.12) * (1 - ramp(t, s0 + 0.15, s0 + 0.4))); stim.push(s0); });
        } else stim = EV.B;
        // con aviso: sobresalto menor (se prepara); sin aviso: sobresalto completo
        stim.forEach(s0 => { sk = Math.max(sk, startle(t, s0) * (s.withCue ? 0.55 : 1)); });
        const brace = s.withCue ? cue * 0.6 : 0;
        const p = Character.mix({ ...POSES.sit, x: s.x, z: -0.55, lFlex: 0.5, lElb: 1.0, lAbd: 0.1, rFlex: 0.5, rElb: 1.0, rAbd: 0.1, lCurl: 0.3, rCurl: 0.3, headX: 0.12, neckX: 0.05 },
          { ...POSES.sit, x: s.x, z: -0.55, spineX: -0.2, lFlex: 0.95, lElb: 1.7, lAbd: 0.35, rFlex: 0.95, rElb: 1.7, rAbd: 0.35, lCurl: 0.8, rCurl: 0.8, headX: -0.18, neckX: -0.12, lHip: 1.3, rHip: 1.3 }, Math.min(1, sk + brace * 0.35));
        p.headY = noise1(t * 0.4, si * 9) * 0.15 * (1 - sk); p.breathRate = 0.35 + sk * 0.4; p.breath = 0.8 + sk;
        s.person.setPose(p);
        s.person.setExpr({ worry: Math.min(1, 0.25 + brace + sk), smile: -0.2 - sk * 0.4, eyeOpen: 1 + sk * 0.45 - brace * 0.15, squint: brace * 0.5, mouthOpen: sk * 0.35, gazeY: -0.25 + sk * 0.2 });
        s.person.apply(t + 30 + si * 3);
        // lámpara de aviso y anillos del estímulo
        s.lampM.emissiveIntensity = cue * 3.5; s.lampGlow.material.opacity = cue * 0.9;
        s.rings.forEach((r, i) => {
          let a = 0, rr = 0.01;
          stim.forEach(s0 => { const k = (t - s0 - i * 0.12) / 0.6; if (k > 0 && k < 1) { a = Math.max(a, 1 - k); rr = 0.04 + k * 0.45; } });
          r.scale.setScalar(rr); r.material.opacity = a;
        });
      });

      // ---- monitor: dos trazos de respuesta (ilustrativos, sin valores) ----
      const g = scr.g; const W = 512, H = 300;
      g.fillStyle = '#0f1a20'; g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(120,180,190,0.18)'; g.lineWidth = 1;
      for (let x = 0; x < W; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
      const trace = (y0, color, events, amp) => {
        g.strokeStyle = color; g.lineWidth = 3; g.beginPath();
        for (let px = 0; px < W; px += 2) {
          const tt = t - (W - px) / W * 4.0;
          let v = Math.sin(tt * 7 + y0) * 2 + noise1(tt * 3, y0) * 3;
          events.forEach(e => { if (tt > e) v -= startle(tt, e) * amp; });
          px === 0 ? g.moveTo(px, y0 + v) : g.lineTo(px, y0 + v);
        }
        g.stroke();
      };
      trace(95, '#ffc83a', EV.A.map(e => e[1]), 40);
      trace(220, '#ff5a6e', EV.B, 70);
      g.fillStyle = '#ffc83a'; g.font = 'bold 26px sans-serif'; g.fillText('A', 14, 40);
      g.fillStyle = '#ff5a6e'; g.fillText('B', 14, 165);
      scr.tex.needsUpdate = true;

      // ---- tarjeta: llena el plano al inicio (viene de la hoja) y se posa sobre la tablilla ----
      const ck = ramp(t, 0.0, 1.5, easeInOut);
      camera.updateMatrixWorld(true);
      const pos = camPos(t), tgt = camTgt(t);
      pos.add(v3(noise1(t * 0.6, 51) * 0.008, noise1(t * 0.6, 52) * 0.008, 0));
      aim(camera, pos, tgt, fovT(t));
      const fwd = new THREE.Vector3(); camera.getWorldDirection(fwd);
      const start = camera.position.clone().addScaledVector(fwd, 0.16);
      const rest = desk.localToWorld(v3(-0.35, 0.8, 0.02));
      card.position.copy(start).lerp(rest, ck);
      const qa = camera.quaternion.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0.0)));
      const qb = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0.2));
      card.quaternion.copy(qa).slerp(qb, ck);
      card.rotateZ(Math.sin(ck * Math.PI) * 0.6);

      const focusP = t < 1.6 ? card.position : (t < 8.0 ? v3(-1.25, 1.1, -0.5) : v3(1.25, 1.1, -0.5));
      return { focus: camera.position.distanceTo(focusP), aperture: lerp(1.6, 0.9, ramp(t, 0.5, 2)), maxBlur: 0.012, exposure: 0.84, contrast: 1.1, saturation: 1.05, tint: [0.99, 1.0, 1.02], bloom: 0.3, bloomThreshold: 1.4, vignette: 0.28 };
    },
  };
}
