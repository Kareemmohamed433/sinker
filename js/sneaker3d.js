/**
 * VANTA 3D Sneaker Viewer — Mobile & Responsive Master Edition
 * Powered by Three.js & GLTFLoader
 * Optimized specifically for all Mobile screens (320px - 430px), Tablets, and Desktops.
 * Features: Adaptive Mobile Framing, 60fps Mobile Performance, Touch-Friendly Drag,
 * Zero Edge Clipping, Dynamic Orbital Light Rings, and prefers-reduced-motion support.
 */

class Sneaker3DViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.sneakerGroup = null;
    this.sneakerMesh = null;
    this.orbitalGroup = null;
    this.orbitRings = [];
    this.orbitLights = [];
    this.lights = {};
    this.shadowPlane = null;
    this.particleCloud = null;

    // Mobile & Device Detection
    this.isMobile = this.detectMobile();
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Interaction & Animation State
    this.isDragging = false;
    this.previousPointer = { x: 0, y: 0 };
    this.pointerParallax = { x: 0, y: 0 };
    this.targetParallax = { x: 0, y: 0 };
    this.targetRotation = { x: 0.12, y: -0.55 };
    this.currentRotation = { x: 0.12, y: -0.55 };
    this.autoRotateSpeed = 0.003;
    this.isAutoRotating = true;
    this.isIntroMode = true;
    this.isVisible = true;
    this.animationFrameId = null;

    this.init();
  }

  detectMobile() {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth < 768
    );
  }

  init() {
    if (!this.isWebGLAvailable()) {
      this.showFallback('WebGL is not supported on this browser/device.');
      return;
    }

    // 1. Create Scene — Fog matches dark luxury background #070709
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070709, 0.025);

    // 2. Create Camera with Mobile Adaptive FOV & Positioning
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || 500;
    const aspect = width / height;

    // Calculate mobile portrait vs desktop camera position
    const initialFov = aspect < 1.0 ? 46 : 40;
    const initialCamZ = aspect < 1.0 ? 4.4 : 4.8;

    this.camera = new THREE.PerspectiveCamera(initialFov, aspect, 0.1, 100);
    this.camera.position.set(0, aspect < 1.0 ? 0.05 : 0.1, initialCamZ);

    // 3. Create Renderer — Explicit 100% Transparency & Mobile DPR Cap
    const canvas = document.getElementById('sneaker-canvas') || document.createElement('canvas');
    if (!canvas.id) {
      canvas.id = 'sneaker-canvas';
      this.container.appendChild(canvas);
    }
    canvas.style.background = 'transparent';

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2.0));
    this.renderer.setClearColor(0x000000, 0); // 100% transparent clear background

    // Performance Optimization: Scaled shadow map resolution for Mobile vs Desktop
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    // 4. Main Group for Sneaker transforms & reveals
    this.sneakerGroup = new THREE.Group();
    this.scene.add(this.sneakerGroup);

    // 5. Setup Studio Lighting System
    this.setupLighting();

    // 6. Setup Glowing Orbital Light Rings
    this.setupOrbitalRings();

    // 7. Setup Soft Contact Shadow
    this.setupGroundEffects();

    // 8. Setup Background Dust Particles
    this.setupParticleCloud();

    // 9. Load GLB Model
    this.loadModel();

    // 10. Event Listeners for Touch, Mouse & Responsiveness
    this.bindEvents();

    // 11. Start Render Loop
    this.animate();
  }

  isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  setupLighting() {
    const shadowRes = this.isMobile ? 512 : 1024;

    // 1. Ambient Lighting
    const ambient = new THREE.AmbientLight(0x22222d, 1.3);
    this.scene.add(ambient);

    // 2. Front Key Spotlight
    const keySpot = new THREE.SpotLight(0xffffff, 4.5);
    keySpot.position.set(3, 4.5, 4);
    keySpot.angle = Math.PI / 3.5;
    keySpot.penumbra = 0.85;
    keySpot.castShadow = true;
    keySpot.shadow.mapSize.width = shadowRes;
    keySpot.shadow.mapSize.height = shadowRes;
    keySpot.shadow.bias = -0.0001;
    this.scene.add(keySpot);
    this.lights.keySpot = keySpot;

    // 3. Moving Studio Light Sweep
    const sweepingSpot = new THREE.SpotLight(0xdce6ff, 3.2);
    sweepingSpot.position.set(-4, 4, 3);
    sweepingSpot.angle = Math.PI / 4;
    sweepingSpot.penumbra = 0.9;
    this.scene.add(sweepingSpot);
    this.lights.sweepingSpot = sweepingSpot;

    // 4. Cool Silver Rim Light (Behind Sneaker)
    const rimLight = new THREE.DirectionalLight(0xc0d2ff, 3.8);
    rimLight.position.set(0, 4.5, -4.5);
    this.scene.add(rimLight);
    this.lights.rimLight = rimLight;

    // 5. Left & Right Side Fill Lights
    const leftFill = new THREE.DirectionalLight(0x808a9c, 1.8);
    leftFill.position.set(-4.5, 2, 2.5);
    this.scene.add(leftFill);

    const rightFill = new THREE.DirectionalLight(0xced8f0, 2.0);
    rightFill.position.set(4.5, 2, 2.5);
    this.scene.add(rightFill);
  }

  setupOrbitalRings() {
    this.orbitalGroup = new THREE.Group();
    this.sneakerGroup.add(this.orbitalGroup);

    // Optimized Ring Radii to guarantee zero edge clipping on mobile & desktop
    const ringConfigs = [
      { radius: 1.25, tube: 0.013, rotX: Math.PI / 4, rotY: Math.PI / 6, rotZ: 0, color: 0xffffff, emissive: 0xe0eaff },
      { radius: 1.42, tube: 0.011, rotX: -Math.PI / 3, rotY: Math.PI / 4, rotZ: Math.PI / 8, color: 0xf0f4ff, emissive: 0xc8d8ff },
      { radius: 1.58, tube: 0.012, rotX: Math.PI / 6, rotY: -Math.PI / 3, rotZ: -Math.PI / 4, color: 0xffffff, emissive: 0xe6f0ff }
    ];

    ringConfigs.forEach((cfg) => {
      const ringGroup = new THREE.Group();
      ringGroup.rotation.set(cfg.rotX, cfg.rotY, cfg.rotZ);

      // Inner Core Ring
      const coreGeo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 32, 96);
      const coreMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.emissive,
        emissiveIntensity: 3.2,
        roughness: 0.15,
        metalness: 0.85
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      ringGroup.add(coreMesh);

      // Outer Translucent Glow Tube (Soft halo bloom shell)
      const haloGeo = new THREE.TorusGeometry(cfg.radius, cfg.tube * 2.2, 16, 64);
      const haloMat = new THREE.MeshBasicMaterial({
        color: cfg.emissive,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      ringGroup.add(haloMesh);

      // Light tracking along orbit for dynamic reflections
      const orbitLight = new THREE.PointLight(cfg.emissive, 1.2, 4.0);
      orbitLight.position.set(cfg.radius, 0, 0);
      ringGroup.add(orbitLight);

      this.orbitalGroup.add(ringGroup);
      this.orbitRings.push(ringGroup);
      this.orbitLights.push(orbitLight);
    });
  }

  setupGroundEffects() {
    // Soft Contact Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(6, 6);
    
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(256, 256, 5, 256, 256, 180);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
    grad.addColorStop(0.3, 'rgba(0, 0, 0, 0.35)');
    grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.08)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    const shadowTex = new THREE.CanvasTexture(canvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });

    this.shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowPlane.rotation.x = -Math.PI / 2;
    this.shadowPlane.position.y = -0.85;
    this.scene.add(this.shadowPlane);

    // Soft Backplane Glow Disc
    const auraCanvas = document.createElement('canvas');
    auraCanvas.width = 256;
    auraCanvas.height = 256;
    const auraCtx = auraCanvas.getContext('2d');
    const auraGrad = auraCtx.createRadialGradient(128, 128, 5, 128, 128, 110);
    auraGrad.addColorStop(0, 'rgba(210, 225, 255, 0.12)');
    auraGrad.addColorStop(0.5, 'rgba(150, 170, 220, 0.03)');
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    auraCtx.fillStyle = auraGrad;
    auraCtx.fillRect(0, 0, 256, 256);

    const auraTex = new THREE.CanvasTexture(auraCanvas);
    const auraMat = new THREE.MeshBasicMaterial({
      map: auraTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const auraMesh = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), auraMat);
    auraMesh.position.set(0, 0.1, -2.0);
    this.scene.add(auraMesh);
  }

  setupParticleCloud() {
    // Reduced particle count for high mobile performance
    const particleCount = this.isMobile ? 30 : 55;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xc8d2e8,
      size: 0.035,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particleCloud = new THREE.Points(geometry, material);
    this.scene.add(this.particleCloud);
  }

  loadModel() {
    const loader = new THREE.GLTFLoader();
    const modelPath = 'assets/models/sneaker.glb';

    const loaderElem = document.getElementById('sneaker-loading');
    if (loaderElem) loaderElem.style.display = 'flex';

    loader.load(
      modelPath,
      (gltf) => {
        this.sneakerMesh = gltf.scene;

        // Auto-center geometry
        const box = new THREE.Box3().setFromObject(this.sneakerMesh);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        this.sneakerMesh.position.x = -center.x;
        this.sneakerMesh.position.y = -center.y;
        this.sneakerMesh.position.z = -center.z;

        // Responsive model scaling
        const maxDim = Math.max(size.x, size.y, size.z);
        const baseTarget = window.innerWidth < 480 ? 2.3 : (window.innerWidth < 768 ? 2.5 : 2.75);
        const scaleFactor = baseTarget / (maxDim || 1);
        this.sneakerMesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Adjust shadow plane height according to sneaker size
        const scaledHeight = size.y * scaleFactor;
        this.shadowPlane.position.y = -(scaledHeight / 2) - 0.04;

        // Material setup to preserve true dark obsidian mesh & chrome silver accents
        this.sneakerMesh.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.material) {
              child.material.envMapIntensity = 1.4;
              if (child.material.roughness !== undefined) {
                child.material.roughness = Math.max(0.25, Math.min(child.material.roughness, 0.5));
              }
              if (child.material.metalness !== undefined) {
                child.material.metalness = Math.min(child.material.metalness, 0.85);
              }
            }
          }
        });

        this.sneakerGroup.add(this.sneakerMesh);

        if (loaderElem) loaderElem.style.display = 'none';
        document.dispatchEvent(new CustomEvent('vanta:modelLoaded'));
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          const percentElem = document.getElementById('sneaker-loading-text');
          if (percentElem) percentElem.textContent = `LOADING SNEAKER ${percent}%`;
        }
      },
      (error) => {
        console.warn('Could not load 3D GLB model:', error);
        if (loaderElem) loaderElem.style.display = 'none';
        this.showFallback('3D Model failed to load. Displaying 2D showcase.');
      }
    );
  }

  showFallback(msg) {
    console.log('3D Fallback active:', msg);
    const canvas = document.getElementById('sneaker-canvas');
    if (canvas) canvas.style.display = 'none';

    let fallbackBox = document.getElementById('sneaker-fallback');
    if (!fallbackBox) {
      fallbackBox = document.createElement('div');
      fallbackBox.id = 'sneaker-fallback';
      fallbackBox.className = 'sneaker-fallback-container';
      fallbackBox.innerHTML = `
        <img src="assets/images/vanta_core.jpg" alt="VANTA Core 3D Sneaker" class="fallback-hero-img" />
        <div class="fallback-badge">VANTA CORE 3D SHOWCASE</div>
      `;
      this.container.appendChild(fallbackBox);
    }
  }

  bindEvents() {
    const el = this.container;

    // Desktop Mouse Parallax (Disabled on Touch Devices)
    if (!this.isTouchDevice) {
      window.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        this.targetParallax.x = ((e.clientX - centerX) / window.innerWidth) * 0.25;
        this.targetParallax.y = ((e.clientY - centerY) / window.innerHeight) * 0.18;
      });
    }

    // Pointer Drag Interactions for Desktop
    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') {
        this.isDragging = true;
        this.isAutoRotating = false;
        this.previousPointer = { x: e.clientX, y: e.clientY };
        el.style.cursor = 'grabbing';
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging || e.pointerType !== 'mouse') return;
      const deltaX = e.clientX - this.previousPointer.x;
      const deltaY = e.clientY - this.previousPointer.y;

      this.targetRotation.y += deltaX * 0.008;
      this.targetRotation.x += deltaY * 0.005;
      this.targetRotation.x = Math.max(-0.6, Math.min(0.8, this.targetRotation.x));

      this.previousPointer = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointerup', (e) => {
      if (this.isDragging && e.pointerType === 'mouse') {
        this.isDragging = false;
        el.style.cursor = 'grab';
        clearTimeout(this.autoRotateTimeout);
        this.autoRotateTimeout = setTimeout(() => {
          this.isAutoRotating = true;
        }, 3000);
      }
    });

    // Touch-Friendly Drag Interactions for Mobile Phones
    let touchStartX = 0;
    let touchStartY = 0;

    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.isAutoRotating = false;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        this.previousPointer = { x: touchStartX, y: touchStartY };
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - this.previousPointer.x;
      const deltaY = currentY - this.previousPointer.y;

      // Smooth Touch Drag Rotation with inertia
      this.targetRotation.y += deltaX * 0.008;
      this.targetRotation.x += deltaY * 0.005;
      this.targetRotation.x = Math.max(-0.5, Math.min(0.7, this.targetRotation.x));

      this.previousPointer = { x: currentX, y: currentY };
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (this.isDragging) {
        this.isDragging = false;
        clearTimeout(this.autoRotateTimeout);
        this.autoRotateTimeout = setTimeout(() => {
          this.isAutoRotating = true;
        }, 3000);
      }
    });

    // Responsive Window Resize Handler
    window.addEventListener('resize', () => this.onWindowResize());

    // Page Visibility Handler
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
    });

    // IntersectionObserver for Hero Canvas (Pause render when hero out of view)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.isVisible = entry.isIntersecting && !document.hidden;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(this.container);
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || 500;
    const aspect = width / height;

    // Update Mobile vs Desktop FOV & Camera Z position dynamically
    if (aspect < 1.0) {
      // Mobile Portrait (320px - 430px)
      this.camera.fov = width < 380 ? 48 : 45;
      this.camera.position.z = width < 380 ? 4.2 : 4.4;
      this.camera.position.y = 0.05;
    } else {
      // Desktop & Landscape
      this.camera.fov = 40;
      this.camera.position.z = 4.8;
      this.camera.position.y = 0.1;
    }

    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2.0));
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    if (!this.isVisible || !this.renderer || !this.scene || !this.camera) return;

    const time = Date.now() * 0.001;

    // 1. Moving Studio Spotlight Sweep
    if (this.lights.sweepingSpot) {
      this.lights.sweepingSpot.position.x = Math.sin(time * 0.5) * 5;
      this.lights.sweepingSpot.position.z = Math.cos(time * 0.5) * 3 + 3.0;
    }

    // 2. Animate Glowing Orbital Light Rings
    if (this.orbitRings && this.orbitRings.length === 3) {
      this.orbitRings[0].rotation.y = time * 0.35;
      this.orbitRings[0].rotation.z = Math.sin(time * 0.2) * 0.1;

      this.orbitRings[1].rotation.x = time * -0.25;
      this.orbitRings[1].rotation.y = time * 0.45;

      this.orbitRings[2].rotation.z = time * 0.3;
      this.orbitRings[2].rotation.y = time * -0.2;

      this.orbitLights.forEach((light, i) => {
        const radius = [1.25, 1.42, 1.58][i];
        const angle = time * (0.8 + i * 0.3);
        light.position.x = Math.cos(angle) * radius;
        light.position.y = Math.sin(angle) * radius;
      });
    }

    // 3. Animate Dust Particles
    if (this.particleCloud) {
      this.particleCloud.rotation.y = time * 0.03;
      const positions = this.particleCloud.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += Math.sin(time + i) * 0.0012;
      }
      this.particleCloud.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Sneaker Transforms & Floating Animations
    if (this.sneakerGroup) {
      if (!this.isTouchDevice) {
        this.pointerParallax.x += (this.targetParallax.x - this.pointerParallax.x) * 0.05;
        this.pointerParallax.y += (this.targetParallax.y - this.pointerParallax.y) * 0.05;
      }

      if (this.isAutoRotating && !this.isDragging) {
        this.targetRotation.y += this.autoRotateSpeed;
      }

      this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.08;
      this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.08;

      this.sneakerGroup.rotation.x = this.currentRotation.x + (this.isTouchDevice ? 0 : this.pointerParallax.y * 0.25);
      this.sneakerGroup.rotation.y = this.currentRotation.y + (this.isTouchDevice ? 0 : this.pointerParallax.x * 0.4);

      // Floating animation (Reduced intensity on prefers-reduced-motion & mobile)
      if (!this.isDragging && !this.isIntroMode && !this.prefersReducedMotion) {
        const floatAmp = this.isMobile ? 0.04 : 0.06;
        this.sneakerGroup.position.y = Math.sin(time * 1.4) * floatAmp;
        this.sneakerGroup.rotation.z = Math.sin(time * 0.8) * 0.02;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.vantaViewer = null;
