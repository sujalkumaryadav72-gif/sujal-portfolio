/**
 * Sujal Kumar | Full Stack Developer Portfolio
 * Interactive Functionality & Modern UI Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initVisualMode();
  initHeaderAndScrollspy();
  initMobileMenu();
  initBackgroundCanvas();
  initThreeJs3D();
  init3DCardParallax();
  initProjectModals();
  initCvModal();
  initCertificates();
  initContactForm();
  initBackToTop();
});

/* --------------------------------------------------------------------------
   1. Theme Toggle (Dark Mode Default / Light Mode)
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const root = document.documentElement;

  // Retrieve saved preference or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const currentTheme = root.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      showToast(`Switched to ${newTheme} mode`, 'success');
    });
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeIcon) {
      if (theme === 'dark') {
        themeIcon.className = 'fas fa-sun';
        themeIcon.setAttribute('title', 'Switch to Light Mode');
      } else {
        themeIcon.className = 'fas fa-moon';
        themeIcon.setAttribute('title', 'Switch to Dark Mode');
      }
    }
  }
}

/* --------------------------------------------------------------------------
   1b. 3D Visual vs 2D Visual Experience Switcher
   -------------------------------------------------------------------------- */
let currentVisualMode = '3d';
let isThreeRunning = false;
let threeAnimationId = null;

function initVisualMode() {
  const visualBtn = document.getElementById('visual-mode-btn');
  const visualLabel = document.getElementById('visual-mode-label');
  const visualBadge = document.getElementById('visual-mode-badge');
  const visualIcon = document.getElementById('visual-mode-icon');
  const heroPills = document.querySelectorAll('[data-visual-opt]');

  // Retrieve saved preference or default to 3D
  const savedMode = localStorage.getItem('visualMode') || '3d';
  setVisualMode(savedMode, false);

  if (visualBtn) {
    visualBtn.addEventListener('click', () => {
      const nextMode = currentVisualMode === '3d' ? '2d' : '3d';
      setVisualMode(nextMode, true);
    });
  }

  heroPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const mode = pill.getAttribute('data-visual-opt');
      if (mode && mode !== currentVisualMode) {
        setVisualMode(mode, true);
      }
    });
  });

  function setVisualMode(mode, notify = true) {
    currentVisualMode = mode;
    localStorage.setItem('visualMode', mode);
    document.body.setAttribute('data-visual-mode', mode);

    // Update Header Button
    if (visualLabel) {
      visualLabel.textContent = mode === '3d' ? '3D Visual' : '2D Visual';
    }
    if (visualBadge) {
      visualBadge.textContent = mode === '3d' ? '3D ON' : '2D ON';
      visualBadge.style.color = mode === '3d' ? 'var(--accent-cyan)' : 'var(--accent-emerald)';
    }
    if (visualIcon) {
      visualIcon.className = mode === '3d' ? 'fas fa-cube' : 'fas fa-project-diagram';
    }

    // Update Hero Pills
    heroPills.forEach(pill => {
      if (pill.getAttribute('data-visual-opt') === mode) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Control Three.js loop
    if (mode === '3d') {
      startThreeLoop();
    } else {
      pauseThreeLoop();
    }

    if (notify) {
      showToast(`Activated ${mode.toUpperCase()} Visual Experience`, 'success');
    }
  }
}

/* --------------------------------------------------------------------------
   1c. Three.js 3D WebGL Scene Initialization
   -------------------------------------------------------------------------- */
let threeScene, threeCamera, threeRenderer, icosahedron, torusRing, particleCloud;
let threeMouseX = 0, threeMouseY = 0;
let targetThreeRotX = 0, targetThreeRotY = 0;

function initThreeJs3D() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const width = window.innerWidth;
  const height = window.innerHeight;

  threeScene = new THREE.Scene();
  threeCamera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
  threeCamera.position.z = 24;

  threeRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  threeRenderer.setSize(width, height);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 1. Central Cyber Icosahedron
  const icoGeo = new THREE.IcosahedronGeometry(7.2, 1);
  const icoMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.38
  });
  icosahedron = new THREE.Mesh(icoGeo, icoMat);
  threeScene.add(icosahedron);

  // 2. Surrounding Orbital Torus
  const torusGeo = new THREE.TorusGeometry(11.5, 0.12, 16, 80);
  const torusMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    wireframe: true,
    transparent: true,
    opacity: 0.28
  });
  torusRing = new THREE.Mesh(torusGeo, torusMat);
  torusRing.rotation.x = Math.PI / 3;
  threeScene.add(torusRing);

  // 3. Floating 3D Data Particles
  const particlesCount = 260;
  const positions = new Float32Array(particlesCount * 3);
  const colors = new Float32Array(particlesCount * 3);

  const color1 = new THREE.Color(0x38bdf8);
  const color2 = new THREE.Color(0x818cf8);

  for (let i = 0; i < particlesCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 55;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 55;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 45;

    const mixedColor = color1.clone().lerp(color2, Math.random());
    colors[i * 3] = mixedColor.r;
    colors[i * 3 + 1] = mixedColor.g;
    colors[i * 3 + 2] = mixedColor.b;
  }

  const partGeo = new THREE.BufferGeometry();
  partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  partGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const partMat = new THREE.PointsMaterial({
    size: 0.45,
    vertexColors: true,
    transparent: true,
    opacity: 0.75
  });

  particleCloud = new THREE.Points(partGeo, partMat);
  threeScene.add(particleCloud);

  // Mouse tilt tracking
  window.addEventListener('mousemove', (e) => {
    threeMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    threeMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    targetThreeRotY = threeMouseX * 0.45;
    targetThreeRotX = threeMouseY * 0.45;
  }, { passive: true });

  // Window resize
  window.addEventListener('resize', () => {
    if (!threeCamera || !threeRenderer) return;
    threeCamera.aspect = window.innerWidth / window.innerHeight;
    threeCamera.updateProjectionMatrix();
    threeRenderer.setSize(window.innerWidth, window.innerHeight);
  });

  if (currentVisualMode === '3d') {
    startThreeLoop();
  }
}

