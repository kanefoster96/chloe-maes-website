# Chloe Mae's — Cullercoats

A concept website for **Chloe Mae's**, the brunch and coffee house on the corner of
2 St George's Road, Cullercoats, North Shields.

Plain HTML, CSS and JavaScript. No build step, no dependencies, no framework —
open `index.html` in a browser and it works. It will drop straight onto Vercel,
Netlify, GitHub Pages or any shared host.

---

## What it does

**The menu changes itself.** The site knows the kitchen's timetable and shows
whichever menu is actually being served, in the cafe's own timezone, so a
customer in Sydney sees the same answer as someone standing on the doorstep.

| Service | When |
| --- | --- |
| Breakfast | 8am – 12pm, every day |
| Main menu | 12pm – 4:30pm, every day |
| Evening menu | 5pm – 8:30pm, Thursday to Saturday |
| Coffee, cake & drinks | Open to close, every day |

**The menus sort themselves.** Whatever is being served leads the list, then
the counter menu, then whatever starts later today, and anything that has
already finished for the day falls to the end.

**No countdown, just a heads-up.** Most of the time the site simply says what is
being cooked and until when:

> Now serving Breakfast — served until 12pm

Inside the last half hour it adds one friendly line about what starts next,
phrased around the new menu rather than the one running out:

> The main menu starts at 12pm — still time to order breakfast before then.

Nothing ticks down. The same half-hour notice covers the gap between lunch and
dinner, the end of evening service, and the half hour before the doors open.
Change `NOTICE_MINUTES` at the top of `assets/js/live.js` to widen or narrow it.

**Everything else a customer rings up to ask** — address, phone, opening hours
with today highlighted, parking and Metro, dogs, bookings, takeaway and
delivery, allergens, and eight FAQs.

---

## Files

```
index.html            Home page
menu.html             The live menu
assets/css/style.css  One stylesheet
assets/js/data.js     ← everything you will want to edit lives here
assets/js/live.js     Works out what is being served right now
assets/js/app.js      Shared page behaviour
assets/js/menu-page.js  Builds the menu tabs and panels
assets/img/           Artwork, favicon, social share image
```

## Editing the menu

`assets/js/data.js` is the single source of truth. Change it and the home page,
the menu page, the status bar and the countdown all follow.

Add a dish:

```js
{ name: 'Nutella & Strawberry',
  desc: 'Nutella, fresh strawberries, white chocolate curls, icing sugar',
  price: '9.50',
  tags: ['V'],      // V, VE, VEA, GF, GFA — see TAGS at the bottom of the file
  star: true }      // marks it as a best seller
```

Change a service time — `from` and `to` are 24-hour, and `days` is 0 for Sunday
through 6 for Saturday:

```js
{ id: 'evening', name: 'Evening Menu', from: '17:00', to: '20:30', days: [4, 5, 6], ... }
```

Change opening hours in the `HOURS` array. Change the phone number, address or
social links in `INFO`. Nothing else needs touching.

## Adding the photographs

Every image slot currently shows hand-drawn line art and already points at the
photograph that should replace it. Drop the file in at the path below and it
fades in over the artwork automatically — nothing to wire up, no markup to
change.

| File | What it is |
| --- | --- |
| `photo-room.jpg` | Inside, someone holding a pancake stack |
| `photo-breakfast.jpg` | Two full breakfasts on the marble, room behind |
| `photo-fullbreakfast.jpg` | The full breakfast, close up |
| `photo-pancakes.jpg` | The pancake stack under chocolate |
| `photo-flatbreads.jpg` | Chorizo and egg flatbreads |
| `photo-bowls.jpg` | The chicken and halloumi bowls |
| `photo-fries.jpg` | Loaded fries |
| `photo-dog.jpg` | The retriever with the iced drink |
| `photo-drinks.jpg` | Two iced matcha on lilac |
| `photo-matcha.jpg` | Iced matcha, second crop |
| `photo-benedict.jpg` | Eggs Benedict with avocado and bacon |
| `photo-burger.jpg` | The loaded burger with brie and a pig in blanket |
| `photo-chickenburger.jpg` | The buttermilk chicken burger, flower wall behind |
| `photo-coffee.jpg` | An iced coffee outside the shopfront |
| `photo-map.png` | The map with the pin |

