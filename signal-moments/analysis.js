/* WAV ARCHIVE 16.0 — SIGNAL DATA LAB
 * Analytical extension for SIGNAL V2; does not alter the existing browser/player.
 * Metadata from YouTube titles is NOT a verified on-screen appearance or HAUS record.
 */
(()=>{'use strict';
if(window.__wavSignalAnalysis16)return;
window.__wavSignalAnalysis16=true;
const MEMBER_NAMES=['윤서연','정혜린','이지우','김채연','김유연','김수민','김나경','공유빈','카에데','서다현','코토네','곽연지','니엔','박소현','신위','마유','린','주빈','정하연','박시온','김채원','설린','서아','지연'];
const MEMBERS=MEMBER_NAMES.map((name,i)=>({id:`S${String(i+1).padStart(2,'0')}`,name}));
const VALID_S=/^S(?:0[1-9]|1\d|2[0-4])$/;
const VALID_YT=/^[\w-]{11}$/;
const MAX_RESULTS=80;
const $=(s,r=document)=>r?.querySelector(s)??null;
const add=(m,key,id)=>{if(!m.has(key))m.set(key,new Set());m.get(key).add(id);};
const vtext=v=>String(v??'').slice(0,320);
const h=(tag,cls,content)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=vtext(content);return e;};
const norm=t=>String(t??'').trim().replace(/^#/,'').toLocaleLowerCase('ko');
const yamlDate=s=>/^20(?:22|23|24|25|26)-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/.test(s);

class WavSignalDataLabEngine{
 constructor(episodes=[],notes={}){
  this.docs=new Map();this.byMember=new Map();this.byYear=new Map();this.byTag=new Map();this.byMonth=new Map();
  this.events=Array.isArray(notes?.events)?notes.events.filter(e=>e&&/^\d{4}-\d\d-\d\d$/.test(e.date)&&e.title&&typeof e.source==='string'&&e.source.startsWith('https://')):[];
  const reviewed=notes?.videos&&typeof notes.videos==='object'?notes.videos:{};
  for(const raw of (Array.isArray(episodes)?episodes:[])){
   if(!raw||!yamlDate(raw.date))continue;
   const videoId=VALID_YT.test(raw.videoId??'')?raw.videoId:null;
   const id=videoId??`local:${raw.date}:${vtext(raw.title)}`;
   if(this.docs.has(id))continue;
   const note=videoId?(reviewed[videoId]??{}):{};
   const verified=note.reviewed===true&&Array.isArray(note.members);
   const rawMembers=verified?note.members:(Array.isArray(raw.members)?raw.members:[]);
   const members=[...new Set(rawMembers.filter(x=>VALID_S.test(x)))];
   const tagInput=Array.isArray(raw.tags)?raw.tags:[];const reviewedTags=note.reviewed===true&&Array.isArray(note.tags)?note.tags:[];
   const tags=[...new Set([...tagInput,...reviewedTags].filter(x=>typeof x==='string').map(norm).filter(Boolean))];
   const moments=note.reviewed===true&&Array.isArray(note.moments)?note.moments.filter(m=>Number.isInteger(m?.seconds)&&m.seconds>=0&&typeof m.label==='string'&&m.source?.startsWith('https://')).slice(0,30):[];
   const d={id,videoId,title:vtext(raw.title??'SIGNAL'),date:raw.date,year:raw.date.slice(0,4),month:raw.date.slice(5,7),members,tags,summary:vtext(note.reviewed===true&&note.summary?note.summary:raw.summary??''),verified,moments};
   this.docs.set(id,d);
   add(this.byYear,d.year,id);add(this.byMonth,d.date.slice(0,7),id);
   for(const mid of members)add(this.byMember,mid,id);
   for(const tag of tags)add(this.byTag,tag,id);
  }
  this.sorted=[...this.docs.values()].sort((a,b)=>b.date.localeCompare(a.date)||a.title.localeCompare(b.title,'ko'));
 }
 query({year='',members=[],tag='',month=''}={}){
  const lists=[];
  if(year)lists.push(this.byYear.get(year)??new Set());
  if(year&&month)lists.push(this.byMonth.get(`${year}-${month}`)??new Set());
  for(const mid of members)lists.push(this.byMember.get(mid)??new Set());
  if(tag)lists.push(this.byTag.get(norm(tag))??new Set());
  if(lists.some(x=>!x.size))return[];
  if(!lists.length)return this.sorted;
  lists.sort((a,b)=>a.size-b.size);
  const found=[];
  for(const id of lists[0]){
   if(lists.slice(1).every(s=>s.has(id))){const d=this.docs.get(id);if(d)found.push(d);}
  }
  return found.sort((a,b)=>b.date.localeCompare(a.date)||a.title.localeCompare(b.title,'ko'));
 }
 stats(docs){
  const members=new Map(MEMBERS.map(m=>[m.id,0]));
  const pairs=new Map();const months=new Map();const years=new Map();const tags=new Map();let indexed=0,verified=0;
  for(const d of docs){
   if(d.members.length)indexed++;
   if(d.verified)verified++;
   months.set(d.date.slice(0,7),(months.get(d.date.slice(0,7))??0)+1);
   years.set(d.year,(years.get(d.year)??0)+1);
   for(const t of d.tags)tags.set(t,(tags.get(t)??0)+1);
   for(const id of d.members)members.set(id,(members.get(id)??0)+1);
   for(let i=0;i<d.members.length;i++)for(let j=i+1;j<d.members.length;j++){
    const [a,b]=[d.members[i],d.members[j]].sort();const k=`${a}|${b}`;
    pairs.set(k,(pairs.get(k)??0)+1);
   }
  }
  return{count:docs.length,indexed,verified,members,pairs,months,years,tags};
 }
}
window.WavSignalDataLabEngine=WavSignalDataLabEngine;

const state={engine:null,opened:false,busy:false,members:new Set(),year:'',tag:'',month:'',limit:8,latest:[]};
const createUI=()=>{
 const intro=$('.intro');const hero=$('.hero-stats');const footer=$('.shell footer');
 if(!intro||!footer)return false;
 const action=h('button','wa-an-cta','✦ 멤버·서사 분석 열기 ↗');action.type='button';action.id='waAnalysisTrigger';
 (hero??intro).insertAdjacentElement('afterend',action);
 const section=h('section','wa-analysis');section.id='signalInsights';section.setAttribute('aria-labelledby','wa-an-title');
 section.innerHTML=`
 <div class="wa-an-head"><div><span class="wa-an-eyebrow">03 / SIGNAL DATA LAB</span><h2 id="wa-an-title">SIGNAL 속 멤버와 순간들</h2><p>2022–2026 · 영상 제목에서 찾은 기록을 날짜별로 살펴보세요.</p></div><span class="wa-an-badge">BETA / FAN DATA</span></div>
 <div id="wa-an-load" class="wa-an-load" role="status" aria-live="polite">분석을 열면 현재 SIGNAL 목록을 불러옵니다.</div>
 <div class="wa-an-body" id="wa-an-body" hidden>
  <div class="wa-an-caution"><b>분석 기준</b> 업로드 제목에서 확인된 이름·태그를 바탕으로 집계했어요. 실제 화면 출연, 함께 거주한 기록, 전체 출연 시간은 아닙니다. 영상별 검수 정보가 있으면 따로 표시합니다.</div>
  <div class="wa-an-stats" id="wa-an-stats"></div>
  <div class="wa-an-filterline"><label>연도 <select id="wa-an-year"><option value="">전체 기간</option><option>2026</option><option>2025</option><option>2024</option><option>2023</option><option>2022</option></select></label><label>태그 <select id="wa-an-tag"><option value="">전체 순간</option></select></label><button id="wa-an-reset" type="button">선택 초기화</button></div>
  <div class="wa-an-panel"><div class="wa-an-section-head"><h3>MEMBER PICKER</h3><span id="wa-an-picked">최대 24명 · 여러 명 선택</span></div><div class="wa-an-membergrid" id="wa-an-members"></div></div>
  <div class="wa-an-two-col"><div class="wa-an-panel"><div class="wa-an-section-head"><h3>MONTHLY RECORDS</h3><span>클릭하면 해당 월 기록만 보기</span></div><div id="wa-an-chart" class="wa-an-chart"></div></div>
   <div class="wa-an-panel"><div class="wa-an-section-head"><h3>MEMBER MENTIONS</h3><span>제목 기준 · 출연 순위 아님</span></div><div id="wa-an-ranks"></div></div></div>
  <div class="wa-an-panel"><div class="wa-an-section-head"><h3>함께 언급된 멤버</h3><span>같은 영상의 제목 기반 교집합</span></div><div id="wa-an-pairs" class="wa-an-pairs"></div></div>
  <div class="wa-an-panel"><div class="wa-an-section-head"><h3>THE MOMENTS / 날짜별 다시 보기</h3><span id="wa-an-count"></span></div><div id="wa-an-list" class="wa-an-list"></div><button type="button" id="wa-an-more" class="wa-an-more" hidden>기록 더 보기 ↓</button></div>
  <div class="wa-an-panel wa-an-haus"><div class="wa-an-section-head"><h3>HAUS · 기록된 생활사</h3><span>검증된 자료만 표시</span></div><div id="wa-an-haus"></div><p class="wa-an-footnote">특정 시기의 하우스 구성을 현재 거주 정보로 단정하지 않아요. 팬 기록은 공식 영상·출처와 함께 추가할 수 있습니다.</p></div>
  <p class="wa-an-footnote">SIGNAL DATA LAB은 팬메이드 분석이에요. 메타데이터 누락으로 실제 출연·관계 빈도와 차이가 날 수 있습니다.</p>
 </div>`;
 footer.before(section);
 const dialog=h('dialog','wa-an-dialog');dialog.id='waAnDialog';dialog.setAttribute('aria-label','SIGNAL 영상 재생');
 dialog.innerHTML='<div class="wa-an-dialogtop"><strong id="wa-an-video-name">SIGNAL</strong><button type="button" id="wa-an-close" aria-label="닫기">✕</button></div><div class="wa-an-embed" id="wa-an-embed"></div><div class="wa-an-dialogbottom"><span>재생이 제한되면 YouTube에서 시청해 주세요.</span><a id="wa-an-direct" target="_blank" rel="noopener noreferrer">YouTube에서 보기 ↗</a></div>';
 document.body.append(dialog);
 action.addEventListener('click',()=>{section.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});open();});
 $('#wa-an-year')?.addEventListener('change',e=>{state.year=e.target.value;state.month='';state.limit=8;render();});
 $('#wa-an-tag')?.addEventListener('change',e=>{state.tag=e.target.value;state.limit=8;render();});
 $('#wa-an-reset')?.addEventListener('click',()=>{state.year='';state.month='';state.tag='';state.members.clear();$('#wa-an-year').value='';$('#wa-an-tag').value='';state.limit=8;updateMemberButtons();render();});
 $('#wa-an-more')?.addEventListener('click',()=>{state.limit=Math.min(MAX_RESULTS,state.limit+12);renderTimeline();});
 $('#wa-an-close')?.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>$('#wa-an-embed')?.replaceChildren());
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 if(location.hash==='#signalInsights')open();
 return true;
};
function updateMemberButtons(){for(const b of document.querySelectorAll('#wa-an-members button[data-id]')){const active=state.members.has(b.dataset.id);b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));}$('#wa-an-picked').textContent=state.members.size?`${state.members.size}명 선택 · 함께 언급된 영상만 표시`:'여러 명 선택 · 교집합 탐색';}
function fillMemberButtons(){const root=$('#wa-an-members');if(!root)return;const f=document.createDocumentFragment();for(const m of MEMBERS){const b=h('button','wa-an-member');b.type='button';b.dataset.id=m.id;b.setAttribute('aria-pressed','false');b.append(h('small','',m.id),h('b','',m.name));b.addEventListener('click',()=>{state.members.has(m.id)?state.members.delete(m.id):state.members.add(m.id);state.limit=8;updateMemberButtons();render();});f.append(b);}root.replaceChildren(f);}
async function open(){if(state.opened||state.busy)return;state.busy=true;$('#wa-an-load').textContent='SIGNAL 기록을 분석하는 중…';
 try{
  const response=await fetch('./data.json',{cache:'default'});
  if(!response.ok)throw new Error(`목록 응답 ${response.status}`);
  const data=await response.json();if(!Array.isArray(data?.episodes))throw new Error('영상 목록 형식을 확인할 수 없어요.');
  let notes={};try{const r=await fetch('./analysis-notes.json',{cache:'no-cache'});if(r.ok)notes=await r.json();}catch(_){/* optional review file */}
  state.engine=new WavSignalDataLabEngine(data.episodes,notes);
  state.opened=true;$('#wa-an-body').hidden=false;$('#wa-an-load').hidden=true;
  fillMemberButtons();fillTags();render();
 }catch(e){console.warn('[WAV SIGNAL ANALYTICS]',e);$('#wa-an-load').replaceChildren(document.createTextNode('기록을 불러오지 못했어요. 새로고침 후 다시 시도해 주세요. '));const b=h('button','', '다시 시도');b.type='button';b.addEventListener('click',open,{once:true});$('#wa-an-load').append(b);}
 finally{state.busy=false;}
}
function fillTags(){const sel=$('#wa-an-tag');if(!sel)return;const names=new Set();for(const d of state.engine?.docs.values()??[])for(const t of d.tags)names.add(t);for(const tag of [...names].sort((a,b)=>a.localeCompare(b,'ko'))){const opt=h('option','',`#${tag}`);opt.value=tag;sel.append(opt);}}
function render(){if(!state.engine)return;const result=state.engine.query({year:state.year,members:[...state.members],tag:state.tag,month:state.month});state.latest=result;
 const stats=state.engine.stats(result);renderMetrics(stats);renderChart(stats);renderRanking(stats);renderPairs(stats);renderTimeline();renderHaus();}
