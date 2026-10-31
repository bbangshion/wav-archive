/* WAV ARCHIVE · CONNECTION ENGINE / SEARCH OS 1st-stage extension
 * Additive only: leaves the existing Search OS, flip cards, data systems and storage untouched.
 * Confirmed member-SIGNAL relations require episodes[].members; events require verified data.
 */
(()=>{'use strict';
  const VERSION='1.0.0';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const layer=$('#waSearchLayer'), input=$('#waGlobalSearch'), results=$('#waSearchResults');
  if(!layer||!input||!results||window.WAVConnectionPhase1)return;
  const MEMBER_ID=/^S(?:0[1-9]|1\d|2[0-4])$/;
  const ISO=/^20(?:26|27)-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;
  const VIDEO_ID=/^[\w-]{11}$/;
  const KO_INITIALS='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
  const normalize=s=>String(s??'').normalize('NFKC').toLocaleLowerCase().replace(/\s+/g,' ').trim();
  const squash=s=>normalize(s).replace(/[\s.,:;_\-\/()\[\]{}]+/g,'');
  const initials=s=>Array.from(String(s||'')).map(ch=>{const x=ch.charCodeAt(0)-44032;return x>=0&&x<11172?KO_INITIALS[Math.floor(x/588)]:ch}).join('');
  const lang=()=>{const v=String(document.documentElement.dataset.language||document.documentElement.lang||'ko').slice(0,2).toLowerCase();return ['ko','en','ja'].includes(v)?v:'ko'};
  const TXT={
    ko:{title:'CONNECTED RECORDS',desc:'기존 아카이브와 연결된 확인 가능한 기록',member:'멤버 연결',unit:'참여 디멘션',signal:'SIGNAL · 출연 정보 등록 영상',event:'공식 일정',birthday:'생일',allSignal:'SIGNAL에서 전체 보기',source:'출처 확인',note:'SIGNAL은 출연 멤버가 명시된 영상만 연결합니다. 미분류 영상은 제외됩니다',more:'더 보기',loading:'연결 데이터 불러오는 중',unavailable:'연결 데이터 일부를 불러오지 못했습니다',none:'추가 연결 기록 없음',go:'바로가기',fallback:'캘린더로 이동'},
    en:{title:'CONNECTED RECORDS',desc:'Cross-links backed by existing records',member:'Member',unit:'Dimension records',signal:'SIGNAL · attributed appearances',event:'Official calendar',birthday:'Birthday',allSignal:'Explore all SIGNAL',source:'View source',note:'Only videos with explicit member metadata are linked; untagged videos are not excluded from the main explorer',more:'More',loading:'Loading linked data',unavailable:'Some linked data could not be loaded',none:'No additional linked records',go:'Open',fallback:'Open calendar'},
    ja:{title:'CONNECTED RECORDS',desc:'既存の記録に基づく関連情報',member:'メンバー',unit:'参加ディメンション',signal:'SIGNAL · 出演情報登録済み',event:'公式スケジュール',birthday:'誕生日',allSignal:'SIGNALをすべて見る',source:'情報元',note:'メンバー情報が明記された動画のみ関連付けます。未分類動画はSIGNAL本体に残ります',more:'もっと見る',loading:'関連データを読み込み中',unavailable:'一部の関連データを読み込めませんでした',none:'追加の関連情報なし',go:'見る',fallback:'カレンダーへ'}
  };
  const txt=()=>TXT[lang()];
  const members=$$('#memberGrid .member-card[data-member][data-name]').map(el=>{
    const id=String(el.dataset.member||'').toUpperCase();
    const names=String(el.dataset.name||'').trim().split(/\s+/);
    return {id,ko:names[0]||id,en:names.slice(1).join(' '),units:String(el.dataset.units||'').split('|').map(s=>s.trim()).filter(Boolean),el,birth:el.querySelector('[data-birth]')?.getAttribute('data-birth')||''};
  }).filter(m=>MEMBER_ID.test(m.id));
  const byId=new Map(members.map(m=>[m.id,m]));
  let calendar=[],videos=[],errors=[],loaded=false,loading=null,timer=0,lastKey='';
  const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e};
  function findMember(query){
    const q=normalize(query),v=squash(q),matched=members.filter(m=>{
      const ko=squash(m.ko),en=squash(m.en),id=squash(m.id);
      return v===id||v===ko||v===en|| (v.length>=2&&v===squash(initials(m.ko)));
    });
    return matched.length===1?matched[0]:null;
  }
  const terms=s=>normalize(s).split(/\s+/).filter(Boolean);
  const contains=(value,query)=>terms(query).every(q=>normalize(value).includes(q)||squash(value).includes(squash(q)));
  const localTitle=e=>typeof e.title==='object'?(e.title?.[lang()]||e.title?.ko||e.title?.en||''):String(e.title||'');
  const eventIndex=e=>[e.date,e.category,e.venue,e.city,e.note,e.sourceOrg,...(typeof e.title==='object'?Object.values(e.title):[e.title])].filter(Boolean).join(' ');
  const videoIndex=v=>[v.title,v.summary,v.kind,v.date,...v.tags,...v.members.map(id=>{const m=byId.get(id);return m?`${m.id} ${m.ko} ${m.en}`:id})].filter(Boolean).join(' ');
  async function load(){
    if(loaded||loading)return loading;
    loading=(async()=>{
      const urls=['./data/wav-official-calendar.json','./signal-moments/data.json'];
      const requests=await Promise.allSettled(urls.map(async url=>{const r=await fetch(new URL(url,location.href),{cache:'no-cache'});if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}));
      if(requests[0].status==='fulfilled'){
        calendar=(Array.isArray(requests[0].value?.events)?requests[0].value.events:[]).filter(e=>e&&ISO.test(e.date)&&['tour','release','awards','offline','birthday'].includes(e.category))
          .map(e=>({...e,_index:normalize(eventIndex(e))}));
      }else errors.push('calendar');
      if(requests[1].status==='fulfilled'){
        const raw=Array.isArray(requests[1].value?.episodes)?requests[1].value.episodes:[];
        const seen=new Set();videos=raw.filter(e=>e&&VIDEO_ID.test(e.videoId)&&!seen.has(e.videoId)&&seen.add(e.videoId))
          .map(e=>({videoId:e.videoId,title:String(e.title||'SIGNAL').slice(0,200),date:String(e.date||''),kind:String(e.kind||'SIGNAL'),members:Array.isArray(e.members)?e.members.filter(id=>byId.has(id)):[],tags:Array.isArray(e.tags)?e.tags.filter(x=>typeof x==='string').slice(0,12):[],summary:String(e.summary||'').slice(0,200)}));
        videos.forEach(v=>{v._index=normalize(videoIndex(v));});
      }else errors.push('signal');
      loaded=true;
      update();
    })().catch(()=>{loaded=true;errors.push('connection');update()});
    return loading;
  }
  function closeSearch(){const x=$('#waSearchClose');if(x)x.click();else{layer.classList.remove('open');layer.setAttribute('aria-hidden','true')}}
  function scrollTarget(target){if(!target)return;closeSearch();window.setTimeout(()=>{
    target.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  },85)}
  function signalHref({member,query}={}){const url=new URL('./signal-moments/index.html',location.href);if(member)url.searchParams.set('wamember',member.id);if(query)url.searchParams.set('waq',String(query).slice(0,160));return url.href}
  function jumpToDate(date){
    if(!ISO.test(date))return false;
    const root=$('#wa-calendar-root');if(!root){return false}
    closeSearch();
    const go=()=>{
      const sel=$('#wac-year',root);
      if(!sel)return false;
      const desiredYear=Number(date.slice(0,4)),desiredMonth=Number(date.slice(5,7));
      if(Number(sel.value)!==desiredYear){sel.value=String(desiredYear);sel.dispatchEvent(new Event('change',{bubbles:true}));}
      const getMonth=()=>{const s=$('#wac-month',root)?.textContent||'';const ko=s.match(/(\d{4})년\s*(\d{1,2})월/);if(ko)return Number(ko[2]);try{const time=new Date(`${desiredYear}-${String(desiredMonth).padStart(2,'0')}-01T00:00:00Z`);for(let m=1;m<=12;m++){if(s.includes(new Intl.DateTimeFormat('en-US',{year:'numeric',month:'long',timeZone:'UTC'}).format(new Date(Date.UTC(desiredYear,m-1,1)))))return m;}}catch{}return desiredMonth};
      let current=getMonth();let hops=0;
      while(current!==desiredMonth&&hops<12){const direction=current<desiredMonth?'next':'prev';const b=root.querySelector(`[data-nav="${direction}"]`);if(!b||b.disabled)break;b.click();current=getMonth();hops++;}
      if(root.querySelector('[data-filter="all"]'))root.querySelector('[data-filter="all"]').click();
      const day=root.querySelector(`[data-date="${date}"]`);if(day)day.click();
      root.scrollIntoView({block:'start',behavior:'auto'});
      if(day)window.setTimeout(()=>$('#wac-detail',root)?.scrollIntoView({block:'center',behavior:'smooth'}),150);
      return !!day;
    };
    if(go())return true;
    window.setTimeout(go,350);return true;
  }
  function itemLink(label,detail,tag,cb){const a=make('button','wacx-row');a.type='button';
    const mark=make('span','wacx-tag',tag);const main=make('span','wacx-text');main.append(make('strong','',label),make('small','',detail));a.append(mark,main,make('span','wacx-go','↗'));a.addEventListener('click',cb);return a;
  }
  function heading(title,count){const h=make('div','wacx-grouphead');h.append(make('b','',title),make('span','',String(count)));return h}
  function group(panel,label,count){const div=make('section','wacx-group');div.append(heading(label,count));panel.append(div);return div}
  function getBirthdays(member){if(!/^\d{4}-\d{2}-\d{2}$/.test(member.birth))return [];
    return [2026,2027].map(y=>({date:y+member.birth.slice(4),category:'birthday',title:{ko:`${member.ko} 생일`,en:`${member.en||member.ko} birthday`,ja:`${member.ko} の誕生日`},status:'biographical'}))}
  function renderSearch(panel,query){
    panel.replaceChildren();const text=txt();const member=findMember(query);const q=normalize(query);
    panel.append(make('div','wacx-title',text.title));
    if(!loaded){panel.append(make('p','wacx-status',text.loading));return}
    if(errors.length)panel.append(make('p','wacx-status',text.unavailable));
    const events=member?
      [...calendar.filter(e=>Array.isArray(e.members)&&e.members.includes(member.id)),...getBirthdays(member)]:
      calendar.filter(e=>contains(e._index,q));
    const signals=(member?videos.filter(e=>e.members.includes(member.id)):videos.filter(e=>contains(e._index,q)))
      .sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
    if(member){
      const mgroup=group(panel,text.member,'S'+member.id.slice(1));
      const intro=itemLink(`${member.id} · ${member.ko}`,`${member.en} · ${member.units.length} ${text.unit}`,'S',()=>{
        if(typeof window.WAVConnect17?.open==='function'){closeSearch();window.setTimeout(()=>window.WAVConnect17.open(member.id),120)}else scrollTarget(member.el)
      });mgroup.append(intro);
      if(member.units.length){const pills=make('div','wacx-units');for(const unit of member.units.slice(0,12)){
        const b=make('button','wacx-pill',unit);b.type='button';b.addEventListener('click',()=>{
          const cards=$$('#units .unit-card,.units .unit-card');const target=cards.find(el=>squash(el.querySelector('h3,h4')?.textContent||'')===squash(unit));scrollTarget(target||$('#units'));
        });pills.append(b)
      }mgroup.append(pills)}
    }
    if(events.length){const eventGroup=group(panel,text.event,events.length);
      events.sort((a,b)=>a.date.localeCompare(b.date)).slice(0,4).forEach(e=>{eventGroup.append(itemLink(localTitle(e),e.date+' · '+(e.venue||e.city||e.sourceOrg||''),'📅',()=>jumpToDate(e.date)))});
      if(events.length>4){const p=make('p','wacx-status',`${events.length-4}+`);eventGroup.append(p)}
    }
    if(signals.length){const sgroup=group(panel,text.signal,member?videos.filter(v=>v.members.includes(member.id)).length:videos.filter(v=>contains(v._index,q)).length);
      signals.forEach(v=>sgroup.append(itemLink(v.title,`${v.date} · ${v.kind}`,'▶',()=>{closeSearch();location.assign(signalHref({query:v.title.split('|')[0].trim().slice(0,65)}))})));
      const all=make('a','wacx-all',text.allSignal+' ↗');all.href=signalHref(member?{member}:{query});sgroup.append(all);
    }
    if(member||events.length||signals.length){panel.append(make('p','wacx-foot',text.note))}
    else {panel.append(make('p','wacx-status',text.none))}
  }
  function update(){
    const q=input.value.trim();const panel=$('#wacx-panel',results);
    if(!q||q.length>100){if(panel)panel.remove();return}
    if(!layer.classList.contains('open'))return;
    if(panel){renderSearch(panel,q);return}
    const add=make('section','wacx-panel');add.id='wacx-panel';add.setAttribute('aria-label','Linked archive records');results.prepend(add);renderSearch(add,q);
  }
  // Old Search OS owns the result list. Observe only its direct children and add a separate
  // group after each legacy render; never replace or intercept legacy result handlers.
  const observer=new MutationObserver(()=>{
    if(!input.value.trim()||!layer.classList.contains('open'))return;
    if(!$('#wacx-panel',results))update();
  });observer.observe(results,{childList:true});
  const layerObserver=new MutationObserver(()=>{if(layer.classList.contains('open')){load();if(input.value.trim())update()}});
  layerObserver.observe(layer,{attributes:true,attributeFilter:['class']});
  // Existing search captures the input event. Document capture runs before its listener.
  document.addEventListener('input',e=>{if(e.target===input){window.clearTimeout(timer);timer=window.setTimeout(update,110)}},true);
  document.addEventListener('wa:language',()=>{window.setTimeout(update,40)});
  window.WAVConnectionPhase1=Object.freeze({version:VERSION,search(query){input.value=String(query||'');input.dispatchEvent(new Event('input',{bubbles:true}));const open=$('#waSearchOpen');if(!layer.classList.contains('open')&&open)open.click();load()},openCalendarDate:jumpToDate,getStats:()=>Object.freeze({memberCount:members.length,calendarCount:calendar.length,signalCount:videos.length,signalTagged:videos.filter(v=>v.members.length>0).length,dataLoaded:loaded,errors:[...errors]})});
  if(layer.classList.contains('open'))load();
})();

