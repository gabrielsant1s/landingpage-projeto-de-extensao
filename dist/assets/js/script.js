/**
 * Pão de Mestre — Carrossel Infinito Automático (1,5s) & Interatividade
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

  const originalSlides = Array.from(track.querySelectorAll('.carousel-slide'));
  const totalOriginal = originalSlides.length;
  if (totalOriginal === 0) return;

  // Configurações
  const DURATION_MS = 1500; // 1,5 segundos por slide (conforme solicitado)
  const TRANSITION_DURATION = 420; // ms da transição suave
  let isPlaying = true;
  let isTransitioning = false;
  let timerId = null;
  let animationStart = null;
  let progressAnimFrame = null;
  let pausedProgressTime = 0;
  let isHovered = false;

  // Clona os slides para garantir loop infinito fluido e ininterrupto
  // Duplicamos os slides antes e depois
  const clonesBefore = originalSlides.map(slide => {
    const clone = slide.cloneNode(true);
    clone.classList.add('is-clone');
    clone.setAttribute('aria-hidden', 'true');
    return clone;
  });

  const clonesAfter = originalSlides.map(slide => {
    const clone = slide.cloneNode(true);
    clone.classList.add('is-clone');
    clone.setAttribute('aria-hidden', 'true');
    return clone;
  });

  clonesBefore.reverse().forEach(clone => track.insertBefore(clone, track.firstChild));
  clonesAfter.forEach(clone => track.appendChild(clone));

  // Todos os slides atuais no DOM (totalOriginal * 3)
  let allSlides = Array.from(track.querySelectorAll('.carousel-slide'));
  // O índice real inicial aponta para o primeiro slide original
  let currentIndex = totalOriginal; // índice dentro de allSlides

  // Gera os indicadores (dots) se não existirem ou atualiza os existentes
  let dots = Array.from(dotsContainer ? dotsContainer.querySelectorAll('.carousel-dot') : []);
  if (dots.length === 0 && dotsContainer) {
    dotsContainer.innerHTML = '';
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

  // Calcula a largura de 1 slide + espaçamento
  function getSlideStep() {
    if (allSlides.length === 0) return 0;
    const firstRect = allSlides[0].getBoundingClientRect();
    const style = window.getComputedStyle(allSlides[0]);
    const marginRight = parseFloat(style.marginRight) || 0;
    return firstRect.width + marginRight;
  }

  // Posiciona o track sem animação
  function updatePosition(smooth = true) {
    const step = getSlideStep();
    if (smooth) {
      track.style.transition = `transform ${TRANSITION_DURATION}ms cubic-bezier(0.25, 1, 0.5, 1)`;
    } else {
      track.style.transition = 'none';
    }
    const offset = currentIndex * step;
    track.style.transform = `translate3d(-${offset}px, 0, 0)`;
  }

  // Atualiza indicadores (dots)
  function updateUI() {
    const activeIndex = ((currentIndex % totalOriginal) + totalOriginal) % totalOriginal;

    dots.forEach((dot, idx) => {
      const isActive = idx === activeIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Classe ativa nos cards
    allSlides.forEach((slide, idx) => {
      slide.classList.toggle('is-active', idx === currentIndex);
    });
  }

  let transitionSafetyTimeout = null;

  // Reposiciona sem transição caso caia na área dos clones
  function handleTransitionEnd() {
    clearTimeout(transitionSafetyTimeout);
    isTransitioning = false;
    
    if (currentIndex >= totalOriginal * 2) {
      // Passou do último original para os clones depois
      currentIndex -= totalOriginal;
      updatePosition(false);
    } else if (currentIndex < totalOriginal) {
      // Foi para trás dos originais nos clones antes
      currentIndex += totalOriginal;
      updatePosition(false);
    }
    updateUI();
  }

  track.addEventListener('transitionend', handleTransitionEnd);

  function scheduleTransitionSafety() {
    clearTimeout(transitionSafetyTimeout);
    transitionSafetyTimeout = setTimeout(() => {
      if (isTransitioning) {
        handleTransitionEnd();
      }
    }, TRANSITION_DURATION + 120);
  }

  // Avança para o próximo slide
  function nextSlide() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex++;
    updatePosition(true);
    scheduleTransitionSafety();
    updateUI();
    resetProgress();
  }

  // Volta para o slide anterior
  function prevSlide() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex--;
    updatePosition(true);
    scheduleTransitionSafety();
    updateUI();
    resetProgress();
  }

  // Vai para um slide específico
  function goToSlide(targetIndex) {
    if (isTransitioning) return;
    isTransitioning = true;
    const currentActive = ((currentIndex % totalOriginal) + totalOriginal) % totalOriginal;
    const diff = targetIndex - currentActive;
    currentIndex += diff;
    updatePosition(true);
    scheduleTransitionSafety();
    updateUI();
    resetProgress();
  }

  // Rotação automática (1,5 segundos)
  function animateProgress(timestamp) {
    if (!isPlaying || isHovered) return;

    if (!animationStart) animationStart = timestamp - pausedProgressTime;
    const elapsed = timestamp - animationStart;

    if (elapsed >= DURATION_MS) {
      nextSlide();
      animationStart = timestamp;
      pausedProgressTime = 0;
    }

    progressAnimFrame = requestAnimationFrame(animateProgress);
  }

  function startTimer() {
    if (progressAnimFrame) cancelAnimationFrame(progressAnimFrame);
    animationStart = performance.now() - pausedProgressTime;
    progressAnimFrame = requestAnimationFrame(animateProgress);
  }

  function pauseTimer() {
    if (progressAnimFrame) {
      cancelAnimationFrame(progressAnimFrame);
      progressAnimFrame = null;
    }
    if (animationStart) {
      pausedProgressTime = performance.now() - animationStart;
    }
  }

  function resetProgress() {
    pausedProgressTime = 0;
    animationStart = performance.now();
    if (isPlaying && !isHovered) {
      startTimer();
    }
  }

  // Controles de clique
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.index, 10);
      goToSlide(idx);
    });
  });

  // Pausa no Hover para melhor experiência de visualização das fotos
  carousel.addEventListener('mouseenter', () => {
    isHovered = true;
    pauseTimer();
  });

  carousel.addEventListener('mouseleave', () => {
    isHovered = false;
    if (isPlaying) {
      startTimer();
    }
  });

  // Pausa quando a aba fica em segundo plano
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pauseTimer();
    } else if (isPlaying && !isHovered) {
      startTimer();
    }
  });

  // Navegação por teclado quando o carrossel estiver focado
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  });

  // Suporte a Touch Gestures (Swipe em dispositivos móveis)
  let touchStartX = 0;
  let touchEndX = 0;

  viewport.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    isHovered = true;
    pauseTimer();
  }, { passive: true });

  viewport.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    isHovered = false;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    if (isPlaying) {
      startTimer();
    }
  }, { passive: true });

  // Recalcular posições no redimensionamento da janela e no carregamento completo
  window.addEventListener('resize', () => {
    updatePosition(false);
  });

  window.addEventListener('load', () => {
    updatePosition(false);
    updateUI();
  });

  // Inicialização inicial
  updatePosition(false);
  updateUI();
  resetProgress();
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}