**Adding more.** Drop a JPEG into `assets/img/` and point at it from
`data.js`. Each menu section has a pair — `img` and `img2` — which it
alternates down its list so no two dishes in a row share a thumbnail. Any
single dish can override both with its own:

```js
{ name: 'Breakfast Burger', img: 'assets/img/photo-burger.jpg', ... }
```

An override is dropped only where it would repeat the picture directly above
it. The more dishes that carry their own, the less the pair shows through.

Anything from a phone camera is big enough. The hero is three 4:5 portraits,
the dish cards are 4:5, and the menu thumbnails are square — every slot crops
from the centre, so leave a little room around the subject. Photographs are
resized to 1400px and saved at quality 82 before being committed.
`assets/img/og.png` is the image that shows when the site is shared on social
media or in a message — worth replacing with a real photograph of the shopfront.

## Turning the nav items into pages

"Our place", "Find us" and "Questions" are in the nav as plain `<span
class="nav__soon">` rather than links, ready to become their own pages. When
one exists, swap the span for a link:

```html
<a href="our-place.html">Our place</a>
```

The sections they used to jump to are still on the home page with their ids
(`#story`, `#visit`, `#faq`), so they can be lifted out into pages, or linked
to again, whichever suits.

## Before it goes live

- Replace the placeholder dishes and prices in `data.js` with the real menu.
- Swap the paraphrased review quotes in `REVIEWS` for verbatim ones, or link
  straight through to the Google listing.
- Update the `https://chloemaes.co.uk/` URLs in the `<link rel="canonical">`,
  Open Graph tags, `sitemap.xml`, `robots.txt` and the JSON-LD block at the
  bottom of `index.html` to the real domain.
- Check the coordinates in the JSON-LD `geo` block against the real pin.

## Notes

- **Colours**: a near-black page with blush pink accents, taken from the sign
  above the door and the velvet chairs. Three flat greys and nothing else —
  the page, a barely-off-black band, and a lighter fill for cards and panels.
  Surfaces are separated by that fill alone — there are no gradients, no drop
  shadows and no outlines on cards, containers or photographs anywhere in the
  stylesheet.
  Notices are deliberately quiet: soft green for what is being served now,
  soft amber for the heads-up about the next menu. Nothing on the site is red;
  a menu changing over is not an error. The photographs supply the colour.
- Type is Fraunces, Inter and Parisienne, loaded from Google Fonts, with system
  fallbacks if they fail.
- The hero photograph crossfades through five pictures on a four-second cycle,
  in the order listed in the `data-photos` attribute on `#hero-shot`. It opens
  on the first of them, pauses when the tab is not visible, skips any file that
  fails to load, and holds still for anyone with reduced motion turned on.
- A banner under the header carries the three things people ring up to ask —
  very dog friendly, vegan and veggie, takeaway. On a phone the three will not
  fit across, so it drifts; from 720px it holds still and spaces them out.
  Edit them in `FEATURES` in `data.js`; the breakpoint is `staticFrom` where
  `featureStrip` calls `marquee`.
- Belts repeat their run until it is wider than the screen before looping, so a
  short list does not scroll a gap past on every pass, and they run at roughly
  the same speed whatever is on them. They pause on hover or keyboard focus,
  and become plain horizontal scrollers under reduced motion.
- On phones a pink call button sits beside the menu toggle in the header, so
  booking is one tap from anywhere on the site.
- Structured data (`CafeOrCoffeeShop`) is included so Google can read the
  address, phone and opening hours directly.
- The menu page still prints cleanly (browser print), laying all four menus out
  in black on white with navigation and pictures stripped out.
- Works without JavaScript for the essentials: address, phone and opening hours
  are in the HTML. Only the live switching needs it.
- Accessible tabs, visible focus rings, a skip link, and it respects
  `prefers-reduced-motion`.