function startThreeLoop() {
  if (isThreeRunning) return;
  isThreeRunning = true;

  function renderThree() {
    if (!isThreeRunning) return;
    threeAnimationId = requestAnimationFrame(renderThree);

    if (icosahedron) {
      icosahedron.rotation.x += 0.003;
      icosahedron.rotation.y += 0.004;

      // Smooth mouse lerp
      icosahedron.rotation.y += (targetThreeRotY - icosahedron.rotation.y) * 0.04;
      icosahedron.rotation.x += (targetThreeRotX - icosahedron.rotation.x) * 0.04;
    }

    if (torusRing) {
      torusRing.rotation.z += 0.002;
      torusRing.rotation.y += 0.003;
    }

    if (particleCloud) {
      particleCloud.rotation.y += 0.0008;
      particleCloud.rotation.x += 0.0005;
    }

    if (threeRenderer && threeScene && threeCamera) {
      threeRenderer.render(threeScene, threeCamera);
    }
  }

  renderThree();
}

function pauseThreeLoop() {
  isThreeRunning = false;
  if (threeAnimationId) {
    cancelAnimationFrame(threeAnimationId);
    threeAnimationId = null;
  }
}

/* --------------------------------------------------------------------------
   1d. 3D Card Parallax Tilt on Profile Photo Card
   -------------------------------------------------------------------------- */
