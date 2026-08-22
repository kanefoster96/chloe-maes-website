/* ============================================================================
   Chloe Mae's — one dish
   Every item on the menu has its own address: dish.html?d=biscoff-dream.
   The dish is looked up in data.js, so these pages stay in step with the menu
   without anything needing to be regenerated.
   ========================================================================== */

(function (DATA, LIVE) {
  'use strict';

  const host = document.getElementById('dish-body');
  if (!host) return;

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const emoji = (ch) => {
    const s = el('span', 'emoji', ch);
    s.setAttribute('aria-hidden', 'true');
    return s;
  };

  const wanted = new URLSearchParams(location.search).get('d') || '';
  const found = wanted && DATA.findDish(wanted);

  /* --- nothing by that name -------------------------------------------- */
  if (!found) {
    document.title = "Dish not found — Chloe Mae's";
    host.textContent = '';
    const box = el('div');
    box.append(el('h1', null, 'We could not find that one'));
    box.append(el('p', 'lede', 'It may have come off the menu, or the link may be out of date. The full menu is a tap away.'));
    const row = el('div', 'btn-row');
    const back = el('a', 'btn', 'See the menu ');
    back.href = 'menu.html';
    back.append(emoji('👀'));
    row.append(back);
    box.append(row);
    host.append(box);
    return;
  }

  const { item, service, section, on } = found;

  /* --- the page --------------------------------------------------------- */
  document.title = `${item.name} — Chloe Mae's`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.setAttribute('content',
      `${item.name}${item.desc ? ' — ' + item.desc : ''}. On the ${service.name.toLowerCase()} at Chloe Mae's, Cullercoats.`);
  }

  host.textContent = '';

  /* The picture. Falls back to the section's, then to the drawing. */
  const figure = el('div', 'shot dish-page__shot');
  const picture = item.img || section.img;
  if (picture) figure.dataset.photo = picture;
  figure.dataset.art = 'art-pancakes';
  figure.dataset.alt = item.name;
  host.append(figure);

  const body = el('div', 'dish-page__body');

  /* Some services are named "... Menu" already; the rest need the word. */
  const menuName = (name) => (/menu$/i.test(name) ? name : name + ' menu');
  const menus = on.map((o) => menuName(o.service.name)).join(' and the ');
  const eyebrow = el('p', 'eyebrow');
  eyebrow.append(`On the ${menus}`);
  body.append(eyebrow);

  const title = el('h1', null, item.name);
  if (service.emoji) title.append(' ', emoji(service.emoji));
  body.append(title);

  const price = el('p', 'dish-page__price');
  price.append('£' + item.price);
  if (item.priceNote) price.append(' ', el('small', null, item.priceNote));
  body.append(price);

  if (item.desc) body.append(el('p', 'lede', item.desc));

  if (item.tags && item.tags.length) {
    const tags = el('ul', 'dish-page__tags');
    item.tags.forEach((code) => {
      const t = DATA.TAGS[code];
      if (t) tags.append(el('li', null, t.label));
    });
    body.append(tags);
  }

  /* When you can order it, taken from the same timetable as everything else. */
  const when = el('ul', 'dish-page__when');
  on.forEach((o) => {
    when.append(el('li', null, `${o.service.name} — ${o.service.kicker.replace(/^Served /, '')}`));
  });
  body.append(when);

  const row = el('div', 'btn-row');

  const book = el('a', 'btn', 'Book a table ');
  book.href = 'tel:' + DATA.INFO.phoneDial;
  book.append(emoji('🤙'));

  const takeaway = el('a', 'btn btn--ghost', 'Order takeaway');
  takeaway.href = 'https://www.ubereats.com/gb/store/chloe-maes/T2t8We8_V22uT3XlZImPUw';
  takeaway.target = '_blank';
  takeaway.rel = 'noopener';

  row.append(book, takeaway);
  body.append(row);

  host.append(body);

  if (window.CHLOE_UI) window.CHLOE_UI.hydrateShots();

  /* If it is being cooked right now, say so. */
  LIVE.subscribe((state) => {
    let note = document.getElementById('dish-live');
    const cooking = state.current && on.some((o) => o.service.id === state.current.id);
    if (!cooking) { if (note) note.remove(); return; }
    if (!note) {
      note = el('p', 'nowline');
      note.id = 'dish-live';
      body.insertBefore(note, body.querySelector('.btn-row'));
    }
    note.textContent = '';
    note.append(el('span', 'dot dot--open'));
    const text = el('span', 'nowline__text');
    text.append(el('strong', null, 'Being served right now'), ` — until ${LIVE.pretty(state.changeAt)}.`);
    note.append(text);
  });
})(window.CHLOE, window.CHLOE_LIVE);
