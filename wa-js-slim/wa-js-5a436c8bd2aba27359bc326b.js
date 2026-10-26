
(function(){'use strict';const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];const esc=s=>String(s||'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c));
function data(){try{return JSON.parse(localStorage.getItem('wa_mywav_v1')||'{}')}catch(e){return {}}}function cards(){return $$('#members [data-member],.member-card[data-member]')}function member(id){const c=cards().find(x=>x.dataset.member===id);if(!c)return {id,name:id,units:[]};const txt=c.innerText||'';const name=(txt.match(/(?:S\d{1,2})\s*[·\-]?\s*([^\n·]+)/)||[])[1]||id;const units=[...new Set((c.dataset.unit||c.dataset.units||'').split(/[|,]/).map(x=>x.trim()).filter(Boolean))];return {id,name:name.trim(),units}}
const WA_ID_NAMES={S01:'윤서연',S02:'정혜린',S03:'이지우',S04:'김채연',S05:'김유연',S06:'김수민',S07:'김나경',S08:'공유빈',S09:'카에데',S10:'서다현',S11:'코토네',S12:'곽연지',S13:'니엔',S14:'박소현',S15:'신위',S16:'마유',S17:'린',S18:'주빈',S19:'정하연',S20:'박시온',S21:'김채원',S22:'설린',S23:'서아',S24:'지연'};
let waIdSelected=[];
function savedId(){try{return JSON.parse(localStorage.getItem('wa_wav_id_members')||'[]').filter(x=>WA_ID_NAMES[x]).slice(0,3)}catch(e){return []}}
function drawPicker(){const g=$('#waIdGrid');if(!g)return;g.innerHTML=Object.entries(WA_ID_NAMES).map(([id,name])=>`<button class="wa-id-s${waIdSelected.includes(id)?' selected':''}" type="button" data-wa-id="${id}" aria-pressed="${waIdSelected.includes(id)}"><strong>${id}</strong><small>${name}</small></button>`).join('');$('#waIdCount').textContent=`${waIdSelected.length} / 3`;$('#waIdCreate').disabled=!waIdSelected.length}
function renderId(){const ids=waIdSelected.slice(),ms=ids.map(id=>{const m=member(id);return {...m,name:WA_ID_NAMES[id]||m.name}});const units=[...new Set(ms.flatMap(m=>m.units))];const root=$('#waIdResult');const nums=ids.map(x=>x.replace('S',''));const mode=ids.length===1?'SOLO DNA':ids.length===2?'DUAL LINK':'TRINITY DNA';const seed=ids.reduce((a,x)=>a+Number(x.slice(1))*37,113);const code='W'+nums.join('-')+'-'+String((seed*97)%10000).padStart(4,'0');const pts=ids.map((x,i)=>{const n=Number(x.slice(1));return {x:18+((n*29+i*31)%65),y:18+((n*17+i*23)%62)}});const extras=Array.from({length:5},(_,i)=>({x:10+((seed+i*31)%80),y:12+((seed*3+i*19)%76)}));const all=pts.concat(extras);const lines=all.slice(1).map((p,i)=>`<line x1="${all[i].x}" y1="${all[i].y}" x2="${p.x}" y2="${p.y}"/>`).join('');const dots=all.map((p,i)=>`<circle cx="${p.x}" cy="${p.y}" r="${i<pts.length?1.8:0.8}" class="${i<pts.length?'core':''}"/>`).join('');root.innerHTML=`<div class="wa-id-pass" id="waIdPass"><div class="wa-id-holo"></div><svg class="wa-id-stars" viewBox="0 0 100 100" aria-hidden="true"><g>${lines}${dots}</g></svg><div class="wa-id-watermark">${esc(nums.join('·'))}</div><div class="wa-id-pass-top"><span>WAV ARCHIVE</span><span>${esc(mode)}</span></div><div class="wa-id-pass-core"><div class="wa-id-pass-label">WAV // ${esc(nums.join('·'))}</div><div class="wa-id-pass-names">${esc(ms.map(m=>m.name).join(' × '))}</div><div class="wa-id-signature">DNA SIGNATURE ${esc(nums.join('—'))}</div></div><div class="wa-id-unitline">${esc((units.slice(0,5).join(' · ')||'PERSONAL ARCHIVE'))}</div><div class="wa-id-pass-bottom"><span>ARCHIVE ID ${esc(code)}</span><span>@bbangshion</span></div><div class="wa-id-scan"></div></div>`;bindPassTilt()}
function bindPassTilt(){
 const card=$('#waIdPass');if(!card)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
 let raf=0,previous=0,rect=null,rectAt=0,rectScrollY=0,gesture=null;
 const state={x:0,y:0,hx:0,hy:0,tx:0,ty:0,thx:0,thy:0};
 function measure(now){
  if(!rect||now-rectAt>150||scrollY!==rectScrollY){
   rect=card.getBoundingClientRect();rectAt=now;rectScrollY=scrollY;
  }
  return rect;
 }
 function schedule(){if(!raf&&!document.hidden&&!reduced.matches)raf=requestAnimationFrame(frame);}
 function frame(now){
  raf=0;
  if(!card.isConnected||document.hidden||reduced.matches)return;
  const dt=previous?clamp(now-previous,1,50):16.667;
  previous=now;
  const a=1-Math.pow(.9,dt/16.667);
  state.x+=(state.tx-state.x)*a;
  state.y+=(state.ty-state.y)*a;
  state.hx+=(state.thx-state.hx)*a;
  state.hy+=(state.thy-state.hy)*a;
  card.style.setProperty('--rx',state.x.toFixed(3)+'deg');
  card.style.setProperty('--ry',state.y.toFixed(3)+'deg');
  // The ID hologram is shifted as an already-rasterized GPU layer.
  card.style.setProperty('--wa12-holo-x',state.hx.toFixed(2)+'px');
  card.style.setProperty('--wa12-holo-y',state.hy.toFixed(2)+'px');
  if(Math.abs(state.tx-state.x)>.015||Math.abs(state.ty-state.y)>.015||
     Math.abs(state.thx-state.hx)>.08||Math.abs(state.thy-state.hy)>.08)schedule();
  else {previous=0;if(!gesture&&Math.abs(state.tx)+Math.abs(state.ty)<.01)card.classList.remove('wa12-id-active');}
 }
 function move(e){
  if(reduced.matches||document.hidden)return;
  // Badge pins retain their own independent pointer-capture/drag handler.
  if(e.target.closest?.('.wa125-badge-pin'))return;
  if(e.pointerType==='touch'&&gesture){
   if(gesture.scroll||Math.abs(e.clientY-gesture.y)>14){gesture.scroll=true;reset();return;}
  }
  const r=measure(performance.now());if(!r.width||!r.height)return;
  const x=clamp((e.clientX-r.left)/r.width-.5,-.5,.5);
  const y=clamp((e.clientY-r.top)/r.height-.5,-.5,.5);
  state.tx=-y*7;state.ty=x*9;
  state.thx=x*16;state.thy=y*12;
  card.classList.add('wa12-id-active');schedule();
 }
 function reset(){state.tx=0;state.ty=0;state.thx=0;state.thy=0;schedule();}
 card.addEventListener('pointerdown',e=>{if(e.target.closest?.('.wa125-badge-pin'))return;rect=null;if(e.pointerType==='touch')gesture={id:e.pointerId,y:e.clientY,scroll:false};},{passive:true});
 card.addEventListener('pointermove',move,{passive:true});
 card.addEventListener('pointerleave',reset,{passive:true});
 const finish=e=>{if(gesture&&e.pointerId===gesture.id)gesture=null;reset();};
 card.addEventListener('pointerup',finish,{passive:true});
 card.addEventListener('pointercancel',finish,{passive:true});
 // Deliberately no document-level listener per card: regenerating an ID must
 // not retain its detached previous card through a global event closure.
}
function showPicker(){waIdSelected=savedId();$('#waIdPicker').hidden=false;$('#waIdResult').hidden=true;$('#waIdResultActions').hidden=true;drawPicker()}
function showResult(){if(!waIdSelected.length)return;localStorage.setItem('wa_wav_id_members',JSON.stringify(waIdSelected));renderId();$('#waIdPicker').hidden=true;$('#waIdResult').hidden=false;$('#waIdResultActions').hidden=false}
function open(){showPicker();$('#waIdModal').classList.add('open');$('#waIdModal').setAttribute('aria-hidden','false')}
function close(){$('#waIdModal').classList.remove('open');$('#waIdModal').setAttribute('aria-hidden','true')}
async function legacyShareMyWav(){
 const btn=$('#waIdShare'),card=$('#waIdPass');if(!btn||!card||!waIdSelected.length)return;
 const ids=waIdSelected.slice(),names=ids.map(id=>WA_ID_NAMES[id]||id),nums=ids.map(id=>id.slice(1));
 const mode=ids.length===1?'SOLO DNA':ids.length===2?'DUAL LINK':'TRINITY DNA';
 const seed=ids.reduce((a,x)=>a+Number(x.slice(1))*37,113),code='W'+nums.join('-')+'-'+String((seed*97)%10000).padStart(4,'0');
 const units=[...new Set(ids.flatMap(id=>member(id).units))].slice(0,5);
 btn.disabled=true;btn.textContent='MAKING CARD';
 try{
  const W=1080,H=1920,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  const bg=x.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#15131d');bg.addColorStop(.52,'#08080d');bg.addColorStop(1,'#161020');x.fillStyle=bg;x.fillRect(0,0,W,H);
  const glow=(cx,cy,r,a,b)=>{const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,a);g.addColorStop(1,b);x.fillStyle=g;x.fillRect(cx-r,cy-r,r*2,r*2)};
  glow(180,240,520,'rgba(255,72,164,.24)','rgba(255,72,164,0)');glow(900,1420,620,'rgba(125,88,255,.24)','rgba(125,88,255,0)');
  x.strokeStyle='rgba(255,255,255,.14)';x.lineWidth=2;roundRect(x,58,58,W-116,H-116,46);x.stroke();
  x.fillStyle='rgba(255,255,255,.64)';x.font='800 28px system-ui,sans-serif';x.letterSpacing='4px';x.fillText('WAV ARCHIVE',96,132);x.textAlign='right';x.fillText(mode,984,132);x.textAlign='left';
  x.fillStyle='rgba(255,255,255,.035)';x.font='900 280px system-ui,sans-serif';x.textAlign='right';x.fillText(nums.join('·'),1015,440);x.textAlign='left';
  const pts=ids.map((id,i)=>{const n=Number(id.slice(1));return {x:150+((n*47+i*91)%760),y:380+((n*67+i*73)%500)}});for(let i=0;i<6;i++)pts.push({x:120+((seed+i*137)%820),y:330+((seed*3+i*113)%620)});
  x.strokeStyle='rgba(220,205,255,.22)';x.lineWidth=2;x.setLineDash([8,12]);for(let i=1;i<pts.length;i++){x.beginPath();x.moveTo(pts[i-1].x,pts[i-1].y);x.lineTo(pts[i].x,pts[i].y);x.stroke()}x.setLineDash([]);
  pts.forEach((p,i)=>{x.beginPath();x.arc(p.x,p.y,i<ids.length?8:4,0,Math.PI*2);x.fillStyle=i<ids.length?'rgba(255,255,255,.95)':'rgba(255,255,255,.42)';x.fill()});
  x.fillStyle='rgba(255,255,255,.68)';x.font='800 28px system-ui,sans-serif';x.fillText('WAV // '+nums.join('·'),96,1010);
  x.fillStyle='#fff';x.font='900 74px system-ui,sans-serif';fitText(x,names.join(' × '),96,1115,888,74,48);
  x.font='800 25px system-ui,sans-serif';x.fillStyle='rgba(255,255,255,.82)';pill(x,96,1170,'DNA SIGNATURE '+nums.join('—'));
  x.fillStyle='rgba(255,255,255,.52)';x.font='700 25px system-ui,sans-serif';wrapText(x,(units.join(' · ')||'PERSONAL ARCHIVE').toUpperCase(),96,1320,820,42);
  x.fillStyle='rgba(255,255,255,.42)';x.font='800 22px system-ui,sans-serif';x.fillText('ARCHIVE ID '+code,96,1710);x.textAlign='right';x.fillText('@bbangshion',984,1710);x.textAlign='left';
  x.fillStyle='rgba(255,255,255,.24)';x.font='700 19px system-ui,sans-serif';x.fillText('MY WAV · PERSONAL ARCHIVE ID',96,1790);
  const blob=await new Promise(res=>c.toBlob(res,'image/png',1));if(!blob)throw new Error('blob');const file=new File([blob],'WAV_ARCHIVE_'+nums.join('-')+'.png',{type:'image/png'});
  if(window.WAFileIO){await WAFileIO.share(blob,file.name,'MY WAV ID','WAV ARCHIVE · @bbangshion');btn.textContent='READY'}else if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){await navigator.share({files:[file],title:'MY WAV ID',text:'WAV ARCHIVE · @bbangshion'});btn.textContent='SHARED'}else{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),12000);btn.textContent='CARD SAVED'}
 }catch(e){if(e&&e.name==='AbortError')btn.textContent='SHARE MY WAV';else btn.textContent='SHARE NOT AVAILABLE'}finally{btn.disabled=false;setTimeout(()=>{btn.textContent='SHARE MY WAV'},1600)}
}
function roundRect(c,x,y,w,h,r){c.beginPath();c.roundRect?c.roundRect(x,y,w,h,r):(c.rect(x,y,w,h));}
function fitText(c,t,x,y,max,size,min){let s=size;c.font='900 '+s+'px system-ui,sans-serif';while(c.measureText(t).width>max&&s>min){s-=2;c.font='900 '+s+'px system-ui,sans-serif'}c.fillText(t,x,y)}
function wrapText(c,t,x,y,max,lh){let line='';for(const word of t.split(' ')){const test=line?line+' '+word:word;if(c.measureText(test).width>max&&line){c.fillText(line,x,y);line=word;y+=lh}else line=test}if(line)c.fillText(line,x,y)}
function pill(c,x,y,t){c.font='800 25px system-ui,sans-serif';const w=c.measureText(t).width+44;c.fillStyle='rgba(255,255,255,.07)';roundRect(c,x,y-34,w,52,26);c.fill();c.strokeStyle='rgba(255,255,255,.14)';c.stroke();c.fillStyle='rgba(255,255,255,.82)';c.fillText(t,x+22,y)}
$('#waIdOpen')?.addEventListener('click',open);$('#waIdClose')?.addEventListener('click',close);$('#waIdModal')?.addEventListener('click',e=>{if(e.target.id==='waIdModal')close()});$('#waIdGrid')?.addEventListener('click',e=>{const b=e.target.closest('[data-wa-id]');if(!b)return;const id=b.dataset.waId;if(waIdSelected.includes(id))waIdSelected=waIdSelected.filter(x=>x!==id);else if(waIdSelected.length<3)waIdSelected.push(id);drawPicker()});$('#waIdCreate')?.addEventListener('click',showResult);$('#waIdAgain')?.addEventListener('click',showPicker);$('#waIdDna')?.addEventListener('click',()=>document.querySelector('[data-major="dna"]')?.click());$('#waIdCopy')?.addEventListener('click',async()=>{const t=`MY WAV ID | ${waIdSelected.map(id=>id+' '+WA_ID_NAMES[id]).join(' · ')} | WAV ARCHIVE @bbangshion`;try{await navigator.clipboard.writeText(t);$('#waIdCopy').textContent='COPIED'}catch(e){$('#waIdCopy').textContent='COPY NOT AVAILABLE'}setTimeout(()=>$('#waIdCopy').textContent='COPY WAV ID',1400)});
// WAV SHARE MAKER — compact 4:3 export with editable owner + decoration
let waShareTheme='dna',waShareDecor='stars',waShareSticker='none',waShareStickerPos='tr',waSharePhoto=null,waSharePhotoUrl='';
const WA_SHARE_PHOTO_ALPHA=.28;
const shareCanvas=$('#waShareCanvas'),shareCtx=shareCanvas?.getContext('2d');
function shareMeta(){const ids=waIdSelected.slice(),nums=ids.map(id=>id.slice(1)),names=ids.map(id=>WA_ID_NAMES[id]||id),mode=ids.length===1?'SOLO DNA':ids.length===2?'DUAL LINK':'TRINITY DNA',seed=ids.reduce((a,x)=>a+Number(x.slice(1))*37,113),code='W'+nums.join('-')+'-'+String((seed*97)%10000).padStart(4,'0'),units=[...new Set(ids.flatMap(id=>member(id).units))].slice(0,5);return{ids,nums,names,mode,seed,code,units}}
function rr(c,x,y,w,h,r,fill,stroke){c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);if(fill)c.fill();if(stroke)c.stroke()}
function sharePalette(t){return t==='objekt'?['#f5f2ff','#ddd4ff','#111018','#7b56ff']:t==='mono'?['#0b0b0d','#19191e','#f5f5f7','#a9a9b2']:t==='neon'?['#08090d','#101322','#f5f7ff','#54f5ff']:['#0c0b12','#171222','#ffffff','#ff58ae']}
function drawSharePhoto(c,img,W,H){if(!img)return;c.save();c.globalAlpha=WA_SHARE_PHOTO_ALPHA;const ir=img.naturalWidth/img.naturalHeight,cr=W/H;let sw,sh,sx,sy;if(ir>cr){sh=img.naturalHeight;sw=sh*cr;sx=(img.naturalWidth-sw)/2;sy=0}else{sw=img.naturalWidth;sh=sw/cr;sx=0;sy=(img.naturalHeight-sh)/2}c.drawImage(img,sx,sy,sw,sh,0,0,W,H);c.restore();}
function drawSharePreview(){if(!shareCtx||!waIdSelected.length)return;const c=shareCtx,W=c.canvas.width,H=c.canvas.height,m=shareMeta(),P=sharePalette(waShareTheme),owner=($('#waShareName')?.value||'').trim();c.clearRect(0,0,W,H);let g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,P[0]);g.addColorStop(1,P[1]);c.fillStyle=g;c.fillRect(0,0,W,H);drawSharePhoto(c,waSharePhoto,W,H);const light=waShareTheme==='objekt';
 // compact inner card — generous safe area
 c.fillStyle=light?'rgba(255,255,255,.62)':'rgba(255,255,255,.035)';c.strokeStyle=light?'rgba(30,20,60,.16)':'rgba(255,255,255,.15)';c.lineWidth=2;rr(c,64,64,W-128,H-128,48,true,true);
 if(waShareDecor==='grid'){c.strokeStyle=light?'rgba(40,20,90,.08)':'rgba(255,255,255,.055)';c.lineWidth=1;for(let x=110;x<W-80;x+=80){c.beginPath();c.moveTo(x,90);c.lineTo(x,H-90);c.stroke()}for(let y=110;y<H-80;y+=80){c.beginPath();c.moveTo(90,y);c.lineTo(W-90,y);c.stroke()}}
 if(waShareDecor==='orbit'){c.strokeStyle=light?'rgba(90,60,180,.18)':'rgba(210,190,255,.17)';c.lineWidth=3;for(const r of [170,260,350]){c.beginPath();c.ellipse(790,410,r,r*.48,-.45,0,Math.PI*2);c.stroke()}}
 if(waShareDecor==='stars'){const pts=m.ids.map((id,i)=>{const n=Number(id.slice(1));return{x:150+((n*47+i*91)%760),y:250+((n*67+i*73)%430)}});for(let i=0;i<7;i++)pts.push({x:120+((m.seed+i*137)%820),y:210+((m.seed*3+i*113)%500)});c.strokeStyle=light?'rgba(90,60,180,.18)':'rgba(220,205,255,.22)';c.lineWidth=2;c.setLineDash([7,11]);for(let i=1;i<pts.length;i++){c.beginPath();c.moveTo(pts[i-1].x,pts[i-1].y);c.lineTo(pts[i].x,pts[i].y);c.stroke()}c.setLineDash([]);pts.forEach((p,i)=>{c.beginPath();c.arc(p.x,p.y,i<m.ids.length?8:4,0,Math.PI*2);c.fillStyle=i<m.ids.length?P[3]:(light?'rgba(70,40,120,.35)':'rgba(255,255,255,.42)');c.fill()})}
 const fg=light?'#15121d':P[2],muted=light?'rgba(21,18,29,.52)':'rgba(255,255,255,.55)';c.fillStyle=muted;c.font='800 26px system-ui,sans-serif';c.fillText('WAV ARCHIVE',108,145);c.textAlign='right';c.fillText(m.mode,972,145);c.textAlign='left';c.fillStyle=light?'rgba(40,20,80,.055)':'rgba(255,255,255,.035)';c.font='900 230px system-ui,sans-serif';c.textAlign='right';c.fillText(m.nums.join('·'),970,400);c.textAlign='left';
 c.fillStyle=muted;c.font='850 27px system-ui,sans-serif';c.fillText('WAV // '+m.nums.join('·'),108,760);c.fillStyle=fg;fitText(c,m.names.join(' × '),108,855,840,70,44);c.font='800 24px system-ui,sans-serif';c.fillStyle=muted;c.fillText('DNA SIGNATURE '+m.nums.join('—'),108,915);c.font='700 23px system-ui,sans-serif';wrapText(c,(m.units.join(' · ')||'PERSONAL ARCHIVE').toUpperCase(),108,990,800,38);
 if(owner){c.fillStyle=P[3];c.font='900 38px system-ui,sans-serif';fitText(c,'WAV '+owner,108,1125,820,38,26);c.fillStyle=muted;c.font='700 20px system-ui,sans-serif';c.fillText('SHARED BY',108,1080)}
 // optional sticker layer
 if(waShareSticker!=='none'){
   const pos={tl:[150,205],tr:[900,205],bl:[150,1160],br:[900,1160]}[waShareStickerPos]||[900,205];
   const sx=pos[0],sy=pos[1],glyph=waShareSticker==='wav'?'WAV':waShareSticker==='heart'?'♥':waShareSticker==='star'?'✦':waShareSticker==='orbit'?'◎':'✧';
   c.save();c.textAlign='center';c.textBaseline='middle';
   c.shadowColor=P[3];c.shadowBlur=28;c.fillStyle=P[3];
   c.font=(waShareSticker==='wav'?'950 46px':'900 74px')+' system-ui,sans-serif';
   c.fillText(glyph,sx,sy);c.shadowBlur=0;
   c.strokeStyle=light?'rgba(30,20,60,.22)':'rgba(255,255,255,.28)';c.lineWidth=2;
   c.beginPath();c.arc(sx,sy,waShareSticker==='wav'?58:50,0,Math.PI*2);c.stroke();c.restore();
 }
 // ID always inside a dedicated safe strip
 c.fillStyle=light?'rgba(30,20,60,.06)':'rgba(255,255,255,.055)';rr(c,104,1215,872,112,28,true,false);c.fillStyle=muted;c.font='800 19px system-ui,sans-serif';c.fillText('ARCHIVE ID',136,1260);c.fillStyle=fg;c.font='900 26px ui-monospace,monospace';c.fillText(m.code,136,1297);c.textAlign='right';c.font='800 20px system-ui,sans-serif';c.fillText('@bbangshion',944,1292);c.textAlign='left'}
