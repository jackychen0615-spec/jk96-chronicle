const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

let stars = [];
let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function initStars() {
  stars = [];
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.2,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.3 + 0.05,
      pulse: Math.random() * Math.PI * 2
    });
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  // deep space gradient
  const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H) * 0.8);
  grad.addColorStop(0, 'rgba(10, 5, 30, 1)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 1)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const t = Date.now() / 1000;

  stars.forEach(s => {
    s.pulse += 0.01;
    const alpha = s.alpha * (0.6 + 0.4 * Math.sin(s.pulse));

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 240, 200, ${alpha})`;
    ctx.fill();

    // subtle glow for brighter stars
    if (s.r > 1.2) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 168, 76, ${alpha * 0.1})`;
      ctx.fill();
    }
  });

  // nebula glow in center
  const nebula = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W * 0.4);
  nebula.addColorStop(0, `rgba(40, 20, 80, ${0.15 + 0.05 * Math.sin(t * 0.3)})`);
  nebula.addColorStop(0.5, `rgba(20, 10, 50, 0.08)`);
  nebula.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = nebula;
  ctx.fillRect(0, 0, W, H);

  requestAnimationFrame(draw);
}

window.addEventListener('resize', () => { resize(); initStars(); });
resize();
initStars();
draw();
