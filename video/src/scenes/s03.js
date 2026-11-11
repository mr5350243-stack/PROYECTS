// ESCENA 03 — Imaginar lo peor (20.0–29.3 s)
// Dormitorio: molestia en el abdomen → el cuarto se transforma en un pasillo de hospital imaginario → corte de regreso.
import * as THREE from 'three';
import { Character } from '../character.js';
import { M, rbox, box, v3, ramp, aim, lerp, noise1, keyLight, woodTex, noiseTex, fabricTex, track, smoother, pulse, easeOut } from '../lib.js';
import { makeHero, P, glow } from '../common.js';
import { setEnvIntensity } from '../sets.js';

function bedroom() {
  const g = new THREE.Group();
  const wood = woodTex().clone(); wood.needsUpdate = true; wood.repeat.set(2.5, 2.5);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(6, 7), M.std(0xffffff, 0.55, 0, { map: wood })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; g.add(floor);
  const wallM = M.std(0xffffff, 0.9, 0, { map: noiseTex('bed', '#c9bfd6', 10, 256, 2) });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), wallM); back.position.set(0, 1.5, -2.6); back.receiveShadow = true; g.add(back);
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(7, 3), wallM); w.rotation.y = -s * Math.PI / 2; w.position.set(s * 3, 1.5, 0.5); w.receiveShadow = true; g.add(w); }
  // ventana en la pared del fondo
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.4), new THREE.MeshBasicMaterial({ color: 0xbfe0ff })); win.position.set(1.4, 1.65, -2.59); g.add(win);
  const fm = M.std(0xf5f2ee, 0.4);
  box(1.45, 0.07, 0.08, fm, 1.4, 2.38, -2.56, g); box(1.45, 0.07, 0.08, fm, 1.4, 0.93, -2.56, g);
  box(0.07, 1.5, 0.08, fm, 0.7, 1.65, -2.56, g); box(0.07, 1.5, 0.08, fm, 2.1, 1.65, -2.56, g); box(0.04, 1.4, 0.05, fm, 1.4, 1.65, -2.56, g);
  // cama
  const bed = new THREE.Group(); bed.position.set(-1.25, 0, -1.5); g.add(bed);
  rbox(1.5, 0.35, 2.1, 0.05, M.std(0xffffff, 0.5, 0, { map: woodTex() }), 0, 0.18, 0, bed);
  rbox(1.42, 0.22, 2.0, 0.08, M.phys(0xf3f0ea, { roughness: 0.9, sheen: 0.5, sheenColor: new THREE.Color(0xffffff) }), 0, 0.46, 0, bed);
  rbox(1.46, 0.08, 1.3, 0.04, M.phys(0x7d6fae, { map: fabricTex('duvet', '#7d6fae'), roughness: 0.9, sheen: 0.7, sheenColor: new THREE.Color(0xc9b8ff) }), 0, 0.6, 0.35, bed);
  rbox(0.55, 0.14, 0.35, 0.07, M.phys(0xffffff, { roughness: 0.9 }), -0.33, 0.63, -0.75, bed);
  rbox(0.55, 0.14, 0.35, 0.07, M.phys(0xffffff, { roughness: 0.9 }), 0.33, 0.63, -0.75, bed);
  rbox(1.55, 0.9, 0.08, 0.03, M.std(0xffffff, 0.5, 0, { map: woodTex() }), 0, 0.75, -1.06, bed);
  // mesita + lámpara
  rbox(0.5, 0.5, 0.4, 0.03, M.std(0xffffff, 0.5, 0, { map: woodTex() }), 0.1, 0.25, -2.3, g);
  const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.2, 24, 1, true), M.phys(0xfff0d6, { emissive: 0xffc070, emissiveIntensity: 0.5, side: THREE.DoubleSide }));
  lampShade.position.set(0.1, 0.78, -2.3); g.add(lampShade);
  box(0.02, 0.22, 0.02, M.std(0x333333, 0.4), 0.1, 0.6, -2.3, g);
  const lampL = new THREE.PointLight(0xffb870, 2.5, 5, 2); lampL.position.set(0.1, 0.8, -2.2); g.add(lampL);
  // alfombra, cuadro, estante
  const rug = new THREE.Mesh(new THREE.CircleGeometry(1.2, 48), M.std(0xd9c7a8, 1)); rug.rotation.x = -Math.PI / 2; rug.position.set(0.4, 0.004, -0.3); rug.receiveShadow = true; g.add(rug);
  rbox(0.6, 0.45, 0.03, 0.005, M.std(0x2b2b30, 0.4), -1.25, 1.75, -2.58, g);
  const art = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.37), M.std(0x9fc6d8, 0.8)); art.position.set(-1.25, 1.75, -2.56); g.add(art);
  const plant = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25, 1), M.std(0x4f8a5a, 0.7, 0, { flatShading: true })); plant.position.set(2.5, 0.65, -2.2); g.add(plant);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.4, 20), M.std(0xc9805a, 0.6)); pot.position.set(2.5, 0.2, -2.2); g.add(pot);
  g.traverse(o => { if (o.isMesh) { o.castShadow = o.castShadow || false; o.receiveShadow = true; } });
  return { g, lampL };
}

