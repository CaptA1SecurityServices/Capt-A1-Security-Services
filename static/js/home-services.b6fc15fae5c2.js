(function () {
  const scene = document.querySelector('.home-services__scene');
  if (!scene) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const marquee = document.querySelector('.logo-marquee__track');
  let marqueeVisible = false;
  const syncMarquee = () => marquee?.classList.toggle('is-motion-paused', !marqueeVisible || motion.matches || document.hidden);
  if (marquee && 'IntersectionObserver' in window) {
    marquee.classList.add('is-motion-paused');
    new IntersectionObserver(([entry]) => {
      marqueeVisible = entry.isIntersecting;
      syncMarquee();
    }).observe(marquee.parentElement);
    document.addEventListener('visibilitychange', syncMarquee);
    motion.addEventListener('change', syncMarquee);
  }

  // Native view timelines do the work in modern browsers. The fallback only
  // runs on scroll, while the scene is visible, with reads batched before writes.
  if (CSS.supports('animation-timeline: view()') || !('IntersectionObserver' in window)) return;
  const tiles = Array.from(scene.querySelectorAll('.home-service'));
  let visible = false;
  let frame = 0;
  const clamp = value => Math.max(0, Math.min(1, value));
  const paint = () => {
    frame = 0;
    if (!visible || motion.matches || document.hidden) return;
    const height = window.innerHeight;
    const bounds = scene.getBoundingClientRect();
    const positions = tiles.map(tile => tile.getBoundingClientRect());
    scene.style.setProperty('--scene-progress', clamp((height - bounds.top) / (height + bounds.height)).toFixed(3));
    tiles.forEach((tile, index) => tile.style.setProperty('--tile-progress', clamp((height - positions[index].top) / (height + positions[index].height)).toFixed(3)));
  };
  const schedule = () => {
    if (visible && !motion.matches && !document.hidden && !frame) frame = requestAnimationFrame(paint);
  };
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  }).observe(scene);
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule, {passive:true});
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', schedule);
})();