function renderMetrics(s){const target=$('#wa-an-stats');if(!target)return;const items=[['조회된 기록',s.count.toLocaleString('ko-KR')],['멤버 표기 있는 영상',s.indexed.toLocaleString('ko-KR')],['검증 노트 반영',s.verified.toLocaleString('ko-KR')]];const frag=document.createDocumentFragment();for(const [title,value]of items){const box=h('div','wa-an-metric');box.append(h('b','',value),h('small','',title));frag.append(box);}target.replaceChildren(frag);}
function renderChart(s){const root=$('#wa-an-chart');if(!root)return;const max=Math.max(1,...s.months.values());const f=document.createDocumentFragment();for(let year=2022;year<=2026;year++){
  if(state.year&&String(year)!==state.year)continue;
  const row=h('div','wa-an-monthrow');row.append(h('div','wa-an-month-year',year));const cells=h('div','wa-an-monthcells');
  for(let month=1;month<=12;month++){const mm=String(month).padStart(2,'0');const count=s.months.get(`${year}-${mm}`)??0;const b=h('button','wa-an-month');b.type='button';b.style.setProperty('--heat',String(count/max));b.disabled=count===0;
   b.title=`${year}년 ${month}월 · ${count}개`;b.setAttribute('aria-label',b.title);b.setAttribute('aria-pressed',String(state.year===String(year)&&state.month===mm));
   if(state.month===mm&&state.year===String(year))b.classList.add('selected');
   b.addEventListener('click',()=>{state.year=String(year);state.month=(state.month===mm?'':mm);$('#wa-an-year').value=state.year;state.limit=8;render();});cells.append(b);
  }row.append(cells);f.append(row);
 }root.replaceChildren(f,h('div','wa-an-legend','진할수록 영상이 많이 등록된 달이에요.'));
}
const memberLabel=id=>MEMBERS.find(m=>m.id===id)?.name??id;
function renderRanking(s){const root=$('#wa-an-ranks');if(!root)return;const ranks=[...s.members].filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,9);if(!ranks.length){root.replaceChildren(h('p','wa-an-muted','영상 제목에 멤버 이름이 표시된 기록이 없어요.'));return;}
 const max=Math.max(1,ranks[0][1]),f=document.createDocumentFragment();for(const [id,num]of ranks){const row=h('button','wa-an-rank');row.type='button';row.append(h('span','',`${id} ${memberLabel(id)}`));const track=h('i','');const bar=h('i','');bar.style.width=(num/max*100).toFixed(1)+'%';track.append(bar);row.append(track,h('b','',num));row.addEventListener('click',()=>{state.members.clear();state.members.add(id);state.limit=8;updateMemberButtons();render();});f.append(row);}root.replaceChildren(f);}
