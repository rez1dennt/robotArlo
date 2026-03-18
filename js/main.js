document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ===== Burger Menu =====
    const burgerToggle = document.getElementById('burger-toggle');
    const navigation = document.getElementById('site-navigation');
    const { body } = document;

    const backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    body.appendChild(backdrop);

    const openMenu = () => {
        body.classList.add('menu-open');
        burgerToggle?.setAttribute('aria-expanded', 'true');
        body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
        body.classList.remove('menu-open');
        burgerToggle?.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
    };

    burgerToggle?.addEventListener('click', () => {
        body.classList.contains('menu-open') ? closeMenu() : openMenu();
    });

    backdrop.addEventListener('click', closeMenu);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && body.classList.contains('menu-open')) closeMenu();
    });

    navigation?.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            if (body.classList.contains('menu-open')) closeMenu();
        });
    });

    // ===== Sticky Header Shadow =====
    const header = document.getElementById('masthead');

    const updateHeaderShadow = () => {
        header?.classList.toggle('scrolled', window.scrollY > 50);
    };

    if (header) {
        window.addEventListener('scroll', updateHeaderShadow, { passive: true });
        updateHeaderShadow();
    }

    // ===== Smooth Scroll =====
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerHeight = header?.offsetHeight ?? 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // ===== Product Gallery =====
    const galleryMainImg = document.getElementById('gallery-main-img');
    const galleryThumbs = document.querySelectorAll('.gallery-thumb');

    if (galleryMainImg && galleryThumbs.length) {
        galleryThumbs.forEach((thumb) => {
            thumb.addEventListener('click', () => {
                const newSrc = thumb.dataset.src;
                if (!newSrc) return;

                galleryMainImg.src = newSrc;
                galleryMainImg.alt = thumb.querySelector('img')?.alt ?? '';
                galleryThumbs.forEach((t) => t.classList.remove('active'));
                thumb.classList.add('active');
            });
        });
    }

    // ===== Product Tabs =====
    const tabItems = document.querySelectorAll('.wc-tabs li');
    const tabPanels = document.querySelectorAll('.wc-tab-panel');

    if (tabItems.length && tabPanels.length) {
        tabItems.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                tabItems.forEach((t) => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                tabPanels.forEach((p) => p.classList.remove('active'));

                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                tabPanels[index]?.classList.add('active');
            });
        });
    }

    // ===== Scroll Reveal Animations =====
    const fadeSelectors = [
        '.advantage-card', '.step-card', '.contact-item', '.problem-stat',
        '.about-grid', '.product-cta-banner', '.form-layout', '.hero-stats'
    ].join(', ');

    const fadeElements = document.querySelectorAll(fadeSelectors);

    if (fadeElements.length && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in', 'visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        fadeElements.forEach((el, index) => {
            el.classList.add('fade-in');
            el.style.transitionDelay = `${(index % 4) * 0.1}s`;
            observer.observe(el);
        });
    }
});