/* WAV ARCHIVE | MEMBER PREMIUM 2.1
   Independent optional view switch: never replaces original card markup,
   click/flip handlers, member data, filter handlers, or dialogs. */
(()=>{
  'use strict';
  const init=()=>{
    const grid=document.getElementById('memberGrid');
    if(!grid || !grid.classList.contains('member-grid') || grid.dataset.wa21ViewInit==='1')return;
    const section=grid.closest('#members');
    if(!section)return;
    grid.dataset.wa21ViewInit='1';
    const bar=document.createElement('div');
    bar.className='wa21-member-viewbar';
    bar.setAttribute('role','group');
    const label=document.createElement('span');
    label.className='wa21-member-viewtitle';
    const buttons=document.createElement('div');
    buttons.className='wa21-member-viewchoices';
    const gridButton=document.createElement('button');
    gridButton.type='button';gridButton.dataset.wa21View='grid';
    const wideButton=document.createElement('button');
    wideButton.type='button';wideButton.dataset.wa21View='wide';
    buttons.append(gridButton,wideButton);
    bar.append(label,buttons);
    grid.before(bar);
    const translations={
      ko:{group:'멤버 카드 보기',label:'카드 보기 방식',grid:'2열',wide:'크게 보기'},
      en:{group:'Member card layout',label:'Card layout',grid:'Grid',wide:'Large'},
      ja:{group:'メンバーカード表示',label:'カード表示',grid:'2列',wide:'大きく'}
    };
    function lang(){const value=(document.documentElement.dataset.language||document.documentElement.lang||'ko').toLowerCase();return value.startsWith('ja')?'ja':value.startsWith('en')?'en':'ko';}
    function localize(){const t=translations[lang()];label.textContent=t.label;bar.setAttribute('aria-label',t.group);gridButton.textContent=t.grid;wideButton.textContent=t.wide;gridButton.setAttribute('aria-label',t.grid);wideButton.setAttribute('aria-label',t.wide);}
    let mode='grid';
    try{mode=localStorage.getItem('wa_member_card_view_21')==='wide'?'wide':'grid';}catch(_){mode='grid';}
    function apply(next){
      mode=next==='wide'?'wide':'grid';
      grid.classList.toggle('wa21-member-wide',mode==='wide');
      gridButton.setAttribute('aria-pressed',String(mode==='grid'));
      wideButton.setAttribute('aria-pressed',String(mode==='wide'));
      try{localStorage.setItem('wa_member_card_view_21',mode);}catch(_){}
    }
    gridButton.addEventListener('click',()=>apply('grid'));
    wideButton.addEventListener('click',()=>apply('wide'));
    localize();apply(mode);
    // React only to language attribute changes; no continuous observers/RAF.
    const observer=new MutationObserver(changes=>{
      if(changes.some(c=>c.attributeName==='lang'||c.attributeName==='data-language'))localize();
    });
    observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang','data-language']});
    window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();


/* WAV ARCHIVE | MEMBER DETAIL 2.1 reliability hotfix
   Delegates only DETAIL clicks. No card markup, underlying flip, history,
   favorites, search, or persistent data are modified. */
(()=>{
  'use strict';
  function initialize(){
    const grid=document.getElementById('memberGrid');
    if(!grid || grid.dataset.wa21DetailFix==='1')return;
    grid.dataset.wa21DetailFix='1';
    const ID=/^S(?:0[1-9]|1\d|2[0-4])$/;
    function openDetail(card){
      const memberId=String(card?.dataset.member||'').toUpperCase();
      if(!ID.test(memberId))return;
      const modal=document.getElementById('wa65DetailModal');
      const body=document.getElementById('wa65DetailBody');
      const show=()=>{
        /* Prefer the existing verified-detail engine. */
        try{
          if(typeof window.WA65?.member==='function')window.WA65.member(memberId);
        }catch(err){console.warn('[WAV MEMBER DETAIL] Existing detail handler error',err);}
        if(modal && body && (!modal.classList.contains('on') || !body.textContent.trim())){
          /* Fallback only if the original detail engine did not display content.
             Use existing card data; never invent connections. */
          const raw=String(card.dataset.name||'').trim();
          const name=raw.split(/\s+/)[0]||memberId;
          const units=String(card.dataset.units||'').split('|').map(s=>s.trim()).filter(Boolean);
          body.replaceChildren();
          const header=document.createElement('div');header.className='wa65-eyebrow';
          header.textContent='MEMBER DETAIL · WAV ARCHIVE';
          const title=document.createElement('h2');title.textContent=memberId+' · '+name;
          const label=document.createElement('p');label.className='wa65-sub';
          label.textContent='멤버 프로필과 등록된 디멘션 정보';
          const section=document.createElement('div');section.className='wa65-section';
          const cap=document.createElement('small');cap.textContent='CONNECTED DIMENSIONS · '+units.length;
          const chips=document.createElement('div');chips.className='wa65-chips';
          units.forEach(u=>{const span=document.createElement('span');span.className='wa65-chip';span.textContent=u;chips.append(span)});
          section.append(cap,chips);body.append(header,title,label,section);
          modal.classList.add('on');modal.setAttribute('aria-hidden','false');
          document.documentElement.style.overflow='hidden';
        }
        if(modal?.classList.contains('on')){
          modal.setAttribute('aria-hidden','false');
          const sheet=modal.querySelector('.wa65-sheet');
          if(sheet)sheet.scrollTop=0;
        }
      };
      // Avoid sync scroll / 3D layer commit and modal paint in the same frame.
      if(typeof requestAnimationFrame==='function')requestAnimationFrame(show);
      else setTimeout(show,0);
    }
    // Capture DETAIL only; prevent competing legacy flip or global click handlers
    // from immediately swallowing the action. All other controls stay native.
    grid.addEventListener('click',event=>{
      const target=event.target;
      if(!(target instanceof Element))return;
      let button=target.closest('.member-back > .wa65-open-member');
      let card=button?.closest('.member-card[data-member]');
      if(!button){
        // Android 3D hit-testing sometimes targets the back face under DETAIL.
        card=target.closest('.member-card.is-flipped[data-member]');
        if(card && event.isTrusted && event.detail>0){
          const b=card.querySelector('.member-back > .wa65-open-member');
          if(b){const r=b.getBoundingClientRect();const x=event.clientX,y=event.clientY;
            if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom)button=b;
          }
        }
      }
      if(!button || !card || !grid.contains(card))return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openDetail(card);
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});
  else initialize();
})();


/* WAV ARCHIVE — MEMBER 360° / PHASE 2.2
 * Additive enhancement to the existing WA65 DETAIL modal.
 * Does not replace card flip, DETAIL hotfix, history, search, saved state or data.
 * SIGNAL and official-calendar data load only on first use.
 */
(()=>{
  'use strict';
  if(window.WAVMember360?.version==='2.2.0')return;
  const validId=/^S(?:0[1-9]|1\d|2[0-4])$/;
  const videoId=/^[A-Za-z0-9_-]{11}$/;
  const $=(s,root=document)=>root.querySelector(s);
  const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
  const modal=$('#wa65DetailModal'),body=$('#wa65DetailBody');
  if(!modal||!body)return;
  const UI={
    ko:{name:'MEMBER 360°',subtitle:'한 멤버의 기록을 연결해서 보기',tabs:['프로필','디멘션','SIGNAL','공식 일정','기록 탐색'],photo:'프로필',number:'멤버 번호',birthday:'생년월일',units:'참여 디멘션',signal:'출연 태그 영상',calendar:'연결된 공식 일정',verified:'등록된 데이터 기준',photoAlt:'멤버 프로필 사진',current:'조회하기',loading:'기록을 불러오는 중',failed:'현재 기록을 불러올 수 없어요. 기존 아카이브는 계속 사용할 수 있어요',emptySignal:'출연 멤버가 명시된 SIGNAL 기록이 아직 없어요',emptyCalendar:'멤버가 명시된 공식 일정이 아직 없어요',metadata:'영상 출연 정보가 등록된 경우에만 연결합니다. 미등록 영상이 실제로 미출연을 의미하지는 않아요',calendarNote:'멤버가 명시된 일정만 표시합니다. 단체 일정은 전체 캘린더에서 확인해 주세요',allSignal:'SIGNAL 전체 탐색',allSchedule:'전체 공식 캘린더',allHistory:'멤버 HISTORY 열기',allDisco:'음반 아카이브',allGravity:'Gravity 기록',allTimeline:'활동 연표',toUnit:'디멘션 상세 열기',watch:'영상 탐색',source:'공식 출처',more:'전체 보기',noBirth:'미등록',unitLead:'기존 아카이브의 디멘션 연결 기록',navNote:'아래 버튼은 기존 시스템으로 이동합니다. 특정 멤버 관련 기록으로 자동 필터링되지는 않아요',dateUnknown:'날짜 미정'},
    en:{name:'MEMBER 360°',subtitle:'Connected records for one member',tabs:['Profile','Dimensions','SIGNAL','Schedule','Browse'],photo:'Profile',number:'Member ID',birthday:'Date of birth',units:'Dimensions',signal:'Tagged appearances',calendar:'Linked official events',verified:'Based on registered data',photoAlt:'Member profile photo',current:'Explore',loading:'Loading records',failed:'Records are unavailable right now. The original archive still works',emptySignal:'No explicitly tagged SIGNAL appearances yet',emptyCalendar:'No official events explicitly linked to this member yet',metadata:'Only videos with explicit cast metadata are linked. Missing tags do not mean the member was absent',calendarNote:'Only explicitly attributed events appear here. See the full calendar for group events',allSignal:'Explore all SIGNAL',allSchedule:'Full official calendar',allHistory:'Open member HISTORY',allDisco:'Discography',allGravity:'Gravity archive',allTimeline:'Timeline',toUnit:'Open dimension details',watch:'Explore video',source:'Official source',more:'Browse all',noBirth:'Not recorded',unitLead:'Dimension links from the existing archive',navNote:'These open existing sections without automatically filtering by member',dateUnknown:'Date to be announced'},
    ja:{name:'MEMBER 360°',subtitle:'メンバーの記録をまとめて探す',tabs:['プロフィール','ディメンション','SIGNAL','公式日程','記録を見る'],photo:'プロフィール',number:'メンバー番号',birthday:'生年月日',units:'参加ディメンション',signal:'出演タグ付き動画',calendar:'関連公式日程',verified:'登録済みデータに基づく',photoAlt:'メンバー公式プロフィール写真',current:'見る',loading:'記録を読み込み中',failed:'データを取得できません。元のアーカイブは引き続き使えます',emptySignal:'出演情報が登録されたSIGNALはまだありません',emptyCalendar:'このメンバーが明記された公式日程はまだありません',metadata:'出演情報が明記された動画のみを表示します。未登録は不出演を意味しません',calendarNote:'メンバーが明記された日程のみ表示します。グループ全体の日程はカレンダーへ',allSignal:'SIGNALをすべて見る',allSchedule:'公式カレンダー',allHistory:'メンバー HISTORY',allDisco:'音楽アーカイブ',allGravity:'Gravity記録',allTimeline:'活動年表',toUnit:'ディメンション詳細',watch:'動画を探す',source:'公式情報元',more:'すべて見る',noBirth:'未登録',unitLead:'既存アーカイブの所属情報',navNote:'既存セクションを開きます。メンバー別の絞り込みは行いません',dateUnknown:'日程未定'}
  };
  const locale=()=>{const l=String(document.documentElement.dataset.language||document.documentElement.lang||'ko').toLowerCase();return l.startsWith('ja')?'ja':l.startsWith('en')?'en':'ko';};
  const words=()=>UI[locale()];
  const mk=(tag,cls,content)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(content!==undefined)node.textContent=String(content);return node;};
  const safeDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(String(value||''))?String(value):'';
  const eventTitle=e=>e.title&&typeof e.title==='object'?(e.title[locale()]||e.title.ko||e.title.en||''):(typeof e.title==='string'?e.title:'');
  const signalUrl=(id,query)=>{const u=new URL('./signal-moments/index.html',document.baseURI);if(id)u.searchParams.set('wamember',id);if(query)u.searchParams.set('waq',String(query).slice(0,140));return u.href;};
  const store={signal:{status:'idle',items:[],promise:null},calendar:{status:'idle',items:[],promise:null}};
  let activeId='',tab=0,panel=null,renderToken=0,returnFocus=null;
  function cardFor(id){return $('#memberGrid .member-card[data-member="'+id+'"]');}
  function info(id){const card=cardFor(id);if(!card)return null;
    const parts=String(card.dataset.name||id).trim().split(/\s+/);
    const units=[...new Set(String(card.dataset.units||'').split('|').map(x=>x.trim()).filter(Boolean))];
    const birth=safeDate(card.querySelector('[data-birth]')?.getAttribute('data-birth'));
    const image=card.querySelector('.member-front img.member-photo');
    const url=image?.getAttribute('src')||'';
    return {id,name:parts[0]||id,en:parts.slice(1).join(' '),units,birth,url};
  }
  function load(kind){
    const row=store[kind];if(row.status==='ready'||row.status==='error')return Promise.resolve(row.items);
    if(row.promise)return row.promise;
    row.status='loading';
    const path=kind==='signal'?'./signal-moments/data.json':'./data/wav-official-calendar.json';
    row.promise=(async()=>{
      const response=await fetch(new URL(path,document.baseURI),{cache:'no-cache'});
      if(!response.ok)throw Error('HTTP '+response.status);
      const json=await response.json();
      const raw=kind==='signal'?json.episodes:json.events;
      if(!Array.isArray(raw))throw Error('Invalid format');
      if(kind==='signal'){
        const seen=new Set();row.items=raw.filter(e=>{
          if(!e||!videoId.test(e.videoId)||seen.has(e.videoId))return false;
          seen.add(e.videoId);return Array.isArray(e.members)&&e.members.some(id=>validId.test(id));
        }).map(e=>({videoId:e.videoId,title:String(e.title||'SIGNAL').slice(0,240),date:safeDate(e.date),kind:String(e.kind||'SIGNAL'),members:e.members.filter(id=>validId.test(id))}));
      }else{
        row.items=raw.filter(e=>e&&safeDate(e.date)&&Array.isArray(e.members)&&e.members.some(id=>validId.test(id)))
          .map(e=>({date:e.date,title:e.title,category:String(e.category||''),members:e.members.filter(id=>validId.test(id)),sourceUrl:typeof e.sourceUrl==='string'?e.sourceUrl:'',status:String(e.status||''),venue:String(e.venue||''),city:String(e.city||'')}));
      }
      row.status='ready';return row.items;
    })().catch(err=>{console.warn('[WAV MEMBER 360] '+kind+' unavailable',err);row.status='error';row.items=[];return row.items;}).finally(()=>{row.promise=null; if(activeId&&panel&&body.contains(panel)&&modal.classList.contains('on'))renderTab();});
    return row.promise;
  }
  function closeLegacy(){const button=modal.querySelector('.wa65-close');if(button)button.click();else{modal.classList.remove('on');modal.setAttribute('aria-hidden','true');document.documentElement.style.overflow='';}}
  function jump(target){closeLegacy();if(typeof target==='string')target=$(target);
    if(target&&typeof target.scrollIntoView==='function')setTimeout(()=>target.scrollIntoView({block:'start',behavior:'auto'}),50);
  }
  function link(label,href,cls='wa22-button'){const a=mk('a',cls,label);a.href=href;return a;}
  function button(label,fn,cls='wa22-button'){const b=mk('button',cls,label);b.type='button';b.addEventListener('click',fn);return b;}
  function stat(label,value){const p=mk('div','wa22-stat');p.append(mk('small','',label),mk('strong','',value));return p;}
  function note(text){return mk('p','wa22-note',text);}
  function title(label){return mk('h3','wa22-section-heading',label);}
  function statusBox(text){return mk('div','wa22-status',text);}
  function createIntro(data){const t=words(),row=mk('div','wa22-hero');
    if(data.url){const image=mk('img','wa22-photo');image.src=data.url;image.alt=data.name+' '+t.photoAlt;image.loading='lazy';image.decoding='async';image.addEventListener('error',()=>{image.remove();},{once:true});row.append(image)}
    const summary=mk('div','wa22-hero-copy');summary.append(mk('small','wa22-hero-kicker',t.name),mk('strong','',data.id+' · '+data.name),mk('span','',data.en||'tripleS'));row.append(summary);
    return row;
  }
  function buildOverview(place,data){const t=words();
    const stats=mk('div','wa22-stats');stats.append(stat(t.number,data.id),stat(t.birthday,data.birth||t.noBirth),stat(t.units,String(data.units.length)));place.append(stats);
    const actions=mk('div','wa22-actions');
    actions.append(button(t.allHistory,()=>{
      closeLegacy();const trigger=cardFor(data.id)?.querySelector('.member-history-btn');
      if(trigger) setTimeout(()=>trigger.click(),30);else jump('#timeline');
    }));
    actions.append(button(t.allSignal,()=>{location.href=signalUrl(data.id)}));
    place.append(actions);
    place.append(note(t.verified+' · '+t.metadata));
  }
  function buildUnits(place,data){const t=words();place.append(title(t.tabs[1]+' · '+data.units.length),note(t.unitLead));
    const grid=mk('div','wa22-unit-grid');
    for(const unit of data.units){grid.append(button(unit+' ↗',()=>{
      // "MSNZ" is a parent project label, not a distinct WA65 unit matrix entry.
      // Never open an empty legacy detail modal for that umbrella label.
      if(unit.toUpperCase()==='MSNZ'){jump('#units');return;}
      if(window.WA65&&typeof window.WA65.unit==='function')window.WA65.unit(unit);
      else jump('#units');
    },'wa22-unit'));}
    place.append(grid);
  }
  function buildSignals(place,data){const t=words(),row=store.signal;
    place.append(title(t.tabs[2]));
    if(row.status==='idle'){place.append(statusBox(t.loading));load('signal');return;}
    if(row.status==='loading'){place.append(statusBox(t.loading));return;}
    if(row.status==='error'){place.append(statusBox(t.failed));place.append(link(t.allSignal+' ↗',signalUrl(data.id)));return;}
    const found=row.items.filter(e=>e.members.includes(data.id)).sort((a,b)=>b.date.localeCompare(a.date));
    place.append(mk('p','wa22-count',`${t.signal} · ${found.length}`));
    if(!found.length)place.append(statusBox(t.emptySignal));
    const list=mk('div','wa22-list');
    for(const e of found.slice(0,8)){
      const a=link('',signalUrl(data.id,e.title),'wa22-row');
      a.append(mk('span','wa22-pill','▶'),mk('span','wa22-row-text'));
      const text=a.querySelector('.wa22-row-text');text.append(mk('strong','',e.title),mk('small','',[e.date,e.kind].filter(Boolean).join(' · ')));
      list.append(a);
    }
    place.append(list,link(t.allSignal+' ↗',signalUrl(data.id),'wa22-button wa22-more'),note(t.metadata));
  }
  function buildCalendar(place,data){const t=words(),row=store.calendar;
    place.append(title(t.tabs[3]));
    if(row.status==='idle'){place.append(statusBox(t.loading));load('calendar');return;}
    if(row.status==='loading'){place.append(statusBox(t.loading));return;}
    if(row.status==='error'){place.append(statusBox(t.failed));place.append(button(t.allSchedule+' ↗',()=>jump('#wa-calendar-root')));return;}
    const events=row.items.filter(e=>e.members.includes(data.id)).sort((a,b)=>a.date.localeCompare(b.date));
    place.append(mk('p','wa22-count',`${t.calendar} · ${events.length}`));
    if(!events.length)place.append(statusBox(t.emptyCalendar));
    const list=mk('div','wa22-list');
    for(const e of events.slice(0,12)){
      const b=button('',()=>{closeLegacy();if(typeof window.WAVConnectionPhase1?.openCalendarDate==='function'){
        if(window.WAVConnectionPhase1.openCalendarDate(e.date))return;
      }jump('#wa-calendar-root');},'wa22-row');
      b.append(mk('span','wa22-pill','▦'),mk('span','wa22-row-text'));
      const sub=b.querySelector('.wa22-row-text');sub.append(mk('strong','',eventTitle(e)||e.category),mk('small','',[e.date,e.venue||e.city,e.status].filter(Boolean).join(' · ')));
      list.append(b);
    }
    place.append(list,button(t.allSchedule+' ↗',()=>jump('#wa-calendar-root'),'wa22-button wa22-more'),note(t.calendarNote));
  }
  function buildBrowse(place,data){const t=words();place.append(title(t.tabs[4]),note(t.navNote));
    const actions=mk('div','wa22-browse-grid');
    actions.append(button(t.allHistory+' ↗',()=>{closeLegacy();const target=cardFor(data.id)?.querySelector('.member-history-btn');if(target)setTimeout(()=>target.click(),40);else jump('#timeline');}));
    actions.append(button(t.allDisco+' ↗',()=>jump('#discography')));
    actions.append(button(t.allGravity+' ↗',()=>jump('#gravity')));
    actions.append(button(t.allTimeline+' ↗',()=>jump('#timeline')));
    actions.append(button(t.allSchedule+' ↗',()=>jump('#wa-calendar-root')));
    actions.append(link(t.allSignal+' ↗',signalUrl(data.id)));
    place.append(actions);
  }
  function renderTab(){if(!panel||!body.contains(panel))return;
    const data=info(activeId);if(!data)return;
    const t=words(),hero=$('.wa22-head',panel),buttons=$$('.wa22-tab',panel),content=$('.wa22-content',panel);
    hero.replaceChildren(createIntro(data));
    buttons.forEach((b,i)=>{b.textContent=t.tabs[i];b.setAttribute('aria-selected',String(i===tab));b.tabIndex=i===tab?0:-1;});
    content.replaceChildren();
    if(tab===0)buildOverview(content,data);
    else if(tab===1)buildUnits(content,data);
    else if(tab===2)buildSignals(content,data);
    else if(tab===3)buildCalendar(content,data);
    else buildBrowse(content,data);
  }
  function enhance(){
    if(!modal||!body)return;
    const heading=body.querySelector(':scope > h2');const match=heading?.textContent?.trim().match(/^(S(?:0[1-9]|1\d|2[0-4]))\b/);
    if(!match){panel=null;activeId='';return;}
    const id=match[1];if(!info(id))return;
    const existing=$('.wa22-root',body);
    if(existing&&existing===panel&&activeId===id)return;
    const changed=activeId!==id;activeId=id;if(changed)tab=0;
    if(existing){panel=existing;renderTab();return;}
    panel=mk('section','wa22-root');panel.setAttribute('aria-label','MEMBER 360');
    const head=mk('div','wa22-head'),tabs=mk('div','wa22-tablist'),content=mk('div','wa22-content');
    tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Member 360 sections');
    content.setAttribute('role','tabpanel');content.id='wa22-member-panel';
    for(let i=0;i<5;i++){
      const b=mk('button','wa22-tab');b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-controls',content.id);
      b.addEventListener('click',()=>{tab=i;renderTab()});
      b.addEventListener('keydown',e=>{if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft'&&e.key!=='Home'&&e.key!=='End')return;
        e.preventDefault();tab=e.key==='Home'?0:e.key==='End'?4:(tab+(e.key==='ArrowRight'?1:4))%5;renderTab();$$('.wa22-tab',panel)[tab]?.focus();});
      tabs.append(b);
    }
    panel.append(head,tabs,content);
    const before=body.querySelector('.wa65-trust,.wa65-section');body.insertBefore(panel,before||null);
    renderTab();
  }
  // Watch only immediate body replacements from the existing detail engine,
  // not the 24 animated cards, document subtree, or modal children.
  let queued=false;const observer=new MutationObserver(()=>{
    if(queued)return;queued=true;
    queueMicrotask(()=>{queued=false;enhance()});
  });observer.observe(body,{childList:true});
  const rootLangObserver=new MutationObserver(()=>{if(panel&&body.contains(panel))renderTab()});
  rootLangObserver.observe(document.documentElement,{attributes:true,attributeFilter:['lang','data-language']});
  document.addEventListener('wa:language',()=>{if(panel&&body.contains(panel))renderTab()});
  enhance();
  window.WAVMember360=Object.freeze({version:'2.2.0',open(id){
    id=String(id||'').toUpperCase();if(!validId.test(id)||!info(id))return false;
    if(typeof window.WA65?.member!=='function')return false;
    window.WA65.member(id);enhance();return true;
  },getState(){return {activeId,tab,signalStatus:store.signal.status,calendarStatus:store.calendar.status}}});
})();

/* HISTORY UNIVERSE 3.0 · optional, isolated timeline enhancer.
   If either asset is unavailable, legacy timeline remains fully visible. */
(()=>{'use strict';
  const timeline=document.getElementById('timeline');
  if(!timeline||document.getElementById('waHistoryUniverse')||document.getElementById('wa-hu-loader-css'))return;
  const stylesheet=document.createElement('link');
  stylesheet.id='wa-hu-loader-css';stylesheet.rel='stylesheet';
  stylesheet.href='./wav-history-universe.css?v=20261031-3';
  document.head.appendChild(stylesheet);
  const engine=document.createElement('script');engine.src='./wav-history-universe.js?v=20261031-3';
  engine.defer=true;engine.addEventListener('error',()=>{console.warn('WAV HISTORY UNIVERSE could not load; original timeline remains available')});
  document.body.appendChild(engine);
})();


/* WAV ARCHIVE · recent changes (2026-10-31)
 * Editorial-only enhancement. Does not alter existing navigation, storage,
 * calendar, member-card, SIGNAL, or Objekt logic.
 * Original historical entries are deliberately preserved.
 */
(() => {
  'use strict';
  const root = document.getElementById('wa52UpdateStatus');
  const log = root?.querySelector('#wa52UpdateLog');
  const latest = root?.querySelector('.wa52-update-main time');
  if (!root || !log || !latest || log.querySelector('[data-wa-newlog="20261031"]')) return;

  // Date only: do not fabricate a deployment time.
  latest.dateTime = '2026-10-31';
  latest.textContent = '2026.10.31 KST';

  const entries = Object.freeze({
    ko: [
      'MY OBJEKT — 보유·위시·교환 관리, 중복 수량과 백업 기능 개선',
      'OBJEKT COLLECTION — 최신순 탐색·유닛 Objekt 검색과 동기화 기능 추가',
      'HISTORY UNIVERSE — 2022~2027 활동 연표와 공식 캘린더·음반·Gravity 연결',
      'MEMBER 360° · SIGNAL — 멤버 상세 연결, 조합 검색과 영상 탐색 개선',
      'SEARCH OS · OFFICIAL CALENDAR — 통합 검색 확장 및 공식 일정 기록 보완'
    ],
    en: [
      'MY OBJEKT — Improved collection, wishlist, trade, duplicate counts and backups',
      'OBJEKT COLLECTION — Added recent-first sorting, unit Objekt search and sync workflow',
      'HISTORY UNIVERSE — Linked the 2022–2027 timeline with calendar, releases and Gravity',
      'MEMBER 360° · SIGNAL — Improved member detail links, combined filters and video discovery',
      'SEARCH OS · OFFICIAL CALENDAR — Expanded cross-archive search and updated schedule records'
    ],
    ja: [
      'MY OBJEKT — 所持・ウィッシュ・交換管理、重複枚数とバックアップ機能を改善',
      'OBJEKT COLLECTION — 新着順表示、ユニットObjekt検索、同期機能を追加',
      'HISTORY UNIVERSE — 2022～2027年の年表と公式カレンダー・音楽作品・Gravityを連携',
      'MEMBER 360° · SIGNAL — メンバー詳細の連携、複数人検索と動画検索を改善',
      'SEARCH OS · OFFICIAL CALENDAR — 横断検索を拡張し、公式日程の記録を補完'
    ]
  });
  const fragment = document.createDocumentFragment();
  for (const lang of ['ko','en','ja']) {
    for (const description of entries[lang]) {
      const item = document.createElement('div');
      item.className = 'wa52-log-item';
      item.setAttribute('data-wa-ed-lang',lang);
      item.setAttribute('data-wa-newlog','20261031');
      const date = document.createElement('time');
      date.dateTime = '2026-10-31';
      date.textContent = '2026.10.31';
      const descriptionNode = document.createElement('span');
      descriptionNode.textContent = description;
      item.append(date, descriptionNode);
      fragment.appendChild(item);
    }
  }
  log.insertBefore(fragment, log.firstChild);
})();