function openShareStudio(){if(!waIdSelected.length)return;const st=$('#waShareStudio');if(!st)return;const n=$('#waShareName');if(n)n.value=localStorage.getItem('wa_share_name')||'';st.classList.add('open');st.setAttribute('aria-hidden','false');requestAnimationFrame(drawSharePreview)}
function closeShareStudio(){const st=$('#waShareStudio');st?.classList.remove('open');st?.setAttribute('aria-hidden','true')}
function waShareToast(msg){
 const old=document.getElementById('waShareToast');if(old)old.remove();
 const t=document.createElement('div');t.id='waShareToast';t.className='wa-share-toast';t.textContent=msg;
 document.body.appendChild(t);requestAnimationFrame(()=>t.classList.add('show'));
 setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),250)},1900);
}
async function shareStudioCard(saveOnly=false){
 if(!shareCanvas)return;
 drawSharePreview();
 const btn=saveOnly?$('#waShareSave'):$('#waShareGo'),oldText=btn?.textContent;
 if(btn){btn.disabled=true;btn.textContent=saveOnly?'저장 준비 중…':'공유 준비 중…'}
 try{
   // Synchronous canvas export keeps the browser's user-activation alive for native share sheets.
   const blob=window.WAFileIO?WAFileIO.canvasBlobSync(shareCanvas,'image/png',.96):await new Promise(r=>shareCanvas.toBlob(r,'image/png',.96));
   if(!blob)throw new Error('blob');
   const m=shareMeta(),name='WAV_SHARE_'+m.nums.join('-')+'.png';
   if(window.WAFileIO){
     if(saveOnly) await WAFileIO.save(blob,name);
     else await WAFileIO.share(blob,name,'WAV ARCHIVE · MY WAV','WAV ARCHIVE · @bbangshion');
   }else if(saveOnly){waDownloadShare(blob,name)}
   else{waDownloadShare(blob,name)}
 }catch(e){
   if(e&&e.name!=='AbortError') waShareToast('공유·저장 준비에 실패했어요 · 다시 시도해 주세요');
 }finally{
   if(btn){btn.disabled=false;btn.textContent=oldText}
 }
}
function waDownloadShare(blob,name){
 const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;
 a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);
}
$('#waIdShare')?.addEventListener('click',openShareStudio);$('#waShareClose')?.addEventListener('click',closeShareStudio);$('#waShareStudio')?.addEventListener('click',e=>{if(e.target.id==='waShareStudio')closeShareStudio()});$('#waShareName')?.addEventListener('input',e=>{localStorage.setItem('wa_share_name',e.target.value);drawSharePreview()});$('#waShareRandom')?.addEventListener('click',()=>{const n=$('#waShareName'),m=shareMeta();if(!n)return;n.value='WAV '+String((m.seed*13)%9999).padStart(4,'0');localStorage.setItem('wa_share_name',n.value);drawSharePreview()});$('#waShareThemes')?.addEventListener('click',e=>{const b=e.target.closest('[data-theme]');if(!b)return;waShareTheme=b.dataset.theme;$$('[data-theme]',$('#waShareThemes')).forEach(x=>x.classList.toggle('selected',x===b));drawSharePreview()});$('#waShareDecor')?.addEventListener('click',e=>{const b=e.target.closest('[data-decor]');if(!b)return;waShareDecor=b.dataset.decor;$$('[data-decor]',$('#waShareDecor')).forEach(x=>x.classList.toggle('selected',x===b));drawSharePreview()});$('#waShareStickers')?.addEventListener('click',e=>{const b=e.target.closest('[data-sticker]');if(!b)return;waShareSticker=b.dataset.sticker;$$('[data-sticker]',$('#waShareStickers')).forEach(x=>x.classList.toggle('selected',x===b));drawSharePreview()});
$('#waShareStickerPos')?.addEventListener('click',e=>{const b=e.target.closest('[data-sticker-pos]');if(!b)return;waShareStickerPos=b.dataset.stickerPos;$$('[data-sticker-pos]',$('#waShareStickerPos')).forEach(x=>x.classList.toggle('selected',x===b));drawSharePreview()});
const waPhotoInput=$('#waSharePhotoInput'),waPhotoPick=$('#waSharePhotoPick'),waPhotoRemove=$('#waSharePhotoRemove'),waPhotoState=$('#waSharePhotoState');
waPhotoPick?.addEventListener('click',()=>waPhotoInput?.click());
waPhotoInput?.addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;if(!f.type.startsWith('image/'))return;if(waSharePhotoUrl)URL.revokeObjectURL(waSharePhotoUrl);waSharePhotoUrl=URL.createObjectURL(f);const img=new Image();img.onload=()=>{waSharePhoto=img;if(waPhotoRemove)waPhotoRemove.hidden=false;if(waPhotoState)waPhotoState.textContent='사진 적용됨 · 투명도 28% 고정';drawSharePreview()};img.src=waSharePhotoUrl;});
waPhotoRemove?.addEventListener('click',()=>{waSharePhoto=null;if(waSharePhotoUrl){URL.revokeObjectURL(waSharePhotoUrl);waSharePhotoUrl=''}if(waPhotoInput)waPhotoInput.value='';if(waPhotoRemove)waPhotoRemove.hidden=true;if(waPhotoState)waPhotoState.textContent='사진 없음';drawSharePreview()});
$('#waShareGo')?.addEventListener('click',()=>shareStudioCard(false));$('#waShareSave')?.addEventListener('click',()=>shareStudioCard(true));