function init3DCardParallax() {
  const card = document.querySelector('.hero-card-frame');
  if (!card) return;

  card.addEventListener('mousemove', (e) => {
    if (currentVisualMode !== '3d') return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
}

/* --------------------------------------------------------------------------
   2. Sticky Header & Scrollspy (Active Navigation Link)
   -------------------------------------------------------------------------- */
function initHeaderAndScrollspy() {
  const header = document.querySelector('.header');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const onScroll = () => {
    // Header shadow & compact size on scroll
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // Determine current active section
    let currentId = '';
    const scrollPosition = window.scrollY + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${currentId}`) {
          link.classList.add('active');
        } else if (href && href.startsWith('#')) {
          link.classList.remove('active');
        }
      });
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* --------------------------------------------------------------------------
   3. Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const menuIcon = menuBtn ? menuBtn.querySelector('i') : null;

  if (!menuBtn || !mobileNav) return;

  const toggleMenu = () => {
    const isOpen = mobileNav.classList.toggle('open');
    if (menuIcon) {
      menuIcon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
    }
    menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  };

  menuBtn.addEventListener('click', toggleMenu);

  // Close when clicking any link
  mobileNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileNav.classList.contains('open')) {
        toggleMenu();
      }
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (
      mobileNav.classList.contains('open') &&
      !mobileNav.contains(e.target) &&
      !menuBtn.contains(e.target)
    ) {
      toggleMenu();
    }
  });
}

/* --------------------------------------------------------------------------
   4. Subtle Interactive Constellation Background Canvas
   -------------------------------------------------------------------------- */
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  let particles = [];
  const particleCount = Math.min(Math.floor((width * height) / 18000), 55);

  let mouse = { x: null, y: null, radius: 120 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  const handleResize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', handleResize);

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.radius = Math.random() * 2 + 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx = -this.vx;
      if (this.y < 0 || this.y > height) this.vy = -this.vy;

      // Mouse interactivity
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const dirX = dx / dist;
          const dirY = dy / dist;
          this.x -= dirX * force * 1.5;
          this.y -= dirY * force * 1.5;
        }
      }
    }

    draw(isDark) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? 'rgba(56, 189, 248, 0.4)' : 'rgba(59, 130, 246, 0.35)';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw(isDark);

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          const alpha = (1 - dist / 130) * (isDark ? 0.22 : 0.14);
          ctx.strokeStyle = isDark ? `rgba(96, 165, 250, ${alpha})` : `rgba(59, 130, 246, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* --------------------------------------------------------------------------
   5. Interactive Project Details Modal
   -------------------------------------------------------------------------- */
const projectsData = {
  'student-registration': {
    title: 'Student Registration Form',
    description: 'A dedicated project focused on form design and validation, helping practise structured input handling and frontend interface development. Ensures resilient data hygiene with instant user feedback.',
    highlights: [
      'Engineered structured client-side form controls with intuitive field-level validation and real-time error recovery.',
      'Designed responsive UI layouts using modern CSS and semantic HTML for optimal cross-device accessibility.',
      'Implemented defensive input handling and sanitization to prevent malformed data submissions.'
    ],
    objective: 'Mastering clean semantic layout, client-side input validation, error messaging, and intuitive UI/UX for web forms.',
    technologies: ['Frontend UI', 'Input Validation', 'Error Handling', 'Responsive Layout', 'Semantic HTML5'],
    notes: 'Emphasizes clean UI structure, reliable field validation, and accessible feedback patterns.',
    hasSimulation: false
  },
  'aqi-device': {
    title: 'AQI Detection Alarm Device',
    description: 'Developed an electronic air-quality monitoring device to detect changes in Air Quality Index (AQI) levels. Integrated air-quality sensors and an alarm system to provide real-time alerts when pollution levels exceed predefined limits.',
    highlights: [
      'Developed an electronic air-quality monitoring device to detect changes in Air Quality Index (AQI) levels.',
      'Integrated air-quality sensors and an alarm system to provide real-time alerts when pollution levels exceed predefined limits.',
      'Applied basic concepts of sensors, electronic circuits, microcontrollers, and environmental monitoring.',
      'Assembled and tested the device to ensure accurate sensor response and reliable alarm functionality.'
    ],
    objective: 'Applied basic concepts of sensors, electronic circuits, microcontrollers, and environmental monitoring to assemble and test a reliable alarm device.',
    technologies: ['Air-Quality Sensors (MQ-135)', 'Microcontrollers (Arduino/C++)', 'Electronic Circuits', 'Piezo Alarm System', 'Real-Time Alert Logic', 'Environmental Monitoring'],
    notes: 'Assembled and tested physical hardware prototype ensuring accurate sensor response calibration and reliable audio-visual alarm triggering.',
    hasSimulation: true
  },
  'campus-navigator': {
    title: 'Smart Campus Navigator',
    description: 'Developed a comprehensive web-based campus navigation platform to help students locate classrooms, offices, and campus facilities. Features an interactive map with search and navigation for quick campus exploration and announcements.',
    highlights: [
      'Developed web-based campus navigation platform to help students locate classrooms, offices, and other campus facilities.',
      'Implemented an interactive map with location search and route navigation for quick campus exploration.',
      'Designed a centralized interface for accessing campus locations, events, and important announcements.',
      'Built a responsive UI to provide a consistent experience across desktop and mobile devices.',
      'Engineered clean RESTful backends and optimized database queries for rapid spatial landmark indexing.'
    ],
    objective: 'Developing full-stack web applications with interactive mapping services, structured database models, and resilient mobile-first design.',
    technologies: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Maps API', 'Responsive UI/UX'],
    notes: 'Featured on GitHub. Built with modern full-stack MERN conventions and optimized route rendering.'
  }
};

// Web Audio API Synthesizer for AQI Alarm Tone
let aqiAudioCtx = null;
let isBuzzerMuted = true;
let simSweepTimer = null;

function triggerBuzzerSound() {
  if (isBuzzerMuted) return;
  try {
    if (!aqiAudioCtx) {
      aqiAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (aqiAudioCtx.state === 'suspended') {
      aqiAudioCtx.resume();
    }
    const osc = aqiAudioCtx.createOscillator();
    const gain = aqiAudioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, aqiAudioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2200, aqiAudioCtx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.06, aqiAudioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, aqiAudioCtx.currentTime + 0.16);
    osc.connect(gain);
    gain.connect(aqiAudioCtx.destination);
    osc.start();
    osc.stop(aqiAudioCtx.currentTime + 0.18);
  } catch (err) {
    // Audio policies handled gracefully
  }
}

function initProjectModals() {
  const modalBackdrop = document.getElementById('project-modal');
  const modalTitle = document.getElementById('modal-project-title');
  const modalDesc = document.getElementById('modal-project-desc');
  const modalObj = document.getElementById('modal-project-obj');
  const modalTechContainer = document.getElementById('modal-tech-tags');
  const modalNotes = document.getElementById('modal-project-notes');
  const highlightsSection = document.getElementById('modal-highlights-section');
  const highlightsList = document.getElementById('modal-project-highlights');
  const simulationSection = document.getElementById('modal-simulation-section');
  const closeBtn = document.getElementById('modal-close-btn');
  const modalDismissBtn = document.getElementById('modal-dismiss-btn');

  if (!modalBackdrop) return;

  const updateSimulatorUI = (val, threshold = 150) => {
    const valDisplay = document.getElementById('sim-aqi-value');
    const statusPill = document.getElementById('sim-status-pill');
    const meterBox = document.getElementById('sim-meter-box');
    const slider = document.getElementById('sim-aqi-slider');
    const sliderLabel = document.getElementById('sim-slider-val-label');
    const telV = document.getElementById('sim-tel-v');
    const telPpm = document.getElementById('sim-tel-ppm');
    const telState = document.getElementById('sim-tel-state');
    const ledInd = document.getElementById('sim-led-indicator');

    if (!valDisplay) return;

    val = parseInt(val, 10);
    if (slider) slider.value = val;
    if (sliderLabel) sliderLabel.textContent = `${val} AQI`;
    valDisplay.textContent = val;

    // Derived electrical metrics for realism
    const voltage = (0.3 + (val / 500) * 4.4).toFixed(2);
    const ppm = Math.round(val * 2.1);
    if (telV) telV.textContent = `${voltage} V`;
    if (telPpm) telPpm.textContent = `${ppm} ppm`;

    const isAlert = val >= threshold;

    if (isAlert) {
      valDisplay.style.color = '#ef4444';
      meterBox?.classList.add('alarm-active');
      if (telState) {
        telState.textContent = '🚨 ALARM ACTIVE';
        telState.style.color = '#ef4444';
      }
      if (statusPill) {
        statusPill.style.background = 'rgba(239, 68, 68, 0.2)';
        statusPill.style.color = '#ef4444';
        statusPill.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        statusPill.innerHTML = '<span class="led-indicator led-red-blinking"></span> HAZARDOUS: ALARM TRIGGERED!';
      }
      triggerBuzzerSound();
    } else {
      meterBox?.classList.remove('alarm-active');
      if (telState) {
        telState.textContent = 'NORMAL';
        telState.style.color = '#10b981';
      }

      if (val <= 50) {
        valDisplay.style.color = '#10b981';
        if (statusPill) {
          statusPill.style.background = 'rgba(16, 185, 129, 0.15)';
          statusPill.style.color = '#10b981';
          statusPill.style.borderColor = 'rgba(16, 185, 129, 0.3)';
          statusPill.innerHTML = '<span class="led-indicator led-green"></span> Good Air Quality';
        }
      } else if (val <= 100) {
        valDisplay.style.color = '#f59e0b';
        if (statusPill) {
          statusPill.style.background = 'rgba(245, 158, 11, 0.15)';
          statusPill.style.color = '#f59e0b';
          statusPill.style.borderColor = 'rgba(245, 158, 11, 0.3)';
          statusPill.innerHTML = '<span class="led-indicator led-green"></span> Moderate Air Quality';
        }
      } else {
        valDisplay.style.color = '#f97316';
        if (statusPill) {
          statusPill.style.background = 'rgba(249, 115, 22, 0.15)';
          statusPill.style.color = '#f97316';
          statusPill.style.borderColor = 'rgba(249, 115, 22, 0.3)';
          statusPill.innerHTML = '<span class="led-indicator led-green"></span> Unhealthy for Sensitive Groups';
        }
      }
    }
  };

  const renderAqiSim = (container) => {
    container.innerHTML = `
      <div class="aqi-sim-panel">
        <div class="aqi-sim-header">
          <div class="aqi-sim-title">
            <i class="fas fa-microchip"></i>
            <span>Interactive Device Simulation &amp; Real-Time Alarm Test</span>
          </div>
          <button id="sim-audio-toggle" class="aqi-audio-toggle" type="button" title="Toggle audio alarm tone">
            <i class="fas fa-volume-mute"></i>
            <span id="sim-audio-text">Buzzer: Muted</span>
          </button>
        </div>

        <div id="sim-meter-box" class="aqi-meter-box">
          <span id="sim-status-pill" class="aqi-status-pill" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);">
            <span class="led-indicator led-green" id="sim-led-indicator"></span> Good Air Quality
          </span>
          <div id="sim-aqi-value" class="aqi-value-display" style="color: #10b981;">38</div>
          <div style="font-size: 0.85rem; color: var(--text-muted); font-family: var(--font-mono);">Measured Ambient Air Quality Index (AQI)</div>

          <div class="aqi-hardware-telemetry">
            <div class="telemetry-item">Sensor Voltage: <strong id="sim-tel-v">0.63 V</strong></div>
            <div class="telemetry-item">Gas Level: <strong id="sim-tel-ppm">80 ppm</strong></div>
            <div class="telemetry-item">Alarm Threshold: <strong style="color: #f59e0b;">150 AQI</strong></div>
            <div class="telemetry-item">Device State: <strong id="sim-tel-state" style="color: #10b981;">NORMAL</strong></div>
          </div>
        </div>

        <div class="sim-slider-wrap">
          <div class="sim-slider-label">
            <span><strong>Simulate Sensor Pollution Input:</strong></span>
            <span id="sim-slider-val-label" style="font-family: var(--font-mono); font-weight: 700;">38 AQI</span>
          </div>
          <input type="range" id="sim-aqi-slider" class="sim-slider" min="10" max="450" value="38" step="1">
        </div>

        <div class="sim-presets-title">Quick Test Scenarios:</div>
        <div class="sim-preset-buttons">
          <button class="sim-preset-btn" type="button" data-preset="28">🍃 Clean Air (28 AQI)</button>
          <button class="sim-preset-btn" type="button" data-preset="78">🚗 Urban Traffic (78 AQI)</button>
          <button class="sim-preset-btn" type="button" data-preset="165" style="border-color: rgba(239, 68, 68, 0.5); color: #ef4444;">⚠️ Limit Breach (165 AQI)</button>
          <button class="sim-preset-btn" type="button" data-preset="310" style="border-color: rgba(239, 68, 68, 0.8); color: #ef4444;">🚨 Smoke Spike / Alarm (310 AQI)</button>
        </div>

        <div class="sim-action-row">
          <button id="sim-sweep-btn" type="button" class="btn btn-primary btn-outline-sm">
            <i class="fas fa-play"></i>
            <span id="sim-sweep-btn-text">Run Smoke Spike Alarm Test</span>
          </button>
          <button id="sim-code-toggle-btn" type="button" class="btn-outline-sm">
            <i class="fas fa-code"></i>
            <span>View Microcontroller Code (.ino)</span>
          </button>
        </div>

        <div id="sim-code-box" class="firmware-code-box" style="display: none;">
          <div class="firmware-code-header">
            <span><i class="fas fa-file-code"></i> firmware/aqi_alarm_device.ino (Arduino C++)</span>
            <button id="sim-copy-code-btn" type="button" class="firmware-copy-btn"><i class="fas fa-copy"></i> Copy Code</button>
          </div>
          <pre class="firmware-code-content"><code>/* AQI Detection Alarm Device Firmware (C++) */
const int SENSOR_PIN = A0;       // MQ-135 Gas Sensor
const int BUZZER_PIN = 8;        // Piezo Alarm Buzzer
const int LED_GREEN_PIN = 9;     // Safe air LED
const int LED_RED_PIN = 10;      // Hazard alarm LED
const int AQI_ALARM_THRESHOLD = 150;

void setup() {
  Serial.begin(9600);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_GREEN_PIN, OUTPUT);
  pinMode(LED_RED_PIN, OUTPUT);
}

void loop() {
  int raw = analogRead(SENSOR_PIN);
  int aqi = map(raw, 0, 1023, 10, 500);

  if (aqi >= AQI_ALARM_THRESHOLD) {
    // Alert condition
    digitalWrite(LED_GREEN_PIN, LOW);
    digitalWrite(LED_RED_PIN, HIGH);
    tone(BUZZER_PIN, 1800, 200); // Trigger audible alarm
  } else {
    noTone(BUZZER_PIN);
    digitalWrite(LED_RED_PIN, LOW);
    digitalWrite(LED_GREEN_PIN, HIGH);
  }
  delay(250);
}</code></pre>
        </div>
      </div>
    `;

    // Audio toggle
    const audioBtn = document.getElementById('sim-audio-toggle');
    const audioText = document.getElementById('sim-audio-text');
    audioBtn?.addEventListener('click', () => {
      isBuzzerMuted = !isBuzzerMuted;
      if (!isBuzzerMuted) {
        audioBtn.classList.add('active');
        audioBtn.querySelector('i').className = 'fas fa-volume-up';
        if (audioText) audioText.textContent = 'Buzzer: Active 🔊';
        triggerBuzzerSound();
      } else {
        audioBtn.classList.remove('active');
        audioBtn.querySelector('i').className = 'fas fa-volume-mute';
        if (audioText) audioText.textContent = 'Buzzer: Muted';
      }
    });

    // Slider
    const slider = document.getElementById('sim-aqi-slider');
    slider?.addEventListener('input', (e) => {
      if (simSweepTimer) {
        clearInterval(simSweepTimer);
        simSweepTimer = null;
        const sweepText = document.getElementById('sim-sweep-btn-text');
        if (sweepText) sweepText.textContent = 'Run Smoke Spike Alarm Test';
      }
      updateSimulatorUI(e.target.value);
    });

    // Presets
    document.querySelectorAll('[data-preset]').forEach(pBtn => {
      pBtn.addEventListener('click', () => {
        if (simSweepTimer) {
          clearInterval(simSweepTimer);
          simSweepTimer = null;
          const sweepText = document.getElementById('sim-sweep-btn-text');
          if (sweepText) sweepText.textContent = 'Run Smoke Spike Alarm Test';
        }
        const val = pBtn.getAttribute('data-preset');
        updateSimulatorUI(val);
      });
    });

    // Sweep test
    const sweepBtn = document.getElementById('sim-sweep-btn');
    const sweepText = document.getElementById('sim-sweep-btn-text');
    sweepBtn?.addEventListener('click', () => {
      if (simSweepTimer) {
        clearInterval(simSweepTimer);
        simSweepTimer = null;
        if (sweepText) sweepText.textContent = 'Run Smoke Spike Alarm Test';
        return;
      }

      if (sweepText) sweepText.textContent = 'Testing Alarm... (Click to Stop)';
      let current = 40;
      let climbing = true;
      simSweepTimer = setInterval(() => {
        if (climbing) {
          current += 15;
          if (current >= 260) {
            climbing = false;
          }
        } else {
          current -= 12;
          if (current <= 45) {
            clearInterval(simSweepTimer);
            simSweepTimer = null;
            if (sweepText) sweepText.textContent = 'Run Smoke Spike Alarm Test';
            updateSimulatorUI(45);
            return;
          }
        }
        updateSimulatorUI(current);
      }, 150);
    });

    // Code toggle & copy
    const codeBtn = document.getElementById('sim-code-toggle-btn');
    const codeBox = document.getElementById('sim-code-box');
    codeBtn?.addEventListener('click', () => {
      const isHidden = codeBox.style.display === 'none';
      codeBox.style.display = isHidden ? 'block' : 'none';
      codeBtn.querySelector('span').textContent = isHidden ? 'Hide Microcontroller Code' : 'View Microcontroller Code (.ino)';
    });

    const copyBtn = document.getElementById('sim-copy-code-btn');
    copyBtn?.addEventListener('click', () => {
      const code = document.querySelector('.firmware-code-content code')?.textContent || '';
      navigator.clipboard.writeText(code).then(() => {
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
          copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Code';
        }, 2000);
      });
    });

    // Initial state
    updateSimulatorUI(38);
  };

  const openModal = (projectId, autoSimulate = false) => {
    const data = projectsData[projectId];
    if (!data) return;

    if (modalTitle) modalTitle.textContent = data.title;
    if (modalDesc) modalDesc.textContent = data.description;
    if (modalObj) modalObj.textContent = data.objective;
    if (modalNotes) modalNotes.textContent = data.notes;

    // Highlights list
    if (highlightsSection && highlightsList) {
      if (data.highlights && data.highlights.length > 0) {
        highlightsSection.style.display = 'block';
        highlightsList.innerHTML = '';
        data.highlights.forEach(h => {
          const li = document.createElement('li');
          li.innerHTML = `<i class="fas fa-check-circle"></i><span>${h}</span>`;
          highlightsList.appendChild(li);
        });
      } else {
        highlightsSection.style.display = 'none';
      }
    }

    // Interactive simulator
    if (simulationSection) {
      if (data.hasSimulation) {
        simulationSection.style.display = 'block';
        renderAqiSim(simulationSection);
      } else {
        simulationSection.style.display = 'none';
        simulationSection.innerHTML = '';
      }
    }

    if (modalTechContainer) {
      modalTechContainer.innerHTML = '';
      data.technologies.forEach(tech => {
        const tag = document.createElement('span');
        tag.className = 'tech-tag';
        tag.textContent = tech;
        modalTechContainer.appendChild(tag);
      });
    }

    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';

    if (autoSimulate && simulationSection) {
      setTimeout(() => {
        simulationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  };

  const closeModal = () => {
    if (simSweepTimer) {
      clearInterval(simSweepTimer);
      simSweepTimer = null;
    }
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  };

  // Open triggers
  document.querySelectorAll('[data-project-trigger]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projectId = btn.getAttribute('data-project-trigger');
      const autoSim = btn.getAttribute('data-auto-simulate') === 'true';
      openModal(projectId, autoSim);
    });
  });

  // Close triggers
  closeBtn?.addEventListener('click', closeModal);
  modalDismissBtn?.addEventListener('click', closeModal);

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
      closeModal();
    }
  });
}

