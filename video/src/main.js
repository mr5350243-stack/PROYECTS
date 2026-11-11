// Motor de render: línea de tiempo de escenas, transiciones espaciales y posprocesado cinematográfico.
// Expone window.renderFrame(t) para el render determinista fotograma a fotograma.
import * as THREE from 'three';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { TIMELINE, TRANSITIONS } from './timeline.js';

const params = new URLSearchParams(location.search);
const SCALE = Number(params.get('scale') || 1);
const W = Math.round(1080 * SCALE), H = Math.round(1920 * SCALE);

const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
document.body.appendChild(renderer.domElement);

const pmrem = new THREE.PMREMGenerator(renderer);
const envTex = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

function makeRT(depth = false, samples = 0) {
  const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples });
  if (depth) { rt.depthTexture = new THREE.DepthTexture(W, H); rt.depthTexture.type = THREE.UnsignedIntType; }
  return rt;
}
const SAMPLES = Number(params.get('msaa') || 4);
const rtScene = makeRT(true, SAMPLES);
const rtA = makeRT(), rtB = makeRT(), rtTmp = makeRT();

// ---------- Profundidad de campo (bokeh por recolección en espiral) ----------
const dofMat = new THREE.ShaderMaterial({
  uniforms: {
    tColor: { value: null }, tDepth: { value: null }, near: { value: 0.1 }, far: { value: 100 },
    focus: { value: 3 }, aperture: { value: 0 }, maxBlur: { value: 0.012 }, aspect: { value: W / H },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `
    uniform sampler2D tColor, tDepth; uniform float near, far, focus, aperture, maxBlur, aspect; varying vec2 vUv;
    float lin(vec2 uv){ float d = texture2D(tDepth, uv).x; float z = d*2.-1.; return 2.*near*far/(far+near-z*(far-near)); }
    float coc(float z){ return clamp(aperture * abs(z - focus) / (z * focus) , 0., 1.) * maxBlur; }
    void main(){
      vec4 base = texture2D(tColor, vUv);
      base.rgb = clamp(base.rgb, 0., 40.); if (base.r != base.r || base.g != base.g || base.b != base.b) base.rgb = vec3(0.);
      float z0 = lin(vUv); float c0 = coc(z0);
      if (c0 < 0.0006) { gl_FragColor = base; return; }
      vec3 acc = base.rgb; float wsum = 1.;
      const float GA = 2.39996323;
      for (int i = 1; i < 32; i++) {
        float r = sqrt(float(i) / 32.);
        float a = float(i) * GA;
        vec2 off = vec2(cos(a), sin(a)) * r * c0; off.x /= aspect;
        vec2 uv = vUv + off;
        float zs = lin(uv); float cs = coc(zs);
        // las muestras más cercanas que el píxel sólo contribuyen si su propio desenfoque las alcanza
        float w = zs < z0 ? smoothstep(r*c0*0.6, r*c0, cs) : 1.;
        w = max(w, 0.02);
        vec3 sc = clamp(texture2D(tColor, uv).rgb, 0., 40.); if (sc.r != sc.r) sc = vec3(0.); acc += sc * w; wsum += w;
      }
      gl_FragColor = vec4(acc / wsum, 1.);
    }`,
  depthTest: false, depthWrite: false,
});
const dofQuad = new FullScreenQuad(dofMat);

// ---------- Etalonaje por escena (exposición, contraste, saturación, tinte) ----------
const gradeMat = new THREE.ShaderMaterial({
  uniforms: { tColor: { value: null }, exposure: { value: 1 }, contrast: { value: 1.05 }, saturation: { value: 1.05 }, tint: { value: new THREE.Color(1, 1, 1) }, lift: { value: new THREE.Color(0, 0, 0) }, ca: { value: 0.0015 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D tColor; uniform float exposure, contrast, saturation, ca; uniform vec3 tint, lift; varying vec2 vUv;
    void main(){
      vec2 d = (vUv-.5); float r2 = dot(d,d);
      vec3 c;
      c.r = texture2D(tColor, vUv + d*ca*r2*4.).r;
      c.g = texture2D(tColor, vUv).g;
      c.b = texture2D(tColor, vUv - d*ca*r2*4.).b;
      c *= exposure * tint;
      float l = dot(c, vec3(.2126,.7152,.0722));
      c = mix(vec3(l), c, saturation);
      c = max(vec3(0.), (c - 0.18) * contrast + 0.18);
      c += lift * (1. - clamp(l*2.,0.,1.));
      gl_FragColor = vec4(c,1.);
    }`,
  depthTest: false, depthWrite: false,
});
const gradeQuad = new FullScreenQuad(gradeMat);

const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.6, 0.55, 0.85);

// ---------- Composición final: transición + tonemapping ACES + viñeta + grano ----------
const finalMat = new THREE.ShaderMaterial({
  uniforms: {
    tA: { value: null }, tB: { value: null }, mixK: { value: 0 }, mode: { value: 0 }, time: { value: 0 },
    vignette: { value: 0.35 }, grain: { value: 0.035 }, fade: { value: 1 }, flashColor: { value: new THREE.Color(1, 1, 1) }, aspect: { value: W / H }, center: { value: new THREE.Vector2(0.5, 0.5) },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `
    uniform sampler2D tA, tB; uniform float mixK, mode, time, vignette, grain, fade, aspect; uniform vec3 flashColor; uniform vec2 center; varying vec2 vUv;
    vec3 aces(vec3 x){ const float a=2.51,b=.03,c=2.43,d=.59,e=.14; return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.,1.); }
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
    float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
    vec3 blurH(sampler2D t, vec2 uv, float amt){ vec3 s=vec3(0.); for(int i=-6;i<=6;i++){ s+=texture2D(t, uv+vec2(float(i)*amt/6.,0.)).rgb; } return s/13.; }
    void main(){
      vec3 a = texture2D(tA, vUv).rgb, c = a;
      float k = mixK;
      if (mode > 0.5) {
        vec3 b = texture2D(tB, vUv).rgb;
        if (mode < 1.5) { c = mix(a, b, smoothstep(0.,1.,k)); }                                  // 1 fundido
        else if (mode < 2.5) {                                                                     // 2 iris (círculo que se abre)
          vec2 d = (vUv - center); d.x *= aspect; float r = length(d);
          float edge = k * 1.25; c = mix(a, b, smoothstep(edge, edge - 0.04, r)); }
        else if (mode < 3.5) {                                                                     // 3 destello
          float f = 1. - abs(k*2.-1.); c = (k < .5 ? a : b) + flashColor * pow(f, 1.5) * 3.; }
        else if (mode < 4.5) {                                                                     // 4 whip pan (barrido con desenfoque de movimiento)
          float s = smoothstep(0.,1.,k); float amt = sin(s*3.14159)*0.18;
          vec3 ba = blurH(tA, vUv + vec2(s*0.9,0.), amt); vec3 bb = blurH(tB, vUv - vec2((1.-s)*0.9,0.), amt);
          c = mix(ba, bb, smoothstep(0.35,0.65,s)); }
        else if (mode < 5.5) {                                                                     // 5 disolución en partículas (ruido)
          float n = n2(vUv*vec2(5.,9.)) * .55 + n2(vUv*vec2(22.,39.)) * .3 + h(floor(vUv*vec2(270.,480.))) * .15;
          float th = k*1.35-0.2;
          float e = smoothstep(th-0.06, th+0.06, n); c = mix(b, a, e);
          float edge = smoothstep(.07,.0,abs(n-th)) * (1.-abs(k*2.-1.));
          float spark = step(.82, h(floor(vUv*vec2(270.,480.)) + floor(k*24.)));
          c += flashColor * edge * (1.2 + spark * 3.); }
        else { c = k < 0.5 ? a : b; }                                                              // 6 corte
      }
      c = aces(c);
      c = pow(c, vec3(1./2.2));
      vec2 v = vUv - .5; v.x *= aspect;
      c *= 1. - vignette * smoothstep(.25, .95, length(v)*1.25);
      c += (h(vUv*vec2(1920.,1080.) + fract(time*7.31)) - .5) * grain;
      gl_FragColor = vec4(c * fade, 1.);
    }`,
  depthTest: false, depthWrite: false,
});
const finalQuad = new FullScreenQuad(finalMat);

// ---------- Escenas ----------
const ctx = { THREE, renderer, envTex, W, H, aspect: W / H };
const loaded = new Map();
async function getScene(def) {
  if (!loaded.has(def.id)) {
    const mod = await import(`./scenes/${def.id}.js`);
    const s = mod.create(ctx);
    s.camera.aspect = W / H; s.camera.updateProjectionMatrix();
    if (s.scene.environment === undefined || s.scene.environment === null) s.scene.environment = envTex;
    loaded.set(def.id, s);
  }
  return loaded.get(def.id);
}

const defaultPost = { focus: 3, aperture: 0, maxBlur: 0.012, bloom: 0.5, bloomRadius: 0.5, bloomThreshold: 1.0, exposure: 1, contrast: 1.06, saturation: 1.05, tint: [1, 1, 1], lift: [0, 0, 0], vignette: 0.35, ca: 0.0015 };

function renderSceneTo(s, localT, target) {
  const post = { ...defaultPost, ...(s.update(localT, ctx) || {}) };
  if (params.has('nodof')) post.aperture = 0;
  if (params.has('nobloom')) post.bloom = 0;
  renderer.shadowMap.enabled = !params.has('noshadow');
  const cam = s.camera;
  renderer.setRenderTarget(rtScene);
  renderer.render(s.scene, cam);
  // DOF
  dofMat.uniforms.tColor.value = rtScene.texture;
  dofMat.uniforms.tDepth.value = rtScene.depthTexture;
  dofMat.uniforms.near.value = cam.near; dofMat.uniforms.far.value = cam.far;
  dofMat.uniforms.focus.value = post.focus; dofMat.uniforms.aperture.value = post.aperture; dofMat.uniforms.maxBlur.value = post.maxBlur;
  renderer.setRenderTarget(rtTmp); dofQuad.render(renderer);
  // bloom (se compone sobre rtTmp)
  bloom.strength = post.bloom; bloom.radius = post.bloomRadius; bloom.threshold = post.bloomThreshold;
  if (post.bloom > 0) bloom.render(renderer, null, rtTmp, 0, false);
  // etalonaje
  gradeMat.uniforms.tColor.value = rtTmp.texture;
  gradeMat.uniforms.exposure.value = post.exposure; gradeMat.uniforms.contrast.value = post.contrast; gradeMat.uniforms.saturation.value = post.saturation;
  gradeMat.uniforms.tint.value.setRGB(...post.tint); gradeMat.uniforms.lift.value.setRGB(...post.lift); gradeMat.uniforms.ca.value = post.ca;
  renderer.setRenderTarget(target); gradeQuad.render(renderer);
  return post;
}

const MODES = { fade: 1, iris: 2, flash: 3, whip: 4, dissolve: 5, cut: 6 };
const END = TIMELINE[TIMELINE.length - 1].end;

async function renderFrame(t) {
  if (params.get('scene')) {
    const s = await getScene({ id: params.get('scene') });
    const post = renderSceneTo(s, t, rtA);
    finalMat.uniforms.mode.value = 0; finalMat.uniforms.tA.value = rtA.texture; finalMat.uniforms.time.value = t; finalMat.uniforms.vignette.value = post.vignette; finalMat.uniforms.fade.value = 1;
    renderer.setRenderTarget(null); finalQuad.render(renderer); return;
  }
  // escena activa
  let idx = TIMELINE.findIndex(d => t >= d.start && t < d.end);
  if (idx < 0) idx = t < 0 ? 0 : TIMELINE.length - 1;
  const cur = TIMELINE[idx];
  // ¿estamos dentro de una transición?
  let tr = null, trK = 0, other = null;
  for (const x of TRANSITIONS) {
    const b = TIMELINE.find(d => d.id === x.to);
    const a0 = b.start - x.dur * (x.bias ?? 0.5), a1 = a0 + x.dur;
    if (t >= a0 && t < a1) { tr = x; trK = (t - a0) / x.dur; other = b; break; }
  }
  let post;
  if (tr) {
    const a = TIMELINE.find(d => d.id === tr.from);
    const sa = await getScene(a), sb = await getScene(other);
    post = renderSceneTo(sa, t - a.start, rtA);
    renderSceneTo(sb, t - other.start, rtB);
    finalMat.uniforms.mode.value = MODES[tr.type];
    finalMat.uniforms.mixK.value = trK;
    finalMat.uniforms.flashColor.value.setRGB(...(tr.color || [1, 1, 1]));
    finalMat.uniforms.center.value.set(...(tr.center || [0.5, 0.5]));
  } else {
    const s = await getScene(cur);
    post = renderSceneTo(s, t - cur.start, rtA);
    finalMat.uniforms.mode.value = 0;
  }
  finalMat.uniforms.tA.value = rtA.texture;
  finalMat.uniforms.tB.value = rtB.texture;
  finalMat.uniforms.time.value = t;
  finalMat.uniforms.vignette.value = post.vignette;
  // fundido de entrada y fundido final a negro
  finalMat.uniforms.fade.value = Math.min(1, Math.max(0, t / 0.6)) * Math.min(1, Math.max(0, (END - t) / 2.2));
  renderer.setRenderTarget(null);
  finalQuad.render(renderer);
}

window.renderFrame = renderFrame;
window.DURATION = END;
window.preload = async () => { for (const d of TIMELINE) await getScene(d); };
window.grab = (q = 0.95) => renderer.domElement.toDataURL('image/jpeg', q);
window.ready = true;

if (params.has('play')) {
  const t0 = performance.now(), off = Number(params.get('t') || 0);
  const loop = async () => { await renderFrame(off + (performance.now() - t0) / 1000); requestAnimationFrame(loop); };
  loop();
} else if (params.has('t')) {
  renderFrame(Number(params.get('t')));
}
