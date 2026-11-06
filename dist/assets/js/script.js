/** Pão de Mestre — carrossel infinito de avaliações e rolagem suave. */
document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initReviewsCarousel();
  initSmoothScroll();
});

function initMobileNavigation() {
  const button = document.getElementById('menu-toggle');
  const navigation = document.getElementById('primary-navigation');
  if (!button || !navigation) return;

  function closeMenu() {
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Abrir menu');
    navigation.classList.remove('is-open');
  }

  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!isOpen));
    button.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
    navigation.classList.toggle('is-open', !isOpen);
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeMenu(); button.focus(); }
  });
  document.addEventListener('click', event => {
    if (!navigation.contains(event.target) && !button.contains(event.target)) closeMenu();
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 640) closeMenu(); });
}
function initReviewsCarousel() {
  const carousel = document.getElementById('reviews-carousel');
  const viewport = document.getElementById('reviews-viewport');
  const track = document.getElementById('reviews-track');
  const previousButton = document.getElementById('reviews-prev');
  const nextButton = document.getElementById('reviews-next');
  const pagination = document.getElementById('reviews-pagination');
  if (!carousel || !viewport || !track) return;

  const originals = Array.from(track.querySelectorAll('.review-card'));
  const total = originals.length;
  if (total < 2) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clonesBefore = originals.map(card => card.cloneNode(true));
  const clonesAfter = originals.map(card => card.cloneNode(true));
  clonesBefore.reverse().forEach(card => {
    card.setAttribute('aria-hidden', 'true');
    track.insertBefore(card, track.firstChild);
  });
  clonesAfter.forEach(card => {
    card.setAttribute('aria-hidden', 'true');
    track.appendChild(card);
  });

  let index = total;
  let timer = null;
  let hovered = false;
  let pausedByFocus = false;
  let touching = false;

  function stepSize() {
    const card = track.querySelector('.review-card');
    if (!card) return 0;
    return card.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0);
  }

  function updatePagination() {
    const active = ((index - total) % total + total) % total;
    pageDots.forEach((dot, dotIndex) => dot.setAttribute('aria-current', String(dotIndex === active)));
  }

  function position(animate = true) {
    const shouldAnimate = animate && !reducedMotion.matches;
    track.style.transition = shouldAnimate
      ? 'transform 550ms cubic-bezier(.22,.75,.25,1)'
      : 'none';

    // Commit the transition style before changing the transform so every
    // button press starts a fresh, reliable animation.
    if (shouldAnimate) track.getBoundingClientRect();

    track.style.transform = `translate3d(-${index * stepSize()}px, 0, 0)`;
    updatePagination();
  }

  function schedule() {
    clearTimeout(timer);
    if (reducedMotion.matches || hovered || pausedByFocus || touching || document.hidden) return;
    timer = setTimeout(() => move(1), 4200);
  }

  function move(direction) {
    index += direction;
    position(true);
    schedule();
  }

  function goTo(realIndex) {
    const active = ((index - total) % total + total) % total;
    let difference = realIndex - active;
    if (difference > total / 2) difference -= total;
    if (difference < -total / 2) difference += total;
    index += difference;
    position(true);
    schedule();
  }

  function normalize() {
    if (index >= total * 2) index -= total;
    else if (index < total) index += total;
    position(false);
  }

  const pageDots = originals.map((_, dotIndex) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'review-page-dot';
    dot.setAttribute('aria-label', `Ir para a avaliação ${dotIndex + 1}`);
    dot.addEventListener('click', () => goTo(dotIndex));
    pagination?.appendChild(dot);
    return dot;
  });

  track.addEventListener('transitionend', event => {
    if (event.target === track && event.propertyName === 'transform') normalize();
  });
  nextButton?.addEventListener('click', () => move(1));
  previousButton?.addEventListener('click', () => move(-1));
  carousel.addEventListener('mouseenter', () => { hovered = true; clearTimeout(timer); });
  carousel.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  carousel.addEventListener('focusin', () => { pausedByFocus = true; clearTimeout(timer); });
  carousel.addEventListener('focusout', event => {
    if (!carousel.contains(event.relatedTarget)) { pausedByFocus = false; schedule(); }
  });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', () => { position(false); schedule(); });

  let touchStart = 0;
  viewport.addEventListener('touchstart', event => {
    touchStart = event.changedTouches[0]?.clientX ?? 0;
    touching = true;
    clearTimeout(timer);
  }, { passive: true });
  viewport.addEventListener('touchend', event => {
    const end = event.changedTouches[0]?.clientX ?? touchStart;
    const distance = touchStart - end;
    touching = false;
    if (Math.abs(distance) > 40) move(distance > 0 ? 1 : -1);
    else schedule();
  }, { passive: true });
  viewport.addEventListener('touchcancel', () => { touching = false; schedule(); }, { passive: true });
  window.addEventListener('resize', () => position(false));
  position(false);
  schedule();
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const id = anchor.getAttribute('href')?.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });
}
