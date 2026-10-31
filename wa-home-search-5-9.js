/* WAV ARCHIVE · 5.9 HOME and Search OS integration.
 * Display/navigation layer only. Does not change archive datasets, member cards,
 * search index builders, member 360 internals, or existing event listeners.
 */
(() => {
  'use strict';
  if (window.WAVHomeSearch59) return;
  const qp = new URLSearchParams(location.search);
  if (qp.has('wa57_all') || qp.has('wa59_original')) return;

  const dictionary = {
    ko: {
      kicker: 'tripleS 팬메이드 데이터 아카이브',
      hero: 'tripleS의 기록을<br>한곳에서',
      desc: '24명의 멤버부터 디멘션, Objekt, Gravity, 영상과 활동 기록까지. 필요한 정보를 쉽고 빠르게 찾아보세요',
      search: '통합 검색', browse: '기능 둘러보기',
      why: '제작 배경', whyTitle: '흩어진 기록을 한곳에',
      whyDesc: '멤버 정보와 디멘션, 음반, 영상, 팬 참여 기록을 따로 찾지 않아도 되도록 시작한 프로젝트입니다. 기존 공개 자료를 정리하고 서로 연결해, 필요한 정보를 더 편하게 볼 수 있도록 만들고 있습니다',
      who: '제작자 소개', whoTitle: 'WAV가 만든 아카이브',
      whoDesc: 'WAV ARCHIVE는 @bbangshion이 직접 제작·관리하는 비공식 tripleS 팬사이트입니다. 자료를 찾아보기 쉽고 오래 남길 수 있도록 꾸준히 정리하고 있습니다',
      instagram: '인스타그램',
      functions: '주요 기능', functionsDesc: '기능을 선택하면 기존 아카이브가 열립니다',
      foot: 'WAV ARCHIVE는 MODHAUS 및 tripleS의 공식 사이트가 아닙니다',
      categories: [
        ['MEMBERS', '24명 프로필과 활동 기록'],
        ['DIMENSION', '유닛 정보와 구성'],
        ['GRAVITY', '투표 기록과 분석'],
        ['OBJEKT', '카탈로그 및 컬렉션'],
        ['SIGNAL', '영상 아카이브'],
        ['CALENDAR', '공식 일정 캘린더'],
        ['HISTORY', '활동 연대표'],
        ['MY WAV', '개인화 기능']
      ],
      tabs: ['통합 검색', '연결 탐색'],
      connectedHelp: 'SEARCH THE UNIVERSE · 기존 연결 검색을 그대로 이용합니다',
      detail: '프로필 열기'
    },
    en: {
      kicker: 'A fan-made tripleS data archive',
      hero: 'The tripleS archive,<br>in one place',
      desc: 'Members, DIMENSIONs, Objekt, Gravity, videos, and activity records — find what you need in one place',
      search: 'Search archive', browse: 'Explore features',
      why: 'WHY IT EXISTS', whyTitle: 'Bringing records together',
      whyDesc: 'This project began to make scattered member profiles, unit histories, releases, videos, and fan participation records easier to find. It organizes and connects publicly available information in one archive',
      who: 'ABOUT THE CREATOR', whoTitle: 'Made by a WAV',
      whoDesc: 'WAV ARCHIVE is an unofficial tripleS fan project created and maintained by @bbangshion, designed to make useful records easier to browse and preserve',
      instagram: 'Instagram',
      functions: 'Explore the archive', functionsDesc: 'Choose a feature to open its existing archive',
      foot: 'WAV ARCHIVE is not affiliated with MODHAUS or tripleS',
      categories: [
        ['MEMBERS','24 member profiles and history'],['DIMENSION','Units and lineups'],['GRAVITY','Voting records and analysis'],
        ['OBJEKT','Catalogue and collection'],['SIGNAL','Video archive'],['CALENDAR','Official schedules'],
        ['HISTORY','Activity timeline'],['MY WAV','Personal features']
      ],
      tabs: ['Archive search', 'Connected search'],
      connectedHelp: 'SEARCH THE UNIVERSE · The original connected search is preserved',
      detail: 'Open profile'
    },
    ja: {
      kicker: 'tripleS ファンメイドデータアーカイブ',
      hero: 'tripleSの記録を<br>ひとつに',
      desc: '24人のメンバー、DIMENSION、Objekt、Gravity、映像、活動記録をまとめて探せます',
      search: 'まとめて検索', browse: '機能を見る',
      why: '制作の背景', whyTitle: '散らばった記録をひとつに',
      whyDesc: 'メンバー情報、ユニット、音楽、映像、ファン参加の記録を探しやすくするために始めたプロジェクトです。公開情報を整理し、関連する記録をつなげています',
      who: '制作者', whoTitle: 'WAVによるファンアーカイブ',
      whoDesc: 'WAV ARCHIVEは@bbangshionが制作・管理する非公式tripleSファンサイトです。記録を見つけやすく、残していけるよう整理しています',
      instagram: 'Instagram',
      functions: '主な機能', functionsDesc: '機能を選ぶと既存のアーカイブが開きます',
      foot: 'WAV ARCHIVEはMODHAUSまたはtripleSの公式サイトではありません',
      categories: [
        ['MEMBERS','24人のプロフィールと活動記録'],['DIMENSION','ユニットとメンバー構成'],['GRAVITY','投票記録と分析'],
        ['OBJEKT','カタログとコレクション'],['SIGNAL','映像アーカイブ'],['CALENDAR','公式スケジュール'],
        ['HISTORY','活動年表'],['MY WAV','個人向け機能']
      ],
      tabs: ['統合検索', 'つながり検索'],
      connectedHelp: 'SEARCH THE UNIVERSE · 以前のつながり検索もそのまま使えます',
      detail: 'プロフィールを開く'
    }
  };

  const routes = [
    {href:'#members',route:'members'},
    {href:'#units',route:'dimensions'},
    {href:'#gravity',route:'gravity'},
    {href:'./objekt-collection/'},
    {href:'./signal-moments/'},
    {href:'#wa-auto-hub',route:'schedule'},
    {href:'#timeline',route:'history'},
    {href:'#waHome45',route:'mywav'}
  ];
  const roots = ['wa50Home','xHome'];
  const $ = s => document.querySelector(s);
  const locale = () => {
    const v = document.documentElement.getAttribute('data-language') || document.documentElement.lang;
    return v === 'ja' ? 'ja' : v === 'en' ? 'en' : 'ko';
  };
  const safe = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function landingMarkup(lang, rootId) {
    const t = dictionary[lang];
    return `<div class="wa59-wrap">
      <div class="wa59-hero">
        <span class="wa59-kicker">${safe(t.kicker)}</span>
        <h1>${t.hero}</h1>
        <p>${safe(t.desc)}</p>
        <div class="wa59-actions">
          <button type="button" data-wa59-search>${safe(t.search)} <span aria-hidden="true">→</span></button>
          <a href="#wa59-features-${rootId}" data-wa59-features>${safe(t.browse)} <span aria-hidden="true">↓</span></a>
        </div>
        <div class="wa59-meta"><span>24 MEMBERS</span><span>KO / EN / JA</span><span>CREATED BY @bbangshion</span></div>
      </div>
      <div class="wa59-about">
        <article class="wa59-info"><span class="wa59-overline">${safe(t.why)}</span><h2>${safe(t.whyTitle)}</h2><p>${safe(t.whyDesc)}</p></article>
        <article class="wa59-info"><span class="wa59-overline">${safe(t.who)}</span><h2>${safe(t.whoTitle)}</h2><p>${safe(t.whoDesc)}</p><a class="wa59-instagram" href="https://www.instagram.com/bbangshion/" target="_blank" rel="noopener noreferrer">@bbangshion · ${safe(t.instagram)} ↗</a></article>
      </div>
      <section class="wa59-feature-section" id="wa59-features-${rootId}" aria-label="${safe(t.functions)}"><div class="wa59-feature-head"><span class="wa59-overline">WAV ARCHIVE</span><h2>${safe(t.functions)}</h2><p>${safe(t.functionsDesc)}</p></div>
      <div class="wa59-feature-grid">${t.categories.map((row,i)=>`<a class="wa59-feature" href="${routes[i].href}" ${routes[i].route?`data-wa59-route="${routes[i].route}"`:''}><b>${safe(row[0])}</b><span>${safe(row[1])}</span><em aria-hidden="true">↗</em></a>`).join('')}</div></section>
      <footer class="wa59-footer">${safe(t.foot)}<br>CREATED BY @bbangshion</footer>
    </div>`;
  }

  function renderLandings() {
    const lang = locale();
    for(const id of roots){
      const root=document.getElementById(id);
      if(!root)continue;
      let ui=root.querySelector(':scope > .wa59-landing');
      if(!ui){ui=document.createElement('div');ui.className='wa59-landing';root.prepend(ui);}
      if(ui.dataset.lang!==lang){ui.innerHTML=landingMarkup(lang,id);ui.dataset.lang=lang;}
    }
    const nav=$('#wa59-search-tabs');
    if(nav){
      for(const [i,b] of [...nav.querySelectorAll('button')].entries())b.textContent=dictionary[lang].tabs[i];
    }
  }
  function openSearch(){
    const trigger=document.getElementById('waSearchOpen');
    if(trigger){trigger.click();return;}
    const layer=document.getElementById('waSearchLayer');
    if(layer){layer.classList.add('open');layer.setAttribute('aria-hidden','false');$('#waGlobalSearch')?.focus();}
  }
  function closeSearch(){
    const b=document.getElementById('waSearchClose');if(b){b.click();return;}
    const l=document.getElementById('waSearchLayer');l?.classList.remove('open');l?.setAttribute('aria-hidden','true');
  }
  function openRoute(route,href){
    if(window.WAVFocus57?.open){window.WAVFocus57.open(route);}
    if(href){
      try {history.pushState(history.state,'',href);}catch(_){}
    }
    window.scrollTo({top:0,behavior:'instant'});
  }
  function openConnected(){
    const current=document.getElementById('waGlobalSearch')?.value || '';
    closeSearch();
    openRoute('archive','#archivehub');
    const old=document.getElementById('wa40Input');
    if(old){old.value=current;old.dispatchEvent(new Event('input',{bubbles:true}));old.focus({preventScroll:true});}
    const root=document.getElementById('archivehub');
    root?.scrollIntoView({block:'start',behavior:'instant'});
  }
  function addSearchTabs(){
    const layer=document.getElementById('waSearchLayer');
    const shell=layer?.querySelector('.wa-search-shell');
    const head=shell?.querySelector('.wa-search-head');
    if(!layer||!shell||!head || $('#wa59-search-tabs'))return;
    const tabs=document.createElement('div');tabs.id='wa59-search-tabs';tabs.className='wa59-search-tabs';
    tabs.innerHTML='<button type="button" aria-current="page"></button><button type="button" data-wa59-connected></button>';
    head.insertAdjacentElement('afterend',tabs);
    tabs.querySelector('[data-wa59-connected]')?.addEventListener('click',openConnected);
    tabs.querySelector('button:first-child')?.addEventListener('click',()=>$('#waGlobalSearch')?.focus());
  }
  const ROUTE_BY_LABEL = {MEMBERS:'members',DIMENSION:'dimensions',DISCOGRAPHY:'discography',GRAVITY:'gravity',TIMELINE:'history'};
  function memberCard(id) {
    return document.querySelector(`#memberGrid .member-card[data-member="${id}"]`);
  }
  function openProfile(id) {
    const modal=document.getElementById('wa65DetailModal');
    try{
      if(window.WAVMember360?.open?.(id))return true;
      if(typeof window.WA65?.member==='function'){
        window.WA65.member(id);
        return true;
      }
    }catch(err){console.warn('[WAV 5.9] Member profile open failed',err);}
    // Keep the old result navigation as a safe fallback when the optional detail engine is absent.
    memberCard(id)?.scrollIntoView({block:'center',behavior:'auto'});
    if(modal)console.info('[WAV 5.9] Details unavailable, member card shown instead.');
    return false;
  }
  function resultClick(ev){
    const target=ev.target;
    if(!(target instanceof Element))return;
    const item=target.closest('#waSearchResults .wa-result');
    if(!item)return;
    const type=item.closest('.wa5-group')?.querySelector('.wa5-group-head span')?.textContent?.trim();
    const route=ROUTE_BY_LABEL[type];
    if(!route)return;
    const arrow=target.closest('.wa5-result-go');
    const id=(item.querySelector('.wa5-result-main b')?.textContent||'').match(/\bS(?:0?[1-9]|1\d|2[0-4])\b/i)?.[0]?.toUpperCase().replace(/^S([1-9])$/,'S0$1');
    if(arrow && route==='members' && id){
      ev.preventDefault();ev.stopImmediatePropagation();
      closeSearch();openRoute('members','#members');
      window.setTimeout(()=>openProfile(id),100);
      return;
    }
    // For normal result clicks, expose the existing section before its own click
    // handler scrolls into view. Do not cancel or replace its original handler.
    if(window.WAVFocus57?.open) window.WAVFocus57.open(route);
  }
  function addShortSNumberSupport(){
    // Existing Search OS indexes S01..S24. Gracefully accept short forms S1..S9
    // without replacing its index or handlers. Debounce to allow S20 typing.
    for(const selector of ['#waGlobalSearch','#wa40Input']){
      const input=document.querySelector(selector);
      if(!input || input.dataset.wa59ShortS)return;
      input.dataset.wa59ShortS='1';
      let timer;
      input.addEventListener('input',()=>{
        clearTimeout(timer);
        const value=input.value.trim();
        if(!/^s[1-9]$/i.test(value))return;
        timer=setTimeout(()=>{
          if(input.value.trim()!==value)return;
          input.value='S0'+value.slice(1);
          input.dispatchEvent(new Event('input',{bubbles:true}));
        },380);
      });
    }
  }
  function init(){
    if(!document.getElementById('xHome') && !document.getElementById('wa50Home'))return;
    renderLandings();addSearchTabs();renderLandings();addShortSNumberSupport();
    document.documentElement.classList.add('wa59-ready');
    document.addEventListener('click',ev=>{
      const target=ev.target;if(!(target instanceof Element))return;
      if(target.closest('[data-wa59-search]')){ev.preventDefault();openSearch();return;}
      if(target.closest('[data-wa59-features]')){
        ev.preventDefault();const root=target.closest('.wa59-landing');root?.querySelector('.wa59-feature-section')?.scrollIntoView({block:'start',behavior:'smooth'});return;
      }
    });
    document.addEventListener('click',resultClick,true);
    document.addEventListener('wa:language',renderLandings);
    const obs=new MutationObserver(m=>{if(m.some(x=>x.attributeName==='data-language'||x.attributeName==='lang'))renderLandings();});
    obs.observe(document.documentElement,{attributes:true,attributeFilter:['data-language','lang']});
    // Robust fallback for menu Search OS links already provided by the site.
    window.WAVHomeSearch59=Object.freeze({version:'5.9.0',openSearch,openConnected});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
