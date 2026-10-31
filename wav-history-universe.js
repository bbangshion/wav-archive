/* WAV ARCHIVE · HISTORY UNIVERSE · progressive enhancement of the existing #timeline.
   Official event records are loaded from the SAME data/wav-official-calendar.json used by the
   official calendar. Older entries are read from the existing on-page TIMELINE/DISCOGRAPHY;
   their historical claims are labeled archive records, not re-certified official facts.
   No legacy handlers, cards, personal storage, member data, calendar or Signal records are altered. */
(()=>{'use strict';
 const section=document.getElementById('timeline');
 if(!section||section.querySelector('#waHistoryUniverse'))return;
 const wrap=section.querySelector(':scope > .wrap');
 if(!wrap)return;
 const legacyGrid=wrap.querySelector(':scope > .timeline-grid');
 const today=(()=>{const d=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const p=Object.fromEntries(d.map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`;})();
 const $=(sel,scope=document)=>scope.querySelector(sel);
 const $$=(sel,scope=document)=>[...scope.querySelectorAll(sel)];
 const make=(tag,cls,content)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(content!==undefined)node.textContent=String(content);return node;};
 const pad=n=>String(n).padStart(2,'0');
 const dateValid=s=>{if(!/^20(?:2\d)-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/.test(s))return false;const d=new Date(s+'T12:00:00Z');return !Number.isNaN(d.valueOf())&&d.toISOString().slice(0,10)===s};
 const LANG={ko:{title:'HISTORY UNIVERSE',sub:'2022년의 시작부터 2027년 발표 일정까지 · 활동과 음반, Gravity, 공연을 하나의 연대표에서',year:'연도',month:'월',all:'전체',allYears:'전체 연도',allMonths:'모든 달',search:'이름·음반·유닛·공연 검색',searchLabel:'연표 검색',official:'공식 일정',archive:'기존 아카이브',release:'발매',tour:'공연',awards:'시상식',offline:'행사',gravity:'Gravity',history:'활동 기록',allTypes:'전체 기록',records:'기록',showMore:'더 보기',empty:'조건에 맞는 기록이 없어요',loading:'공식 일정을 연결하고 있어요',fallback:'공식 일정 파일을 불러오지 못해 기존 아카이브 기록만 보여줘요',last:'공식 일정 출처 검토',policy:'공식 일정은 원문을 연결하고, 기존 연표·음반 데이터는 별도의 아카이브 기록으로 표시합니다. 등록되지 않은 날은 활동이 없었다는 뜻이 아닙니다.',legacy:'기존 TRIPLES TIMELINE 보기',hideLegacy:'기존 연표 접기',calendar:'캘린더 날짜 보기',origin:'기존 기록으로 이동',source:'출처 ↗',albums:'음반 페이지',units:'디멘션',signal:'해당 연도 SIGNAL',future:'발표된 예정',cancelled:'취소',postponed:'연기·변경',monthTba:'정확한 일자 미발표',monthOnly:'월 단위 일정',sourceUnknown:'기존 아카이브 데이터 · 공식 확인 별도',updated:'연결된 기록',noInfo:'원본 설명 없음',yearTitle:'선택한 연도',period:'시기',status:'진행 상태',past:'지난 기록',upcoming:'예정',tryAgain:'다시 불러오기'},
 en:{title:'HISTORY UNIVERSE',sub:'One connected timeline for events, releases, Gravity and milestones · 2022–2027',year:'Year',month:'Month',all:'All',allYears:'All years',allMonths:'All months',search:'Search member, release or event',searchLabel:'Search records',official:'Official schedules',archive:'Existing archive',release:'Releases',tour:'Concerts',awards:'Awards',offline:'Events',gravity:'Gravity',history:'Milestones',allTypes:'All records',records:'records',showMore:'Show more',empty:'No matching records',loading:'Connecting official schedules',fallback:'Schedule file unavailable; existing archive records are still shown',last:'Source review',policy:'Official schedules link to their sources. Existing history/release cards are presented as archive records, not newly verified announcements. Empty dates do not mean no activities.',legacy:'View original timeline',hideLegacy:'Hide original timeline',calendar:'Open calendar date',origin:'View archive record',source:'Source ↗',albums:'Discography',units:'Dimensions',signal:'SIGNAL by year',future:'Announced',cancelled:'Cancelled',postponed:'Postponed / rescheduled',monthTba:'Exact date not announced',monthOnly:'Month-only event',sourceUnknown:'Existing archive · independent verification pending',updated:'Connected records',noInfo:'No description in source',yearTitle:'Selected year',period:'Period',status:'Status',past:'Past',upcoming:'Upcoming',tryAgain:'Retry'},
 ja:{title:'HISTORY UNIVERSE',sub:'2022年から2027年まで · 活動・リリース・Gravity・公演の統合年表',year:'年',month:'月',all:'すべて',allYears:'全年度',allMonths:'すべての月',search:'メンバー・作品・イベントを検索',searchLabel:'年表検索',official:'公式スケジュール',archive:'既存アーカイブ',release:'リリース',tour:'公演',awards:'授賞式',offline:'イベント',gravity:'Gravity',history:'活動記録',allTypes:'全記録',records:'件',showMore:'もっと見る',empty:'該当する記録はありません',loading:'公式情報を接続しています',fallback:'公式スケジュールが読み込めず既存記録のみ表示',last:'情報確認日',policy:'公式予定は原文にリンクし、既存の年表・作品データは別のアーカイブ記録として表示します。未登録の日は活動がなかったことを意味しません。',legacy:'元の年表を見る',hideLegacy:'元の年表を閉じる',calendar:'カレンダーを開く',origin:'元の記録へ',source:'出典 ↗',albums:'作品一覧',units:'DIMENSION',signal:'年別SIGNAL',future:'発表済み',cancelled:'中止',postponed:'延期・変更',monthTba:'正確な日付は未発表',monthOnly:'月のみの予定',sourceUnknown:'既存記録 · 公式確認は別途必要',updated:'登録済み記録',noInfo:'説明未登録',yearTitle:'選択した年',period:'時期',status:'状態',past:'過去',upcoming:'予定',tryAgain:'再読み込み'}};
 const state={year:'2026',month:'all',kind:'all',search:'',limit:18,legacy:false,official:[],monthOnly:[],history:[],disco:[],gravity:[],loading:true,error:false,last:'',total:0};
 const lang=()=>{const v=String(document.documentElement.dataset.language||document.documentElement.lang||'ko').slice(0,2);return LANG[v]?v:'ko';};
 const t=()=>LANG[lang()];
 function clean(s){return String(s||'').replace(/\s+/g,' ').trim();}
 function parseLegacy(){
  const history=[],disco=[],gravity=[];
  $$('.timeline-card',legacyGrid||document).forEach((card,ci)=>{
   const year=Number(clean($('.timeline-year',card)?.textContent));if(year<2022||year>2027)return;
   $$('.timeline-event',card).forEach((entry,ei)=>{
    const original=clean($('.timeline-date',entry)?.textContent);
    const title=clean($('strong',entry)?.textContent);
    if(!title)return;
    const description=clean($('strong',entry)?.parentElement?.querySelector('span')?.textContent);
    const exact=original.match(/^(\d{1,2})\.(\d{1,2})$/);
    const monthRange=original.match(/^(\d{1,2})[–\-](\d{1,2})$/);
    const monthOnly=original.match(/^(\d{1,2})$/);
    let date='',sortKey=`${year}-99-99`,precision='period';
    if(exact){const m=Number(exact[1]),d=Number(exact[2]);const candidate=`${year}-${pad(m)}-${pad(d)}`;if(dateValid(candidate)){date=candidate;sortKey=date;precision='day'}}
    else if(monthRange&&+monthRange[1]>=1&&+monthRange[1]<=12){sortKey=`${year}-${pad(monthRange[1])}-99`;precision='range';}
    else if(monthOnly&&+monthOnly[1]>=1&&+monthOnly[1]<=12){sortKey=`${year}-${pad(monthOnly[1])}-99`;precision='month';}
    history.push({id:`legacy-${year}-${ci}-${ei}`,year,sortKey,date,when:original,precision,category:/gravity/i.test(title)?'gravity':'history',title,description,sourceType:'archive',anchor:'#timeline'});
   });
  });
  $$('.disco-db-card',document.getElementById('discography')||document).forEach((card,i)=>{
   const year=Number(card.dataset.year);if(year<2022||year>2027)return;
   const raw=clean($('.wa-release-date',card)?.textContent);
   const match=raw.match(/(20\d{2})\.(\d{2})\.(\d{2})/);
   if(!match)return;
   const date=`${match[1]}-${match[2]}-${match[3]}`;
   if(!dateValid(date))return;
   const album=clean($('h3',card)?.textContent)||'RELEASE';
   const artist=clean($('.disco-db-artist',card)?.textContent);
   const focus=clean($('.disco-db-focus',card)?.textContent);
   disco.push({id:`discography-${card.id||i}`,year,sortKey:date,date,when:date.slice(5).replace('-','.'),precision:'day',category:'release',title:album,description:[artist,focus].filter(Boolean).join(' · '),sourceType:'archive',anchor:'#'+(card.id||'discography')});
  });
  $$('.gravity-card',document.getElementById('gravity')||document).forEach((card,i)=>{
    const heading=clean($('h3',card)?.textContent);if(!heading)return;
    const note=clean($('.wa83-audit-note',card)?.textContent);
    const dateType=clean($('.gravity-type',card)?.textContent);
    const eventRange=note.match(/(20\d{2})\.(\d{2})\.(\d{2})([–-](?:\d{2}\.)?\d{2})?/);
    const monthRange=dateType.match(/^(20\d{2})\.(\d{2})/);
    const year=eventRange?Number(eventRange[1]):monthRange?Number(monthRange[1]):0;
    if(year<2022||year>2027)return;
    let sortKey=`${year}-99-99`,when=dateType,precision='period',date='';
    if(eventRange){
      const start=`${year}-${eventRange[2]}-${eventRange[3]}`;
      if(dateValid(start)){
        sortKey=start;when=eventRange[0];precision=eventRange[4]?'range':'day';
        if(precision==='day')date=start;
      }
    }else if(monthRange){sortKey=`${year}-${monthRange[2]}-98`;when=dateType;precision='month';}
    gravity.push({id:`legacy-gravity-${i}`,year,sortKey,date,when,precision,category:'gravity',title:heading,description:clean($('.gravity-date',card)?.textContent),sourceType:'archive',anchor:'#gravity',note:/추가 검증 필요/.test(note)?'기존 기록 · 일부 수치 및 투표 구간 추가 검증 필요':''});
  });
  state.history=history;state.disco=disco;state.gravity=gravity;
 }
 function parseOfficial(data){
  if(!data||!Array.isArray(data.events))throw new Error('Bad calendar data');
  const events=[];const ids=new Set();
  for(const e of data.events){if(!e||!dateValid(e.date)||ids.has(e.id))continue;
   ids.add(e.id);
   const title=e.title&&typeof e.title==='object'?e.title:{ko:String(e.title||'')};
   events.push({id:`schedule-${e.id||events.length}`,year:Number(e.date.slice(0,4)),sortKey:e.date,date:e.date,when:e.date.slice(5).replace('-','.'),precision:'day',category:['tour','release','awards','offline'].includes(e.category)?e.category:'offline',title,description:[e.venue,e.city,e.time?`${e.time} ${e.timeZone||''}`.trim():null].filter(Boolean).join(' · '),sourceType:'official',sourceUrl:typeof e.sourceUrl==='string'?e.sourceUrl:'',sourceOrg:clean(e.sourceOrg),status:e.status||'announced',note:clean(e.note)});
  }
  state.official=events;
  state.monthOnly=(Array.isArray(data.upcomingWithNoDate)?data.upcomingWithNoDate:[]).filter(e=>/^20\d{2}-(0[1-9]|1[0-2])$/.test(e.month)).map((e,i)=>({id:`month-${e.id||i}`,year:Number(e.month.slice(0,4)),sortKey:e.month+'-98',date:'',when:e.month,precision:'month',category:e.category||'release',title:e.title||'',description:clean(e.note),sourceType:'official',sourceUrl:e.sourceUrl||'',sourceOrg:clean(e.sourceOrg),status:'month-only',note:clean(e.note)}));
  state.last=clean(data.lastVerified);
 }
 const titleFor=r=>typeof r.title==='object'?(r.title[lang()]||r.title.ko||r.title.en||''):r.title;
 const rows=()=>[...state.history,...state.disco,...state.gravity,...state.official,...state.monthOnly].sort((a,b)=>a.sortKey.localeCompare(b.sortKey)||a.id.localeCompare(b.id));
 const matches=r=>{
  if(state.year!=='all'&&String(r.year)!==state.year)return false;
  if(state.month!=='all'&&r.sortKey.slice(5,7)!==state.month)return false;
  if(state.kind==='official'){if(r.sourceType!=='official')return false;}
  else if(state.kind==='archive'){if(r.sourceType!=='archive')return false;}
  else if(state.kind!=='all'&&r.category!==state.kind)return false;
  const query=state.search.toLocaleLowerCase();return !query||[titleFor(r),typeof r.title==='object'?Object.values(r.title).join(' '):'',r.description,r.when,r.sourceOrg,r.note].join(' ').toLocaleLowerCase().includes(query);
 };
 const root=make('div','wa-hu-root');root.id='waHistoryUniverse';root.setAttribute('aria-label','WAV HISTORY UNIVERSE');
 const head=make('div','wa-hu-head'),hero=make('div','wa-hu-hero');hero.append(make('span','wa-hu-eyebrow','WAV ARCHIVE · CONNECTED RECORDS'),make('h3','wa-hu-heading','HISTORY UNIVERSE'),make('p','wa-hu-sub'));
 const stat=make('div','wa-hu-stat');head.append(hero,stat);root.append(head);
 const controls=make('div','wa-hu-controls');
 const yearNav=make('div','wa-hu-years');yearNav.setAttribute('role','group');yearNav.setAttribute('aria-label','Year');
 const yearItems=[['all','ALL'],...Array.from({length:6},(_,i)=>[String(2022+i),String(2022+i)])];
 for(const [v,label]of yearItems){const b=make('button','wa-hu-year',label);b.type='button';b.dataset.year=v;yearNav.append(b)}
 controls.append(yearNav);
 const filterBar=make('div','wa-hu-filterbar');const kindGroup=make('div','wa-hu-types');kindGroup.setAttribute('role','group');kindGroup.setAttribute('aria-label','Record type');
 for(const k of ['all','official','release','tour','awards','offline','gravity','history','archive']){const b=make('button','wa-hu-type');b.type='button';b.dataset.kind=k;kindGroup.append(b)}
 filterBar.append(kindGroup);
 const searchRow=make('div','wa-hu-searchrow');const search=make('input','wa-hu-search');search.type='search';search.maxLength=90;search.id='waHistorySearch';
 const mon=make('select','wa-hu-month');mon.id='waHistoryMonth';for(const v of ['all',...Array.from({length:12},(_,i)=>pad(i+1))]){const op=make('option','',v);op.value=v;mon.append(op)}
 searchRow.append(search,mon);filterBar.append(searchRow);controls.append(filterBar);root.append(controls);
 const feedback=make('p','wa-hu-feedback');feedback.setAttribute('aria-live','polite');root.append(feedback);
 const result=make('div','wa-hu-results');result.id='waHistoryResults';root.append(result);
 const footer=make('div','wa-hu-footer');const more=make('button','wa-hu-more');more.type='button';more.id='waHistoryMore';const legacyBtn=make('button','wa-hu-legacy');legacyBtn.type='button';legacyBtn.id='waHistoryLegacy';footer.append(more,legacyBtn);root.append(footer);
 const policy=make('p','wa-hu-policy');root.append(policy);
 const sectionHead=wrap.querySelector(':scope > .section-head');if(sectionHead)sectionHead.after(root);else wrap.prepend(root);
 function sourceAnchor(href,text,cls){const a=make('a',cls||'wa-hu-link',text);a.href=href;if(/^https:\/\//.test(href)){a.target='_blank';a.rel='noopener noreferrer'}return a}
 function displayWhen(r){if(r.date)return r.date.replaceAll('-','.');if(r.precision==='month'&&r.when.match(/^20\d{2}-/))return r.when.replace('-','.');return `${r.year}.${r.when||'—'}`}
 function jumpCalendar(date){
  const a=typeof window.WAVConnectionPhase1?.openCalendarDate==='function'?window.WAVConnectionPhase1.openCalendarDate(date):false;
  if(!a){const node=document.getElementById('wa-calendar-root');if(node){node.scrollIntoView({behavior:'smooth',block:'start'});}else location.hash='wa-calendar-root';}
 }
 function renderCard(r){
  const article=make('article','wa-hu-card');article.dataset.date=r.date||'';
  article.dataset.category=r.category;
  const left=make('div','wa-hu-datecol');left.append(make('time','wa-hu-date',displayWhen(r)));if(r.date)left.querySelector('time').dateTime=r.date;
  const kind=t()[r.category]||r.category;left.append(make('span','wa-hu-type-badge wa-hu-cat-'+r.category,kind));
  const right=make('div','wa-hu-main');
  const meta=make('div','wa-hu-meta');meta.append(make('span','wa-hu-origin '+r.sourceType,r.sourceType==='official'?t().official:t().archive));
  const status=r.status==='cancelled'?t().cancelled:r.status==='postponed'?t().postponed:r.status==='month-only'?t().monthTba:'';
  if(status)meta.append(make('span','wa-hu-status wa-hu-status-'+r.status,status));right.append(meta);
  right.append(make('h4','wa-hu-title',titleFor(r)));
  if(r.description)right.append(make('p','wa-hu-desc',r.description));
  if(r.note&&r.note!==r.description)right.append(make('p','wa-hu-note',r.note));
  const actions=make('div','wa-hu-actions');
  if(r.sourceType==='official'){
   if(r.date){const b=make('button','wa-hu-action',t().calendar+' →');b.type='button';b.addEventListener('click',()=>jumpCalendar(r.date));actions.append(b)}
   if(/^https:\/\//.test(r.sourceUrl)){try{const u=new URL(r.sourceUrl);if(u.protocol==='https:')actions.append(sourceAnchor(u.href,t().source))}catch(e){}}
   if(r.category==='release')actions.append(sourceAnchor('#discography',t().albums+' ↗'));
  }else actions.append(sourceAnchor(r.anchor||'#timeline',t().origin+' ↗'));
  if(r.category==='gravity')actions.append(sourceAnchor('#gravity','GRAVITY ↗'));
  if(r.category==='history')actions.append(sourceAnchor('#units',t().units+' ↗'));
  if(r.category==='release'&&r.sourceType!=='official')actions.append(sourceAnchor('#discography',t().albums+' ↗'));
  right.append(actions);article.append(left,right);return article;
 }
 function render(){const i=t();
  $('.wa-hu-sub',root).textContent=i.sub;
  search.placeholder=i.search;search.setAttribute('aria-label',i.searchLabel);
  $$('.wa-hu-type',root).forEach(b=>{b.textContent=b.dataset.kind==='all'?i.allTypes:(i[b.dataset.kind]||b.dataset.kind);b.setAttribute('aria-pressed',String(b.dataset.kind===state.kind))});
  $$('.wa-hu-year',root).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.year===state.year)));
  $$('#waHistoryMonth option',root).forEach((option,n)=>option.textContent=n===0?i.allMonths:(lang()==='en'?String(n):n+i.month));mon.value=state.month;
  const all=rows(),view=all.filter(matches);state.total=view.length;
  stat.replaceChildren();stat.append(make('strong','',String(all.length)),make('span','',i.updated));
  result.replaceChildren();
  const frag=document.createDocumentFragment();for(const r of view.slice(0,state.limit))frag.append(renderCard(r));result.append(frag);
  if(!view.length)result.append(make('p','wa-hu-empty',i.empty));
  more.hidden=view.length<=state.limit;more.textContent=`${i.showMore} · ${Math.min(view.length-state.limit,18)}`;
  legacyBtn.textContent=state.legacy?i.hideLegacy:i.legacy;
  policy.textContent=i.policy;
  const source=state.error?` · ${i.fallback}`:state.loading?` · ${i.loading}`:state.last?` · ${i.last}: ${state.last}`:'';
  feedback.textContent=`${i.records}: ${view.length} / ${all.length}${source}`;
 }
 function update(){state.limit=18;render()}
 root.addEventListener('click',e=>{const year=e.target.closest('button[data-year]');if(year){state.year=year.dataset.year;update();return}
  const type=e.target.closest('button[data-kind]');if(type){state.kind=type.dataset.kind;update();return}
 });
 let debounce=0;search.addEventListener('input',()=>{clearTimeout(debounce);debounce=setTimeout(()=>{state.search=clean(search.value).slice(0,90);update()},140)});
 mon.addEventListener('change',()=>{state.month=mon.value;update()});
 more.addEventListener('click',()=>{state.limit=Math.min(state.total,state.limit+18);render()});
 legacyBtn.addEventListener('click',()=>{state.legacy=!state.legacy;section.classList.toggle('wa-hu-legacy-hidden',!state.legacy);render()});
 let langTimer=0;const rerender=()=>{clearTimeout(langTimer);langTimer=setTimeout(render,20)};
 document.addEventListener('wa:language',rerender);
 const languageWatch=new MutationObserver(rerender);languageWatch.observe(document.documentElement,{attributes:true,attributeFilter:['lang','data-language']});
 async function load(){state.loading=true;render();try{
   const res=await fetch('./data/wav-official-calendar.json',{cache:'no-store'});if(!res.ok)throw new Error('HTTP '+res.status);
   parseOfficial(await res.json());state.error=false;
  }catch(e){state.official=[];state.monthOnly=[];state.error=true;console.warn('[WAV HISTORY UNIVERSE] calendar unavailable; existing history preserved',e.message)}
  state.loading=false;render();
 }
 parseLegacy();
 section.classList.add('wa-hu-legacy-hidden');
 render();load();
 window.WAVHistoryUniverse=Object.freeze({version:'3.0.0',getStats:()=>({official:state.official.length,monthOnly:state.monthOnly.length,history:state.history.length,discography:state.disco.length,gravity:state.gravity.length,visible:state.total,error:state.error}),selectYear(year){if(!['all','2022','2023','2024','2025','2026','2027'].includes(String(year)))return false;state.year=String(year);update();section.scrollIntoView({block:'start',behavior:'smooth'});return true;},refresh:load});
})();
