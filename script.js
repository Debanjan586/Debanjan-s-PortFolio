// ─────────────────────────────────────────────────────────────
// script.js — hero animations + WebGL wave
// Defines window.revealHero() which loader.js calls when done.
// Nav / hamburger / mobile-nav is handled by nav-scroll.js.
// ─────────────────────────────────────────────────────────────

let hero       = document.querySelector(".hero");
let eyebrow    = document.querySelector(".eyebrow");
let h1         = document.querySelector("#main-text");
let skills     = document.querySelector(".skills");
let buttons    = document.querySelector("#buttons");
let devPhoto   = document.querySelector(".dev-photo");
let sectionTag = document.querySelector(".section-tag");

// ── Initial states ────────────────────────────────────────────
gsap.set(eyebrow,    { opacity: 0, y: 20 });
gsap.set(buttons,    { opacity: 0, y: 20 });
gsap.set(h1,         { opacity: 0, y: 40 });
gsap.set(skills,     { opacity: 0, x: 200 });
gsap.set(devPhoto,   { opacity: 0 });
gsap.set(sectionTag, { opacity: 0, y: 20 });

// ══════════════════════════════════════════════════════════════
//  WebGL AMBIENT WAVE — optimized
// ══════════════════════════════════════════════════════════════
(function initWaveGradient() {
  const CONFIG = {
    colors: [
      "#000001", "#000308", "#000000", "#000000",
      "#010306", "#000000", "#030c16", "#030406",
    ],
    speed : 0.5,
    freq  : 3.0,
    amp   : 0.10,
    noise : 1,
    reach : 0.98,
  };

  const canvas = document.createElement("canvas");
  canvas.id = "hero-waves";
  canvas.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;" +
    "z-index:0;pointer-events:none;will-change:transform;";
  hero.insertBefore(canvas, hero.firstChild);

  const gl = canvas.getContext("webgl", {
    antialias: false,
    alpha: true,
    preserveDrawingBuffer: false,
    powerPreference: "default",
  });
  if (!gl) { canvas.remove(); return; }

  const VS = `attribute vec2 a_pos;varying vec2 v_uv;
    void main(){v_uv=a_pos*.5+.5;gl_Position=vec4(a_pos,0,1);}`;

  const FS = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
    #else
      precision mediump float;
    #endif
    varying vec2 v_uv;
    uniform float u_time;uniform sampler2D u_grad;
    uniform float u_freq,u_amp,u_noise,u_reach;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float vnoise(vec2 p){
      vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
      return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),
                 mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
    }
    void main(){
      vec2 uv=vec2(v_uv.x,1.-v_uv.y);
      float n=vnoise(uv*3.5+vec2(u_time*.14,u_time*.06));
      float w=sin(uv.x*u_freq-u_time*2.2)*u_amp
             +sin(uv.x*u_freq*.55-u_time*1.5+1.4)*u_amp*.5
             +sin(uv.x*u_freq*1.8-u_time*3.+2.6)*u_amp*.28;
      float d=clamp((uv.y+w+n*.07*u_noise)/u_reach,0.,1.);
      float a=smoothstep(0.,.22,d)*.85;
      vec3 c=texture2D(u_grad,vec2(d,.5)).rgb;
      gl_FragColor=vec4(c,a);
    }`;

  function mkShader(t, s) {
    const sh = gl.createShader(t);
    gl.shaderSource(sh, s);
    gl.compileShader(sh);
    return sh;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, mkShader(gl.VERTEX_SHADER,   VS));
  gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const U = {
    time : gl.getUniformLocation(prog, "u_time"),
    grad : gl.getUniformLocation(prog, "u_grad"),
    freq : gl.getUniformLocation(prog, "u_freq"),
    amp  : gl.getUniformLocation(prog, "u_amp"),
    noise: gl.getUniformLocation(prog, "u_noise"),
    reach: gl.getUniformLocation(prog, "u_reach"),
  };

  function buildGrad(stops) {
    const W = 256, data = new Uint8Array(W * 4), n = stops.length;
    function h(s) { const v = parseInt(s.replace("#",""), 16); return [(v>>16&255),(v>>8&255),(v&255)]; }
    const p = stops.map(h);
    for (let i = 0; i < W; i++) {
      const t = i/(W-1), pos = t*(n-1), lo = Math.floor(pos),
            hi = Math.min(lo+1, n-1), f = pos-lo, a = p[lo], b = p[hi];
      data[i*4  ] = Math.round(a[0]+(b[0]-a[0])*f);
      data[i*4+1] = Math.round(a[1]+(b[1]-a[1])*f);
      data[i*4+2] = Math.round(a[2]+(b[2]-a[2])*f);
      data[i*4+3] = 255;
    }
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  }

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, buildGrad(CONFIG.colors));
  gl.uniform1i(U.grad,  0);
  gl.uniform1f(U.freq,  CONFIG.freq);
  gl.uniform1f(U.amp,   CONFIG.amp);
  gl.uniform1f(U.noise, CONFIG.noise);
  gl.uniform1f(U.reach, CONFIG.reach);

  let resizeTimer;
  function resize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * 0.65;
      canvas.width  = Math.floor(window.innerWidth  * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }, 100);
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  const t0 = performance.now();
  let active = true;
  let rafId  = null;

  function tick(now) {
    if (!active) { rafId = null; return; }
    rafId = requestAnimationFrame(tick);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(U.time, (now - t0) * 0.001 * CONFIG.speed);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  const io = new IntersectionObserver(function (entries) {
    active = entries[0].isIntersecting;
    if (active && rafId === null) rafId = requestAnimationFrame(tick);
  }, { threshold: 0 });
  io.observe(canvas);

  rafId = requestAnimationFrame(tick);
}());
// ══════════════════════════════════════════════════════════════


// ── REVEAL — called by loader.js after it completes ───────────
// Sequence: eyebrow → buttons → devPhoto → h1+skills → sectionTag
// Nav is fully managed by nav-scroll.js — no nav logic here.
// ─────────────────────────────────────────────────────────────
window.revealHero = function () {
  const tl = gsap.timeline();

  // 1 — eyebrow
  tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" });

  // 2 — buttons
  tl.to(buttons, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });

  // 3 — dev photo fades in
  tl.to(devPhoto, { opacity: 1, duration: 1.0, ease: "power2.inOut" });

  // 4 — h1 + skills simultaneously
  tl.to(h1,     { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
  tl.to(skills, { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }, "<");

  // 5 — section tag
  tl.to(sectionTag, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
};