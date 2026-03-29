const DREAM_IMAGES = [
  'img/dreams-column-left/firsrt-dream.svg',
  'img/dreams-column-left/second-dream.svg',
  'img/dreams-column-left/third-dream.svg',
];

const CARD_BACK_TEXTS = [
  '«Я научусь летать\nна самолёте и буду сам за штурвалом.\nЯ возьму с собой всех друзей и мы полетим куда захотим»',
  '«Я стану врачом и буду лечить зверей. Даже самых страшных. Они просто не знают что я их не боюсь»',
  '«Я изобрету машину времени. Сначала слетаю к динозаврам, потом посмотрю как будет выглядеть будущее»',
];

const reduceMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const cancelAnims = (el) => {
  el.getAnimations().forEach((a) => a.cancel());
};

const BACK_OUT = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

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
  if (!root) return;

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

  let step = 0;
  let busy = false;
  let huntActive = false;
  let huntLayer = null;
  let rabbitsRemaining = 0;
  let huntEnded = false;
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
      cancelAnims(el);
      el.remove();
    });
  };

  const clearFx = () => {
    fx.querySelectorAll('.dreams-magic__rabbit, .dreams-magic__magic-word').forEach((el) => {
      cancelAnims(el);
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
    cancelAnims(wand);
    wand.style.transformOrigin = '14% 88%';
    wand.animate(
      [
        { transform: 'rotate(0deg)', offset: 0 },
        { transform: 'rotate(26deg)', offset: 0.22, easing: 'ease-out' },
        { transform: 'rotate(-20deg)', offset: 0.49, easing: 'ease-in-out' },
        { transform: 'rotate(14deg)', offset: 0.69, easing: 'ease-in-out' },
        { transform: 'rotate(0deg)', offset: 1 },
      ],
      { duration: 490, fill: 'forwards' },
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

    let finished = 0;
    const onParticleDone = () => {
      finished += 1;
      if (finished === count) {
        killLayerStars();
        onDone();
      }
    };

    particles.forEach((el, i) => {
      const t = count <= 1 ? 0.5 : i / (count - 1);
      const angle = -Math.PI + t * Math.PI + (Math.random() - 0.5) * 0.28;
      const dist = 90 + Math.random() * 150;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist - 32;
      const sc = 0.55 + Math.random() * 0.45;
      const rot = Math.random() * 360;

      const anim = el.animate(
        [
          { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
          { transform: `translate(${tx}px,${ty}px) rotate(${rot}deg) scale(${sc})`, opacity: 0 },
        ],
        { duration: 880, delay: i * 16, easing: 'ease-out', fill: 'forwards' },
      );
      anim.onfinish = onParticleDone;
    });
  };

  const burstStarsAtViewport = (cx, cy, onDone, opts = {}) => {
    const duration = (typeof opts.duration === 'number' ? opts.duration : 0.72) * 1000;
    const stagger = (typeof opts.stagger === 'number' ? opts.stagger : 0.022) * 1000;
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
      img.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;z-index:10002;margin-left:-38px;margin-top:-38px;`;
      parent.appendChild(img);
      particles.push(img);
    }

    let finished = 0;
    const onParticleDone = () => {
      finished += 1;
      if (finished === count) {
        particles.forEach((p) => p.remove());
        onDone();
      }
    };

    particles.forEach((el, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 36 + Math.random() * 100;
      const sc = 0.2 + Math.random() * 0.32;
      const rot = Math.random() * 360;

      const anim = el.animate(
        [
          { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
          { transform: `translate(${Math.cos(angle) * dist}px,${Math.sin(angle) * dist}px) rotate(${rot}deg) scale(${sc})`, opacity: 0 },
        ],
        { duration, delay: i * stagger, easing: 'ease-out', fill: 'forwards' },
      );
      anim.onfinish = onParticleDone;
    });
  };

  const endRabbitHunt = () => {
    if (huntEnded) return;
    huntEnded = true;
    huntActive = false;
    removeRabbitHint();

    pen.querySelectorAll('.dreams-magic__rabbit').forEach((b) => {
      cancelAnims(b);
      b.remove();
    });
    if (huntLayer?.isConnected) {
      huntLayer.querySelectorAll('.dreams-magic__rabbit').forEach((b) => cancelAnims(b));
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
    const aboveHat = 20 + Math.random() * 24;
    const cx = hr.left + hr.width / 2 - pr.left;
    const cy = hr.top - pr.top - aboveHat;

    const n = 4;
    rabbitsRemaining = n;
    const rabbitBtns = [];

    let emergeCount = 0;
    let promoted = false;

    const moveRabbit = (btn) => {
      if (huntEnded || !btn.isConnected) return;
      if (!huntLayer?.isConnected) return;
      const nx = `${0.08 * W + Math.random() * 0.84 * W}px`;
      const ny = `${0.1 * H + Math.random() * 0.8 * H}px`;
      const dur = reduceMotion() ? 650 + Math.random() * 450 : 2600 + Math.random() * 2800;

      const anim = btn.animate(
        [{ left: btn.style.left, top: btn.style.top }, { left: nx, top: ny }],
        { duration: dur, easing: 'ease-in-out', fill: 'forwards' },
      );
      anim.onfinish = () => {
        if (huntEnded || !btn.isConnected) return;
        try { anim.commitStyles(); } catch (_) {}
        anim.cancel();
        moveRabbit(btn);
      };
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
        cancelAnims(btn);
        huntLayer.appendChild(btn);
        btn.style.position = 'fixed';
        btn.style.left = `${fixCx}px`;
        btn.style.top = `${fixCy}px`;
        btn.style.marginLeft = '-44px';
        btn.style.marginTop = '-44px';
        btn.style.transform = '';
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
        cancelAnims(btn);

        const rect = btn.getBoundingClientRect();
        const fixCx = rect.left + rect.width / 2;
        const fixCy = rect.top + rect.height / 2;

        const applyCatchResult = () => {
          if (!btn.isConnected) return;
          btn.remove();
          rabbitsRemaining = Math.max(0, rabbitsRemaining - 1);
          if (rabbitsRemaining === 0) {
            endRabbitHunt();
          }
        };

        if (reduceMotion()) {
          const fadeAnim = btn.animate(
            [{ opacity: 1, scale: 1 }, { opacity: 0, scale: 0.92 }],
            { duration: 200, fill: 'forwards' },
          );
          fadeAnim.onfinish = () =>
            burstStarsAtViewport(fixCx, fixCy, applyCatchResult, { duration: 0.35, stagger: 0.01 });
          return;
        }

        let pending = 2;
        const onCatchAnimEnd = () => {
          pending -= 1;
          if (pending > 0) return;
          applyCatchResult();
        };

        burstStarsAtViewport(fixCx, fixCy, onCatchAnimEnd, { duration: 0.78, stagger: 0.024 });
        const catchAnim = btn.animate(
          [
            { transform: 'scale(1) rotate(0deg)', opacity: 1 },
            { transform: `scale(0.08) rotate(${18 + Math.random() * 12}deg)`, opacity: 0 },
          ],
          { duration: 680, easing: 'ease-in-out', fill: 'forwards' },
        );
        catchAnim.onfinish = onCatchAnimEnd;
      };

      btn.addEventListener('click', handleCatch);
      btn.addEventListener('pointerdown', (e) => e.stopPropagation(), { passive: true });
      btn.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        e.stopPropagation();
        handleCatch(e);
      });

      const emergeAnim = btn.animate(
        [
          { transform: `translate(0,0) rotate(-10deg) scale(0.08)`, opacity: 0 },
          { transform: `translate(${tx - cx}px,${ty - cy}px) rotate(${Math.random() * 14 - 7}deg) scale(1)`, opacity: 1 },
        ],
        {
          duration: reduceMotion() ? 200 : 480,
          delay: i * 70,
          easing: BACK_OUT,
          fill: 'forwards',
        },
      );
      emergeAnim.onfinish = onEmergeDone;
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

      const wn = MAGIC_WORDS.length;
      const t = wn <= 1 ? 0.5 : i / (wn - 1);
      const angle = -Math.PI + t * Math.PI + (Math.random() - 0.5) * 0.16;
      const rawDist = 56 + i * 40;
      const dist = Math.min(rawDist, safeRadius);
      const wtx = Math.cos(angle) * dist;
      const wty = Math.sin(angle) * dist;

      el.animate(
        [
          { transform: 'translate(-50%,-50%) scale(0.35)', opacity: 0 },
          { transform: `translate(calc(-50% + ${wtx}px),calc(-50% + ${wty}px)) scale(1)`, opacity: 1 },
        ],
        { duration: 620, delay: i * 80, easing: BACK_OUT, fill: 'forwards' },
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
    cancelAnims(hatImg);
    if (reduceMotion()) {
      hatImg.src = src;
      syncHatCompositeClass(src);
      return;
    }
    const fadeOut = hatImg.animate([{}, { opacity: 0 }], { duration: 100 });
    fadeOut.onfinish = () => {
      fadeOut.cancel();
      hatImg.style.opacity = '0';
      hatImg.src = src;
      syncHatCompositeClass(src);
      const fadeIn = hatImg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
      fadeIn.onfinish = () => {
        hatImg.style.opacity = '';
        fadeIn.cancel();
      };
    };
  };

  const resetHatImage = () => {
    if (!hatImg) return;
    cancelAnims(hatImg);
    hatImg.src = HAT_IMG_DEFAULT;
    hatImg.style.opacity = '';
    hat?.classList.remove('dreams-magic__hat--composite');
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
        setHatImageSrc(HAT_IMG_WITH_EARS);
        step = 3;
        busy = false;
      });
      return;
    }

    if (step === 3) {
      busy = true;
      playStars(() => {
        setHatImageSrc(HAT_IMG_WITH_EARS_WINK);
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
  document.querySelectorAll('.dreams-pull__card[data-card]').forEach((card) => {
    const idx = parseInt(card.getAttribute('data-card'), 10);
    const el = card.querySelector('[data-pull-back-text]');
    const text = CARD_BACK_TEXTS[idx];
    if (el && text) {
      el.textContent = text;
    }
  });
};

export const initDreamsColumns = () => {
  fillCardBackText();
  initPull();
  initMagic();
};
