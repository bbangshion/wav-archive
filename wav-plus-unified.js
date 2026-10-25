/* WAV ARCHIVE · Unified 15.5+ LAB entry point. Keeps old Phase 11 app intact. */
(()=>{'use strict';
 if(window.__WA_PLUS_UNIFIED_NAV__)return;
 window.__WA_PLUS_UNIFIED_NAV__=true;
 const KEY='WA_UNIFIED_SELECT';
 const allowed=new Set(['binder','unit','gravity','chain','extended','offline']);
 let lastOpener=null;
 const $=s=>document.querySelector(s);
 function lang(){
  const code=String(document.documentElement.dataset.waLocale||document.documentElement.lang||'ko').toLowerCase().slice(0,2);
  return ['ko','en','ja'].includes(code)?code:'ko';
 }
 const copy={
  ko:{title:'✦ WAV 15.5+ LAB',hint:'내 Objekt · 유닛 · Gravity · 기존 도구',binder:'MY OBJEKT ↗',mobile:'바인더 · 유닛 · Gravity · 콘서트'},
  en:{title:'✦ WAV 15.5+ LAB',hint:'My Objekt · Units · Gravity · More tools',binder:'MY OBJEKT ↗',mobile:'Binder · Units · Gravity · Concert'},
  ja:{title:'✦ WAV 15.5+ LAB',hint:'Objekt · ユニット · Gravity · 追加ツール',binder:'MY OBJEKT ↗',mobile:'バインダー · ユニット · Gravity · コンサート'}
 };
 function labelMenu(){
  const t=copy[lang()]||copy.ko;
  const main=$('#waGroupedMenu .wa-menu-play .wa-labs-launch');
  if(main){
   const title=main.querySelector('span:not(.wa-labs-mini)');
   if(title)title.textContent=t.title;
   else main.textContent=t.title;
   const sub=main.querySelector('.wa-labs-mini');if(sub)sub.textContent='8 TOOLS ↗';
   main.setAttribute('aria-label',t.title);
   main.setAttribute('aria-haspopup','dialog');
  }
  const personal=$('#waGroupedMenu .wa-menu-personal .wa-labs-binder-link');
  if(personal)personal.textContent=t.binder;
  document.querySelectorAll('#mobileMenu [data-wa-labs-open]').forEach(b=>{
   const title=b.querySelector('strong'),sub=b.querySelector('small');
   if(title)title.textContent=b.dataset.waLabsOpen==='binder'?t.binder.replace(' ↗',''):t.title;
   if(sub)sub.textContent=t.mobile;
  });
  const play=$('#waNavChoices [data-wa-labs-open]');
  if(play){const title=play.querySelector('strong'),sub=play.querySelector('small');
   if(title)title.textContent='WAV 15.5+ LAB'; if(sub)sub.textContent=t.hint;
  }
  // Fallback for a previously altered menu: add an entry only if there is no existing Phase 11 link.
  if(!main && $('#waGroupedMenu .wa-menu-play') && !$('#waUnifiedFallbackEntry')){
   const b=document.createElement('button');b.id='waUnifiedFallbackEntry';b.type='button';
   b.className='wa-labs-launch';b.textContent=t.title;b.dataset.waUnifiedOpen='binder';
   $('#waGroupedMenu .wa-menu-play').append(b);
  }
 }
 function sendSelection(target){
  const frame=$('#waPlusOverlay iframe');
  if(!frame?.contentWindow)return;
  try{frame.contentWindow.postMessage({type:KEY,target},location.origin);}catch(e){console.warn('WAV Lab route message:',e)}
 }
 function closeMenus(){
  const menu=$('#waGroupedMenu');
  if(menu?.classList.contains('open'))$('#waGroupedClose')?.click();
  const mobile=$('#mobileMenu');
  if(mobile?.classList.contains('show'))$('#mobileMenuClose')?.click();
  if($('#waLabsDialog')?.open)window.WALabsIntegration?.close?.();
 }
 function open(target='binder',opener=null){
  target=allowed.has(target)?target:'binder';
  lastOpener=opener instanceof HTMLElement?opener:document.activeElement;
  closeMenus();
  const trigger=$('#waPlusLaunch'),overlay=$('#waPlusOverlay'),frame=overlay?.querySelector('iframe');
  if(!trigger||!overlay||!frame){
   // For installs that don't yet have 15.5+ pages, prefer a working URL to a broken dialog.
   location.assign('./wav-plus-lab/#'+encodeURIComponent(target));return;
  }
  if(!overlay.classList.contains('wa-plus-open'))trigger.click();
  const onReady=()=>sendSelection(target);
  // The LAB iframe starts as about:blank; a pending load can only be targeted after navigation.
  if(frame.getAttribute('src')?.includes('wav-plus-lab')){
    frame.addEventListener('load',onReady,{once:true});
    sendSelection(target);
  }else{
    frame.addEventListener('load',onReady,{once:true});
  }
 }
 function init(){
  if($('#waPlusLaunch')){
   document.documentElement.classList.add('wa-plus-unified-ready');
  }
  labelMenu();
  const overlay=$('#waPlusOverlay');
  if(overlay && 'MutationObserver' in window){
   new MutationObserver(()=>{
    if(!overlay.classList.contains('wa-plus-open') && lastOpener?.isConnected){
      const target=lastOpener.closest('#waGroupedMenu,#mobileMenu');
      const fallback=target?$('#waGroupedOpen,#mobileMenuOpen,.menu-toggle'):lastOpener;
      try{fallback?.focus?.({preventScroll:true})}catch(_){}
      lastOpener=null;
    }
   }).observe(overlay,{attributes:true,attributeFilter:['class']});
  }
  if('MutationObserver' in window){
   new MutationObserver(labelMenu).observe(document.documentElement,{attributes:true,attributeFilter:['lang','data-wa-locale']});
  }
 }
 // Window capture precedes Phase 11's document-capture listener, even though Phase 11 loaded first.
 window.addEventListener('click',e=>{
  const target=e.target instanceof Element?e.target.closest('[data-wa-labs-open],[data-wa-unified-open]'):null;
  if(!target)return;
  e.preventDefault();e.stopImmediatePropagation();
  open(target.dataset.waUnifiedOpen||target.dataset.waLabsOpen||'binder',target);
 },true);
 window.WAPlusUnified=Object.freeze({open,version:'15.5+-unified-v1'});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();
