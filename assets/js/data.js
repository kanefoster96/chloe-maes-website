/* ============================================================================
   Chloe Mae's — single source of truth
   ----------------------------------------------------------------------------
   Everything the website says about opening times, services and dishes lives
   in this one file. Edit here and the whole site (home page, live status bar,
   menu page, structured data) updates itself.

   Times are 24h "HH:MM" strings in the cafe's own timezone (Europe/London),
   so the site behaves correctly for a visitor browsing from anywhere.
   Days are 0 = Sunday ... 6 = Saturday.
   ========================================================================== */

window.CHLOE = (function () {
  'use strict';

  /* -- The business -------------------------------------------------------- */
  const INFO = {
    name: "Chloe Mae's",
    tagline: 'Seafront brunch & coffee house',
    street: "2 St George's Road",
    area: 'Cullercoats',
    town: 'North Shields',
    county: 'Tyne & Wear',
    postcode: 'NE30 3JY',
    phoneDisplay: '0191 252 3442',
    phoneDial: '+441912523442',
    instagram: 'https://www.instagram.com/chloemaes_cullercoats/',
    facebook: 'https://www.facebook.com/ChloeMaesCullercoats/',
    maps: 'https://maps.app.goo.gl/MLW48tuzdzKQMBhAA',
    directions:
      'https://www.google.com/maps/dir/?api=1&destination=Chloe+Mae%27s%2C+2+St+George%27s+Road%2C+Cullercoats%2C+North+Shields+NE30+3JY',
    timezone: 'Europe/London'
  };

  /* -- Opening hours ------------------------------------------------------- */
  /* One entry per weekday. `close` is the door closing time. */
  const HOURS = [
    { day: 0, label: 'Sunday',    open: '08:00', close: '17:00' },
    { day: 1, label: 'Monday',    open: '08:00', close: '17:00' },
    { day: 2, label: 'Tuesday',   open: '08:00', close: '17:00' },
    { day: 3, label: 'Wednesday', open: '08:00', close: '17:00' },
    { day: 4, label: 'Thursday',  open: '08:00', close: '21:00' },
    { day: 5, label: 'Friday',    open: '08:00', close: '21:00' },
    { day: 6, label: 'Saturday',  open: '08:00', close: '21:00' }
  ];

  /* -- Services ------------------------------------------------------------
     The menu on the site swaps itself over as each service starts and ends.
     `alwaysOn: true` marks a menu that runs alongside the others all day and
     therefore never triggers a changeover.
     ---------------------------------------------------------------------- */
  const SERVICES = [
    {
      id: 'breakfast',
      name: 'Breakfast',
      kicker: 'Served 8am – 12pm, every day',
      from: '08:00',
      to: '12:00',
      days: [0, 1, 2, 3, 4, 5, 6],
      art: 'art-pancakes',
      photo: 'assets/img/photo-breakfast.jpg',
      blurb:
        'The reason half of Cullercoats sets an alarm. Pancake stacks built to order, proper Northumbrian bacon and eggs any way you like them.',
      sections: [
        {
          title: 'The Ultimate American Pancakes',
          note: 'Stacks of three, made to order. Add a fourth for £2.',
          items: [
            { name: 'Biscoff Dream', desc: 'Warm Biscoff spread, crushed biscuit, salted caramel, whipped cream', price: '9.50', tags: ['V'], star: true },
            { name: 'Nutella & Strawberry', desc: 'Nutella, fresh strawberries, white chocolate curls, icing sugar', price: '9.50', tags: ['V'] },
            { name: 'Bacon & Maple', desc: 'Crispy smoked bacon, pure maple syrup, salted butter', price: '9.95', star: true },
            { name: "S'mores Stack", desc: 'Torched marshmallow, milk chocolate sauce, digestive crumb', price: '9.95', tags: ['V'] },
            { name: 'Jammie Dodger', desc: 'Raspberry compote, vanilla cream, crumbled Jammie Dodgers', price: '9.50', tags: ['V'] },
            { name: 'Berries & Greek Yoghurt', desc: 'Seasonal berries, Greek yoghurt, honey, toasted seeds', price: '8.95', tags: ['V'] }
          ]
        },
        {
          title: 'Big Plates',
          items: [
            { name: "Chloe's Full Breakfast", desc: 'Bacon, Cumberland sausage, black pudding, hash brown, mushrooms, beans, tomato, two eggs, toast', price: '12.95', star: true },
            { name: 'The Vegan Full', desc: 'Vegan sausage, smashed avocado, hash brown, mushrooms, beans, tomato, spinach, sourdough', price: '11.95', tags: ['VE'] },
            { name: 'Breakfast Burger', desc: 'Sausage patty, streaky bacon, fried egg, cheese, hash brown, brioche bun, house brown sauce', price: '11.50', star: true },
            { name: 'Breakfast Burrito', desc: 'Scrambled egg, chorizo, peppers, cheese, chipotle mayo, warm tortilla, skin-on fries', price: '12.50' },
            { name: 'Broccoli Steak Omelette', desc: 'Three-egg omelette, charred tenderstem, mature cheddar, dressed leaves', price: '11.50', tags: ['V', 'GF'], star: true }
          ]
        },
        {
          title: 'Lighter & On Toast',
          items: [
            { name: 'Eggs Benedict', desc: 'Toasted muffin, dry-cured ham, poached eggs, hollandaise', price: '10.50' },
            { name: 'Eggs Royale', desc: 'Toasted muffin, smoked salmon, poached eggs, hollandaise', price: '11.50' },
            { name: 'Smashed Avocado', desc: 'Sourdough, chilli, lime, feta, poached egg', price: '9.95', tags: ['V', 'GFA'] },
            { name: 'Bacon or Sausage Stottie', desc: 'Warm stottie, your choice of filling, brown or red', price: '6.50' },
            { name: 'Porridge & Poached Fruit', desc: 'Creamy oats, poached seasonal fruit, toasted almonds, honey', price: '6.95', tags: ['V'] }
          ]
        }
      ]
    },

    {
      id: 'main',
      name: 'Main Menu',
      kicker: 'Served 12pm – 4:30pm, every day',
      from: '12:00',
      to: '16:30',
      days: [0, 1, 2, 3, 4, 5, 6],
      art: 'art-burger',
      photo: 'assets/img/photo-main.jpg',
      blurb:
        'Lunch by the bay. Sandwiches on proper bread, buttermilk chicken worth the walk, and a specials board that changes with whatever the week brings in.',
      sections: [
        {
          title: 'To Start & To Share',
          items: [
            { name: 'Korean Chicken Tenders', desc: 'Buttermilk tenders, gochujang glaze, sesame, spring onion, kimchi mayo', price: '8.95', star: true },
            { name: 'Salt & Chilli Halloumi Fries', desc: 'Crisp halloumi, chilli, peppers, sriracha yoghurt', price: '7.95', tags: ['V'] },
            { name: 'Whitby Scampi', desc: 'Wholetail scampi, tartare, lemon', price: '7.50' },
            { name: 'Warm Focaccia', desc: 'Rosemary focaccia, whipped garlic butter, olives', price: '6.50', tags: ['V'] }
          ]
        },
        {
          title: 'Burgers, Buns & Sandwiches',
          note: 'All served with skin-on fries and slaw.',
          items: [
            { name: 'The Chloe Mae Burger', desc: 'Double smash patty, burger sauce, American cheese, pickles, brioche', price: '14.50', star: true },
            { name: 'Buttermilk Chicken Burger', desc: 'Fried chicken thigh, chipotle mayo, slaw, baby gem', price: '14.00' },
            { name: 'Korean Chicken Burger', desc: 'Gochujang glazed tenders, kimchi mayo, cucumber, sesame bun', price: '14.50' },
            { name: 'Halloumi & Roast Pepper Burger', desc: 'Grilled halloumi, roast peppers, harissa mayo, rocket', price: '13.50', tags: ['V'] },
            { name: 'Steak Sandwich', desc: 'Minute steak, caramelised onion, rocket, peppercorn mayo, ciabatta', price: '14.95' },
            { name: 'Club Sandwich', desc: 'Chicken, bacon, egg, tomato, baby gem, toasted bloomer', price: '12.50' }
          ]
        },
        {
          title: 'Plates & Bowls',
          items: [
            { name: 'Cullercoats Fish & Chips', desc: 'Beer-battered haddock, triple-cooked chips, crushed peas, tartare', price: '16.50', star: true },
            { name: 'Chicken Caesar', desc: 'Grilled chicken, baby gem, focaccia croutons, parmesan, anchovy dressing', price: '13.50' },
            { name: 'Roast Squash & Feta Salad', desc: 'Honey-roast squash, feta, pomegranate, toasted seeds, herb dressing', price: '12.50', tags: ['V', 'GF'] },
            { name: 'Katsu Chicken Curry', desc: 'Panko chicken, katsu sauce, sticky rice, pickled slaw', price: '14.50' },
            { name: 'Soup of the Day', desc: 'Made this morning, served with warm sourdough', price: '7.50', tags: ['V', 'VEA'] }
          ]
        },
        {
          title: 'Sides',
          items: [
            { name: 'Skin-on Fries', price: '4.00', tags: ['VE'] },
            { name: 'Truffle & Parmesan Fries', price: '5.50', tags: ['V'] },
            { name: 'Triple-cooked Chips', price: '4.50', tags: ['VE'] },
            { name: 'House Slaw', price: '3.00', tags: ['V', 'GF'] },
            { name: 'Dressed House Salad', price: '3.50', tags: ['VE', 'GF'] }
          ]
        }
      ]
    },

    {
      id: 'evening',
      name: 'Evening Menu',
      kicker: 'Thursday to Saturday, 5pm – 8:30pm',
      from: '17:00',
      to: '20:30',
      days: [4, 5, 6],
      art: 'art-evening',
      photo: 'assets/img/photo-evening.jpg',
      blurb:
        'Three nights a week the lights go low, the candles come out and the kitchen cooks a little differently. Booking is wise.',
      sections: [
        {
          title: 'Small Plates',
          note: 'Three between two is about right.',
          items: [
            { name: 'Lindisfarne Oysters', desc: 'Three, shallot vinegar, lemon', price: '9.50', tags: ['GF'] },
            { name: 'Korean Chicken Tenders', desc: 'Gochujang glaze, sesame, kimchi mayo', price: '8.95', star: true },
            { name: 'Chorizo & Butter Beans', desc: 'Slow-cooked, smoked paprika, gremolata, sourdough', price: '8.50' },
            { name: 'Burrata & Heritage Tomato', desc: 'Basil oil, aged balsamic, focaccia', price: '9.50', tags: ['V'] },
            { name: 'Crispy Squid', desc: 'Lime aioli, chilli, coriander', price: '8.95' }
          ]
        },
        {
          title: 'Mains',
          items: [
            { name: 'North Sea Cod', desc: 'Roast cod loin, brown shrimp butter, crushed new potatoes, samphire', price: '21.50', tags: ['GF'], star: true },
            { name: 'Sirloin Steak', desc: '8oz sirloin, triple-cooked chips, roast tomato, peppercorn sauce', price: '26.00', tags: ['GFA'] },
            { name: 'Half Roast Chicken', desc: 'Lemon and thyme, garlic butter, fries, dressed leaves', price: '19.50', tags: ['GF'] },
            { name: 'Wild Mushroom Orzo', desc: 'Roast garlic, spinach, parmesan, truffle oil', price: '17.50', tags: ['V'] },
            { name: 'The Chloe Mae Burger', desc: 'Double smash patty, burger sauce, cheese, pickles, fries', price: '15.50' }
          ]
        },
        {
          title: 'Puddings',
          items: [
            { name: 'Sticky Toffee Pudding', desc: 'Salted caramel, clotted cream', price: '8.50', tags: ['V'], star: true },
            { name: 'Biscoff Cheesecake', desc: 'Baked, caramelised biscuit crumb', price: '8.50', tags: ['V'] },
            { name: 'Dark Chocolate Delice', desc: 'Salted hazelnut, crème fraîche', price: '8.95', tags: ['V'] },
            { name: 'Northumbrian Cheeses', desc: 'Three cheeses, chutney, crackers, grapes', price: '11.50', tags: ['V'] }
          ]
        }
      ]
    },

    {
      id: 'drinks',
      name: 'Coffee, Cake & Drinks',
      kicker: 'From open until close, all day',
      from: '08:00',
      to: '20:45',
      days: [0, 1, 2, 3, 4, 5, 6],
      art: 'art-cake',
      photo: 'assets/img/photo-drinks.jpg',
      alwaysOn: true,
      blurb:
        'The counter never closes. Speciality coffee, loose leaf tea, and a cake fridge restocked most mornings.',
      sections: [
        {
          title: 'Coffee',
          note: 'House espresso roasted on Tyneside. Oat, soya and coconut milk at no extra charge.',
          items: [
            { name: 'Espresso / Macchiato', price: '2.60' },
            { name: 'Flat White', price: '3.40', star: true },
            { name: 'Latte / Cappuccino', price: '3.60' },
            { name: 'Mocha', price: '3.90' },
            { name: 'Iced Latte / Iced Filter', price: '3.80' },
            { name: 'Biscoff or Salted Caramel Latte', price: '4.20' }
          ]
        },
        {
          title: 'Tea & Other Warmers',
          items: [
            { name: 'Pot of Breakfast Tea', price: '2.80', tags: ['V'] },
            { name: 'Loose Leaf Infusions', desc: 'Peppermint, camomile, red berry, green', price: '3.10', tags: ['VE'] },
            { name: 'Proper Hot Chocolate', desc: 'Whipped cream, marshmallows, chocolate curls', price: '4.20', tags: ['V'] },
            { name: 'Chai Latte', price: '3.90', tags: ['V'] }
          ]
        },
        {
          title: 'Cold & Sweet',
          items: [
            { name: 'Milkshakes', desc: 'Biscoff, Oreo, strawberry, salted caramel', price: '5.50', tags: ['V'] },
            { name: 'Fresh Orange Juice', price: '3.20', tags: ['VE', 'GF'] },
            { name: 'Cake of the Day', desc: 'Ask at the counter — it changes daily', price: '4.50', tags: ['V'], star: true },
            { name: 'Warm Scone', desc: 'Clotted cream and jam', price: '4.20', tags: ['V'] },
            { name: 'Traybakes & Brownies', price: '3.50', tags: ['V'] }
          ]
        },
        {
          title: 'Something Stronger',
          note: 'Available from 12pm. Full wine and cocktail list on the table.',
          items: [
            { name: 'House Wine', desc: '175ml / 250ml / bottle', price: '6.00', priceNote: '/ 8.00 / 23.00' },
            { name: 'Prosecco', desc: '200ml bottle', price: '8.50' },
            { name: 'Bottled Beer & Cider', price: '5.00' },
            { name: 'Espresso Martini', price: '10.50', star: true },
            { name: 'Bloody Mary', desc: 'The morning-after brunch classic', price: '9.50' }
          ]
        }
      ]
    }
  ];

  /* -- Dietary key --------------------------------------------------------- */
  const TAGS = {
    V:   { short: 'V',   label: 'Vegetarian' },
    VE:  { short: 'VE',  label: 'Vegan' },
    VEA: { short: 'VEa', label: 'Vegan on request' },
    GF:  { short: 'GF',  label: 'Gluten free' },
    GFA: { short: 'GFa', label: 'Gluten free available' }
  };

  /* -- What people say ----------------------------------------------------
     Sentiment and phrasing drawn from public reviews on Google, Tripadvisor
     and local food blogs. Swap for verbatim quotes before going live.
     -------------------------------------------------------------------- */
  const REVIEWS = [
    { quote: 'Our favourite go-to place now for breakfast. Warm friendly welcome every single time and the food is consistently great.', author: 'Google review', stars: 5 },
    { quote: 'Great food, drinks and vibe. The staff are very friendly and the service is fantastic.', author: 'Tripadvisor review', stars: 5 },
    { quote: 'Excellent menu with friendly staff — this fab little place is always worth the trip down to the bay.', author: 'Tripadvisor review', stars: 5 },
    { quote: 'The pancake stack is famous for a reason, and the broccoli steak omelette is generously filled. Highly recommended.', author: 'Google review', stars: 5 },
    { quote: 'A hidden gem on the seafront. Lovely décor, lively room, and they are always good at recommending things.', author: 'Local food blog', stars: 5 },
    { quote: 'Best breakfast in Cullercoats. We walked the pier first and earned it.', author: 'Google review', stars: 5 }
  ];

  const RATINGS = [
    { source: 'Google', score: '4.6', of: '5' },
    { source: 'Tripadvisor', score: '4.4', of: '5' },
    { source: 'Uber Eats', score: '4.5', of: '5' }
  ];

  return { INFO, HOURS, SERVICES, TAGS, REVIEWS, RATINGS };
})();
