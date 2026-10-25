/* WAV ARCHIVE • SIGNAL MOMENTS 1.0
   Static GitHub Pages index, no runtime API keys, no dependency.
   Query cost is proportional to postings matched, NOT total episodes.
*/
(() => {
'use strict';
const MEMBERS = [
  ['S01','윤서연'],['S02','정혜린'],['S03','이지우'],['S04','김채연'],
  ['S05','김유연'],['S06','김수민'],['S07','김나경'],['S08','공유빈'],
  ['S09','카에데'],['S10','서다현'],['S11','코토네'],['S12','곽연지'],
  ['S13','니엔'],['S14','박소현'],['S15','신위'],['S16','마유'],
  ['S17','린'],['S18','주빈'],['S19','정하연'],['S20','박시온'],
  ['S21','김채원'],['S22','설린'],['S23','서아'],['S24','지연']
];
const TAGS = ['룸메이트','HAUS','생일','투어','마카오투어','데뷔','무대','비하인드','일상','우정','연습','팬미팅'];
const $=(s,r=document)=>r.querySelector(s);
const validId=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{11}$/.test(id);
const norm=v=>String(v??'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
const gramText=v=>norm(v).replace(/[\s\p{P}\p{S}]/gu,'');
const typeName=v=>({LIVE:'SIGNAL LIVE',SIGNAL:'SIGNAL',WEEKLY:'SIGNAL WEEKLY',SSSIGNAL:'SSSIGNAL'})[v]??'SIGNAL';
const saneDate=v=>/^20(22|23|24|25|26)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(v);
const indexAdd=(map,k,id)=>{if(!map.has(k))map.set(k,new Set());map.get(k).add(id);};
class WavSignalMomentsEngine {
 constructor(items=[]){
  this.docs=new Map();this.byMember=new Map();this.byTag=new Map();
  this.byYear=new Map();this.byMonth=new Map();this.byType=new Map();this.byGram=new Map();
  this.load(items);
 }
 load(items){
  this.docs.clear();[this.byMember,this.byTag,this.byYear,this.byMonth,this.byType,this.byGram].forEach(x=>x.clear());
  if(!Array.isArray(items))return;
  for(const raw of items){
   if(!raw||typeof raw!=='object'||!saneDate(raw.date))continue;
   const id=String(raw.videoId??'').trim();
   const slug=String(raw.slug??`${raw.date}:${raw.title??''}`).slice(0,200);
   const key=validId(id)?`yt:${id}`:`ref:${slug}`;
   const year=raw.date.slice(0,4),month=raw.date.slice(5,7);
   const kind=['SIGNAL','LIVE','WEEKLY','SSSIGNAL'].includes(raw.kind)?raw.kind:'SIGNAL';
   const members=[...new Set((Array.isArray(raw.members)?raw.members:[]).filter(v=>/^S(0[1-9]|1\d|2[0-4])$/.test(v)))];
   const tags=[...new Set((Array.isArray(raw.tags)?raw.tags:[]).map(t=>norm(t).replace(/^#/,'')).filter(Boolean))];
   const title=String(raw.title??'제목 미확인').slice(0,260),summary=String(raw.summary??'').slice(0,380);
   const doc={key,videoId:validId(id)?id:null,title,summary,date:raw.date,year,month,kind,members,tags,verified:validId(id)};
   this.docs.set(key,doc);
  }
  // One-time multi-key registry, no per-query full scan.
  for(const [id,d] of this.docs){
   indexAdd(this.byYear,d.year,id);indexAdd(this.byMonth,`${d.year}-${d.month}`,id);indexAdd(this.byType,d.kind,id);
   d.members.forEach(k=>indexAdd(this.byMember,k,id));d.tags.forEach(k=>indexAdd(this.byTag,k,id));
   const text=gramText(`${d.title} ${d.summary}`);const grams=new Set();
   for(let i=0;i<text.length;i++){grams.add(text[i]);if(i+1<text.length)grams.add(text.slice(i,i+2));if(i+2<text.length)grams.add(text.slice(i,i+3));}
   grams.forEach(g=>indexAdd(this.byGram,g,id));
  }
 }
 get size(){return this.docs.size;}
 getMomentsByIntersection(memberIds=[],tags=[],filters={}){
  const q=gramText(filters.query??'');
  const indices=[];
  for(const id of [...new Set(memberIds)])indices.push(this.byMember.get(id)??new Set());
  for(const tag of [...new Set(tags)])indices.push(this.byTag.get(norm(tag).replace(/^#/,''))??new Set());
  if(filters.year){indices.push(this.byYear.get(String(filters.year))??new Set());}
  if(filters.month&&filters.year){indices.push(this.byMonth.get(`${filters.year}-${String(filters.month).padStart(2,'0')}`)??new Set());}
  if(filters.type){indices.push(this.byType.get(String(filters.type))??new Set());}
  if(q){
   // Bigram/trigram posting lists; 1-character lookup works too.
   const parts=q.length<3?[q]:Array.from({length:q.length-2},(_,i)=>q.slice(i,i+3));
   for(const part of new Set(parts))indices.push(this.byGram.get(part)??new Set());
  }
  if(!indices.length){
   // A deliberately unfiltered timeline must naturally return all results.
   return [...this.docs.values()].sort((a,b)=>b.date.localeCompare(a.date)||a.title.localeCompare(b.title,'ko'));
  }
  indices.sort((a,b)=>a.size-b.size);
  const [small,...rest]=indices;
  const out=[];
  for(const id of small){
   if(rest.some(set=>!set.has(id)))continue;
   const d=this.docs.get(id);
   if(!d)continue;
   if(filters.month&&!filters.year&&d.month!==String(filters.month).padStart(2,'0'))continue;
   if(q&&!gramText(`${d.title} ${d.summary}`).includes(q))continue;
   out.push(d);
  }
  return out.sort((a,b)=>b.date.localeCompare(a.date)||a.title.localeCompare(b.title,'ko'));
 }
}
window.WavSignalMomentsEngine=WavSignalMomentsEngine;
const state={items:[],engine:null,selectedMembers:new Set(),selectedTags:new Set(),limit:18};
const ui={year:$('#year'),month:$('#month'),kind:$('#kind'),search:$('#search'),timeline:$('#timeline'),stats:$('#stats'),status:$('#status'),more:$('#more')};
const nYear=y=>`${y}년`;
function text(el,s){if(el)el.textContent=s;}
function elt(name,className,textValue){const e=document.createElement(name);if(className)e.className=className;if(textValue!=null)e.textContent=textValue;return e;}
function selectMember(e){const id=e.currentTarget.dataset.member;if(state.selectedMembers.has(id))state.selectedMembers.delete(id);else state.selectedMembers.add(id);e.currentTarget.setAttribute('aria-pressed',String(state.selectedMembers.has(id)));resetAndRender();}
function selectTag(e){const key=e.currentTarget.dataset.tag;if(state.selectedTags.has(key))state.selectedTags.delete(key);else state.selectedTags.add(key);e.currentTarget.setAttribute('aria-pressed',String(state.selectedTags.has(key)));resetAndRender();}
function setupControls(){
 for(let i=1;i<=12;i++){const opt=elt('option','',`${i}월`);opt.value=String(i).padStart(2,'0');ui.month.append(opt);}
 const grid=$('#members');MEMBERS.forEach(([id,name])=>{const b=elt('button');b.type='button';b.dataset.member=id;b.setAttribute('aria-pressed','false');b.append(elt('small','',id),elt('b','',name));b.addEventListener('click',selectMember);grid.append(b);});
 const tags=$('#tags');TAGS.forEach(t=>{const b=elt('button','',`#${t}`);b.type='button';b.dataset.tag=norm(t);b.setAttribute('aria-pressed','false');b.addEventListener('click',selectTag);tags.append(b);});
 for(const el of [ui.year,ui.month,ui.kind])el.addEventListener('change',resetAndRender);
 ui.search.addEventListener('input',debounce(resetAndRender,125));
 $('#clearSearch').addEventListener('click',()=>{ui.search.value='';resetAndRender();ui.search.focus();});
 $('#clearFilters').addEventListener('click',()=>{state.selectedMembers.clear();state.selectedTags.clear();document.querySelectorAll('[aria-pressed]').forEach(b=>b.setAttribute('aria-pressed','false'));ui.search.value='';ui.year.value='';ui.month.value='';ui.kind.value='';resetAndRender();});
 ui.more.addEventListener('click',()=>{state.limit+=18;render();});
}
function debounce(fn,ms){let timer;return(...args)=>{clearTimeout(timer);timer=setTimeout(()=>fn(...args),ms);};}
function parsedSearch(input){
 let q=String(input??'').trim();const out={};
 const pair=q.match(/(?:20)?(2[2-6])\s*년?\s*[.\/-]?\s*(1[0-2]|0?[1-9])\s*월?/i);
 if(pair){out.year=`20${pair[1]}`;out.month=pair[2].padStart(2,'0');q=q.replace(pair[0],' ');}
 else {
  const y=q.match(/(?:20)?(2[2-6])\s*년(?:도)?/);if(y){out.year=`20${y[1]}`;q=q.replace(y[0],' ');}
  const m=q.match(/\b(1[0-2]|0?[1-9])\s*월/);if(m){out.month=m[1].padStart(2,'0');q=q.replace(m[0],' ');}
 }
 if(/시그널\s*라이브|signal\s*live|\blive\b|라이브/i.test(q)){out.type='LIVE';q=q.replace(/시그널\s*라이브|signal\s*live|\blive\b|라이브/ig,' ');}
 else if(/시그널\s*위클리|signal\s*weekly/i.test(q)){out.type='WEEKLY';q=q.replace(/시그널\s*위클리|signal\s*weekly/ig,' ');}
 else if(/시그널|signal/i.test(q)){out.type='SIGNAL';q=q.replace(/시그널|signal/ig,' ');}
 for(const [id,name] of MEMBERS){if(name.length>1&&q.includes(name)){out.members??=[];out.members.push(id);q=q.replace(name,' ');}}
 out.query=q.replace(/[.#/\s]+/g,' ').trim();return out;
}
function filters(){const parsed=parsedSearch(ui.search.value);return {year:ui.year.value||parsed.year||'',month:ui.month.value||parsed.month||'',type:ui.kind.value||parsed.type||'',query:parsed.query||'',autoMembers:parsed.members||[]};}
function resetAndRender(){state.limit=18;render();}
function episodeCard(d){
 const art=elt('article','episode');const poster=elt('div','poster');
 if(d.videoId){const img=elt('img');img.loading='lazy';img.decoding='async';img.alt=`${d.title} 유튜브 썸네일`;img.src=`https://i.ytimg.com/vi/${d.videoId}/hqdefault.jpg`;img.onerror=()=>{img.remove();poster.append(elt('div','no-image','SIGNAL'));};poster.append(img);}
 else poster.append(elt('div','no-image','SIGNAL'));
 poster.append(elt('span','yt-badge',d.videoId?'OFFICIAL VIDEO':'영상 검색 연결'));
 const body=elt('div','body');const meta=elt('div','meta');meta.append(elt('span','',d.date),elt('span','',typeName(d.kind)));body.append(meta,elt('h3','',d.title));
 body.append(elt('p','',d.summary||'공식 채널에서 해당 날의 이야기를 확인해 보세요.'));
 const pills=elt('div','labels');for(const id of d.members){const name=MEMBERS.find(([mid])=>mid===id)?.[1]||id;pills.append(elt('span','',`${id} ${name}`));}for(const tag of d.tags)pills.append(elt('span','',`#${tag}`));body.append(pills);
 const watch=elt('a',`watch ${d.videoId?'':'is-search'}`,d.videoId?'▶ 공식 YouTube에서 보기 ↗':'↗ YouTube에서 영상 찾기');
 const url=d.videoId?`https://www.youtube.com/watch?v=${d.videoId}`:`https://www.youtube.com/@triplescosmos/search?query=${encodeURIComponent(`${d.kind==='LIVE'?'SIGNAL LIVE':'SIGNAL'} ${d.date.slice(2).replace(/-/g,'')}`)}`;
 watch.href=url;watch.target='_blank';watch.rel='noopener noreferrer';body.append(watch);art.append(poster,body);return art;
}
function render(){
 const f=filters();const ms=[...new Set([...state.selectedMembers,...f.autoMembers])];
 const out=state.engine?.getMomentsByIntersection(ms,[...state.selectedTags],f)??[];
 ui.timeline.replaceChildren();
 const frag=document.createDocumentFragment();
 for(const d of out.slice(0,state.limit))frag.append(episodeCard(d));
 if(out.length===0)frag.append(elt('div','empty','일치하는 영상이 아직 없어요. 다른 연도·월을 선택해 보세요.\n데이터가 추가되면 이 목록도 함께 늘어납니다.'));
 ui.timeline.append(frag);
 text(ui.stats,`${out.length.toLocaleString('ko-KR')}개 / 저장 ${state.engine?.size?.toLocaleString('ko-KR')??'0'}개`);
 ui.more.hidden=out.length<=state.limit;
 if(f.year)text(ui.status,`${nYear(f.year)}${f.month?' '+parseInt(f.month,10)+'월':''} · ${f.type?typeName(f.type):'모든 SIGNAL'}${ms.length?' · '+ms.length+'명 선택':''}`);
 else text(ui.status,`연도 2022–2026 · ${f.type?typeName(f.type):'전체 영상'}${ms.length?' · '+ms.length+'명 선택':''}`);
}
async function start(){
 setupControls();try{
  const res=await fetch('./data.json',{cache:'no-cache'});if(!res.ok)throw Error(`HTTP ${res.status}`);
  const data=await res.json();const episodes=Array.isArray(data)?data:data?.episodes;
  if(!Array.isArray(episodes))throw Error('data format');
  state.engine=new WavSignalMomentsEngine(episodes);render();
 }catch(err){state.engine=new WavSignalMomentsEngine([]);render();text(ui.status,'영상 목록을 불러오지 못했어요. 새로고침하거나 데이터 파일을 확인해 주세요.');console.warn('[SIGNAL MOMENTS]',err);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
