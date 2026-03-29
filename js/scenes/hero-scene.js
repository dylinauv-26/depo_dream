const STAR_SRC = 'img/first-banner/star.svg';
const STAR_COUNT = 42;

const getGsap = () => (typeof window !== 'undefined' ? window.gsap : null);

const registerHoverPause = (el, tweens) => {
  const list = Array.isArray(tweens) ? tweens : [tweens];

  const handleEnter = () => {
    list.forEach((t) => {
      if (t && typeof t.pause === 'function') t.pause();
    });
  };
  const handleLeave = () => {
    const wrap = el.closest('.hero-scene__cloud-wrap');
    if (wrap && wrap.classList.contains('is-dragging')) return;
    list.forEach((t) => {
      if (t && typeof t.resume === 'function') t.resume();
    });
  };

  el.addEventListener('mouseenter', handleEnter);
  el.addEventListener('mouseleave', handleLeave);
};

const shuffleIndices = (len) => {
  const arr = Array.from({ length: len }, (_, i) => i);
  for (let i = len - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const initStars = (container) => {
  if (!container) return;
  const cols = 7;
  const rows = Math.ceil(STAR_COUNT / cols);
  const cellCount = cols * rows;
  const order = shuffleIndices(cellCount);

  const frag = document.createDocumentFragment();
  for (let i = 0; i < STAR_COUNT; i += 1) {
    const idx = order[i];
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const jitterX = 0.06 + Math.random() * 0.88;
    const jitterY = 0.06 + Math.random() * 0.88;
    const leftPct = ((col + jitterX) / cols) * 90 + 5;
    const topPct = ((row + jitterY) / rows) * 86 + 7;

    const img = document.createElement('img');
    img.src = STAR_SRC;
    img.alt = '';
    img.className = 'hero-scene__star hero-scene__el';
    img.width = 25;
    img.height = 22;
    img.style.left = `${leftPct}%`;
    img.style.top = `${topPct}%`;
    const size = 7 + Math.random() * 12;
    img.style.width = `${size}px`;
    frag.appendChild(img);
  }
  container.appendChild(frag);
};

const runCloudDrift = (g, clouds) => {
  clouds.forEach((el, i) => {
    const dir = i % 2 === 0 ? 1 : -1;
    const tx = g.to(el, {
      x: dir * (52 + (i % 5) * 16),
      duration: 17 + i * 0.75,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.35,
    });
    const ty = g.to(el, {
      y: (i % 2 === 0 ? 1 : -1) * (14 + (i % 4) * 2),
      duration: 9 + i * 0.45,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    const tr = g.to(el, {
      rotation: (i % 2 === 0 ? 1 : -1) * 2.5,
      duration: 15 + i * 0.55,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    registerHoverPause(el, [tx, ty, tr]);
  });
};

const pauseCloudTweens = (g, img) => {
  g.getTweensOf(img).forEach((t) => {
    if (t && typeof t.pause === 'function') t.pause();
  });
};

const resumeCloudTweens = (g, img) => {
  g.getTweensOf(img).forEach((t) => {
    if (t && typeof t.resume === 'function') t.resume();
  });
};

const initCloudDraggable = (g, scene) => {
  const Draggable = typeof window !== 'undefined' ? window.Draggable : null;
  if (!g || !Draggable || !scene) return;
  g.registerPlugin(Draggable);

  scene.querySelectorAll('.hero-scene__cloud-wrap').forEach((wrap) => {
    const img = wrap.querySelector('.hero-scene__cloud');
    if (!img) return;

    Draggable.create(wrap, {
      type: 'x,y',
      bounds: scene,
      inertia: false,
      cursor: 'grab',
      activeCursor: 'grabbing',
      onPress: () => {
        wrap.classList.add('is-dragging');
        pauseCloudTweens(g, img);
      },
      onRelease: () => {
        wrap.classList.remove('is-dragging');
        resumeCloudTweens(g, img);
      },
    });
  });
};

const initPlaneDraggable = (g, scene) => {
  const Draggable = typeof window !== 'undefined' ? window.Draggable : null;
  if (!g || !Draggable || !scene) return;

  scene.querySelectorAll('.hero-scene__plane').forEach((plane) => {
    Draggable.create(plane, {
      type: 'x,y',
      bounds: scene,
      inertia: false,
      cursor: 'grab',
      activeCursor: 'grabbing',
      onPress: () => {
        plane.classList.add('is-dragging');
        pauseCloudTweens(g, plane);
      },
      onRelease: () => {
        plane.classList.remove('is-dragging');
        resumeCloudTweens(g, plane);
      },
    });
  });
};

const runPlaneFlight = (g, red, blue) => {
  if (red) {
    g.to(red, {
      x: '-=220',
      y: '+=140',
      rotation: 22,
      duration: 18,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }
  if (blue) {
    g.to(blue, {
      x: '+=210',
      y: '-=120',
      rotation: -20,
      duration: 15,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }
};

const runMotion = () => {
  const g = getGsap();
  if (!g) return;

  const scene = document.getElementById('hero-scene');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduce) {
    const clouds = document.querySelectorAll('.hero-scene__cloud');
    runCloudDrift(g, clouds);

    const moon = document.querySelector('.hero-scene__moon');
    if (moon) {
      g.to(moon, {
        y: '+=6',
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }

    const red = document.querySelector('.hero-scene__plane--red');
    const blue = document.querySelector('.hero-scene__plane--blue');
    runPlaneFlight(g, red, blue);

    document.querySelectorAll('.hero-scene__star').forEach((el) => {
      g.to(el, {
        opacity: 0.45,
        duration: 0.6 + Math.random() * 0.9,
        repeat: -1,
        yoyo: true,
        delay: Math.random() * 2.5,
        ease: 'sine.inOut',
      });
    });
  }

  if (scene) {
    initCloudDraggable(g, scene);
    initPlaneDraggable(g, scene);
  }
};

export const initHeroScene = () => {
  const starsBox = document.getElementById('hero-stars');
  if (!starsBox) return;

  initStars(starsBox);
  runMotion();
};
