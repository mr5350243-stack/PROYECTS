// Utilidades compartidas: easing, keyframes, aleatorio con semilla, texturas procedurales y materiales.
import * as THREE from 'three';

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const inv = (a, b, x) => clamp((x - a) / (b - a));
export const smooth = k => { k = clamp(k); return k * k * (3 - 2 * k); };
export const smoother = k => { k = clamp(k); return k * k * k * (k * (k * 6 - 15) + 10); };
export const easeInOut = k => { k = clamp(k); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
export const easeOut = k => { k = clamp(k); return 1 - Math.pow(1 - k, 3); };
export const easeIn = k => { k = clamp(k); return k * k * k; };
export const easeOutBack = k => { k = clamp(k); const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
/** rampa suave entre a y b */
export const ramp = (t, a, b, fn = smoother) => fn(inv(a, b, t));
/** pulso: sube en [a,b], baja en [c,d] */
export const pulse = (t, a, b, c, d) => ramp(t, a, b) * (1 - ramp(t, c, d));

export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** ruido 1D suave y determinista (para micro-movimientos de cámara y cuerpo) */
export function noise1(x, seed = 0) {
  const h = n => { const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453; return s - Math.floor(s); };
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(h(i), h(i + 1), u) * 2 - 1;
}
export const shake = (t, amp = 1, freq = 0.6, seed = 0) => new THREE.Vector3(
  noise1(t * freq, seed + 1) * amp, noise1(t * freq, seed + 2) * amp, noise1(t * freq, seed + 3) * amp * 0.5);

/**
 * Pista de keyframes: [[t, valor], ...] con easing por segmento (smoother por defecto).
 * valor: número, array, o THREE.Vector3.
 */
export function track(keys, ease = easeInOut) {
  return t => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, v0] = keys[i], [t1, v1, e] = keys[i + 1];
      if (t <= t1) {
        const k = (e || ease)((t - t0) / (t1 - t0));
        if (typeof v0 === 'number') return lerp(v0, v1, k);
        if (v0.isVector3) return v0.clone().lerp(v1, k);
        return v0.map((x, j) => lerp(x, v1[j], k));
      }
    }
    return keys[keys.length - 1][1];
  };
}
export const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

/** Coloca la cámara en pos mirando a target, con roll opcional y fov */
export function aim(cam, pos, target, fov, roll = 0) {
  cam.position.copy(pos);
  cam.up.set(Math.sin(roll), Math.cos(roll), 0);
  cam.lookAt(target);
  if (fov && cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
}

// ---------- Texturas procedurales (canvas) ----------
const texCache = new Map();
function canvasTex(key, w, h, draw, opts = {}) {
  if (texCache.has(key)) return texCache.get(key);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  if (opts.color !== false) t.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, t);
  return t;
}

export function woodTex() {
  return canvasTex('wood', 1024, 1024, (g, w, h) => {
    const r = rng(7);
    const planks = 8;
    for (let i = 0; i < planks; i++) {
      const base = 0.85 + r() * 0.3;
      const y0 = (i / planks) * h, ph = h / planks;
      g.fillStyle = `rgb(${150 * base | 0},${100 * base | 0},${66 * base | 0})`;
      g.fillRect(0, y0, w, ph);
      for (let k = 0; k < 70; k++) {
        g.strokeStyle = `rgba(${70 + r() * 40 | 0},${40 + r() * 20 | 0},${20},${0.08 + r() * 0.12})`;
        g.lineWidth = 1 + r() * 2;
        g.beginPath();
        const yy = y0 + r() * ph;
        g.moveTo(0, yy);
        for (let x = 0; x <= w; x += 64) g.lineTo(x, yy + Math.sin(x * 0.01 + k) * 3 * r());
        g.stroke();
      }
      g.fillStyle = 'rgba(40,24,12,0.55)';
      g.fillRect(0, y0, w, 3);
      const off = r() * w;
      g.fillRect(off, y0, 3, ph);
    }
  });
}

export function noiseTex(key = 'noise', base = '#888', amp = 30, size = 512, seed = 3) {
  return canvasTex('n_' + key, size, size, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    const r = rng(seed);
    const img = g.getImageData(0, 0, w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (r() - 0.5) * amp;
      img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
    }
    g.putImageData(img, 0, 0);
  });
}

export function fabricTex(key, color) {
  return canvasTex('fab_' + key, 256, 256, (g, w, h) => {
    g.fillStyle = color; g.fillRect(0, 0, w, h);
    const r = rng(11);
    for (let y = 0; y < h; y += 2) { g.fillStyle = `rgba(0,0,0,${0.03 + r() * 0.04})`; g.fillRect(0, y, w, 1); }
    for (let x = 0; x < w; x += 2) { g.fillStyle = `rgba(255,255,255,${0.02 + r() * 0.03})`; g.fillRect(x, 0, 1, h); }
  });
}

