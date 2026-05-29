/* ==========================================
   Starry Night Date Invitation — Logic
   Twinkling stars, shooting stars, fireflies,
   heart constellation, dodge button, countdown
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== CANVAS: STARRY SKY =====
  const canvas = document.getElementById('sky-canvas');
  const ctx = canvas.getContext('2d');
  let W, H;
  const stars = [];
  const shootingStars = [];
  const fireflies = [];
  const heartStars = [];
  let showHeartConstellation = false;
  let heartAnimProgress = 0;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Generate static twinkling stars
  for (let i = 0; i < 220; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.8 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.008 + 0.002,
      dir: Math.random() > 0.5 ? 1 : -1
    });
  }

  // Generate fireflies (warm glowing dots that drift)
  for (let i = 0; i < 18; i++) {
    fireflies.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 3 + 1.5,
      alpha: 0,
      targetAlpha: Math.random() * 0.5 + 0.2,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.3,
      hue: Math.random() > 0.5 ? 340 : 270  // pink or purple
    });
  }

  // Heart constellation points (normalized 0-1 coords, will scale)
  const heartShape = [];
  for (let t = 0; t < Math.PI * 2; t += 0.15) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
    heartShape.push({ nx: x / 18, ny: y / 18 });
  }

  // Pre-generate heart star particles
  heartShape.forEach((pt, i) => {
    heartStars.push({
      tx: 0, ty: 0,  // target (set on trigger)
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.5 + 1,
      alpha: 0,
      delay: i * 40
    });
  });

  function triggerShootingStar() {
    const fromRight = Math.random() > 0.5;
    shootingStars.push({
      x: fromRight ? W + 10 : -10,
      y: Math.random() * H * 0.5,
      vx: fromRight ? -(Math.random() * 6 + 4) : (Math.random() * 6 + 4),
      vy: Math.random() * 3 + 1,
      life: 1,
      decay: Math.random() * 0.015 + 0.008,
      len: Math.random() * 60 + 40
    });
  }

  // Spawn a few shooting stars over time
  setInterval(() => {
    if (Math.random() < 0.4) triggerShootingStar();
  }, 3000);
  // Initial one at 1.5s
  setTimeout(triggerShootingStar, 1500);

  function triggerHeartConstellation() {
    showHeartConstellation = true;
    heartAnimProgress = 0;
    const cx = W / 2;
    const cy = H / 2;
    const scale = Math.min(W, H) * 0.18;

    heartStars.forEach((s, i) => {
      s.tx = cx + heartShape[i].nx * scale;
      s.ty = cy + heartShape[i].ny * scale - 20;
      s.x = Math.random() * W;
      s.y = Math.random() * H;
      s.alpha = 0;
    });
  }

  // Main animation loop
  function animate() {
    ctx.clearRect(0, 0, W, H);

    // Draw twinkling stars
    stars.forEach(s => {
      s.alpha += s.speed * s.dir;
      if (s.alpha >= 1) s.dir = -1;
      if (s.alpha <= 0.1) s.dir = 1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240, 230, 255, ${s.alpha})`;
      ctx.fill();
    });

    // Draw fireflies
    fireflies.forEach(f => {
      f.x += f.vx;
      f.y += f.vy;

      // Wrap around
      if (f.x < -20) f.x = W + 20;
      if (f.x > W + 20) f.x = -20;
      if (f.y < -20) f.y = H + 20;
      if (f.y > H + 20) f.y = -20;

      // Gentle alpha pulsing
      f.alpha += (f.targetAlpha - f.alpha) * 0.02;
      if (Math.random() < 0.005) f.targetAlpha = Math.random() * 0.5 + 0.15;

      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 3);
      gradient.addColorStop(0, `hsla(${f.hue}, 90%, 75%, ${f.alpha})`);
      gradient.addColorStop(1, `hsla(${f.hue}, 90%, 75%, 0)`);
      ctx.fillStyle = gradient;
      ctx.fill();
    });

    // Draw shooting stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life -= s.decay;

      if (s.life <= 0) { shootingStars.splice(i, 1); continue; }

      const tailX = s.x - (s.vx / Math.sqrt(s.vx*s.vx + s.vy*s.vy)) * s.len;
      const tailY = s.y - (s.vy / Math.sqrt(s.vx*s.vx + s.vy*s.vy)) * s.len;

      const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
      grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${s.life * 0.8})`);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Bright head
      ctx.beginPath();
      ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${s.life})`;
      ctx.fill();
    }

    // Draw heart constellation
    if (showHeartConstellation) {
      heartAnimProgress += 16; // ms per frame roughly
      heartStars.forEach((s, i) => {
        const t = Math.max(0, Math.min(1, (heartAnimProgress - s.delay) / 800));
        const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t; // ease in-out quad
        s.x += (s.tx - s.x) * ease * 0.08;
        s.y += (s.ty - s.y) * ease * 0.08;
        s.alpha = Math.min(1, s.alpha + 0.02);

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 107, 157, ${s.alpha * 0.9})`;
        ctx.fill();

        // Soft glow
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 107, 157, ${s.alpha * 0.08})`;
        ctx.fill();
      });

      // Draw connecting lines between adjacent heart stars
      if (heartAnimProgress > 600) {
        const lineAlpha = Math.min(0.2, (heartAnimProgress - 600) / 3000);
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 107, 157, ${lineAlpha})`;
        ctx.lineWidth = 0.8;
        heartStars.forEach((s, i) => {
          if (i === 0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        });
        ctx.closePath();
        ctx.stroke();
      }
    }

    requestAnimationFrame(animate);
  }
  animate();


  // ===== CONFETTI BURST =====
  let confetti = [];

  function burstConfetti() {
    for (let i = 0; i < 120; i++) {
      confetti.push({
        x: W / 2,
        y: H / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: -(Math.random() * 10 + 4),
        r: Math.random() * 6 + 3,
        color: `hsl(${Math.random() * 60 + 320}, 90%, 65%)`, // pinks & purples
        gravity: 0.2,
        alpha: 1,
        decay: Math.random() * 0.012 + 0.004,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12
      });
    }

    function drawConfetti() {
      for (let i = confetti.length - 1; i >= 0; i--) {
        const c = confetti[i];
        c.vy += c.gravity;
        c.x += c.vx;
        c.y += c.vy;
        c.rot += c.rotSpeed;
        c.alpha -= c.decay;
        if (c.alpha <= 0) { confetti.splice(i, 1); continue; }

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot * Math.PI / 180);
        ctx.globalAlpha = c.alpha;
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.r/2, -c.r/2, c.r, c.r * 0.6);
        ctx.restore();
      }
      if (confetti.length > 0) requestAnimationFrame(drawConfetti);
    }
    drawConfetti();
  }


  // ===== SCREEN NAVIGATION =====
  const screenAsk = document.getElementById('screen-ask');
  const screenPick = document.getElementById('screen-pick');
  const screenCountdown = document.getElementById('screen-countdown');

  function goTo(from, to) {
    from.style.opacity = '0';
    from.style.pointerEvents = 'none';
    setTimeout(() => {
      from.classList.remove('active');
      to.classList.add('active');
      // Force reflow for animations
      void to.offsetWidth;
      to.style.opacity = '1';
      to.style.pointerEvents = 'auto';
    }, 600);
  }


  // ===== SCREEN 1: YES / NO =====
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');

  const noTexts = [
    "Are you sure? 🥺",
    "I spent hours coding this! 👉👈",
    "Please? 🙏💕",
    "Error: No is disabled! 😋",
    "But snacks! 🍿",
    "I'll cry... 😢",
    "Boba on me! 🧋✨",
    "Click the other one! 👉",
    "We'd be so cute! 💞"
  ];
  let noCount = 0;

  function dodgeNo() {
    btnNo.innerText = noTexts[noCount % noTexts.length];
    noCount++;

    const parent = btnNo.closest('.button-row');
    const pr = parent.getBoundingClientRect();
    const br = btnNo.getBoundingClientRect();
    const rangeX = (pr.width - br.width) * 0.4;
    const rangeY = Math.min(120, pr.height);
    const dx = (Math.random() - 0.5) * rangeX * 2;
    const dy = (Math.random() - 0.5) * rangeY;

    btnNo.style.transition = 'transform 0.25s ease';
    btnNo.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  btnNo.addEventListener('mouseenter', dodgeNo);
  btnNo.addEventListener('touchstart', e => { e.preventDefault(); dodgeNo(); });

  btnYes.addEventListener('click', () => {
    burstConfetti();
    triggerHeartConstellation();

    // Pre-fill tomorrow 7pm
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    tmrw.setHours(19, 0, 0, 0);
    const iso = new Date(tmrw.getTime() - tmrw.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('date-picker').value = iso;
    targetDate = tmrw;

    goTo(screenAsk, screenPick);
    validate();
  });


  // ===== SCREEN 2: PICK DATE =====
  let selectedActivity = '';
  let targetDate = null;
  let countdownTimer = null;

  const pills = document.querySelectorAll('.option-pill');
  const customWrap = document.getElementById('custom-input-wrap');
  const customInput = document.getElementById('custom-input');
  const datePicker = document.getElementById('date-picker');
  const btnLock = document.getElementById('btn-lock');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      selectedActivity = pill.dataset.option;

      if (selectedActivity.startsWith('Something else')) {
        customWrap.classList.remove('hidden');
        customInput.focus();
      } else {
        customWrap.classList.add('hidden');
      }
      validate();
    });
  });

  customInput.addEventListener('input', validate);
  datePicker.addEventListener('change', e => {
    targetDate = new Date(e.target.value);
    validate();
  });

  function validate() {
    const hasActivity = selectedActivity && (
      !selectedActivity.startsWith('Something else') || customInput.value.trim()
    );
    const hasDate = targetDate && !isNaN(targetDate.getTime());
    btnLock.disabled = !(hasActivity && hasDate);
  }

  btnLock.addEventListener('click', () => {
    if (btnLock.disabled) return;

    let activity = selectedActivity;
    if (activity.startsWith('Something else')) {
      activity = customInput.value.trim() || 'Something special ✨';
    }

    // Summary
    const opts = { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('date-summary').innerText =
      `${activity} — ${targetDate.toLocaleDateString('en-US', opts)}`;

    startCountdown(targetDate);
    burstConfetti();
    goTo(screenPick, screenCountdown);
    playMusic();
  });


  // ===== SCREEN 3: COUNTDOWN =====
  function startCountdown(date) {
    if (countdownTimer) clearInterval(countdownTimer);
    const d = document.getElementById('t-days');
    const h = document.getElementById('t-hours');
    const m = document.getElementById('t-mins');
    const s = document.getElementById('t-secs');

    function tick() {
      const diff = date.getTime() - Date.now();
      if (diff <= 0) {
        clearInterval(countdownTimer);
        d.innerText = h.innerText = m.innerText = s.innerText = '00';
        document.querySelector('.countdown-content h2').innerText = "It's date time! 🎉💖";
        return;
      }
      d.innerText = String(Math.floor(diff / 864e5)).padStart(2, '0');
      h.innerText = String(Math.floor((diff % 864e5) / 36e5)).padStart(2, '0');
      m.innerText = String(Math.floor((diff % 36e5) / 6e4)).padStart(2, '0');
      s.innerText = String(Math.floor((diff % 6e4) / 1e3)).padStart(2, '0');
    }
    tick();
    countdownTimer = setInterval(tick, 1000);
  }


  // ===== MUSIC PLAYER =====
  const audio = document.getElementById('bg-music');
  const btnPlay = document.getElementById('btn-play');
  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');
  const vol = document.getElementById('vol');

  function playMusic() {
    audio.play().then(() => {
      iconPlay.classList.add('hidden');
      iconPause.classList.remove('hidden');
    }).catch(() => {});
  }

  btnPlay.addEventListener('click', () => {
    if (audio.paused) {
      playMusic();
    } else {
      audio.pause();
      iconPlay.classList.remove('hidden');
      iconPause.classList.add('hidden');
    }
  });

  vol.addEventListener('input', e => { audio.volume = e.target.value; });


  // ===== CALENDAR EXPORT =====
  document.getElementById('btn-cal').addEventListener('click', () => {
    if (!targetDate || !selectedActivity) return;
    const fmt = d => d.toISOString().replace(/-|:|\.\d+/g, '');
    const end = new Date(targetDate.getTime() + 2 * 36e5);
    let activity = selectedActivity;
    if (activity.startsWith('Something else')) {
      activity = customInput.value.trim() || 'Something special ✨';
    }

    const ics = [
      'BEGIN:VCALENDAR','VERSION:2.0','CALSCALE:GREGORIAN','BEGIN:VEVENT',
      `SUMMARY:Date: ${activity} 💖`,
      `DESCRIPTION:Our cozy date! ${activity}`,
      `DTSTART:${fmt(targetDate)}`,`DTEND:${fmt(end)}`,
      'LOCATION:Our spot','END:VEVENT','END:VCALENDAR'
    ].join('\r\n');

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'our_date.ics';
    a.click();

    const btn = document.getElementById('btn-cal');
    btn.innerText = 'Saved! ✅';
    setTimeout(() => btn.innerText = '📅 Add to Calendar', 2000);
  });


  // ===== COPY INVITE =====
  document.getElementById('btn-share').addEventListener('click', () => {
    const sum = document.getElementById('date-summary').innerText;
    const text = `It's a date! 💖\n${sum}\nBe there! 👉👈`;
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('btn-share');
      btn.innerText = 'Copied! 💌';
      setTimeout(() => btn.innerText = '💌 Copy Invite', 2000);
    }).catch(() => alert("Copy failed — select text manually!"));
  });

});
