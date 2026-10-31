/* WAV ARCHIVE · 5.10 About HOME and connected Search OS.
 * Display/navigation layer only. Does not change archive datasets, member cards,
 * search index builders, member 360 internals, or existing event listeners.
 */
(() => {
  'use strict';
  if (window.WAVHomeSearch59) return;
  const qp = new URLSearchParams(location.search);
  if (qp.has('wa57_all') || qp.has('wa59_original')) return;

  const dictionary = {
  "ko": {
    "kicker": "WAV ARCHIVE · tripleS FAN ARCHIVE",
    "hero": "좋아해서 찾아본 기록,<br>한곳에 모았습니다",
    "desc": "멤버를 알아가다 보면 노래가 궁금해지고, 노래를 듣다 보면 디멘션과 Gravity가 궁금해집니다 여기저기 흩어져 있던 정보를 한곳에서 보고 싶어 WAV ARCHIVE를 만들었습니다",
    "search": "SEARCH OS 열기",
    "browse": "아카이브 살펴보기",
    "introLabel": "ABOUT tripleS",
    "introTitle": "24명이 함께 만드는 tripleS",
    "intro1": "tripleS는 모드하우스(MODHAUS) 소속의 24인조 걸그룹입니다 멤버마다 공개 순서에 따라 S01부터 S24까지 번호가 붙어 있고, 24명 완전체 활동과 다양한 디멘션 활동을 함께 이어가고 있습니다",
    "intro2": "한 번 정해진 조합만 활동하는 그룹은 아닙니다 곡과 콘셉트에 따라 여러 멤버가 새로운 유닛을 구성하고, 그중 일부는 팬들의 투표를 통해 결정됩니다 처음엔 낯선 방식일 수 있지만, 알아갈수록 각 활동이 어떻게 연결되는지 보는 재미가 있습니다",
    "timelineTag": "RECORDS",
    "timelineText": "2022년 첫 멤버 공개를 시작으로, 디멘션의 음반과 콘텐츠, 24인 완전체의 활동까지 기록이 이어져 왔습니다",
    "termsLabel": "TRIPLES GUIDE",
    "termsTitle": "처음 보는 말이 있다면",
    "termsDesc": "tripleS를 찾아보다 자주 마주치는 용어만 먼저 정리했습니다",
    "terms": [
      [
        "S01–S24",
        "멤버를 구분하는 번호입니다 공개된 순서대로 부여됩니다"
      ],
      [
        "DIMENSION",
        "멤버들이 특정 음반과 콘셉트로 활동하는 유닛을 말합니다"
      ],
      [
        "Gravity",
        "WAV가 참여하는 공식 투표입니다 유닛 구성이나 활동에 관한 선택이 이뤄집니다"
      ],
      [
        "Objekt",
        "COSMO에서 수집·관리하는 tripleS 디지털 포토카드입니다"
      ],
      [
        "COMO",
        "Gravity 투표에 사용하는 포인트입니다 Objekt와 연결되는 시스템입니다"
      ],
      [
        "COSMO",
        "Objekt 관리와 Gravity 참여 등에 사용하는 공식 앱입니다"
      ],
      [
        "WAV",
        "tripleS 팬덤명입니다 이 사이트도 한 명의 WAV가 만들었습니다"
      ],
      [
        "SIGNAL · HAUS",
        "SIGNAL은 멤버들의 일상을 만나는 영상 콘텐츠, HAUS는 멤버들이 함께 지내는 공간을 뜻합니다"
      ]
    ],
    "why": "PROJECT NOTE",
    "whyTitle": "WAV ARCHIVE를 만든 이유",
    "why1": "처음부터 이렇게 큰 사이트를 만들 생각은 없었습니다 좋아하는 멤버의 사진과 영상을 찾아보고, 활동을 하나씩 알아가는 게 시작이었어요 그런데 디멘션이 늘어나고, Gravity 결과나 예전 콘텐츠를 다시 찾아보려니 정보가 여러 곳에 나뉘어 있더라고요",
    "why2": "그래서 제가 궁금했던 것부터 직접 정리하기 시작했습니다 멤버와 음반을 연결하고, 영상과 활동 기록을 모으고, 공식 일정도 달력으로 볼 수 있게 했습니다 지금도 필요한 자료를 조금씩 보완하며 운영하고 있습니다",
    "who": "CREATED BY @bbangshion",
    "whoTitle": "제작자 이야기",
    "who1": "안녕하세요, 빵시온입니다 tripleS를 좋아하는 WAV이고, 제가 찾아보고 정리한 자료를 다른 분들도 편하게 볼 수 있으면 좋겠다는 마음으로 이 사이트를 만들었습니다",
    "who2": "WAV ARCHIVE는 개인이 운영하는 비공식 팬 프로젝트입니다 누락된 내용이나 오류가 있으면 계속 수정해 나가고 있습니다 이 사이트를 처음 찾은 분도, 오래 좋아해 온 WAV도 필요한 기록을 편하게 찾을 수 있었으면 합니다",
    "instagram": "인스타그램에서 보기",
    "functions": "아카이브 둘러보기",
    "functionsDesc": "자세한 기록은 각 메뉴에서 확인할 수 있습니다",
    "categories": [
      [
        "MEMBERS",
        "24명 프로필과 활동 이력"
      ],
      [
        "DIMENSION",
        "유닛 구성과 디멘션 계보"
      ],
      [
        "GRAVITY",
        "투표 기록과 분석"
      ],
      [
        "OBJEKT",
        "카탈로그와 개인 컬렉션"
      ],
      [
        "SIGNAL",
        "공식 영상 탐색"
      ],
      [
        "CALENDAR",
        "발표된 일정과 지난 활동"
      ],
      [
        "HISTORY",
        "연도별 통합 연대표"
      ],
      [
        "MY WAV",
        "즐겨찾기와 개인 기록"
      ]
    ],
    "policy": "공식 자료와 팬이 정리한 기록은 구분해 표시합니다 이 사이트는 MODHAUS·tripleS의 공식 서비스가 아닙니다",
    "tabs": [
      "통합 검색",
      "연결 탐색"
    ],
    "connectedHelp": "기존 SEARCH THE UNIVERSE 검색과 연결 경로를 그대로 이용합니다",
    "detail": "프로필 열기"
  },
  "en": {
    "kicker": "WAV ARCHIVE · tripleS FAN ARCHIVE",
    "hero": "The records I looked up<br>as a WAV, now in one place",
    "desc": "One member leads to a song; one song leads to a DIMENSION or a Gravity result I built WAV ARCHIVE so those scattered records would be easier to find together",
    "search": "Open Search OS",
    "browse": "Explore the archive",
    "introLabel": "ABOUT tripleS",
    "introTitle": "24 members, one tripleS",
    "intro1": "tripleS is a 24-member group under MODHAUS Members are numbered S01 through S24 in the order they were revealed They work both as a full group and in smaller DIMENSION units",
    "intro2": "The lineups are not always fixed Different members come together for new releases and concepts, and fans help decide some choices through official voting Once you get used to the system, following how each activity connects becomes part of the fun",
    "timelineTag": "RECORDS",
    "timelineText": "From the first member reveal in 2022 to unit releases and all-24 activities, the group has built a growing history",
    "termsLabel": "TRIPLES GUIDE",
    "termsTitle": "A few terms worth knowing",
    "termsDesc": "A quick guide to the words you will see around tripleS",
    "terms": [
      [
        "S01–S24",
        "Member numbers assigned in reveal order"
      ],
      [
        "DIMENSION",
        "A member lineup promoting a particular release or concept"
      ],
      [
        "Gravity",
        "Official votes in which WAV take part in certain group decisions"
      ],
      [
        "Objekt",
        "tripleS digital photocards collected through COSMO"
      ],
      [
        "COMO",
        "Voting points connected to the Objekt system"
      ],
      [
        "COSMO",
        "The official app for Objekt management and Gravity participation"
      ],
      [
        "WAV",
        "The name of the tripleS fandom"
      ],
      [
        "SIGNAL · HAUS",
        "SIGNAL is the group’s everyday video content; HAUS refers to the shared living spaces"
      ]
    ],
    "why": "PROJECT NOTE",
    "whyTitle": "Why I built WAV ARCHIVE",
    "why1": "It did not start as a big website I was looking through photos and videos of the members I liked, then trying to understand earlier releases and units As I dug deeper, I kept finding useful information in different places",
    "why2": "So I started organizing the things I wanted to look up myself: members and music, videos and timelines, Gravity records and schedules I keep updating the archive as I find and verify more",
    "who": "CREATED BY @bbangshion",
    "whoTitle": "A note from the creator",
    "who1": "Hi, I’m bbangshion I’m a WAV who wanted to make the things I kept looking up easier for other fans to find, too",
    "who2": "This is an independent fan project I still fix errors and fill gaps as I find them Whether you are new to tripleS or have followed them for years, I hope you find a record worth revisiting",
    "instagram": "Find me on Instagram",
    "functions": "Explore the archive",
    "functionsDesc": "Open a section for its full records and tools",
    "categories": [
      [
        "MEMBERS",
        "Profiles and member histories"
      ],
      [
        "DIMENSION",
        "Units and their connections"
      ],
      [
        "GRAVITY",
        "Voting results and analysis"
      ],
      [
        "OBJEKT",
        "Catalogue and collections"
      ],
      [
        "SIGNAL",
        "Official video explorer"
      ],
      [
        "CALENDAR",
        "Schedules and past events"
      ],
      [
        "HISTORY",
        "Activity timeline"
      ],
      [
        "MY WAV",
        "Favorites and saved records"
      ]
    ],
    "policy": "Official announcements and fan-collected records are labeled separately This is not an official MODHAUS or tripleS service",
    "tabs": [
      "Archive search",
      "Connected search"
    ],
    "connectedHelp": "The original SEARCH THE UNIVERSE is available here, unchanged",
    "detail": "Open profile"
  },
  "ja": {
    "kicker": "WAV ARCHIVE · tripleS FAN ARCHIVE",
    "hero": "WAVとして調べてきた記録を<br>ひとつの場所に",
    "desc": "メンバーを知ると曲が気になり、曲を聴くとDIMENSIONやGravityの記録も気になります。散らばった情報をまとめて見たくて、WAV ARCHIVEを作りました",
    "search": "SEARCH OSを開く",
    "browse": "アーカイブを見る",
    "introLabel": "ABOUT tripleS",
    "introTitle": "24人でつくるtripleS",
    "intro1": "tripleSはMODHAUS所属の24人組ガールズグループです。メンバーには公開順にS01からS24までの番号があり、24人全員での活動とさまざまなDIMENSIONでの活動を行っています",
    "intro2": "活動する組み合わせはいつも同じではありません。作品やコンセプトごとに新しいユニットが生まれ、その一部はファン投票で決まります。仕組みを知るほど、活動のつながりを追う楽しさがあります",
    "timelineTag": "RECORDS",
    "timelineText": "2022年の最初のメンバー公開から、ユニット作品や24人全員での活動まで記録が積み重なっています",
    "termsLabel": "TRIPLES GUIDE",
    "termsTitle": "よく出てくる言葉",
    "termsDesc": "tripleSを知るうえで押さえておきたい用語をまとめました",
    "terms": [
      [
        "S01–S24",
        "メンバーの公開順につけられた番号"
      ],
      [
        "DIMENSION",
        "作品やコンセプトごとに活動するユニット"
      ],
      [
        "Gravity",
        "WAVが参加する公式投票"
      ],
      [
        "Objekt",
        "COSMOで集められるデジタルフォトカード"
      ],
      [
        "COMO",
        "Objektと関係する投票ポイント"
      ],
      [
        "COSMO",
        "Objekt管理やGravity参加のための公式アプリ"
      ],
      [
        "WAV",
        "tripleSのファンダム名"
      ],
      [
        "SIGNAL · HAUS",
        "SIGNALは日常を伝える映像コンテンツ、HAUSはメンバーの共同生活空間"
      ]
    ],
    "why": "PROJECT NOTE",
    "whyTitle": "WAV ARCHIVEを作った理由",
    "why1": "最初から大きなサイトを作るつもりはありませんでした。好きなメンバーの写真や動画を見て、過去の作品やユニットを調べることから始まりました。調べるほど、必要な情報がいろいろな場所に分かれていると感じたんです",
    "why2": "それなら自分でまとめてみようと思い、メンバーと音楽、映像と活動年表、Gravityの記録やスケジュールを少しずつ整理してきました。今も確認できた情報を追加・修正しています",
    "who": "CREATED BY @bbangshion",
    "whoTitle": "制作者について",
    "who1": "こんにちは、bbangshionです。自分が何度も調べていたことを、ほかのWAVも探しやすくできたらと思って作りました",
    "who2": "個人で運営する非公式ファンプロジェクトです。間違いや抜けている情報は見つけ次第直しています。初めての方も長く応援している方も、必要な記録を見つけられる場所になればうれしいです",
    "instagram": "Instagramを見る",
    "functions": "アーカイブを探す",
    "functionsDesc": "詳しい情報は各メニューから確認できます",
    "categories": [
      [
        "MEMBERS",
        "プロフィールと活動記録"
      ],
      [
        "DIMENSION",
        "ユニットとつながり"
      ],
      [
        "GRAVITY",
        "投票結果と分析"
      ],
      [
        "OBJEKT",
        "カタログとコレクション"
      ],
      [
        "SIGNAL",
        "公式映像検索"
      ],
      [
        "CALENDAR",
        "公式発表スケジュール"
      ],
      [
        "HISTORY",
        "活動年表"
      ],
      [
        "MY WAV",
        "お気に入りと個人記録"
      ]
    ],
    "policy": "公式発表とファンがまとめた記録は区別しています。MODHAUSやtripleSの公式サービスではありません",
    "tabs": [
      "統合検索",
      "つながり検索"
    ],
    "connectedHelp": "従来のSEARCH THE UNIVERSEをそのまま使えます",
    "detail": "プロフィールを見る"
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
    const t = dictionary[lang], id = `wa510-${rootId}`;
    const terms = t.terms.map((pair,i)=>`<article class="wa510-term"><span class="wa510-term-index">${String(i+1).padStart(2,'0')}</span><div><h3>${safe(pair[0])}</h3><p>${safe(pair[1])}</p></div></article>`).join('');
    return `<div class="wa59-wrap wa510-wrap">
      <section class="wa510-hero" aria-label="WAV ARCHIVE introduction">
        <div class="wa510-hero-copy">
          <span class="wa59-kicker">${safe(t.kicker)}</span>
          <h1>${t.hero}</h1>
          <p>${safe(t.desc)}</p>
          <div class="wa59-actions"><button type="button" data-wa59-search>${safe(t.search)} <span aria-hidden="true">→</span></button><a href="#${id}-features" data-wa59-features>${safe(t.browse)} <span aria-hidden="true">↓</span></a></div>
          <div class="wa510-hero-micro"><span>24 MEMBERS</span><span>WAV · FAN MADE</span><span>KO / EN / JA</span></div>
        </div><div class="wa510-hero-art" aria-hidden="true"><div class="wa510-orbit a"></div><div class="wa510-orbit b"></div><div class="wa510-planet"><span>24</span><small>tripleS</small></div></div>
      </section>
      <section class="wa510-section wa510-intro" id="${id}-about" aria-label="About tripleS">
        <div class="wa510-section-heading"><span class="wa59-overline">${safe(t.introLabel)}</span><h2>${safe(t.introTitle)}</h2></div>
        <div class="wa510-editorial"><p>${safe(t.intro1)}</p><p>${safe(t.intro2)}</p></div>
        <div class="wa510-history-note"><span>${safe(t.timelineTag)}</span><p>${safe(t.timelineText)}</p><a href="#timeline" data-wa59-route="history">TIMELINE <i aria-hidden="true">↗</i></a></div>
      </section>
      <section class="wa510-section wa510-terms" id="${id}-terms"><div class="wa510-section-heading"><span class="wa59-overline">${safe(t.termsLabel)}</span><h2>${safe(t.termsTitle)}</h2><p>${safe(t.termsDesc)}</p></div><div class="wa510-terms-grid">${terms}</div></section>
      <section class="wa510-section wa510-background" id="${id}-background"><div class="wa510-section-heading"><span class="wa59-overline">${safe(t.why)}</span><h2>${safe(t.whyTitle)}</h2></div><div class="wa510-editorial"><p>${safe(t.why1)}</p><p>${safe(t.why2)}</p></div></section>
      <section class="wa510-section wa510-creator" id="${id}-creator"><div class="wa510-avatar" aria-hidden="true">b</div><div><span class="wa59-overline">${safe(t.who)}</span><h2>${safe(t.whoTitle)}</h2><p>${safe(t.who1)}</p><p>${safe(t.who2)}</p><a class="wa59-instagram" href="https://www.instagram.com/bbangshion/" target="_blank" rel="noopener noreferrer">@bbangshion · ${safe(t.instagram)} ↗</a></div></section>
      <section class="wa510-section wa59-feature-section" id="${id}-features" aria-label="${safe(t.functions)}"><div class="wa59-feature-head"><span class="wa59-overline">WAV ARCHIVE</span><h2>${safe(t.functions)}</h2><p>${safe(t.functionsDesc)}</p></div>
      <div class="wa59-feature-grid">${t.categories.map((row,i)=>`<a class="wa59-feature" href="${routes[i].href}" ${routes[i].route?`data-wa59-route="${routes[i].route}"`:''}><b>${safe(row[0])}</b><span>${safe(row[1])}</span><em aria-hidden="true">↗</em></a>`).join('')}</div></section>
      <footer class="wa59-footer">${safe(t.policy)}<br>CREATED BY @bbangshion</footer>
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
  const switchSearch = (mode, initialQuery='') => {
    const layer=document.getElementById('waSearchLayer');
    const tabs=document.getElementById('wa59-search-tabs');
    if(!layer || !tabs) return;
    layer.dataset.wa510Mode=mode;
    tabs.querySelectorAll('[data-wa510-tab]').forEach(b=>{
      const on=b.dataset.wa510Tab===mode;
      b.setAttribute('aria-selected',String(on));
      b.setAttribute('aria-current',on?'page':'false');
    });
    const target=mode==='connected'?document.getElementById('wa40Input'):document.getElementById('waGlobalSearch');
    if(target && initialQuery && !target.value){target.value=initialQuery;target.dispatchEvent(new Event('input',{bubbles:true}));}
    if(target)window.requestAnimationFrame(()=>{try{target.focus({preventScroll:true})}catch(_){target.focus()}});
    const shell=layer.querySelector('.wa-search-shell'); if(shell) shell.scrollTop=0;
  };
  function openConnected() {
    const current=document.getElementById('waGlobalSearch')?.value || '';
    const layer=document.getElementById('waSearchLayer');
    if(layer && !layer.classList.contains('open'))openSearch();
    switchSearch('connected',current);
  }
  function mountOriginalConnected() {
    const layer=document.getElementById('waSearchLayer');
    const shell=layer?.querySelector('.wa-search-shell');
    const head=shell?.querySelector('.wa-search-head');
    const source=document.getElementById('archivehub');
    if(!layer || !shell || !head || !source) return false;
    let panel=document.getElementById('wa510-connected-panel');
    if(!panel){panel=document.createElement('div');panel.id='wa510-connected-panel';panel.setAttribute('aria-label','SEARCH THE UNIVERSE');shell.appendChild(panel);}
    // Move the actual existing element; never clone it. Its original listeners remain intact.
    if(source.parentElement!==panel)panel.appendChild(source);
    source.classList.add('wa510-embedded');
    return true;
  }
  function addSearchTabs() {
    const layer=document.getElementById('waSearchLayer');
    const shell=layer?.querySelector('.wa-search-shell');
    const head=shell?.querySelector('.wa-search-head');
    if(!layer||!shell||!head)return;
    let tabs=document.getElementById('wa59-search-tabs');
    if(!tabs){
      tabs=document.createElement('div'); tabs.id='wa59-search-tabs'; tabs.className='wa59-search-tabs';
      tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Search modes');
      tabs.innerHTML='<button type="button" role="tab" data-wa510-tab="global" aria-selected="true" aria-current="page"></button><button type="button" role="tab" data-wa510-tab="connected" aria-selected="false"></button>';
      head.insertAdjacentElement('afterend',tabs);
      tabs.querySelectorAll('[data-wa510-tab]').forEach(btn=>btn.addEventListener('click',()=>switchSearch(btn.dataset.wa510Tab)));
    }
    mountOriginalConnected();
    layer.dataset.wa510Mode ||= 'global';
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
      if(target.closest('[data-wa59-search]')){ev.preventDefault();openSearch();switchSearch('global');return;}
      if(target.closest('[data-wa59-features]')){
        ev.preventDefault();const root=target.closest('.wa59-landing');root?.querySelector('.wa59-feature-section')?.scrollIntoView({block:'start',behavior:'smooth'});return;
      }
    });
    // Existing #archivehub links now open the real, preserved connected explorer in Search OS.
    // Capturing at window level runs before the legacy document-level section router.
    window.addEventListener('click',ev=>{
      if(!(ev.target instanceof Element))return;
      const link=ev.target.closest('a[href],button[data-wa50-go],button[data-go]');
      if(!link || link.closest('#waSearchLayer'))return;
      const href=link.getAttribute('href');
      const attr=link.getAttribute('data-wa50-go')||link.getAttribute('data-go');
      if(href==='#archivehub' || attr==='archivehub'){
        ev.preventDefault();ev.stopPropagation();
        document.getElementById('waGroupedClose')?.click();
        openConnected();return;
      }
      if(href==='#about'||href==='#creator'){
        ev.preventDefault();ev.stopPropagation();
        document.getElementById('waGroupedClose')?.click();
        window.WAVFocus57?.open?.('home');
        const id=(href==='#about'?'about':'creator');
        window.requestAnimationFrame(()=>{
          const primary=['xHome','wa50Home'].find(root=>document.getElementById(root)?.getAttribute('data-wa57-show')!==null)||'xHome';
          const anchor=document.getElementById(`wa510-${primary}-${id}`)||document.querySelector(`.wa510-${id}`);
          anchor?.scrollIntoView({behavior:'smooth',block:'start'});
        });
        return;
      }
    },true);
    // Original connected results may open member modal via legacy capture listeners.
    // Dismiss Search OS after the result is selected without intercepting those handlers.
    window.addEventListener('click',ev=>{
      if(ev.target instanceof Element && ev.target.closest('#wa510-connected-panel .wa40-result, #wa510-connected-panel [data-wa40go]')) {
        window.setTimeout(closeSearch,0);
      }
    },true);
    window.addEventListener('hashchange',()=>{
      if(location.hash==='#archivehub'){openConnected();}
    });
    if(location.hash==='#archivehub')openConnected();
    document.addEventListener('click',resultClick,true);
    document.addEventListener('wa:language',renderLandings);
    const obs=new MutationObserver(m=>{if(m.some(x=>x.attributeName==='data-language'||x.attributeName==='lang'))renderLandings();});
    obs.observe(document.documentElement,{attributes:true,attributeFilter:['data-language','lang']});
    // Robust fallback for menu Search OS links already provided by the site.
    window.WAVHomeSearch59=Object.freeze({version:'5.10.0',openSearch,openConnected});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();


/* WAV ARCHIVE · msnz/LOVE&POP official release update · 2026-11-01
 * Existing album HTML, card styling, navigation, search and data engines are preserved
 * Only the stale November album chapter text and official reference links are updated
 */
(function () {
  'use strict';
  if (window.__waMsnzNov1) return;
  window.__waMsnzNov1 = true;
  const strings = {
    ko: {
      intro: 'msnz의 네 유닛이 참여한 일본 오리지널 싱글이 모두 공개됐습니다 2026년 8월부터 11월까지 매월 1일 발매된 네 곡은 2027년 1월 27일 발매 예정인 일본 첫 정규 앨범으로 이어집니다',
      album: 'JAPAN 1ST FULL ALBUM · 발매 예정',
      chapter: 'CHAPTER 04 · 2026.11.01',
      theme: '崩壊 · 붕괴',
      description: '믿었던 이상이 무너지는 순간, 자신의 선택과 바람을 다시 마주하는 이야기를 담은 네 번째 곡',
      noteTitle: '현재 공개 상태',
      note: 'Dream Dress · DNA · Welcome to Heaven · See You, 네 곡 모두 공개 완료 · 일본 정규 1집 2027.01.27 발매 예정',
      listen: 'See You 듣기',
      official: 'zenith 공식 안내',
      albumInfo: '정규 앨범 공식 안내',
      concert: '2027.02.11 · 24명 완전체 일본 공연 예정 · 장소 및 티켓 정보 추후 공개'
    },
    en: {
      intro: 'All four msnz original Japanese singles are now available Each unit released a track on the first of the month from August to November 2026, leading to the Japan 1st full album scheduled for January 27, 2027',
      album: 'JAPAN 1ST FULL ALBUM · SCHEDULED',
      chapter: 'CHAPTER 04 · 2026.11.01',
      theme: '崩壊 · Collapse',
      description: 'A fourth chapter about questioning the ideals you trusted and confronting your own choices and wishes',
      noteTitle: 'Release status',
      note: 'Dream Dress · DNA · Welcome to Heaven · See You — all four chapters released · Japan 1st full album scheduled for 2027.01.27',
      listen: 'Listen to See You',
      official: 'Official zenith news',
      albumInfo: 'Official album news',
      concert: '2027.02.11 · Full-group concert in Japan announced · Venue and tickets to follow'
    },
    ja: {
      intro: 'msnzの4ユニットによる日本オリジナル楽曲がすべて配信されました 2026年8月から11月まで毎月1日に公開された4曲は、2027年1月27日発売予定の日本1stフルアルバムへとつながります',
      album: '日本1stフルアルバム · 発売予定',
      chapter: 'CHAPTER 04 · 2026.11.01',
      theme: '崩壊',
      description: '信じていた理想が崩れるなか、自分の選択と願いに向き合う第4章',
      noteTitle: '公開状況',
      note: 'Dream Dress · DNA · Welcome to Heaven · See You の4曲がすべて配信済み · 日本1stフルアルバムは2027.01.27発売予定',
      listen: 'See Youを聴く',
      official: 'zenith公式情報',
      albumInfo: 'アルバム公式情報',
      concert: '2027.02.11 · 24人完全体の日本公演開催予定 · 会場とチケット情報は後日発表'
    }
  };
  function currentLang() {
    const buttons = document.querySelectorAll('[data-lang], [data-language], .lang-btn, .lang-switch button');
    for (const b of buttons) {
      if (!b.classList.contains('active') && b.getAttribute('aria-pressed') !== 'true' && !b.classList.contains('is-active')) continue;
      const t = String(b.dataset.lang || b.dataset.language || b.textContent || '').trim().toLowerCase();
      if (t === 'ja' || t === '日' || t === '日本語') return 'ja';
      if (t === 'en' || t === 'english') return 'en';
      if (t === 'ko' || t === '한' || t === '한국어') return 'ko';
    }
    const l = String(document.documentElement.getAttribute('lang') || 'ko').toLowerCase();
    return l.startsWith('ja') ? 'ja' : l.startsWith('en') ? 'en' : 'ko';
  }
  function replaceText(root, selector, value) {
    const n = root.querySelector(selector);
    if (n) n.textContent = value;
  }
  function makeLink(text, url) {
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = text;
    return a;
  }
  function update() {
    const section = document.getElementById('wa50JapanAlbum');
    if (!section) return;
    const x = strings[currentLang()] || strings.ko;
    replaceText(section, '.wa50-jp-head .lead', x.intro);
    replaceText(section, '.wa50-jp-badge b', '2027.01.27');
    replaceText(section, '.wa50-jp-badge small', x.album);
    const chapters = section.querySelectorAll('.wa50-jp-story .wa50-jp-ch');
    if (chapters.length >= 4) {
      const third = chapters[2], fourth = chapters[3];
      third.classList.remove('current'); third.classList.add('done');
      fourth.classList.remove('future', 'done'); fourth.classList.add('current');
      replaceText(fourth, 'span', x.chapter);
      replaceText(fourth, 'h3', 'zenith · See You');
      replaceText(fourth, 'b', x.theme);
      replaceText(fourth, 'p', x.description);
    }
    replaceText(section, '.wa50-jp-note b', x.noteTitle);
    replaceText(section, '.wa50-jp-note span', x.note);
    let links = section.querySelector('#wa-msnz-nov01-sources');
    if (!links) {
      links = document.createElement('div');
      links.id = 'wa-msnz-nov01-sources';
      links.setAttribute('aria-label', 'Sony Music Japan official references');
      links.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin:18px 0 0;font-size:12px;line-height:1.65';
      const note = section.querySelector('.wa50-jp-note');
      (note || section.querySelector('.wrap') || section).after(links);
      // Keep DOM inside the same wrapping element
      if (note && note.parentElement) note.insertAdjacentElement('afterend', links);
    }
    links.replaceChildren(
      makeLink(x.listen, 'https://tripleS.lnk.to/SeeYou'),
      makeLink(x.official, 'https://www.sonymusic.co.jp/artist/tripleS/info/588157'),
      makeLink(x.albumInfo, 'https://www.sonymusic.co.jp/artist/tripleS/info/588155')
    );
    for (const a of links.querySelectorAll('a')) {
      a.style.cssText = 'color:#f1badb;text-decoration:none;padding:7px 10px;border:1px solid rgba(255,155,205,.23);border-radius:999px;background:rgba(255,155,205,.045)';
    }
    let concert = section.querySelector('#wa-msnz-nov01-concert');
    if (!concert) {
      concert = document.createElement('p'); concert.id = 'wa-msnz-nov01-concert';
      concert.style.cssText = 'font-size:12px;line-height:1.7;color:#bcb4c2;margin:10px 0 0';
      links.insertAdjacentElement('afterend', concert);
    }
    concert.textContent = x.concert;
    section.setAttribute('data-wa-msnz-verified', '2026-11-01');
  }
  function init() {
    update();
    document.addEventListener('wa:language', () => setTimeout(update, 0));
    document.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-lang], [data-language], .lang-btn, .lang-switch button');
      if (b) setTimeout(update, 90);
    }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
