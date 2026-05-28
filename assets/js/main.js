/* ================================================
   NOMADJANO — Main JS
   ================================================ */

(function () {
  'use strict';

  /* -----------------------------------------------
     NAV — scroll behavior + mobile menu
  ----------------------------------------------- */

  const nav        = document.getElementById('nav');
  const menuBtn    = document.getElementById('menuBtn');
  const closeMenu  = document.getElementById('closeMenu');
  const mobileMenu = document.getElementById('mobileMenu');

  let menuOpen = false;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  function openMenu() {
    menuOpen = true;
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    menuBtn.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    menuOpen = false;
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuBtn.classList.remove('open');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', () => (menuOpen ? closeMobileMenu() : openMenu()));
  if (closeMenu) closeMenu.addEventListener('click', closeMobileMenu);

  document.querySelectorAll('.mobile-menu__link').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) closeMobileMenu();
  });

  /* -----------------------------------------------
     SMOOTH ANCHOR SCROLL
  ----------------------------------------------- */

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* -----------------------------------------------
     SCROLL PROGRESS BAR
  ----------------------------------------------- */

  const progressBar = document.getElementById('scrollProgress');

  function updateProgress() {
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const progress   = docHeight > 0 ? window.scrollY / docHeight : 0;
    progressBar.style.transform = `scaleX(${progress})`;
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* -----------------------------------------------
     SCROLL REVEAL — IntersectionObserver
  ----------------------------------------------- */

  const revealOpts = { threshold: 0.08, rootMargin: '0px 0px -48px 0px' };

  // Generic reveal (reveal-up, reveal-fade, reveal-clip, section-divider)
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, revealOpts);

  document.querySelectorAll(
    '.reveal-up, .reveal-fade, .reveal-clip, .section-divider'
  ).forEach((el) => revealObserver.observe(el));

  // Grid containers — trigger stagger on all children simultaneously
  const gridObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target
          .querySelectorAll('.servicio-card, .proyecto-card, .numero')
          .forEach((card) => card.classList.add('is-visible'));
        gridObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -32px 0px' });

  document.querySelectorAll(
    '.servicios__grid, .trabajo__grid, .numeros__grid'
  ).forEach((g) => gridObserver.observe(g));

  /* -----------------------------------------------
     COUNT-UP ANIMATION
  ----------------------------------------------- */

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function animateCountUp(el) {
    const target   = parseInt(el.dataset.countTarget, 10);
    const prefix   = el.dataset.countPrefix  || '';
    const suffix   = el.dataset.countSuffix  || '';
    const duration = 1800;
    const start    = performance.now();

    el.classList.add('counting');

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutExpo(progress);
      const current  = Math.round(eased * target);

      el.textContent = prefix + current + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = prefix + target + suffix;
        el.classList.remove('counting');
      }
    }

    requestAnimationFrame(tick);
  }

  function animateTypewriter(el) {
    const full     = el.textContent.trim();
    const duration = 60; // ms per char
    el.textContent = '';
    let i = 0;

    function type() {
      if (i < full.length) {
        el.textContent += full[i++];
        setTimeout(type, duration);
      }
    }

    type();
  }

  // Trigger count-up when numeros grid enters view
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-count-target]').forEach((el) => {
          setTimeout(() => animateCountUp(el), 200);
        });
        entry.target.querySelectorAll('.numero__value--typewriter').forEach((el) => {
          setTimeout(() => animateTypewriter(el), 200);
        });
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const numerosGrid = document.querySelector('.numeros__grid');
  if (numerosGrid) countObserver.observe(numerosGrid);

  /* -----------------------------------------------
     PARALLAX — hero content + orbs on scroll
  ----------------------------------------------- */

  const heroContent = document.getElementById('heroContent');
  const orbs        = document.querySelectorAll('.hero__orb');
  const heroSection = document.querySelector('.hero');

  if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y          = window.scrollY;
          const heroHeight = heroSection ? heroSection.offsetHeight : 800;

          // Hero content: fade + slide up as user scrolls
          if (heroContent && y < heroHeight) {
            const progress = y / heroHeight;
            heroContent.style.transform = `translateY(${y * 0.25}px)`;
            heroContent.style.opacity   = Math.max(0, 1 - progress * 1.6);
          }

          // Orbs: individual parallax speeds
          orbs.forEach((orb, i) => {
            const speed = (i + 1) * 0.14;
            orb.style.transform = `translateY(${y * speed}px)`;
          });

          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* -----------------------------------------------
     CURSOR GLOW — desktop only
  ----------------------------------------------- */

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    let mouseX = 0, mouseY = 0;
    let glowX  = 0, glowY  = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    (function loop() {
      glowX += (mouseX - glowX) * 0.07;
      glowY += (mouseY - glowY) * 0.07;
      glow.style.left = glowX + 'px';
      glow.style.top  = glowY + 'px';
      requestAnimationFrame(loop);
    })();

    document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { glow.style.opacity = '1'; });
  }

  /* -----------------------------------------------
     ACTIVE NAV LINK
  ----------------------------------------------- */

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__links a:not(.nav__cta)');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.style.color = link.getAttribute('href') === `#${id}`
            ? 'var(--text-primary)'
            : '';
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach((s) => sectionObserver.observe(s));

  /* -----------------------------------------------
     SCREENSHOT IMAGES — fade in on load
  ----------------------------------------------- */

  document.querySelectorAll('.proyecto-card__screenshot').forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
    }
  });

  /* -----------------------------------------------
     CARD TILT 3D — desktop hover
  ----------------------------------------------- */

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {

    document.querySelectorAll(
      '.servicio-card, .proyecto-card:not(.proyecto-card--coming)'
    ).forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect  = card.getBoundingClientRect();
        const dx    = (e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2);
        const dy    = (e.clientY - rect.top   - rect.height / 2) / (rect.height / 2);
        const rot   = 4;
        card.style.transform    = `translateY(-6px) rotateY(${dx * rot}deg) rotateX(${-dy * rot}deg)`;
        card.style.transition   = 'transform 0.1s ease, box-shadow 0.4s ease, border-color 0.4s ease';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform  = '';
        card.style.transition = '';
      });
    });
  }

})();
