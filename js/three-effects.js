import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }     from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

let W = window.innerWidth, H = window.innerHeight;

/* ── Soft circle sprite (replaces default square points) ── */
function makeSprite() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0,   'rgba(255,255,255,1)');
  g.addColorStop(0.35,'rgba(255,255,255,0.7)');
  g.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
const SPRITE = makeSprite();

/* ── PointsMaterial helper — always uses soft circle sprite ── */
function pts(opts) {
  return new THREE.PointsMaterial({ map: SPRITE, transparent: true, depthWrite: false, alphaTest: 0.01, ...opts });
}

/* ── Shared renderer (black bg → mix-blend-mode:screen makes black transparent) ── */
const cnv = document.createElement('canvas');
cnv.id = 'three-canvas';
Object.assign(cnv.style, {
  position: 'fixed', inset: '0',
  width: '100vw', height: '100vh',
  pointerEvents: 'none',
  zIndex: '10',
  mixBlendMode: 'screen',
});
document.body.prepend(cnv);

const renderer = new THREE.WebGLRenderer({ canvas: cnv, antialias: true });
renderer.setSize(W, H);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000000, 1);
renderer.toneMapping    = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;

/* ── Panel factory ── */
function mkPanel(bStr, bRad, bThr) {
  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
  camera.position.z = 5;
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom    = new UnrealBloomPass(new THREE.Vector2(W, H), bStr, bRad, bThr);
  composer.addPass(bloom);
  return { scene, camera, composer, bloom, tick: null };
}

/* ══════════════════════════════════════════
   P0  序  — Deep-space starfield
══════════════════════════════════════════ */
function buildP0() {
  const p = mkPanel(1.2, 0.5, 0.55);

  // Background star cloud
  const N = 5000;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const θ = Math.random() * Math.PI * 2;
    const φ = Math.acos(2 * Math.random() - 1);
    const r = 20 + Math.random() * 100;
    pos[i*3]   = r * Math.sin(φ) * Math.cos(θ);
    pos[i*3+1] = r * Math.sin(φ) * Math.sin(θ);
    pos[i*3+2] = r * Math.cos(φ);
  }
  const bgGeo = new THREE.BufferGeometry();
  bgGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const bgStars = new THREE.Points(bgGeo, pts({ color: 0xfff5e8, size: 0.18 }));
  p.scene.add(bgStars);

  // Bright feature stars — bloom hotspots
  const fgPos = new Float32Array(120 * 3);
  for (let i = 0; i < 120; i++) {
    fgPos[i*3]   = (Math.random() - 0.5) * 35;
    fgPos[i*3+1] = (Math.random() - 0.5) * 25;
    fgPos[i*3+2] = -8 - Math.random() * 20;
  }
  const fgGeo = new THREE.BufferGeometry();
  fgGeo.setAttribute('position', new THREE.BufferAttribute(fgPos, 3));
  p.scene.add(new THREE.Points(fgGeo, pts({ color: 0xffffff, size: 0.45 })));

  // Milky Way band
  const mwPos = new Float32Array(1500 * 3);
  for (let i = 0; i < 1500; i++) {
    const angle = (i / 1500) * Math.PI * 2;
    const band  = (Math.random() - 0.5) * 12;
    const depth = 25 + Math.random() * 30;
    mwPos[i*3]   = Math.cos(angle) * depth + (Math.random() - 0.5) * 10;
    mwPos[i*3+1] = band;
    mwPos[i*3+2] = Math.sin(angle) * depth;
  }
  const mwGeo = new THREE.BufferGeometry();
  mwGeo.setAttribute('position', new THREE.BufferAttribute(mwPos, 3));
  p.scene.add(new THREE.Points(mwGeo, pts({ color: 0xc8d8ff, size: 0.1, opacity: 0.45 })));

  p.tick = t => {
    bgStars.rotation.y = t * 0.006;
    bgStars.rotation.x = Math.sin(t * 0.002) * 0.08;
    p.camera.position.z = 5 + Math.sin(t * 0.18) * 0.4;
  };
  return p;
}

