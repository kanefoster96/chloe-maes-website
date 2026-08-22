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

| Save the file as | Where it appears | Suggested photo |
| --- | --- | --- |
| `assets/img/photo-room.jpg` | Hero band + story column | The room: flower wall, marble tables, blush chairs |
| `assets/img/photo-pancakes.jpg` | Live panel + first dish card | The loaded pancake stack |
| `assets/img/photo-flatbreads.jpg` | Second dish card + story | Chorizo and fried egg flatbreads |
| `assets/img/photo-fullbreakfast.jpg` | Third dish card | The full breakfast with hash browns |
| `assets/img/photo-bowls.jpg` | Fourth dish card | The halloumi and chicken bowls |
| `assets/img/photo-dog.jpg` | Story column | The golden retriever with the iced drink |
| `assets/img/photo-map.png` | Find us | Map screenshot with the pin |
| `assets/img/photo-main.jpg` | Main menu pictures | A lunch plate, landscape |
| `assets/img/photo-evening.jpg` | Evening menu pictures | The room after dark, landscape |
| `assets/img/photo-drinks.jpg` | Drinks menu pictures | Iced matcha, or the coffee counter |
| `assets/img/photo-cake.jpg` | Drinks menu pictures | Something from the cake fridge |

The same photograph can be used in more than one slot — the breakfast, lunch and
evening menus each show two or three pictures above their items, and they reuse
the dish photographs above. Which pictures appear on which menu is the `shots`
array on each service in `data.js`.

The banners are cropped wide (about 21:8), so give them landscape photographs
around 1600px across. The dish cards are square on phones and 4:5 on desktop,
so a 1200×1500 portrait crop suits them best.
`assets/img/og.png` is the image that shows when the site is shared on social
media or in a message — worth replacing with a real photograph of the shopfront.

## Before it goes live

- Replace the placeholder dishes and prices in `data.js` with the real menu.
- Swap the paraphrased review quotes in `REVIEWS` for verbatim ones, or link
  straight through to the Google listing.
- Remove the demo sentence from the footer (`id="demo-line"`, in both pages).
- Update the `https://chloemaes.co.uk/` URLs in the `<link rel="canonical">`,
  Open Graph tags, `sitemap.xml`, `robots.txt` and the JSON-LD block at the
  bottom of `index.html` to the real domain.
- Check the coordinates in the JSON-LD `geo` block against the real pin.

## Notes

- **Colours**: a warm near-black page with blush pink accents, taken from the
  sign above the door and the velvet chairs. Notices are deliberately quiet —
  a soft green for what is being served now, a soft amber for the heads-up
  about the next menu. Nothing on the site is red; a menu changing over is not
  an error. The photographs and artwork supply the colour.
- Type is Fraunces, Inter and Parisienne, loaded from Google Fonts, with system
  fallbacks if they fail.
- The feature strip and the review wall are continuous marquees. They pause on
  hover or keyboard focus, and become plain horizontal scrollers for anyone with
  reduced motion turned on.
- On phones a fixed bar sits at the bottom of the screen with the live menu and
  a tap-to-call booking button, so both are always within thumb reach.
- Structured data (`CafeOrCoffeeShop`) is included so Google can read the
  address, phone and opening hours directly.
- The menu page still prints cleanly (browser print), laying all four menus out
  in black on white with navigation and pictures stripped out.
- Works without JavaScript for the essentials: address, phone and opening hours
  are in the HTML. Only the live switching needs it.
- Accessible tabs, visible focus rings, a skip link, and it respects
  `prefers-reduced-motion`.
