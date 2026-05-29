gsap.registerPlugin(ScrollTrigger);

const track       = document.getElementById('panelsTrack');
const allPanels   = document.querySelectorAll('.panel');
const total       = allPanels.length;
const progressBar = document.getElementById('progressBar');
const dotNav      = document.getElementById('dotNav');
const counter     = document.getElementById('panelCounter');
const counterCur  = document.getElementById('counterCurrent');
const dots        = document.querySelectorAll('.dot-nav-item');

/* ── Door elements ── */
const doorOverlay = document.getElementById('doorOverlay');
const doorLeft    = doorOverlay ? doorOverlay.querySelector('.door-left')  : null;
const doorRight   = doorOverlay ? doorOverlay.querySelector('.door-right') : null;
const doorSeam    = doorOverlay ? doorOverlay.querySelector('.door-seam-light') : null;

let cur  = 0;
let busy = false;
const DUR  = 0.85;
const EASE = 'power3.inOut';

/* ── 2D grid [col, row] per panel index
   Grid layout:
     覺醒(0,0)  未來(1,0)
     序  (0,1)  太古(1,1)
     流浪(0,2)  黑暗(1,2)

   Path: 序→右→太古→下→黑暗→左→流浪→上(×2)→覺醒→右→未來
── */
const POSITIONS = [
  [0, 1], // 0  序
  [1, 1], // 1  太古
  [1, 2], // 2  黑暗
  [0, 2], // 3  流浪
  [0, 0], // 4  覺醒
  [1, 0], // 5  未來
];

/* ── ANIM DEFINITIONS ── */
function getEnterAnim(el, dir) {
  const a = el.dataset.a;
  if (a === 'fade')  return { opacity: 0 };
  if (a === 'rise')  return { opacity: 0, y: dir > 0 ? 45 : -45 };
  if (a === 'scale') return { opacity: 0, scale: .7 };
  return { opacity: 0 };
}
function getEnterTo(el) {
  return { opacity: 1, y: 0, scale: 1, duration: DUR * 1.1, ease: 'power3.out' };
}

/* ── DOOR ANIMATION ── */
function openDoors() {
  if (!doorOverlay) return;
  window.dispatchEvent(new CustomEvent('doorOpen'));
  gsap.set(doorOverlay, { opacity: 1, display: 'flex' });
  gsap.set(doorLeft,  { rotateY: 0, transformPerspective: 1000 });
  gsap.set(doorRight, { rotateY: 0, transformPerspective: 1000 });
  if (doorSeam) gsap.set(doorSeam, { opacity: 1 });
  const tl = gsap.timeline({ delay: 0.1 });
  tl.to(doorLeft,  { rotateY: -85, transformPerspective: 1000, duration: 2.0, ease: 'power2.inOut' }, 0)
    .to(doorRight, { rotateY:  85, transformPerspective: 1000, duration: 2.0, ease: 'power2.inOut' }, 0)
    .to(doorSeam,  { opacity: 0, duration: 0.4 }, 0.8)
    .to(doorOverlay, { opacity: 0, duration: 0.6 }, 1.8)
    .set(doorOverlay, { display: 'none' });
}

function resetDoors() {
  if (!doorOverlay) return;
  window.dispatchEvent(new CustomEvent('doorReset'));
  gsap.killTweensOf([doorLeft, doorRight, doorOverlay, doorSeam]);
  gsap.set(doorOverlay, { opacity: 1, display: 'flex' });
  gsap.set(doorLeft,  { rotateY: 0, transformPerspective: 1000 });
  gsap.set(doorRight, { rotateY: 0, transformPerspective: 1000 });
  if (doorSeam) gsap.set(doorSeam, { opacity: 1 });
}

/* ── ANIMATE IN ── */
function animateIn(panelIndex, dir) {
  const panel = allPanels[panelIndex];
  const els   = panel.querySelectorAll('[data-a]');

  if (panelIndex === 4) {
    openDoors();
    els.forEach((el, i) => {
      gsap.fromTo(el, getEnterAnim(el, dir), { ...getEnterTo(el), delay: 1.4 + i * 0.18 });
    });
    return;
  }
  els.forEach((el, i) => {
    gsap.fromTo(el, getEnterAnim(el, dir), { ...getEnterTo(el), delay: 0.05 + i * 0.09 });
  });
}

