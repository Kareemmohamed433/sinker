/**
 * VANTA Application Master Orchestrator
 * Bootstraps modules, manages global UI state, custom cursor, smooth scrolls, and GSAP scroll triggers
 */

class VantaApplication {
  constructor() {
    this.toastContainer = null;
    this.init();
  }

  init() {
    this.createToastContainer();
    this.initCustomCursor();
    this.initStickyHeader();
    this.initMobileMenu();
    this.initSearchModal();
    this.initSmoothScrolls();
    this.initNewsletterForm();
    this.initScrollAnimations();

    // Bootstrap Sub-Modules when DOM ready
    window.addEventListener('DOMContentLoaded', () => {
      // 1. Instantiate 3D Sneaker
      window.vantaViewer = new Sneaker3DViewer('sneaker-3d-container');

      // 2. Instantiate Intro
      window.vantaIntro = new VantaCinematicIntro();

      // 3. Instantiate E-Commerce Core
      window.vantaCart = new VantaCart();
      window.vantaWishlist = new VantaWishlist();
      window.vantaCatalog = new VantaCatalog();
      window.vantaCheckout = new VantaCheckout();

      // Initialize Lucide Icons
      if (window.lucide) {
        window.lucide.createIcons();
      }
    });
  }

  createToastContainer() {
    this.toastContainer = document.createElement('div');
    this.toastContainer.id = 'vanta-toast-container';
    this.toastContainer.className = 'vanta-toast-container';
    document.body.appendChild(this.toastContainer);
  }

  showToast(message, type = 'success') {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `vanta-toast toast-${type}`;

    let iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-circle';
    if (type === 'info') iconName = 'info';

    toast.innerHTML = `
      <i data-lucide="${iconName}"></i>
      <span>${message}</span>
    `;

    this.toastContainer.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    // Trigger entrance
    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });

    // Auto dismiss
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3500);
  }

  initCustomCursor() {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return; // Disable custom cursor on mobile touch

    const cursor = document.createElement('div');
    cursor.id = 'vanta-cursor';
    cursor.className = 'vanta-cursor';

    const dot = document.createElement('div');
    dot.id = 'vanta-cursor-dot';
    dot.className = 'vanta-cursor-dot';

    document.body.appendChild(cursor);
    document.body.appendChild(dot);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    });

    const renderCursor = () => {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;

      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      requestAnimationFrame(renderCursor);
    };
    renderCursor();

    // Hover scale effect over interactive elements
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, input, select, .product-card, #sneaker-3d-container')) {
        cursor.classList.add('hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, input, select, .product-card, #sneaker-3d-container')) {
        cursor.classList.remove('hover');
      }
    });
  }

  initStickyHeader() {
    const header = document.querySelector('.vanta-nav');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-btn');
    const drawer = document.getElementById('mobile-menu-drawer');
    const overlay = document.getElementById('mobile-menu-overlay');
    const closeBtn = document.getElementById('close-mobile-menu-btn');

    if (!toggleBtn || !drawer) return;

    const openMenu = () => {
      drawer.classList.add('active');
      if (overlay) overlay.classList.add('active');
      document.body.classList.add('drawer-open');
    };

    const closeMenu = () => {
      drawer.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      document.body.classList.remove('drawer-open');
    };

    toggleBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);

    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  }

  initSearchModal() {
    const modal = document.getElementById('search-modal');
    const overlay = document.getElementById('search-modal-overlay');
    const openBtns = document.querySelectorAll('.open-search-btn');
    const closeBtn = document.getElementById('close-search-btn');
    const searchInput = document.getElementById('header-search-input');

    if (!modal) return;

    const openSearch = () => {
      modal.classList.add('active');
      if (overlay) overlay.classList.add('active');
      document.body.classList.add('modal-open');
      if (searchInput) setTimeout(() => searchInput.focus(), 100);
    };

    const closeSearch = () => {
      modal.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      document.body.classList.remove('modal-open');
    };

    openBtns.forEach((btn) => btn.addEventListener('click', openSearch));
    if (closeBtn) closeBtn.addEventListener('click', closeSearch);
    if (overlay) overlay.addEventListener('click', closeSearch);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeSearch();
      }
    });
  }

  initSmoothScrolls() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElem = document.querySelector(targetId);
        if (targetElem) {
          e.preventDefault();
          targetElem.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        this.showToast(`Thank you for subscribing to VANTA keynotes with ${input.value}.`, 'success');
        input.value = '';
      }
    });
  }

  initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Fade up reveals for sections
    document.querySelectorAll('.gsap-fade-up').forEach((elem) => {
      gsap.fromTo(
        elem,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: elem,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // Stagger reveal for feature cards
    document.querySelectorAll('.gsap-stagger-group').forEach((group) => {
      const children = group.children;
      if (children.length > 0) {
        gsap.fromTo(
          children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: group,
              start: 'top 85%'
            }
          }
        );
      }
    });
  }
}

// Instantiate master app
window.vantaApp = new VantaApplication();
