const SCHEMES = {
  gold: {
    count: 55,
    colors: ['rgba(201,168,76,OP)', 'rgba(240,208,128,OP)', 'rgba(255,230,150,OP)'],
    minSize: 0.6, maxSize: 2.2,
    speed: 0.28,
    drift: 0.18,
    rise: true,
  },
  ember: {
    count: 38,
    colors: ['rgba(200,60,40,OP)', 'rgba(160,30,20,OP)', 'rgba(220,100,60,OP)'],
    minSize: 0.5, maxSize: 1.8,
    speed: 0.22,
    drift: 0.25,
    rise: false, // fall / drift sideways
  },
  light: {
    count: 65,
    colors: ['rgba(255,220,120,OP)', 'rgba(255,245,200,OP)', 'rgba(201,168,76,OP)'],
    minSize: 0.8, maxSize: 2.8,
    speed: 0.32,
    drift: 0.12,
    rise: true,
  },
};

class ParticleSystem {
  constructor(canvas, scheme) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.s = SCHEMES[scheme];
    this.particles = [];
    this.W = 0;
    this.H = 0;
    this.resize();
    this.init();
    window.addEventListener('resize', () => this.resize());
    this.raf = requestAnimationFrame(() => this.loop());
  }

  resize() {
    this.W = this.canvas.width = this.canvas.offsetWidth;
    this.H = this.canvas.height = this.canvas.offsetHeight;
  }

  rand(min, max) { return min + Math.random() * (max - min); }

  spawn(fromBottom) {
    const s = this.s;
    return {
      x: this.rand(0, this.W),
      y: fromBottom ? this.rand(this.H * 0.6, this.H + 20) : this.rand(-10, this.H),
      size: this.rand(s.minSize, s.maxSize),
      op: this.rand(0.15, 0.65),
      vx: this.rand(-s.drift, s.drift),
      vy: s.rise ? -this.rand(0.08, s.speed) : this.rand(-s.speed * 0.3, s.speed * 0.5),
      life: this.rand(0.4, 1),
      decay: this.rand(0.0015, 0.004),
      color: this.s.colors[Math.floor(Math.random() * this.s.colors.length)],
      flicker: this.rand(0, Math.PI * 2),
      flickerSpeed: this.rand(0.02, 0.06),
    };
  }

  init() {
    for (let i = 0; i < this.s.count; i++) this.particles.push(this.spawn(false));
  }

  loop() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    for (let p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      p.flicker += p.flickerSpeed;

      const alive = p.life > 0 && p.x > -5 && p.x < this.W + 5 &&
                    (this.s.rise ? p.y > -10 : p.y < this.H + 10);

      if (!alive) {
        Object.assign(p, this.spawn(true));
        continue;
      }

      const flick = 0.75 + 0.25 * Math.sin(p.flicker);
      const alpha = p.life * p.op * flick;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color.replace('OP', alpha.toFixed(3));
      ctx.fill();
    }

    requestAnimationFrame(() => this.loop());
  }
}

document.querySelectorAll('.particle-canvas').forEach(canvas => {
  new ParticleSystem(canvas, canvas.dataset.scheme);
});
