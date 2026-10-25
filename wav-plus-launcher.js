/* Independent entry point — no legacy data renderers or listeners are overwritten. */
(()=>{'use strict';
if(window.__WA_PLUS_FEATURES_LAUNCHER__)return;
window.__WA_PLUS_FEATURES_LAUNCHER__=true;
let trigger=null,overlay=null,frame=null,closeButton=null,previousOverflow='';
function create(){
 if(document.getElementById('waPlusLaunch'))return;
 trigger=document.createElement('button');trigger.id='waPlusLaunch';trigger.type='button';
 trigger.innerHTML='✦ <b>WAV</b> 15.5+ LAB';trigger.setAttribute('aria-haspopup','dialog');
 trigger.setAttribute('aria-controls','waPlusOverlay');trigger.setAttribute('aria-expanded','false');
 overlay=document.createElement('div');overlay.id='waPlusOverlay';overlay.setAttribute('role','dialog');
 overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','WAV ARCHIVE 15.5+ 개인 연구실');
 overlay.setAttribute('aria-hidden','true');
 frame=document.createElement('iframe');frame.title='WAV 15.5+ LAB';frame.src='about:blank';
 frame.setAttribute('referrerpolicy','same-origin');
 closeButton=document.createElement('button');closeButton.id='waPlusExit';closeButton.type='button';
 closeButton.textContent='×';closeButton.setAttribute('aria-label','연구실 닫기');
 overlay.append(frame,closeButton);document.body.append(trigger,overlay);
 trigger.addEventListener('click',open);closeButton.addEventListener('click',close);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay?.classList.contains('wa-plus-open'))close()});
 window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame?.contentWindow)return;
   if(e.data?.type==='WA_PLUS_CLOSE')close();});
 window.addEventListener('pagehide',()=>{if(overlay?.classList.contains('wa-plus-open'))close()},{passive:true});
}
function open(){
 if(!overlay||overlay.classList.contains('wa-plus-open'))return;
 previousOverflow=document.documentElement.style.overflow;
 document.documentElement.style.overflow='hidden';
 overlay.classList.add('wa-plus-open');overlay.setAttribute('aria-hidden','false');
 trigger.setAttribute('aria-expanded','true');
 frame.src='./wav-plus-lab/index.html';closeButton.focus({preventScroll:true});
}
function close(){
 if(!overlay?.classList.contains('wa-plus-open'))return;
 overlay.classList.remove('wa-plus-open');overlay.setAttribute('aria-hidden','true');
 document.documentElement.style.overflow=previousOverflow;
 trigger?.setAttribute('aria-expanded','false');trigger?.focus({preventScroll:true});
 frame.src='about:blank';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',create,{once:true});
else create();
})();
