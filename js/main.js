/* ==========================================================================
   ABHISHEK PHOTOGRAPHY — MASTER INTERACTIVE LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileMenu();
  initHeroSlider();
  initPortfolioFilter();
  initLightbox();
  initScrollReveal();
  initContactForm();
  initBackToTop();
  initCurrentYear();
});

/* --------------------------------------------------------------------------
   1. STICKY HEADER SCROLL EFFECT
   -------------------------------------------------------------------------- */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* --------------------------------------------------------------------------
   2. MOBILE NAVIGATION DRAWER
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  if (!toggleBtn || !drawer) return;

  const toggleMenu = () => {
    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
      drawer.classList.remove('open');
      toggleBtn.classList.remove('active');
      document.body.style.overflow = '';
    } else {
      drawer.classList.add('open');
      toggleBtn.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  toggleBtn.addEventListener('click', toggleMenu);

  // Close when clicking nav links
  const drawerLinks = drawer.querySelectorAll('.mobile-nav-link, .btn');
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      toggleBtn.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

/* --------------------------------------------------------------------------
   3. CINEMATIC 3-SECOND HERO SLIDESHOW
   -------------------------------------------------------------------------- */
function initHeroSlider() {
  const slider = document.querySelector('.hero-slider-section');
  if (!slider) return;

  const slides = slider.querySelectorAll('.hero-slide');
  const indicators = slider.querySelectorAll('.hero-indicator-bar');
  const currentBadge = slider.querySelector('.hero-slide-badge span.current');
  const totalBadge = slider.querySelector('.hero-slide-badge span.total');

  if (!slides.length) return;

  let currentSlide = 0;
  const slideCount = slides.length;
  let slideInterval = null;
  const SLIDE_DURATION = 3000; // 3 seconds per user requirement

  if (totalBadge) {
    totalBadge.textContent = String(slideCount).padStart(2, '0');
  }

  function goToSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });

    if (indicators.length) {
      indicators.forEach((bar, i) => {
        bar.classList.toggle('active', i === index);
      });
    }

    if (currentBadge) {
      currentBadge.textContent = String(index + 1).padStart(2, '0');
    }

    currentSlide = index;
  }

  function nextSlide() {
    const nextIndex = (currentSlide + 1) % slideCount;
    goToSlide(nextIndex);
  }

  function startAutoplay() {
    stopAutoplay();
    slideInterval = setInterval(nextSlide, SLIDE_DURATION);
  }

  function stopAutoplay() {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  }

  // Indicator clicks
  indicators.forEach((bar, index) => {
    bar.addEventListener('click', () => {
      goToSlide(index);
      startAutoplay();
    });
  });

  // Start autoplay immediately
  goToSlide(0);
  startAutoplay();

  // Pause on mouseenter, resume on mouseleave
  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);

  // Mobile Touch Swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX - 50) {
      // Swipe left
      nextSlide();
      startAutoplay();
    } else if (touchEndX > touchStartX + 50) {
      // Swipe right
      const prevIndex = (currentSlide - 1 + slideCount) % slideCount;
      goToSlide(prevIndex);
      startAutoplay();
    }
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   4. PORTFOLIO CATEGORY FILTER
   -------------------------------------------------------------------------- */
