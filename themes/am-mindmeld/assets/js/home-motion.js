/* home-motion.js — GSAP choreography + homepage interactions.
 *
 * Laws: type prints, it never fades (stepped char reveals). Native scroll only: no pinning,
 * no scrub. Positional motion may ease smoothly; reveals run once. Reduced motion =
 * everything instant.
 *
 * Mindmeld 2.0: SCRAMBLE-TEXT IS RETIRED (brand DNA principle 8, console-era motif). The
 * plugin registration, the character set, the hero [data-scramble] pass, and the
 * section-heading scramble are all gone. Type simply prints.
 */
(function () {
  'use strict';
  var gsap = window.gsap;
  if (!gsap) return;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(window.SplitText);

  var mm = gsap.matchMedia();

  // ------------------------------------------------------------------
  // Full-motion path
  // ------------------------------------------------------------------
  mm.add('(prefers-reduced-motion: no-preference)', function () {

    // ---- hero load: the name prints ---------------------------------
    // Split each .ln block separately — splitting across a nested span
    // makes SplitText emit an empty duplicate span that costs a line box.
    var nameLines = document.querySelectorAll('.hero__name .ln');
    if (nameLines.length && window.SplitText) {
      var name = document.querySelector('.hero__name');
      var split = new window.SplitText(nameLines, { type: 'chars' });
      gsap.set(split.chars, { autoAlpha: 0 });
      gsap.to(split.chars, {
        autoAlpha: 1,
        duration: 0.01,
        stagger: 0.024,
        delay: 0.12,
        onComplete: function () { name.classList.add('is-printed'); },
      });
    }

    gsap.fromTo('.hero__links .quick-link, .hero__tagline',
      { y: 14, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.5, ease: 'expo.out', stagger: 0.06, delay: 0.55 });

    

    // ---- scroll reveals ---------------------------------------------
    if (window.ScrollTrigger) {
      gsap.utils.toArray('.hp-section').forEach(function (section) {
        var rows = section.querySelectorAll('[data-reveal]');
        /* The section heading used to SCRAMBLE in on scroll. Retired with the rest of the
           console motifs; the heading is simply present. The [data-reveal] rows below still
           carry the entrance motion. */
        if (rows.length) {
          gsap.set(rows, { y: 26, autoAlpha: 0 });
          window.ScrollTrigger.batch(rows, {
            start: 'top 88%', once: true,
            onEnter: function (batch) {
              gsap.to(batch, { y: 0, autoAlpha: 1, duration: 0.55, ease: 'expo.out', stagger: 0.05 });
            },
          });
        }
      });
    }

    // ---- magnetic CTAs (fine pointers only) -------------------------
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      gsap.utils.toArray('.magnetic').forEach(function (el) {
        var xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3' });
        var yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3' });
        el.addEventListener('mousemove', function (e) {
          var r = el.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
        });
        el.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
      });
    }

    return function () {};
  });

  // ------------------------------------------------------------------
  // Reduced-motion path: content visible, no tweens.
  // ------------------------------------------------------------------
  mm.add('(prefers-reduced-motion: reduce)', function () {
    gsap.set('[data-reveal], .hero__links .quick-link, .hero__tagline', {
      clearProps: 'all',
    });
    return function () {};
  });

  // ------------------------------------------------------------------
  // Ledger hover preview (desktop only). One floating frame, lerp-follow.
  // ------------------------------------------------------------------
  (function ledgerPreview() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var ledger = document.querySelector('.ledger');
    var preview = document.querySelector('.ledger-preview');
    if (!ledger || !preview) return;
    var img = preview.querySelector('img');
    var xTo = gsap.quickTo(preview, 'x', { duration: 0.45, ease: 'power3' });
    var yTo = gsap.quickTo(preview, 'y', { duration: 0.45, ease: 'power3' });

    ledger.addEventListener('mousemove', function (e) {
      xTo(e.clientX + 28);
      yTo(e.clientY - 90);
    });
    ledger.querySelectorAll('.ledger__row').forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        var src = row.getAttribute('data-img');
        if (!src) { preview.classList.remove('is-visible'); return; }
        if (img.getAttribute('src') !== src) img.setAttribute('src', src);
        preview.classList.add('is-visible');
      });
    });
    ledger.addEventListener('mouseleave', function () {
      preview.classList.remove('is-visible');
    });
    // 1.4.13: hover content must be dismissable without moving the pointer
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') preview.classList.remove('is-visible');
    });
  })();

})();
