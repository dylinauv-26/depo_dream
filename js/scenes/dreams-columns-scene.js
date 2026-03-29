const DREAM_IMAGES = [
  'img/dreams-column-left/firsrt-dream.svg',
  'img/dreams-column-left/second-dream.svg',
  'img/dreams-column-left/third-dream.svg',
];

const CARD_BACK_TEXT =
  '«Я научусь летать на самолёте и буду сам за штурвалом. Я возьму с собой всех друзей и мы полетим куда захотим»';

const reduceMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const initPull = () => {
  const root = document.querySelector('[data-dreams-pull]');
  if (!root) return;

  const message = root.querySelector('[data-pull-message]');
  const dreamImg = root.querySelector('[data-pull-dream-img]');
  const cards = root.querySelectorAll('.dreams-pull__card[data-card]');

  const setActive = (index) => {
    root.classList.remove('dreams-pull--active-0', 'dreams-pull--active-1', 'dreams-pull--active-2');
    if (index === null || index === undefined) {
      if (message) message.classList.remove('is-dream-visible');
      if (dreamImg) dreamImg.removeAttribute('src');
      cards.forEach((c) => {
        c.setAttribute('aria-pressed', 'false');
      });
      return;
    }
    root.classList.add(`dreams-pull--active-${index}`);
    if (message) message.classList.add('is-dream-visible');
    if (dreamImg && DREAM_IMAGES[index]) {
      dreamImg.src = DREAM_IMAGES[index];
      dreamImg.alt = '';
    }
    cards.forEach((c) => {
      const i = parseInt(c.getAttribute('data-card'), 10);
      c.setAttribute('aria-pressed', i === index ? 'true' : 'false');
    });
  };

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.getAttribute('data-card'), 10);
      const isActive =
        root.classList.contains(`dreams-pull--active-${idx}`) &&
        message &&
        message.classList.contains('is-dream-visible');
      if (isActive) {
        setActive(null);
        return;
      }
      setActive(idx);
    });
  });
};

const MAGIC_WORDS = ['Абракадабра', 'Симсалабим', 'Алаказам'];