function corridor() {
  const g = new THREE.Group();
  const segs = [];
  const wallM = M.phys(0xb8d6d8, { roughness: 0.35, clearcoat: 0.4 });
  const floorM = M.phys(0x8fb5b8, { roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 });
  const stripe = M.emit(0x4fd2d6, 0.6);
  const doorM = M.phys(0x6e8f9a, { roughness: 0.4 });
  for (let i = 0; i < 9; i++) {
    const s = new THREE.Group(); s.position.z = 1.5 - i * 2; g.add(s);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2), floorM); f.rotation.x = -Math.PI / 2; f.position.y = 0.01; f.receiveShadow = true; s.add(f);
    for (const side of [-1, 1]) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(2, 2.8), wallM); w.rotation.y = -side * Math.PI / 2; w.position.set(side * 1.4, 1.4, 0); w.receiveShadow = true; s.add(w);
      box(0.02, 0.06, 2, stripe, side * 1.39, 0.95, 0, s).castShadow = false;
      if (i % 2 === 1) { const d = rbox(0.04, 2.0, 0.95, 0.01, doorM, side * 1.38, 1.0, 0, s); const kn = new THREE.Mesh(new THREE.SphereGeometry(0.03), M.std(0xdddddd, 0.2, 1)); kn.position.set(side * 1.34, 1.0, 0.35); s.add(kn); }
    }
    const c = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2), M.std(0xd8e4e6, 0.9)); c.rotation.x = Math.PI / 2; c.position.y = 2.8; s.add(c);
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1.2), M.emit(0xdff6ff, 3.5)); panel.rotation.x = Math.PI / 2; panel.position.y = 2.79; s.add(panel);
    const l = new THREE.PointLight(0xbfefff, 2.2, 5, 2); l.position.y = 2.5; s.add(l);
    segs.push(s);
  }
  // pared del fondo con puerta doble + luz roja intermitente
  const end = new THREE.Group(); end.position.z = 1.5 - 9 * 2 + 1; g.add(end);
  const ew = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.8), wallM); ew.position.y = 1.4; end.add(ew);
  rbox(1.6, 2.1, 0.06, 0.02, doorM, 0, 1.05, 0.03, end);
  const redLamp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), M.emit(0xff2020, 6)); redLamp.position.set(0, 2.45, 0.1); end.add(redLamp);
  const redGlow = glow(0xff2a2a, 1.5, 0.8); redGlow.position.copy(redLamp.position); end.add(redGlow);
  const redL = new THREE.PointLight(0xff2020, 8, 9, 1.6); redL.position.set(0, 2.3, 0.6); end.add(redL);
  // camilla vacía
  const gur = new THREE.Group(); gur.position.set(0.15, 0, -12.5); gur.rotation.y = 0.12; g.add(gur);
  const steel = M.std(0xc8d0d8, 0.25, 0.9);
  rbox(0.7, 0.12, 1.9, 0.04, M.phys(0xf2f6f8, { roughness: 0.6 }), 0, 0.85, 0, gur);
  rbox(0.6, 0.08, 0.4, 0.04, M.phys(0xffffff, { roughness: 0.8 }), 0, 0.95, -0.7, gur);
  box(0.72, 0.03, 1.95, steel, 0, 0.77, 0, gur);
  for (const x of [-0.3, 0.3]) for (const z of [-0.85, 0.85]) { box(0.03, 0.75, 0.03, steel, x, 0.39, z, gur); const w = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.02, 8, 16), M.std(0x222222, 0.6)); w.position.set(x, 0.05, z); w.rotation.y = Math.PI / 2; gur.add(w); }
  return { g, segs, redL, redLamp, redGlow, gur, end };
}

