/* ==========================================================================
   Dineshkumar ♥ Madhumitha - Wedding Invitation JavaScript Logic
   ========================================================================== */

/* ==========================================================================
   Wedding Intro Controller
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const introOverlay      = document.getElementById('wedding-intro');
  const introVideo        = document.getElementById('intro-video');
  const introFallback     = document.getElementById('intro-fallback');
  const btnOpenInvitation = document.getElementById('btn-open-invitation');
  const btnSkipIntro      = document.getElementById('skip-intro-btn');

  let isIntroCompleted = false;

  /* ---- Scroll lock helpers ---- */
  let savedScrollY = 0;

  function lockScroll() {
    savedScrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top      = `-${savedScrollY}px`;
    document.body.style.width    = '100%';
    document.body.style.left     = '0';
    
    // Block scroll interaction
    window.addEventListener('wheel', preventDefault, { passive: false });
    window.addEventListener('touchmove', preventDefault, { passive: false });
    window.addEventListener('keydown', preventKeys, false);
  }

  function unlockScroll() {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top      = '';
    document.body.style.width    = '';
    document.body.style.left     = '';
    // Always start from the top after the intro
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    window.removeEventListener('wheel', preventDefault);
    window.removeEventListener('touchmove', preventDefault);
    window.removeEventListener('keydown', preventKeys);
  }

  function preventDefault(e) { e.preventDefault(); }
  function preventKeys(e) {
    if (['ArrowUp', 'ArrowDown', 'Space', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.code)) {
      e.preventDefault();
    }
  }

  function initIntro() {
    if (!introOverlay) return;
    lockScroll();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) { completeIntro(); return; }

    const doorStage    = document.getElementById('door-stage');
    const revealCard   = document.getElementById('temple-reveal');
    const tapBtn       = document.getElementById('temple-tap-btn');
    const sparksCanvas = document.getElementById('door-sparks');

    /* ---- Gold spark burst on open ---- */
    function burstSparks() {
      if (!sparksCanvas) return;
      sparksCanvas.width  = window.innerWidth;
      sparksCanvas.height = window.innerHeight;
      const ctx = sparksCanvas.getContext('2d');
      const cx  = sparksCanvas.width  / 2;
      const cy  = sparksCanvas.height / 2;
      const particles = Array.from({ length: 80 }, () => ({
        x: cx, y: cy,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14,
        alpha: 1,
        size: Math.random() * 4 + 2,
        hue: Math.random() * 30 + 30
      }));
      let frame;
      (function draw() {
        ctx.clearRect(0, 0, sparksCanvas.width, sparksCanvas.height);
        let alive = false;
        for (const p of particles) {
          if (p.alpha <= 0) continue;
          alive = true;
          p.x += p.vx; p.y += p.vy;
          p.vx *= 0.95; p.vy *= 0.95;
          p.alpha -= 0.025;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = `hsl(${p.hue}, 90%, 65%)`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = `hsl(${p.hue}, 90%, 70%)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        if (alive) frame = requestAnimationFrame(draw);
      })();
    }

    function openDoors() {
      if (isIntroCompleted) return;
      // Start background audio on user interaction
      playAudio();
      // Swing the doors open
      if (doorStage) doorStage.classList.add('open');
      burstSparks();
      // Navigate to hero section as soon as doors finish swinging
      setTimeout(completeIntro, 900);
    }

    // Attach click to entire stage and tap button
    if (doorStage)  doorStage.addEventListener('click', (e) => {
      if (!e.target.closest('#skip-intro-btn')) openDoors();
    });
    if (tapBtn) tapBtn.addEventListener('click', (e) => { e.stopPropagation(); openDoors(); });

    if (btnSkipIntro) btnSkipIntro.addEventListener('click', (e) => {
      e.stopPropagation(); skipIntro();
    });
  }

  function showFallbackScreen() {
    if (introVideo) introVideo.style.display = 'none';
    if (introFallback) introFallback.style.display = 'flex';
  }

  function completeIntro() {
    if (isIntroCompleted || !introOverlay) return;
    isIntroCompleted = true;

    // Cinematic golden glow & blur fade transition
    introOverlay.classList.add('intro-completing');

    if (introVideo && !introVideo.paused) {
      introVideo.pause();
    }

    setTimeout(() => {
      introOverlay.classList.add('intro-hidden');
      unlockScroll();           // restore scroll & jump to top

      // Trigger scroll reveal observers on main website
      triggerInitialReveals();
    }, 600);
  }

  function skipIntro() {
    completeIntro();
  }

  initIntro();

  /* ------------------------------------------------------------------------
     1. Scroll-Triggered Reveal Animations (Intersection Observer)
     ------------------------------------------------------------------------ */
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.12
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, observerOptions);

  function triggerInitialReveals() {
    revealElements.forEach(el => revealObserver.observe(el));
  }

  // Trigger reveals if intro is skipped or finished
  triggerInitialReveals();

  /* ------------------------------------------------------------------------
     2. Dynamic Real-Time Countdown Timer
     Target Date: 17 September 2026, 9:00 AM (Browser Local Timezone)
     ------------------------------------------------------------------------ */
  const targetDate = new Date(2026, 8, 17, 9, 0, 0); // Note: Month is 0-indexed (8 = September)

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const countdownGridEl = document.getElementById('countdown-grid');
  const countdownFinishedEl = document.getElementById('countdown-finished');

  function updateCountdown() {
    const now = new Date();
    const timeDiff = targetDate - now;

    if (timeDiff <= 0) {
      if (countdownGridEl) countdownGridEl.style.display = 'none';
      if (countdownFinishedEl) countdownFinishedEl.style.display = 'block';
      return;
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    const formattedDays = String(days).padStart(2, '0');
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    if (daysEl && daysEl.textContent !== formattedDays) daysEl.textContent = formattedDays;
    if (hoursEl && hoursEl.textContent !== formattedHours) hoursEl.textContent = formattedHours;
    if (minutesEl && minutesEl.textContent !== formattedMinutes) minutesEl.textContent = formattedMinutes;
    
    if (secondsEl && secondsEl.textContent !== formattedSeconds) {
      secondsEl.textContent = formattedSeconds;
      secondsEl.classList.remove('tick');
      void secondsEl.offsetWidth; // trigger reflow
      secondsEl.classList.add('tick');
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ------------------------------------------------------------------------
     3. Floating Petal Canvas Animation
     ------------------------------------------------------------------------ */
  const canvas = document.getElementById('petals-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const numPetals = window.innerWidth < 768 ? 16 : 30;
    const petals = [];

    class Petal {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = -20 - Math.random() * 50;
        this.size = Math.random() * 10 + 8;
        this.speedY = Math.random() * 1.2 + 0.6;
        this.speedX = Math.random() * 0.8 - 0.4;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 1.5;
        this.opacity = Math.random() * 0.5 + 0.35;
        this.isGold = Math.random() > 0.7;
        this.color = this.isGold ? '#DA8F25' : '#D8A7B1';
      }

      update() {
        this.y += this.speedY;
        this.x += Math.sin(this.y * 0.01) + this.speedX;
        this.rotation += this.rotationSpeed;

        if (this.y > height + 20) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;

        ctx.beginPath();
        if (this.isGold) {
          ctx.arc(0, 0, this.size / 4, 0, Math.PI * 2);
        } else {
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size, this.size / 3, 0, this.size);
          ctx.bezierCurveTo(this.size, this.size / 3, this.size / 2, -this.size / 2, 0, 0);
        }
        ctx.fill();
        ctx.restore();
      }
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
      for (let i = 0; i < numPetals; i++) {
        petals.push(new Petal());
      }

      function animatePetals() {
        ctx.clearRect(0, 0, width, height);
        petals.forEach(p => {
          p.update();
          p.draw();
        });
        requestAnimationFrame(animatePetals);
      }

      animatePetals();
    }
  }

  /* ------------------------------------------------------------------------
     4. Background Audio Player & Toggle
     ------------------------------------------------------------------------ */
  const bgMusic  = document.getElementById('bg-music');
  const audioBtn = document.getElementById('audio-btn');
  let isPlaying = false;

  function playAudio() {
    if (!bgMusic) return;
    bgMusic.play().then(() => {
      isPlaying = true;
      updateAudioBtnState();
    }).catch(err => {
      console.log('Audio playback waiting for user gesture:', err);
    });
  }

  function pauseAudio() {
    if (!bgMusic) return;
    bgMusic.pause();
    isPlaying = false;
    updateAudioBtnState();
  }

  function toggleAudio() {
    if (bgMusic && !bgMusic.paused) {
      pauseAudio();
    } else {
      playAudio();
    }
  }

  function updateAudioBtnState() {
    if (!audioBtn) return;
    if (bgMusic && !bgMusic.paused) {
      audioBtn.classList.add('playing');
      audioBtn.setAttribute('title', 'Mute Music');
      audioBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>`;
    } else {
      audioBtn.classList.remove('playing');
      audioBtn.setAttribute('title', 'Play Music');
      audioBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.27 3L3 4.27l9 9v.28c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.28.04-.55.1-.81L19.73 21 21 19.73 4.27 3zM14 7h4V3h-6v5.18l2 2V7z"/>
        </svg>`;
    }
  }

  if (audioBtn) {
    audioBtn.addEventListener('click', toggleAudio);
  }

});
