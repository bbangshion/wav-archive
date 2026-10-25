/* WAV 15.5+ LAB — compact menu v2: MY OBJEKT / GRAVITY / ONCHAIN / CONCERT */
(()=>{'use strict';
 if(window.__WA_LAB_COMPACT_V2__)return;
 window.__WA_LAB_COMPACT_V2__=true;
 const $=selector=>document.querySelector(selector);
 const frame=$('#waLegacyFrame');
 if(!frame)return;
 const valid=new Set(['binder','gravity','chain','extended']);
 const labels={
   ko:{title:'콘서트 · 오프라인',description:'공연 준비와 현장 기록을 한곳에서.',tab:'콘서트 · 오프라인',note:'기존 콘서트·오프라인 도구를 그대로 이용할 수 있어.'},
   en:{title:'Concert · Offline',description:'Plan your concert day and keep your memories together.',tab:'CONCERT',note:'Your original concert and offline tools are still here.'},
   ja:{title:'コンサート・オフライン',description:'公演の準備や思い出をここでまとめよう。',tab:'コンサート',note:'以前のコンサート機能を引き続き利用できます。'}
 };
 const locale=()=>{const l=document.documentElement.lang.slice(0,2);return labels[l]?l:'ko'};
 const updateText=()=>{
   const copy=labels[locale()];
   [['waUnifiedTitle','title'],['waUnifiedSubtitle','description'],['waUnifiedNote','note']].forEach(([id,k])=>{
     const el=document.getElementById(id);if(el)el.textContent=copy[k];
   });
   const tab=$('.tabs [data-tab="extended"]');if(tab)tab.textContent=copy.tab;
 };
 function unload(){if(frame.getAttribute('src')!=='about:blank')frame.src='about:blank';}
 function loadOffline(){
   const url='../wav-labs/#offline';
   if(frame.getAttribute('src')!==url)frame.src=url;
 }
 function select(tab='binder'){
   tab=(tab==='offline'||tab==='extended')?'extended':tab;
   if(!valid.has(tab))tab='binder';
   document.querySelectorAll('.tabs button[data-tab]').forEach(b=>{
     const on=b.dataset.tab===tab;
     b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));
   });
   document.querySelectorAll('main > section.pane').forEach(sec=>sec.hidden=sec.id!==tab);
   if(tab==='extended')loadOffline();else unload();
   const hash=tab==='extended'?'#offline':'#'+tab;
   if(location.hash!==hash){try{history.replaceState(null,'',hash)}catch(_){}}
 }
 document.querySelectorAll('.tabs button[data-tab]').forEach(b=>b.addEventListener('click',()=>{
   if(b.dataset.tab==='extended'){
     loadOffline();try{history.replaceState(null,'','#offline')}catch(_){}}
   else unload();
 }));
 document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>queueMicrotask(updateText)));
 window.addEventListener('message',e=>{
   if(e.origin!==location.origin)return;
   if(e.source===window.parent&&e.data?.type==='WA_UNIFIED_SELECT'){
     const target=e.data.target;
     select(target==='offline'||target==='extended'?'extended':(valid.has(target)?target:'binder'));
   }
   if(e.source===frame.contentWindow&&e.data?.type==='WA_LABS_CLOSE')select('binder');
 });
 window.addEventListener('pagehide',unload,{passive:true});
 const initial=decodeURIComponent(location.hash.slice(1));
 if(initial)select(initial);
 updateText();
})();
