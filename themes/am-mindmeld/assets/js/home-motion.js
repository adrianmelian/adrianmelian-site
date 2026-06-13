/* home-motion.js — GSAP choreography + homepage interactions.
 *
 * Laws: type prints, it never fades (stepped char reveals, scramble on
 * labels). Native scroll only: no pinning, no scrub. Positional motion may
 * ease smoothly; reveals run once. Reduced motion = everything instant.
 */
(function () {
  'use strict';
  var gsap = window.gsap;
  if (!gsap) return;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(window.SplitText);
  if (window.ScrambleTextPlugin) gsap.registerPlugin(window.ScrambleTextPlugin);

  var SCRAMBLE_CHARS = '█▓▒░<>/[]_';
  var mm = gsap.matchMedia();

  // ------------------------------------------------------------------
  // Full-motion path
  // ------------------------------------------------------------------
  mm.add('(prefers-reduced-motion: no-preference)', function () {

    // ---- hero load: the name prints, labels scramble in -------------
    // Split each .ln block separately — splitting across a nested span
    // makes SplitText emit an empty duplicate span that costs a line box.
    var nameLines = document.querySelectorAll('.rig-hero__name .ln');
    if (nameLines.length && window.SplitText) {
      var name = document.querySelector('.rig-hero__name');
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

    gsap.utils.toArray('.rig-hero [data-scramble]').forEach(function (el, i) {
      var text = el.getAttribute('data-scramble-text') || el.textContent;
      gsap.to(el, {
        duration: 0.7,
        delay: 0.25 + i * 0.09,
        scrambleText: { text: text, chars: SCRAMBLE_CHARS, speed: 1 },
      });
    });

    gsap.fromTo('.rig-hero__links .quick-link, .rig-hero__tagline',
      { y: 14, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.5, ease: 'expo.out', stagger: 0.06, delay: 0.55 });

    gsap.fromTo('.rig-hero__cue', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, delay: 1.6 });

    // ---- scroll reveals ---------------------------------------------
    if (window.ScrollTrigger) {
      gsap.utils.toArray('.hp-section').forEach(function (section) {
        var heading = section.querySelector('.section-heading');
        var rows = section.querySelectorAll('[data-reveal]');
        if (heading) {
          var label = heading.querySelector('.section-heading__title');
          if (label) {
            var txt = label.textContent;
            window.ScrollTrigger.create({
              trigger: section, start: 'top 78%', once: true,
              onEnter: function () {
                gsap.to(label, { duration: 0.6, scrambleText: { text: txt, chars: SCRAMBLE_CHARS, speed: 1.2 } });
              },
            });
          }
        }
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
    gsap.set('[data-reveal], .rig-hero__cue, .rig-hero__links .quick-link, .rig-hero__tagline', {
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

  // ------------------------------------------------------------------
  // Pipeline switcher: one <video>, stages swap its src. One decode at
  // a time, always muted/looped/inline. Maya-style time slider scrubs.
  // ------------------------------------------------------------------
  (function pipeline() {
    var stage = document.querySelector('.pipe');
    if (!stage) return;
    var video = stage.querySelector('.pipe__video');
    var chips = Array.prototype.slice.call(stage.querySelectorAll('.pipe__chip'));
    var frameCur = stage.querySelector('.pipe__frame-cur');
    var frameEnd = stage.querySelector('.pipe__frame-end');
    var playhead = stage.querySelector('.pipe__playhead');
    var track = stage.querySelector('.pipe__slider');
    var stageTitle = stage.querySelector('.pipe__stage-title');
    var playBtn = stage.querySelector('.pipe__playpause');
    if (!video || !chips.length) return;

    var FPS = 30;
    var scrubbing = false;
    var sectionVisible = false;
    var userPaused = false;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function safePlay() {
      if (reduced || scrubbing || userPaused || !sectionVisible) return;
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    }

    function setPlayBtn() {
      if (!playBtn) return;
      var playing = !video.paused;
      playBtn.textContent = playing ? '❚❚' : '▶';
      playBtn.setAttribute('aria-label', playing ? 'Pause demo video' : 'Play demo video');
    }
    video.addEventListener('play', setPlayBtn);
    video.addEventListener('pause', setPlayBtn);

    if (playBtn) {
      playBtn.addEventListener('click', function () {
        if (video.paused) {
          userPaused = false;
          var p = video.play(); // explicit user intent: bypass safePlay gates
          if (p && p.catch) p.catch(function () {});
        } else {
          userPaused = true;
          video.pause();
        }
      });
    }

    function activate(chip, instant) {
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      var src = chip.getAttribute('data-video');
      var poster = chip.getAttribute('data-poster');
      var label = chip.getAttribute('data-label') || chip.textContent.trim();
      if (stageTitle) {
        if (window.ScrambleTextPlugin && !reduced && !instant) {
          gsap.to(stageTitle, { duration: 0.45, scrambleText: { text: label, chars: SCRAMBLE_CHARS, speed: 1.2 } });
        } else {
          stageTitle.textContent = label;
        }
      }
      var swap = function () {
        if (poster) video.setAttribute('poster', poster);
        video.setAttribute('aria-label', label + ' — tool demo loop');
        video.setAttribute('src', src);
        video.load();
        safePlay();
        if (!instant) gsap.to(video, { autoAlpha: 1, duration: 0.18 });
      };
      if (instant) { swap(); gsap.set(video, { autoAlpha: 1 }); }
      else gsap.to(video, { autoAlpha: 0, duration: 0.14, onComplete: swap });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () { activate(chip, false); });
    });

    // Lazy start: attach the first video only when the section approaches.
    var started = false;
    var lazyIO = new IntersectionObserver(function (entries) {
      if (entries[entries.length - 1].isIntersecting && !started) {
        started = true;
        activate(chips[0], true);
        lazyIO.disconnect();
      }
    }, { rootMargin: '200px' });
    lazyIO.observe(stage);

    // Pause offscreen so only one thing decodes anywhere on the page.
    var visIO = new IntersectionObserver(function (entries) {
      sectionVisible = entries[entries.length - 1].isIntersecting;
      if (!started) return;
      if (sectionVisible) {
        safePlay();
        startSliderLoop();
      } else {
        video.pause();
      }
    }, { threshold: 0.05 });
    visIO.observe(stage);

    // ---- time slider --------------------------------------------------
    // rAF loop runs only while the section is visible AND the video is
    // playing (or being scrubbed); ARIA updates are throttled to whole
    // frames so AT isn't flooded at 60Hz.
    var sliderRAF = 0;
    var lastShownFrame = -1;

    function updateSliderOnce() {
      if (!video.duration) return;
      var f = video.currentTime / video.duration;
      if (playhead && track) {
        playhead.style.transform = 'translateX(' + (f * track.clientWidth).toFixed(1) + 'px)';
      }
      var frameNo = Math.floor(video.currentTime * FPS);
      if (frameNo !== lastShownFrame) {
        lastShownFrame = frameNo;
        var endNo = Math.floor(video.duration * FPS);
        if (frameCur) frameCur.textContent = String(frameNo);
        if (frameEnd) frameEnd.textContent = String(endNo);
        if (track && (scrubbing || frameNo % 6 === 0)) {
          track.setAttribute('aria-valuenow', String(frameNo));
          track.setAttribute('aria-valuemax', String(endNo));
          track.setAttribute('aria-valuetext', 'frame ' + frameNo + ' of ' + endNo);
        }
      }
    }

    function tickSlider() {
      sliderRAF = 0;
      updateSliderOnce();
      if (sectionVisible && (!video.paused || scrubbing)) {
        sliderRAF = requestAnimationFrame(tickSlider);
      }
    }
    function startSliderLoop() {
      if (!sliderRAF) sliderRAF = requestAnimationFrame(tickSlider);
    }
    video.addEventListener('play', startSliderLoop);
    video.addEventListener('loadedmetadata', updateSliderOnce);

    if (track) {
      var seekFromEvent = function (e) {
        var r = track.getBoundingClientRect();
        var f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        if (video.duration) video.currentTime = f * video.duration;
        updateSliderOnce();
      };
      track.addEventListener('pointerdown', function (e) {
        scrubbing = true;
        track.classList.add('is-scrubbing');
        video.pause();
        track.setPointerCapture(e.pointerId);
        seekFromEvent(e);
        startSliderLoop();
        e.preventDefault();
      });
      track.addEventListener('pointermove', function (e) {
        if (scrubbing) seekFromEvent(e);
      });
      var endScrub = function () {
        if (!scrubbing) return;
        scrubbing = false;
        track.classList.remove('is-scrubbing');
        safePlay();
      };
      track.addEventListener('pointerup', endScrub);
      track.addEventListener('pointercancel', endScrub);
      track.addEventListener('keydown', function (e) {
        if (!video.duration) return;
        var seek = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') seek = video.currentTime + 1;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') seek = video.currentTime - 1;
        else if (e.key === 'Home') seek = 0;
        else if (e.key === 'End') seek = video.duration;
        if (seek !== null) {
          video.pause();
          video.currentTime = Math.min(video.duration, Math.max(0, seek));
          updateSliderOnce();
          e.preventDefault();
        } else if (e.key === ' ' || e.key === 'Enter') {
          if (video.paused) {
            userPaused = false;
            var p = video.play();
            if (p && p.catch) p.catch(function () {});
          } else {
            userPaused = true;
            video.pause();
          }
          e.preventDefault();
        }
      });
    }
  })();
})();
