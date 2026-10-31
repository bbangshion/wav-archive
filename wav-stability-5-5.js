/* WAV ARCHIVE 5.5 · Conservative stability helpers
 * Additive only. No persistent storage writes, no data mutation, no global click interception.
 * Recovery is attempted only if an explicit DETAIL click produced no visible dialog.
 */
(() => {
  'use strict';
  if (window.WAVStability55) return;
  const ID = /^S(?:0[1-9]|1\d|2[0-4])$/;
  const stats = {detailClicks:0, detailFallbacks:0, caughtErrors:0, unhandledRejections:0};
  const exists = id => !!document.getElementById(id);
  const visible = el => !!el && (el.classList.contains('on') || el.getAttribute('aria-hidden') === 'false') && getComputedStyle(el).display !== 'none';
  const modalReady = () => {
    const modal = document.getElementById('wa65DetailModal');
    const body = document.getElementById('wa65DetailBody');
    return !!(visible(modal) && body && body.textContent.trim());
  };
  function check() {
    // Read-only runtime report. Missing optional sections are "not detected", not a fatal error.
    return {
      memberGrid: exists('memberGrid'), memberDetailModal: exists('wa65DetailModal'),
      searchOS: exists('waSearchLayer') && exists('waGlobalSearch'),
      gravity: exists('gravity'), timeline: exists('timeline'),
      objektLink: !!document.querySelector('a[href*="objekt-collection"], a[href*="objekt-data-lab"]'),
      signalLink: !!document.querySelector('a[href*="signal-moments"]'),
      historyUniverse: !!document.querySelector('#waHistoryUniverse, .wa-hu, [data-wa-hu]') || !!window.WAVHistoryUniverse,
      detailEngine: typeof window.WAVMember360?.open === 'function' || typeof window.WA65?.member === 'function',
      counts: {...stats}
    };
  }
  // A single capturing click listener. It does not cancel the original click or flip behavior.
  document.addEventListener('click', event => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest('.member-back > .wa65-open-member');
    if (!button) return;
    const card = button.closest('.member-card[data-member]');
    const id = String(card?.dataset.member || '').toUpperCase();
    if (!ID.test(id)) return;
    stats.detailClicks++;
    // Existing handlers open on the next animation frame. Give those handlers time to finish.
    window.setTimeout(() => {
      if (!document.contains(card) || modalReady()) return;
      try {
        let recovered = false;
        if (typeof window.WAVMember360?.open === 'function') {
          recovered = window.WAVMember360.open(id) === true;
        }
        if (!recovered && typeof window.WA65?.member === 'function') {
          window.WA65.member(id);
          recovered = true;
        }
        if (recovered) stats.detailFallbacks++;
      } catch (err) {
        stats.caughtErrors++;
        console.warn('[WAV 5.5] DETAIL fallback could not recover:', err);
      }
    }, 250);
  }, true);
  // Diagnostics are retained in memory for this page view only. No tracking or storage writes.
  window.WAVStability55 = Object.freeze({version:'5.5.0',check});
})();


/* 5.6 copy polish: display-only layer; does not replace any functional module. */
(()=>{'use strict';
  if(document.getElementById('wa-copy-56-js'))return;
  const js=document.createElement('script');
  js.id='wa-copy-56-js';
  js.src='./wa-copy-5-6.js?v=20261031-56';
  js.defer=true;
  js.addEventListener('error',()=>console.warn('[WAV 5.6] Optional copy layer unavailable'));
  document.head.appendChild(js);
})();

/* WAV ARCHIVE 5.7 optional focused-section navigation.
   If either resource is missing, all existing features remain available as before. */
(() => {
  'use strict';
  if (document.getElementById('wa-focus57-script')) return;
  const css = document.createElement('link');
  css.rel = 'stylesheet'; css.id = 'wa-focus57-css';
  css.href = './wa-focus-nav-5-7.css?v=20261031-57';
  css.addEventListener('error', () => console.warn('[WAV 5.7] Optional view style not loaded.'));
  document.head.appendChild(css);
  const js = document.createElement('script');
  js.src = './wa-focus-nav-5-7.js?v=20261031-57';
  js.id = 'wa-focus57-script'; js.defer = true;
  js.addEventListener('error', () => {
    css.remove();
    console.warn('[WAV 5.7] View module missing. Original full page remains accessible.');
  });
  document.head.appendChild(js);
})();

/* 5.9.1 menu label hotfix + Calendar. Optional, isolated and reversible. */
(()=>{'use strict';
 if(document.getElementById('wa-menu-clean-58-script'))return;
 const css=document.createElement('link');css.rel='stylesheet';css.href='./wa-menu-clean-5-8.css?v=20261031-591';css.id='wa-menu-clean-58-css';document.head.append(css);
 const js=document.createElement('script');js.src='./wa-menu-clean-5-8.js?v=20261031-591';js.defer=true;js.id='wa-menu-clean-58-script';
 js.addEventListener('error',()=>{css.remove();console.warn('[WAV] Optional menu polish unavailable.');});
 document.head.append(js);
})();


/* WAV ARCHIVE 5.9 — reversible HOME landing and merged Search OS entry. */
(()=>{'use strict';
 if(document.getElementById('wa59-home-script') || new URLSearchParams(location.search).has('wa59_original'))return;
 const css=document.createElement('link');css.rel='stylesheet';css.id='wa59-home-css';css.href='./wa-home-search-5-9.css?v=20261031-510';
 const js=document.createElement('script');js.id='wa59-home-script';js.src='./wa-home-search-5-9.js?v=20261031-510';js.defer=true;
 js.addEventListener('error',()=>{css.remove();console.warn('[WAV] Optional HOME/Search layout unavailable; existing page preserved.');});
 document.head.append(css,js);
})();