export function create() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0c1416);
  const room = bedroom(); scene.add(room.g);
  const cor = corridor(); scene.add(cor.g);
  const hero = makeHero(); scene.add(hero.root);
  const sun = keyLight(0xdfeaff, 2.4, v3(3, 5, 4), v3(0, 0.8, -1), 5); scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight(0xdfe6ff, 0x6a5a50, 0.6); scene.add(hemi);
  const fill = new THREE.PointLight(0xffd9b0, 1.2, 8, 2); fill.position.set(-1.5, 2.2, 1.5); scene.add(fill);
  const cold = new THREE.HemisphereLight(0x9fe8ff, 0x203038, 0); scene.add(cold);
  setEnvIntensity(scene, 0.4);
  scene.fog = new THREE.Fog(0x0b1a1e, 6, 26);
  const camera = new THREE.PerspectiveCamera(38, 9 / 16, 0.02, 60);

  const HX = 0.3, HZ = -0.3;
  return {
    scene, camera,
    update(t) {
      // ----- transformación: dormitorio → pasillo (3.4–5.2), corte de vuelta en 7.9 -----
      const back = t >= 7.9;
      const morph = back ? 0 : ramp(t, 3.3, 5.4, smoother);
      cor.g.visible = morph > 0.001;
      cor.segs.forEach((s, i) => { const k = ramp(morph, i / 12, i / 12 + 0.35); s.scale.set(1, Math.max(0.001, k), 1); s.visible = k > 0.002; });
      cor.end.scale.y = Math.max(0.001, ramp(morph, 0.6, 1)); cor.gur.scale.setScalar(Math.max(0.001, ramp(morph, 0.55, 0.95, easeOut)));
      room.g.visible = morph < 0.999;
      room.g.children.forEach((o, i) => { if (o.isLight) return; const k = 1 - ramp(morph, 0.05 + (i % 7) * 0.04, 0.45 + (i % 7) * 0.05); o.scale.y = Math.max(0.001, k); });
      sun.intensity = 2.4 * (1 - morph); hemi.intensity = 0.6 * (1 - morph) + 0.05; fill.intensity = 1.2 * (1 - morph);
      room.lampL.intensity = 2.5 * (1 - morph);
      cold.intensity = morph * 0.55;
      const flash = Math.pow(Math.max(0, Math.sin(t * 7.5)), 3);
      cor.redL.intensity = morph * (2 + flash * 14); cor.redLamp.material.emissiveIntensity = 1 + flash * 8; cor.redGlow.material.opacity = 0.2 + flash * 0.8;
      scene.fog.near = lerp(12, 4, morph); scene.fog.far = lerp(40, 22, morph);

      // ----- personaje -----
      const touch = ramp(t, 0.3, 1.1) * (1 - ramp(t, 4.6, 5.4)) * (back ? 0 : 1) + (back ? 1 - ramp(t, 8.0, 8.8) : 0) * 0.6;
      const turnToCorr = ramp(t, 4.2, 5.4) * (back ? 0 : 1);
      const turnBack = back ? 1 : 0;
      let p = Character.mix({ x: HX, z: HZ, lFlex: 0.05, lAbd: 0.1 }, { x: HX, z: HZ, ...P.handBelly, spineX: 0.12, neckX: 0.15, headX: 0.15 }, touch);
      p.ry = lerp(0, Math.PI * 0.92, turnToCorr);
      if (t > 5.2 && !back) { p.headY = Math.sin((t - 5.2) * 2.1) * 0.6; p.headX = -0.1; p.lFlex = 0.2; p.rFlex = 0.2; p.lElb = 0.5; p.rElb = 0.5; }
      p.breathRate = 0.45; p.breath = 1;
      hero.setPose(p);
      hero.setExpr({
        smile: back ? lerp(-0.3, 0.05, ramp(t, 8.2, 9)) : -0.3 - morph * 0.2, worry: back ? lerp(1, 0.4, ramp(t, 8.0, 9)) : 0.7 + morph * 0.3,
        eyeOpen: back ? lerp(0.6, 1, ramp(t, 7.95, 8.4)) : 1 + morph * 0.2, gazeY: touch * -0.6 + (t > 5.2 && !back ? 0.05 : 0), gazeX: t > 5.2 && !back ? Math.sin((t - 5.2) * 2.1 + 0.4) * 0.5 : 0,
        squint: back ? 0.3 * (1 - ramp(t, 8.2, 8.8)) : 0,
      });
      hero.apply(t + 20);

      // ----- cámara -----
      const head = hero.headPos(v3(0, 0.11, 0.0));
      const hand = hero.handPos('L');
      let pos, tgt, fov = 36, focus, ap = 1.5;
      if (t < 2.2) {
        const k = ramp(t, -0.5, 2.2);
        pos = v3(lerp(1.2, 1.0, k), 1.35, lerp(2.0, 1.6, k)); tgt = v3(HX, lerp(1.25, 1.2, k), HZ); focus = pos.distanceTo(head);
      } else if (t < 3.4) {
        const k = ramp(t, 2.2, 3.4, smoother);
        pos = v3(lerp(1.0, HX + 0.25, k), lerp(1.35, 1.12, k), lerp(1.6, HZ + 0.6, k)); tgt = v3(HX, 1.2, HZ).lerp(hand, k); focus = pos.distanceTo(hand); ap = 2.5;
      } else {
        // travelling hacia atrás revelando el pasillo (y mismo ángulo al volver)
        const k = ramp(t, 3.4, 5.8, smoother);
        pos = v3(lerp(HX + 0.25, 0.45, k), lerp(1.12, 1.62, k), lerp(HZ + 0.6, 2.6, k));
        tgt = v3(HX, 1.05, HZ).lerp(v3(0, 1.2, -9), k);
        if (t > 5.8) { pos.z -= (t - 5.8) * 0.18; }
        if (t > 8.3) { // al final, dolly-in hacia el rostro (entrada a la mente)
          const d = ramp(t, 8.3, 9.9, k2 => k2 * k2);
          const fwd = v3(0, 0, 1).applyAxisAngle(v3(0, 1, 0), hero.pose.ry);
          pos.lerp(head.clone().add(fwd.multiplyScalar(0.26)), d); tgt.lerp(head, ramp(t, 8.3, 9.0));
        }
        focus = pos.distanceTo(head); ap = lerp(1.2, 0.5, k);
      }
      pos.add(v3(noise1(t * 0.8, 21) * 0.008, noise1(t * 0.8, 22) * 0.008, 0));
      aim(camera, pos, tgt, fov);
      if (back && t > 8.6) { hero.pose.ry = lerp(0, 0, 1); }
      return {
        focus, aperture: ap, maxBlur: 0.014,
        exposure: lerp(0.88, 0.9, morph), saturation: lerp(1.05, 0.8, morph), contrast: lerp(1.05, 1.15, morph),
        tint: [lerp(1, 0.85, morph) + flash * morph * 0.15, lerp(1, 1.0, morph), lerp(1, 1.08, morph)], bloom: 0.5, vignette: 0.35 + morph * 0.25, ca: 0.0015 + morph * 0.003,
      };
    },
  };
}
