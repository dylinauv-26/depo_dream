const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Не удалось загрузить: ${src}`));
    document.head.appendChild(s);
  });

const runWhenDomReady = (fn) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
};

(async () => {
  const jsDir = new URL('.', import.meta.url);

  await loadScript(new URL('lib/gsap.min.js', jsDir).href);
  await loadScript(new URL('lib/Draggable.min.js', jsDir).href);

  const { initPreloader } = await import('./components/preloader.js');
  const { initHeroScene } = await import('./scenes/hero-scene.js');
  const { initDreamScene } = await import('./scenes/dream-scene.js');
  const { initDreamsColumns } = await import('./scenes/dreams-columns-scene.js');
  const { initMarquees } = await import('./components/marquee-block.js');
  const { initLiveStars } = await import('./scenes/live-stars-scene.js');

  runWhenDomReady(() => {
    initPreloader();
    initHeroScene();
    initDreamScene();
    initDreamsColumns();
    initMarquees();
    initLiveStars();
  });
})();
