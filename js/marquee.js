const initMarquees = () => {
  const tracks = document.querySelectorAll('[data-marquee-track]');

  tracks.forEach((track) => {
    const first = track.querySelector('[data-marquee-segment]');
    if (!first) {
      return;
    }

    const clone = first.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
};

document.addEventListener('DOMContentLoaded', initMarquees);
