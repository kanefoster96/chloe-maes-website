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

**An hour's notice before every changeover.** From sixty minutes out, the status
bar, the home page panel and the menu page all switch to a warning:

> Breakfast ends in 25 min · Main Menu from 12pm

with a countdown that keeps ticking, a progress bar through the current service,
and an amber note explaining exactly what to order before the swap. The same
mechanism covers last kitchen orders, the gap between lunch and dinner, and the
hour before the doors open in the morning.

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

## Adding real photographs

Every image on the site is currently hand-drawn line art, because no photographs
were available when this was built. Each slot already points at the photo that
should replace it — drop a JPEG at the path and it fades in over the artwork
automatically. Nothing to wire up.

| Put a photo here | And it appears |
| --- | --- |
| `assets/img/photo-shopfront.jpg` | Home page hero |
| `assets/img/photo-pancakes.jpg` | Pancake stack card |
| `assets/img/photo-burger.jpg` | Breakfast burger card |
| `assets/img/photo-eggs.jpg` | Broccoli steak omelette card |
| `assets/img/photo-korean.jpg` | Korean chicken tenders card |
| `assets/img/photo-interior.jpg` | Inside the cafe |
| `assets/img/photo-coffee.jpg` | Coffee |
| `assets/img/photo-bay.jpg` | Cullercoats bay |
| `assets/img/photo-map.jpg` | Map card |
| `assets/img/photo-breakfast.jpg` | Breakfast menu banner |
| `assets/img/photo-main.jpg` | Main menu banner |
| `assets/img/photo-evening.jpg` | Evening menu banner |
| `assets/img/photo-drinks.jpg` | Drinks menu banner |

Landscape images want to be about 1600px wide; the tall cards suit 1200×1500.
`assets/img/og.png` is the image that shows when the site is shared on social
media or in a message — worth replacing with a real photograph of the shopfront.

## Before it goes live

- Replace the placeholder dishes and prices in `data.js` with the real menu.
- Swap the paraphrased review quotes in `REVIEWS` for verbatim ones, or link
  straight through to the Google listing.
- Remove the `demo-note` block from the top of `index.html` and `menu.html`.
- Update the `https://chloemaes.co.uk/` URLs in the `<link rel="canonical">`,
  Open Graph tags, `sitemap.xml`, `robots.txt` and the JSON-LD block at the
  bottom of `index.html` to the real domain.
- Check the coordinates in the JSON-LD `geo` block against the real pin.

## Notes

- Type is Fraunces, Inter and Parisienne, loaded from Google Fonts, with system
  fallbacks if they fail.
- Structured data (`CafeOrCoffeeShop`) is included so Google can read the
  address, phone and opening hours directly.
- The menu page prints cleanly — the "Print this menu" button lays all four
  menus out in black on white with the navigation and images stripped out.
- Works without JavaScript for the essentials: address, phone and opening hours
  are in the HTML. Only the live switching needs it.
- Accessible tabs, visible focus rings, a skip link, and it respects
  `prefers-reduced-motion`.
