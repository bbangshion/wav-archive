
/* WAV ARCHIVE 11 · DIMENSION TIMETREE
 * Reads the site's existing 16-unit DOM and window.WA_DIMENSION_MASTER.
 * Does not mutate the member array, unit cards, lineage source data or DNA renderers.
 */
(()=>{
 'use strict';
 const root=document.getElementById('waDimensionTimeTree');
 if(!root || root.dataset.initialized==='1') return;
 const viewport=root.querySelector('#waTTViewport');
 const stage=root.querySelector('#waTTStage');
 const axis=root.querySelector('#waTTAxis');
 const svg=root.querySelector('#waTTLinks');
 const nodesLayer=root.querySelector('#waTTNodes');
 const popup=root.querySelector('#waTTPopup');
 const closeButton=root.querySelector('#waTTPopupClose');
 const detailButton=root.querySelector('#waTTPopupDetail');
 const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
 const layout={
   'AAA':{x:90,y:175},
   '+(KR)ystal Eyes':{x:370,y:112},
   'ACID EYES':{x:660,y:265},
   'LOVElution':{x:370,y:430},
   'EVOLution':{x:370,y:570},
   'NXT':{x:370,y:710},
   'Aria':{x:910,y:135},
   'Glow':{x:910,y:285},
   'Visionary Vision':{x:910,y:435},
   '∞!':{x:910,y:585},
   'Alphie':{x:1280,y:145},
   'MSNZ':{x:1280,y:435},
   'moon':{x:1600,y:230},
   'sun':{x:1600,y:375},
   'neptune':{x:1600,y:520},
   'zenith':{x:1600,y:665}
 };
 const links=[
   ['AAA','ACID EYES','fusion'],
   ['+(KR)ystal Eyes','ACID EYES','fusion'],
   ['MSNZ','moon','msnz'],
   ['MSNZ','sun','msnz'],
   ['MSNZ','neptune','msnz'],
   ['MSNZ','zenith','msnz']
 ];
 const years=[
   {year:'2022',x:77,sub:'ATOM · BEGINNING'},
   {year:'2023',x:355,sub:'BINARY · CONNECTION'},
   {year:'2024',x:895,sub:'DIMENSION EXPANSION'},
   {year:'2025',x:1265,sub:'msnz · PROJECTS'}
 ];
 const colors={'AAA':'#e7a4da','+(KR)ystal Eyes':'#ffd7de','ACID EYES':'#fa9acb','LOVElution':'#bc9bff','EVOLution':'#b0b3ff','NXT':'#8bdce6','Aria':'#f7b5dd','Glow':'#aeeace','Visionary Vision':'#99c7ff','∞!':'#e7c2ff','Alphie':'#ebbdff','MSNZ':'#83e5e9','moon':'#c9a7ff','sun':'#ffc78f','neptune':'#9be4e6','zenith':'#ffb6e4'};
 const englishNotes={
  'AAA':'Four-member Dimension formed through the first Grand Gravity.',
  '+(KR)ystal Eyes':'Four-member Dimension formed with the S01–S08 members not selected for AAA.',
  'ACID EYES':'Collaboration between AAA and +(KR)ystal Eyes; not a separate Gravity.',
  'LOVElution':'Eight-member Dimension assembled by the 2023 Grand Gravity.',
  'EVOLution':'Eight-member Dimension from the same season as LOVElution.',
  'NXT':'S17–S20 reveal unit; not assembled through Gravity.',
  'Aria':'The first ballad Dimension formed through Gravity.',
  'Glow':'S21–S24 reveal unit; not assembled through Gravity.',
  'Visionary Vision':'Twelve-member performance Dimension.',
  '∞!':'Japanese Dimension featuring eight members.',
  'Alphie':'Eight-member touring Dimension for Alpha Percent.',
  'moon':'Six-member msnz Moon Dimension.',
  'sun':'Six-member msnz Sun Dimension.',
  'neptune':'Six-member msnz Neptune Dimension.',
  'zenith':'Six-member msnz Zenith Dimension.',
  'MSNZ':'Twenty-four-member umbrella project linking moon, sun, neptune and zenith.'
 };
 const cardMap=new Map();
 const domCards=[...document.querySelectorAll('#units .units .unit-card')];
 domCards.forEach(card=>{
   const name=(card.querySelector('h3')?.textContent||'').trim();
   if(name && layout[name])cardMap.set(name,card);
 });
 let details=window.WA_DIMENSION_MASTER;
 if(!details || Object.keys(layout).some(name=>!details[name])){
   nodesLayer.textContent='디멘션 데이터를 아직 불러오지 못했습니다. 페이지를 다시 열어주세요.';
   return;
 }
 const nameSet=new Set([...cardMap.keys()].filter(name=>details[name]));
 if(nameSet.size!==16){
   nodesLayer.textContent='디멘션 카드 16개를 확인하지 못했습니다. 기존 데이터를 확인해 주세요.';
   return;
 }
 root.dataset.initialized='1';
 const isEnglish=()=>document.documentElement.lang==='en'||document.documentElement.dataset.language==='en';
 let selected=null;
 let activeNode=null;
 const nodeButtons=new Map();
 const linkElements=[];
 const ns='http://www.w3.org/2000/svg';
 function make(tag,className,text){
   const el=document.createElement(tag);
   if(className)el.className=className;
   if(text!==undefined)el.textContent=text;
   return el;
 }
 function setLocale(){
   const en=isEnglish();
   root.querySelector('#waTTIntro').textContent=en?'Explore the Dimension timeline from 2022 to msnz. Drag to navigate; tap any node for details.':'2022년부터 msnz까지 · 드래그해서 흐름을 탐색하고 노드를 선택해 보세요.';
   root.querySelector('#waTTHint').textContent=en?'Desktop: drag / wheel · Mobile: swipe · Select a node for details':'PC: 드래그 / 휠 · 모바일: 손가락 스와이프 · 노드 선택: 상세 정보';
   root.querySelector('#waTTReset').setAttribute('aria-label',en?'Go to the first year':'첫 연도로 이동');
   viewport.setAttribute('aria-label',en?'Scrollable Dimension timeline map':'좌우 위아래로 이동할 수 있는 디멘션 계보 지도');
   closeButton.setAttribute('aria-label',en?'Close':'닫기');
   root.querySelector('#waTTPopupKicker').textContent='DIMENSION RECORD';
   root.querySelector('#waTTPopupMembersLabel').textContent=en?'MEMBERS':'참여 멤버';
   detailButton.textContent=en?'OPEN FULL DIMENSION DETAILS ↗':'전체 디멘션 정보 보기 ↗';
   root.querySelectorAll('[data-tt-year]').forEach(b=>b.setAttribute('aria-label',(en?'Jump to ':'연도로 이동: ')+b.dataset.ttYear));
   if(selected)fillPopup(selected);
 }
 function buildAxis(){
   years.forEach(({year,x,sub})=>{
     const mark=make('div','wa-tt-year');
     mark.style.left=x+'px';
     mark.append(make('strong','',year),make('small','',sub));
     axis.append(mark);
   });
 }
 function buildNodes(){
   for(const [name,card] of cardMap){
     const d=details[name],xy=layout[name];
     const button=make('button','wa-tt-node');
     button.type='button';
     button.dataset.ttNode=name;
     button.setAttribute('aria-label',name+' · '+d.members.length+' members');
     button.setAttribute('aria-pressed','false');
     button.style.left=xy.x+'px';
     button.style.top=xy.y+'px';
     button.style.setProperty('--tt-accent',colors[name]||'#b9a8ff');
     const meta=make('span','wa-tt-node-year',String(d.date).slice(0,10));
     const title=make('strong','wa-tt-node-name',name);
     const foot=make('div','wa-tt-node-foot');
     const release=make('span','',d.release||card.querySelector('p')?.textContent||'');
     const count=make('b','',String(d.members.length)+' S');
     foot.append(release,count);
     button.append(meta,title,foot);
     button.addEventListener('click',()=>select(name,button));
     nodesLayer.append(button);
     nodeButtons.set(name,button);
   }
 }
 function bezier(source,target){
   const a=layout[source],b=layout[target];
   const x1=a.x+224,y1=a.y+53,x2=b.x,y2=b.y+53;
   const distance=Math.max(28,(x2-x1)*.48);
   return 'M '+x1+' '+y1+' C '+(x1+distance)+' '+y1+', '+(x2-distance)+' '+y2+', '+x2+' '+y2;
 }
 function buildLinks(){
   links.forEach(([from,to,kind])=>{
     if(!nameSet.has(from)||!nameSet.has(to))return;
     const path=document.createElementNS(ns,'path');
     path.setAttribute('d',bezier(from,to));
     path.setAttribute('class','wa-tt-line'+(kind==='msnz'?' wa-tt-msnz-line':''));
     path.dataset.ttFrom=from;
     path.dataset.ttTo=to;
     svg.append(path);
     linkElements.push(path);
   });
 }
 function highlight(name){
   for(const [key,node] of nodeButtons){
     const related=links.some(([a,b])=>(a===name&&b===key)||(b===name&&a===key));
     node.classList.toggle('is-muted',Boolean(name)&&key!==name&&!related);
     node.classList.toggle('is-selected',key===name);
     node.setAttribute('aria-pressed',String(key===name));
   }
   for(const path of linkElements){
     const connected=path.dataset.ttFrom===name||path.dataset.ttTo===name;
     path.classList.toggle('is-lit',Boolean(name)&&connected);
     path.classList.toggle('is-dimmed',Boolean(name)&&!connected);
   }
 }
 function fillPopup(name){
   const d=details[name];if(!d)return;
   const en=isEnglish();
   root.querySelector('#waTTPopupTitle').textContent=name;
   root.querySelector('#waTTPopupNote').textContent=en?(englishNotes[name]||d.note):d.note;
   const facts=root.querySelector('#waTTPopupFacts');
   facts.replaceChildren();
   [
    [en?'START':'시작 날짜',d.date],
    [en?'RELEASE':'대표 활동',d.release],
    [en?'STATUS':'구분',d.status],
    [en?'LEADER':'리더',d.leader]
   ].forEach(([label,value])=>{
     const box=make('div','wa-tt-pop-fact');
     box.append(make('small','',label),make('strong','',value||'—'));
     facts.append(box);
   });
   const memberArea=root.querySelector('#waTTPopupMembers');
   memberArea.replaceChildren();
   (d.members||[]).forEach(id=>memberArea.append(make('span','',id)));
   detailButton.dataset.ttDetail=name;
 }
 function select(name,button){
   if(!nameSet.has(name))return;
   if(selected===name&&!popup.hidden){closePopup();return;}
   selected=name;
   activeNode=button;
   highlight(name);
   fillPopup(name);
   popup.hidden=false;
   closeButton.focus({preventScroll:true});
 }
 function closePopup(){
   const wasOpen=!popup.hidden;
   popup.hidden=true;
   selected=null;
   highlight(null);
   if(wasOpen&&activeNode?.isConnected)activeNode.focus({preventScroll:true});
 }
 function openOriginalDetail(){
   const name=detailButton.dataset.ttDetail;
   const card=cardMap.get(name);
   if(!card)return;
   closePopup();
   // Trigger original unit detail on the existing card; never duplicate or replace its data.
   const trigger=card.querySelector(':scope > a[href]')||card.querySelector('.wa-dim-open');
   if(trigger){trigger.click();return;}
   card.scrollIntoView({behavior:reduceMotion.matches?'auto':'smooth',block:'center'});
 }
 function jumpYear(year){
   const x=(years.find(y=>y.year===year)||years[0]).x;
   stopKinetics();
   viewport.scrollTo({left:Math.max(0,x-35),top:0,behavior:reduceMotion.matches?'auto':'smooth'});
   root.querySelectorAll('[data-tt-year]').forEach(b=>b.classList.toggle('is-active',b.dataset.ttYear===year));
 }
 let frame=0,vx=0,vy=0;
 const stopKinetics=()=>{if(frame)cancelAnimationFrame(frame);frame=0;vx=0;vy=0;};
 function animateScroll(){
   frame=0;
   if(document.hidden || !viewport.isConnected || reduceMotion.matches){vx=0;vy=0;return;}
   const beforeX=viewport.scrollLeft,beforeY=viewport.scrollTop;
   viewport.scrollLeft+=vx;
   viewport.scrollTop+=vy;
   vx*=.86;vy*=.86;
   if((viewport.scrollLeft===beforeX && Math.abs(vx)>0.1))vx=0;
   if((viewport.scrollTop===beforeY && Math.abs(vy)>0.1))vy=0;
   if(Math.abs(vx)+Math.abs(vy)>.45)frame=requestAnimationFrame(animateScroll);
 }
 function addMomentum(dx,dy){
   vx=Math.max(-34,Math.min(34,vx+dx));
   vy=Math.max(-34,Math.min(34,vy+dy));
   if(!frame)frame=requestAnimationFrame(animateScroll);
 }
 let drag=null,dragFrame=0,queuedDX=0,queuedDY=0;
 function flushDrag(){
   if(dragFrame){cancelAnimationFrame(dragFrame);dragFrame=0;}
   if(!drag){queuedDX=queuedDY=0;return;}
   // Native scroll moves in at most one pair of writes per display frame.
   viewport.scrollLeft-=queuedDX;
   viewport.scrollTop-=queuedDY;
   queuedDX=queuedDY=0;
 }
 viewport.addEventListener('pointerdown',e=>{
   if(e.pointerType==='touch'||e.button!==0||e.target.closest('button,a,input'))return;
   stopKinetics();
   drag={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now(),vx:0,vy:0};
   queuedDX=queuedDY=0;
   viewport.setPointerCapture(e.pointerId);
   viewport.classList.add('is-dragging');
 });
 viewport.addEventListener('pointermove',e=>{
   if(!drag||drag.id!==e.pointerId)return;
   const now=performance.now(),elapsed=Math.max(10,now-drag.t);
   const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
   queuedDX+=dx;queuedDY+=dy;
   if(!dragFrame)dragFrame=requestAnimationFrame(flushDrag);
   drag.vx=-dx*16/elapsed;
   drag.vy=-dy*16/elapsed;
   drag.x=e.clientX;drag.y=e.clientY;drag.t=now;
 });
 function finishDrag(e){
   if(!drag||drag.id!==e.pointerId)return;
   flushDrag();
   const copy=drag;drag=null;
   viewport.classList.remove('is-dragging');
   if(viewport.hasPointerCapture(e.pointerId))viewport.releasePointerCapture(e.pointerId);
   if(!reduceMotion.matches)addMomentum(copy.vx,copy.vy);
 }
 viewport.addEventListener('pointerup',finishDrag);
 viewport.addEventListener('pointercancel',finishDrag);
 viewport.addEventListener('lostpointercapture',()=>{flushDrag();drag=null;viewport.classList.remove('is-dragging');});
 viewport.addEventListener('wheel',e=>{
   if(e.ctrlKey)return; // browser zoom remains available
   const dx=e.shiftKey?e.deltaY:e.deltaX;
   const dy=e.shiftKey?0:e.deltaY;
   const maxX=viewport.scrollWidth-viewport.clientWidth;
   const maxY=viewport.scrollHeight-viewport.clientHeight;
   const canX=dx!==0&&((dx>0&&viewport.scrollLeft<maxX-1)||(dx<0&&viewport.scrollLeft>1));
   const canY=dy!==0&&((dy>0&&viewport.scrollTop<maxY-1)||(dy<0&&viewport.scrollTop>1));
   if(!canX&&!canY)return; // allow outer page to scroll at boundaries
   e.preventDefault();
   if(reduceMotion.matches){viewport.scrollLeft+=dx;viewport.scrollTop+=dy;return;}
   const scale=e.deltaMode===1?18:e.deltaMode===2?viewport.clientHeight:1;
   addMomentum((canX?dx:0)*scale*.14,(canY?dy:0)*scale*.14);
 },{passive:false});
 closeButton.addEventListener('click',closePopup);
 detailButton.addEventListener('click',openOriginalDetail);
 root.querySelectorAll('[data-tt-year]').forEach(b=>b.addEventListener('click',()=>jumpYear(b.dataset.ttYear)));
 root.querySelector('#waTTReset').addEventListener('click',()=>{closePopup();jumpYear('2022');});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!popup.hidden)closePopup();});
 viewport.addEventListener('keydown',e=>{
   if(e.target!==viewport)return;
   const movement={ArrowLeft:[-80,0],ArrowRight:[80,0],ArrowUp:[0,-75],ArrowDown:[0,75]}[e.key];
   if(!movement)return;
   e.preventDefault();
   viewport.scrollBy({left:movement[0],top:movement[1],behavior:reduceMotion.matches?'auto':'smooth'});
 });
 document.addEventListener('wa:language',setLocale);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopKinetics();});
 window.addEventListener('pagehide',stopKinetics,{passive:true});
 buildAxis();
 buildNodes();
 buildLinks();
 setLocale();
})();

