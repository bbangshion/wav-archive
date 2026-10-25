/* WAV 15.5+ LAB: Phase 11 lives as a lazily loaded tool panel. */
(()=>{'use strict';
 if(window.__WA_LAB_UNIFIED_TOOLS__)return;
 window.__WA_LAB_UNIFIED_TOOLS__=true;
 const keys=new Set(['binder','gravity','unit','offline']);
 const tabs=new Set(['binder','unit','gravity','chain','extended']);
 const $=s=>document.querySelector(s);
 const box=$('#waLegacyFrame');
 if(!box)return;
 let current='binder';
 const text={
  ko:{label:'기존 WAV LABS 도구',subtitle:'기존 바인더·Gravity·유닛·콘서트 모드를 여기서 계속 사용할 수 있어.',binder:'기존 Objekt Binder',gravity:'Gravity LAB',unit:'기존 Unit Studio',offline:'콘서트 · 오프라인',note:'기존 저장 내역은 그대로 남아 있어. 두 바인더의 저장 공간은 현재 별도야.',status:'도구를 열었어.'},
  en:{label:'More WAV tools',subtitle:'Open the original Binder, Gravity, Unit Studio, and Concert tools here.',binder:'Original Objekt Binder',gravity:'Gravity LAB',unit:'Original Unit Studio',offline:'Concert · Offline',note:'Your original saved data stays put. The two binders currently store data separately.',status:'Tool opened.'},
  ja:{label:'以前のWAV LABSツール',subtitle:'元のバインダー・Gravity・ユニット・コンサート機能をここから使えます。',binder:'元のObjekt Binder',gravity:'Gravity LAB',unit:'元のUnit Studio',offline:'コンサート・オフライン',note:'以前の保存データはそのままです。2つのバインダーの保存先は別々です。',status:'ツールを開きました。'}
 };
 const language=()=>{const val=document.documentElement.lang.slice(0,2);return text[val]?val:'ko'};
 function localize(){
  const dict=text[language()];
  for(const [id,key] of [['waUnifiedTitle','label'],['waUnifiedSubtitle','subtitle'],['waUnifiedNote','note']]){
   const el=$('#'+id);if(el)el.textContent=dict[key];
  }
  document.querySelectorAll('[data-wa-legacy]').forEach(b=>b.textContent=dict[b.dataset.waLegacy]);
  const tab=$('.tabs [data-tab="extended"]');
  if(tab)tab.textContent=language()==='ja'?'追加ツール':language()==='en'?'MORE TOOLS':'추가 도구';
 }
 function unload(){if(box.getAttribute('src')!=='about:blank')box.src='about:blank';}
 function showLegacy(target='binder'){
  target=keys.has(target)?target:'binder';current=target;
  document.querySelectorAll('[data-wa-legacy]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.waLegacy===target)));
  const wanted='../wav-labs/#'+target;
  if(box.getAttribute('src')!==wanted)box.src=wanted;
 }
 function select(tab='binder',legacy){
  const requested=tab==='offline'?'extended':tab;
  tab=tabs.has(requested)?requested:'binder';
  // Set state directly to support a deep link before the original app.mjs initializes.
  document.querySelectorAll('.tabs button[data-tab]').forEach(b=>{
   const on=b.dataset.tab===tab;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));
  });
  document.querySelectorAll('main > section.pane').forEach(section=>section.hidden=section.id!==tab);
  if(tab==='extended')showLegacy(legacy||((arguments[0]==='offline')?'offline':current));else unload();
  if(location.hash!=='#'+tab && window.history?.replaceState){
   try{history.replaceState(null,'','#'+tab)}catch(_){}
  }
 }
 document.querySelectorAll('.tabs button[data-tab]').forEach(b=>b.addEventListener('click',()=>{
  if(b.dataset.tab==='extended')showLegacy(current);else unload();
 }));
 document.querySelectorAll('[data-wa-legacy]').forEach(b=>b.addEventListener('click',()=>showLegacy(b.dataset.waLegacy)));
 document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>queueMicrotask(localize)));
 window.addEventListener('message',e=>{
  if(e.origin!==location.origin)return;
  if(e.source===window.parent && e.data?.type==='WA_UNIFIED_SELECT'){
   const target=e.data?.target;
   if(target==='offline')select('extended','offline');
   else if(keys.has(target) || target==='chain' || target==='extended')select(target);
  }
  if(e.source===box.contentWindow && e.data?.type==='WA_LABS_CLOSE')select('binder');
 });
 // Direct link to the unified LAB supports #binder, #unit, #gravity, #chain, #offline.
 const initial=decodeURIComponent(location.hash.slice(1));
 if(initial && (keys.has(initial)||tabs.has(initial)))select(initial);
 localize();
})();
