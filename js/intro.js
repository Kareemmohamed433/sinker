/**
 * VANTA Cinematic Intro Reveal Timeline — Mobile Responsive Edition
 * GSAP Powered 4-Scene Synchronized Sequence
 * Features: Dynamic dvh Viewport Adaptability, 60fps Mobile Particle Count, 
 * Responsive Letter Stagger, Tap-Friendly Skip Control & Reduced Motion Support.
 */

class VantaCinematicIntro {
  constructor() {
    this.introOverlay = document.getElementById('intro-overlay');
    this.skipBtn = document.getElementById('skip-intro-btn');
    this.timeline = null;
    this.particleCanvas = document.getElementById('intro-particles');
    this.particleCtx = this.particleCanvas ? this.particleCanvas.getContext('2d') : null;
    this.particles = [];
    this.animatingParticles = true;
    this.animFrameId = null;
    this.isMobile = window.innerWidth < 768;

    this.init();
  }

  init() {
    if (!this.introOverlay) return;

    // Check prefers-reduced-motion and sessionStorage
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sessionSeen = sessionStorage.getItem('vanta_intro_seen');

    if (sessionSeen === 'true' || reducedMotion) {
      this.skipInstantly();
      return;
    }

    this.setupParticleSystem();
    this.bindEvents();
    this.buildIntroTimeline();
  }

  setupParticleSystem() {
    if (!this.particleCanvas || !this.particleCtx) return;

    const resize = () => {
      this.particleCanvas.width = window.innerWidth;
      this.particleCanvas.height = window.innerHeight;
      this.isMobile = window.innerWidth < 768;
    };
    resize();
    window.addEventListener('resize', resize);

    // Optimized mobile particle count for 60fps rendering without GPU heat
    const count = this.isMobile ? 18 : 50;
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * (this.isMobile ? 1.4 : 1.8) + 0.5,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.35 - 0.15,
        alpha: Math.random() * 0.45 + 0.1
      });
    }

    const renderParticles = () => {
      if (!this.animatingParticles || !this.particleCtx) return;
      this.particleCtx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);

      this.particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = this.particleCanvas.width;
        if (p.x > this.particleCanvas.width) p.x = 0;
        if (p.y < 0) p.y = this.particleCanvas.height;
        if (p.y > this.particleCanvas.height) p.y = 0;

        this.particleCtx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        this.particleCtx.beginPath();
        this.particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.particleCtx.fill();
      });

      this.animFrameId = requestAnimationFrame(renderParticles);
    };
    renderParticles();
  }

  bindEvents() {
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => {
        this.skipInstantly();
      });

      // Mobile Touch feedback
      this.skipBtn.addEventListener('touchstart', () => {
        this.skipBtn.style.opacity = '0.7';
      }, { passive: true });
      this.skipBtn.addEventListener('touchend', () => {
        this.skipBtn.style.opacity = '1';
      }, { passive: true });
    }
  }

  buildIntroTimeline() {
    if (typeof gsap === 'undefined') {
      this.skipInstantly();
      return;
    }

    // Lock page scroll & touch interaction during intro
    document.body.classList.add('intro-active');

    this.timeline = gsap.timeline({
      onComplete: () => {
        this.finishIntro();
      }
    });

    const isMobile = this.isMobile;
    const yShift = isMobile ? 24 : 40;

    // SCENE 1: Total Darkness & Metallic Light Sweep (0.0s - 1.5s)
    this.timeline
      .to('#intro-light-beam', {
        x: '200%',
        duration: 1.5,
        ease: 'power2.inOut'
      })
      .to('.intro-particle-layer', {
        opacity: 0.8,
        duration: 1.0
      }, 0);

    // SCENE 2: VANTA Letter Reveal (1.5s - 3.0s)
    const letters = document.querySelectorAll('.intro-logo-letter');
    if (letters.length > 0) {
      this.timeline.fromTo(
        letters,
        {
          opacity: 0,
          y: yShift,
          scale: 0.85,
          filter: 'blur(8px)'
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.75,
          stagger: 0.1,
          ease: 'power3.out'
        },
        1.2
      );

      // Light sweep across completed wordmark
      this.timeline.to('#intro-wordmark-sweep', {
        x: '150%',
        duration: 0.75,
        ease: 'power2.out'
      }, 2.1);

      this.timeline.to('.intro-wordmark', {
        textShadow: '0 0 30px rgba(255, 255, 255, 0.6), 0 0 60px rgba(200, 220, 255, 0.3)',
        duration: 0.3,
        yoyo: true,
        repeat: 1
      }, 2.3);
    }

    // SCENE 3: Hero Sneaker Visual Reveal (3.0s - 4.5s)
    this.timeline.to('.intro-wordmark', {
      scale: 1.3,
      opacity: 0,
      filter: 'blur(12px)',
      duration: 0.75,
      ease: 'power2.in'
    }, 2.9);

    // Fade out particle canvas
    this.timeline.to('#intro-particles', {
      opacity: 0,
      duration: 0.8
    }, 3.3);

    // Animate Hero Sneaker Visual Showcase
    const heroShowcase = document.getElementById('hero-sneaker-showcase');
    if (heroShowcase) {
      this.timeline.fromTo(
        heroShowcase,
        {
          opacity: 0,
          scale: 0.88,
          y: 35
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out'
        },
        3.1
      );
    }

    // SCENE 4: Fade Intro Overlay & Reveal Homepage (4.5s - 5.0s)
    this.timeline.to(this.introOverlay, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut'
    }, 4.3);
  }

  skipInstantly() {
    if (this.timeline) {
      this.timeline.kill();
    }
    this.animatingParticles = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }

    if (this.introOverlay) {
      this.introOverlay.style.display = 'none';
      this.introOverlay.style.opacity = '0';
      this.introOverlay.style.pointerEvents = 'none';
    }
    document.body.classList.remove('intro-active');
    sessionStorage.setItem('vanta_intro_seen', 'true');

    const heroShowcase = document.getElementById('hero-sneaker-showcase');
    if (heroShowcase) {
      heroShowcase.style.opacity = '1';
      heroShowcase.style.transform = 'none';
    }

    document.dispatchEvent(new CustomEvent('vanta:introCompleted'));
  }

  finishIntro() {
    this.animatingParticles = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }

    if (this.introOverlay) {
      this.introOverlay.style.display = 'none';
      this.introOverlay.style.pointerEvents = 'none';
    }
    document.body.classList.remove('intro-active');
    sessionStorage.setItem('vanta_intro_seen', 'true');

    const heroShowcase = document.getElementById('hero-sneaker-showcase');
    if (heroShowcase) {
      heroShowcase.style.opacity = '1';
      heroShowcase.style.transform = 'none';
    }

    document.dispatchEvent(new CustomEvent('vanta:introCompleted'));
  }
}