// DNA 2.0: explain the shared path whenever a comparison result is produced
const dna=$('#waDna65');if(dna){const obs=new MutationObserver(()=>{const r=$('#waDna65Result');if(!r||r.querySelector('.wa-dna-reason')||!r.textContent.trim())return;const a=$('#waDna65A')?.value,b=$('#waDna65B')?.value;if(!a||!b)return;const A=member(a),B=member(b),shared=A.units.filter(u=>B.units.includes(u));const box=document.createElement('div');box.className='wa-dna-reason';box.innerHTML=`<b>WHY CONNECTED</b><span>${esc(a)} → ${shared.length?esc(shared.join(' → ')):'WAV ARCHIVE RECORD'} → ${esc(b)}<br>${shared.length?'두 멤버가 공유하는 Dimension을 기준으로 연결된 경로입니다':'현재 기록에서 직접 공유하는 Dimension이 없어 다른 아카이브 축을 탐색해보세요'}</span>`;r.appendChild(box)});const r=$('#waDna65Result');if(r)obs.observe(r,{childList:true,subtree:true})}
// Trust layer for the live archive surface
const hub=$('#wa-auto-hub');if(hub&&!hub.querySelector('.wa-trust')){const x=document.createElement('div');x.className='wa-trust';x.innerHTML='<strong>ARCHIVE TRUST LAYER</strong><span>일정은 등록된 아카이브 기록 기준 · 공식 출처 우선 검증</span>';const head=hub.querySelector('.wa-auto-head');(head||hub).insertAdjacentElement('afterend',x)}
})();
