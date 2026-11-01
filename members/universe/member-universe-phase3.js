/* WAV ARCHIVE · MEMBER UNIVERSE PHASE 3 · SIGNAL EXPLORER
 * Additive only: the original S01–S24 profiles, old SIGNAL cards and Phase 2 are never deleted.
 * Source: existing /signal-moments/data.json; absent members tags are NOT guessed.
 */
(()=>{'use strict';
 const member=document.documentElement.dataset.waMember||'';
 if(!/^S(?:0[1-9]|1\d|2[0-4])$/.test(member)) return;
 const section=document.getElementById('signals');
 if(!section||document.getElementById('waMu3Explorer'))return;
 const currentScript=document.currentScript;
 const base=new URL('./',currentScript?.src||location.href);
 const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href=new URL('member-universe-phase3.css',base);stylesheet.dataset.waMu3Css='1';document.head.appendChild(stylesheet);
 const LANG={
  ko:{title:'멤버별 SIGNAL 탐색',caption:'WAV ARCHIVE에 멤버 태그가 명시된 공식 영상 링크만 보여줍니다. 태그가 없는 영상은 미출연을 뜻하지 않습니다',total:'태그된 영상',source:'기준 데이터',kinds:'영상 유형',year:'연도',search:'제목·태그 검색',sort:'정렬',all:'전체',newest:'최신순',oldest:'오래된순',show:'더 보기',watch:'내부에서 재생',external:'YouTube에서 보기 ↗',close:'재생 닫기',empty:'조건에 맞는 영상이 없습니다',untagged:'이 멤버의 태그가 등록된 영상이 없습니다 · 전체 SIGNAL 아카이브에서 확인해 주세요',fail:'SIGNAL 데이터를 불러오지 못했습니다. 기존 목록과 전체 아카이브를 이용할 수 있습니다',sourceNote:'출연 분류: WAV ARCHIVE 메타데이터 · 공식 출연 명단의 완전한 검증이 아닙니다',allVideo:'SIGNAL 전체 탐색 ↗',count:'건',embedNote:'재생이 제한된 영상은 YouTube에서 확인해 주세요',loading:'멤버 영상 불러오는 중…',filtered:'검색 결과',of:'총',noEmbed:'해당 영상은 외부 YouTube 링크로 열어 주세요'},
  en:{title:'Member SIGNAL explorer',caption:'Videos with explicit member tags in WAV ARCHIVE only. Untagged videos do not imply this member was absent',total:'Tagged videos',source:'Catalog snapshot',kinds:'Video type',year:'Year',search:'Search titles and tags',sort:'Sort',all:'All',newest:'Newest first',oldest:'Oldest first',show:'Load more',watch:'Play here',external:'Open on YouTube ↗',close:'Close player',empty:'No matching videos',untagged:'No videos tagged for this member yet · Browse the complete SIGNAL archive',fail:'Cannot load SIGNAL records. The original list and main archive remain available',sourceNote:'Member tags are WAV ARCHIVE metadata, not fully verified official cast credits',allVideo:'All SIGNAL videos ↗',count:'videos',embedNote:'If playback is restricted, open the video on YouTube',loading:'Loading member videos…',filtered:'Matching videos',of:'of',noEmbed:'This video can be opened on YouTube'},
  ja:{title:'メンバー別SIGNAL検索',caption:'WAV ARCHIVEでメンバータグが明記された公式動画リンクのみ表示。タグなしは未出演を意味しません',total:'タグ付き動画',source:'登録データ',kinds:'動画タイプ',year:'年',search:'タイトル・タグを検索',sort:'並べ替え',all:'すべて',newest:'新しい順',oldest:'古い順',show:'もっと見る',watch:'ここで再生',external:'YouTubeで見る ↗',close:'再生を閉じる',empty:'該当する動画がありません',untagged:'このメンバーのタグ付き動画は未登録です · 全SIGNALから探してください',fail:'SIGNAL記録を読み込めません。既存一覧と全体アーカイブは利用できます',sourceNote:'出演タグはWAV ARCHIVE独自データであり、公式出演者情報の完全な照合ではありません',allVideo:'SIGNAL一覧 ↗',count:'本',embedNote:'再生できない場合はYouTubeで確認してください',loading:'動画を読み込み中…',filtered:'検索結果',of:'全',noEmbed:'この動画はYouTubeで開いてください'}
 };
 const loc=()=>LANG[document.documentElement.lang]||LANG.ko;
 const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e};
 const srcLink=id=>'https://www.youtube.com/watch?v='+id;
 const input=document.createElement('input');input.type='search';input.id='waMu3Query';input.autocomplete='off';input.spellcheck=false;input.maxLength=100;
 const kind=document.createElement('select');kind.id='waMu3Kind';
 const year=document.createElement('select');year.id='waMu3Year';
 const sort=document.createElement('select');sort.id='waMu3Sort';
 const wrap=node('div','wa-mu3-explorer');wrap.id='waMu3Explorer';
 const headline=node('div','wa-mu3-head');const title=node('h3','wa-mu3-title');const count=node('span','wa-mu3-count');headline.append(title,count);
 const caption=node('p','wa-mu3-caption');const controls=node('div','wa-mu3-controls');
 const makeLabel=(element)=>{const label=node('label','wa-mu3-field');const name=node('span','wa-mu3-field-label');label.append(name,element);controls.append(label);return name};
 const searchName=makeLabel(input),kindName=makeLabel(kind),yearName=makeLabel(year),sortName=makeLabel(sort);
 const summary=node('div','wa-mu3-summary');summary.setAttribute('role','status');summary.setAttribute('aria-live','polite');
 const cards=node('div','wa-mu3-list');const more=node('button','wa-mu3-more');more.type='button';more.hidden=true;
 const foot=node('p','wa-mu3-footnote');const nav=node('a','wa-mu3-all');nav.href=`../../signal-moments/index.html?wamember=${encodeURIComponent(member)}`;
 wrap.append(headline,caption,controls,summary,cards,more,foot,nav);
 const originalStatus=document.getElementById('signalStatus');
 if(originalStatus?.parentNode===section)section.insertBefore(wrap,originalStatus);
 else section.append(wrap);
 let videos=[],catalogCount=0,loaded=false,failed=false,visible=8,filterType='ALL',filterYear='ALL',order='newest',query='',kinds=[],years=[];
 const dialog=document.createElement('dialog');dialog.className='wa-mu3-dialog';dialog.setAttribute('aria-label','YouTube SIGNAL video');
 const modalWrap=node('div','wa-mu3-dialog-inner');const modalClose=node('button','wa-mu3-close');modalClose.type='button';
 const frameHolder=node('div','wa-mu3-player');const modalFoot=node('p','wa-mu3-dialog-foot');const modalLink=node('a','wa-mu3-youtube');modalLink.target='_blank';modalLink.rel='noopener noreferrer';
 modalWrap.append(modalClose,frameHolder,modalFoot,modalLink);dialog.append(modalWrap);document.body.append(dialog);
 let activeTrigger=null;
 function stop(){frameHolder.replaceChildren();activeTrigger?.focus?.();activeTrigger=null}
 modalClose.addEventListener('click',()=>{stop();dialog.close()});dialog.addEventListener('close',stop);
 dialog.addEventListener('click',e=>{if(e.target===dialog){stop();dialog.close()}});
 function play(video,trigger){
   activeTrigger=trigger;frameHolder.replaceChildren();modalLink.href=srcLink(video.videoId);modalLink.textContent=loc().external;modalFoot.textContent=loc().embedNote;modalClose.textContent=loc().close;
   if(video.embeddable!==false){
     const iframe=document.createElement('iframe');iframe.title=String(video.title||'tripleS SIGNAL');iframe.loading='eager';iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';iframe.allowFullscreen=true;
     iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.src=`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&playsinline=1&rel=0`;
     frameHolder.append(iframe);
   }else{frameHolder.append(node('p','wa-mu3-no-embed',loc().noEmbed))}
   if(typeof dialog.showModal==='function'){try{dialog.showModal()}catch{dialog.setAttribute('open','')}}else dialog.setAttribute('open','');
 }
 function safeVideo(v){return v&&/^[a-zA-Z0-9_-]{11}$/.test(String(v.videoId||''))&&Array.isArray(v.members)&&v.members.includes(member)&&/^20\d\d-\d\d-\d\d$/.test(String(v.date||''))}
 function filteredList(){let rows=videos.filter(v=>(filterType==='ALL'||v.kind===filterType)&&(filterYear==='ALL'||String(v.date).startsWith(filterYear)));
   if(query){const term=query.normalize('NFKC').toLocaleLowerCase();rows=rows.filter(v=>(String(v.title||'')+' '+(v.tags||[]).join(' ')).normalize('NFKC').toLocaleLowerCase().includes(term))}
   return rows.sort((a,b)=>(order==='newest'?-1:1)*(String(a.date).localeCompare(String(b.date))||String(a.videoId).localeCompare(String(b.videoId))))
 }
 function options(select,values,current){select.replaceChildren();for(const [value,label] of values){const opt=new Option(label,value);select.add(opt)}select.value=current}
 function translate(){const t=loc();title.textContent=t.title;caption.textContent=t.caption;searchName.textContent=t.search;kindName.textContent=t.kinds;yearName.textContent=t.year;sortName.textContent=t.sort;input.placeholder=t.search;more.textContent=t.show;foot.textContent=t.sourceNote;nav.textContent=t.allVideo;modalClose.textContent=t.close;modalLink.textContent=t.external;modalFoot.textContent=t.embedNote;
   options(kind,[['ALL',t.all],...kinds.map(x=>[x,x])],filterType);
   options(year,[['ALL',t.all],...years.map(x=>[x,x])],filterYear);
   options(sort,[['newest',t.newest],['oldest',t.oldest]],order);
   count.textContent=loaded?`${member} · ${videos.length} ${t.count}`:member;
 }
 function render(){translate();const t=loc();cards.replaceChildren();
   if(!loaded){summary.textContent=failed?t.fail:t.loading;more.hidden=true;return}
   const rows=filteredList();const shown=rows.slice(0,visible);
   summary.textContent=videos.length===0?t.untagged:`${t.filtered} ${rows.length} ${t.count} · ${t.of} ${videos.length} ${t.total} · ${t.source} ${catalogCount}`;
   if(!shown.length){cards.append(node('p','wa-mu3-empty',videos.length===0?t.untagged:t.empty))}
   const fragment=document.createDocumentFragment();for(const item of shown){const article=node('article','wa-mu3-video');
     const thumbnail=node('div','wa-mu3-thumb');const img=document.createElement('img');img.src=`https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`;img.loading='lazy';img.decoding='async';img.width=480;img.height=270;img.alt='';img.addEventListener('error',()=>img.remove(),{once:true});thumbnail.append(img);
     const playBtn=node('button','wa-mu3-play',item.embeddable===false?'↗':'▶');playBtn.type='button';playBtn.setAttribute('aria-label',item.embeddable===false?t.external:`${t.watch}: ${item.title||'SIGNAL'}`);
     playBtn.addEventListener('click',()=>item.embeddable===false?window.open(srcLink(item.videoId),'_blank','noopener,noreferrer'):play(item,playBtn));thumbnail.append(playBtn);
     const body=node('div','wa-mu3-video-body');const meta=node('small','wa-mu3-video-meta',`${item.date} · ${item.kind||'SIGNAL'}`);
     const name=node('h4','wa-mu3-video-title',item.title||'SIGNAL');const actions=node('div','wa-mu3-actions');
     const external=node('a','wa-mu3-external',t.external);external.href=srcLink(item.videoId);external.target='_blank';external.rel='noopener noreferrer';actions.append(external);
     if(item.embeddable!==false){const inner=node('button','wa-mu3-watch',t.watch);inner.type='button';inner.addEventListener('click',()=>play(item,inner));actions.prepend(inner)}
     body.append(meta,name,actions);article.append(thumbnail,body);fragment.append(article)}cards.append(fragment);
   more.hidden=rows.length<=visible;more.disabled=false;
 }
 function setup(episodes){const seen=new Set();videos=episodes.filter(safeVideo).filter(v=>{if(seen.has(v.videoId))return false;seen.add(v.videoId);return true});catalogCount=episodes.length;
   kinds=[...new Set(videos.map(v=>String(v.kind||'SIGNAL')))].sort();years=[...new Set(videos.map(v=>String(v.date).slice(0,4)))].sort().reverse();loaded=true;failed=false;
   section.dataset.waMu3Ready='1';
   document.getElementById('signalStatus')?.setAttribute('aria-hidden','true');
   document.getElementById('signalItems')?.setAttribute('aria-hidden','true');render();
 }
 input.addEventListener('input',()=>{query=input.value.trim();visible=8;render()});
 kind.addEventListener('change',()=>{filterType=kind.value;visible=8;render()});
 year.addEventListener('change',()=>{filterYear=year.value;visible=8;render()});
 sort.addEventListener('change',()=>{order=sort.value;visible=8;render()});
 more.addEventListener('click',()=>{visible+=8;render()});
 const mo=new MutationObserver(()=>render());mo.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 async function boot(){if(loaded)return;summary.textContent=loc().loading;try{const res=await fetch(new URL('../../signal-moments/data.json',base),{cache:'no-cache'});if(!res.ok)throw Error('HTTP '+res.status);const data=await res.json();if(!Array.isArray(data.episodes))throw Error('Invalid SIGNAL records');setup(data.episodes)}catch(err){failed=true;render();console.warn('MEMBER UNIVERSE phase3: original SIGNAL list preserved',err)}}
 if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){io.disconnect();boot()}},{rootMargin:'380px'});io.observe(section)}else boot();
})();
