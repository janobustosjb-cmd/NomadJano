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

  const progressBar   = document.getElementById('scrollProgress');

  function updateProgress() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress  = docHeight > 0 ? window.scrollY / docHeight : 0;
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
          .querySelectorAll('.servicio-card, .proyecto-card')
          .forEach((card) => card.classList.add('is-visible'));
        gridObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -32px 0px' });

  document.querySelectorAll(
    '.servicios__grid, .trabajo__grid'
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
        entry.target.querySelectorAll('.count-value--typewriter').forEach((el) => {
          setTimeout(() => animateTypewriter(el), 200);
        });
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const heroStatsGrid = document.querySelector('.hero__panel-stats');
  if (heroStatsGrid) countObserver.observe(heroStatsGrid);

  /* -----------------------------------------------
     PARALLAX — hero content + orbs on scroll
  ----------------------------------------------- */

  const heroContent = document.getElementById('heroContent');
  const heroText     = document.querySelector('.hero__text');
  const heroVisual   = document.querySelector('.hero__visual');
  const orbs        = document.querySelectorAll('.hero__orb');
  const heroSection = document.querySelector('.hero');
  if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y          = window.scrollY;
          const heroHeight = heroSection ? heroSection.offsetHeight : 800;

          // Hero: text and visual drift at different speeds for depth, fade together
          if (heroContent && y < heroHeight) {
            const progress = y / heroHeight;
            if (heroText)   heroText.style.transform   = `translateY(${y * 0.3}px)`;
            if (heroVisual) heroVisual.style.transform = `translateY(${y * 0.14}px)`;
            heroContent.style.opacity = Math.max(0, 1 - progress * 1.6);
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
     RUNE FIELD — cursor-reactive symbol swarm
  ----------------------------------------------- */

  (function initRuneField() {
    const canvas = document.getElementById('runeField');
    if (!canvas || !window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;

    const ctx = canvas.getContext('2d');
    const RUNE_COUNT = 11;
    const COUNT      = 170;
    const INFLUENCE  = 170;
    const PUSH       = 7;
    const SPRING     = 0.08;
    const DAMPING    = 0.82;

    const runeImages = Array.from({ length: RUNE_COUNT }, (_, i) => {
      const img = new Image();
      img.src = `./assets/runes/rune-${String(i + 1).padStart(2, '0')}.png`;
      return img;
    });

    let width, height, dpr, particles = [];
    let mouseX = -9999, mouseY = -9999;

    function scatter() {
      particles = Array.from({ length: COUNT }, () => {
        const baseX = Math.random() * width;
        const baseY = Math.random() * height;
        const img   = runeImages[Math.floor(Math.random() * runeImages.length)];
        return {
          baseX, baseY, x: baseX, y: baseY, vx: 0, vy: 0,
          size: 14 + Math.random() * 12,
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.004,
          img,
          opacityBase: 0.5 + Math.random() * 0.5,
          opacity: 0
        };
      });
    }

    function resize() {
      dpr    = Math.min(window.devicePixelRatio || 1, 2);
      width  = window.innerWidth;
      height = window.innerHeight;
      canvas.width  = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width  = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scatter();
    }

    function drawRune(p) {
      if (p.opacity <= 0.01 || !p.img.naturalWidth) return;

      const h = p.size;
      const w = h * (p.img.naturalWidth / p.img.naturalHeight);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = p.opacity;
      ctx.shadowColor = 'rgba(210, 210, 225, 0.5)';
      ctx.shadowBlur  = 2;
      ctx.drawImage(p.img, -w / 2, -h / 2, w, h);
      ctx.restore();
    }

    function tick() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        const dx       = p.x - mouseX;
        const dy       = p.y - mouseY;
        const dist     = Math.sqrt(dx * dx + dy * dy) || 1;
        const proximity = Math.max(0, 1 - dist / INFLUENCE);

        if (proximity > 0) {
          const force = proximity * PUSH;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Spring back toward resting position
        p.vx += (p.baseX - p.x) * SPRING;
        p.vy += (p.baseY - p.y) * SPRING;

        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x  += p.vx;
        p.y  += p.vy;
        p.angle += p.spin;

        // Visibility tracks the same proximity that drives the push — stays in sync
        p.opacity = proximity * proximity * p.opacityBase;

        drawRune(p);
      });

      requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mouseX = -9999;
      mouseY = -9999;
    });

    window.addEventListener('resize', resize, { passive: true });
    resize();
    requestAnimationFrame(tick);
  })();

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
     PACK BUILDER
  ----------------------------------------------- */

  const packItems      = document.querySelectorAll('.pack-item:not(.pack-item--radio)');
  const packRadios     = document.querySelectorAll('input[name="pack-mant"]');
  const packTotalEl    = document.getElementById('packTotalVal');
  const packMantEl     = document.getElementById('packMantVal');
  const packLinesEl    = document.getElementById('packLines');
  const packEmptyEl    = document.getElementById('packEmpty');
  const packMantCat    = document.getElementById('pack-mant-category');
  const packMantRow    = document.getElementById('pack-mant-row');

  function updatePack() {
    const selected    = document.querySelectorAll('.pack-item.pack-item--selected:not(.pack-item--radio)');
    const auditIds    = ['audit-general'];
    const hasNonAudit = [...selected].some((el) => !auditIds.includes(el.dataset.id));
    const onlyAudits  = selected.length > 0 && !hasNonAudit;

    // Show/hide maintenance based on selection
    if (packMantCat) packMantCat.style.display = onlyAudits ? 'none' : '';
    if (packMantRow) packMantRow.style.display  = onlyAudits ? 'none' : '';

    let total = 0;
    packLinesEl.innerHTML = '';

    let hasApprox = false;
    selected.forEach((item) => {
      total += parseInt(item.dataset.price, 10);
      if (item.dataset.approx) hasApprox = true;
      const name    = item.querySelector('.pack-item__name').textContent;
      const price   = item.dataset.price;
      const prefix  = item.dataset.approx ? 'desde ' : '';
      const line    = document.createElement('div');
      line.className = 'pack-summary__line';
      line.innerHTML = `<span class="pack-summary__line-name">${name}</span><span class="pack-summary__line-price">${prefix}$${price}</span>`;
      packLinesEl.appendChild(line);
    });

    if (selected.length === 0) {
      const emptyText = document.createElement('p');
      emptyText.className = 'pack-summary__empty';
      emptyText.textContent = packEmptyEl
        ? packEmptyEl.textContent
        : 'Seleccioná servicios para ver el resumen.';
      packLinesEl.appendChild(emptyText);
    }

    const checkedRadio = document.querySelector('input[name="pack-mant"]:checked');
    const mantVal      = checkedRadio ? checkedRadio.value : '60';

    packTotalEl.textContent = total > 0 ? (hasApprox ? 'desde $' : '$') + total.toLocaleString('es') : '$0';
    if (!onlyAudits) packMantEl.textContent = '$' + mantVal + '/mes';
  }

  // Toggle service items
  packItems.forEach((item) => {
    item.addEventListener('click', () => {
      item.classList.toggle('pack-item--selected');
      updatePack();
    });
  });

  // Radio mantenimiento
  packRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.pack-item--radio').forEach((label) => {
        label.classList.toggle('pack-item--selected', label.querySelector('input').checked);
      });
      updatePack();
    });
  });

  // Email CTA — pre-compose with pack summary
  const packEmailBtn = document.getElementById('packEmailBtn');
  if (packEmailBtn) {
    packEmailBtn.addEventListener('click', () => {
      const selected = document.querySelectorAll('.pack-item.pack-item--selected:not(.pack-item--radio)');
      if (selected.length === 0) return;

      let total = 0;
      const lines = [];
      selected.forEach((item) => {
        const name  = item.querySelector('.pack-item__name').textContent;
        const price = parseInt(item.dataset.price, 10);
        total += price;
        lines.push(`• ${name} ($${price})`);
      });

      const checkedRadio = document.querySelector('input[name="pack-mant"]:checked');
      const mantVal   = checkedRadio ? checkedRadio.value : '60';
      const mantLabel = checkedRadio ? checkedRadio.closest('.pack-item').querySelector('.pack-item__name').textContent : 'Mantenimiento Base';

      const subject = encodeURIComponent('Mi pack personalizado — NomadJano');
      const body    = encodeURIComponent(
        `Hola! Armé mi pack en nomadjano.com:\n\n${lines.join('\n')}\n\nTotal sistema: $${total}\n${mantLabel}: $${mantVal}/mes\n\n¿Podés darme más información?`
      );

      window.open(`mailto:nomadjano@gmail.com?subject=${subject}&body=${body}`, '_blank');
    });
  }

  // Init
  if (packLinesEl) updatePack();

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