/* --------------------------------------------------------------------------
   5b. Certificate Lightbox Modal
   -------------------------------------------------------------------------- */
function initCertificates() {
  const certModal = document.getElementById('cert-modal');
  const certModalImg = document.getElementById('cert-modal-img');
  const certModalTitle = document.getElementById('cert-modal-title');
  const certModalIssuer = document.getElementById('cert-modal-issuer');
  const certCloseBtn = document.getElementById('cert-modal-close-btn');
  const certDismissBtn = document.getElementById('cert-modal-dismiss-btn');

  if (!certModal) return;

  const openCertModal = (imgSrc, title, issuer) => {
    if (certModalImg) certModalImg.src = imgSrc;
    if (certModalTitle) certModalTitle.textContent = title;
    if (certModalIssuer) certModalIssuer.textContent = issuer;

    certModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeCertModal = () => {
    certModal.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('[data-cert-preview]').forEach(elem => {
    elem.addEventListener('click', (e) => {
      e.preventDefault();
      const card = elem.closest('.cert-card');
      const imgSrc = card?.getAttribute('data-cert-img') || elem.getAttribute('data-cert-img');
      const title = card?.getAttribute('data-cert-title') || 'Certificate';
      const issuer = card?.getAttribute('data-cert-issuer') || 'Issued by Verified Authority';
      if (imgSrc) {
        openCertModal(imgSrc, title, issuer);
      }
    });
  });

  certCloseBtn?.addEventListener('click', closeCertModal);
  certDismissBtn?.addEventListener('click', closeCertModal);

  certModal.addEventListener('click', (e) => {
    if (e.target === certModal) closeCertModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && certModal.classList.contains('open')) {
      closeCertModal();
    }
  });
}

/* --------------------------------------------------------------------------
   5c. Interactive CV / Resume Viewer Modal
   -------------------------------------------------------------------------- */
function initCvModal() {
  const cvModal = document.getElementById('cv-modal');
  const previewBtns = document.querySelectorAll('#preview-cv-btn, [data-open-cv]');
  const closeBtn = document.getElementById('cv-modal-close-btn');
  const dismissBtn = document.getElementById('cv-modal-dismiss-btn');

  if (!cvModal) return;

  const openCv = (e) => {
    if (e) e.preventDefault();
    cvModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeCv = () => {
    cvModal.classList.remove('open');
    document.body.style.overflow = '';
  };

  previewBtns.forEach(btn => {
    btn.addEventListener('click', openCv);
  });

  closeBtn?.addEventListener('click', closeCv);
  dismissBtn?.addEventListener('click', closeCv);

  cvModal.addEventListener('click', (e) => {
    if (e.target === cvModal) closeCv();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cvModal.classList.contains('open')) {
      closeCv();
    }
  });
}

/* --------------------------------------------------------------------------
   6. Contact Form Validation & Toast Feedback
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#contact-name')?.value.trim();
    const email = form.querySelector('#contact-email')?.value.trim();
    const subject = form.querySelector('#contact-subject')?.value.trim();
    const message = form.querySelector('#contact-message')?.value.trim();

    if (!name || !email || !subject || !message) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    // Basic email pattern check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please provide a valid email address.', 'error');
      return;
    }

    // Submit Simulation
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      form.reset();
      showToast('Thank you! Your message has been received.', 'success');
    }, 900);
  });
}

/* --------------------------------------------------------------------------
   7. Back to Top Button
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* --------------------------------------------------------------------------
   8. Toast System
   -------------------------------------------------------------------------- */
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
  toast.innerHTML = `<i class="${icon}" style="color: ${type === 'success' ? '#10b981' : '#ef4444'}"></i> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
