/* WAV ARCHIVE · 5.8 Menu polish / Official Calendar entry.
   A presentation-only patch. Does not change any existing click handlers or archive data. */
(()=>{'use strict';
 if(window.WAVMenu58)return;
 const targets=['#waGroupedMenu','#mobileMenu'];
 const ORNAMENT=/^[\s\u00a0]*[✦✧✨❖◆◇✥✣✷✺✹◈]\s*/u;
 const RELEASE=/\b(?:15\.5\+|17\.0|16\.0)(?=\s|$|[·/|])/gi;
 function cleanText(value){
   if(!value || !value.trim())return value;
   if(!ORNAMENT.test(value) && !RELEASE.test(value))return value;
   RELEASE.lastIndex=0;
   let out=value.replace(ORNAMENT,'');
   // Remove version strings from MENU items, preserving names and informational numbers.
   out=out.replace(RELEASE,'');
   out=out.replace(/\s{2,}/g,' ').trim();
   return out || value;
 }
 function normalize(root){
   // Only modify visible menu text, never class names, IDs, hrefs or SVG paths.
   const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{
     acceptNode(node){return node.parentElement?.closest('script,style,svg')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}
   });
   const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
   nodes.forEach(n=>{
     const cleaned=cleanText(n.nodeValue);
     if(n.nodeValue.trim() && cleaned!==n.nodeValue)n.nodeValue=cleaned;
   });
   // Remove menu-only numeric version badges (e.g. CONNECTED UNIVERSE 17.0).
   for(const el of root.querySelectorAll('span,small,b,em')){
     if(el.children.length)continue;
     if(/^\s*(?:v\s*)?(?:15\.5\+|17\.0|16\.0)\s*$/i.test(el.textContent||''))el.hidden=true;
   }
 }
 function addCalendar(root){
   if(root.querySelector('.wa58-calendar-link'))return;
   if(root.id==='waGroupedMenu'){
     const groups=[...root.querySelectorAll('.wa-menu-group')];
     const explore=groups.find(g=>/EXPLORE|탐색/i.test(g.querySelector('.wa-menu-label')?.textContent||''));
     if(!explore)return;
     const link=document.createElement('a');link.className='wa58-calendar-link';link.href='#wa-auto-hub';
     link.dataset.wa58Calendar='true';link.textContent='CALENDAR';
     const ref=[...explore.children].find(e=>e.matches('a[href="#timeline"],a[href="#xTimeMachine"]'));
     if(ref)ref.after(link);else explore.append(link);
   }else if(root.id==='mobileMenu'){
     const groups=[...root.querySelectorAll('.wa12-menu-group')];
     const archive=groups.find(g=>/ARCHIVE|EXPLORE|탐색/i.test(g.querySelector('h3')?.textContent||''));
     const list=archive?.querySelector('.wa12-menu-links');if(!list)return;
     const link=document.createElement('a');link.className='wa12-menu-link wa58-calendar-link';link.href='#wa-auto-hub';
     link.dataset.wa58Calendar='true';
     const label=document.createElement('span');const title=document.createElement('strong');title.textContent='공식 캘린더';
     const detail=document.createElement('small');detail.textContent='CALENDAR';label.append(title,detail);
     const arr=document.createElement('i');arr.setAttribute('aria-hidden','true');arr.textContent='↗';link.append(label,arr);list.append(link);
   }
 }
 let queued=false;
 function refresh(){queued=false;for(const sel of targets){const root=document.querySelector(sel);if(!root)continue;normalize(root);addCalendar(root);}}
 function request(){if(queued)return;queued=true;queueMicrotask(refresh);}
 function init(){refresh();
   const obs=new MutationObserver(changes=>{
     if(changes.some(c=>c.type==='childList'))request();
   });
   for(const sel of targets){const el=document.querySelector(sel);if(el)obs.observe(el,{childList:true,subtree:true});}
   // Legacy scripts can insert menu buttons after the initial load.
   document.addEventListener('click',ev=>{
     if(!(ev.target instanceof Element))return;
     if(ev.target.closest('#waGroupedMenuOpen,#mobileMenuBtn,#menuBtn,[data-wa-menu-open]'))request();
     const calendar=ev.target.closest('.wa58-calendar-link');
     if(!calendar)return;
     // Keep existing menu close / navigation logic; no preventDefault.
     // Fallback when 5.7 Focused Navigation has not initialized.
     if(window.WAVFocus57?.open)window.WAVFocus57.open('schedule');
   },true);
   window.WAVMenu58=Object.freeze({refresh});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
