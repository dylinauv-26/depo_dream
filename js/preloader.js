/**
 * Прелоадер: бежевый экран, курсор — самолётик, «стирание» открывает сайт.
 */
(function () {
  'use strict';

  const BEIGE = '#e6d9c3';
  const BRUSH_RADIUS = 52;
  const ERASE_THRESHOLD = 0.32;

  const init = () => {
    const wrap = document.getElementById('preloader');
    const canvas = document.getElementById('pl-canvas');
    const cursorPlane = document.getElementById('pl-cursor-plane');
    if (!wrap || !canvas || !cursorPlane) return;

    const ctx = canvas.getContext('2d');
    let W = 0;
    let H = 0;
    let erasedEstimate = 0;
    let finished = false;

    const onResize = () => {
      if (finished) return;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
      ctx.fillStyle = BEIGE;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
    };

    const eraseAt = (x, y) => {
      if (finished) return;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      erasedEstimate += Math.PI * BRUSH_RADIUS * BRUSH_RADIUS * 0.35;
      const need = W * H * ERASE_THRESHOLD;
      if (erasedEstimate >= need) {
        finish();
      }
    };

    const moveCursor = (clientX, clientY) => {
      cursorPlane.style.left = `${clientX}px`;
      cursorPlane.style.top = `${clientY}px`;
    };

    const attachGlobalPlaneCursor = () => {
      if (cursorPlane.classList.contains('pl-cursor-plane--global')) return;
      cursorPlane.classList.add('pl-cursor-plane--global');
      document.body.appendChild(cursorPlane);
      document.body.classList.add('has-plane-cursor');
      document.body.style.cursor = 'none';

      const sync = (clientX, clientY) => {
        if (clientX == null || clientY == null) return;
        moveCursor(clientX, clientY);
      };

      window.addEventListener('pointermove', (e) => sync(e.clientX, e.clientY), { passive: true });
      window.addEventListener('pointerdown', (e) => sync(e.clientX, e.clientY), { passive: true });
      window.addEventListener(
        'touchmove',
        (e) => {
          const t = e.touches[0];
          if (t) sync(t.clientX, t.clientY);
        },
        { passive: true },
      );

      document.querySelectorAll('[data-system-cursor-zone]').forEach((zone) => {
        zone.addEventListener('pointerenter', () => {
          document.body.classList.add('plane-cursor-system');
        });
        zone.addEventListener('pointerleave', () => {
          document.body.classList.remove('plane-cursor-system');
        });
      });
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      window.removeEventListener('resize', onResize);
      document.body.classList.remove('is-loading');
      attachGlobalPlaneCursor();
      wrap.style.pointerEvents = 'none';
      wrap.style.opacity = '0';
      wrap.style.transition = 'opacity 0.45s ease';
      setTimeout(() => wrap.remove(), 480);
    };

    onResize();
    window.addEventListener('resize', onResize);

    document.body.classList.add('is-loading');
    document.body.style.cursor = 'none';

    const onPointer = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      moveCursor(x, y);
      eraseAt(x, y);
    };

    wrap.addEventListener('pointermove', onPointer);
    wrap.addEventListener('pointerdown', onPointer);
    wrap.addEventListener(
      'touchmove',
      (e) => {
        e.preventDefault();
        const t = e.touches[0];
        if (t) onPointer(t);
      },
      { passive: false },
    );

    moveCursor(W / 2, H / 2);
  };

  document.addEventListener('DOMContentLoaded', init);
})();