function renderPairs(s){const root=$('#wa-an-pairs');if(!root)return;const pairs=[...s.pairs.entries()].filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,8);if(!pairs.length){root.replaceChildren(h('p','wa-an-muted','함께 이름이 적힌 기록이 없어요. 제목에 언급되지 않은 출연은 집계할 수 없어요.'));return;}
 const f=document.createDocumentFragment();for(const [k,num]of pairs){const [a,b]=k.split('|');const button=h('button','wa-an-pair',`${memberLabel(a)} + ${memberLabel(b)}  ·  ${num}개`);button.type='button';button.addEventListener('click',()=>{state.members.clear();state.members.add(a);state.members.add(b);updateMemberButtons();state.limit=8;render();});f.append(button);}root.replaceChildren(f);}
function timeLabel(seconds){return `${Math.floor(seconds/3600)?String(Math.floor(seconds/3600)).padStart(2,'0')+':':''}${String(Math.floor(seconds%3600/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;}
function renderTimeline(){const root=$('#wa-an-list'),more=$('#wa-an-more');if(!root)return;const docs=state.latest.slice(0,state.limit),f=document.createDocumentFragment();let lastYear='';
 for(const d of docs){if(lastYear!==d.year){lastYear=d.year;f.append(h('div','wa-an-timeline-year',`${d.year} / SIGNAL RECORDS`));}
  const card=h('article','wa-an-video');if(d.videoId){const cover=h('img','wa-an-poster');cover.src=`https://i.ytimg.com/vi/${d.videoId}/mqdefault.jpg`;cover.loading='lazy';cover.decoding='async';cover.alt=`YouTube 썸네일 · ${d.title}`;card.append(cover);}const body=h('div','wa-an-video-main');body.append(h('small','wa-an-date',d.date+(d.verified?' · 검증 노트':' · 제목 기반')));body.append(h('h4','',d.title));if(d.summary)body.append(h('p','wa-an-summary',d.summary));
  if(d.members.length){const chips=h('div','wa-an-video-tags');for(const id of d.members)chips.append(h('span','',`${id} ${memberLabel(id)}`));body.append(chips);}
  if(d.moments.length){const ms=h('div','wa-an-markers');for(const m of d.moments){const link=h('a','',`${timeLabel(m.seconds)} · ${m.label}`);link.href=`https://www.youtube.com/watch?v=${d.videoId}&t=${m.seconds}s`;link.target='_blank';link.rel='noopener noreferrer';ms.append(link);}body.append(ms);}
  const actions=h('div','wa-an-video-actions');if(d.videoId){const play=h('button','', '여기서 재생 ▶');play.type='button';play.addEventListener('click',()=>playVideo(d));const direct=h('a','', 'YouTube ↗');direct.href=`https://www.youtube.com/watch?v=${d.videoId}`;direct.target='_blank';direct.rel='noopener noreferrer';actions.append(play,direct);}else actions.append(h('span','wa-an-muted','영상 ID 미확인'));body.append(actions);card.append(body);f.append(card);
 }
 if(!state.latest.length)f.append(h('p','wa-an-muted','선택한 조건과 일치하는 기록이 없어요. 다른 멤버나 연도를 선택해 보세요.'));
 root.replaceChildren(f);$('#wa-an-count').textContent=`${state.latest.length.toLocaleString('ko-KR')}개 기록`;more.hidden=state.latest.length<=state.limit||state.limit>=MAX_RESULTS;}
