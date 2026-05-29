const canvas = document.getElementById('cyber-grid');
if (!canvas) { }
else {
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const t = Date.now() / 1000;
    const gridSize = 60;
    const cols = Math.ceil(W / gridSize) + 1;
    const rows = Math.ceil(H / gridSize) + 1;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * gridSize;
        const y = j * gridSize;
        const dist = Math.sqrt((x - W/2)**2 + (y - H/2)**2);
        const alpha = Math.max(0, 0.15 - dist / (Math.max(W, H) * 1.2)) * (0.7 + 0.3 * Math.sin(t + dist * 0.01));

        ctx.strokeStyle = `rgba(0, 200, 255, ${alpha})`;
        ctx.lineWidth = 0.5;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
    }

    // Scan line
    const scanY = ((t * 80) % (H + 40)) - 20;
    const scanGrad = ctx.createLinearGradient(0, scanY - 15, 0, scanY + 15);
    scanGrad.addColorStop(0, 'rgba(0,245,255,0)');
    scanGrad.addColorStop(0.5, 'rgba(0,245,255,0.08)');
    scanGrad.addColorStop(1, 'rgba(0,245,255,0)');
    ctx.fillStyle = scanGrad;
    ctx.fillRect(0, scanY - 15, W, 30);

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
}
