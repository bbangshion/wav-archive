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
