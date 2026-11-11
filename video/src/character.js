// Personaje estilizado con rig jerárquico, manos articuladas y rostro expresivo.
// Protagonista: cabello oscuro corto, camiseta azul, pantalón oscuro. Se reutiliza con otras opciones para el amigo.
import * as THREE from 'three';
import { clamp, lerp, noise1, roundedBoxGeo, fabricTex } from './lib.js';

const D = THREE.MathUtils.degToRad;

const DEFAULTS = {
  skin: 0xe2a882,
  shirt: 0x2f6fd8,
  pants: 0x252a35,
  shoes: 0xf1f1f1,
  sole: 0x3a3a3a,
  hair: 0x120d0a,
  iris: 0x4a2f1c,
  hairStyle: 'short',
  seed: 1,
};

function cap(r, len, mat, seg = 12) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, seg), mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}
function sph(r, mat, ws = 24, hs = 18) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** Torso de camiseta por revolución (más orgánico que una cápsula) */
function torsoGeo() {
  const pts = [
    [0.001, -0.02], [0.125, -0.015], [0.135, 0.04], [0.13, 0.12], [0.14, 0.22], [0.158, 0.31], [0.165, 0.37], [0.155, 0.42], [0.12, 0.455], [0.06, 0.47], [0.001, 0.472],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.LatheGeometry(pts, 32);
  g.scale(1.18, 1, 0.68);
  g.computeVertexNormals();
  return g;
}

export class Character {
  constructor(opts = {}) {
    this.o = { ...DEFAULTS, ...opts };
    const o = this.o;
    this.root = new THREE.Group();
    this.root.name = 'character';

    const skin = new THREE.MeshPhysicalMaterial({ color: o.skin, roughness: 0.62, sheen: 0.15, sheenColor: new THREE.Color(0xff9f80), sheenRoughness: 0.7 });
    const shirt = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: fabricTex('shirt' + o.shirt, '#' + new THREE.Color(o.shirt).getHexString()), roughness: 0.85, sheen: 0.6, sheenColor: new THREE.Color(o.shirt).multiplyScalar(1.3), sheenRoughness: 0.8 });
    const pants = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: fabricTex('pants' + o.pants, '#' + new THREE.Color(o.pants).getHexString()), roughness: 0.9, sheen: 0.3, sheenColor: new THREE.Color(0x667089) });
    const shoes = new THREE.MeshStandardMaterial({ color: o.shoes, roughness: 0.6 });
    const sole = new THREE.MeshStandardMaterial({ color: o.sole, roughness: 0.8 });
    const hair = new THREE.MeshPhysicalMaterial({ color: o.hair, roughness: 0.5, sheen: 0.6, sheenColor: new THREE.Color(0x5a4a40), sheenRoughness: 0.35 });
    this.mats = { skin, shirt, pants, shoes, sole, hair };

    // ---- cadera / columna ----
    this.hips = new THREE.Group(); this.hips.position.y = 0.95; this.root.add(this.hips);
    const pelvis = cap(0.13, 0.08, pants); pelvis.rotation.z = Math.PI / 2; pelvis.scale.set(1, 1, 0.72); pelvis.position.y = 0.0;
    this.hips.add(pelvis);
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.152, 0.152, 0.03, 32), new THREE.MeshStandardMaterial({ color: 0x1a1a1f, roughness: 0.5 }));
    belt.scale.z = 0.68; belt.position.y = 0.06; this.hips.add(belt);

    this.spine = new THREE.Group(); this.spine.position.y = 0.04; this.hips.add(this.spine);
    this.chest = new THREE.Group(); this.spine.add(this.chest);
    const torso = new THREE.Mesh(torsoGeo(), shirt); torso.castShadow = torso.receiveShadow = true;
    this.torso = torso; this.chest.add(torso);
    // cuello de la camiseta
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.012, 8, 24), shirt);
    collar.rotation.x = Math.PI / 2; collar.position.y = 0.462; collar.scale.y = 0.85; this.chest.add(collar);

    // ---- cuello y cabeza ----
    this.neck = new THREE.Group(); this.neck.position.y = 0.45; this.chest.add(this.neck);
    const neckM = cap(0.04, 0.05, skin); neckM.position.y = 0.035; this.neck.add(neckM);
    this.head = new THREE.Group(); this.head.position.y = 0.032; this.neck.add(this.head);
    this._buildHead(skin, hair);

    // ---- brazos ----
    this.arm = {};
    for (const side of ['L', 'R']) {
      const s = side === 'L' ? 1 : -1;
      const shoulder = new THREE.Group(); shoulder.position.set(0.175 * s, 0.39, 0); this.chest.add(shoulder);
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.056, 0.16, 20), shirt);
      sleeve.position.y = -0.06; sleeve.castShadow = true; shoulder.add(sleeve);
      const sleeveTop = sph(0.061, shirt); sleeveTop.position.y = 0.0; sleeveTop.scale.set(1, 0.85, 0.95); shoulder.add(sleeveTop);
      const upper = cap(0.045, 0.22, skin); upper.position.y = -0.145; shoulder.add(upper);
      const elbow = new THREE.Group(); elbow.position.y = -0.285; shoulder.add(elbow);
      const fore = cap(0.04, 0.2, skin); fore.position.y = -0.12; elbow.add(fore);
      const wrist = new THREE.Group(); wrist.position.y = -0.255; elbow.add(wrist);
      const hand = this._buildHand(skin, s); hand.group.rotation.y = -s * Math.PI / 2; wrist.add(hand.group);
      this.arm[side] = { shoulder, elbow, wrist, hand };
    }

    // ---- piernas ----
    this.leg = {};
    for (const side of ['L', 'R']) {
      const s = side === 'L' ? 1 : -1;
      const hip = new THREE.Group(); hip.position.set(0.085 * s, -0.03, 0); this.hips.add(hip);
      const thigh = cap(0.075, 0.33, pants); thigh.position.y = -0.21; hip.add(thigh);
      const knee = new THREE.Group(); knee.position.y = -0.44; hip.add(knee);
      const kneeCap = sph(0.068, pants); knee.add(kneeCap);
      const shin = cap(0.06, 0.33, pants); shin.position.y = -0.2; knee.add(shin);
      const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.068, 0.05, 16), pants); cuff.position.y = -0.37; knee.add(cuff);
      const ankle = new THREE.Group(); ankle.position.y = -0.42; knee.add(ankle);
      const shoe = new THREE.Mesh(roundedBoxGeo(0.105, 0.085, 0.27, 0.04), shoes); shoe.position.set(0, -0.045, 0.055); shoe.castShadow = shoe.receiveShadow = true; ankle.add(shoe);
      const soleM = new THREE.Mesh(roundedBoxGeo(0.11, 0.025, 0.275, 0.012), sole); soleM.position.set(0, -0.085, 0.055); ankle.add(soleM);
      const lace = new THREE.Mesh(roundedBoxGeo(0.06, 0.012, 0.09, 0.005), new THREE.MeshStandardMaterial({ color: 0xcfd6e6, roughness: 0.7 })); lace.position.set(0, 0.0, 0.08); lace.rotation.x = -0.35; ankle.add(lace);
      this.leg[side] = { hip, knee, ankle };
    }

    this.root.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    this.pose = Character.basePose();
    this.expr = { smile: 0.3, worry: 0, eyeOpen: 1, mouthOpen: 0, gazeX: 0, gazeY: 0, blink: true, squint: 0 };
    this._mouthKey = '';
    this.apply(0);
  }

  _buildHead(skin, hairMat) {
    const h = this.head, o = this.o;
    // cabeza esculpida: esfera deformada (mandíbula, mentón, pómulos, cuencas)
    const R = 0.115;
    const hg = new THREE.SphereGeometry(R, 72, 54);
    const p = hg.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).divideScalar(R);
      let { x, y, z } = v;
      let sx = 0.93, sy = 1.1, sz = 1.0;
      if (y < 0) { const k = Math.pow(-y, 1.3); sx *= 1 - 0.3 * k; sz *= 1 - 0.12 * k; }
      if (z > 0 && y < -0.3) z += 0.12 * (1 - Math.abs(x) * 2) * Math.max(0, -y - 0.3) * (z > 0.5 ? 1 : z * 2);
      // pómulos suaves
      const ck = Math.exp(-(((Math.abs(x) - 0.55) ** 2) + ((y + 0.15) ** 2) + ((z - 0.75) ** 2)) / 0.04);
      const r2 = 1 + ck * 0.04;
      // cuencas oculares ligeramente hundidas
      const ek = Math.exp(-(((Math.abs(x) - 0.37) ** 2) + ((y - 0.12) ** 2) * 1.5 + ((z - 0.85) ** 2)) / 0.02);
      const r3 = 1 - ek * 0.05;
      p.setXYZ(i, x * sx * R * r2 * r3, y * sy * R * r2 * r3, z * sz * R * r2 * r3);
    }
    hg.computeVertexNormals();
    const skull = new THREE.Mesh(hg, skin); skull.position.y = 0.11; skull.castShadow = skull.receiveShadow = true; h.add(skull);
    for (const s of [1, -1]) {
      const ear = sph(0.026, skin); ear.scale.set(0.42, 1, 0.72); ear.position.set(0.104 * s, 0.1, -0.008); ear.rotation.y = 0.3 * s; h.add(ear);
    }
    const nose = sph(0.0135, skin); nose.scale.set(1.05, 0.9, 1.1); nose.position.set(0, 0.093, 0.116); h.add(nose);
    const noseBridge = cap(0.0095, 0.03, skin); noseBridge.position.set(0, 0.11, 0.111); noseBridge.rotation.x = 0.32; h.add(noseBridge);

    // ojos
    const white = new THREE.MeshPhysicalMaterial({ color: 0xf6f3ef, roughness: 0.12, clearcoat: 1 });
    const irisM = new THREE.MeshPhysicalMaterial({ color: o.iris, roughness: 0.25, clearcoat: 1 });
    const pupilM = new THREE.MeshStandardMaterial({ color: 0x030303, roughness: 0.1 });
    const browM = new THREE.MeshStandardMaterial({ color: o.hair, roughness: 0.8 });
    this.eyes = []; this.lids = []; this.brows = []; this.lowerLids = [];
    for (const s of [1, -1]) {
      const socket = new THREE.Group(); socket.position.set(0.041 * s, 0.124, 0.086); h.add(socket);
      const eye = new THREE.Group(); socket.add(eye);
      const ball = sph(0.024, white, 32, 24); eye.add(ball);
      const iris = sph(0.0135, irisM, 24, 16); iris.scale.set(1, 1, 0.42); iris.position.z = 0.0196; eye.add(iris);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.0128, 0.0012, 6, 24), pupilM); ring.position.z = 0.0204; eye.add(ring);
      const pupil = sph(0.0068, pupilM, 16, 12); pupil.scale.set(1, 1, 0.4); pupil.position.z = 0.0243; eye.add(pupil);
      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.0028, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      hl.position.set(0.0045, 0.005, 0.0262); eye.add(hl);
      // párpado superior (casquete que rota) con pestañas en el borde
      const lid = new THREE.Mesh(new THREE.SphereGeometry(0.0262, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), skin);
      lid.castShadow = false; socket.add(lid);
      const lash = new THREE.Mesh(new THREE.TorusGeometry(0.0262, 0.0022, 6, 24, Math.PI), browM);
      lash.rotation.x = Math.PI / 2; lid.add(lash);
      const lower = new THREE.Mesh(new THREE.SphereGeometry(0.0256, 24, 10, 0, Math.PI * 2, Math.PI * 0.7, Math.PI * 0.3), skin);
      lower.rotation.x = -0.3; socket.add(lower);
      const brow = new THREE.Group(); brow.position.set(0.044 * s, 0.157, 0.1); h.add(brow);
      const browMesh = cap(0.0068, 0.036, browM); browMesh.rotation.z = Math.PI / 2; browMesh.scale.set(1, 1, 0.55); brow.add(browMesh);
      this.eyes.push({ eye, s }); this.lids.push(lid); this.brows.push({ brow, s }); this.lowerLids.push(lower);
    }

    // boca (tubo regenerado según expresión)
    this.mouthMat = new THREE.MeshStandardMaterial({ color: 0x7a302b, roughness: 0.5 });
    this.mouth = new THREE.Mesh(new THREE.BufferGeometry(), this.mouthMat);
    h.add(this.mouth);
    this.mouthInner = new THREE.Mesh(new THREE.SphereGeometry(0.018, 16, 12), new THREE.MeshStandardMaterial({ color: 0x3a1210, roughness: 0.6 }));
    this.mouthInner.position.set(0, 0.05, 0.1); this.mouthInner.scale.set(1.2, 0.0, 0.35); h.add(this.mouthInner);

    // cabello: una sola pieza esculpida con línea de nacimiento y mechones
    const HR = 0.124;
    const front = this.o.hairStyle === 'short' ? 0.66 : 0.56;
    const hair = new THREE.Mesh(this._hairGeo(HR, front, this.o.hairStyle), hairMat);
    hair.position.y = 0.11; hair.castShadow = true; h.add(hair);
    this.hair = hair;
  }

  _hairGeo(HR, frontLine, style) {
    const g = new THREE.SphereGeometry(HR, 128, 80);
    const p = g.attributes.position, v = new THREE.Vector3();
    const R = 0.115;
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).divideScalar(HR);
      const phi = Math.atan2(v.x, v.z);           // 0 = frente
      const back = (1 - Math.cos(phi)) / 2;       // 0 frente … 1 nuca
      let line = lerp(frontLine, -0.62, Math.pow(back, 0.8));
      // patillas sobre las orejas y flequillo ondulado
      const side = Math.exp(-((Math.abs(phi) - 1.45) ** 2) / 0.05);
      line += side * 0.18;
      line += Math.sin(phi * 11) * 0.035 * (1 - back);
      const inside = clamp((v.y - line) / 0.08, 0, 1);
      // volumen: más arriba, mechones con textura
      const tuft = style === 'short'
        ? 0.035 * Math.sin(phi * 13 + v.y * 9) * Math.sin(v.y * 7 + phi * 3) + 0.05 * Math.max(0, v.y)
        : 0.04 * Math.sin(phi * 9 + v.y * 6) + 0.16 * Math.max(0, v.y - 0.3);
      const outer = 1 + tuft;
      // radio "dentro de la cabeza" cuando no hay pelo
      const r = lerp(0.86, outer, inside);
      let { x, y, z } = v;
      const sx = 0.95 * (y < 0 ? 1 - 0.3 * Math.pow(-y, 1.3) : 1), sy = 1.1, sz = 1.04;
      // flequillo que cae ligeramente sobre la frente
      const fringe = inside * Math.max(0, Math.cos(phi)) * Math.exp(-((v.y - frontLine - 0.05) ** 2) / 0.01) * 0.06;
      p.setXYZ(i, x * sx * HR * r, (y * sy * r - fringe) * HR, z * sz * HR * r + fringe * HR * 0.4);
    }
    g.computeVertexNormals();
    return g;
  }

  _buildHand(skin, s) {
    const group = new THREE.Group();
    const palm = new THREE.Mesh(roundedBoxGeo(0.075, 0.085, 0.032, 0.014), skin);
    palm.position.y = -0.045; palm.castShadow = true; group.add(palm);
    const fingers = [];
    for (let i = 0; i < 4; i++) {
      const base = new THREE.Group(); base.position.set((-0.027 + i * 0.018) * s, -0.088, 0); group.add(base);
      const len = [0.03, 0.034, 0.032, 0.026][i];
      const p1 = cap(0.0085, len, skin, 8); p1.position.y = -len / 2 - 0.004; base.add(p1);
      const j2 = new THREE.Group(); j2.position.y = -len - 0.006; base.add(j2);
      const p2 = cap(0.008, len * 0.75, skin, 8); p2.position.y = -len * 0.4; j2.add(p2);
      fingers.push({ base, j2 });
    }
    const thumb = new THREE.Group(); thumb.position.set(0.034 * s, -0.035, 0.008); group.add(thumb);
    const t1 = cap(0.01, 0.03, skin, 8); t1.position.y = -0.02; thumb.add(t1);
    const tj = new THREE.Group(); tj.position.y = -0.04; thumb.add(tj);
    const t2 = cap(0.009, 0.022, skin, 8); t2.position.y = -0.014; tj.add(t2);
    thumb.rotation.z = 0.6 * s;
    return { group, fingers, thumb, tj, s };
  }

  static basePose() {
    return {
      x: 0, y: 0, z: 0, ry: 0,         // posición/rotación de la raíz
      hipsY: 0.95, hipsX: 0, hipsZ: 0, hipsRX: 0, hipsRZ: 0,
      spineX: 0.02, spineY: 0, spineZ: 0, chestX: 0,
      neckX: 0, neckY: 0, neckZ: 0, headX: 0, headY: 0, headZ: 0,
      // brazos: flex (adelante +), abd (afuera +), twist, codo, muñeca, dedos
      lFlex: 0.05, lAbd: 0.12, lTw: 0, lElb: 0.15, lWr: 0, lWrZ: 0, lCurl: 0.3,
      rFlex: 0.05, rAbd: 0.12, rTw: 0, rElb: 0.15, rWr: 0, rWrZ: 0, rCurl: 0.3,
      // piernas: flex cadera (adelante +), abd, rodilla, tobillo
      lHip: 0, lHipAbd: 0.02, lKnee: 0.02, lAnk: 0,
      rHip: 0, rHipAbd: 0.02, rKnee: 0.02, rAnk: 0,
      breath: 0.25, breathRate: 0.25,
    };
  }

  /** mezcla de poses */
  static mix(a, b, k) {
    const out = {};
    for (const key in a) out[key] = (key in b) ? lerp(a[key], b[key], k) : a[key];
    for (const key in b) if (!(key in out)) out[key] = b[key];
    return out;
  }

  setPose(p) { this.pose = { ...Character.basePose(), ...p }; return this; }
  setExpr(e) { Object.assign(this.expr, e); return this; }

  /** Aplica pose + expresión al rig. t = tiempo global (para respiración, parpadeo, micro-movimientos) */
  apply(t) {
    const p = this.pose, e = this.expr;
    this.root.position.set(p.x, p.y, p.z);
    this.root.rotation.y = p.ry;
    this.hips.position.set(p.hipsX, p.hipsY, p.hipsZ);
    this.hips.rotation.set(p.hipsRX, 0, p.hipsRZ);
    const br = Math.sin(t * Math.PI * 2 * p.breathRate);
    this.spine.rotation.set(p.spineX + br * 0.012 * p.breath, p.spineY, p.spineZ);
    this.chest.rotation.x = p.chestX;
    this.torso.scale.set(1 + br * 0.018 * p.breath, 1 + br * 0.01 * p.breath, 1 + br * 0.03 * p.breath);
    const sway = noise1(t * 0.4, this.o.seed) * 0.015;
    this.neck.rotation.set(p.neckX, p.neckY, p.neckZ);
    this.head.rotation.set(p.headX + sway * 0.6, p.headY + sway, p.headZ);

    for (const side of ['L', 'R']) {
      const s = side === 'L' ? 1 : -1, k = side === 'L' ? 'l' : 'r';
      const a = this.arm[side];
      a.shoulder.rotation.set(-p[k + 'Flex'], p[k + 'Tw'] * s, p[k + 'Abd'] * s + br * 0.01 * p.breath * s, 'XZY');
      a.elbow.rotation.set(-p[k + 'Elb'], 0, 0);
      a.wrist.rotation.set(p[k + 'Wr'], -(p[k + 'WrY'] || 0) * s, p[k + 'WrZ'] * s);
      const c = p[k + 'Curl'];
      a.hand.fingers.forEach((f, i) => { f.base.rotation.x = -c * (1.1 + i * 0.05); f.j2.rotation.x = -c * 1.3; });
      a.hand.tj.rotation.x = -c * 0.6;
      const l = this.leg[side];
      l.hip.rotation.set(-p[k + 'Hip'], 0, p[k + 'HipAbd'] * s);
      l.knee.rotation.x = p[k + 'Knee'];
      l.ankle.rotation.x = p[k + 'Ank'] - p[k + 'Knee'] * 0 ;
    }

    // ---- rostro ----
    const blinkK = e.blink ? this._blink(t) : 0;
    const open = clamp(e.eyeOpen * (1 - blinkK) - e.squint * 0.3, 0, 1.25);
    this.lids.forEach((lid, i) => {
      // rotación del casquete: abierto => hacia arriba/atrás, cerrado => cubre el ojo
      lid.rotation.x = open <= 1 ? lerp(0.42, -0.72, open) : lerp(-0.72, -1.15, (open - 1) / 0.25);
    });
    this.lowerLids.forEach(l => { l.rotation.x = -0.3 - e.squint * 0.35; });
    const dx = e.gazeX, dy = e.gazeY;
    this.eyes.forEach(({ eye }) => { eye.rotation.set(-dy * 0.45, dx * 0.55, 0); });
    this.brows.forEach(({ brow, s }) => {
      brow.position.y = 0.157 + e.worry * 0.007 + (1 - e.eyeOpen) * -0.006 + e.smile * 0.002;
      brow.rotation.z = (e.worry * 0.38) * s - (e.anger || 0) * 0.35 * s;
      brow.rotation.x = -0.25;
    });
    this._updateMouth(e.smile - e.worry * 0.45, e.mouthOpen);
  }

  _blink(t) {
    // parpadeos deterministas cada 2.5–4.5 s
    const period = 3.4 + (this.o.seed % 3) * 0.4;
    const ph = ((t + this.o.seed * 1.37) % period) / period;
    const d = Math.abs(ph - 0.5) * period; // segundos desde el centro del parpadeo
    return clamp(1 - d / 0.075);
  }

  _updateMouth(smile, open) {
    const key = Math.round(smile * 40) + '_' + Math.round(open * 30);
    if (key === this._mouthKey) return;
    this._mouthKey = key;
    const w = 0.033 + Math.max(0, smile) * 0.006;
    const cy = 0.05;
    const corner = smile * 0.012;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-w, cy + corner, 0.093),
      new THREE.Vector3(-w * 0.5, cy - smile * 0.004 - open * 0.004, 0.104),
      new THREE.Vector3(0, cy - smile * 0.006 - open * 0.006, 0.107),
      new THREE.Vector3(w * 0.5, cy - smile * 0.004 - open * 0.004, 0.104),
      new THREE.Vector3(w, cy + corner, 0.093),
    ]);
    this.mouth.geometry.dispose();
    this.mouth.geometry = new THREE.TubeGeometry(curve, 20, 0.0034, 6, false);
    this.mouthInner.scale.set(1.1 + smile * 0.2, open * 0.9, 0.35);
    this.mouthInner.position.y = cy - smile * 0.006 - open * 0.012; this.mouthInner.position.z = 0.101;
  }

  /** posición mundial de un hueso (para encuadres de cámara) */
  world(obj, offset = new THREE.Vector3()) {
    this.root.updateMatrixWorld(true);
    return obj.localToWorld(offset.clone());
  }
  headPos(off = new THREE.Vector3(0, 0.12, 0.05)) { return this.world(this.head, off); }
  eyePos(i = 0) { return this.world(this.eyes[i].eye, new THREE.Vector3(0, 0, 0.026)); }
  handPos(side = 'R') { return this.world(this.arm[side].wrist, new THREE.Vector3(0, -0.06, 0)); }
  chestPos() { return this.world(this.chest, new THREE.Vector3(0, 0.3, 0.06)); }
}

