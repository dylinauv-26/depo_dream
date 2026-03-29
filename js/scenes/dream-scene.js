const resumeAllTracks = (scene) => {
  scene.querySelectorAll('.dream-line-marquee__track').forEach((track) => {
    track.style.animationPlayState = '';
  });
};

const pauseTrackFor = (btn) => {
  const row = btn.closest('.dream-line-marquee');
  if (!row) return;
  const track = row.querySelector('.dream-line-marquee__track');
  if (track) track.style.animationPlayState = 'paused';
};

const PREVIEW_PLACEMENT_REGIONS_DESKTOP = [
  { x: [3, 22], y: [5, 22] },
  { x: [34, 66], y: [4, 20] },
  { x: [76, 97], y: [6, 24] },
  { x: [2, 18], y: [34, 58] },
  { x: [40, 60], y: [38, 62] },
  { x: [82, 98], y: [36, 60] },
  { x: [4, 26], y: [74, 96] },
  { x: [36, 64], y: [78, 96] },
  { x: [70, 96], y: [72, 96] },
];

const pickRandomPreviewPlacement = () => {
  const regions = PREVIEW_PLACEMENT_REGIONS_DESKTOP;
  const r = regions[Math.floor(Math.random() * regions.length)];
  const x = r.x[0] + Math.random() * (r.x[1] - r.x[0]);
  const y = r.y[0] + Math.random() * (r.y[1] - r.y[0]);
  return { x, y };
};

const applyRandomPreviewPlacement = (img) => {
  const { x, y } = pickRandomPreviewPlacement();
  img.style.left = `${x}%`;
  img.style.top = `${y}%`;
};

export const initDreamScene = () => {
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
    applyRandomPreviewPlacement(img);
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
    resumeAllTracks(scene);

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
    pauseTrackFor(btn);
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
