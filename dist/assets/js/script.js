/**
 * Pão de Mestre — Carrossel Infinito Automático
 * Navegação manual, indicadores, swipe e rotação automática.
 */

document.addEventListener('DOMContentLoaded', () => {
  initRestaurantCarousel();
  initSmoothScroll();
});

function initRestaurantCarousel() {
  const carousel = document.getElementById('restaurant-carousel');
  const viewport = document.getElementById('carousel-viewport');
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');

  if (!carousel || !viewport || !track) return;

  const originalSlides = Array.from(
    track.querySelectorAll('.carousel-slide')
  );

  const totalOriginal = originalSlides.length;

  if (totalOriginal === 0) return;

  // Configurações
  const DURATION_MS = 4000;
  const TRANSITION_DURATION = 420;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  let isPlaying = !prefersReducedMotion.matches;
  let isTransitioning = false;
  let isHovered = false;
  let isTouching = false;

  let transitionSafetyTimeout = null;
  let autoTimerId = null;
  let timerStartedAt = null;
  let remainingTime = DURATION_MS;
  let resizeFrame = null;

  // Verifica se a rotação automática pode acontecer.
  function canPlay() {
    return (
      isPlaying &&
      !isHovered &&
      !isTouching &&
      !document.hidden &&
      !prefersReducedMotion.matches
    );
  }

  // Cria os clones anteriores.
  const clonesBefore = originalSlides.map(slide => {
    const clone = slide.cloneNode(true);

    clone.classList.add('is-clone');
    clone.setAttribute('aria-hidden', 'true');
    clone.inert = true;

    return clone;
  });

  // Cria os clones posteriores.
  const clonesAfter = originalSlides.map(slide => {
    const clone = slide.cloneNode(true);

    clone.classList.add('is-clone');
    clone.setAttribute('aria-hidden', 'true');
    clone.inert = true;

    return clone;
  });

  clonesBefore.reverse().forEach(clone => {
    track.insertBefore(clone, track.firstChild);
  });

  clonesAfter.forEach(clone => {
    track.appendChild(clone);
  });

  // Todos os slides, incluindo os clones.
  const allSlides = Array.from(
    track.querySelectorAll('.carousel-slide')
  );

  // Começa no primeiro slide original.
  let currentIndex = totalOriginal;

  // Criação dos indicadores, caso ainda não existam.
  let dots = Array.from(
    dotsContainer
      ? dotsContainer.querySelectorAll('.carousel-dot')
      : []
  );

  if (dots.length === 0 && dotsContainer) {
    for (let i = 0; i < totalOriginal; i++) {
      const dot = document.createElement('button');

      dot.type = 'button';
      dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Ir para a foto ${i + 1}`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.dataset.index = i;

      dotsContainer.appendChild(dot);
      dots.push(dot);
    }
  }

  // Calcula a distância entre o início de dois slides.
  function getSlideStep() {
    if (allSlides.length === 0) return 0;

    const firstSlide = allSlides[0];
    const rect = firstSlide.getBoundingClientRect();
    const style = window.getComputedStyle(firstSlide);

    const marginRight = parseFloat(style.marginRight) || 0;

    return rect.width + marginRight;
  }

  // Atualiza a posição horizontal do carrossel.
  function updatePosition(smooth = true) {
    const step = getSlideStep();

    const duration = prefersReducedMotion.matches
      ? 0
      : TRANSITION_DURATION;

    if (smooth && duration > 0) {
      track.style.transition =
        `transform ${duration}ms cubic-bezier(0.25, 1, 0.5, 1)`;
    } else {
      track.style.transition = 'none';
    }

    const offset = currentIndex * step;

    track.style.transform = `translate3d(-${offset}px, 0, 0)`;
  }

  // Atualiza os indicadores e o slide ativo.
  function updateUI() {
    const activeIndex =
      ((currentIndex % totalOriginal) + totalOriginal) %
      totalOriginal;

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;

      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });

    allSlides.forEach((slide, index) => {
      slide.classList.toggle(
        'is-active',
        index === currentIndex
      );
    });
  }

  // Finaliza a transição e corrige a posição ao chegar nos clones.
  function finishTransition() {
    if (!isTransitioning) return;

    clearTimeout(transitionSafetyTimeout);
    transitionSafetyTimeout = null;

    isTransitioning = false;

    if (currentIndex >= totalOriginal * 2) {
      currentIndex -= totalOriginal;
    } else if (currentIndex < totalOriginal) {
      currentIndex += totalOriginal;
    }

    // Reposiciona sem animação após a correção dos clones.
    updatePosition(false);
    updateUI();
  }

  // Só considera o fim da animação do próprio track.
  track.addEventListener('transitionend', event => {
    if (event.target !== track) return;
    if (event.propertyName !== 'transform') return;

    finishTransition();
  });

  // Controla o tempo máximo de uma transição.
  function scheduleTransitionSafety() {
    clearTimeout(transitionSafetyTimeout);

    transitionSafetyTimeout = setTimeout(() => {
      finishTransition();
    }, TRANSITION_DURATION + 120);
  }

  // Inicia uma movimentação.
  function moveToIndex(nextIndex, resetTimer = true) {
    if (isTransitioning) return false;

    isTransitioning = true;
    currentIndex = nextIndex;

    updatePosition(true);
    updateUI();

    const duration = prefersReducedMotion.matches
      ? 0
      : TRANSITION_DURATION;

    if (duration === 0) {
      finishTransition();
    } else {
      scheduleTransitionSafety();
    }

    if (resetTimer) {
      resetAutoTimer();
    }

    return true;
  }

  // Avança um slide.
  function nextSlide() {
    return moveToIndex(currentIndex + 1);
  }

  // Volta um slide.
  function prevSlide() {
    return moveToIndex(currentIndex - 1);
  }

  // Vai até um indicador específico.
  function goToSlide(targetIndex) {
    if (
      !Number.isInteger(targetIndex) ||
      targetIndex < 0 ||
      targetIndex >= totalOriginal
    ) {
      return;
    }

    const currentActive =
      ((currentIndex % totalOriginal) + totalOriginal) %
      totalOriginal;

    let diff = targetIndex - currentActive;

    // Escolhe o caminho mais curto no carrossel infinito.
    if (diff > totalOriginal / 2) {
      diff -= totalOriginal;
    } else if (diff < -totalOriginal / 2) {
      diff += totalOriginal;
    }

    moveToIndex(currentIndex + diff);
  }

  // Limpa o temporizador automático.
  function clearAutoTimer() {
    if (autoTimerId !== null) {
      clearTimeout(autoTimerId);
      autoTimerId = null;
    }

    timerStartedAt = null;
  }

  // Agenda o próximo avanço automático.
  function startAutoTimer() {
    if (!canPlay() || autoTimerId !== null) return;

    timerStartedAt = performance.now();

    autoTimerId = setTimeout(() => {
      autoTimerId = null;
      timerStartedAt = null;
      remainingTime = DURATION_MS;

      if (!canPlay()) return;

      const moved = moveToIndex(currentIndex + 1, false);

      if (moved) {
        startAutoTimer();
      } else {
        startAutoTimer();
      }
    }, remainingTime);
  }

  // Pausa o temporizador preservando o tempo restante.
  function pauseAutoTimer() {
    if (autoTimerId === null) return;

    clearTimeout(autoTimerId);

    const elapsed = performance.now() - timerStartedAt;

    remainingTime = Math.max(0, remainingTime - elapsed);

    autoTimerId = null;
    timerStartedAt = null;
  }

  // Reinicia a contagem depois de uma interação manual.
  function resetAutoTimer() {
    clearAutoTimer();

    remainingTime = DURATION_MS;

    startAutoTimer();
  }

  // Controles de navegação.
  if (nextBtn) {
    nextBtn.addEventListener('click', nextSlide);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', prevSlide);
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = Number.parseInt(dot.dataset.index, 10);

      goToSlide(index);
    });
  });

  // Pausa quando o mouse entra no carrossel.
  carousel.addEventListener('mouseenter', () => {
    isHovered = true;
    pauseAutoTimer();
  });

  // Retoma quando o mouse sai do carrossel.
  carousel.addEventListener('mouseleave', () => {
    isHovered = false;
    startAutoTimer();
  });

  // Pausa quando a aba fica em segundo plano.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pauseAutoTimer();
    } else {
      startAutoTimer();
    }
  });

  // Respeita mudanças na preferência de movimento do usuário.
  prefersReducedMotion.addEventListener('change', event => {
    if (event.matches) {
      isPlaying = false;
      pauseAutoTimer();
      updatePosition(false);
    } else {
      isPlaying = true;
      startAutoTimer();
    }
  });

  // Navegação por teclado.
  carousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prevSlide();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      nextSlide();
    }
  });

  // Suporte a gestos de deslizar (swipe).
  let touchStartX = 0;

  viewport.addEventListener('touchstart', event => {
    if (!event.changedTouches.length) return;

    touchStartX = event.changedTouches[0].clientX;

    isTouching = true;
    pauseAutoTimer();
  }, { passive: true });

  viewport.addEventListener('touchend', event => {
    if (!event.changedTouches.length) return;

    const touchEndX = event.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    isTouching = false;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    } else {
      startAutoTimer();
    }
  }, { passive: true });

  // Também retoma o temporizador se o gesto for cancelado.
  viewport.addEventListener('touchcancel', () => {
    isTouching = false;
    startAutoTimer();
  }, { passive: true });

  // Recalcula a posição após o redimensionamento.
  window.addEventListener('resize', () => {
    if (resizeFrame !== null) {
      cancelAnimationFrame(resizeFrame);
    }

    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = null;

      // Não interrompe uma transição em andamento.
      if (!isTransitioning) {
        updatePosition(false);
      }
    });
  });

  // Ajusta a posição depois do carregamento completo.
  window.addEventListener('load', () => {
    if (!isTransitioning) {
      updatePosition(false);
      updateUI();
    }
  });

  // Inicialização.
  updatePosition(false);
  updateUI();
  startAutoTimer();
}

// Rolagem suave entre as seções da página.
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const targetId = anchor.getAttribute('href');

      if (!targetId || targetId === '#') return;

      const target = document.getElementById(
        targetId.slice(1)
      );

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });
}
