// Minimal scroll-triggered reveals — utility-tool aesthetic
export function initAnimations(): void {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-fade]');
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        el.style.transition = 'opacity 320ms ease, transform 320ms ease';
        el.style.transitionDelay = `${(i % 3) * 60}ms`;
        el.style.opacity = '1';
        el.style.transform = 'none';
        io.unobserve(el);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
  );

  els.forEach((el) => io.observe(el));

  // Monitor filter buttons
  document.querySelectorAll<HTMLElement>('.monitor__filters').forEach((group) => {
    const btns = group.querySelectorAll<HTMLButtonElement>('button');
    btns.forEach((b) => {
      b.addEventListener('click', () => {
        btns.forEach((x) => x.classList.remove('is-active'));
        b.classList.add('is-active');
      });
    });
  });
}
