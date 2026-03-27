(function () {
  'use strict';

  const initDreamKeywords = () => {
    const scene = document.querySelector('[data-dream-scene]');
    if (!scene) return;

    const hideAllPreviews = () => {
      scene.querySelectorAll('.dream-preview-img[data-dream-preview]').forEach((img) => {
        img.classList.remove('is-visible');
      });
    };

    const showPreview = (id) => {
      hideAllPreviews();
      const img = scene.querySelector(`.dream-preview-img[data-dream-preview="${id}"]`);
      if (!img) return;
      requestAnimationFrame(() => {
        img.classList.add('is-visible');
      });
    };

    const handleKeywordActivate = (btn) => {
      const id = btn.getAttribute('data-dream');
      if (!id) return;

      const keywords = scene.querySelectorAll('.dream-keyword[data-dream]');
      const wasActive = btn.classList.contains('is-active');

      keywords.forEach((k) => {
        k.classList.remove('is-active');
        k.setAttribute('aria-pressed', 'false');
      });

      if (wasActive) {
        hideAllPreviews();
        return;
      }

      keywords.forEach((k) => {
        if (k.getAttribute('data-dream') === id) {
          k.classList.add('is-active');
          k.setAttribute('aria-pressed', 'true');
        }
      });
      showPreview(id);
    };

    scene.addEventListener('click', (e) => {
      const btn = e.target.closest('.dream-keyword');
      if (!btn || !scene.contains(btn)) return;
      handleKeywordActivate(btn);
    });

    scene.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const btn = e.target.closest('.dream-keyword');
      if (!btn || !scene.contains(btn)) return;
      e.preventDefault();
      handleKeywordActivate(btn);
    });

    scene.querySelectorAll('.dream-keyword[data-dream]').forEach((btn) => {
      btn.setAttribute('aria-pressed', 'false');
    });
  };

  document.addEventListener('DOMContentLoaded', initDreamKeywords);
})();