/* ══════════════════════════════════════════
   P1  太古 — Golden orbital sphere
══════════════════════════════════════════ */
function buildP1() {
  const p = mkPanel(4.0, 0.65, 0.18);

  // White hot inner core
  p.scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  ));

  // Gold outer sphere
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffe060 })
  );
  p.scene.add(orb);

  // Torus rings
  const rings = [];
  [[1.1, 0.22, 0.4], [1.7, 0.58, 0.28], [2.4, 1.0, 0.16]].forEach(([r, rx, op], i) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.013, 8, 90),
      new THREE.MeshBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: op })
    );
    ring.rotation.x = rx;
    ring.rotation.z = i * 0.7;
    p.scene.add(ring);
    rings.push(ring);
  });

  // 3-D gold dust cloud
  const N = 600;
  const pp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const θ = Math.random() * Math.PI * 2;
    const φ = Math.acos(2 * Math.random() - 1);
    const r = 0.8 + Math.random() * 3.2;
    pp[i*3] = r * Math.sin(φ) * Math.cos(θ);
    pp[i*3+1] = r * Math.sin(φ) * Math.sin(θ);
    pp[i*3+2] = r * Math.cos(φ);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const dust = new THREE.Points(dustGeo, pts({ color: 0xffd060, size: 0.09, opacity: 0.6 }));
  p.scene.add(dust);

  p.tick = t => {
    orb.scale.setScalar(1 + 0.06 * Math.sin(t * 0.9));
    dust.rotation.y = t * 0.08;
    dust.rotation.z = t * 0.025;
    rings.forEach((r, i) => { r.rotation.z += 0.004 * (i % 2 ? -1 : 1); });
    p.bloom.strength = 4.0 + 0.8 * Math.sin(t * 0.6);
  };
  return p;
}

/* ══════════════════════════════════════════
   P2  黑暗 — Eclipse + accretion disk
══════════════════════════════════════════ */
function buildP2() {
  const p = mkPanel(4.5, 0.75, 0.04);

  // Dark void
  p.scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(0.62, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x0a0101 })
  ));

  // Red hot corona
  const corona = new THREE.Mesh(
    new THREE.TorusGeometry(0.74, 0.22, 16, 90),
    new THREE.MeshBasicMaterial({ color: 0xd82010 })
  );
  corona.rotation.x = Math.PI * 0.5;
  p.scene.add(corona);

  // Accretion disk spiral
  const N = 800;
  const aPos = new Float32Array(N * 3);
  const aCol = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const ang = (i / N) * Math.PI * 12 + (Math.random() - 0.5) * 0.4;
    const r   = 0.85 + (i / N) * 3.5 + (Math.random() - 0.5) * 0.25;
    aPos[i*3]   = r * Math.cos(ang);
    aPos[i*3+1] = (Math.random() - 0.5) * 0.25;
    aPos[i*3+2] = r * Math.sin(ang);
    const heat = Math.pow(1 - i / N, 2.5);
    aCol[i*3]   = 0.9 * heat + 0.12;
    aCol[i*3+1] = 0.04 * heat;
    aCol[i*3+2] = 0.02 * heat;
  }
  const aGeo = new THREE.BufferGeometry();
  aGeo.setAttribute('position', new THREE.BufferAttribute(aPos, 3));
  aGeo.setAttribute('color',    new THREE.BufferAttribute(aCol, 3));
  const disk = new THREE.Points(aGeo, pts({ vertexColors: true, size: 0.1, opacity: 0.85 }));
  p.scene.add(disk);

  p.tick = t => {
    disk.rotation.y = t * 0.055;
    corona.scale.setScalar(1 + 0.07 * Math.sin(t * 1.1));
    p.bloom.strength = 4.5 + 1.2 * Math.sin(t * 0.5);
  };
  return p;
}

/* ══════════════════════════════════════════
   P3  流浪 — Sepia dust drift
══════════════════════════════════════════ */
function buildP3() {
  const p = mkPanel(0.6, 0.3, 0.82);
  p.camera.position.z = 6;

  const N = 350;
  const wPos = new Float32Array(N * 3);
  const wVy  = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    wPos[i*3]   = (Math.random() - 0.5) * 16;
    wPos[i*3+1] = (Math.random() - 0.5) * 11;
    wPos[i*3+2] = (Math.random() - 0.5) * 9;
    wVy[i] = 0.003 + Math.random() * 0.007;
  }
  const wGeo = new THREE.BufferGeometry();
  wGeo.setAttribute('position', new THREE.BufferAttribute(wPos, 3));
  const wander = new THREE.Points(wGeo, pts({ color: 0xc8a060, size: 0.12, opacity: 0.32 }));
  p.scene.add(wander);

  // Faint sepia orb
  p.scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xc89050, transparent: true, opacity: 0.25 })
  ));

  p.tick = () => {
    const arr = wander.geometry.attributes.position.array;
    for (let i = 0; i < N; i++) {
      arr[i*3+1] += wVy[i];
      if (arr[i*3+1] > 5.5) arr[i*3+1] = -5.5;
    }
    wander.geometry.attributes.position.needsUpdate = true;
    p.camera.position.x = Math.sin(Date.now() * 0.00015) * 0.35;
    p.camera.position.y = Math.cos(Date.now() * 0.00012) * 0.15;
  };
  return p;
}

