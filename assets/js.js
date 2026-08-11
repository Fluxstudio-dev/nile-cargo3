// Scripts
    // Scroll Reveal
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    revealElements.forEach(el => revealObserver.observe(el));

    // Counter Animation
    const counterElements = document.querySelectorAll('.counter-number');
    const animateCounter = (el) => {
      const text = el.textContent.trim();
      const hasPlus = text.includes('+');
      const hasK = text.includes('k');
      const hasPercent = text.includes('%');
      let targetNum = parseFloat(text.replace(/[^0-9.]/g, ''));
      if (hasK) targetNum *= 1000;
      const duration = 2000;
      const startTime = performance.now();
      const startNum = 0;
      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(startNum + (targetNum - startNum) * easeOut);
        let display = current;
        if (hasK && targetNum >= 1000) display = (current / 1000).toFixed(0) + 'k';
        el.textContent = display + (hasPlus ? '+' : '') + (hasPercent ? '%' : '');
        if (progress < 1) requestAnimationFrame(updateCounter);
        else {
          let final = targetNum;
          if (hasK && targetNum >= 1000) final = (targetNum / 1000).toFixed(0) + 'k';
          el.textContent = final + (hasPlus ? '+' : '') + (hasPercent ? '%' : '');
        }
      };
      requestAnimationFrame(updateCounter);
    };
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counters = entry.target.querySelectorAll('.counter-number');
          counters.forEach((counter, index) => setTimeout(() => animateCounter(counter), index * 150));
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    const counterSection = document.querySelector('.counter-section');
    if (counterSection) counterObserver.observe(counterSection);

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      let ticking = false;
      function updateNavbar() {
        if (window.scrollY > 80) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
        ticking = false;
      }
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(updateNavbar);
          ticking = true;
        }
      }, { passive: true });
    }

    // Mobile Menu Toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
      });
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileMenuToggle.classList.remove('active');
          navLinks.classList.remove('active');
          document.body.style.overflow = '';
        });
      });
    }

    // Projects Slider
    const container = document.getElementById('sliderContainer');
    const track = document.getElementById('projectsTrack');
    if (container && track) {
      const originalCards = Array.from(track.children);
      originalCards.forEach(card => track.appendChild(card.cloneNode(true)));
      const cardWidth = 260;
      const gap = 20;
      const stepSize = cardWidth + gap;
      let currentIndex = 0;
      let autoSlideTimer = null;
      let isHovered = false;
      let isDragging = false;
      let startX = 0;
      let currentTranslate = 0;
      let prevTranslate = 0;

      function moveNext() {
        if (isHovered || isDragging) return;
        currentIndex++;
        track.style.transition = 'transform 0.95s cubic-bezier(0.25, 1, 0.35, 1)';
        currentTranslate = -(currentIndex * stepSize);
        track.style.transform = `translateX(${currentTranslate}px)`;
        if (currentIndex >= originalCards.length) {
          setTimeout(() => {
            track.style.transition = 'none';
            currentIndex = 0;
            currentTranslate = 0;
            track.style.transform = `translateX(0px)`;
          }, 950);
        }
      }
      function startAutoSlide() { stopAutoSlide(); autoSlideTimer = setInterval(moveNext, 5000); }
      function stopAutoSlide() { if (autoSlideTimer) clearInterval(autoSlideTimer); }
      container.addEventListener('mouseenter', () => { isHovered = true; stopAutoSlide(); });
      container.addEventListener('mouseleave', () => { isHovered = false; if (!isDragging) startAutoSlide(); });
      container.addEventListener('mousedown', dragStart);
      window.addEventListener('mouseup', dragEnd);
      window.addEventListener('mousemove', dragMove);
      container.addEventListener('touchstart', dragStart);
      window.addEventListener('touchend', dragEnd);
      window.addEventListener('touchmove', dragMove);

      function dragStart(e) {
        isDragging = true; stopAutoSlide();
        startX = getX(e); prevTranslate = currentTranslate;
        track.style.transition = 'none';
      }
      function dragMove(e) {
        if (!isDragging) return;
        const currentX = getX(e);
        const walk = currentX - startX;
        currentTranslate = prevTranslate + walk;
        track.style.transform = `translateX(${currentTranslate}px)`;
      }
      function dragEnd() {
        if (!isDragging) return;
        isDragging = false;
        currentIndex = Math.round(Math.abs(currentTranslate) / stepSize);
        if (currentIndex >= originalCards.length) currentIndex = 0;
        track.style.transition = 'transform 0.7s cubic-bezier(0.25, 1, 0.35, 1)';
        currentTranslate = -(currentIndex * stepSize);
        track.style.transform = `translateX(${currentTranslate}px)`;
        startAutoSlide();
      }
      function getX(e) { return e.type.includes('touch') ? e.touches[0].clientX : e.clientX; }
      startAutoSlide();
    }

    // Hero Slides
    const slides = document.querySelectorAll('.slide');
    const heroTitle = document.querySelector('.hero-title');
    const prevBtn = document.querySelector('.prev-arrow');
    const nextBtn = document.querySelector('.next-arrow');
    if (slides.length && heroTitle && prevBtn && nextBtn) {
      let currentSlide = 0;
      function changeSlide(index) {
        slides.forEach((slide, i) => {
          slide.classList.remove('active');
          if (i === index) slide.classList.add('active');
        });
        heroTitle.style.animation = 'none';
        heroTitle.offsetHeight;
        heroTitle.style.animation = 'fadeInUp 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards';
      }
      nextBtn.addEventListener('click', () => { currentSlide = (currentSlide + 1) % slides.length; changeSlide(currentSlide); });
      prevBtn.addEventListener('click', () => { currentSlide = (currentSlide - 1 + slides.length) % slides.length; changeSlide(currentSlide); });
      setInterval(() => { currentSlide = (currentSlide + 1) % slides.length; changeSlide(currentSlide); }, 5000);
    }

    // Custom Cursor
    (function() {
      const cursor = document.querySelector(".custom-cursor");
      if (!cursor) return;
      const dot = document.querySelector(".cursor-dot");
      const ring = document.querySelector(".cursor-ring");
      const hover = document.querySelector(".cursor-hover");
      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let ringX = mouseX;
      let ringY = mouseY;
      document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        dot.style.left = mouseX + "px"; dot.style.top = mouseY + "px";
      });
      function animate() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        ring.style.left = ringX + "px"; ring.style.top = ringY + "px";
        hover.style.left = ringX + "px"; hover.style.top = ringY + "px";
        requestAnimationFrame(animate);
      }
      animate();
      const clickable = document.querySelectorAll('a, button, input, textarea, select, label, [role="button"], .cursor-hover-effect, .project-card, .blog-card, .counter-card, .client');
      clickable.forEach(item => {
        item.addEventListener("mouseenter", () => cursor.classList.add("hover"));
        item.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
      });
    })();


    