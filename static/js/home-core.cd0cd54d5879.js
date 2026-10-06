(() => {
  'use strict';
  const runway = document.querySelector('.core-runway');
  if (!runway) return;
  const stage = runway.querySelector('.core-stage');
  const viewport = runway.querySelector('.core-window');
  const track = runway.querySelector('.core-track');
  const cards = [...track.querySelectorAll('.service-card')];
  const scenes = [...runway.querySelectorAll('.core-scene')];
  const steps = [...runway.querySelectorAll('[data-core-step]')];
  const progressBar = runway.querySelector('.core-progress > span');
  const orbit = runway.querySelector('.core-orbit-spin');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = false, near = false, frame = 0, distance = 0, start = 0;
  let offsets = [], lastWidth = 0, lastHeight = 0;
  const clamp = value => Math.max(0, Math.min(1, value));

  function paint() {
    frame = 0;
    if (!enabled || document.hidden) return;
    const progress = clamp((window.scrollY - start) / distance);
    const x = progress * distance;
    track.style.transform = `translate3d(${-x}px,0,0)`;
    progressBar.style.transform = `scaleX(${progress})`;
    orbit.style.transform = `rotate(${progress * 210}deg)`;
    const active = offsets.reduce((best, offset, i) => Math.abs(offset-x) < Math.abs(offsets[best]-x) ? i : best, 0);
    const sceneProgress = progress * (scenes.length - 1);
    scenes.forEach((scene, i) => {
      scene.style.opacity = String(Math.max(0, 1 - Math.abs(sceneProgress-i)));
      scene.style.transform = `translate3d(${45-progress*90}px,${progress*35}px,0) scale(1.06)`;
    });
    steps.forEach((step,i) => step.setAttribute('aria-current', String(i === active)));
  }
  function schedule() {
    if (near && enabled && !frame) frame = requestAnimationFrame(paint);
  }
  function reset() {
    runway.classList.remove('is-motion');
    track.style.transform = '';
    scenes.forEach(scene => { scene.style.opacity = ''; scene.style.transform = ''; });
    orbit.style.transform = '';
    enabled = false;
  }
  function measure() {
    reset();
    const header = document.querySelector('.site-header');
    const top = Math.ceil(header?.getBoundingClientRect().height || 88);
    // Small landscape windows and zoomed layouts retain ordinary readable cards.
    if (reduced.matches || innerHeight < 660) return;
    const height = innerHeight - top - (innerWidth <= 640 ? 72 : 0);
    runway.style.setProperty('--core-top', `${top}px`);
    runway.style.setProperty('--core-stage-height', `${height}px`);
    runway.classList.add('is-motion');
    distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
    if (!distance || cards.some(card => card.scrollHeight > card.clientHeight + 2)) { reset(); return; }
    runway.style.setProperty('--core-runway-height', `${height + distance}px`);
    start = runway.getBoundingClientRect().top + scrollY - top;
    offsets = cards.map((card, i) => distance * i / (cards.length - 1));
    enabled = true;
    paint();
  }
  function reveal(index) {
    if (enabled) window.scrollTo({top: start + offsets[index], behavior: reduced.matches ? 'instant' : 'smooth'});
    else cards[index].scrollIntoView({block: 'nearest', inline: 'start', behavior: 'instant'});
  }
  steps.forEach((button,i) => button.addEventListener('click', () => reveal(i)));
  track.addEventListener('focusin', event => {
    const index = cards.findIndex(card => card.contains(event.target));
    if (index < 0 || !enabled) return;
    const box = cards[index].getBoundingClientRect();
    const view = viewport.getBoundingClientRect();
    if (box.left < view.left-2 || box.right > view.right+2) reveal(index);
  });
  new IntersectionObserver(entries => {
    near = entries[0].isIntersecting;
    if (near) schedule();
  }, {rootMargin: '200px'}).observe(runway);
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', () => {
    // Ignore mobile browser chrome changes; do reflow for rotation or viewport changes.
    if (innerWidth === lastWidth && Math.abs(innerHeight-lastHeight) < 100) return;
    lastWidth = innerWidth; lastHeight = innerHeight;
    measure();
  }, {passive: true});
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', measure);
  lastWidth = innerWidth; lastHeight = innerHeight;
  // Measure once with final font metrics instead of forcing three startup layouts.
  document.fonts.ready.then(measure);
})();