/* ══════════════════════════════════════════
   P4  覺醒 — Door bloom EXPLOSION
══════════════════════════════════════════ */
function buildP4() {
  const p = mkPanel(1.2, 0.5, 0.12);

  // Door-seam vertical beam
  const beamGeo = new THREE.PlaneGeometry(0.07, 12);
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xfff5c0, transparent: true, opacity: 0.9 });
  const beam    = new THREE.Mesh(beamGeo, beamMat);
  p.scene.add(beam);

  // Hot white core at seam centre
  const coreGeo = new THREE.SphereGeometry(0.1, 16, 16);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const core    = new THREE.Mesh(coreGeo, coreMat);
  p.scene.add(core);

  // Light rays (8 directions)
  const rays = [];
  for (let i = 0; i < 8; i++) {
    const ang  = (i / 8) * Math.PI * 2;
    const len  = 3 + Math.random() * 2.5;
    const rGeo = new THREE.PlaneGeometry(0.025, len);
    const rMat = new THREE.MeshBasicMaterial({ color: 0xffe060, transparent: true, opacity: 0 });
    const ray  = new THREE.Mesh(rGeo, rMat);
    ray.rotation.z = ang;
    ray.position.set(Math.sin(ang) * len * 0.5, Math.cos(ang) * len * 0.5, 0);
    p.scene.add(ray);
    rays.push(ray);
  }

  // Explosion particles — wait at seam until door opens
  const N    = 700;
  const ePos = new Float32Array(N * 3);
  const eVel = new Float32Array(N * 3);
  const eRef = new Float32Array(N * 3); // reset positions
  for (let i = 0; i < N; i++) {
    ePos[i*3]   = (Math.random() - 0.5) * 0.12;
    ePos[i*3+1] = (Math.random() - 0.5) * 9;
    ePos[i*3+2] = 0;
    eRef[i*3]   = ePos[i*3];
    eRef[i*3+1] = ePos[i*3+1];
    eRef[i*3+2] = 0;
    const spd   = 0.025 + Math.random() * 0.07;
    const ang   = Math.random() * Math.PI * 2;
    eVel[i*3]   = Math.cos(ang) * spd;
    eVel[i*3+1] = (Math.random() - 0.5) * 0.012;
    eVel[i*3+2] = Math.abs(Math.sin(ang)) * spd * 0.4;
  }
  const eGeo  = new THREE.BufferGeometry();
  eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
  const eMat  = pts({ color: 0xffd060, size: 0.12, opacity: 0 });
  const burst = new THREE.Points(eGeo, eMat);
  p.scene.add(burst);

  let opened = false, prog = 0;

  function resetScene() {
    opened = false; prog = 0;
    p.bloom.strength = 1.2;
    beamMat.opacity  = 0.9;
    coreMat.opacity  = 1;
    eMat.opacity     = 0;
    core.scale.setScalar(1);
    rays.forEach(r => { r.material.opacity = 0; r.scale.y = 1; });
    for (let i = 0; i < N; i++) {
      ePos[i*3]   = eRef[i*3];
      ePos[i*3+1] = eRef[i*3+1];
      ePos[i*3+2] = 0;
    }
    eGeo.attributes.position.needsUpdate = true;
  }

  window.addEventListener('doorOpen',  () => { opened = true; prog = 0; });
  window.addEventListener('doorReset', resetScene);

  p.tick = t => {
    if (opened) {
      prog = Math.min(1, prog + 0.006);
      p.bloom.strength = 1.2 + prog * 5.5;

      eMat.opacity = Math.min(0.9, prog * 2.2);
      const ep = burst.geometry.attributes.position.array;
      for (let i = 0; i < N; i++) {
        ep[i*3]   += eVel[i*3]   * (0.3 + prog * 0.7);
        ep[i*3+1] += eVel[i*3+1];
        ep[i*3+2] += eVel[i*3+2] * (0.3 + prog * 0.7);
      }
      burst.geometry.attributes.position.needsUpdate = true;

      beamMat.opacity = Math.max(0, 0.9 - prog * 1.4);
      core.scale.setScalar(1 + prog * 5);

      rays.forEach((r, i) => {
        const rp = Math.max(0, prog - i * 0.07);
        r.material.opacity = Math.min(0.45, rp * 0.9);
        r.scale.y = 1 + prog * 2.2;
      });
    } else {
      // idle: seam gently pulses
      beamMat.opacity = 0.55 + 0.35 * Math.sin(t * 2.8);
      core.scale.setScalar(0.75 + 0.25 * Math.sin(t * 3.2));
      p.bloom.strength = 1.2 + 0.6 * Math.sin(t * 0.75);
    }
  };
  return p;
}