function renderHaus(){const root=$('#wa-an-haus');if(!root)return;const events=(state.engine?.events??[]).filter(e=>(!state.year||e.date.startsWith(state.year))&&(!state.members.size||[...state.members].every(id=>e.members?.includes(id)))).slice(0,40);if(!events.length){root.replaceChildren(h('p','wa-an-muted','출처까지 확인된 HAUS 생활사 기록이 아직 없어요. 검증된 날짜·공식 영상 출처가 추가되면 이곳에 표시됩니다.'));return;}
 const f=document.createDocumentFragment();for(const e of events){const row=h('div','wa-an-haus-event');row.append(h('time','',e.date),h('strong','',e.title));const a=h('a','', '출처 ↗');a.href=e.source;a.target='_blank';a.rel='noopener noreferrer';row.append(a);f.append(row);}root.replaceChildren(f);}
function playVideo(d){if(!d?.videoId||!VALID_YT.test(d.videoId))return;const dialog=$('#waAnDialog');if(!dialog?.showModal)return window.open(`https://www.youtube.com/watch?v=${d.videoId}`,'_blank','noopener,noreferrer');
 $('#wa-an-video-name').textContent=d.title;$('#wa-an-direct').href=`https://www.youtube.com/watch?v=${d.videoId}`;const frame=h('iframe');frame.title=d.title;frame.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';frame.src=`https://www.youtube-nocookie.com/embed/${d.videoId}?autoplay=1&playsinline=1&rel=0`;
 $('#wa-an-embed').replaceChildren(frame);dialog.showModal();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',createUI,{once:true});else createUI();
})();
