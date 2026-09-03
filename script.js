/* ==========================================================================
   Dineshkumar ♥ Madhumitha - Wedding Invitation JavaScript Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------------
     0. Wedding Intro Experience State Controller (Full-Screen Overlay)
     States: INTRO_LOADING -> INTRO_PLAYING / FALLBACK_WAITING -> INTRO_COMPLETING -> MAIN_WEBSITE
     ------------------------------------------------------------------------ */
  const introOverlay = document.getElementById('wedding-intro');
  const introVideo = document.getElementById('intro-video');
  const introFallback = document.getElementById('intro-fallback');
  const btnOpenInvitation = document.getElementById('btn-open-invitation');
  const btnSkipIntro = document.getElementById('skip-intro-btn');

  let isIntroCompleted = false;

  function initIntro() {
    if (!introOverlay) return;

    // Lock page scrolling during intro
    document.body.style.overflow = 'hidden';

    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      completeIntro();
      return;
    }

    if (introVideo) {
      // Attempt autoplaying video
      const playPromise = introVideo.play();

      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Autoplay succeeded!
          introVideo.style.display = 'block';
          if (introFallback) introFallback.style.display = 'none';
        }).catch(error => {
          // Autoplay blocked or video missing -> Show luxury fallback card
          showFallbackScreen();
        });
      }

      // Handle video ending naturally
      introVideo.addEventListener('ended', () => {
        completeIntro();
      });

      // Handle video error (e.g., file not found)
      introVideo.addEventListener('error', () => {
        showFallbackScreen();
      });
    } else {
      showFallbackScreen();
    }

    // Attach Event Listeners
    if (btnSkipIntro) {
      btnSkipIntro.addEventListener('click', skipIntro);
    }

    if (btnOpenInvitation) {
      btnOpenInvitation.addEventListener('click', () => {
        if (introVideo && introVideo.src) {
          introVideo.play().then(() => {
            if (introFallback) introFallback.style.display = 'none';
          }).catch(() => {
            completeIntro();
          });
        } else {
          completeIntro();
        }
      });
    }
  }

  function showFallbackScreen() {
    if (introVideo) introVideo.style.display = 'none';
    if (introFallback) introFallback.style.display = 'flex';
  }

  function completeIntro() {
    if (isIntroCompleted || !introOverlay) return;
    isIntroCompleted = true;

    // Cinematic 1000ms golden glow & blur fade transition
    introOverlay.classList.add('intro-completing');

    if (introVideo && !introVideo.paused) {
      introVideo.pause();
    }

    setTimeout(() => {
      introOverlay.classList.add('intro-hidden');
      document.body.style.overflow = 'auto';

      // Trigger scroll reveal observers on main website
      triggerInitialReveals();
    }, 1000);
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
     4. Soft Ambient Web Audio Synthesizer (Romantic Background Sound)
     ------------------------------------------------------------------------ */
  const audioBtn = document.getElementById('audio-btn');
  let audioCtx = null;
  let isPlaying = false;
  let synthNodes = [];

  function toggleAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!isPlaying) {
      startAmbientMusic();
      audioBtn.style.background = 'var(--warm-gold)';
      audioBtn.style.color = 'var(--burgundy)';
      isPlaying = true;
    } else {
      stopAmbientMusic();
      audioBtn.style.background = 'linear-gradient(135deg, var(--deep-maroon), var(--burgundy))';
      audioBtn.style.color = 'var(--champagne-gold)';
      isPlaying = false;
    }
  }

  function startAmbientMusic() {
    if (!audioCtx) return;
    
    const frequencies = [261.63, 329.63, 392.00, 523.25];
    
    frequencies.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.setValueAtTime(0.2 + idx * 0.05, audioCtx.currentTime);
      lfoGain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      lfo.connect(gain.gain);
      lfo.start();

      gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.04, audioCtx.currentTime + 2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();

      synthNodes.push({ osc, gain, lfo });
    });
  }

  function stopAmbientMusic() {
    synthNodes.forEach(({ osc, gain, lfo }) => {
      if (gain && audioCtx) {
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
        setTimeout(() => {
          try {
            osc.stop();
            lfo.stop();
          } catch(e) {}
        }, 1000);
      }
    });
    synthNodes = [];
  }

  if (audioBtn) {
    audioBtn.addEventListener('click', toggleAudio);
  }

});
