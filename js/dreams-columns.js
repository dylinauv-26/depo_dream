(function () {
  'use strict';

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

  const MAGIC_WORDS = ['Абракадабра', 'Симсалабим', 'Хокус-покус', 'Алаказам'];

  const initMagic = () => {
    const root = document.querySelector('[data-dreams-magic]');
    if (!root || typeof gsap === 'undefined') return;

    const hat = root.querySelector('.dreams-magic__hat');
    const layer = root.querySelector('[data-magic-stars-layer]');
    const fx = root.querySelector('[data-magic-fx]');
    if (!hat || !layer || !fx) return;

    const starSrc = 'img/dreams-column-right/star.svg';
    const rabbitSrc = 'img/dreams-column-right/rabbit.svg';

    /** @type {0 | 1 | 2} */
    let phase = 0;
    let busy = false;

    const killLayerStars = () => {
      layer.querySelectorAll('.dreams-magic__star-particle').forEach((el) => {
        gsap.killTweensOf(el);
        el.remove();
      });
    };

    const clearFx = () => {
      fx.querySelectorAll('.dreams-magic__rabbit, .dreams-magic__magic-word').forEach((el) => {
        gsap.killTweensOf(el);
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

    const playStars = (onDone) => {
      killLayerStars();
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

      const tl = gsap.timeline({
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

    const spawnRabbits = () => {
      clearFx();
      const { x: cx, y: cy } = hatOriginLocal();
      const n = 7;

      for (let i = 0; i < n; i += 1) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'dreams-magic__rabbit';
        btn.setAttribute('aria-label', 'Кролик — нажми, чтобы убрать');
        const img = document.createElement('img');
        img.src = rabbitSrc;
        img.alt = '';
        btn.appendChild(img);
        btn.style.left = `${cx}px`;
        btn.style.top = `${cy}px`;
        fx.appendChild(btn);

        const handleRemoveRabbit = (e) => {
          e.preventDefault();
          e.stopPropagation();
          gsap.to(btn, {
            scale: 0,
            opacity: 0,
            duration: 0.22,
            ease: 'power2.in',
            onComplete: () => btn.remove(),
          });
        };

        btn.addEventListener('click', handleRemoveRabbit);
        btn.addEventListener('keydown', (e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          handleRemoveRabbit(e);
        });

        const t = n <= 1 ? 0.5 : i / (n - 1);
        const angle = -Math.PI + t * Math.PI + (Math.random() - 0.5) * 0.32;
        const dist = 70 + Math.random() * 155;
        gsap.fromTo(
          btn,
          { x: 0, y: 0, scale: 0.12, opacity: 0, rotation: -12 },
          {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist - 40,
            scale: 0.92 + Math.random() * 0.18,
            opacity: 1,
            rotation: Math.random() * 28 - 14,
            duration: 0.82,
            ease: 'power2.out',
          },
        );
      }
    };

    const spawnWords = () => {
      clearFx();
      const { x: cx, y: cy } = hatOriginLocal();

      MAGIC_WORDS.forEach((word, i) => {
        const el = document.createElement('p');
        el.className = 'dreams-magic__magic-word';
        el.textContent = word;
        el.style.left = `${cx}px`;
        el.style.top = `${cy}px`;
        fx.appendChild(el);
        gsap.set(el, { xPercent: -50, yPercent: -50 });

        const wn = MAGIC_WORDS.length;
        const t = wn <= 1 ? 0.5 : i / (wn - 1);
        const angle = -Math.PI + t * Math.PI + (Math.random() - 0.5) * 0.22;
        const dist = 95 + i * 58;
        gsap.fromTo(
          el,
          { x: 0, y: 0, scale: 0.35, opacity: 0 },
          {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist - 48,
            scale: 1.05,
            opacity: 1,
            duration: 0.62,
            ease: 'back.out(1.12)',
            delay: i * 0.08,
          },
        );
      });
    };

    hat.addEventListener('click', () => {
      if (busy) return;

      if (phase === 0) {
        busy = true;
        playStars(() => {
          spawnRabbits();
          phase = 1;
          busy = false;
        });
        return;
      }

      if (phase === 1) {
        busy = true;
        clearFx();
        playStars(() => {
          spawnWords();
          phase = 2;
          busy = false;
        });
        return;
      }

      if (phase === 2) {
        const words = fx.querySelectorAll('.dreams-magic__magic-word');
        killLayerStars();
        if (!words.length) {
          phase = 0;
          return;
        }
        busy = true;
        gsap.to(words, {
          opacity: 0,
          scale: 0.45,
          duration: 0.32,
          stagger: 0.035,
          ease: 'power2.in',
          onComplete: () => {
            words.forEach((w) => w.remove());
            phase = 0;
            busy = false;
          },
        });
      }
    });
  };

  const fillCardBackText = () => {
    document.querySelectorAll('[data-pull-back-text]').forEach((el) => {
      el.textContent = CARD_BACK_TEXT;
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    fillCardBackText();
    initPull();
    initMagic();
  });
})();
