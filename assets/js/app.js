/* ============================================================================
   Chloe Mae's — page behaviour
   Progressive enhancement only: every essential fact (address, phone, opening
   hours) is in the HTML already. This layer makes it live.
   ========================================================================== */

(function (DATA, LIVE) {
  'use strict';

  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const emoji = (ch) => {
    const span = el('span', 'emoji', ch);
    span.setAttribute('aria-hidden', 'true');
    return span;
  };
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  /* ---------------------------------------------------------- 1. Imagery ---
     Each photo slot falls back to line art, so nothing is ever an empty box.
     Drop a real photo at the data-photo path and it fades in over the top. */
  function hydrateShots() {
    $$('.shot').forEach((shot) => {
      /* Pages that build their own slots call this too, so a shot that has
         already been dealt with must not pick up a second image. */
      if (shot.dataset.hydrated) return;
      shot.dataset.hydrated = 'yes';

      const art = shot.dataset.art;
      const photo = shot.dataset.photo;
      const paintArt = () => {
        if (art) shot.style.backgroundImage = `url("assets/img/${art}.svg")`;
      };

      if (shot.dataset.photos) return;   /* the hero rotation handles its own */

      /* No photograph for this slot: the drawing is the picture. */
      if (!photo) { paintArt(); return; }

      /* There is one: load it, and only fall back to the drawing if it fails.
         Painting the artwork underneath would show its colour around the
         photograph's edges while it loads, and again at any size where the
         rounded corner and the image edge disagree by a fraction of a pixel. */
      const probe = new Image();
      probe.onload = () => {
        const img = el('img');
        img.src = photo;
        img.alt = shot.dataset.alt || '';
        img.loading = 'lazy';
        img.decoding = 'async';
        shot.insertBefore(img, shot.firstChild);
        shot.style.backgroundImage = 'none';
        shot.classList.add('has-photo');
        requestAnimationFrame(() => img.classList.add('is-loaded'));
      };
      probe.onerror = paintArt;
      probe.src = photo;
    });
  }

  /* ------------------------------------------------------------ 2. Header */
  function header() {
    const head = $('#site-header');
    const toggle = $('#navtoggle');
    const drawer = $('#drawer');

    if (head) {
      const onScroll = () => head.classList.toggle('is-stuck', window.scrollY > 8);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    if (toggle && drawer) {
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!open));
        drawer.classList.toggle('is-open', !open);
      });
      drawer.addEventListener('click', (e) => {
        if (e.target.closest('a')) {
          toggle.setAttribute('aria-expanded', 'false');
          drawer.classList.remove('is-open');
        }
      });
    }
  }

  /* --------------------------------------------------- 3. Reveal on scroll */
  function reveals() {
    const items = $$('.rise');
    if (!items.length || !('IntersectionObserver' in window)) return;

    /* Nothing is hidden until we know we can reveal it again. */
    document.documentElement.classList.add('js-reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach((i) => io.observe(i));

    /* Belt and braces: anything still hidden after the page settles is shown,
       so a missed observer callback can never swallow a section. */
    window.addEventListener('load', () => {
      setTimeout(() => items.forEach((i) => {
        const box = i.getBoundingClientRect();
        if (box.top < window.innerHeight * 1.5) i.classList.add('is-in');
      }), 400);
    });
  }

  /* ----------------------------------------------------------- 4. Marquees */
  /* Each belt holds the same run of items twice, so translating the track by
     half its width loops seamlessly. */
  /* A belt holds the same run of items twice, so translating the track by half
     its width loops seamlessly, and the run is repeated until it is at least as
     wide as the screen — otherwise a gap scrolls past on every pass.

     `staticFrom` is a width at and above which the belt stops moving and simply
     centres one run. A short list scrolling on a wide screen has to repeat to
     fill it, which reads as the same items printed three times; holding still
     and spacing them out says the same thing more calmly. */
  function marquee(track, build, items, opts) {
    if (!track || !items.length) return;
    const staticFrom = (opts && opts.staticFrom) || 0;
    const belt = track.closest('.marquee');

    const render = () => {
      track.textContent = '';

      const group = el('div', 'marquee__group');
      items.forEach((item) => group.append(build(item)));
      track.append(group);

      const held = staticFrom && window.innerWidth >= staticFrom;
      if (belt) belt.classList.toggle('is-static', !!held);
      if (held) return;                   // one run, centred, going nowhere

      const container = (track.parentElement && track.parentElement.offsetWidth) || window.innerWidth;
      let guard = 24;                     // never loop forever on a zero-width group
      while (group.offsetWidth && group.offsetWidth < container && guard--) {
        items.forEach((item) => group.append(build(item)));
      }

      const twin = group.cloneNode(true);
      twin.setAttribute('aria-hidden', 'true');
      track.append(twin);

      /* Same perceived speed whatever is on it: about 45 pixels a second. */
      if (belt && group.offsetWidth) {
        belt.style.setProperty('--speed', Math.max(18, Math.round(group.offsetWidth / 45)) + 's');
      }
    };

    render();

    /* Which side of the breakpoint we are on can change, so rebuild on resize. */
    let pending;
    window.addEventListener('resize', () => {
      clearTimeout(pending);
      pending = setTimeout(render, 200);
    });
  }

  function starRow(count) {
    const wrap = el('span', 'stars');
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', `${count} out of 5 stars`);
    for (let i = 0; i < count; i++) {
      wrap.insertAdjacentHTML('beforeend', '<svg aria-hidden="true"><use href="#i-star"/></svg>');
    }
    return wrap;
  }

  function featureStrip() {
    marquee($('#pill-track'), (f) => {
      const pill = el('span', 'pill' + (f.green ? ' pill--green' : ''));
      pill.insertAdjacentHTML('beforeend', `<svg aria-hidden="true"><use href="#${f.icon}"/></svg>`);
      pill.append(f.label);
      return pill;
    }, DATA.FEATURES, { staticFrom: 720 });
  }

  /* ------------------------------------------------- 4b. The hero pictures */
  /* Crossfades through a handful of photographs, in the order they are listed
     — the layers are created up front so a fast-loading file cannot jump the
     queue. Any that fail to load are simply skipped. */
  function heroCycle() {
    const shot = $('#hero-shot');
    if (!shot) return;

    const list = (shot.dataset.photos || '').split(',').map((x) => x.trim()).filter(Boolean);
    if (!list.length) return;

    const layers = list.map((src, i) => {
      const img = el('img');
      img.alt = i === 0 ? (shot.dataset.alt || '') : '';
      img.decoding = 'async';
      img.dataset.ok = 'false';
      shot.append(img);
      img.addEventListener('load', () => { img.dataset.ok = 'true'; });
      img.src = src;
      return img;
    });

    /* Open on the first photograph in the list. Only if that one never
       arrives do we fall back to the earliest that did. */
    let opened = false;
    const open = () => {
      const first = layers.find((l) => l.dataset.ok === 'true');
      if (opened || !first) return;
      opened = true;
      shot.style.backgroundImage = 'none';
      shot.classList.add('has-photo');
      requestAnimationFrame(() => first.classList.add('is-on'));
    };
    if (layers[0].complete && layers[0].naturalWidth) { layers[0].dataset.ok = 'true'; open(); }
    layers[0].addEventListener('load', open);
    layers[0].addEventListener('error', () => setTimeout(open, 400));
    setTimeout(open, 2500);   // never leave the slot empty

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let at = 0;
    setInterval(() => {
      if (document.hidden) return;              // no point cycling out of sight
      const ready = layers.filter((l) => l.dataset.ok === 'true');
      if (ready.length < 2) return;

      const current = shot.querySelector('img.is-on');
      at = (ready.indexOf(current) + 1) % ready.length;
      if (current) current.classList.remove('is-on');
      ready[at].classList.add('is-on');
    }, 4000);
  }

  function reviewBelt() {
    marquee($('#review-track'), (r) => {
      const card = el('article', 'rcard');
      card.append(starRow(5));
      card.append(el('p', 'rcard__quote', `“${r.quote}”`));
      card.append(el('p', 'rcard__by', r.author));
      return card;
    }, DATA.REVIEWS);
  }

  /* -------------------------------------------------------- 5. Opening day */
  function markToday(state) {
    $$('#hours tr[data-day]').forEach((row) => {
      row.classList.toggle('is-today', Number(row.dataset.day) === state.day);
    });
  }

  /* ------------------------------------------------- 6. The live service --- */
  const DOT_CLASS = {
    serving: 'dot--open',
    'changeover-soon': 'dot--soon',
    between: 'dot--soon',
    closed: 'dot--closed'
  };

  /* Headline first, detail in a tail that narrow phones drop rather than wrap. */
  function shortStatus(state) {
    const tail = (text) => `<span class="statusbar__tail"> &middot; ${text}</span>`;

    if (!state.isOpen) return `<strong>Closed</strong>${tail(state.detail)}`;
    if (state.status === 'between') return `<strong>Open</strong>${tail(state.headline.toLowerCase())}`;
    return `<strong>Open now</strong>` +
      tail(`serving ${state.current.name.toLowerCase()} until ${LIVE.pretty(state.changeAt)}`);
  }

  function renderStatusbar(state) {
    const dot = $('#status-dot');
    const text = $('#status-text');
    if (!dot || !text) return;
    dot.className = 'dot ' + (DOT_CLASS[state.status] || 'dot--closed');
    text.innerHTML = shortStatus(state);
  }

  function renderLiveCard(state) {
    const card = $('#live-card');
    if (!card) return;

    card.dataset.status = state.status;
    card.dataset.notice = String(state.noticeActive);
    const dot = $('#live-dot');
    if (dot) dot.className = 'dot ' + (DOT_CLASS[state.status] || 'dot--closed');
    const clock = $('#live-clock');
    if (clock) clock.textContent = `Cullercoats, ${state.clock}`;
    const headline = $('#live-headline');
    headline.textContent = state.headline;
    const cooking = state.current || (state.isOpen ? state.alwaysOn[0] : null);
    if (cooking && cooking.emoji) headline.append(' ', emoji(cooking.emoji));
    $('#live-detail').textContent = state.detail;

    /* What is coming next, mentioned only inside the last half hour. */
    const t = $('#live-notice-text');
    if (state.noticeActive && t) {
      if (state.status === 'closed') {
        t.innerHTML = `We open at <strong>${LIVE.pretty(state.changeAt)}</strong> this morning.`;
      } else if (state.changeTo) {
        t.innerHTML = `The ${state.changeTo.name.toLowerCase()} starts at <strong>${LIVE.pretty(state.changeTo.from)}</strong>` +
          (state.current ? ` — still time to order ${state.current.name.toLowerCase()} before then.` : '.');
      } else {
        t.innerHTML = `The kitchen finishes at <strong>${LIVE.pretty(state.changeAt)}</strong>. Coffee, cake and drinks carry on until we close.`;
      }
    }

    const showFor = state.current || state.changeTo || state.alwaysOn[0];

    const cta = $('#live-cta');
    if (cta && showFor) {
      cta.href = `menu.html#${showFor.id}`;
      cta.textContent = state.current ? `See the whole ${showFor.name.toLowerCase()}` : 'Open the full menu';
    }
  }

  function renderFooter(state) {
    const hours = $('#foot-hours');
    const svc = $('#foot-service');
    if (hours) hours.textContent = state.todayHours.closed ? 'Closed today' : `${state.dayName}: ${state.todayHoursLabel}`;
    if (svc) svc.textContent = state.isOpen ? state.headline : state.detail;
    const note = $('#hero-note');
    if (note) {
      note.innerHTML = state.todayHours.closed
        ? 'Closed today &middot; <strong>0191 252 3442</strong>'
        : `Open seven days &middot; today <strong>${state.todayHoursLabel}</strong> &middot; 0191 252 3442`;
    }
    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------- 8. Start */
  function init() {
    hydrateShots();
    heroCycle();
    header();
    featureStrip();
    reviewBelt();
    reveals();

    LIVE.subscribe((state) => {
      renderStatusbar(state);
      renderLiveCard(state);
      renderFooter(state);
      markToday(state);
    });
  }

  /* Panels built later (the menu page) need the same treatment. */
  window.CHLOE_UI = { hydrateShots: hydrateShots };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window.CHLOE, window.CHLOE_LIVE);
