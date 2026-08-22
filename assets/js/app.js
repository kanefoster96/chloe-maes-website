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
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach((i) => i.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((i) => io.observe(i));
  }

  /* ------------------------------------------------------- 4. Star ratings */
  function starRow(count) {
    const wrap = el('span', 'stars');
    wrap.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < count; i++) {
      wrap.insertAdjacentHTML('beforeend', '<svg><use href="#i-star"/></svg>');
    }
    return wrap;
  }

  function ratings() {
    const host = $('#ratings');
    if (!host) return;
    DATA.RATINGS.forEach((r) => {
      const box = el('div', 'rating');
      const score = el('div', 'rating__score');
      score.append(r.score, ' ');
      const outOf = el('span', null, `/ ${r.of}`);
      score.append(outOf);
      box.append(score, starRow(5), el('div', 'rating__src', r.source));
      host.append(box);
    });
  }

  function reviews() {
    const host = $('#reviews-grid');
    if (!host) return;
    DATA.REVIEWS.forEach((r) => {
      const card = el('article', 'review rise');
      card.append(starRow(r.stars));
      card.append(el('p', 'review__quote', `“${r.quote}”`));
      card.append(el('p', 'review__by', r.author));
      host.append(card);
    });
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

  function shortStatus(state) {
    if (!state.isOpen) return `Closed &middot; ${state.detail}`;
    if (state.status === 'changeover-soon') {
      return `<strong>${state.headline}</strong> &middot; ${state.changeTo ? state.changeTo.name + ' from ' + LIVE.pretty(state.changeAt) : 'kitchen closes at ' + LIVE.pretty(state.changeAt)}`;
    }
    if (state.status === 'between') return `<strong>Open</strong> &middot; ${state.headline}`;
    return `<strong>Open now</strong> &middot; serving ${state.current.name.toLowerCase()} until ${LIVE.pretty(state.changeAt)}`;
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
    const stamp = $('#stamp-hours');
    if (stamp) stamp.textContent = `Today ${state.todayHoursLabel}`;
    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* -------------------------------------------------------- 7. Demo ribbon */
  function demoNote() {
    const note = $('#demo-note');
    if (!note) return;
    try {
      if (sessionStorage.getItem('cm-demo-note') === 'hidden') { note.hidden = true; note.style.display = 'none'; }
    } catch (e) { /* private browsing — never mind */ }
    const btn = $('button', note);
    if (btn) btn.addEventListener('click', () => {
      note.style.display = 'none';
      try { sessionStorage.setItem('cm-demo-note', 'hidden'); } catch (e) {}
    });
  }

  /* ------------------------------------------------------------- 8. Start */
  function init() {
    hydrateShots();
    header();
    ratings();
    reviews();
    reveals();
    demoNote();

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