// ---------- Poses de referencia ----------
export const POSES = {
  stand: {},
  sit: { hipsY: 0.53, spineX: -0.08, lHip: 1.45, rHip: 1.45, lKnee: 1.45, rKnee: 1.45, lHipAbd: 0.08, rHipAbd: 0.08, lAnk: 0.05, rAnk: 0.05 },
  // sentado con teléfono en la mano derecha a la altura del pecho
  sitPhone: { hipsY: 0.53, spineX: 0.1, neckX: 0.18, headX: 0.22, lHip: 1.45, rHip: 1.45, lKnee: 1.4, rKnee: 1.4, lHipAbd: 0.08, rHipAbd: 0.08,
    rFlex: 0.5, rAbd: 0.1, rElb: 1.85, rTw: -0.3, rWr: 0.25, rWrY: -1.6, rWrZ: 0.1, rCurl: 0.22, lFlex: 0.32, lAbd: 0.18, lElb: 1.0, lTw: 0.2, lCurl: 0.35 },
};

/** Ciclo de caminata procedimental. phase en ciclos (1 = un paso doble) */
export function walkPose(phase, amt = 1) {
  const a = phase * Math.PI * 2;
  const s = Math.sin(a), c = Math.cos(a);
  return {
    hipsY: 0.95 - Math.abs(Math.cos(a)) * 0.0 + Math.cos(a * 2) * 0.018 * amt - 0.01 * amt,
    hipsRZ: s * 0.03 * amt,
    spineY: -s * 0.08 * amt, spineX: 0.06 * amt,
    lHip: s * 0.42 * amt, rHip: -s * 0.42 * amt,
    lKnee: (0.15 + Math.max(0, -Math.sin(a + 0.6)) * 0.85) * amt, rKnee: (0.15 + Math.max(0, Math.sin(a + 0.6)) * 0.85) * amt,
    lAnk: Math.max(0, s) * -0.15 * amt, rAnk: Math.max(0, -s) * -0.15 * amt,
    lFlex: -s * 0.35 * amt + 0.05, rFlex: s * 0.35 * amt + 0.05,
    lElb: 0.3 + Math.max(0, -s) * 0.3 * amt, rElb: 0.3 + Math.max(0, s) * 0.3 * amt,
    lAbd: 0.1, rAbd: 0.1,
    headY: s * 0.03 * amt,
  };
}
