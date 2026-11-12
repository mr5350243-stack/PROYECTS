// ESCENA 07 — La presentación (60.75–66.5 s)
// El calendario (que venía de la burbuja) se posa en la pared: una joven prepara una presentación en su escritorio
// y mira la fecha marcada. La habitación se transforma en un auditorio imaginario: el mobiliario se hunde, se alzan
// las butacas con el público y ella queda en el escenario bajo un foco, nerviosa. Travelling del escritorio al escenario.
// Las luces del auditorio se convierten en pulsos luminosos (→ escena 08).
import * as THREE from 'three';
import { Character, POSES, M, box, rbox, glow, v3, ramp, aim, lerp, noise1, rng, smoother, easeInOut, easeIn, easeOut, track, setEnvIntensity } from '../shared.js';

function makeWoman() {
  const c = new Character({ seed: 4, shirt: 0xd2557e, pants: 0x2d3142, hair: 0x3a2418, hairStyle: 'tall', skin: 0xe8b48f, iris: 0x4a2e1c });
  // coleta
  const hairM = new THREE.MeshStandardMaterial({ color: 0x3a2418, roughness: 0.6 });
  const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.14, 6, 12), hairM); tail.position.set(0, 0.06, -0.13); tail.rotation.x = 0.5; c.head.add(tail);
  const tie = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.01, 8, 16), new THREE.MeshStandardMaterial({ color: 0xffd43b })); tie.position.set(0, 0.12, -0.11); tie.rotation.x = 1.2; c.head.add(tie);
  return c;
}