function resetPanel(panelIndex) {
  const panel = allPanels[panelIndex];
  gsap.set(panel.querySelectorAll('[data-a]'), { opacity: 0, y: 0, scale: 1 });
  if (panelIndex === 4) resetDoors();
}

/* ── UI UPDATE ── */
function updateUI(index) {
  counterCur.textContent = String(index + 1).padStart(2, '0');
  dots.forEach((d, i) => d.classList.toggle('active', i === index));
  gsap.to(progressBar, { width: `${(index / (total - 1)) * 100}%`, duration: DUR, ease: EASE });
}

/* ── GO TO PANEL ── */
function goTo(target, dir) {
  if (busy || target < 0 || target >= total) return;
  busy = true;

  if (cur === 4 && target !== 4) resetDoors();

  const [col, row] = POSITIONS[target];
  const direction  = dir ?? (target > cur ? 1 : -1);

  gsap.to(track, {
    x: -col * window.innerWidth,
    y: -row * window.innerHeight,
    duration: DUR,
    ease: EASE,
    onComplete() {
      busy = false;
      cur  = target;
      updateUI(cur);
      animateIn(cur, direction);
      window.dispatchEvent(new CustomEvent('panelChange', { detail: { index: cur } }));
    }
  });
}

/* ── INIT ── */
allPanels.forEach((_, i) => { if (i > 0) resetPanel(i); });

// 序 is at col0, row1 — set initial transform accordingly
const [ic, ir] = POSITIONS[0];
gsap.set(track, { x: -ic * window.innerWidth, y: -ir * window.innerHeight });

setTimeout(() => {
  dotNav.classList.add('show');
  counter.classList.add('show');
}, 1000);

/* ── INTRO ANIM ── */
const introTL = gsap.timeline({ delay: 0.25 });
introTL
  .to('.hero-kanji',   { opacity: 1, y: 0, scale: 1, duration: 1.5,  ease: 'power3.out' })
  .to('.label-top',    { opacity: .55, duration: .9, ease: 'power2.out' }, '-=1.1')
  .to('.hero-en',      { opacity: .5,  duration: .9, ease: 'power2.out' }, '-=.7')
  .to('.hero-tagline', { opacity: 1,   duration: .9, ease: 'power2.out' }, '-=.55')
  .to('.scroll-cue',   { opacity: 1,   duration: .7 }, '-=.3');

/* ── INPUT HANDLERS ── */
let wheelSum = 0, wheelT;
window.addEventListener('wheel', e => {
  e.preventDefault();
  clearTimeout(wheelT);
  // Support both horizontal (trackpad) and vertical wheel
  const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  wheelSum += delta;
  wheelT = setTimeout(() => {
    if (Math.abs(wheelSum) > 20) goTo(cur + (wheelSum > 0 ? 1 : -1));
    wheelSum = 0;
  }, 60);
}, { passive: false });

window.addEventListener('keydown', e => {
  if (['ArrowRight', 'ArrowDown'].includes(e.key)) goTo(cur + 1);
  if (['ArrowLeft',  'ArrowUp'  ].includes(e.key)) goTo(cur - 1);
});

// Touch — detect dominant direction for natural swipe feel
let tx = 0, ty = 0;
window.addEventListener('touchstart', e => {
  tx = e.touches[0].clientX;
  ty = e.touches[0].clientY;
}, { passive: true });
window.addEventListener('touchend', e => {
  const dx = tx - e.changedTouches[0].clientX;
  const dy = ty - e.changedTouches[0].clientY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (Math.abs(dx) > 40) goTo(cur + (dx > 0 ? 1 : -1));
  } else {
    if (Math.abs(dy) > 40) goTo(cur + (dy > 0 ? 1 : -1));
  }
}, { passive: true });

dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

window.addEventListener('resize', () => {
  const [col, row] = POSITIONS[cur];
  gsap.set(track, { x: -col * window.innerWidth, y: -row * window.innerHeight });
});
