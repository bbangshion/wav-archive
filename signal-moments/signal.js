/* WAV ARCHIVE • SIGNAL MOMENTS 2.0 — client-side index, native thumbnails, click-to-play.
   No client-side YouTube API credentials. All metadata comes from generated data.json.
   Indexed intersection complexity: O(size of smallest postings set + matches), not O(1).
*/
(()=>{'use strict';
const MEMBERS=[['S01','윤서연'],['S02','정혜린'],['S03','이지우'],['S04','김채연'],['S05','김유연'],['S06','김수민'],['S07','김나경'],['S08','공유빈'],['S09','카에데'],['S10','서다현'],['S11','코토네'],['S12','곽연지'],['S13','니엔'],['S14','박소현'],['S15','신위'],['S16','마유'],['S17','린'],['S18','주빈'],['S19','정하연'],['S20','박시온'],['S21','김채원'],['S22','설린'],['S23','서아'],['S24','지연']];
const NAMES=new Map(MEMBERS);const TAGS=['룸메이트','HAUS','생일','투어','마카오투어','데뷔','무대','비하인드','일상','우정','연습','팬미팅'];
const $=(s,r=document)=>r.querySelector(s);const norm=v=>String(v??'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();const compact=v=>norm(v).replace(/[\s\p{P}\p{S}]/gu,'');
const validId=v=>typeof v==='string'&&/^[\w-]{11}$/.test(v);const validDate=v=>/^20(?:22|23|24|25|26)-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/.test(v);
const typeLabel={SIGNAL:'SIGNAL',LIVE:'SIGNAL LIVE',WEEKLY:'SIGNAL WEEKLY',SSSIGNAL:'SSSIGNAL'};
const put=(map,k,v)=>{let bag=map.get(k);if(!bag)map.set(k,bag=new Set());bag.add(v);};
class WavSignalMomentsEngine{
 constructor(items=[]){this.docs=new Map();this.byMember=new Map();this.byTag=new Map();this.byYear=new Map();this.byMonth=new Map();this.byType=new Map();this.byGram=new Map();this.load(items);}
 load(items){this.docs.clear();for(const m of [this.byMember,this.byTag,this.byYear,this.byMonth,this.byType,this.byGram])m.clear();
  if(!Array.isArray(items))return;
  for(const raw of items){if(!raw||!validDate(raw.date))continue;const videoId=validId(raw.videoId)?raw.videoId:null;const key=videoId||`unverified:${raw.date}:${String(raw.title??'').slice(0,80)}`;
   const doc={key,videoId,year:raw.date.slice(0,4),month:raw.date.slice(5,7),date:raw.date,title:String(raw.title??'SIGNAL').slice(0,280),kind:typeLabel[raw.kind]?raw.kind:'SIGNAL',summary:String(raw.summary??'').slice(0,220),members:[...new Set((raw.members??[]).filter?.(id=>/^S(?:0[1-9]|1\d|2[0-4])$/.test(id))??[])],tags:[...new Set((raw.tags??[]).map?.(v=>norm(v).replace(/^#/,''))??[])],embeddable:raw.embeddable!==false};
   this.docs.set(key,doc);
  }
  for(const [id,d] of this.docs){put(this.byYear,d.year,id);put(this.byMonth,d.year+'-'+d.month,id);put(this.byType,d.kind,id);
   for(const m of d.members)put(this.byMember,m,id);for(const t of d.tags)put(this.byTag,t,id);
   const v=compact(d.title+' '+d.summary);const grams=new Set();for(let i=0;i<v.length;i++){grams.add(v[i]);if(i+1<v.length)grams.add(v.slice(i,i+2));if(i+2<v.length)grams.add(v.slice(i,i+3));}for(const g of grams)put(this.byGram,g,id);
  }
 }
 get size(){return this.docs.size;}
 getMomentsByIntersection(members=[],tags=[],filters={}){
  const postings=[];const empty=new Set();for(const m of new Set(members))postings.push(this.byMember.get(m)??empty);for(const t of new Set(tags.map(x=>norm(x).replace(/^#/,''))))postings.push(this.byTag.get(t)??empty);
  if(filters.year)postings.push(this.byYear.get(String(filters.year))??empty);
  if(filters.year&&filters.month)postings.push(this.byMonth.get(String(filters.year)+'-'+String(filters.month).padStart(2,'0'))??empty);
  if(filters.type)postings.push(this.byType.get(filters.type)??empty);
  const query=compact(filters.query??'');if(query){const g=query.length<3?[query]:Array.from({length:query.length-2},(_,i)=>query.slice(i,i+3));for(const tok of new Set(g))postings.push(this.byGram.get(tok)??empty);}
  postings.sort((a,b)=>a.size-b.size);const out=[];const source=postings.length?postings[0]:this.docs.keys();
  for(const id of source){if(postings.length&&postings.slice(1).some(s=>!s.has(id)))continue;const d=this.docs.get(id);if(!d)continue;if(!filters.year&&filters.month&&d.month!==String(filters.month).padStart(2,'0'))continue;if(query&&!compact(d.title+' '+d.summary).includes(query))continue;out.push(d);}
  return out.sort((a,b)=>b.date.localeCompare(a.date)||a.title.localeCompare(b.title,'ko'));
 }
}
window.WavSignalMomentsEngine=WavSignalMomentsEngine;
const state={engine:null,data:null,selectedMembers:new Set(),selectedTags:new Set(),limit:24,results:[]};
const el={search:$('#search'),year:$('#year'),month:$('#month'),kind:$('#kind'),timeline:$('#timeline'),stats:$('#stats'),status:$('#status'),more:$('#more'),years:$('#yearStrip'),dialog:$('#videoDialog'),mount:$('#playerMount')};
function node(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;}
function labelFor(kind){return typeLabel[kind]??kind;}
function naturalQuery(value){let q=String(value??'').trim();const f={};
 const combined=q.match(/(?:20)?(2[2-6])\s*년?\s*[.\/-]?\s*(1[0-2]|0?[1-9])\s*월?/i);
 if(combined){f.year='20'+combined[1];f.month=combined[2].padStart(2,'0');q=q.replace(combined[0],' ');}else{
 const year=q.match(/(?:20)?(2[2-6])\s*년(?:도)?/);if(year){f.year='20'+year[1];q=q.replace(year[0],' ');}
 const month=q.match(/\b(1[0-2]|0?[1-9])\s*월/);if(month){f.month=month[1].padStart(2,'0');q=q.replace(month[0],' ');}}
 if(/시그널\s*라이브|signal\s*live|live\s*signal|라이브/i.test(q)){f.type='LIVE';q=q.replace(/시그널\s*라이브|signal\s*live|live\s*signal|라이브/ig,' ');}
 else if(/시그널\s*위클리|signal\s*weekly/i.test(q)){f.type='WEEKLY';q=q.replace(/시그널\s*위클리|signal\s*weekly/ig,' ');}
 else if(/sss\s*ignal/i.test(q)){f.type='SSSIGNAL';q=q.replace(/sss\s*ignal/ig,' ');}
 else if(/시그널|signal/i.test(q)){f.type='SIGNAL';q=q.replace(/시그널|signal/ig,' ');}
 for(const [id,name] of MEMBERS){if(q.includes(name)){f.members??=[];f.members.push(id);q=q.replace(name,' ');}}
 f.query=q.replace(/[.#/\s]+/g,' ').trim();return f;
}
function getFilters(){const q=naturalQuery(el.search.value);return{year:el.year.value||q.year||'',month:el.month.value||q.month||'',type:el.kind.value||q.type||'',query:q.query||'',members:q.members||[]};}
function buildYearStrip(){el.years.replaceChildren();const groups=[['','ALL'],...['2026','2025','2024','2023','2022'].map(y=>[y,y])];
 for(const [year,label] of groups){const b=node('button','',label);b.type='button';b.dataset.year=year;
  if(state.engine){const count=year?state.engine.byYear.get(year)?.size??0:state.engine.size;b.append(node('small','',String(count)));}
  b.classList.toggle('active',el.year.value===year);b.setAttribute('aria-pressed',String(el.year.value===year));b.addEventListener('click',()=>{el.year.value=year;reset();});el.years.append(b);
 }}
function setup(){for(let i=1;i<=12;i++){const option=node('option','',i+'월');option.value=String(i).padStart(2,'0');el.month.append(option);}
 const grid=$('#members');for(const [id,name]of MEMBERS){const b=node('button');b.type='button';b.dataset.member=id;b.setAttribute('aria-pressed','false');b.append(node('small','',id),node('b','',name));b.addEventListener('click',()=>{if(state.selectedMembers.has(id))state.selectedMembers.delete(id);else state.selectedMembers.add(id);b.setAttribute('aria-pressed',String(state.selectedMembers.has(id)));reset();});grid.append(b);}
 const tags=$('#tags');for(const label of TAGS){const b=node('button','',`#${label}`);b.type='button';b.dataset.tag=norm(label);b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>{if(state.selectedTags.has(b.dataset.tag))state.selectedTags.delete(b.dataset.tag);else state.selectedTags.add(b.dataset.tag);b.setAttribute('aria-pressed',String(state.selectedTags.has(b.dataset.tag)));reset();});tags.append(b);}
 let timer=0;el.search.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(reset,125);});for(const ctrl of [el.year,el.month,el.kind])ctrl.addEventListener('change',reset);
 $('#clearSearch').addEventListener('click',()=>{el.search.value='';reset();el.search.focus();});
 $('#clearFilters').addEventListener('click',()=>{el.search.value='';el.year.value='';el.month.value='';el.kind.value='';state.selectedMembers.clear();state.selectedTags.clear();document.querySelectorAll('.members [aria-pressed],.tags [aria-pressed]').forEach(b=>b.setAttribute('aria-pressed','false'));reset();});
 el.more.addEventListener('click',()=>{state.limit+=24;render();});
 $('#closePlayer').addEventListener('click',closePlayer);el.dialog?.addEventListener('close',()=>{el.mount.replaceChildren();document.body.style.overflow='';});
 el.dialog?.addEventListener('click',e=>{if(e.target===el.dialog)closePlayer();});buildYearStrip();
}
function closePlayer(){if(el.dialog?.open)el.dialog.close();el.mount.replaceChildren();}
function openPlayer(doc){if(!doc?.videoId||!validId(doc.videoId))return;
 if(doc.embeddable===false){window.open('https://www.youtube.com/watch?v='+doc.videoId,'_blank','noopener,noreferrer');return;}
 $('#playTitle').textContent=doc.title;$('#externalPlayer').href=`https://www.youtube.com/watch?v=${doc.videoId}`;
 el.mount.replaceChildren();const iframe=node('iframe');iframe.title=doc.title;iframe.loading='eager';iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';
 const origin=(window.location.protocol==='https:'||window.location.protocol==='http:')?'&origin='+encodeURIComponent(window.location.origin):'';
 iframe.src=`https://www.youtube-nocookie.com/embed/${doc.videoId}?autoplay=1&playsinline=1&rel=0${origin}`;
 el.mount.append(iframe);if(typeof el.dialog?.showModal==='function'){if(!el.dialog.open)el.dialog.showModal();}else window.open($('#externalPlayer').href,'_blank','noopener,noreferrer');
}
function card(doc){const art=node('article','episode');const poster=node('div','poster');
 if(doc.videoId){const img=node('img');img.src=`https://i.ytimg.com/vi/${doc.videoId}/hqdefault.jpg`;img.loading='lazy';img.decoding='async';img.alt='공식 YouTube 썸네일: '+doc.title;img.onerror=()=>{img.remove();poster.prepend(node('div','no-photo','SIGNAL'));};poster.append(img);
 const play=node('button','play-cover');play.type='button';play.setAttribute('aria-label','이 페이지에서 재생: '+doc.title);play.append(node('span','play-circle','▶'));play.addEventListener('click',()=>openPlayer(doc));poster.append(play);
 }else poster.append(node('div','no-photo','SIGNAL'));
 poster.append(node('span','category',labelFor(doc.kind)));
 const body=node('div','ep-body');const meta=node('div','ep-meta');meta.append(node('span','',doc.date),node('span','',doc.videoId?'tripleS official':'링크 확인 중'));body.append(meta,node('h3','',doc.title));
 const excerpt=doc.summary||'공식 제목을 바탕으로 찾아온 SIGNAL이에요. 자세한 이야기는 영상에서 확인해 주세요.';body.append(node('p','',excerpt));
 const pills=node('div','labels');for(const id of doc.members.slice(0,10))pills.append(node('span','',NAMES.get(id)??id));for(const t of doc.tags.slice(0,5))pills.append(node('span','',`#${t}`));body.append(pills);
 const controls=node('div','ep-buttons');if(doc.videoId){const playButton=node('button','watch','▶ 여기서 재생');playButton.type='button';playButton.addEventListener('click',()=>openPlayer(doc));controls.append(playButton);}else{const disabled=node('button','watch','재생 링크 미확인');disabled.type='button';disabled.disabled=true;controls.append(disabled);}
 const link=node('a','direct','YouTube ↗');link.href=doc.videoId?`https://www.youtube.com/watch?v=${doc.videoId}`:`https://www.youtube.com/@triplescosmos/search?query=${encodeURIComponent(labelFor(doc.kind)+' '+doc.date.replaceAll('-',''))}`;link.target='_blank';link.rel='noopener noreferrer';controls.append(link);body.append(controls);art.append(poster,body);return art;
}
function reset(){state.limit=24;buildYearStrip();render();}
function render(){const f=getFilters();const ms=[...new Set([...state.selectedMembers,...f.members])];state.results=state.engine?.getMomentsByIntersection(ms,[...state.selectedTags],f)??[];
 const frag=document.createDocumentFragment();let previous='';for(const d of state.results.slice(0,state.limit)){
  const k=d.date.slice(0,7);if(k!==previous){frag.append(node('div','timeline-heading',`${d.year}.${d.month}`));previous=k;}
  frag.append(card(d));
 }
 if(!state.results.length)frag.append(node('div','empty','해당 조건의 SIGNAL이 아직 등록되지 않았어요.\n연도·월을 바꾸거나 필터를 초기화해 보세요.'));
 el.timeline.replaceChildren(frag);el.more.hidden=state.results.length<=state.limit;
 el.stats.textContent=`${state.results.length.toLocaleString('ko-KR')}개`;const status=[f.year||'2022–2026',f.month?parseInt(f.month,10)+'월':null,f.type?labelFor(f.type):'모든 SIGNAL',ms.length?ms.length+'명 선택':null].filter(Boolean).join(' · ');el.status.textContent=status;
}
async function boot(){setup();try{const res=await fetch('./data.json',{cache:'no-store'});if(!res.ok)throw new Error('HTTP '+res.status);const data=await res.json();const docs=Array.isArray(data)?data:data.episodes;if(!Array.isArray(docs))throw new Error('Invalid catalog');state.data=data;state.engine=new WavSignalMomentsEngine(docs);
 $('#totalCount').textContent=state.engine.size.toLocaleString('ko-KR');const full=data.coverage==='official-full';$('#dbStatus').textContent=full?'전체 목록 동기화':'영상 수집 중';
 if(data.generatedAt){const stamp=String(data.generatedAt).slice(0,10);$('#dbStatus').title='마지막 목록 갱신 '+stamp;}
 buildYearStrip();render();
 }catch(error){console.warn('[SIGNAL] load failed',error);state.engine=new WavSignalMomentsEngine([]);buildYearStrip();render();$('#dbStatus').textContent='불러오기 오류';el.status.textContent='영상 목록을 불러오지 못했어요. 새로고침 후 다시 확인해 주세요.';}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