export function create() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x120d1c);
  // ---- habitación de estudio ----
  const room = new THREE.Group(); scene.add(room);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), M.std(0x8a6a50, 0.7)); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 3), M.std(0xe6d8c6, 0.9)); wall.position.set(0.4, 1.5, 1.25); wall.rotation.y = Math.PI; wall.receiveShadow = true; room.add(wall);
  const deskG = new THREE.Group(); room.add(deskG);
  rbox(1.3, 0.05, 0.6, 0.02, M.std(0xf1e6d4, 0.6), 0, 0.74, 0.55, deskG);
  for (const x of [-0.6, 0.6]) box(0.05, 0.72, 0.5, M.std(0xd9c8b0, 0.6), x, 0.36, 0.55, deskG);
  const chair = rbox(0.45, 0.06, 0.45, 0.03, M.std(0x3c4a5c, 0.6), 0, 0.47, -0.1, room);
  // portátil con diapositiva
  const slideC = document.createElement('canvas'); slideC.width = 320; slideC.height = 200;
  { const g = slideC.getContext('2d'); g.fillStyle = '#ffffff'; g.fillRect(0, 0, 320, 200); g.fillStyle = '#d2557e'; g.fillRect(20, 20, 150, 16);
    const hs = [60, 95, 75, 130]; hs.forEach((h, i) => { g.fillStyle = i === 3 ? '#ffc83a' : '#7aa7d8'; g.fillRect(40 + i * 60, 180 - h, 40, h); }); }
  const slideT = new THREE.CanvasTexture(slideC); slideT.colorSpace = THREE.SRGBColorSpace;
  const laptop = new THREE.Group(); laptop.position.set(0, 0.77, 0.5); deskG.add(laptop);
  rbox(0.4, 0.02, 0.28, 0.01, M.std(0xb8bcc4, 0.35, 0.6), 0, 0.01, 0, laptop);
  const lid = new THREE.Group(); lid.position.set(0, 0.02, 0.14); lid.rotation.x = -0.25; laptop.add(lid);
  rbox(0.4, 0.27, 0.012, 0.01, M.std(0xb8bcc4, 0.35, 0.6), 0, 0.135, 0, lid);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.37, 0.23), new THREE.MeshStandardMaterial({ color: 0, emissive: 0xffffff, emissiveMap: slideT, emissiveIntensity: 0.9 })); screen.position.set(0, 0.135, -0.007); screen.rotation.y = Math.PI; lid.add(screen);
  const lampL = new THREE.PointLight(0xffd8a8, 1.5, 4, 2); lampL.position.set(-0.6, 1.6, 0.6); room.add(lampL);
  // calendario de pared con la fecha marcada
  const calC = document.createElement('canvas'); calC.width = 256; calC.height = 300;
  const calTex = new THREE.CanvasTexture(calC); calTex.colorSpace = THREE.SRGBColorSpace;
  const drawCal = (pulse) => { const g = calC.getContext('2d'); g.fillStyle = '#fbfaf7'; g.fillRect(0, 0, 256, 300); g.fillStyle = '#e5384f'; g.fillRect(0, 0, 256, 70);
    g.fillStyle = '#d7d9de'; for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) g.fillRect(14 + c * 33, 88 + r * 41, 26, 32);
    g.strokeStyle = '#e5384f'; g.lineWidth = 6 + pulse * 5; g.beginPath(); g.arc(14 + 4 * 33 + 13, 88 + 3 * 41 + 16, 21 + pulse * 5, 0, 7); g.stroke(); calTex.needsUpdate = true; };
  drawCal(0);
  const calendar = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.02), [M.std(0xeeeeee), M.std(0xeeeeee), M.std(0xeeeeee), M.std(0xeeeeee), new THREE.MeshStandardMaterial({ map: calTex, roughness: 0.6, color: 0xdddddd }), M.std(0xdddddd)]);
  scene.add(calendar);
  const calHome = v3(0.62, 1.42, 1.22), calQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0));

  // ---- auditorio imaginario ----
  const aud = new THREE.Group(); scene.add(aud);
  const stage = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.7, 0.25, 64, 1, false, -Math.PI / 2, Math.PI), M.std(0x6b4a34, 0.5)); stage.position.set(0, 0.125, 0.2); stage.rotation.y = 0; aud.add(stage);
  const ROWS = 6, COLS = 11, R = rng(7);
  const seatGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5), bodyGeo = new THREE.CapsuleGeometry(0.16, 0.32, 4, 10), headGeo = new THREE.SphereGeometry(0.12, 16, 12);
  const seats = new THREE.InstancedMesh(seatGeo, M.std(0x7a1f35, 0.7), ROWS * COLS);
  const bodies = new THREE.InstancedMesh(bodyGeo, M.std(0x25304a, 0.8), ROWS * COLS);
  const heads = new THREE.InstancedMesh(headGeo, M.std(0x2e3a58, 0.7), ROWS * COLS);
  const people = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) people.push({ x: (c - (COLS - 1) / 2) * 0.66 + (r % 2) * 0.2, z: 2.3 + r * 0.85, y: r * 0.22, ph: R() * 6, d: r * 0.12 + Math.abs(c - 5) * 0.03, filled: R() < 0.85 });
  [seats, bodies, heads].forEach(m => { m.frustumCulled = false; aud.add(m); });
  // telón del escenario
  const curG = new THREE.PlaneGeometry(6, 4.5, 120, 1); const cp = curG.attributes.position;
  for (let i = 0; i < cp.count; i++) cp.setZ(i, Math.sin(cp.getX(i) * 9) * 0.08);
  curG.computeVertexNormals();
  const curtain = new THREE.Mesh(curG, M.phys(0x8a1028, { roughness: 0.75, sheen: 1, sheenColor: new THREE.Color(0xff6080) })); curtain.position.set(0, 2.25, -1.3); aud.add(curtain);
  const ceil = [];
  for (let i = 0; i < 9; i++) { const b = glow(0xfff0c8, 0.5, 0); b.position.set((i - 4) * 0.9, 4.2, 3.5 + Math.sin(i) * 0.5); aud.add(b); ceil.push(b); }
  const spot = new THREE.SpotLight(0xfff2d8, 0, 12, 0.32, 0.5, 1.2); spot.position.set(0, 5.5, 2.5); spot.target.position.set(0, 0.3, 0.1); spot.castShadow = true; aud.add(spot, spot.target);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.0, 5.5, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff0d0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  cone.position.set(0, 2.85, 1.2); cone.rotation.x = 0.38; aud.add(cone);

  const woman = makeWoman(); scene.add(woman.root);
  woman.root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  const key = new THREE.DirectionalLight(0xfff0e0, 1.8); key.position.set(2, 4, 3); key.castShadow = true; scene.add(key);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x302030, 0.6); scene.add(hemi);
  setEnvIntensity(scene, 0.4);
  const camera = new THREE.PerspectiveCamera(38, 9 / 16, 0.02, 60);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3();

  const camPos = track([[0, v3(-0.75, 1.55, -0.85)], [2.3, v3(-0.6, 1.5, -0.7)], [3.9, v3(1.3, 2.05, 5.2)], [5.8, v3(0.3, 2.08, 4.3)]], easeInOut);
  const camTgt = track([[0, v3(0.35, 1.2, 0.85)], [1.4, v3(0.4, 1.25, 0.9)], [2.3, v3(0.1, 1.1, 0.4)], [3.9, v3(0, 1.15, 0.2)], [5.8, v3(0, 1.3, 0.2)]], easeInOut);

  return {
    scene, camera,
    update(t) {
      const morph = ramp(t, 2.3, 3.8, easeInOut);     // habitación → auditorio
      // ---- calendario: llega desde la cámara y se cuelga en la pared ----
      const aim0 = camPos(t), tgt0 = camTgt(t);
      aim(camera, aim0, tgt0, 38); camera.updateMatrixWorld(true);
      const fwd = new THREE.Vector3(); camera.getWorldDirection(fwd);
      const ck = ramp(t, 0, 0.9, easeInOut);
      calendar.position.copy(camera.position).addScaledVector(fwd, 1.0).lerp(calHome, ck);
      calendar.quaternion.copy(camera.quaternion).slerp(calQ, ck);
      calendar.scale.setScalar(lerp(0.65, 1, ck) * (1 - ramp(t, 2.3, 2.8)) + 0.001);
      const pulse = Math.max(0, Math.sin((t - 1.3) * 6)) * ramp(t, 1.3, 1.6) * (1 - ramp(t, 2.6, 2.9));
      drawCal(pulse);
      // ---- mobiliario que se hunde y auditorio que se alza ----
      const sink = easeIn(ramp(t, 2.4, 3.4));
      room.scale.set(1, Math.max(0.001, 1 - sink), 1); room.position.y = 0;
      room.visible = sink < 0.999;
      stage.scale.set(1, Math.max(0.001, ramp(t, 2.8, 3.4)), 1);
      curtain.scale.set(1, Math.max(0.001, ramp(t, 2.7, 3.5, easeOut)), 1); curtain.position.y = 2.25 * curtain.scale.y;
      people.forEach((p, i) => {
        const k = easeOut(ramp(t, 2.6 + p.d, 3.3 + p.d));
        const turn = Math.sin(t * 0.8 + p.ph) * 0.3;
        m4.compose(v3(p.x, p.y + 0.25 * k - (1 - k) * 0.6, p.z), q, sc.set(1, Math.max(0.001, k), 1)); seats.setMatrixAt(i, m4);
        const pk = p.filled ? k : 0;
        m4.compose(v3(p.x, p.y + 0.82 * pk - (1 - pk) * 0.8, p.z - 0.05), q, sc.setScalar(Math.max(0.001, pk))); bodies.setMatrixAt(i, m4);
        m4.compose(v3(p.x + Math.sin(turn) * 0.02, p.y + 1.22 * pk - (1 - pk) * 0.8, p.z - 0.08), q, sc.setScalar(Math.max(0.001, pk))); heads.setMatrixAt(i, m4);
      });
      seats.instanceMatrix.needsUpdate = bodies.instanceMatrix.needsUpdate = heads.instanceMatrix.needsUpdate = true;
      const lights = ramp(t, 3.2, 3.9);
      spot.intensity = lights * 16; cone.material.opacity = lights * 0.06;
      // luces del techo: encendidas y, al final, pulsan y se agrandan (→ pulsos de la escena 08)
      const endP = ramp(t, 5.0, 5.75, easeIn);
      ceil.forEach((b, i) => { b.material.opacity = lights * (0.5 + 0.5 * Math.sin(t * 4 + i)) * 0.6 + endP; b.scale.setScalar(0.5 + endP * 3); });
      key.intensity = lerp(1.8, 0.35, morph); hemi.intensity = lerp(0.6, 0.15, morph); lampL.intensity = 1.5 * (1 - morph);
      scene.background.setRGB(lerp(0.07, 0.03, morph), lerp(0.05, 0.02, morph), lerp(0.11, 0.06, morph));

      // ---- ella: sentada preparando → de pie en el escenario, nerviosa ----
      const stand = ramp(t, 2.5, 3.5, easeInOut);
      const typing = Math.sin(t * 14) * 0.08 * (1 - ramp(t, 1.2, 1.4));
      const seated = { ...POSES.sit, z: -0.1, spineX: 0.12, lFlex: 0.75, lElb: 1.2, lAbd: 0.12, rFlex: 0.75 + typing, rElb: 1.2 - typing, rAbd: 0.12, lCurl: 0.3, rCurl: 0.3, headX: 0.15,
        headY: lerp(0, 0.55, ramp(t, 1.2, 1.6)) * (1 - ramp(t, 2.1, 2.5)), neckY: lerp(0, 0.25, ramp(t, 1.2, 1.6)) * (1 - ramp(t, 2.1, 2.5)) };
      const onStage = { hipsY: 0.95, lHip: 0, rHip: 0, lKnee: 0, rKnee: 0, lHipAbd: 0.05, rHipAbd: 0.05, lAnk: 0, rAnk: 0, y: 0.25 * ramp(t, 2.8, 3.4), z: 0.1, lFlex: 0.55, lElb: 1.8, lAbd: -0.05, lTw: -0.6, rFlex: 0.55, rElb: 1.8, rAbd: -0.05, rTw: -0.6, lCurl: 0.7, rCurl: 0.7, headX: 0.05, headY: noise1(t * 0.7, 4) * 0.35, spineX: 0.04 };
      const p = Character.mix(seated, onStage, stand);
      p.breathRate = lerp(0.3, 0.6, stand); p.breath = lerp(0.6, 1.4, stand);
      woman.setPose(p);
      woman.setExpr({ worry: lerp(0.3, 0.9, ramp(t, 1.3, 1.8)), smile: lerp(0.2, -0.15, ramp(t, 1.3, 1.8)), eyeOpen: 1 + stand * 0.12, mouthOpen: stand * 0.08, gazeX: noise1(t * 1.6, 9) * 0.4 * stand, gazeY: lerp(-0.3, 0.05, ramp(t, 1.1, 1.4)) });
      woman.apply(t + 61);

      const pos = camPos(t); pos.add(v3(noise1(t * 0.6, 81) * 0.006, noise1(t * 0.6, 82) * 0.006, 0));
      aim(camera, pos, tgt0, lerp(38, 30, morph));
      const focusP = t < 1.2 ? laptop.getWorldPosition(new THREE.Vector3()) : t < 2.3 ? calHome : woman.headPos();
      return { focus: pos.distanceTo(focusP), aperture: 1.6, maxBlur: 0.014, exposure: lerp(1.0, 0.95, morph) + endP * 0.3, saturation: 1.05, contrast: 1.08, tint: [1.02, 1.0, lerp(0.97, 1.05, morph)], bloom: 0.5 + endP * 0.8, bloomThreshold: lerp(1.3, 1.0, morph), vignette: lerp(0.3, 0.5, morph) };
    },
  };
}
