const STAR_SRC = 'img/first-banner/star.svg';
const GRID_COLS = 6;
const GRID_ROWS = 4;
const STAR_COUNT = GRID_COLS * GRID_ROWS;
const TOAST_MS = 10000;

const TOAST_BG_CYCLE = ['#AD3831', '#37393F', '#3F85A8', '#A3519B'];

const TOAST_MESSAGES = [
  'Я стану волшебником. Первое что сделаю это наколдую бесконечное мороженое',
  'Я буду жить у моря. Каждое утро это купаться, солнце и никакой школы',
  'Я найду снежного человека. И мы станем друзьями',
  'Я стану художником и нарисую всё что вижу во сне',
  'Одна искра достаточна, чтобы зажечь дорогу',
  'Мечтать не значит ждать. Это значит верить, что можно иначе',
  'Твоя история ещё пишется: следующая строка за тобой',
];

const reduceMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const pickMessage = () => TOAST_MESSAGES[Math.floor(Math.random() * TOAST_MESSAGES.length)];

const starSizeRangePx = () => {
  if (typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 767px)').matches) {
    return { min: 22, spread: 24 };
  }
  return { min: 42, spread: 48 };
};

const shuffleCellIndices = (len) => {
  const arr = Array.from({ length: len }, (_, i) => i);
  for (let i = len - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const createStarEl = (i, leftPct, topPct, sizePx) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'live-stars__star';
  btn.setAttribute('data-star-index', String(i));
  btn.setAttribute('aria-label', 'Мечта');
  const img = document.createElement('img');
  img.src = STAR_SRC;
  img.alt = '';
  btn.style.width = `${sizePx}px`;
  btn.style.left = `${leftPct}%`;
  btn.style.top = `${topPct}%`;

  btn.appendChild(img);
  return btn;
};

const fillSegment = (segment) => {
  if (!segment) return;
  segment.textContent = '';
  const frag = document.createDocumentFragment();
  const order = shuffleCellIndices(STAR_COUNT);
  const marginX = 6;
  const marginY = 8;
  const usableX = 100 - 2 * marginX;
  const usableY = 100 - 2 * marginY;
  const { min: szMin, spread: szSpread } = starSizeRangePx();

  for (let i = 0; i < STAR_COUNT; i += 1) {
    const cell = order[i];
    const col = cell % GRID_COLS;
    const row = Math.floor(cell / GRID_COLS);
    const jx = 0.14 + Math.random() * 0.72;
    const jy = 0.14 + Math.random() * 0.72;
    const leftPct = marginX + ((col + jx) / GRID_COLS) * usableX;
    const topPct = marginY + ((row + jy) / GRID_ROWS) * usableY;
    const sizePx = szMin + Math.random() * szSpread;
    frag.appendChild(createStarEl(i, leftPct, topPct, sizePx));
  }
  segment.appendChild(frag);
};

const syncClone = (root) => {
  const segments = root.querySelectorAll('[data-marquee-segment]');
  if (segments.length < 2) return;
  const first = segments[0];
  const second = segments[1];
  second.innerHTML = first.innerHTML;
  second.setAttribute('aria-hidden', 'true');
  second.querySelectorAll('.live-stars__star').forEach((btn) => {
    btn.setAttribute('tabindex', '-1');
  });
};

const runStarPulse = (root) => {
  const g = typeof window !== 'undefined' ? window.gsap : null;
  if (reduceMotion() || !g) return;

  root.querySelectorAll('.live-stars__star').forEach((el) => {
    g.to(el, {
      opacity: 0.45,
      duration: 0.6 + Math.random() * 0.9,
      repeat: -1,
      yoyo: true,
      delay: Math.random() * 2.5,
      ease: 'sine.inOut',
    });
  });
};

const initToast = (root) => {
  const toast = root.querySelector('.live-stars__toast');
  const toastText = root.querySelector('.live-stars__toast-text');
  if (!toast || !toastText) return;

  let hideTimer;
  let toastColorIndex = 0;

  const hideToast = () => {
    toast.classList.remove('is-visible');
    toast.setAttribute('hidden', '');
    clearTimeout(hideTimer);
  };

  const showToast = (text) => {
    clearTimeout(hideTimer);
    const bg = TOAST_BG_CYCLE[toastColorIndex];
    toastColorIndex = (toastColorIndex + 1) % TOAST_BG_CYCLE.length;
    toast.style.backgroundColor = bg;
    toastText.textContent = text;
    toast.removeAttribute('hidden');
    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });
    hideTimer = window.setTimeout(() => {
      hideToast();
    }, TOAST_MS);
  };

  root.addEventListener('click', (e) => {
    const star = e.target.closest('.live-stars__star');
    if (!star || !root.contains(star)) return;
    showToast(pickMessage());
  });

  root.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const star = e.target.closest('.live-stars__star');
    if (!star || !root.contains(star)) return;
    e.preventDefault();
    showToast(pickMessage());
  });
};

export const initLiveStars = () => {
  const root = document.getElementById('live-stars');
  if (!root) return;

  const segments = root.querySelectorAll('[data-marquee-segment]');
  if (!segments.length) return;

  fillSegment(segments[0]);
  syncClone(root);
  runStarPulse(root);
  initToast(root);
};
