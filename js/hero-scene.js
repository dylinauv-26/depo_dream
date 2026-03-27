(function () {
  'use strict';

  const STAR_SRC = 'img/first-banner/star.svg';
  const STAR_COUNT = 42;

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

  const initStars = (container) => {
    if (!container) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < STAR_COUNT; i += 1) {
      const img = document.createElement('img');
      img.src = STAR_SRC;
      img.alt = '';
      img.className = 'hero-scene__star hero-scene__el';
      img.width = 25;
      img.height = 22;
      img.style.left = `${6 + Math.random() * 88}%`;
      img.style.top = `${5 + Math.random() * 82}%`;
      const size = 7 + Math.random() * 12;
      img.style.width = `${size}px`;
      frag.appendChild(img);
    }
    container.appendChild(frag);
  };

  const runCloudDrift = (clouds) => {
    clouds.forEach((el, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      const tx = gsap.to(el, {
        x: dir * (52 + (i % 5) * 16),
        duration: 17 + i * 0.75,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.35,
      });
      const ty = gsap.to(el, {
        y: (i % 2 === 0 ? 1 : -1) * (14 + (i % 4) * 2),
        duration: 9 + i * 0.45,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      const tr = gsap.to(el, {
        rotation: (i % 2 === 0 ? 1 : -1) * 2.5,
        duration: 15 + i * 0.55,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      registerHoverPause(el, [tx, ty, tr]);
    });
  };

  const pauseCloudTweens = (img) => {
    gsap.getTweensOf(img).forEach((t) => {
      if (t && typeof t.pause === 'function') t.pause();
    });
  };

  const resumeCloudTweens = (img) => {
    gsap.getTweensOf(img).forEach((t) => {
      if (t && typeof t.resume === 'function') t.resume();
    });
  };

  const initCloudDraggable = (scene) => {
    if (typeof gsap === 'undefined' || typeof Draggable === 'undefined' || !scene) return;
    gsap.registerPlugin(Draggable);

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
          pauseCloudTweens(img);
        },
        onRelease: () => {
          wrap.classList.remove('is-dragging');
          resumeCloudTweens(img);
        },
      });
    });
  };

  const runPlaneFlight = (red, blue) => {
    if (red) {
      const t = gsap.to(red, {
        x: '-=140',
        y: '+=95',
        rotation: 18,
        duration: 16,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      registerHoverPause(red, t);
    }
    if (blue) {
      const t = gsap.to(blue, {
        x: '+=130',
        y: '-=85',
        rotation: -16,
        duration: 14,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      registerHoverPause(blue, t);
    }
  };

  const runMotion = () => {
    if (typeof gsap === 'undefined') return;
    const scene = document.getElementById('hero-scene');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reduce) {
      const clouds = document.querySelectorAll('.hero-scene__cloud');
      runCloudDrift(clouds);

      const moon = document.querySelector('.hero-scene__moon');
      if (moon) {
        gsap.to(moon, {
          y: '+=6',
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      const red = document.querySelector('.hero-scene__plane--red');
      const blue = document.querySelector('.hero-scene__plane--blue');
      runPlaneFlight(red, blue);

      document.querySelectorAll('.hero-scene__star').forEach((el) => {
        gsap.to(el, {
          opacity: 0.45,
          duration: 0.6 + Math.random() * 0.9,
          repeat: -1,
          yoyo: true,
          delay: Math.random() * 2.5,
          ease: 'sine.inOut',
        });
      });
    }

    if (scene) initCloudDraggable(scene);
  };

  const init = () => {
    const starsBox = document.getElementById('hero-stars');
    if (!starsBox) return;

    initStars(starsBox);
    runMotion();
  };

  document.addEventListener('DOMContentLoaded', init);
})();
