(function () {
  'use strict';

  const STAR_SRC = 'img/first-banner/star.svg';
  const STAR_COUNT = 96;
  const FALL_CHANCE = 0.14;
  const TOAST_MS = 10000;

  const TOAST_MESSAGES = [
    'Каждая мечта оставляет след — даже если она ещё в пути.',
    'Ты уже сделал шаг: разве это не начало?',
    'Звёзды помнят то, о чём ты думаешь перед сном.',
    'Иногда мечта сбывается тихо — без фанфар, но с теплом.',
    'Одна искра достаточна, чтобы зажечь дорогу.',
    'Мечтать — не значит ждать. Это значит верить, что можно иначе.',
    'Твоя история ещё пишется: следующая строка за тобой.',
  ];

  const reduceMotion = () =>
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const pickMessage = () => TOAST_MESSAGES[Math.floor(Math.random() * TOAST_MESSAGES.length)];

  const createStarEl = (i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'live-stars__star';
    btn.setAttribute('data-star-index', String(i));
    btn.setAttribute('aria-label', 'Мечта');
    const img = document.createElement('img');
    img.src = STAR_SRC;
    img.alt = '';
    const size = 18 + Math.random() * 26;
    btn.style.width = `${size}px`;
    btn.style.left = `${4 + Math.random() * 92}%`;
    btn.style.top = `${4 + Math.random() * 88}%`;

    if (!reduceMotion() && Math.random() < FALL_CHANCE) {
      btn.classList.add('live-stars__star--fall');
      btn.style.setProperty('--fall-dur', `${7 + Math.random() * 8}s`);
      btn.style.setProperty('--fall-delay', `${Math.random() * 6}s`);
    }

    btn.appendChild(img);
    return btn;
  };

  const fillSegment = (segment) => {
    if (!segment) return;
    segment.textContent = '';
    const frag = document.createDocumentFragment();
    for (let i = 0; i < STAR_COUNT; i += 1) {
      frag.appendChild(createStarEl(i));
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

  const initToast = (root) => {
    const toast = root.querySelector('.live-stars__toast');
    const toastText = root.querySelector('.live-stars__toast-text');
    if (!toast || !toastText) return;

    let hideTimer;

    const hideToast = () => {
      toast.classList.remove('is-visible');
      toast.setAttribute('hidden', '');
      clearTimeout(hideTimer);
    };

    const showToast = (text) => {
      clearTimeout(hideTimer);
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

  const init = () => {
    const root = document.getElementById('live-stars');
    if (!root) return;

    const segments = root.querySelectorAll('[data-marquee-segment]');
    if (!segments.length) return;

    fillSegment(segments[0]);
    syncClone(root);
    initToast(root);
  };

  document.addEventListener('DOMContentLoaded', init);
})();
