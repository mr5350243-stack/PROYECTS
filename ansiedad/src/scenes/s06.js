// ESCENA 06 — El mensaje sin respuesta (53.6–60.75 s)
// Del teléfono (que venía del reloj) la cámara retrocede: él en el sofá, mensaje enviado y sin respuesta.
// Sobre su cabeza aparecen tres burbujas 3D con escenas imaginarias (una discusión, alguien molesto, una
// conversación interrumpida) que crecen y le rodean. La cámara se mueve entre ellas con profundidad de campo.
// Al final una burbuja se convierte en un calendario (→ escena 07).
import * as THREE from 'three';
import { Character, POSES, P, buildApartment, makePhone, makeHero, makeFriend, tintCharacter, glow, M, v3, ramp, aim, lerp, noise1, smoother, easeInOut, easeOut, easeOutBack, track } from '../shared.js';

function bubble(color) {
  const g = new THREE.Group();
  const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), new THREE.MeshPhysicalMaterial({ color, roughness: 0.08, clearcoat: 1, transparent: true, opacity: 0.22, emissive: color, emissiveIntensity: 0.12, side: THREE.DoubleSide, depthWrite: false }));
  g.add(shell);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 8, 96), M.emit(color, 2.2)); g.add(rim);
  const inner = new THREE.Group(); g.add(inner);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(0.72, 48), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.35, transparent: true, opacity: 0.55 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.68; inner.add(floor);
  const light = new THREE.PointLight(color, 0.6, 1.2, 2); g.add(light);
  return { g, shell, rim, inner, light };
}
const mini = (c, color, s = 0.72) => { tintCharacter(c, color, 0.3); c.root.scale.setScalar(s); return c; };

