gsap.registerPlugin(ScrollTrigger);

// ===== INTRO ANIMATION =====
const tl = gsap.timeline({ delay: 0.3 });
tl.to('.intro-title', { opacity: 1, y: 0, duration: 1.4, ease: 'power3.out' })
  .to('.intro-en', { opacity: 0.5, duration: 1, ease: 'power2.out' }, '-=0.8')
  .to('.intro-sub', { opacity: 1, duration: 1, ease: 'power2.out' }, '-=0.6')
  .to('.intro-scroll', { opacity: 1, duration: 0.8 }, '-=0.3');

// ===== ERA HEADER REVEAL =====
document.querySelectorAll('.era-header').forEach(el => {
  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 80%',
      toggleActions: 'play none none none'
    }
  });
});

// ===== ERA SCENE REVEAL =====
document.querySelectorAll('.era-scene').forEach(el => {
  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 75%',
      toggleActions: 'play none none none'
    }
  });
});

// ===== FUTURE REVEAL =====
gsap.to('.future-content', {
  opacity: 1,
  y: 0,
  duration: 1.2,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: '.future-content',
    start: 'top 75%',
    toggleActions: 'play none none none'
  }
});

// ===== LOCKED ERA BARS STAGGER =====
gsap.from('.locked-era', {
  opacity: 0,
  y: 20,
  stagger: 0.2,
  duration: 0.8,
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '.locked-eras',
    start: 'top 80%',
    toggleActions: 'play none none none'
  }
});

// ===== ERA NAV ACTIVE STATE =====
const eras = document.querySelectorAll('.era');
const dots = document.querySelectorAll('.era-dot');

eras.forEach((era, i) => {
  ScrollTrigger.create({
    trigger: era,
    start: 'top 50%',
    end: 'bottom 50%',
    onEnter: () => setActiveDot(i),
    onEnterBack: () => setActiveDot(i),
  });
});

function setActiveDot(index) {
  dots.forEach(d => d.classList.remove('active'));
  if (dots[index]) dots[index].classList.add('active');
}

// ===== DOT CLICK SCROLL =====
dots.forEach(dot => {
  dot.addEventListener('click', () => {
    const targetId = dot.dataset.target;
    const target = document.getElementById(targetId);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ===== PARALLAX ON ERA BGs =====
document.querySelectorAll('.era-bg-layer').forEach(layer => {
  gsap.to(layer, {
    yPercent: -15,
    ease: 'none',
    scrollTrigger: {
      trigger: layer.closest('.era'),
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });
});