const initMagic = () => {
  const root = document.querySelector('[data-dreams-magic]');
  const g = typeof window !== 'undefined' ? window.gsap : null;
  if (!root || !g) return;

  const hat = root.querySelector('.dreams-magic__hat');
  const hatImg = hat?.querySelector('[data-magic-hat-img]');
  const layer = root.querySelector('[data-magic-stars-layer]');
  const fx = root.querySelector('[data-magic-fx]');
  const pen = root.querySelector('[data-magic-rabbit-pen]');
  const stage = root.querySelector('.dreams-magic__stage');
  if (!hat || !hatImg || !layer || !fx || !pen || !stage) return;

  const starSrc = 'img/dreams-column-right/star.svg';
  const rabbitSrc = 'img/dreams-column-right/rabbit.svg';
  const HAT_IMG_DEFAULT = 'img/dreams-column-right/hat.svg';
  const HAT_IMG_WITH_EARS = 'img/dreams-column-right/hat-with-ears.svg';
  const HAT_IMG_WITH_EARS_WINK = 'img/dreams-column-right/hat-with-ears-wink.svg';

  /** 0 — старт; 1 — после охоты; 2 — слова; 3 — уши; 4 — подмигивающие уши */
  let step = 0;
  let busy = false;
  let huntActive = false;
  /** @type {HTMLElement | null} */
  let huntLayer = null;
  let rabbitsRemaining = 0;
  let huntEnded = false;
  /** @type {HTMLParagraphElement | null} */
  let rabbitHintEl = null;

  const RABBIT_HINT_TEXT = 'Поймай всех кроликов — нажимай на каждого, пока они не убежали.';

  const removeRabbitHint = () => {
    rabbitHintEl?.remove();
    rabbitHintEl = null;
  };

  const showRabbitHint = () => {
    removeRabbitHint();
    const el = document.createElement('p');
    el.className = 'dreams-magic__rabbit-hint';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.textContent = RABBIT_HINT_TEXT;
    stage.appendChild(el);
    rabbitHintEl = el;
  };

  const attachRabbitHintToHuntLayer = () => {
    if (rabbitHintEl && huntLayer?.isConnected) {
      huntLayer.appendChild(rabbitHintEl);
    }
  };

  const killLayerStars = () => {
    layer.querySelectorAll('.dreams-magic__star-particle').forEach((el) => {
      g.killTweensOf(el);
      el.remove();
    });
  };

  const clearFx = () => {
    fx.querySelectorAll('.dreams-magic__rabbit, .dreams-magic__magic-word').forEach((el) => {
      g.killTweensOf(el);
      el.remove();
    });
  };

  const hatOriginLocal = () => {
    const hatRect = hat.getBoundingClientRect();
    const layerRect = layer.getBoundingClientRect();
    return {
      x: hatRect.left + hatRect.width / 2 - layerRect.left,
      y: hatRect.top + hatRect.height * 0.06 - layerRect.top,
    };
  };

  /** Точка вылета слов: выше и левее центра шляпы (к тулье). */
  const hatOriginInFx = () => {
    const hatRect = hat.getBoundingClientRect();
    const fxRect = fx.getBoundingClientRect();
    return {
      x: hatRect.left + hatRect.width / 2 - fxRect.left - 44,
      y: hatRect.top + hatRect.height * 0.05 - fxRect.top - 118,
    };
  };

  const playWandWave = () => {
    const wand = root.querySelector('.dreams-magic__wand');
    if (!wand || reduceMotion()) return;
    g.killTweensOf(wand);
    g.fromTo(
      wand,
      { rotation: 0, transformOrigin: '14% 88%' },
      {
        keyframes: [
          { rotation: 26, duration: 0.11, ease: 'power2.out' },
          { rotation: -20, duration: 0.13, ease: 'power2.inOut' },
          { rotation: 14, duration: 0.1, ease: 'power2.inOut' },
          { rotation: 0, duration: 0.15, ease: 'power2.out' },
        ],
      },
    );
  };

  const playStars = (onDone) => {
    killLayerStars();
    playWandWave();
    const { x: cx, y: cy } = hatOriginLocal();

    if (reduceMotion()) {
      onDone();
      return;
    }

    const count = 16;
    const particles = [];
    for (let i = 0; i < count; i += 1) {
      const img = document.createElement('img');
      img.src = starSrc;
      img.className = 'dreams-magic__star-particle';
      img.alt = '';
      img.style.left = `${cx}px`;
      img.style.top = `${cy}px`;
      layer.appendChild(img);
      particles.push(img);
    }

    const tl = g.timeline({
      onComplete: () => {
        killLayerStars();
        onDone();
      },
    });

    particles.forEach((el, i) => {
      const t = count <= 1 ? 0.5 : i / (count - 1);
      const angle = -Math.PI + t * Math.PI + (Math.random() - 0.5) * 0.28;
      const dist = 90 + Math.random() * 150;
      tl.to(
        el,
        {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 32,
          rotation: Math.random() * 360,
          opacity: 0,
          scale: 0.55 + Math.random() * 0.45,
          duration: 0.88,
          ease: 'power2.out',
        },
        i * 0.016,
      );
    });
  };

  const burstStarsAtViewport = (cx, cy, onDone) => {
    if (reduceMotion()) {
      onDone();
      return;
    }
    const parent = huntLayer?.isConnected ? huntLayer : document.body;
    const count = 14;
    const particles = [];
    for (let i = 0; i < count; i += 1) {
      const img = document.createElement('img');
      img.src = starSrc;
      img.alt = '';
      img.className = 'dreams-magic__star-particle';
      img.style.position = 'fixed';
      img.style.left = `${cx}px`;
      img.style.top = `${cy}px`;
      img.style.zIndex = '10002';
      img.style.marginLeft = '-38px';
      img.style.marginTop = '-38px';
      parent.appendChild(img);
      particles.push(img);
    }

    const tl = g.timeline({
      onComplete: () => {
        particles.forEach((p) => p.remove());
        onDone();
      },
    });

    particles.forEach((el, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 36 + Math.random() * 100;
      tl.to(
        el,
        {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          rotation: Math.random() * 360,
          opacity: 0,
          scale: 0.25 + Math.random() * 0.35,
          duration: 0.48,
          ease: 'power2.out',
        },
        i * 0.018,
      );
    });
  };

  const endRabbitHunt = () => {
    if (huntEnded) return;
    huntEnded = true;
    huntActive = false;
    removeRabbitHint();

    pen.querySelectorAll('.dreams-magic__rabbit').forEach((b) => {
      g.killTweensOf(b);
      b.remove();
    });
    if (huntLayer?.isConnected) {
      huntLayer.querySelectorAll('.dreams-magic__rabbit').forEach((b) => {
        g.killTweensOf(b);
      });
      huntLayer.remove();
      huntLayer = null;
    }

    document.documentElement.classList.remove('dreams-magic-scroll-lock');
    document.body.classList.remove('dreams-magic-scroll-lock');
    hat.removeAttribute('aria-disabled');
    hat.removeAttribute('tabindex');
    step = 1;
  };

  const startRabbitHunt = () => {
    clearFx();
    pen.textContent = '';
    huntEnded = false;
    huntActive = true;
    hat.setAttribute('aria-disabled', 'true');
    hat.setAttribute('tabindex', '-1');
    document.documentElement.classList.add('dreams-magic-scroll-lock');
    document.body.classList.add('dreams-magic-scroll-lock');

    huntLayer = null;
    showRabbitHint();

    const W = window.innerWidth;
    const H = window.innerHeight;
    const pr = pen.getBoundingClientRect();
    const hr = hat.getBoundingClientRect();
    /** Точка чуть выше шляпы (над верхом бокса), лёгкий разброс по охоте. */
    const aboveHat = 20 + Math.random() * 24;
    const cx = hr.left + hr.width / 2 - pr.left;
    const cy = hr.top - pr.top - aboveHat;

    const n = 4;
    rabbitsRemaining = n;
    /** @type {HTMLButtonElement[]} */
    const rabbitBtns = [];

    let emergeCount = 0;
    let promoted = false;

    const moveRabbit = (btn) => {
      if (huntEnded || !btn.isConnected) return;
      if (!huntLayer?.isConnected) return;
      const nx = 0.08 * W + Math.random() * 0.84 * W;
      const ny = 0.1 * H + Math.random() * 0.8 * H;
      const dur = reduceMotion() ? 0.65 + Math.random() * 0.45 : 2.6 + Math.random() * 2.8;
      g.to(btn, {
        left: nx,
        top: ny,
        duration: dur,
        ease: 'power1.inOut',
        onComplete: () => moveRabbit(btn),
      });
    };

    const promoteRabbitsToFullScreen = () => {
      if (promoted || huntEnded) return;
      promoted = true;
      const live = rabbitBtns.filter((b) => b.isConnected);
      if (!live.length) return;

      huntLayer = document.createElement('div');
      huntLayer.className = 'dreams-magic-rabbit-hunt';
      huntLayer.setAttribute('aria-hidden', 'true');

      const backdrop = document.createElement('div');
      backdrop.className = 'dreams-magic-rabbit-hunt__backdrop';
      backdrop.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
      huntLayer.appendChild(backdrop);
      document.body.appendChild(huntLayer);
      attachRabbitHintToHuntLayer();

      live.forEach((btn) => {
        const r = btn.getBoundingClientRect();
        const fixCx = r.left + r.width / 2;
        const fixCy = r.top + r.height / 2;
        g.killTweensOf(btn);
        huntLayer.appendChild(btn);
        btn.style.position = 'fixed';
        btn.style.left = `${fixCx}px`;
        btn.style.top = `${fixCy}px`;
        btn.style.marginLeft = '-44px';
        btn.style.marginTop = '-44px';
        btn.style.removeProperty('transform');
        g.set(btn, { x: 0, y: 0, rotation: 0, scale: 1 });
        moveRabbit(btn);
      });
    };

    const onEmergeDone = () => {
      if (huntEnded || promoted) return;
      emergeCount += 1;
      if (emergeCount >= n) {
        promoteRabbitsToFullScreen();
      }
    };

    for (let i = 0; i < n; i += 1) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dreams-magic__rabbit';
      btn.setAttribute('aria-label', 'Поймай кролика');
      const img = document.createElement('img');
      img.src = rabbitSrc;
      img.alt = '';
      btn.appendChild(img);

      const ang = (i / n) * Math.PI * 2 - Math.PI / 2 + (Math.random() - 0.5) * 0.35;
      const dist = 6 + Math.random() * 16;
      const tx = cx + Math.cos(ang) * dist;
      const ty = cy + Math.sin(ang) * dist;

      btn.style.left = `${cx}px`;
      btn.style.top = `${cy}px`;
      pen.appendChild(btn);
      rabbitBtns.push(btn);

      const handleCatch = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (huntEnded || !btn.isConnected) return;
        g.killTweensOf(btn);
        const rect = btn.getBoundingClientRect();
        const fixCx = rect.left + rect.width / 2;
        const fixCy = rect.top + rect.height / 2;
        burstStarsAtViewport(fixCx, fixCy, () => {
          if (!btn.isConnected) return;
          btn.remove();
          rabbitsRemaining = Math.max(0, rabbitsRemaining - 1);
          if (rabbitsRemaining === 0) {
            endRabbitHunt();
          }
        });
      };

      btn.addEventListener('click', handleCatch);
      btn.addEventListener(
        'pointerdown',
        (e) => {
          e.stopPropagation();
        },
        { passive: true },
      );
      btn.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        e.stopPropagation();
        handleCatch(e);
      });

      g.fromTo(
        btn,
        { scale: 0.08, opacity: 0, rotation: -10, x: 0, y: 0 },
        {
          x: tx - cx,
          y: ty - cy,
          scale: 1,
          opacity: 1,
          rotation: Math.random() * 14 - 7,
          duration: reduceMotion() ? 0.2 : 0.48,
          ease: 'back.out(1.35)',
          delay: i * 0.07,
          onComplete: onEmergeDone,
        },
      );
    }
  };

  const spawnWords = () => {
    clearFx();
    const { x: cx, y: cy } = hatOriginInFx();
    const fxRect = fx.getBoundingClientRect();
    const pad = 20;
    const maxRX = Math.max(pad, fxRect.width - cx - pad);
    const maxLX = Math.max(pad, cx - pad);
    const maxUY = Math.max(pad, cy - pad);
    const maxDY = Math.max(pad, fxRect.height - cy - pad);
    const safeRadius = Math.min(maxRX, maxLX, maxUY, maxDY) * 0.72;

    MAGIC_WORDS.forEach((word, i) => {
      const el = document.createElement('p');
      el.className = 'dreams-magic__magic-word';
      el.textContent = word;
      el.style.left = `${cx}px`;
      el.style.top = `${cy}px`;
      fx.appendChild(el);
      g.set(el, { xPercent: -50, yPercent: -50 });

      const wn = MAGIC_WORDS.length;
      const t = wn <= 1 ? 0.5 : i / (wn - 1);
      const angle = -Math.PI + t * Math.PI + (Math.random() - 0.5) * 0.16;
      const rawDist = 56 + i * 40;
      const dist = Math.min(rawDist, safeRadius);

      g.fromTo(
        el,
        { x: 0, y: 0, scale: 0.35, opacity: 0 },
        {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          scale: 1,
          opacity: 1,
          duration: 0.62,
          ease: 'back.out(1.08)',
          delay: i * 0.08,
        },
      );
    });
  };

  const isCompositeHatSrc = (src) =>
    src.includes('hat-with-ears') || src.includes('hat-with-ears-wink');

  const syncHatCompositeClass = (src) => {
    if (!hat) return;
    if (isCompositeHatSrc(src)) {
      hat.classList.add('dreams-magic__hat--composite');
    } else {
      hat.classList.remove('dreams-magic__hat--composite');
    }
  };

  const setHatImageSrc = (src) => {
    if (!hatImg) return;
    g.killTweensOf(hatImg);
    if (reduceMotion()) {
      hatImg.src = src;
      syncHatCompositeClass(src);
      return;
    }
    g.to(hatImg, {
      opacity: 0,
      duration: 0.1,
      onComplete: () => {
        hatImg.src = src;
        syncHatCompositeClass(src);
        g.to(hatImg, { opacity: 1, duration: 0.2, ease: 'power2.out' });
      },
    });
  };

  const resetHatImage = () => {
    if (!hatImg) return;
    g.killTweensOf(hatImg);
    hatImg.src = HAT_IMG_DEFAULT;
    hatImg.style.opacity = '';
    hat?.classList.remove('dreams-magic__hat--composite');
  };

  const showHatWithEars = () => {
    setHatImageSrc(HAT_IMG_WITH_EARS);
  };

  const showHatWithEarsWink = () => {
    setHatImageSrc(HAT_IMG_WITH_EARS_WINK);
  };

  hat.addEventListener('click', () => {
    if (busy || huntActive) return;

    if (step === 0) {
      busy = true;
      playStars(() => {
        startRabbitHunt();
        busy = false;
      });
      return;
    }

    if (step === 1) {
      busy = true;
      playStars(() => {
        spawnWords();
        step = 2;
        busy = false;
      });
      return;
    }

    if (step === 2) {
      busy = true;
      clearFx();
      playStars(() => {
        showHatWithEars();
        step = 3;
        busy = false;
      });
      return;
    }

    if (step === 3) {
      busy = true;
      playStars(() => {
        showHatWithEarsWink();
        step = 4;
        busy = false;
      });
      return;
    }

    if (step === 4) {
      busy = true;
      playStars(() => {
        resetHatImage();
        step = 0;
        busy = false;
      });
    }
  });
};

const fillCardBackText = () => {
  document.querySelectorAll('[data-pull-back-text]').forEach((el) => {
    el.textContent = CARD_BACK_TEXT;
  });
};

export const initDreamsColumns = () => {
  fillCardBackText();
  initPull();
  initMagic();
};
