/* WAV ARCHIVE 5.7 · Focused Navigation
 * Presentation-only section router for the ORIGINAL main document.
 * No cloning, moving, replacing, rendering or modifying content/data/events.
 * Designed to leave all global dialogs, layers and fixed navigation intact.
 */
(() => {
  'use strict';
  if (window.WAVFocus57) return;

  const ROUTES = Object.freeze({
    home: ['wa50Home','xHome'],
    members: ['xMemberExperience','members'],
    dimensions: ['units','dimension-hub'],
    gravity: ['gravity'],
    history: ['xTimeMachine','timeline'],
    discography: ['discography','wa50JapanAlbum'],
    music: ['music','cheering'],
    cheering: ['cheering'],
    archive: ['archivehub'],
    content: ['updates'],
    schedule: ['wa-auto-hub'],
    play: ['waNavPlay','wa73Guess','wa74Academy','wa75Builder'],
    guide: ['wa70Discovery'],
    universe: ['xUniverse','connected-world'],
    badgewar: ['badgewar4'],
    about: ['about'],
    creator: ['creator'],
    memories: ['waMemories','waSpecialRecord'],
    mywav: ['waHome45','waXMyUniverse','wavId'],
    notice: ['wa-notice-entry'],
    updates: ['wa52UpdateStatus'],
    trust: ['wa-trust-dashboard'],
    legacy: ['archive']
  });
  const ALIAS = Object.freeze({
    top:'home', wa6Home:'home', xHome:'home', wa50Home:'home',
    wa60Command:'home', wavStarter:'guide', wa70Discovery:'guide',
    xMemberExperience:'members', members:'members',
    units:'dimensions','dimension-hub':'dimensions',
    gravity:'gravity', wa63GravityIntelligence:'gravity',
    timeline:'history', xTimeMachine:'history',
    discography:'discography', wa50JapanAlbum:'discography',
    music:'music', cheering:'cheering',
    archivehub:'archive', updates:'content',
    'wa-auto-hub':'schedule', waHome45:'mywav',
    waNavPlay:'play', wa73Guess:'play', wa74Academy:'play', wa75Builder:'play',
    wa70Discovery:'guide', xUniverse:'universe', 'connected-world':'universe',
    badgewar4:'badgewar', about:'about', creator:'creator',
    waMemories:'memories', waSpecialRecord:'memories',
    wavId:'mywav', waXMyUniverse:'mywav',
    'wa-notice-entry':'notice', 'wa52UpdateStatus':'updates',
    archive:'legacy', 'wa-trust-dashboard':'trust'
  });
  const EXTERNAL = ['waHome45','waXMyUniverse','wavId','waMemories','waSpecialRecord','wa60Command','wa-notice-entry','wa52UpdateStatus'];
  let current = 'home';
  let main = null;
  let sections = [];
  let externals = [];
  let homeSection = null;

  function available(key) {
    return ROUTES[key] && ROUTES[key].some(id => document.getElementById(id));
  }
  function sectionOf(element) {
    if (!element || !main || !main.contains(element)) return null;
    const root = element.closest('main > section');
    return root && root.parentElement === main ? root : null;
  }
  function resolve(id) {
    if (!id || typeof id !== 'string') return null;
    if (ALIAS[id]) return ALIAS[id];
    const el = document.getElementById(id);
    if (!el) return null;
    const root = sectionOf(el);
    if (root && ALIAS[root.id]) return ALIAS[root.id];
    for (const [route, ids] of Object.entries(ROUTES)) {
      if (ids.includes(root?.id) || ids.includes(id)) return route;
    }
    return null; // Ignore popups, modal buttons and unknown hashes.
  }
  function readHash() {
    try { return decodeURIComponent(window.location.hash.substring(1)); }
    catch { return window.location.hash.substring(1); }
  }
  function allow(home) {
    const allowed = new Set(ROUTES[home] || []);
    if (home === 'home' && homeSection) {
      allowed.delete('wa50Home');
      allowed.delete('xHome');
      allowed.add(homeSection);
    }
    return allowed;
  }
  function update(route) {
    if (!available(route)) return false;
    const permitted = allow(route);
    // Set attributes, not innerHTML: original event handlers and data remain intact.
    for (const section of sections) {
      if (permitted.has(section.id)) section.setAttribute('data-wa57-show', '');
      else section.removeAttribute('data-wa57-show');
    }
    for (const el of externals) {
      if (permitted.has(el.id)) el.setAttribute('data-wa57-show', '');
      else el.removeAttribute('data-wa57-show');
    }
    current = route;
    document.documentElement.setAttribute('data-wa57-view',route);
    return true;
  }
  function visible(route, scrollTop = false) {
    const changed = update(route);
    if (changed && scrollTop) window.requestAnimationFrame(() => window.scrollTo({top:0,behavior:'instant'}));
    return changed;
  }
  function detectNavigation(target) {
    const link = target.closest('a[href],button,[data-wa-go],[data-wa50-go],[data-go],[data-major]');
    if (!link) return null;
    if (link.matches('[data-major]')) {
      const key = link.getAttribute('data-major');
      if (key === 'home') return 'home';
      if (key === 'members') return 'members';
      if (key === 'today') return 'schedule';
      return null; // DNA opens the pre-existing modal, with no view change.
    }
    const attr = ['data-wa-go','data-wa50-go','data-go'].map(a=>link.getAttribute(a)).find(Boolean);
    if (attr) return resolve(attr) || (attr === 'time' ? 'history' : null);
    if (link.hasAttribute('data-special')) {
      return link.getAttribute('data-special') === 'time' ? 'history' : null;
    }
    if (link.hasAttribute('data-h45-members')) return 'members';
    if (link.hasAttribute('data-h45-schedule')) return 'schedule';
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#') || href === '#') return null;
    return resolve(href.slice(1));
  }
  function init() {
    if (new URLSearchParams(window.location.search).has('wa57_all')) return; // Emergency: original long page.
    main = document.querySelector('main#top') || document.querySelector('main');
    if (!main || !document.getElementById('members') || !document.getElementById('gravity')) return;
    sections = [...main.children].filter(el => el.tagName === 'SECTION');
    externals = EXTERNAL.map(id => document.getElementById(id)).filter(Boolean);
    externals.forEach(el => el.classList.add('wa57-managed-external'));
    // Preserve the site's current choice of visual home: never force a hidden hero to display.
    const visibleBefore = ['wa50Home','xHome'].filter(id => {
      const el = document.getElementById(id);
      return el && getComputedStyle(el).display !== 'none';
    });
    homeSection = visibleBefore[0] || 'xHome';
    const initial = resolve(readHash());
    const startRoute = initial && available(initial) ? initial : 'home';
    update(startRoute);
    document.documentElement.classList.add('wa57-focused');
    // Capture navigation before existing scroll handlers; do not cancel any click.
    document.addEventListener('click', ev => {
      if (!(ev.target instanceof Element)) return;
      const route = detectNavigation(ev.target);
      if (route && route !== current) visible(route);
    }, true);
    window.addEventListener('hashchange', () => {
      const route = resolve(readHash());
      if (route) visible(route);
    });
    window.addEventListener('popstate', () => {
      const route = resolve(readHash());
      if (route) visible(route);
    });
    // 'WAV ARCHIVE' logo/home anchors are already handled by the existing site.
    window.WAVFocus57 = Object.freeze({
      version:'5.7.0', get view(){return current;},
      open(route){return visible(route,true);},
      reset(){document.documentElement.classList.remove('wa57-focused');}
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
