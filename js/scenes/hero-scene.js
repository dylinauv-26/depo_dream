const STAR_SRC = 'img/first-banner/star.svg';
const STAR_COUNT_DESKTOP = 42;
const STAR_COUNT_MOBILE = 18;

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const getHeroStarLayout = () => {
  if (window.matchMedia('(max-width: 767px)').matches) {
    return { count: STAR_COUNT_MOBILE, cols: 6 };
  }
  return { count: STAR_COUNT_DESKTOP, cols: 7 };
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
  const { count, cols } = getHeroStarLayout();
  const rows = Math.ceil(count / cols);
  const order = shuffleIndices(cols * rows);
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i += 1) {
    const idx = order[i];
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const jitterX = 0.06 + Math.random() * 0.88;
    const jitterY = 0.06 + Math.random() * 0.88;
    const img = document.createElement('img');
    img.src = STAR_SRC;
    img.alt = '';
    img.className = 'hero-scene__star hero-scene__el';
    img.width = 25;
    img.height = 22;
    img.style.left = `${((col + jitterX) / cols) * 90 + 5}%`;
    img.style.top = `${((row + jitterY) / rows) * 86 + 7}%`;
    img.style.width = `${7 + Math.random() * 12}px`;
    frag.appendChild(img);
  }
  container.appendChild(frag);
};

const makeDraggable = (el, { onPress, onRelease } = {}) => {
  let startX = 0, startY = 0, currentX = 0, currentY = 0;

  el.addEventListener('dragstart', (e) => e.preventDefault());

  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    startX = e.clientX - currentX;
    startY = e.clientY - currentY;
    onPress?.();
  });

  el.addEventListener('pointermove', (e) => {
    if (!el.hasPointerCapture(e.pointerId)) return;
    currentX = e.clientX - startX;
    currentY = e.clientY - startY;
    el.style.translate = `${currentX}px ${currentY}px`;
  });

  const end = () => onRelease?.();
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
};

const startCloudDrift = (el, i) => {
  const dir = i % 2 === 0 ? 1 : -1;
  const dx = dir * (52 + (i % 5) * 16);
  const dy = (i % 2 === 0 ? 1 : -1) * (14 + (i % 4) * 2);
  const dr = (i % 2 === 0 ? 1 : -1) * 2.5;
  const base = { iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', composite: 'add' };

  return [
    el.animate(
      [{ transform: 'translateX(0)' }, { transform: `translateX(${dx}px)` }],
      { ...base, duration: (17 + i * 0.75) * 1000, delay: i * 350 },
    ),
    el.animate(
      [{ transform: 'translateY(0)' }, { transform: `translateY(${dy}px)` }],
      { ...base, duration: (9 + i * 0.45) * 1000 },
    ),
    el.animate(
      [{ transform: 'rotate(0deg)' }, { transform: `rotate(${dr}deg)` }],
      { ...base, duration: (15 + i * 0.55) * 1000 },
    ),
  ];
};

const runMotion = () => {
  const scene = document.getElementById('hero-scene');
  const rm = reduceMotion();

  if (!rm) {
    const moon = document.querySelector('.hero-scene__moon');
    if (moon) {
      moon.animate(
        [{ transform: 'translateY(0)' }, { transform: 'translateY(6px)' }],
        { duration: 4000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' },
      );
    }

    const red = document.querySelector('.hero-scene__plane--red');
    const blue = document.querySelector('.hero-scene__plane--blue');

    if (red) {
      red._flightAnim = red.animate(
        [{ transform: 'translate(0,0) rotate(0deg)' }, { transform: 'translate(-220px,140px) rotate(22deg)' }],
        { duration: 18000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' },
      );
    }
    if (blue) {
      blue._flightAnim = blue.animate(
        [{ transform: 'translate(0,0) rotate(0deg)' }, { transform: 'translate(210px,-120px) rotate(-20deg)' }],
        { duration: 15000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' },
      );
    }

    document.querySelectorAll('.hero-scene__star').forEach((el) => {
      el.animate(
        [{ opacity: 1 }, { opacity: 0.45 }],
        {
          duration: (0.6 + Math.random() * 0.9) * 1000,
          delay: Math.random() * 2500,
          iterations: Infinity,
          direction: 'alternate',
          easing: 'ease-in-out',
        },
      );
    });
  }

  if (!scene) return;

  scene.querySelectorAll('.hero-scene__cloud-wrap').forEach((wrap, i) => {
    const cloud = wrap.querySelector('.hero-scene__cloud');
    const anims = rm ? [] : startCloudDrift(cloud, i);

    if (!rm) {
      cloud.addEventListener('mouseenter', () => {
        if (!wrap.classList.contains('is-dragging')) anims.forEach((a) => a.pause());
      });
      cloud.addEventListener('mouseleave', () => {
        if (!wrap.classList.contains('is-dragging')) anims.forEach((a) => a.play());
      });
    }

    makeDraggable(wrap, {
      onPress: () => {
        wrap.classList.add('is-dragging');
        anims.forEach((a) => a.pause());
      },
      onRelease: () => {
        wrap.classList.remove('is-dragging');
        anims.forEach((a) => a.play());
      },
    });
  });

  scene.querySelectorAll('.hero-scene__plane').forEach((plane) => {
    makeDraggable(plane, {
      onPress: () => {
        plane.classList.add('is-dragging');
        plane._flightAnim?.pause();
      },
      onRelease: () => {
        plane.classList.remove('is-dragging');
        plane._flightAnim?.play();
      },
    });
  });
};

export const initHeroScene = () => {
  const starsBox = document.getElementById('hero-stars');
  if (!starsBox) return;
  initStars(starsBox);
  runMotion();
};
