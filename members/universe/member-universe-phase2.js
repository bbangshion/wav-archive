/* WAV ARCHIVE MEMBER UNIVERSE — phase 2. Additive only.
 * Uses the site's own snapshot. Never modifies original member cards or global navigation.
 */
(()=>{'use strict';
 const id=document.documentElement.dataset.waMember;
 if(!/^S(?:0[1-9]|1\d|2[0-4])$/.test(String(id||'')) || document.getElementById('waMu2Story')) return;
 const runtime=document.currentScript;
 const base=new URL('./',runtime && runtime.src ? runtime.src : location.href);
 if(!document.getElementById('waMu2Style')){
   const link=document.createElement('link');link.id='waMu2Style';link.rel='stylesheet';link.href=new URL('member-universe-phase2.css',base).href;document.head.appendChild(link);
 }
 const LIMIT=12;
 const LANG={
  ko:{album:'음반 연결',albumSub:'기존 음반 아카이브에서 이 멤버의 디멘션과 이름이 일치하는 기록을 연결했어요',albumCaution:'WAV ARCHIVE 내부 자료 기준 · 공식 크레딧과 개별 참여 여부는 추가 확인이 필요합니다',noAlbum:'직접 연결된 디멘션 음반이 아직 없습니다. 전체 음반에서 더 찾아볼 수 있어요',allAlbum:'전체 음반 아카이브 ↗',record:'음반 기록',journey:'MEMBER JOURNEY',story:'활동 흐름 한눈에 보기',storySub:'기존 멤버 HISTORY를 연도별로 다시 정리한 요약이에요 · 새로운 사실을 추가하지 않았어요',all:'전체',count:'개 기록',visit:'원본 HISTORY 보기 ↗',prev:'이전 멤버',next:'다음 멤버',source:'기존 WAV ARCHIVE 기록',noData:'기록을 불러오지 못했습니다. 기존 HISTORY를 이용해 주세요',noAlbumSource:'기존 음반 데이터를 확인할 수 없어 전체 아카이브 링크만 표시합니다',full:'완전체 음반은 참여 여부를 자동 추정하지 않고 전체 음반 아카이브에서 확인할 수 있어요',date:'날짜 미정',seeAlbum:'음반 상세 ↗'},
  en:{album:'Connected discography',albumSub:'Album records associated with the member’s listed DIMENSIONs in the WAV ARCHIVE snapshot',albumCaution:'WAV ARCHIVE snapshot only · Official credits and individual participation need further verification',noAlbum:'No directly matched DIMENSION records yet. Explore the full discography',allAlbum:'Full discography ↗',record:'Album record',journey:'MEMBER JOURNEY',story:'Activity history by year',storySub:'Existing member HISTORY entries regrouped by year · No new facts have been added',all:'All',count:'records',visit:'Original HISTORY ↗',prev:'Previous member',next:'Next member',source:'WAV ARCHIVE snapshot',noData:'Records could not be loaded. Please use the original HISTORY',noAlbumSource:'The album index is unavailable. Use the main discography',full:'Full-group releases are listed in the main discography; individual credits are not inferred',date:'Date pending',seeAlbum:'Album details ↗'},
  ja:{album:'参加ディメンションの音盤',albumSub:'WAV ARCHIVEの既存資料で、ディメンション名が一致した音盤のみ表示します',albumCaution:'WAV ARCHIVE内の記録に基づく · 公式クレジットおよび個人参加の追加確認が必要です',noAlbum:'一致する音盤の登録がありません。全体の音盤一覧をご覧ください',allAlbum:'音盤アーカイブ ↗',record:'音盤記録',journey:'MEMBER JOURNEY',story:'年ごとの活動記録',storySub:'既存のメンバーHISTORYを年別に再整理 · 新しい事実は加えていません',all:'すべて',count:'件',visit:'元のHISTORYを見る ↗',prev:'前のメンバー',next:'次のメンバー',source:'WAV ARCHIVE内の記録',noData:'記録を読み込めません。既存のHISTORYをご覧ください',noAlbumSource:'音盤データを読み込めません。全体アーカイブをご覧ください',full:'完全体の音盤は個人の参加を推測せず、全体アーカイブに掲載しています',date:'日付未定',seeAlbum:'音盤の詳細 ↗'}
 };
 const lang=()=>LANG[document.documentElement.lang]?document.documentElement.lang:'ko';
 const t=()=>LANG[lang()];
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n};
 const link=(label,href,cls='wa-mu2-link')=>{const a=el('a',cls,label);a.href=href;return a};
 const anchor=(hash)=>`../../#${hash}`;
 const dec=(v)=>String(v||'').replace(/\s+/g,'').toLowerCase().normalize('NFKC');
 const aliases={aaa:'acidangelfromasia', '∞!':'triples∞!', 'msnz':'msnz'};
 const canon=(v)=>aliases[dec(v)]||dec(v);
 const isTagged=(row,member)=>{
  if(row.kind!=='DIMENSION')return false;
  const artist=canon(row.artist);
  return Array.isArray(member.units)&&member.units.some(unit=>canon(unit)===artist);
 };
 const badge=(text)=>el('span','wa-mu2-source',text);
 let member=null,albums=[],year='ALL',readable=true;
 const read=async(name)=>{const r=await fetch(new URL(name,base),{cache:'no-cache'});if(!r.ok)throw Error(name+': HTTP '+r.status);return r.json()};
 function chooseYear(y){year=y;renderStory();}
 function renderStory(){
   const mount=document.getElementById('waMu2Story');if(!mount)return; mount.replaceChildren();
   const heading=el('div','section-heading');heading.append(el('p','eyebrow','02B · MEMBER JOURNEY'),el('h2','',t().story),el('p','',t().storySub));mount.append(heading);
   if(!member){mount.append(el('div','state',t().noData));return}
   const events=(member.history||[]).map((e,i)=>({...e,origin:i,year:String(e.date||'').slice(0,4)})).filter(e=>/^20\d\d$/.test(e.year));
   const years=[...new Set(events.map(e=>e.year))].sort();
   if(year!=='ALL'&&!years.includes(year))year='ALL';
   const filters=el('div','wa-mu2-years');filters.setAttribute('role','group');filters.setAttribute('aria-label','Year');
   for(const opt of ['ALL',...years]){const b=el('button','wa-mu2-year',opt==='ALL'?t().all:opt);b.type='button';b.setAttribute('aria-pressed',String(year===opt));b.addEventListener('click',()=>chooseYear(opt));filters.append(b)} mount.append(filters);
   const visible=events.filter(e=>year==='ALL'||e.year===year).sort((a,b)=>String(a.date).localeCompare(String(b.date))||a.origin-b.origin);
   const count=el('p','wa-mu2-count',`${visible.length} ${t().count}`);count.setAttribute('aria-live','polite');mount.append(count);
   const list=el('div','wa-mu2-story-grid');
   for(const event of visible){const item=el('article','wa-mu2-story-card');const line=el('div','wa-mu2-meta');line.append(el('time','',event.date||t().date),badge(t().source));item.append(line,el('h3','',event.title||'HISTORY'));
     if(event.description)item.append(el('p','',event.description));list.append(item)}
   mount.append(list,link(t().visit,'#journey'));
 }
 function renderAlbums(){
   const mount=document.getElementById('waMu2Music');if(!mount)return;mount.replaceChildren();
   const heading=el('div','section-heading');heading.append(el('p','eyebrow','01B · DISCOGRAPHY CONNECTION'),el('h2','',t().album),el('p','',t().albumSub));mount.append(heading);
   mount.append(el('p','wa-mu2-warning',t().albumCaution));
   if(!member){mount.append(el('p','wa-mu2-empty',t().noData));return}
   const matched=albums.filter(a=>isTagged(a,member)).sort((a,b)=>String(b.release||'').localeCompare(String(a.release||'')));
   if(matched.length){const wrap=el('div','wa-mu2-album-grid');for(const a of matched.slice(0,LIMIT)){
     const card=el('article','wa-mu2-album-card');card.append(el('small','',`${a.release||a.year} · ${a.region}`),el('h3','',a.title),el('p','',a.artist));
     if(a.focus)card.append(el('span','wa-mu2-album-focus',a.focus));card.append(link(t().seeAlbum,anchor(a.id)));
     wrap.append(card)
   } mount.append(wrap)}else mount.append(el('p','wa-mu2-empty',readable?t().noAlbum:t().noAlbumSource));
   mount.append(el('p','wa-mu2-footnote',t().full),link(t().allAlbum,anchor('discography')));
 }
 function renderNeighbors(){const mount=document.getElementById('waMu2Neighbors');if(!mount)return;mount.replaceChildren();
   const i=Number(id.slice(1)); const list=[i-1,i+1].filter(n=>n>=1&&n<=24);
   for(const n of list){const code='S'+String(n).padStart(2,'0');const target=code.toLowerCase();const item=link(`${n<i?'← '+t().prev:t().next+' →'} · ${code}`,`../${target}/`,'wa-mu2-neighbor');mount.append(item)}
 }
 function addMount(idRef,after){const n=el('section','block wa-mu2-block');n.id=idRef;n.setAttribute('aria-label',idRef);
   if(after.parentNode)after.insertAdjacentElement('afterend',n);return n}
 const dimension=document.getElementById('dimensions'),history=document.getElementById('journey'),footer=document.querySelector('.footer');
 if(!dimension||!history)return;
 addMount('waMu2Music',dimension); addMount('waMu2Story',history);
 if(footer){const nav=el('nav','wa-mu2-neighbors');nav.id='waMu2Neighbors';nav.setAttribute('aria-label','Member navigation');footer.insertAdjacentElement('beforebegin',nav)}
 renderNeighbors();
 const redraw=()=>{renderStory();renderAlbums();renderNeighbors()};
 let scheduled=false;
 new MutationObserver(()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;redraw()})}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 (async()=>{
  try{const data=await read('members.json');member=Array.isArray(data.members)?data.members.find(m=>m.id===id):null}catch{member=null}
  try{const data=await read('discography-index.json');albums=Array.isArray(data.albums)?data.albums:[];readable=albums.length>0}catch{readable=false}
  redraw();
 })();
})();
