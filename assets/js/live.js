/* ============================================================================
   Chloe Mae's — live service engine
   ----------------------------------------------------------------------------
   Works out what the kitchen is serving *right now* in the cafe's own
   timezone, so a visitor in Sydney sees the same answer as someone standing
   on St George's Road. Gives an hour's notice before every changeover.

   Anything on the page that wants to stay in step calls:
       CHLOE_LIVE.subscribe(state => { ... })
   ========================================================================== */

window.CHLOE_LIVE = (function (DATA) {
  'use strict';

  const TZ = DATA.INFO.timezone;
  const NOTICE_MINUTES = 60;            // how much warning before a changeover
  const TICK_MS = 15000;                // how often the clock is re-read

  const DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /* -- time helpers -------------------------------------------------------- */

  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };

  /* "08:00" -> "8am", "16:30" -> "4:30pm" */
  function pretty(hhmm) {
    let [h, m] = hhmm.split(':').map(Number);
    const suffix = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return m === 0 ? `${h}${suffix}` : `${h}:${String(m).padStart(2, '0')}${suffix}`;
  }

  /* 95 -> "1 hr 35 min" */
  function duration(mins) {
    if (mins <= 1) return 'a minute';
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (m === 0) return h === 1 ? '1 hr' : `${h} hrs`;
    return `${h} hr ${m} min`;
  }

  /* The cafe's own wall clock, whatever the visitor's device thinks. */
  function cafeClock(date) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: TZ, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(date || new Date());

    const get = (t) => parts.find((p) => p.type === t).value;
    const hour = parseInt(get('hour'), 10) % 24;   // some engines render midnight as 24
    const minute = parseInt(get('minute'), 10);

    return {
      day: DAY_INDEX[get('weekday')],
      minutes: hour * 60 + minute,
      clock: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    };
  }

  /* -- lookups ------------------------------------------------------------- */

  const hoursFor = (day) => DATA.HOURS[day];
  const isTradingDay = (day) => {
    const h = hoursFor(day);
    return !!h && !h.closed;
  };

  /* Services that drive changeovers (the all-day counter menu does not). */
  const kitchenServices = (day) =>
    DATA.SERVICES
      .filter((s) => !s.alwaysOn && s.days.includes(day))
      .sort((a, b) => toMinutes(a.from) - toMinutes(b.from));

  const allDayServices = (day) => DATA.SERVICES.filter((s) => s.alwaysOn && s.days.includes(day));

  function nextTradingDay(fromDay) {
    for (let step = 1; step <= 7; step++) {
      const day = (fromDay + step) % 7;
      if (isTradingDay(day)) return { day, step };
    }
    return null;
  }

  /* Friendly name for a day relative to today. */
  function dayLabel(day, step) {
    if (step === 0) return 'today';
    if (step === 1) return 'tomorrow';
    return DAY_NAMES[day];
  }

  /* -- the state ----------------------------------------------------------- */

  function getState(now) {
    const t = cafeClock(now);
    const today = hoursFor(t.day);
    const open = toMinutes(today.open);
    const close = toMinutes(today.close);
    const trading = isTradingDay(t.day) && t.minutes >= open && t.minutes < close;

    const services = kitchenServices(t.day);
    const current = services.find((s) => t.minutes >= toMinutes(s.from) && t.minutes < toMinutes(s.to)) || null;
    const upcoming = services.find((s) => toMinutes(s.from) > t.minutes) || null;

    const state = {
      clock: t.clock,
      day: t.day,
      dayName: DAY_NAMES[t.day],
      todayHours: today,
      todayHoursLabel: today.closed ? 'Closed' : `${pretty(today.open)} – ${pretty(today.close)}`,
      isOpen: trading,
      current,                       // the kitchen menu being served, or null
      alwaysOn: allDayServices(t.day),
      upcoming,
      /* filled in below */
      status: 'closed',
      headline: '',
      detail: '',
      changeAt: null,
      changeTo: null,
      minutesToChange: null,
      noticeActive: false,
      progress: 0
    };

    /* --- closed ---------------------------------------------------------- */
    if (!trading) {
      const beforeOpening = isTradingDay(t.day) && t.minutes < open;
      let opensDay = t.day, opensAt = today.open, step = 0;

      if (!beforeOpening) {
        const next = nextTradingDay(t.day);
        opensDay = next.day;
        opensAt = hoursFor(next.day).open;
        step = next.step;
      }

      const first = kitchenServices(opensDay)[0];
      state.status = 'closed';
      state.changeAt = opensAt;
      state.changeTo = first || null;
      state.headline = 'Closed right now';
      state.detail = beforeOpening
        ? `We open at ${pretty(opensAt)} this morning${first ? ` with ${first.name.toLowerCase()}` : ''}.`
        : `Back ${dayLabel(opensDay, step)} at ${pretty(opensAt)}${first ? ` for ${first.name.toLowerCase()}` : ''}.`;

      if (beforeOpening) {
        state.minutesToChange = open - t.minutes;
        state.noticeActive = state.minutesToChange <= NOTICE_MINUTES;
        if (state.noticeActive) {
          state.headline = `Opening in ${duration(state.minutesToChange)}`;
          state.detail = `The doors go back at ${pretty(opensAt)}${first ? ` — ${first.name.toLowerCase()} first.` : '.'}`;
        }
      }
      return state;
    }

    /* --- open, mid-service ----------------------------------------------- */
    if (current) {
      const startsAt = toMinutes(current.from);
      const endsAt = toMinutes(current.to);
      const follows = upcoming;   // the menu that takes over, if there is one

      state.status = 'serving';
      state.progress = Math.min(1, Math.max(0, (t.minutes - startsAt) / (endsAt - startsAt)));
      state.minutesToChange = endsAt - t.minutes;
      state.changeAt = current.to;
      state.changeTo = follows || null;
      state.noticeActive = state.minutesToChange <= NOTICE_MINUTES;

      state.headline = `Now serving ${current.name}`;

      if (state.noticeActive) {
        state.status = 'changeover-soon';
        state.headline = `${current.name} ends in ${duration(state.minutesToChange)}`;
        if (follows) {
          const gap = toMinutes(follows.from) - endsAt;
          state.detail = gap > 0
            ? `Last orders at ${pretty(current.to)}. ${follows.name} opens at ${pretty(follows.from)} — coffee and cake in between.`
            : `Last orders at ${pretty(current.to)}, then the ${follows.name.toLowerCase()} takes over.`;
        } else {
          state.detail = `Last kitchen orders at ${pretty(current.to)}. The counter stays open for coffee and cake until ${pretty(today.close)}.`;
        }
      } else {
        state.detail = follows
          ? `On until ${pretty(current.to)}, then ${follows.name.toLowerCase()} from ${pretty(follows.from)}.`
          : `On until ${pretty(current.to)}. Coffee, cake and drinks all day.`;
      }
      return state;
    }

    /* --- open, between services ------------------------------------------ */
    state.status = 'between';
    state.headline = 'Coffee & cake right now';
    if (upcoming) {
      state.minutesToChange = toMinutes(upcoming.from) - t.minutes;
      state.changeAt = upcoming.from;
      state.changeTo = upcoming;
      state.noticeActive = state.minutesToChange <= NOTICE_MINUTES;
      state.detail = `The kitchen is between services. ${upcoming.name} starts at ${pretty(upcoming.from)}` +
        (state.noticeActive ? ` — ${duration(state.minutesToChange)} away.` : '.');
    } else {
      state.minutesToChange = close - t.minutes;
      state.changeAt = today.close;
      state.noticeActive = state.minutesToChange <= NOTICE_MINUTES;
      state.detail = `The kitchen has finished for the day. The counter is open for coffee, cake and drinks until ${pretty(today.close)}.`;
    }
    return state;
  }

  /* -- subscriptions ------------------------------------------------------- */

  const listeners = new Set();
  let last = null;
  let timer = null;

  function publish() {
    const state = getState();
    last = state;
    listeners.forEach((fn) => {
      try { fn(state); } catch (err) { console.error('[live]', err); }
    });
  }

  function start() {
    if (timer) return;
    publish();
    timer = setInterval(publish, TICK_MS);
    /* A laptop waking from sleep should catch up immediately. */
    document.addEventListener('visibilitychange', () => { if (!document.hidden) publish(); });
  }

  function subscribe(fn) {
    listeners.add(fn);
    if (last) fn(last); else start();
    return () => listeners.delete(fn);
  }

  return { subscribe, getState, start, pretty, duration, toMinutes, NOTICE_MINUTES };
})(window.CHLOE);
