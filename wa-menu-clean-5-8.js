/* WAV ARCHIVE · menu label hotfix 5.9.1
 * Changes menu TEXT ONLY: preserves all existing URLs, search, click handlers,
 * calendar, feature modules and personal storage. Re-renders are supported.
 */
(() => {
  'use strict';
  if (window.WAVMenuClean591) return;

  const rootIds = ['waGroupedMenu', 'mobileMenu'];
  const decor = /^[\s\u00a0]*[✦✧✨❖◆◇✥✣✷✺✹◈⭐🌟][\s\u00a0]*/u;
  const version = /(^|[\s\u00a0·\/|(:])(?:v(?:ersion)?\s*)?(?:4\.5|5\.5|8\.0|9\.0|11\.5|15\.5\+?|16\.0|17\.0)(?=$|[\s\u00a0·\/|):])/gi;
  const exactVersion = /^(?:v(?:ersion)?\s*)?(?:4\.5|5\.5|8\.0|9\.0|11\.5|15\.5\+?|16\.0|17\.0)$/i;
  let raf = 0;
  const observers = new Map();
  const stats = { changed: 0, refreshes: 0 };

  function polish(input) {
    if (!input || !input.trim()) return input;
    if (!decor.test(input) && !/(?:15\.5|17\.0|16\.0|11\.5|8\.0|9\.0|5\.5|4\.5)/.test(input)) return input;
    let next = input.replace(decor, '');
    next = next.replace(version, (_, prefix) => prefix || '');
    next = next.replace(/[\t ]{2,}/g, ' ');
    // UI name only. Keep brand/system names and preserve meaningful counts.
    if (/^WAV\s+LABS?$/i.test(next.trim())) next = next.replace(/LABS?\s*$/i, 'LAB');
    return next;
  }

  function textNodes(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest('script,style,svg,noscript,textarea,option,[contenteditable="true"]'))
          return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
  }

  function addCalendar(root) {
    if (root.querySelector('.wa58-calendar-link')) return;
    if (root.id === 'waGroupedMenu') {
      const explore = [...root.querySelectorAll('.wa-menu-group')]
        .find(group => /EXPLORE|탐색/i.test(group.querySelector('.wa-menu-label')?.textContent || ''));
      if (!explore) return;
      const link = document.createElement('a');
      link.className = 'wa58-calendar-link';
      link.href = '#wa-auto-hub';
      link.textContent = 'CALENDAR';
      const previous = explore.querySelector('a[href="#timeline"]');
      if (previous) previous.after(link); else explore.append(link);
    } else if (root.id === 'mobileMenu') {
      const group = [...root.querySelectorAll('.wa12-menu-group')]
        .find(g => /ARCHIVE|EXPLORE|탐색/i.test(g.querySelector('h3')?.textContent || ''));
      const links = group?.querySelector('.wa12-menu-links');
      if (!links) return;
      const link = document.createElement('a');
      link.className = 'wa12-menu-link wa58-calendar-link';
      link.href = '#wa-auto-hub';
      const title = document.createElement('strong'); title.textContent = '공식 캘린더';
      const label = document.createElement('span'); label.append(title);
      const extra = document.createElement('small'); extra.textContent = 'CALENDAR'; label.append(extra);
      const arrow = document.createElement('i'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden','true');
      link.append(label, arrow);
      links.append(link);
    }
  }

  function cleanRoot(root) {
    if (!root) return;
    stats.refreshes++;
    // Hide isolated release tags before their text nodes are normalized.
    for (const badge of root.querySelectorAll('span,small,em,b')) {
      if (badge.childElementCount !== 0) continue;
      if (exactVersion.test((badge.textContent || '').trim())) {
        badge.hidden = true;
        badge.setAttribute('aria-hidden', 'true');
      }
    }
    for (const node of textNodes(root)) {
      const updated = polish(node.nodeValue);
      if (node.nodeValue !== updated) {
        node.nodeValue = updated;
        stats.changed++;
      }
    }
    // Standalone release badges should not leave an empty chip in the menu.
    for (const badge of root.querySelectorAll('span,small,em,b')) {
      if (badge.childElementCount !== 0) continue;
      if (exactVersion.test((badge.textContent || '').trim())) {
        badge.hidden = true;
        badge.setAttribute('aria-hidden', 'true');
      }
    }
    addCalendar(root);
  }

  function refresh() {
    for (const id of rootIds) cleanRoot(document.getElementById(id));
    observeRoots();
  }
  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = 0; refresh(); });
  }
  function observeRoots() {
    for (const id of rootIds) {
      const root = document.getElementById(id);
      if (!root || observers.get(id)?.root === root) continue;
      observers.get(id)?.observer.disconnect();
      const observer = new MutationObserver(changes => {
        if (changes.some(c => c.type === 'characterData' || c.type === 'childList')) schedule();
      });
      observer.observe(root, {subtree:true, childList:true, characterData:true});
      observers.set(id, {root, observer});
    }
  }
  function init() {
    refresh();
    // Legacy menu launchers and feature modules may add cards after initial load.
    document.addEventListener('click', event => {
      const el = event.target;
      if (!(el instanceof Element)) return;
      if (el.closest('#waGroupedMenu,#mobileMenu,#menu,#waGroupedMenuOpen,#mobileMenuBtn,[data-wa-menu-open]')) {
        refresh();
        setTimeout(schedule, 70);
      }
      if (el.closest('.wa58-calendar-link') && window.WAVFocus57?.open) {
        window.WAVFocus57.open('schedule');
      }
    }, true);
    window.addEventListener('pageshow', schedule);
    // Detect if the entire menu DOM was replaced later by an existing theme/menu script.
    new MutationObserver(changes => {
      if (changes.some(c => [...c.addedNodes].some(n => n.nodeType===1 && (n.id==='waGroupedMenu' || n.id==='mobileMenu' || n.querySelector?.('#waGroupedMenu,#mobileMenu'))))) schedule();
    }).observe(document.body, {childList:true, subtree:false});
    window.WAVMenuClean591 = Object.freeze({refresh, stats});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
