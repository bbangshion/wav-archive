/* WAV ARCHIVE · 2026–2027 official calendar. Independent from legacy features. */
(()=>{'use strict';
const root=document.getElementById('wa-calendar-root');if(!root||root.dataset.ready==='1')return;root.dataset.ready='1';
const $=s=>root.querySelector(s);
const translations={
ko:{intro:'2026년 전체 달력부터 2027년까지 · 공식 발표로 확인한 일정만 등록',year:'연도',today:'오늘',all:'전체',tour:'공연',release:'발매',awards:'시상식',offline:'행사',birthday:'생일',mon:'월',daySuffix:'일',has:'등록된 일정',selectedPast:'지난 날짜',selectedToday:'오늘',selectedFuture:'예정',noDay:'이 날짜에 등록된 공식 일정이 없어요',source:'공식 출처 확인 ↗',dateTba:'날짜 미정 · 발표된 발매월만 표시',archiveNote:'2026년 1~12월과 2027년 전체를 탐색할 수 있어요. 일정이 없는 날짜는 활동이 없었다는 뜻이 아니라 아직 확인·등록되지 않았다는 뜻이에요.',verified:'공식 일정은 발표·변경 공지를 대조해 수동 등록합니다. 자동으로 공식 게시물을 수집하지 않습니다.',sourceLast:'마지막 출처 검토',monthOnly:'날짜가 확정되지 않은 발표',count:'건',time:'현지 시간',note:'안내',monthOnlyTime:'공식 날짜 미발표', weekdays:['일','월','화','수','목','금','토']},
en:{intro:'Browse all months of 2026–2027 · verified announcements only',year:'Year',today:'Today',all:'All',tour:'Concerts',release:'Releases',awards:'Awards',offline:'Events',birthday:'Birthdays',mon:'',daySuffix:'',has:'Recorded schedules',selectedPast:'Past date',selectedToday:'Today',selectedFuture:'Upcoming',noDay:'No verified event has been added for this date',source:'Official source ↗',dateTba:'Date TBA · announcement has a month only',archiveNote:'Browse every month in 2026 and 2027. An empty date means that no verified item has been recorded yet, not that tripleS had no activities.',verified:'Schedules are manually checked against official announcements. This site does not automatically ingest official posts.',sourceLast:'Last source review',monthOnly:'Announced without an exact date',count:'events',time:'Local time',note:'Note',monthOnlyTime:'Exact date not announced',weekdays:['Sun','Mon','Tue','Wed','Thu','Fri','Sat']},
ja:{intro:'2026年の全月から2027年まで · 公式発表を確認した予定のみ掲載',year:'年',today:'今日',all:'すべて',tour:'公演',release:'リリース',awards:'授賞式',offline:'イベント',birthday:'誕生日',mon:'月',daySuffix:'日',has:'登録済み予定',selectedPast:'過去の日付',selectedToday:'今日',selectedFuture:'予定',noDay:'この日の確認済み予定はまだ登録されていません',source:'公式情報を見る ↗',dateTba:'日付未定 · 発表された月のみ表示',archiveNote:'2026年と2027年の全ての月を表示できます。予定のない日付は、活動がなかったことを意味しません。',verified:'公式発表を確認して手動で登録します。公式投稿の自動収集ではありません。',sourceLast:'情報の最終確認日',monthOnly:'日付未定の発表',count:'件',time:'現地時間',note:'備考',monthOnlyTime:'正式日程未発表',weekdays:['日','月','火','水','木','金','土']}}
;
let model={events:[],upcomingWithNoDate:[],lastVerified:'2026-10-31'},view={y:2026,m:10,selected:'2026-10-31',filter:'all'};
const nowKST=()=>{const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`};
const iso=(y,m,d)=>`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
const today=nowKST();view.y=Number(today.slice(0,4));view.m=Number(today.slice(5,7));if(view.y<2026){view.y=2026;view.m=1;}if(view.y>2027){view.y=2027;view.m=12;}view.selected=iso(view.y,view.m,Math.min(Number(today.slice(8,10)),new Date(Date.UTC(view.y,view.m,0)).getUTCDate()));
const lang=()=>{const s=(document.documentElement.dataset.language||document.documentElement.lang||'ko').slice(0,2);return translations[s]?s:'ko'};
const t=()=>translations[lang()];
const fullMonth=()=>view.y*12+view.m;
const title=e=>(e.title&&typeof e.title==='object')?(e.title[lang()]||e.title.ko||e.title.en||''):String(e.title||'');
const getBirthdays=()=>{const rows=[];const seen=new Set();document.querySelectorAll('.member-card[data-member]').forEach(el=>{const age=el.querySelector('[data-birth]'),birth=age?.getAttribute('data-birth')||'';if(!/^\d{4}-\d\d-\d\d$/.test(birth))return;const id=el.getAttribute('data-member');if(seen.has(id))return;seen.add(id);const name=(el.querySelector('.member-front-info h3')?.textContent||id).trim(), roman=(el.querySelector('.member-front-info p')?.textContent||id).trim();for(const year of [2026,2027]){rows.push({id:`bd-${id}-${year}`,date:`${year}-${birth.slice(5)}`,category:'birthday',title:{ko:`${name} 생일 🎂`,en:`${roman} birthday 🎂`,ja:`${name} の誕生日 🎂`},sourceOrg:'WAV ARCHIVE · MEMBER DATABASE',status:'biographical'});}});return rows};
let birthdays=[];
const allEvents=()=>[...model.events,...birthdays];
const visible=e=>view.filter==='all'||e.category===view.filter;
const dateEvents=day=>allEvents().filter(e=>e.date===day&&visible(e)).sort((a,b)=>String(a.time||'99').localeCompare(String(b.time||'99')));
function text(node,content){node.textContent=String(content??'');return node}
function mk(tag,cls,txt){const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el}
function formatDate(day){const [y,m,d]=day.split('-').map(Number);if(lang()==='en')return new Intl.DateTimeFormat('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(y,m-1,d)));return `${y}.${String(m).padStart(2,'0')}.${String(d).padStart(2,'0')}`}
function build(){root.replaceChildren();
 const intro=mk('div','wac-intro');intro.append(mk('span','',t().intro));const chip=mk('em','', 'KO / EN / JA');intro.append(chip);root.append(intro);
 const controls=mk('div','wac-ctrls');const nav=mk('div','wac-monthnav');const prev=mk('button','wac-btn','‹');prev.type='button';prev.setAttribute('aria-label','Previous month');prev.dataset.nav='prev';const mn=mk('b','wac-month');mn.id='wac-month';const next=mk('button','wac-btn','›');next.type='button';next.dataset.nav='next';next.setAttribute('aria-label','Next month');nav.append(prev,mn,next);controls.append(nav);
 const year=mk('select','wac-select');year.setAttribute('aria-label',t().year);year.id='wac-year';[2026,2027].forEach(y=>{const op=mk('option','',String(y));op.value=String(y);year.append(op)});controls.append(year);const todayBtn=mk('button','wac-btn',t().today);todayBtn.type='button';todayBtn.dataset.nav='today';controls.append(todayBtn);root.append(controls);
 const filters=mk('div','wac-filters');filters.setAttribute('aria-label','Schedule categories');for(const type of ['all','tour','release','awards','offline','birthday']){const button=mk('button','wac-filter',t()[type]);button.type='button';button.dataset.filter=type;filters.append(button)}root.append(filters);
 const stats=mk('div','wac-stats');stats.id='wac-stats';root.append(stats);
 const box=mk('div','wac-gridbox');const week=mk('div','wac-week');week.setAttribute('aria-hidden','true');t().weekdays.forEach(w=>week.append(mk('span','',w)));box.append(week);const days=mk('div','wac-days');days.setAttribute('role','grid');days.setAttribute('aria-label','Monthly official schedule');days.id='wac-days';box.append(days);root.append(box);
 const detail=mk('section','wac-detail');detail.id='wac-detail';detail.setAttribute('aria-live','polite');root.append(detail);
 const monthOnly=mk('section','wac-monthonly');monthOnly.id='wac-monthonly';root.append(monthOnly);
 const note=mk('p','wac-disclaimer',t().archiveNote+' '+t().verified);root.append(note);
 render();
}
function render(){const n=$('#wac-month');if(!n)return;n.textContent=lang()==='en'?new Intl.DateTimeFormat('en-US',{year:'numeric',month:'long',timeZone:'UTC'}).format(new Date(Date.UTC(view.y,view.m-1,1))):`${view.y}년 ${view.m}월`;
 $('#wac-year').value=String(view.y);root.querySelector('[data-nav="prev"]').disabled=fullMonth()<=2026*12+1;root.querySelector('[data-nav="next"]').disabled=fullMonth()>=2027*12+12;
 root.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===view.filter)));
 const monthN=allEvents().filter(e=>e.date.startsWith(iso(view.y,view.m,1).slice(0,7))&&visible(e)).length;
 const st=$('#wac-stats');st.replaceChildren();const a=mk('span','','● '+t().has+'  ');a.append(mk('b','',monthN+' '+t().count));st.append(a);st.append(mk('span','',`${t().sourceLast}: ${model.lastVerified}`));
 const first=new Date(Date.UTC(view.y,view.m-1,1)).getUTCDay(),last=new Date(Date.UTC(view.y,view.m,0)).getUTCDate();const days=$('#wac-days');days.replaceChildren();for(let i=0;i<Math.ceil((first+last)/7)*7;i++){
   const d=i-first+1,within=d>=1&&d<=last,ds=within?iso(view.y,view.m,d):'';
   const button=mk('button','wac-date');button.type='button';button.setAttribute('role','gridcell');if(!within){button.disabled=true;button.classList.add('is-out');button.setAttribute('aria-hidden','true');days.append(button);continue}
   button.dataset.date=ds;button.setAttribute('aria-selected',String(ds===view.selected));button.setAttribute('aria-label',`${formatDate(ds)} · ${dateEvents(ds).length} ${t().count}`);if(ds===today)button.classList.add('is-today');if(ds<today)button.classList.add('is-past');button.append(mk('span','wac-daynum',String(d)));
   const e=dateEvents(ds);const pipes=mk('div','wac-pips');e.slice(0,3).forEach(item=>{const pip=mk('i','wac-pip '+item.category);pipes.append(pip)});if(!e.length)pipes.append(mk('span','',' '));button.append(pipes);if(e.length>3)button.append(mk('span','wac-count',`+${e.length-3}`));days.append(button);
 }
 renderDetail();renderMonthOnly();}
function detailRow(event){const r=mk('article','wac-event');r.append(mk('span','wac-type '+event.category,t()[event.category]||t().offline));r.append(mk('h4','',title(event)));
 if(event.time)r.append(mk('p','',`${t().time}: ${event.time}${event.timeZone?' '+event.timeZone:''}`));
 if(event.venue||event.city)r.append(mk('p','',[event.venue,event.city].filter(Boolean).join(' · ')));
 if(event.note)r.append(mk('p','',t().note+': '+event.note));
 if(event.sourceUrl&&/^https:\/\//.test(event.sourceUrl)){const a=mk('a','wac-source',t().source);a.href=event.sourceUrl;a.target='_blank';a.rel='noopener noreferrer';a.title=event.sourceOrg||'';r.append(a)}
 return r;
}
function renderDetail(){const detail=$('#wac-detail');detail.replaceChildren();const head=mk('div','wac-detailhead');head.append(mk('b','',formatDate(view.selected)));head.append(mk('span','wac-state',view.selected===today?t().selectedToday:view.selected<today?t().selectedPast:t().selectedFuture));detail.append(head);
 const events=dateEvents(view.selected);if(!events.length){detail.append(mk('p','wac-empty',t().noDay));return;}events.forEach(e=>detail.append(detailRow(e)))}
function renderMonthOnly(){const box=$('#wac-monthonly');box.replaceChildren();const rows=(model.upcomingWithNoDate||[]).filter(e=>e.month===iso(view.y,view.m,1).slice(0,7)&&visible(e));box.hidden=!rows.length;if(!rows.length)return;box.append(mk('h3','',t().monthOnly));rows.forEach(e=>{const article=detailRow(e);article.insertBefore(mk('p','',t().monthOnlyTime),article.querySelector('.wac-source'));box.append(article)});}
root.addEventListener('click',e=>{const nav=e.target.closest('[data-nav]');if(nav){const key=nav.dataset.nav;if(key==='today'){const y=Number(today.slice(0,4));if(y>=2026&&y<=2027){view.y=y;view.m=Number(today.slice(5,7));view.selected=today}}else{const delta=key==='prev'?-1:1;const newM=view.m+delta;if(newM===0){view.y--;view.m=12}else if(newM===13){view.y++;view.m=1}else view.m=newM;view.selected=iso(view.y,view.m,1)}render();return}
 const filt=e.target.closest('[data-filter]');if(filt){view.filter=filt.dataset.filter;render();return}
 const date=e.target.closest('[data-date]');if(date){view.selected=date.dataset.date;render();return}
});
root.addEventListener('change',e=>{if(e.target.id!=='wac-year')return;view.y=Number(e.target.value)===2027?2027:2026;view.selected=iso(view.y,view.m,1);render()});
let languageFrame=0;document.addEventListener('wa:language',()=>{cancelAnimationFrame(languageFrame);languageFrame=requestAnimationFrame(build)});
async function load(){try{const resp=await fetch('./data/wav-official-calendar.json',{cache:'no-cache'});if(!resp.ok)throw new Error('calendar fetch failed');const data=await resp.json();if(!Array.isArray(data.events))throw new Error('bad schedule');model=data;}catch(e){console.warn('WAV calendar: offline schedule unavailable',e);model.events=[];model.upcomingWithNoDate=[];}birthdays=getBirthdays();build();}
load();
})();