export function create() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1a1512);
  const apt = buildApartment(); scene.add(apt.root);
  const hero = makeHero(); scene.add(hero.root);
  const phone = makePhone(); hero.arm.R.hand.group.add(phone); phone.position.set(0, -0.078, 0.022);

  // tres burbujas con escenas imaginarias
  const B = [bubble(0xff4a5a), bubble(0xff9a3a), bubble(0xa070ff)];
  B.forEach(b => scene.add(b.g));
  // 1) discusión: dos figuras gesticulando, con chispas entre ellas
  const d1 = mini(makeFriend(), 0xff3040), d2 = mini(makeHero(), 0xff3040);
  d1.root.position.set(-0.3, -0.68, 0); d2.root.position.set(0.3, -0.68, 0);
  B[0].inner.add(d1.root, d2.root);
  const sparks = [];
  for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.09, 4), M.emit(0xffd040, 3)); B[0].inner.add(s); sparks.push(s); }
  // 2) persona molesta: brazos cruzados, ceño fruncido
  const a1 = mini(makeFriend(), 0xff8a20, 0.78); a1.root.position.set(0, -0.68, 0); B[1].inner.add(a1.root);
  // 3) conversación interrumpida: uno se da la vuelta y se aleja
  const c1 = mini(makeHero(), 0x9a60ff), c2 = mini(makeFriend(), 0x9a60ff);
  c1.root.position.set(-0.3, -0.68, 0); c2.root.position.set(0.28, -0.68, 0); B[2].inner.add(c1.root, c2.root);
  const cut = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.3, 0.01), M.emit(0xd0b0ff, 3)); cut.position.set(0, -0.15, 0); cut.rotation.z = 0.4; B[2].inner.add(cut);

  // calendario en el que se convierte la primera burbuja
  const calC = document.createElement('canvas'); calC.width = 256; calC.height = 300;
  { const g = calC.getContext('2d'); g.fillStyle = '#fbfaf7'; g.fillRect(0, 0, 256, 300); g.fillStyle = '#e5384f'; g.fillRect(0, 0, 256, 70);
    g.fillStyle = '#d7d9de'; for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) g.fillRect(14 + c * 33, 88 + r * 41, 26, 32);
    g.strokeStyle = '#e5384f'; g.lineWidth = 6; g.beginPath(); g.arc(14 + 4 * 33 + 13, 88 + 3 * 41 + 16, 21, 0, 7); g.stroke(); }
  const calTex = new THREE.CanvasTexture(calC); calTex.colorSpace = THREE.SRGBColorSpace;
  const calendar = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.02), [M.std(0xeeeeee), M.std(0xeeeeee), M.std(0xeeeeee), M.std(0xeeeeee), new THREE.MeshStandardMaterial({ map: calTex, roughness: 0.6, color: 0xcfcfcf }), M.std(0xdddddd)]);
  scene.add(calendar);
  const camera = new THREE.PerspectiveCamera(36, 9 / 16, 0.01, 60);

  return {
    scene, camera,
    update(t) {
      const worry = ramp(t, 2.6, 4.0);
      apt.setMood({ dim: 0.25 + worry * 0.4, warm: 0.8 - worry * 0.4 });
      // ---- él: mira el teléfono, espera, se inquieta ----
      const p = { ...POSES.sitPhone, z: -2.0 };
      p.headX = lerp(0.22, 0.1, worry); p.breathRate = lerp(0.3, 0.5, worry); p.breath = lerp(0.6, 1.2, worry);
      hero.setPose(p);
      hero.setExpr({ worry: 0.3 + worry * 0.6, smile: lerp(0.1, -0.3, worry), eyeOpen: 1 + worry * 0.1, gazeY: lerp(-0.55, -0.1, ramp(t, 3.0, 3.6)) * (1 - ramp(t, 5.2, 5.8)) + ramp(t, 5.2, 5.8) * 0.35, gazeX: noise1(t * 1.4, 7) * 0.3 * worry });
      hero.apply(t + 54);
      hero.root.updateMatrixWorld(true);
      phone.userData.draw('chat', 1, { sent: 1 }); phone.userData.light.intensity = 0.3 * ramp(t, 1.0, 2.0);

      // ---- burbujas: aparecen sobre la cabeza y crecen hasta rodearle ----
      const head = hero.headPos(v3(0, 0.11, 0));
      const appear = [2.6, 3.3, 4.0];
      const grow = ramp(t, 4.9, 6.2, easeInOut);
      const homes = [v3(-0.5, 0.48, 0.1), v3(0.08, 0.8, -0.05), v3(0.6, 0.42, 0.05)];
      const wide = [v3(-0.9, 0.2, 0.55), v3(0.1, 0.85, 0.75), v3(0.95, 0.1, 0.5)];
      B.forEach((b, i) => {
        const k = easeOutBack(ramp(t, appear[i], appear[i] + 0.5, k2 => k2));
        const sc = Math.max(0.001, k * lerp(0.26, 0.4, grow));
        b.g.scale.setScalar(sc);
        b.g.position.copy(head).add(homes[i].clone().lerp(wide[i], grow)).add(v3(0, Math.sin(t * 1.3 + i * 2) * 0.02, 0));
        b.inner.rotation.y = Math.sin(t * 0.6 + i) * 0.5;
        b.rim.lookAt(camera.position); b.g.visible = t > appear[i];
        b.light.intensity = 0.4 * k;
      });
      // escenas dentro de las burbujas
      const g1 = 0.5 + 0.5 * Math.sin(t * 6);
      d1.setPose({ x: -0.3, y: -0.68, ry: Math.PI / 2, ...P.gestureA, rFlex: 0.5 + g1 * 0.6, rElb: 1.0 + g1 * 0.5 }); d1.setExpr({ worry: 0, smile: -0.6, anger: 1, mouthOpen: 0.4 + g1 * 0.4 }); d1.apply(t);
      d2.setPose({ x: 0.3, y: -0.68, ry: -Math.PI / 2, ...P.gestureA, rFlex: 0.9 - g1 * 0.5, lFlex: 0.4 + g1 * 0.3, lElb: 1.2 }); d2.setExpr({ worry: 0.3, smile: -0.5, anger: 0.8, mouthOpen: 0.5 - g1 * 0.3 }); d2.apply(t + 1);
      sparks.forEach((s, i) => { const a = t * 7 + i * 1.3; s.position.set(Math.sin(a) * 0.06, 0.1 + (i % 3) * 0.1 + Math.sin(a * 1.7) * 0.04, Math.cos(a) * 0.06); s.rotation.set(a, a * 0.7, i); s.scale.setScalar((0.6 + 0.4 * Math.sin(a * 3)) * 1.6); });
      a1.setPose({ y: -0.68, ry: 0.3 + Math.sin(t * 0.8) * 0.2, ...P.armsCrossed, headX: -0.1, headY: -0.4 }); a1.setExpr({ anger: 1, smile: -0.5, worry: 0, eyeOpen: 0.85, gazeX: -0.6 }); a1.apply(t + 2);
      const walk = ramp(t, 4.4, 6.5);
      c2.setPose({ ry: lerp(-Math.PI / 2, Math.PI * 0.75, ramp(t, 4.2, 4.7)), x: 0.28 + walk * 0.25, y: -0.68, z: -walk * 0.2, lFlex: 0.1, rFlex: 0.1 }); c2.setExpr({ smile: -0.3 }); c2.apply(t + 3);
      c1.setPose({ x: -0.3, y: -0.68, ry: Math.PI / 2, ...P.gestureA }); c1.setExpr({ worry: 0.8, smile: -0.2, mouthOpen: 0.3 }); c1.apply(t + 4);

      // ---- cámara ----
      // 0–2.4: del teléfono al plano medio · 2.4–5: entre las burbujas (rack focus) · 5–6.4: las burbujas le rodean
      const ph = phone.getWorldPosition(new THREE.Vector3());
      let pos, tgt, focusP;
      if (t < 2.4) {
        const k = ramp(t, -0.2, 2.4, easeInOut);
        const n = new THREE.Vector3(0, 0, 1).applyQuaternion(phone.getWorldQuaternion(new THREE.Quaternion()));
        pos = ph.clone().addScaledVector(n, 0.24).add(v3(0, 0.03, 0)).lerp(v3(0.3, 1.45, 0.25), k);
        tgt = ph.clone().lerp(head.clone().add(v3(0, 0.1, 0)), k); focusP = k < 0.6 ? ph : head;
      } else {
        const order = [[2.6, 0], [3.7, 1], [4.6, 2]];
        let det = 0; order.forEach(([s0, i]) => { if (t >= s0) det = i; });
        const k = ramp(t, 2.4, 6.4, easeInOut);
        const a = lerp(0.13, -0.45, k);
        pos = v3(Math.sin(a) * lerp(2.3, 2.7, k), lerp(1.45, 1.6, k), -2.0 + Math.cos(a) * lerp(2.3, 2.7, k));
        const bp = B[det].g.position;
        tgt = head.clone().add(v3(0, 0.3, 0)).lerp(bp, 0.3 * (1 - grow));
        focusP = t > 5.2 ? head : bp;
      }
      // final: la burbuja roja vuela a la cámara y se convierte en calendario
      camera.position.copy(pos);
      const fk = ramp(t, 6.2, 7.15, easeInOut);
      if (fk > 0) {
        aim(camera, pos, tgt, 36); camera.updateMatrixWorld(true);
        const fwd = new THREE.Vector3(); camera.getWorldDirection(fwd);
        const near = camera.position.clone().addScaledVector(fwd, 1.0);
        B[0].g.position.lerp(near, fk);
        const spin = fk * Math.PI;
        calendar.position.copy(B[0].g.position);
        calendar.quaternion.copy(camera.quaternion); calendar.rotateY(spin - Math.PI);
        B[0].g.quaternion.copy(camera.quaternion); B[0].g.rotateY(spin);
        B[0].g.visible = spin < Math.PI / 2; calendar.visible = spin >= Math.PI / 2;
        calendar.scale.setScalar(0.65);
        focusP = near;
      } else calendar.visible = false;
      pos.add(v3(noise1(t * 0.6, 71) * 0.006, noise1(t * 0.6, 72) * 0.006, 0));
      aim(camera, pos, tgt, 36);
      return { focus: pos.distanceTo(focusP), aperture: 1.8, maxBlur: 0.014, exposure: lerp(1.0, 0.9, worry), saturation: lerp(1.05, 0.95, worry), contrast: 1.06, tint: [1, 0.98, lerp(0.97, 1.04, worry)], bloom: 0.45, bloomThreshold: 1.3, vignette: 0.32 + worry * 0.12 };
    },
  };
}