/* ══════════════════════════════════════════
   P5  未來 — Cyberpunk neon rain
══════════════════════════════════════════ */
function buildP5() {
  const p = mkPanel(2.8, 0.6, 0.08);

  // Cyan data rain
  const N   = 500;
  const cPos = new Float32Array(N * 3);
  const cSpd = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    cPos[i*3]   = (Math.random() - 0.5) * 20;
    cPos[i*3+1] = (Math.random() - 0.5) * 14;
    cPos[i*3+2] = (Math.random() - 0.5) * 8;
    cSpd[i]     = 0.012 + Math.random() * 0.032;
  }
  const cGeo = new THREE.BufferGeometry();
  cGeo.setAttribute('position', new THREE.BufferAttribute(cPos, 3));
  const rain = new THREE.Points(cGeo, pts({ color: 0x00f5ff, size: 0.14, opacity: 0.7 }));
  p.scene.add(rain);

  // Bloom hotspot orbs — cyan + purple
  [[0x00f5ff, 6], [0x9933ff, 3]].forEach(([col, count]) => {
    for (let i = 0; i < count; i++) {
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 16, 16),
        new THREE.MeshBasicMaterial({ color: col })
      );
      orb.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        -1 - Math.random() * 2
      );
      p.scene.add(orb);
    }
  });

  // Occasional scan streaks
  const streaks = [];
  for (let i = 0; i < 4; i++) {
    const sGeo = new THREE.PlaneGeometry(20, 0.02);
    const sMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0 });
    const s    = new THREE.Mesh(sGeo, sMat);
    s.position.set(0, (Math.random() - 0.5) * 8, -0.5);
    p.scene.add(s);
    streaks.push({ mesh: s, mat: sMat, vy: 0.04 + Math.random() * 0.06, phase: Math.random() * Math.PI * 2 });
  }

  p.tick = t => {
    const arr = rain.geometry.attributes.position.array;
    for (let i = 0; i < N; i++) {
      arr[i*3+1] -= cSpd[i];
      if (arr[i*3+1] < -7) arr[i*3+1] = 7;
    }
    rain.geometry.attributes.position.needsUpdate = true;

    streaks.forEach(s => {
      s.mesh.position.y -= s.vy;
      if (s.mesh.position.y < -7) s.mesh.position.y = 7;
      s.mat.opacity = Math.max(0, 0.6 * Math.sin(t * 1.5 + s.phase));
    });

    p.bloom.strength = 2.8 + 0.5 * Math.sin(t * 0.4);
  };
  return p;
}

/* ── Build & activate ── */
const panels = [buildP0(), buildP1(), buildP2(), buildP3(), buildP4(), buildP5()];
let active   = 0;

window.addEventListener('panelChange', e => { active = e.detail.index; });

window.addEventListener('resize', () => {
  W = window.innerWidth; H = window.innerHeight;
  renderer.setSize(W, H);
  panels.forEach(({ camera, composer }) => {
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    composer.setSize(W, H);
  });
});

(function loop() {
  requestAnimationFrame(loop);
  const t = performance.now() * 0.001;
  const { tick, composer } = panels[active];
  if (tick) tick(t);
  composer.render();
})();
