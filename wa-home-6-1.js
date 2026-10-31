/* WAV ARCHIVE | HOME & NAVIGATION 6.1
 * Additive compatibility layer: original site, anchors and all application data remain in place.
 * If initialization fails, the original long-form page stays visible.
 */
(() => {
  'use strict';
  if (window.__waHome61) return;
  const main = document.querySelector('main#top');
  const grouped = document.getElementById('waGroupedMenu');
  if (!main || !grouped || !grouped.querySelector('.wa-menu-panel')) return;

  const T = {
    ko: {
      kicker:'THE INTERACTIVE tripleS ARCHIVE',title:'24명의 기록, 하나의 아카이브',
      desc:'보고 싶은 기록부터 찾아보세요. 각 시스템의 기능과 데이터는 그대로 유지됩니다',
      start:'바로 탐색하기',search:'통합 검색 열기',today:'TODAY IN tripleS',
      todayDesc:'오늘 일정부터 2026–2027 공식 캘린더까지', calendar:'공식 일정 보기',
      categories:'ARCHIVE DIRECTORY', sub:'필요한 정보만 선택해 이동하세요',
      archive:'기존 전체 화면으로 보기', credit:'CREATED BY @bbangshion · 비공식 팬메이드 아카이브',
      navTitle:'어디로 이동할까요?',more:'기존 메뉴 전체 보기',home:'HOME',back:'HOME으로',
      members:'멤버',membersDesc:'24명 · MEMBER 360°',dimension:'디멘션',dimensionDesc:'유닛 · 계보 · 연결',
      gravity:'Gravity',gravityDesc:'투표 기록 · 데이터 분석',objekt:'Objekt',objektDesc:'11,000+ 컬렉션 검색',
      signal:'SIGNAL',signalDesc:'영상 · 멤버 검색',discography:'음반',discographyDesc:'발매 · 수록곡',
      history:'연대표',historyDesc:'2022–2027 활동 기록',myobjekt:'MY OBJEKT',myobjektDesc:'보유 · 위시 · 분석',
      calendarMenu:'공식 일정',calendarDesc:'날짜 선택 · 공연 · 행사',play:'WAV PLAY',playDesc:'게임 · 가상 디멘션',
      mywav:'MY WAV',mywavDesc:'개인화 · WAV ID',searchMenu:'SEARCH OS',searchDesc:'모든 기록 통합 검색',
      intro:'DISCOVER',content:'ARCHIVE',data:'DATA',personal:'PERSONAL & PLAY'
    },
    en: {
      kicker:'THE INTERACTIVE tripleS ARCHIVE',title:'24 members. One archive.',
      desc:'Find what matters to you. All existing systems and data remain available.',
      start:'Explore',search:'Open Search OS',today:'TODAY IN tripleS',
      todayDesc:'Today’s schedule and the official 2026–2027 calendar',calendar:'View official calendar',
      categories:'ARCHIVE DIRECTORY',sub:'Go straight to the section you need',
      archive:'Open full archive',credit:'CREATED BY @bbangshion · Unofficial fan archive',
      navTitle:'Where would you like to go?',more:'Show original menu',home:'HOME',back:'Back to HOME',
      members:'Members',membersDesc:'24 profiles · MEMBER 360°',dimension:'Dimensions',dimensionDesc:'Units · lineage · links',
      gravity:'Gravity',gravityDesc:'Voting history · analytics',objekt:'Objekt',objektDesc:'11,000+ items',
      signal:'SIGNAL',signalDesc:'Videos · member filters',discography:'Music',discographyDesc:'Releases · tracklists',
      history:'Timeline',historyDesc:'Activity history · 2022–2027',myobjekt:'MY OBJEKT',myobjektDesc:'Owned · wishlist · analytics',
      calendarMenu:'Calendar',calendarDesc:'Dates · concerts · events',play:'WAV PLAY',playDesc:'Games · unit builder',
      mywav:'MY WAV',mywavDesc:'Personalization · WAV ID',searchMenu:'SEARCH OS',searchDesc:'Search the whole archive',
      intro:'DISCOVER',content:'ARCHIVE',data:'DATA',personal:'PERSONAL & PLAY'
    },
    ja: {
      kicker:'THE INTERACTIVE tripleS ARCHIVE',title:'24人の記録を、ひとつの場所に',
      desc:'見たい記録から探せます。既存の機能とデータはそのまま利用できます',
      start:'アーカイブを探す',search:'横断検索を開く',today:'TODAY IN tripleS',
      todayDesc:'今日の予定と2026〜2027年の公式カレンダー',calendar:'公式日程を見る',
      categories:'ARCHIVE DIRECTORY',sub:'探したい情報を選んでください',
      archive:'従来の全体表示を見る',credit:'CREATED BY @bbangshion · 非公式ファンアーカイブ',
      navTitle:'どこへ移動しますか？',more:'従来のメニューを表示',home:'HOME',back:'HOMEに戻る',
      members:'メンバー',membersDesc:'24人 · MEMBER 360°',dimension:'ディメンション',dimensionDesc:'ユニット · 系譜 · つながり',
      gravity:'Gravity',gravityDesc:'投票履歴 · 分析',objekt:'Objekt',objektDesc:'11,000件以上を検索',
      signal:'SIGNAL',signalDesc:'動画 · メンバー検索',discography:'音楽',discographyDesc:'リリース · 収録曲',
      history:'年表',historyDesc:'2022〜2027年の活動記録',myobjekt:'MY OBJEKT',myobjektDesc:'所持 · ウィッシュ · 分析',
      calendarMenu:'公式日程',calendarDesc:'日付 · 公演 · イベント',play:'WAV PLAY',playDesc:'ゲーム · ユニット作成',
      mywav:'MY WAV',mywavDesc:'カスタマイズ · WAV ID',searchMenu:'SEARCH OS',searchDesc:'アーカイブ横断検索',
      intro:'DISCOVER',content:'ARCHIVE',data:'DATA',personal:'PERSONAL & PLAY'
    }
  };
  const items = [
    {key:'members',group:'intro',href:'./members/',mark:'S01—S24'},
    {key:'dimension',group:'intro',href:'./dimensions/',mark:'DIMENSION'},
    {key:'signal',group:'content',href:'./signal-moments/',mark:'VIDEO'},
    {key:'discography',group:'content',href:'#discography',mark:'MUSIC'},
    {key:'history',group:'content',href:'#timeline',mark:'TIMELINE'},
    {key:'gravity',group:'data',href:'./wav-labs/gravity-archive.html',mark:'COMO'},
    {key:'objekt',group:'data',href:'./objekt-collection/',mark:'COLLECTION'},
    {key:'myobjekt',group:'data',href:'./objekt-data-lab/',mark:'BINDER'},
    {key:'calendarMenu',group:'personal',href:'#wa-auto-hub',mark:'2026—27'},
    {key:'play',group:'personal',href:'#waNavPlay',mark:'PLAY'},
    {key:'mywav',group:'personal',href:'#waSignatureLaunch',mark:'WAV ID'}
  ];
  function locale() {
    const val = (document.documentElement.lang || 'ko').toLowerCase();
    if (val.startsWith('ja') || val.startsWith('jp')) return 'ja';
    if (val.startsWith('en')) return 'en';
    return 'ko';
  }
  const txt = (key) => T[locale()][key] || T.ko[key] || key;
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  };
  function link(item, location) {
    const a = el('a', location === 'menu' ? 'wa6-navlink' : 'wa6-card');
    a.href = item.href;
    a.dataset.wa6Key = item.key;
    a.append(el('small','wa6-card-mark',item.mark), el('strong','wa6-card-title',txt(item.key)), el('span','wa6-card-desc',txt(item.key+'Desc')));
    const arrow=el('span','wa6-arr','↗');arrow.setAttribute('aria-hidden','true');a.append(arrow);
    return a;
  }
  function sectionHead(title, desc) {
    const d=el('div','wa6-section-head');d.append(el('span','wa6-overline',title),el('p','wa6-section-sub',desc));return d;
  }

  const portal = el('section','wa6-portal');portal.id='wa6Home';
  portal.setAttribute('aria-label','WAV ARCHIVE home');
  const inner=el('div','wa6-wrap');portal.append(inner);
  const intro=el('div','wa6-intro');
  intro.append(el('span','wa6-overline',txt('kicker')), el('h1','wa6-title',txt('title')),el('p','wa6-desc',txt('desc')));
  const actions=el('div','wa6-actions');
  const search=el('button','wa6-primary',txt('search'));search.type='button';search.dataset.wa6Search='';
  const viewAll=el('a','wa6-secondary',txt('archive'));viewAll.href='#archivehub';
  actions.append(search,viewAll);intro.append(actions);inner.append(intro);
  const quick=el('div','wa6-quick');
  const qtext=el('div','wa6-quick-text');qtext.append(el('span','wa6-overline',txt('today')),el('strong','',txt('todayDesc')));
  const qlink=el('a','wa6-quick-button',txt('calendar'));qlink.href='#wa-auto-hub';
  quick.append(qtext,qlink);inner.append(quick);
  const directory=el('div','wa6-directory');directory.append(sectionHead(txt('categories'),txt('sub')));
  const grid=el('div','wa6-grid');items.forEach(i=>grid.append(link(i,'card')));directory.append(grid);inner.append(directory);
  inner.append(el('p','wa6-credit',txt('credit')));
  main.insertBefore(portal,main.firstChild);

  const panel=grouped.querySelector('.wa-menu-panel');
  const display=panel.querySelector('.wa-menu-display');
  const menuContent=el('div','wa6-menu-content');
  const menuHead=el('p','wa6-menu-heading',txt('navTitle'));menuContent.append(menuHead);
  const menuSearch=el('button','wa6-menu-search',txt('searchMenu')+'  ↗');menuSearch.type='button';menuSearch.dataset.wa6Search='';
  menuContent.append(menuSearch);
  const menuGroups=el('div','wa6-menu-groups');
  for (const category of ['intro','content','data','personal']) {
    const wrap=el('section','wa6-menu-group');
    wrap.append(el('h3','',txt(category)));
    const links=el('div','wa6-menu-items');items.filter(i=>i.group===category).forEach(i=>links.append(link(i,'menu')));
    wrap.append(links);menuGroups.append(wrap);
  }
  menuContent.append(menuGroups);
  const legacy=el('details','wa6-legacy');legacy.id='wa6LegacyMenu';
  const summary=el('summary','',txt('more'));legacy.append(summary);
  const legacyChildren=[...panel.children].filter(node=>node.classList?.contains('wa-menu-group') || node.classList?.contains('wa-menu-more'));
  legacyChildren.forEach(node=>legacy.append(node));
  menuContent.append(legacy);
  panel.insertBefore(menuContent,display||null);

  const returnBar=el('div','wa6-return');returnBar.id='wa6Return';
  const returnLink=el('a','wa6-return-home', '← '+txt('back'));returnLink.href='#wa6Home';
  returnBar.append(returnLink,el('span','wa6-return-note','WAV ARCHIVE / EXPLORE'));
  main.insertBefore(returnBar,portal.nextSibling);
  function render() {
    const l=locale();const v=T[l];
    document.querySelectorAll('[data-wa6-key="members"], [data-wa6-key="dimension"]').forEach(a=>{ const u=new URL(a.getAttribute('href'),location.href);u.searchParams.set('lang',l);a.href=u.href; });
    portal.querySelector('.wa6-intro>.wa6-overline').textContent=v.kicker;
    portal.querySelector('.wa6-title').textContent=v.title;
    portal.querySelector('.wa6-desc').textContent=v.desc;
    search.textContent=v.search;viewAll.textContent=v.archive;
    qtext.querySelector('.wa6-overline').textContent=v.today;
    qtext.querySelector('strong').textContent=v.todayDesc;
    qlink.textContent=v.calendar;
    const d=directory.querySelector('.wa6-section-head');
    d.querySelector('.wa6-overline').textContent=v.categories;
    d.querySelector('.wa6-section-sub').textContent=v.sub;
    portal.querySelector('.wa6-credit').textContent=v.credit;
    menuHead.textContent=v.navTitle;menuSearch.textContent=v.searchMenu+'  ↗';
    legacy.querySelector('summary').textContent=v.more;
    returnLink.textContent='← '+v.back;
    document.querySelectorAll('[data-wa6-key]').forEach(a=>{
      const key=a.dataset.wa6Key;
      a.querySelector('.wa6-card-title').textContent=v[key]||key;
      a.querySelector('.wa6-card-desc').textContent=v[key+'Desc']||'';
    });
    menuGroups.querySelectorAll('.wa6-menu-group').forEach((g,i)=>g.querySelector('h3').textContent=v[['intro','content','data','personal'][i]]);
  }
  function closeMenu(){
    const c=document.getElementById('waGroupedClose');
    if(grouped.classList.contains('open')) c?.click();
  }
  function openSearch(){
    closeMenu();
    const old=document.getElementById('waMenuSearchOS');
    if(old){old.click();return;}
    const alt=document.getElementById('waSearchOpen');
    if(alt){alt.click();return;}
    location.hash='archivehub';
  }
  function setView() {
    const hash=decodeURIComponent((location.hash||'').slice(1));
    const home = !hash || ['top','wa6Home','xHome','wa50Home'].includes(hash);
    document.body.classList.toggle('wa6-home-mode',home);
    document.body.classList.toggle('wa6-archive-mode',!home);
    if (home) {
      requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'instant'}));
    } else {
      // Give the browser one frame to unhide the original archive before scrolling to its anchor.
      requestAnimationFrame(()=>requestAnimationFrame(()=>document.getElementById(hash)?.scrollIntoView({block:'start',behavior:'instant'})));
    }
    closeMenu();
  }
  search.addEventListener('click',openSearch);
  menuSearch.addEventListener('click',openSearch);
  grouped.addEventListener('click',e=>{
    const a=e.target.closest('.wa6-menu-content a');
    if(a)closeMenu();
  });
  document.addEventListener('click',e=>{
    const b=e.target.closest('#waMajorDock [data-major]');
    if(!b)return;
    if (b.dataset.major==='members') {
      e.preventDefault();e.stopImmediatePropagation();
      const u=new URL('./members/',location.href);u.searchParams.set('lang',locale());location.assign(u.href);return;
    }
    const route={home:'wa6Home',today:'wa-auto-hub'}[b.dataset.major];
    if(!route)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(location.hash!=='#'+route)location.hash=route;
    else setView();
  },true);
  window.addEventListener('hashchange',setView);
  // Existing language switchers mutate <html lang>; no listeners replaced.
  const langWatcher=new MutationObserver(()=>render());
  langWatcher.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  render();setView();
  document.body.classList.add('wa6-ready');
  window.__waHome61={version:'6.1',goHome:()=>{location.hash='wa6Home';setView();}};
})();
