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

  const initMagic = () => {
    const root = document.querySelector('[data-dreams-magic]');
    if (!root || typeof gsap === 'undefined') return;

    const hat = root.querySelector('.dreams-magic__hat');
    const layer = root.querySelector('[data-magic-stars-layer]');
    if (!hat || !layer) return;

    const starSrc = 'img/dreams-column-right/star.svg';
    let magicState = 0;
    let busy = false;
    const html = document.documentElement;

    const clearStars = () => {
      gsap.killTweensOf('.dreams-magic__star-particle');
      layer.querySelectorAll('.dreams-magic__star-particle').forEach((n) => n.remove());
    };

    const applyHtmlState = (state) => {
      html.classList.remove('magic-theme', 'magic-void');
      if (state === 1) {
        html.classList.add('magic-theme');
      } else if (state === 3) {
        html.classList.add('magic-theme', 'magic-void');
      }
    };

    const playStars = (onDone) => {
      clearStars();
      const hatRect = hat.getBoundingClientRect();
      const layerRect = layer.getBoundingClientRect();
      const cx = hatRect.left + hatRect.width / 2 - layerRect.left;
      const cy = hatRect.top + hatRect.height * 0.38 - layerRect.top;

      if (reduceMotion()) {
        onDone();
        return;
      }

      const count = 14;
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
          clearStars();
          onDone();
        },
      });

      particles.forEach((el, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const dist = 60 + Math.random() * 90;
        tl.to(
          el,
          {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist * 0.6 - 40,
            rotation: Math.random() * 360,
            opacity: 0,
            scale: 0.35 + Math.random() * 0.4,
            duration: 0.85,
            ease: 'power2.out',
          },
          i * 0.02,
        );
      });
    };

    hat.addEventListener('click', () => {
      if (busy) return;
      const prev = magicState;
      magicState = (magicState + 1) % 4;

      if (prev === 0 && magicState === 1) {
        busy = true;
        playStars(() => {
          applyHtmlState(1);
          busy = false;
        });
        return;
      }

      if (magicState === 2) {
        clearStars();
        applyHtmlState(2);
        return;
      }

      if (prev === 2 && magicState === 3) {
        busy = true;
        playStars(() => {
          applyHtmlState(3);
          busy = false;
        });
        return;
      }

      if (prev === 3 && magicState === 0) {
        clearStars();
        applyHtmlState(0);
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