function initPortfolioFilter() {
  const filterNav = document.querySelector('.portfolio-filter-nav');
  if (!filterNav) return;

  const filterBtns = filterNav.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.masonry-item[data-category]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      items.forEach(item => {
        const itemCat = item.getAttribute('data-category');
        if (filter === 'all' || itemCat.includes(filter)) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(20px)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   5. LIGHTBOX ENGINE
   -------------------------------------------------------------------------- */
function initLightbox() {
  const lightbox = document.getElementById('globalLightbox');
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxTitle = lightbox.querySelector('.lightbox-caption-title');
  const lightboxCat = lightbox.querySelector('.lightbox-caption-cat');
  const lightboxCounter = lightbox.querySelector('.lightbox-counter');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  let galleryItems = [];
  let currentIndex = 0;

  // Collect all elements with data-lightbox attribute or within masonry/gallery
  const clickableItems = document.querySelectorAll('[data-lightbox], .masonry-item, .gallery-card');

  clickableItems.forEach((item, index) => {
    const img = item.querySelector('img');
    if (!img) return;

    const title = item.querySelector('.masonry-title, .capture-card-title, h3, h4')?.textContent || 'Abhishek Photography Masterpiece';
    const cat = item.querySelector('.masonry-category, .capture-card-tag')?.textContent || 'Luxury Wedding Photography';
    const src = item.getAttribute('data-full-img') || img.src;

    galleryItems.push({ src, title, cat, element: item });

    item.addEventListener('click', (e) => {
      e.preventDefault();
      // Recalculate index based on currently visible items
      const visibleIndex = galleryItems.findIndex(g => g.src === src);
      openLightbox(visibleIndex >= 0 ? visibleIndex : index);
    });
  });

  function openLightbox(index) {
    if (!galleryItems.length) return;
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateLightbox() {
    const item = galleryItems[currentIndex];
    if (!item) return;

    lightboxImg.src = item.src;
    lightboxImg.alt = item.title;
    if (lightboxTitle) lightboxTitle.textContent = item.title;
    if (lightboxCat) lightboxCat.textContent = item.cat;
    if (lightboxCounter) {
      lightboxCounter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(galleryItems.length).padStart(2, '0')}`;
    }
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    updateLightbox();
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    updateLightbox();
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (nextBtn) nextBtn.addEventListener('click', showNext);
  if (prevBtn) prevBtn.addEventListener('click', showPrev);

  // Click outside to close
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
}

/* --------------------------------------------------------------------------
   6. SCROLL REVEAL OBSERVER
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   7. CONTACT FORM & WHATSAPP INTEGRATION
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('bookingEnquiryForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#fullName')?.value.trim() || 'Guest';
    const phone = form.querySelector('#phoneNumber')?.value.trim() || '';
    const email = form.querySelector('#emailAddress')?.value.trim() || '';
    const eventType = form.querySelector('#eventType')?.value || 'Wedding';
    const eventDate = form.querySelector('#eventDate')?.value || 'Upcoming Date';
    const location = form.querySelector('#eventLocation')?.value.trim() || 'Roorkee / Haridwar';
    const msg = form.querySelector('#eventMessage')?.value.trim() || 'Interested in booking Abhishek Photography.';

    // Construct professional WhatsApp message
    const waText = encodeURIComponent(
      `*🌟 NEW PHOTOGRAPHY ENQUIRY — ABHISHEK PHOTOGRAPHY*\n\n` +
      `*Name:* ${name}\n` +
      `*Phone:* ${phone}\n` +
      `*Email:* ${email}\n` +
      `*Event Type:* ${eventType}\n` +
      `*Event Date:* ${eventDate}\n` +
      `*Location/Venue:* ${location}\n` +
      `*Details:* ${msg}\n\n` +
      `_Sent via Abhishek Photography Website_`
    );

    const waUrl = `https://wa.me/918755303263?text=${waText}`;

    // Show luxury feedback modal / alert
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span>Redirecting to WhatsApp...</span>`;
    submitBtn.disabled = true;

    setTimeout(() => {
      window.open(waUrl, '_blank');
      submitBtn.innerHTML = `<span>✓ Enquiry Sent!</span>`;
      form.reset();
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }, 4000);
    }, 800);
  });
}

/* --------------------------------------------------------------------------
   8. BACK TO TOP BUTTON
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const backBtn = document.querySelector('.back-to-top');
  if (!backBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backBtn.classList.add('visible');
    } else {
      backBtn.classList.remove('visible');
    }
  }, { passive: true });

  backBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* --------------------------------------------------------------------------
   9. CURRENT YEAR IN FOOTER
   -------------------------------------------------------------------------- */
function initCurrentYear() {
  const yearSpans = document.querySelectorAll('.current-year');
  const currentYear = new Date().getFullYear();
  yearSpans.forEach(span => {
    span.textContent = currentYear;
  });
}
