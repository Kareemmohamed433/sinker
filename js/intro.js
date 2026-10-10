/**
 * VANTA Cinematic Intro Reveal Timeline
 * GSAP Powered 4-Scene Synchronized Sequence
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

    this.init();
  }

  init() {
    if (!this.introOverlay) return;

    // Check prefers-reduced-motion
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
    };
    resize();
    window.addEventListener('resize', resize);

    const count = Math.min(window.innerWidth < 768 ? 25 : 60, 60);
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.8 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4 - 0.2,
        alpha: Math.random() * 0.5 + 0.1
      });
    }

    const renderParticles = () => {
      if (!this.animatingParticles) return;
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

      requestAnimationFrame(renderParticles);
    };
    renderParticles();
  }

  bindEvents() {
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => {
        this.skipInstantly();
      });
    }
  }

  buildIntroTimeline() {
    if (typeof gsap === 'undefined') {
      this.skipInstantly();
      return;
    }

    // Disable main scroll during intro
    document.body.classList.add('intro-active');

    this.timeline = gsap.timeline({
      onComplete: () => {
        this.finishIntro();
      }
    });

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
          y: 40,
          scale: 0.8,
          filter: 'blur(10px)'
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out'
        },
        1.2
      );

      // Light sweep across completed wordmark & subtle impact
      this.timeline.to('#intro-wordmark-sweep', {
        x: '150%',
        duration: 0.8,
        ease: 'power2.out'
      }, 2.2);

      this.timeline.to('.intro-wordmark', {
        textShadow: '0 0 40px rgba(255, 255, 255, 0.6), 0 0 80px rgba(200, 220, 255, 0.3)',
        duration: 0.3,
        yoyo: true,
        repeat: 1
      }, 2.4);
    }

    // SCENE 3: 3D Sneaker Reveal (3.0s - 4.5s)
    this.timeline.to('.intro-wordmark', {
      scale: 1.4,
      opacity: 0,
      filter: 'blur(15px)',
      duration: 0.8,
      ease: 'power2.in'
    }, 3.0);

    // Fade out particle canvas gradually
    this.timeline.to('#intro-particles', {
      opacity: 0,
      duration: 1.0
    }, 3.5);

    // Animate sneaker 3D position if viewer exists
    if (window.vantaViewer && window.vantaViewer.sneakerGroup) {
      const group = window.vantaViewer.sneakerGroup;
      group.position.set(0, -2, -5);
      group.scale.set(0.1, 0.1, 0.1);

      this.timeline.to(group.position, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.2,
        ease: 'power3.out'
      }, 3.2);

      this.timeline.to(group.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.2,
        ease: 'back.out(1.2)'
      }, 3.2);
    }

    // SCENE 4: Fade Intro Overlay & Reveal Homepage (4.5s - 5.0s)
    this.timeline.to(this.introOverlay, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut'
    }, 4.4);
  }

  skipInstantly() {
    if (this.timeline) {
      this.timeline.kill();
    }
    this.animatingParticles = false;
    if (this.introOverlay) {
      this.introOverlay.style.display = 'none';
      this.introOverlay.style.opacity = '0';
      this.introOverlay.style.pointerEvents = 'none';
    }
    document.body.classList.remove('intro-active');
    sessionStorage.setItem('vanta_intro_seen', 'true');

    if (window.vantaViewer) {
      window.vantaViewer.isIntroMode = false;
      if (window.vantaViewer.sneakerGroup) {
        window.vantaViewer.sneakerGroup.position.set(0, 0, 0);
      }
    }

    // Trigger homepage GSAP reveals
    document.dispatchEvent(new CustomEvent('vanta:introCompleted'));
  }

  finishIntro() {
    this.animatingParticles = false;
    if (this.introOverlay) {
      this.introOverlay.style.display = 'none';
      this.introOverlay.style.pointerEvents = 'none';
    }
    document.body.classList.remove('intro-active');
    sessionStorage.setItem('vanta_intro_seen', 'true');

    if (window.vantaViewer) {
      window.vantaViewer.isIntroMode = false;
    }

    // Trigger homepage GSAP reveals
    document.dispatchEvent(new CustomEvent('vanta:introCompleted'));
  }
}
