(function () {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');

  let stars = [];
  let shootingStars = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    buildStars();
  }

  function buildStars() {
    const count = Math.floor((canvas.width * canvas.height) / 3500);
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.3 + 0.3,
        baseAlpha: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
  }

  function maybeSpawnShootingStar() {
    if (Math.random() < 0.0025 && shootingStars.length < 2) {
      const startX = Math.random() * canvas.width;
      const startY = Math.random() * canvas.height * 0.4;
      shootingStars.push({
        x: startX,
        y: startY,
        length: Math.random() * 120 + 80,
        speed: Math.random() * 8 + 6,
        angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
        life: 1,
      });
    }
  }

  function draw(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // stars
    for (const s of stars) {
      const alpha = s.baseAlpha + Math.sin(time * s.twinkleSpeed + s.twinklePhase) * 0.3;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0, Math.min(1, alpha))})`;
      ctx.fill();
    }

    // shooting stars
    maybeSpawnShootingStar();
    shootingStars = shootingStars.filter(st => st.life > 0);
    for (const st of shootingStars) {
      const dx = Math.cos(st.angle) * st.length;
      const dy = Math.sin(st.angle) * st.length;

      const gradient = ctx.createLinearGradient(st.x, st.y, st.x - dx, st.y - dy);
      gradient.addColorStop(0, `rgba(255,255,255,${st.life})`);
      gradient.addColorStop(1, 'rgba(255,255,255,0)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(st.x, st.y);
      ctx.lineTo(st.x - dx, st.y - dy);
      ctx.stroke();

      st.x += Math.cos(st.angle) * st.speed;
      st.y += Math.sin(st.angle) * st.speed;
      st.life -= 0.02;
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
})();
