/* ============================================================================
   Chloe Mae's — the live menu page
   Builds a tab per service from data.js, opens whichever one the kitchen is
   actually cooking, and follows the changeovers until the visitor picks for
   themselves.
   ========================================================================== */

(function (DATA, LIVE) {
  'use strict';

  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const emojiTag = (ch) => {
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

  const tabsHost = $('#svc-tabs');
  const panelsHost = $('#svc-panels');
  if (!tabsHost || !panelsHost) return;

  let chosenByVisitor = false;   // once true, the page stops moving on its own
  let selected = null;

  /* ------------------------------------------------------------- 1. Build */

  function tagRow(tags) {
    const row = el('span', 'tagrow');
    tags.forEach((code) => {
      const meta = DATA.TAGS[code];
      if (!meta) return;
      const t = el('span', 'tag', meta.short);
      t.title = meta.label;
      t.setAttribute('aria-label', meta.label);
      row.append(t);
    });
    return row;
  }

  function itemNode(item, section) {
    const li = el('li', 'mitem');

    /* A picture of the dish, so people can see it before they read it. */
    const src = item.img || section.img;
    if (src) {
      const thumb = el('div', 'mitem__thumb shot');
      thumb.dataset.photo = src;
      thumb.dataset.art = section.art || 'art-pancakes';
      li.append(thumb);   /* hydrateShots paints it — artwork only if the photo fails */
    }

    const body = el('div', 'mitem__body');
    const top = el('div', 'mitem__top');
    const name = el('span', 'mitem__name');
    name.append(item.name);
    if (item.star) {
      name.insertAdjacentHTML('beforeend', '<svg class="star" aria-hidden="true"><use href="#i-star"/></svg>');
      name.append(el('span', 'sr-only', ' (one of our best sellers)'));
    }
    if (item.tags && item.tags.length) name.append(' ', tagRow(item.tags));

    const price = el('span', 'mitem__price');
    price.append('£' + item.price);
    if (item.priceNote) price.append(' ', el('small', null, item.priceNote));

    top.append(name, el('span', 'mitem__lead'), price);
    body.append(top);
    if (item.desc) body.append(el('p', 'mitem__desc', item.desc));
    li.append(body);
    return li;
  }

  function sectionNode(section) {
    const box = el('section', 'msection');
    box.append(el('h3', null, section.title));
    if (section.note) box.append(el('p', 'msection__note', section.note));
    const list = el('ul', 'mitems');
    section.items.forEach((item) => list.append(itemNode(item, section)));
    box.append(list);
    return box;
  }

  function buildPanel(service) {
    const panel = el('section', 'svc-panel');
    panel.id = 'panel-' + service.id;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', 'tab-' + service.id);
    panel.tabIndex = 0;
    panel.hidden = true;

    const head = el('div', 'svc-head');
    const title = el('h2', null, service.name);
    if (service.emoji) title.append(' ', emojiTag(service.emoji));
    head.append(title);
    const when = el('span', 'svc-head__when');
    when.id = 'when-' + service.id;
    when.append(service.kicker);
    head.append(when);
    head.append(el('p', null, service.blurb));
    panel.append(head);

    /* Two balanced columns so a long menu still reads like a menu. The split
       is whichever break leaves the two sides closest in length. */
    const grid = el('div', 'mgrid');
    const left = el('div', 'mcol');
    const right = el('div', 'mcol');

    const weights = service.sections.map((s) => s.items.length * 2 + (s.note ? 2 : 1) + 2);
    const total = weights.reduce((a, b) => a + b, 0);

    let best = { at: service.sections.length, gap: Infinity };
    let running = 0;
    for (let at = 1; at <= service.sections.length; at++) {
      running += weights[at - 1];
      const gap = Math.abs(running - (total - running));
      if (gap < best.gap) best = { at, gap };
    }

    service.sections.forEach((section, i) => {
      (i < best.at ? left : right).append(sectionNode(section));
    });

    grid.append(left);
    if (right.childElementCount) grid.append(right);
    panel.append(grid);
    return panel;
  }

  function buildTab(service) {
    const tab = el('button', 'svc-tab');
    tab.type = 'button';
    tab.id = 'tab-' + service.id;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', 'panel-' + service.id);
    tab.setAttribute('aria-selected', 'false');
    tab.tabIndex = -1;
    tab.append(el('span', 'dot', ''), el('span', 'svc-tab__label', service.name));
    tab.addEventListener('click', () => {
      chosenByVisitor = true;
      select(service.id, true);
    });
    return tab;
  }

  DATA.SERVICES.forEach((service) => {
    tabsHost.append(buildTab(service));
    panelsHost.append(buildPanel(service));
  });

  /* Keyboard: left/right walk the tablist, as a tablist should. */
  tabsHost.addEventListener('keydown', (e) => {
    const keys = { ArrowRight: 1, ArrowLeft: -1, Home: 'first', End: 'last' };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const tabs = $$('.svc-tab', tabsHost);
    const here = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    let next;
    if (keys[e.key] === 'first') next = 0;
    else if (keys[e.key] === 'last') next = tabs.length - 1;
    else next = (here + keys[e.key] + tabs.length) % tabs.length;
    chosenByVisitor = true;
    select(DATA.SERVICES[next].id, true);
    tabs[next].focus();
  });

  /* ---------------------------------------------------------- 2. Selection */

  function select(id, moveFocusTarget) {
    if (!DATA.SERVICES.some((s) => s.id === id)) return;
    selected = id;

    DATA.SERVICES.forEach((service) => {
      const on = service.id === id;
      const tab = $('#tab-' + service.id);
      const panel = $('#panel-' + service.id);
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      panel.hidden = !on;
    });

    if (moveFocusTarget && history.replaceState) {
      history.replaceState(null, '', '#' + id);
    }
  }

  /* --------------------------------------------------- 3. Keep it in step */

  /* Anything you can actually order right now. While the doors are open that
     is the kitchen's current menu *and* the counter — the counter runs all
     day, so greying it out reads as "not available", which is wrong. */
  function isServingNow(service, state) {
    if (!state.isOpen) return false;
    if (service.alwaysOn) return true;
    return !!state.current && service.id === state.current.id;
  }

  /* The one the page opens on: the kitchen's, or the counter between services. */
  function whichIsLive(state) {
    if (state.current) return state.current.id;
    if (state.isOpen) return (state.alwaysOn[0] || {}).id || null;
    return null;
  }

  /* Menus sort themselves: what is being served now, then what is coming,
     then whatever has already finished for the day. */
  function rankFor(service, state) {
    if (!state.isOpen) return 0;   // closed: fall back to the natural order
    if (state.current && service.id === state.current.id) return 0;
    if (service.alwaysOn) return 1;
    if (!service.days.includes(state.day)) return 3;
    return LIVE.toMinutes(service.from) > LIVE.toMinutes(state.clock) ? 2 : 3;
  }

  function reorderTabs(state) {
    const order = DATA.SERVICES
      .map((service, i) => ({ service, i, rank: rankFor(service, state) }))
      .sort((a, b) => a.rank - b.rank || a.i - b.i);

    const ids = order.map((o) => o.service.id).join(',');
    if (ids === reorderTabs.last) return;   // nothing moved
    reorderTabs.last = ids;
    order.forEach((o) => tabsHost.append($('#tab-' + o.service.id)));
  }

  function markLive(state) {
    const liveId = whichIsLive(state);
    reorderTabs(state);

    DATA.SERVICES.forEach((service) => {
      const tab = $('#tab-' + service.id);
      const dot = $('.dot', tab);
      const when = $('#when-' + service.id);
      const isLive = isServingNow(service, state);
      const soon = state.changeTo && state.changeTo.id === service.id && state.noticeActive;

      dot.className = 'dot ' + (isLive ? 'dot--open' : soon ? 'dot--soon' : 'dot--closed');

      let badge = $('.svc-tab__now', tab);
      const wantsBadge = isLive || soon;
      if (wantsBadge && !badge) {
        badge = el('span', 'svc-tab__now');
        tab.append(badge);
      }
      if (badge) {
        if (!wantsBadge) badge.remove();
        else badge.textContent = isLive ? 'Now' : 'Next';
      }

      if (when) when.textContent = service.kicker;
    });

    /* Follow the kitchen, unless the visitor has taken the wheel. */
    if (!chosenByVisitor) {
      const target = liveId || (state.changeTo && state.changeTo.id) || DATA.SERVICES[0].id;
      if (target !== selected) select(target, false);
    }
  }

  /* --------------------------------------------------------------- 4. Key */

  function dietKey() {
    const host = $('#diet-key');
    if (!host) return;
    host.append(el('b', null, 'Dietary marks'));
    Object.keys(DATA.TAGS).forEach((code) => {
      const t = DATA.TAGS[code];
      host.append(el('span', null, `${t.short} — ${t.label}`));
    });
  }

  /* -------------------------------------------------------------- 5. Boot */

  dietKey();

  if (window.CHLOE_UI) window.CHLOE_UI.hydrateShots();

  const printBtn = $('#print-menu');
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  /* A link straight to one menu (menu.html#evening) wins over the clock. */
  const fromHash = location.hash.replace('#', '');
  if (fromHash && DATA.SERVICES.some((s) => s.id === fromHash)) {
    chosenByVisitor = true;
    select(fromHash, false);
  }

  window.addEventListener('hashchange', () => {
    const id = location.hash.replace('#', '');
    if (DATA.SERVICES.some((s) => s.id === id)) {
      chosenByVisitor = true;
      select(id, false);
    }
  });

  LIVE.subscribe(markLive);
})(window.CHLOE, window.CHLOE_LIVE);