export function gradientTex(key, stops, w = 16, h = 512) {
  return canvasTex('grad_' + key, w, h, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    stops.forEach(([o, c]) => gr.addColorStop(o, c));
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
}

/** Textura radial suave para sprites de brillo/partículas */
export function glowTex() {
  return canvasTex('glow', 128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.25, 'rgba(255,255,255,0.6)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
}

// ---------- Materiales ----------
export const M = {
  std: (color, rough = 0.7, metal = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra }),
  phys: (color, extra = {}) => new THREE.MeshPhysicalMaterial({ color, ...extra }),
  emit: (color, intensity = 2, extra = {}) => new THREE.MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: intensity, roughness: 1, ...extra }),
  basic: (color, extra = {}) => new THREE.MeshBasicMaterial({ color, ...extra }),
};

export function box(w, h, d, mat, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.castShadow = m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}
/** caja con bordes redondeados (aspecto más "película animada") */
export function rbox(w, h, d, r, mat, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(roundedBoxGeo(w, h, d, r), mat);
  m.position.set(x, y, z); m.castShadow = m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}
const rbCache = new Map();
export function roundedBoxGeo(w, h, d, r, seg = 4) {
  const key = [w, h, d, r, seg].join(',');
  if (rbCache.has(key)) return rbCache.get(key);
  r = Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4);
  const g = new THREE.BoxGeometry(w, h, d, seg * 2, seg * 2, seg * 2);
  const p = g.attributes.position, v = new THREE.Vector3(), inner = new THREE.Vector3();
  const hw = w / 2 - r, hh = h / 2 - r, hd = d / 2 - r;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    inner.set(clamp(v.x, -hw, hw), clamp(v.y, -hh, hh), clamp(v.z, -hd, hd));
    v.sub(inner).normalize().multiplyScalar(r).add(inner);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  rbCache.set(key, g);
  return g;
}

export function shadowAll(obj, cast = true, receive = true) {
  obj.traverse(o => { if (o.isMesh) { o.castShadow = cast; o.receiveShadow = receive; } });
  return obj;
}

/** Luz direccional con sombras suaves configuradas */
export function keyLight(color, intensity, pos, target = v3(0, 0, 0), size = 6, mapSize = 2048) {
  const l = new THREE.DirectionalLight(color, intensity);
  l.position.copy(pos);
  l.target.position.copy(target);
  l.castShadow = true;
  l.shadow.mapSize.set(mapSize, mapSize);
  const c = l.shadow.camera; c.left = -size; c.right = size; c.top = size; c.bottom = -size; c.near = 0.1; c.far = 40;
  l.shadow.bias = -0.0004; l.shadow.normalBias = 0.02; l.shadow.radius = 4;
  return l;
}

/** Fondo de cielo / espacio surrealista con degradado vertical (esfera invertida) */
export function skyDome(top, mid, bottom, radius = 60) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(top) }, mid: { value: new THREE.Color(mid) }, bottom: { value: new THREE.Color(bottom) }, time: { value: 0 }, swirl: { value: 0 } },
    vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform vec3 top,mid,bottom; uniform float time,swirl; varying vec3 vP;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
      void main(){ float y=vP.y; vec3 c = y>0. ? mix(mid,top,smoothstep(0.,.7,y)) : mix(mid,bottom,smoothstep(0.,-.5,y));
        float a=atan(vP.z,vP.x); float s = n(vec2(a*3.+time*.05, y*4.-time*.03))*n(vec2(a*7.-time*.04,y*9.));
        c += swirl*s*0.35*mid;
        gl_FragColor=vec4(c,1.); }`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 24), mat);
  m.renderOrder = -10;
  return m;
}

/** Campo de motas de polvo / partículas flotando (determinista según el tiempo) */
export function dustField(count, box3, color = 0xffffff, size = 0.02, seed = 5, opacity = 0.6) {
  const r = rng(seed);
  const base = new Float32Array(count * 3), phase = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    base[i * 3] = lerp(box3.min.x, box3.max.x, r());
    base[i * 3 + 1] = lerp(box3.min.y, box3.max.y, r());
    base[i * 3 + 2] = lerp(box3.min.z, box3.max.z, r());
    phase[i] = r() * 100;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(base.slice(), 3));
  const mat = new THREE.PointsMaterial({ color, size, map: glowTex(), transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  const pts = new THREE.Points(g, mat);
  pts.frustumCulled = false;
  pts.userData.update = (t) => {
    const p = g.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const ph = phase[i];
      p[i * 3] = base[i * 3] + Math.sin(t * 0.13 + ph) * 0.15;
      p[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 0.09 + ph * 1.3) * 0.12 + ((t * 0.02 + ph) % 1) * 0.05;
      p[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.11 + ph) * 0.15;
    }
    g.attributes.position.needsUpdate = true;
  };
  return pts;
}
