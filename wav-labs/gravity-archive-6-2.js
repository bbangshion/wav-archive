/* WAV ARCHIVE · Gravity 6.2: navigation/filters only.
 * Original Gravity predictor, replay, history and insights scripts are untouched.
 */
(() => {
 'use strict';
 const panel = document.querySelector('#decisions');
 if (!panel || window.__waGravity62) return;
 window.__waGravity62 = true;
 const filters = [...panel.querySelectorAll('.wa62-filter-btn')];
 const records = [...panel.querySelectorAll('.wa62-record')];
 filters.forEach(button => button.addEventListener('click', () => {
   const selected = button.dataset.kind;
   filters.forEach(other => {
     const active = other === button;
     other.classList.toggle('is-active', active);
     other.setAttribute('aria-pressed', String(active));
   });
   records.forEach(rec => { rec.hidden = selected !== 'all' && rec.dataset.kind !== selected; });
 }));
 // Honor direct links to a specific feature without changing the original 4-tab engine.
 const allowed = new Set(['decisions','history','replay','prediction','insights','policy']);
 const tabs = [...document.querySelectorAll('.tabs [data-tab]')];
 let restoring = false;
 function restoreHash() {
   const slug = decodeURIComponent(location.hash.slice(1));
   if (!allowed.has(slug)) return;
   const target = tabs.find(t => t.dataset.tab === slug);
   if (!target || target.classList.contains('active')) return;
   restoring = true;
   target.click();
   restoring = false;
 }
 tabs.forEach(t => t.addEventListener('click', () => {
   if (restoring) return;
   const desired = '#' + t.dataset.tab;
   if (location.hash !== desired) {
     try { history.replaceState(history.state, '', location.pathname + location.search + desired); }
     catch (_) { /* Sandbox/test contexts may disallow History API updates. Tab still works. */ }
   }
 }));
 window.addEventListener('hashchange', restoreHash);
 restoreHash();
})();
