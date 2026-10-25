/* WAV ARCHIVE UI refresh - scoped visual rebranding, no feature state modification. */
(() => {
  'use strict';
  if (window.__wavBrandRefreshInstalled) return;
  window.__wavBrandRefreshInstalled = true;

  const IGNORE = /^(SCRIPT|STYLE|TEXTAREA|INPUT|CODE|PRE|NOSCRIPT|TEMPLATE|SVG|MATH)$/;
  const MARKER = /\b(?:WAV\b|ARCHIVE\b|VER(?:SION)?\.?\s*\d{1,2}|V\s*\d{1,2})/i;
  const menu = () => document.getElementById('waGroupedMenu');

  function copyWithoutVersion(text) {
    let s = text;
    // Only WAV ARCHIVE and related *product UI* versions are removed.
    // Musical release versions, dates, Gravity results and identifiers are left intact.
    s = s.replace(/\b(WAV\s+ARCHIVE)\s*(?:[·|/–—-]\s*)?(?:VER(?:SION)?\.?\s*|V\s*)?\d{1,2}(?:\.\d{1,2}){1,2}\+?(?=\s|$|[·|/–—-])/gi, '$1');
    s = s.replace(/\b(WAV\s+ARCHIVE)\s*(?:[·|/–—-]\s*)?(?:VER(?:SION)?\.?\s*|V\s*)\d{1,2}\b/gi, '$1');
    s = s.replace(/\bWAV\s+\d{1,2}(?:\.\d{1,2}){1,2}\+?\s+(LABS?|DATA\s+LAB|ARCHIVE|HUB)\b/gi, 'WAV $1');
    s = s.replace(/\bWAV\s+\d{1,2}(?:\.\d{1,2}){1,2}\+?(?=\s*$)/gi, 'WAV');
    s = s.replace(/\b(WAV\s+(?:ARCHIVE|LABS?|UNIVERSE))\s*[·|/–—-]\s*PHASE\s*\d{1,2}\b/gi, '$1');
    s = s.replace(/\b(WAV\s+(?:PLAY|LABS?|UNIVERSE|COLLECTION))\s*(?:[·|/–—-]\s*)?(?:VER(?:SION)?\.?\s*|V\s*)?\d{1,2}(?:\.\d{1,2}){1,2}\+?(?=\s|$|[·|/–—-])/gi, '$1');
    s = s.replace(/\b(CONNECTED\s+UNIVERSE)\s*(?:[·|/–—-]\s*)?(?:VER(?:SION)?\.?\s*|V\s*)?\d{1,2}(?:\.\d{1,2}){1,2}\b/gi, '$1');
    // Standalone version badges - never strip a number out of content or date text.
    if (/^\s*(?:VER(?:SION)?\.?|V)\s*\d{1,2}(?:\.\d{1,2}){0,2}\s*$/i.test(s)) return '';
    return s.replace(/[ \t]{2,}/g, ' ');
  }

  function replaceTextNode(node) {
    const parent = node.parentElement;
    if (!parent || IGNORE.test(parent.tagName) || parent.closest('[contenteditable="true"],[data-wa-preserve-version]')) return;
    const value = node.nodeValue;
    if (!value || !MARKER.test(value)) return;
    const next = copyWithoutVersion(value);
    if (next !== value) node.nodeValue = next;
  }

  function rewriteVisibleText(root, limit = 6000) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {replaceTextNode(root);return;}
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE && IGNORE.test(root.tagName)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const p = n.parentElement;
        if (!p || IGNORE.test(p.tagName) || p.closest('[contenteditable="true"],[data-wa-preserve-version]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let n, count = 0;
    while ((n = walker.nextNode()) && count++ < limit) replaceTextNode(n);
  }

  function rewriteMetadata(root) {
    if (!root || root.nodeType !== Node.ELEMENT_NODE) return;
    // Only user-visible strings; semantic data-* and aria roles stay untouched.
    const sel = '[aria-label],[title],[placeholder]';
    const nodes = [root];
    if (root.querySelectorAll) nodes.push(...root.querySelectorAll(sel));
    for (const node of nodes) {
      if (!node.matches?.(sel)) continue;
      for (const key of ['aria-label', 'title', 'placeholder']) {
        if (!node.hasAttribute(key)) continue;
        const val = node.getAttribute(key), next = copyWithoutVersion(val);
        if (val !== next) node.setAttribute(key, next);
      }
    }
  }

  function syncMenu() {
    const layer = menu();
    if (!layer) return;
    layer.classList.add('wa-brand-refresh');
    const header = layer.querySelector('.wa-menu-top small');
    if (header) header.textContent = 'WAV ARCHIVE';
    const title = layer.querySelector('.wa-menu-top b');
    if (title && /\b(?:menu|메뉴)\b/i.test(title.textContent || '')) title.textContent = 'MENU';
    rewriteVisibleText(layer, 2500);
    rewriteMetadata(layer);
    const opened = layer.classList.contains('open');
    document.body.classList.toggle('wa-brand-refresh-menu-open', opened);
  }

  let scheduled = false;
  function scheduleRecheck() {
    if (scheduled || document.hidden) return;
    scheduled = true;
    // A single consolidated pass after user navigation, not a continuous observer.
    const run = () => {
      scheduled = false;
      syncMenu();
      const opened = document.querySelectorAll('dialog[open],[role="dialog"],.wa-memberdb.open,.wa-labs-overlay.open');
      for (let i=0;i<Math.min(opened.length,12);i++) rewriteVisibleText(opened[i], 1700);
    };
    if (typeof requestIdleCallback === 'function') requestIdleCallback(run, {timeout:300});
    else window.setTimeout(run, 60);
  }

  function init() {
    if (!document.body) return;
    syncMenu();
    rewriteVisibleText(document.body, 8000);
    rewriteMetadata(document.body);
    const layer = menu();
    if (layer && window.MutationObserver) {
      const watcher = new MutationObserver(() => syncMenu());
      watcher.observe(layer, {attributes:true,attributeFilter:['class'],childList:true,subtree:false});
      const panel = layer.querySelector('.wa-menu-panel');
      if (panel) {
        const menuWatcher = new MutationObserver(() => {
          // Handles separately loaded SEARCH OS, SIGNAL and LAB buttons.
          rewriteVisibleText(panel, 2000);
        });
        menuWatcher.observe(panel, {childList:true,subtree:true});
      }
    }
    // Standalone pages often mount dialogs directly to <body>.
    if (window.MutationObserver) {
      const bodyWatcher = new MutationObserver(entries => {
        for (const entry of entries) {
          for (const node of entry.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE && node !== layer) {
              if (node.matches('dialog,[role="dialog"],section,aside') || node.id) rewriteVisibleText(node, 2000);
            }
          }
        }
      });
      bodyWatcher.observe(document.body, {childList:true});
    }
    document.addEventListener('click', scheduleRecheck, {capture:true,passive:true});
    window.addEventListener('hashchange', scheduleRecheck, {passive:true});
    window.addEventListener('pageshow', scheduleRecheck, {passive:true});
    document.addEventListener('visibilitychange', () => {if (!document.hidden) scheduleRecheck()}, {passive:true});
    window.waBrandRefresh = scheduleRecheck;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
