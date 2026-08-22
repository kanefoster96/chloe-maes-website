/* ============================================================================
   Chloe Mae's — page behaviour
   Progressive enhancement only: every essential fact (address, phone, opening
   hours) is in the HTML already. This layer makes it live.
   ========================================================================== */

(function (DATA, LIVE) {
  'use strict';

  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
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
      const art = shot.dataset.art;
      if (art) shot.style.backgroundImage = `url("assets/img/${art}.svg")`;

      const photo = shot.dataset.photo;
      if (!photo) return;

      const probe = new Image();
      probe.onload = () => {
        const img = el('img');
        img.src = photo;
        img.alt = shot.dataset.alt || '';
        img.loading = 'lazy';
        img.decoding = 'async';
        shot.insertBefore(img, shot.firstChild);
        requestAnimationFrame(() => img.classList.add('is-loaded'));
      };
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
  function marquee(track, build, items) {
    if (!track) return;
    for (let copy = 0; copy < 2; copy++) {
      const group = el('div', 'marquee__group');
      if (copy === 1) group.setAttribute('aria-hidden', 'true');
      items.forEach((item) => group.append(build(item)));
      track.append(group);
    }
    /* Slow the belt down when there is a lot on it, so it reads at a walk. */
    const belt = track.closest('.marquee');
    if (belt) belt.style.setProperty('--speed', Math.max(30, items.length * 7) + 's');
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
      pill.insertAdjacentHTML('beforeend', `<svg aria-hidden="true"><use href="#i-${f.icon}"/></svg>`);
      pill.append(f.label);
      return pill;
    }, DATA.FEATURES);
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
    if (state.status === 'changeover-soon') {
      return `<strong>${state.headline}</strong>` + tail(state.changeTo
        ? `${state.changeTo.name} from ${LIVE.pretty(state.changeAt)}`
        : `kitchen closes at ${LIVE.pretty(state.changeAt)}`);
    }
    if (state.status === 'between') return `<strong>Open</strong>${tail(state.headline.toLowerCase())}`;
    return `<strong>Open now</strong>` +
      tail(`serving ${state.current.name.toLowerCase()} until ${LIVE.pretty(state.changeAt)}`);
  }

  /* Three things worth ordering off whichever menu is relevant right now. */
  function pickThree(service) {
    if (!service) return [];
    const all = service.sections.flatMap((s) => s.items);
    const stars = all.filter((i) => i.star);
    const rest = all.filter((i) => !i.star);
    return stars.concat(rest).slice(0, 3);
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
    $('#live-dot').className = 'dot ' + (DOT_CLASS[state.status] || 'dot--closed');
    $('#live-clock').textContent = `Cullercoats, ${state.clock}`;
    $('#live-headline').textContent = state.headline;
    $('#live-detail').textContent = state.detail;

    /* Progress through the current service */
    const bar = $('#live-bar');
    if (state.current && state.isOpen) {
      bar.hidden = false;
      $('#live-fill').style.width = Math.round(state.progress * 100) + '%';
      $('#tick-from').textContent = LIVE.pretty(state.current.from);
      $('#tick-left').textContent = `${LIVE.duration(state.minutesToChange)} left`;
      $('#tick-to').textContent = LIVE.pretty(state.current.to);
    } else {
      bar.hidden = true;
    }

    /* The hour's warning */
    if (state.noticeActive) {
      const t = $('#live-notice-text');
      if (state.status === 'closed') {
        t.textContent = `Nearly time — the doors open at ${LIVE.pretty(state.changeAt)}, in ${LIVE.duration(state.minutesToChange)}.`;
      } else if (state.changeTo && state.current) {
        t.innerHTML = `Menu changeover in <strong>${LIVE.duration(state.minutesToChange)}</strong>. Order from the ${state.current.name.toLowerCase()} before ${LIVE.pretty(state.changeAt)} — the ${state.changeTo.name.toLowerCase()} starts at ${LIVE.pretty(state.changeTo.from)}.`;
      } else if (state.changeTo) {
        t.innerHTML = `The ${state.changeTo.name.toLowerCase()} opens in <strong>${LIVE.duration(state.minutesToChange)}</strong>, at ${LIVE.pretty(state.changeTo.from)}. Until then it is coffee, cake and drinks from the counter.`;
      } else {
        t.innerHTML = `Last kitchen orders in <strong>${LIVE.duration(state.minutesToChange)}</strong>, at ${LIVE.pretty(state.changeAt)}. Coffee, cake and drinks carry on until we close.`;
      }
    }

    /* Suggestions from whichever menu matters (home page only) */
    const showFor = state.current || state.changeTo || state.alwaysOn[0];
    const picksBox = $('#live-picks');
    const picks = picksBox ? pickThree(showFor) : [];
    if (picksBox && picks.length) {
      picksBox.hidden = false;
      $('#picks-title').textContent = state.current
        ? `Worth ordering from the ${showFor.name.toLowerCase()}`
        : `Coming up on the ${showFor.name.toLowerCase()}`;
      const list = $('#picks-list');
      list.textContent = '';
      picks.forEach((item) => {
        const li = el('li');
        li.append(el('span', 'pk-name', item.name), el('span', 'pk-dot'), el('span', 'pk-price', '£' + item.price));
        list.append(li);
      });
    } else if (picksBox) {
      picksBox.hidden = true;
    }

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
