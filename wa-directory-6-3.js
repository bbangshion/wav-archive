/* WAV ARCHIVE · independent member & dimension directories
   Data: a preserved extract of existing member & unit cards. This module does NOT touch original member-card handlers, localStorage collection data, or Gravity/Objekt/SIGNAL logic. */
(() => {
  'use strict';
  if (window.__wa63Directory) return;
  const page = document.body.dataset.page;
  if (!['members', 'dimensions'].includes(page)) return;
  const DATA = {"source":"Existing WAV ARCHIVE member and dimension cards (2026-10-31 snapshot)","members":[{"id":"S01","name":"윤서연","english":"SeoYeon","birthday":"2003-08-06","units":["+(KR)ystal Eyes","ACID EYES","LOVElution","neptune","MSNZ"],"image":"../assets/member-profiles/2026-10/S01.webp"},{"id":"S02","name":"정혜린","english":"HyeRin","birthday":"2007-04-12","units":["AAA","ACID EYES","LOVElution","Visionary Vision","sun","MSNZ"],"image":"../assets/member-profiles/2026-10/S02.webp"},{"id":"S03","name":"이지우","english":"JiWoo","birthday":"2005-10-24","units":["+(KR)ystal Eyes","ACID EYES","EVOLution","Aria","∞!","zenith","MSNZ"],"image":"../assets/member-profiles/2026-10/S03.webp"},{"id":"S04","name":"김채연","english":"ChaeYeon","birthday":"2004-12-04","units":["+(KR)ystal Eyes","ACID EYES","EVOLution","Aria","∞!","sun","MSNZ"],"image":"../assets/member-profiles/2026-10/S04.webp"},{"id":"S05","name":"김유연","english":"YooYeon","birthday":"2001-02-09","units":["AAA","ACID EYES","EVOLution","Visionary Vision","∞!","Alphie","sun","MSNZ"],"image":"../assets/member-profiles/2026-10/S05.webp"},{"id":"S06","name":"김수민","english":"SooMin","birthday":"2007-10-03","units":["+(KR)ystal Eyes","ACID EYES","EVOLution","∞!","zenith","MSNZ"],"image":"../assets/member-profiles/2026-10/S06.webp"},{"id":"S07","name":"김나경","english":"NaKyoung","birthday":"2002-10-13","units":["AAA","ACID EYES","EVOLution","Visionary Vision","neptune","MSNZ"],"image":"../assets/member-profiles/2026-10/S07.webp"},{"id":"S08","name":"공유빈","english":"YuBin","birthday":"2005-02-03","units":["AAA","ACID EYES","LOVElution","Visionary Vision","zenith","MSNZ"],"image":"../assets/member-profiles/2026-10/S08.webp"},{"id":"S09","name":"카에데","english":"Kaede","birthday":"2005-12-20","units":["LOVElution","Aria","Visionary Vision","moon","MSNZ"],"image":"../assets/member-profiles/2026-10/S09.webp"},{"id":"S10","name":"서다현","english":"DaHyun","birthday":"2003-01-08","units":["LOVElution","Aria","neptune","MSNZ"],"image":"../assets/member-profiles/2026-10/S10.webp"},{"id":"S11","name":"코토네","english":"Kotone","birthday":"2004-03-10","units":["EVOLution","Visionary Vision","∞!","Alphie","neptune","MSNZ"],"image":"../assets/member-profiles/2026-10/S11.webp"},{"id":"S12","name":"곽연지","english":"YeonJi","birthday":"2008-01-08","units":["EVOLution","Visionary Vision","zenith","MSNZ"],"image":"../assets/member-profiles/2026-10/S12.webp"},{"id":"S13","name":"니엔","english":"Nien","birthday":"2003-06-02","units":["LOVElution","Aria","Visionary Vision","Alphie","neptune","MSNZ"],"image":"../assets/member-profiles/2026-10/S13.webp"},{"id":"S14","name":"박소현","english":"SoHyun","birthday":"2002-10-13","units":["LOVElution","Visionary Vision","moon","MSNZ"],"image":"../assets/member-profiles/2026-10/S14.webp"},{"id":"S15","name":"신위","english":"Xinyu","birthday":"2002-05-25","units":["LOVElution","Visionary Vision","sun","MSNZ"],"image":"../assets/member-profiles/2026-10/S15.webp"},{"id":"S16","name":"마유","english":"Mayu","birthday":"2002-05-12","units":["EVOLution","∞!","sun","MSNZ"],"image":"../assets/member-profiles/2026-10/S16.webp"},{"id":"S17","name":"린","english":"Lynn","birthday":"2006-04-12","units":["NXT","Visionary Vision","Alphie","moon","MSNZ"],"image":"../assets/member-profiles/2026-10/S17.webp"},{"id":"S18","name":"주빈","english":"JooBin","birthday":"2009-01-16","units":["NXT","zenith","MSNZ"],"image":"../assets/member-profiles/2026-10/S18.webp"},{"id":"S19","name":"정하연","english":"HaYeon","birthday":"2007-08-01","units":["NXT","Alphie","zenith","MSNZ"],"image":"../assets/member-profiles/2026-10/S19.webp"},{"id":"S20","name":"박시온","english":"ShiOn","birthday":"2006-04-03","units":["NXT","∞!","Alphie","moon","MSNZ"],"image":"../assets/member-profiles/2026-10/S20.webp"},{"id":"S21","name":"김채원","english":"ChaeWon","birthday":"2007-05-02","units":["Glow","∞!","Alphie","sun","MSNZ"],"image":"../assets/member-profiles/2026-10/S21.webp"},{"id":"S22","name":"설린","english":"Sullin","birthday":"2006-11-30","units":["Glow","moon","MSNZ"],"image":"../assets/member-profiles/2026-10/S22.webp"},{"id":"S23","name":"서아","english":"SeoAh","birthday":"2010-06-11","units":["Glow","neptune","MSNZ"],"image":"../assets/member-profiles/2026-10/S23.webp"},{"id":"S24","name":"지연","english":"JiYeon","birthday":"2004-02-13","units":["Glow","Visionary Vision","Alphie","moon","MSNZ"],"image":"../assets/member-profiles/2026-10/S24.webp"}],"dimensions":[{"id":"D01","name":"AAA","type":"ATOM01","description":"Acid Angel from Asia · Generation","members":["S02","S05","S07","S08"],"url":"https://naver.me/5UG0bWnq"},{"id":"D02","name":"+(KR)ystal Eyes","type":"ATOM01","description":"KRE · AESTHETIC · Touch+","members":["S01","S03","S04","S06"],"url":"https://naver.me/FqH5O3dW"},{"id":"D03","name":"ACID EYES","type":"ATOM01 · PROJECT","description":"AAA × KRE · Cherry Gene","members":["S01","S02","S03","S04","S05","S06","S07","S08"],"url":"https://naver.me/FVbxCFRa"},{"id":"D04","name":"LOVElution","type":"BINARY01","description":"ↀ · Girls' Capitalism","members":["S01","S02","S08","S09","S10","S13","S14","S15"],"url":"https://naver.me/G9sorT0R"},{"id":"D05","name":"EVOLution","type":"BINARY01","description":"⟡ · Invincible","members":["S03","S04","S05","S06","S07","S11","S12","S16"],"url":"https://naver.me/FFiRTb49"},{"id":"D06","name":"NXT","type":"CREAM01","description":"Just Do It · S17—S20","members":["S17","S18","S19","S20"],"url":"https://naver.me/xhKe3ieS"},{"id":"D07","name":"Aria","type":"BALLAD DIMENSION","description":"Structure of Sadness · Door","members":["S03","S04","S09","S10","S13"],"url":"https://naver.me/FfAUU5fC"},{"id":"D08","name":"Glow","type":"DIVINE01","description":"Inner Dance · S21—S24","members":["S21","S22","S23","S24"],"url":"https://naver.me/Gmbo2Cap"},{"id":"D09","name":"Visionary Vision","type":"DIVINE01","description":"Performante · Hit the Floor","members":["S02","S05","S07","S08","S09","S11","S12","S13","S14","S15","S17","S24"],"url":"https://naver.me/FuzZOFzJ"},{"id":"D10","name":"∞!","type":"DIVINE01","description":"일본 활동 DIMENSION · Untitled","members":["S03","S04","S05","S06","S11","S16","S20","S21"],"url":"https://naver.me/GHv1A7gq"},{"id":"D11","name":"Alphie","type":"MSNZ PROJECT","description":"Lit Pop · msnz 프로젝트 유닛","members":["S05","S11","S13","S17","S19","S20","S21","S24"],"url":"https://naver.me/xlbQTrkC"},{"id":"D12","name":"moon","type":"MSNZ","description":"Cameo Love · msnz","members":["S09","S14","S17","S20","S22","S24"],"url":"https://naver.me/x7jeNsMa"},{"id":"D13","name":"sun","type":"MSNZ","description":"Bubble Gum Girl · msnz","members":["S02","S04","S05","S15","S16","S21"],"url":"https://naver.me/5no4m4vM"},{"id":"D14","name":"neptune","type":"MSNZ","description":"Fly Up · msnz","members":["S01","S07","S10","S11","S13","S23"],"url":"https://naver.me/5Bw2bsNU"},{"id":"D15","name":"zenith","type":"MSNZ","description":"Q&A · msnz","members":["S03","S06","S08","S12","S18","S19"],"url":"https://naver.me/FINyjC66"},{"id":"D16","name":"MSNZ","type":"2025 PROJECT","description":"Beyond Beauty · 4개 콘셉트 유닛","members":["S01","S02","S03","S04","S05","S06","S07","S08","S09","S10","S11","S12","S13","S14","S15","S16","S17","S18","S19","S20","S21","S22","S23","S24"],"url":"https://naver.me/FfBfKS4V"}]};
  const STRINGS = {
    ko: {
      home:'홈으로',members:'멤버',dimensions:'디멘션', memberIntro:'24명의 프로필과 디멘션을 한눈에. 카드를 누르면 뒤집히고, DETAIL에서 더 자세히 볼 수 있어요',
      dimensionIntro:'디멘션 16개의 멤버 구성과 주요 프로젝트를 한곳에서 탐색하세요',profiles:'프로필',memberSearch:'이름 · S번호 · 디멘션 검색',dimensionSearch:'디멘션 · 활동 · 멤버 검색',
      dimensionFilter:'디멘션',allDimensions:'전체 디멘션',groupFilter:'분류',allGroups:'전체 분류',reset:'초기화',tapFlip:'카드 탭 → 뒤집기',
      dimensionHint:'유닛을 선택해 연결 멤버 확인',noResults:'검색 결과가 없어요',detail:'DETAIL ↗',returnFront:'다시 앞면',flip:'카드 뒤집기',
      birth:'생년월일',dimensionMembership:'참여 디멘션',memberList:'연결 멤버',fullArchive:'기존 전체 기능 열기 ↗',
      legacyTitle:'기존 멤버 시스템도 그대로 유지돼요',legacyMemberDesc:'원래의 HISTORY · MEMBER 360° · 3D 카드 및 추가 기능은 기존 아카이브에서 이용할 수 있어요',legacyMemberButton:'기존 전체 멤버 아카이브 ↗',
      legacyDimensionTitle:'기존 TIMETREE · DNA도 그대로 유지돼요',legacyDimensionDesc:'기존 관계도·타임트리·디멘션 상세 기능은 원래의 아카이브에서 계속 이용할 수 있어요',legacyDimensionButton:'기존 디멘션 계보·관계도 보기 ↗',
      fanmade:'비공식 팬메이드 아카이브',membersLabel:'멤버',unitDetail:'디멘션 상세',verifiedScope:'기존 WAV ARCHIVE 데이터 기반',
      memberNote:'추가 분석·HISTORY·MEMBER 360° 전체 기능은 기존 아카이브에서 이어서 이용할 수 있어요',
      dimensionNote:'계보·DNA·기존 디멘션 팝업은 원본 아카이브에 보존되어 있어요',
      memberCount:'명', unitsCount:'개', seeMembers:'멤버 보기', source:'원본 상세 보기', detailButton:'상세 정보 보기', close:'닫기'
    },
    en: {
      home:'Home',members:'Members',dimensions:'Dimensions',memberIntro:'Explore 24 member profiles and their dimensions. Flip a card or open DETAIL for more.',
      dimensionIntro:'Explore 16 dimensions, their members, and their projects.',profiles:'Profiles',memberSearch:'Search member, S number, dimension',dimensionSearch:'Search dimension, project, member',
      dimensionFilter:'Dimension',allDimensions:'All dimensions',groupFilter:'Group',allGroups:'All groups',reset:'Reset',tapFlip:'Tap a card to flip',dimensionHint:'Select a unit to view its members',noResults:'No matching results',
      detail:'DETAIL ↗',returnFront:'Flip back',flip:'Flip card',birth:'Date of birth',dimensionMembership:'Dimensions',memberList:'Members',fullArchive:'Open original archive ↗',
      legacyTitle:'All original member features remain available',legacyMemberDesc:'Use the original archive for the full HISTORY, MEMBER 360°, 3D cards, and other tools.',legacyMemberButton:'Full member archive ↗',
      legacyDimensionTitle:'Original TIMETREE and DNA remain available',legacyDimensionDesc:'The original lineage, relationship graph, and detailed unit features are unchanged.',legacyDimensionButton:'Original dimension explorer ↗',
      fanmade:'Unofficial fan archive',membersLabel:'Members',unitDetail:'Dimension details',verifiedScope:'Based on existing WAV ARCHIVE records',memberNote:'For full HISTORY and MEMBER 360° features, continue to the original archive.',dimensionNote:'The original timeline, DNA graph, and dimension pop-ups remain available.',memberCount:' members',unitsCount:' units',seeMembers:'View members',source:'Original details',detailButton:'Show details',close:'Close'
    },
    ja: {
      home:'ホーム',members:'メンバー',dimensions:'ディメンション',memberIntro:'24人のプロフィールと参加ユニットを一覧で確認。カードを裏返したり、詳細を開いたりできます',
      dimensionIntro:'16のディメンションと所属メンバー、活動情報を探せます',profiles:'プロフィール',memberSearch:'名前・S番号・ユニットで検索',dimensionSearch:'ユニット・活動・メンバーで検索',
      dimensionFilter:'ディメンション',allDimensions:'すべて',groupFilter:'分類',allGroups:'すべて',reset:'リセット',tapFlip:'カードをタップして裏返す',dimensionHint:'ユニットを選んでメンバーを確認',noResults:'該当する記録はありません',
      detail:'DETAIL ↗',returnFront:'表面に戻る',flip:'カードを裏返す',birth:'生年月日',dimensionMembership:'参加ユニット',memberList:'メンバー',fullArchive:'元のアーカイブを開く ↗',
      legacyTitle:'従来のメンバー機能はすべて残っています',legacyMemberDesc:'HISTORYやMEMBER 360°など、詳細機能は従来のアーカイブから利用できます',legacyMemberButton:'従来のメンバーページ ↗',
      legacyDimensionTitle:'TIMETREEとDNAはそのまま利用できます',legacyDimensionDesc:'従来の系譜・関係図・ユニット詳細機能も残っています',legacyDimensionButton:'従来のディメンションページ ↗',
      fanmade:'非公式ファンアーカイブ',membersLabel:'メンバー',unitDetail:'ディメンション詳細',verifiedScope:'既存のWAV ARCHIVEデータに基づく',memberNote:'HISTORY・MEMBER 360°の全機能は従来のアーカイブから利用できます',dimensionNote:'従来の系譜・DNA・ユニット詳細も利用できます',memberCount:'人',unitsCount:'件',seeMembers:'メンバーを見る',source:'元の詳細',detailButton:'詳細を見る',close:'閉じる'
    }
  };
  const qs = new URLSearchParams(location.search);
  function langFromUser() {
    let stored='';try{stored=localStorage.getItem('wa-archive-63-lang')||''}catch(_){}
    const param = qs.get('lang');
    return ['ko','en','ja'].includes(param) ? param : (['ko','en','ja'].includes(stored) ? stored : 'ko');
  }
  let lang=langFromUser();
  const text = key => (STRINGS[lang]||STRINGS.ko)[key] || STRINGS.ko[key] || key;
  const esc = value => String(value==null?'':value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const byId = Object.fromEntries(DATA.members.map(m=>[m.id,m]));
  const search = document.getElementById('wa63Search');
  const reset = document.getElementById('wa63Reset');
  const grid = document.getElementById(page==='members'?'wa63MemberGrid':'wa63DimensionGrid');
  const count = document.getElementById('wa63Count');
  const empty = document.getElementById('wa63Empty');
  const dialog=document.querySelector('.wa63-dialog');
  const dialogBody=document.getElementById('wa63DialogContent');
  const close=document.getElementById('wa63Close');
  if (!search || !grid || !dialog || !dialogBody || !close) return;
  let activeFlip=null;
  let lastFocus=null;
  const normalize = v=>String(v||'').normalize('NFKC').toLocaleLowerCase().replace(/\s+/g,'');
  function urlFor(path, options) {
    const u=new URL(path,document.baseURI);u.searchParams.set('lang',lang);
    if (options) Object.entries(options).forEach(([k,v])=>{if(v)u.searchParams.set(k,v)});
    return u.href;
  }
  function selectLang(next) {
    if(!STRINGS[next])return;
    lang=next;
    document.documentElement.lang=lang;
    try{localStorage.setItem('wa-archive-63-lang',lang)}catch(_){}
    document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));
    document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;el.textContent=text(k)});
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>el.placeholder=text(el.dataset.i18nPlaceholder));
    document.querySelectorAll('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',text(el.dataset.i18nAria)));
    document.querySelectorAll('[data-keep-lang]').forEach(el=>{const u=new URL(el.getAttribute('href'),document.baseURI);u.searchParams.set('lang',lang);el.href=u.href});
    const f=document.getElementById('wa63DimensionFilter');
    if(f && f.options[0])f.options[0].textContent=text('allDimensions');
    const g=document.getElementById('wa63GroupFilter');
    if(g && g.options[0])g.options[0].textContent=text('allGroups');
    render();
  }
  function showDialog(markup,heading) {
    lastFocus=document.activeElement;
    dialogBody.innerHTML=markup;
    const h=dialogBody.querySelector('h2'); if(h)h.id='wa63DialogTitle';
    dialog.setAttribute('aria-label',heading);
    if(!dialog.open)dialog.showModal();
    close.focus({preventScroll:true});
  }
  function closeDialog() { if(dialog.open)dialog.close(); }
  close.addEventListener('click',closeDialog);
  dialog.addEventListener('click',e=>{if(e.target===dialog)closeDialog()});
  dialog.addEventListener('close',()=>{if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true})});
  function memberCard(m){
    return `<article class="wa63-member-card" data-id="${esc(m.id)}">
      <div class="wa63-card-inner">
        <div class="wa63-face wa63-front">
          <img class="wa63-portrait" src="${esc(m.image)}" alt="${esc(m.id+' '+m.name)}" loading="lazy" decoding="async" onerror="this.hidden=true;this.parentElement.classList.add('wa63-img-failed')">
          <span class="wa63-photo-fallback" aria-hidden="true">${esc(m.id)}</span>
          <span class="wa63-face-shade" aria-hidden="true"></span>
          <span class="wa63-topline"><b>${esc(m.id)}</b><span>tripleS</span></span>
          <span class="wa63-front-caption"><strong>${esc(m.name)}</strong><small>${esc(m.english)}</small><span>${esc(text('flip'))} ↻</span></span>
          <button type="button" data-action="flip" class="wa63-flip-front" aria-label="${esc(m.name+' '+text('flip'))}" aria-expanded="false"></button>
        </div>
        <div class="wa63-face wa63-back" inert><div class="wa63-back-top">MEMBER PROFILE <b>${esc(m.id)}</b></div>
          <div class="wa63-back-member"><strong>${esc(m.name)}</strong><span>${esc(m.english)}</span></div>
          <div class="wa63-back-birth"><small>${esc(text('birth'))}</small><b>${esc(m.birthday)}</b></div>
          <p class="wa63-back-unit-label">${esc(text('dimensionMembership'))}</p>
          <div class="wa63-back-units">${m.units.slice(0,4).map(u=>`<span>${esc(u)}</span>`).join('')}${m.units.length>4?`<span>+${m.units.length-4}</span>`:''}</div>
          <div class="wa63-back-actions"><button type="button" data-action="detail" data-id="${esc(m.id)}">${esc(text('detail'))}</button><button type="button" data-action="flip" aria-label="${esc(text('returnFront'))}">${esc(text('returnFront'))}</button></div>
        </div>
      </div>
    </article>`;
  }
  function memberDetail(id){
    const m=byId[id];if(!m)return;
    const units=m.units.map(name=>{const match=DATA.dimensions.find(d=>d.name.toLowerCase()===name.toLowerCase() || (d.name==='AAA'&&name==='Acid Angel from Asia'));return match?`<a href="${esc(urlFor('../dimensions/',{unit:match.id}))}">${esc(name)} ↗</a>`:`<span>${esc(name)}</span>`}).join('');
    const legacy=new URL('../',document.baseURI);legacy.hash='members';legacy.searchParams.set('wa-member',m.id);
    showDialog(`<div class="wa63-detail-head"><div class="wa63-detail-avatar"><img src="${esc(m.image)}" alt="" loading="lazy" onerror="this.hidden=true"></div><div><span class="wa63-kicker">MEMBER PROFILE · ${esc(m.id)}</span><h2>${esc(m.name)}</h2><p>${esc(m.english)}</p></div></div>
      <dl class="wa63-detail-data"><div><dt>${esc(text('birth'))}</dt><dd>${esc(m.birthday)}</dd></div><div><dt>${esc(text('dimensionMembership'))}</dt><dd>${m.units.length}${esc(text('unitsCount'))}</dd></div></dl>
      <h3 class="wa63-detail-section">${esc(text('dimensionMembership'))}</h3><div class="wa63-chip-links">${units}</div>
      <p class="wa63-detail-note">${esc(text('memberNote'))}</p>
      <div class="wa63-dialog-actions"><a class="wa63-main-button" href="${esc(legacy.href)}">${esc(text('fullArchive'))}</a><a class="wa63-ghost-button" href="${esc(urlFor('../signal-moments/'))}">SIGNAL ↗</a></div>
      <small class="wa63-source-label">${esc(text('verifiedScope'))}</small>`,m.name);
  }
  function renderMembers(){
    const term=normalize(search.value);
    const filter=document.getElementById('wa63DimensionFilter')?.value || '';
    const found=DATA.members.filter(m=>(!filter || m.units.includes(filter)) && (!term || normalize([m.id,m.name,m.english,...m.units].join(' ')).includes(term)));
    grid.innerHTML=found.map(memberCard).join('');
    count.textContent=`${found.length} / ${DATA.members.length} ${text('profiles')}`;
    empty.hidden=found.length>0;
    activeFlip=null;
  }
  function showDimension(d){
    const memberLinks=d.members.map(id=>{const m=byId[id];return m?`<a class="wa63-member-chip" href="${esc(urlFor('../members/',{member:id}))}"><img src="${esc(m.image)}" alt="" loading="lazy" onerror="this.hidden=true"><span>${esc(id)} · ${esc(m.name)}</span></a>`:''}).join('');
    showDialog(`<span class="wa63-kicker">${esc(d.type)}</span><h2>${esc(d.name)}</h2><p class="wa63-dim-desc">${esc(d.description)}</p><h3 class="wa63-detail-section">${esc(text('memberList'))} · ${d.members.length}</h3><div class="wa63-member-chips">${memberLinks||esc(text('noResults'))}</div><p class="wa63-detail-note">${esc(text('dimensionNote'))}</p>
      <div class="wa63-dialog-actions"><a class="wa63-main-button" href="${esc(new URL('../#units',document.baseURI))}">${esc(text('fullArchive'))}</a>${d.url?`<a class="wa63-ghost-button" href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">${esc(text('source'))} ↗</a>`:''}</div><small class="wa63-source-label">${esc(text('verifiedScope'))}</small>`,d.name);
  }
  function renderDimensions(){
    const term=normalize(search.value);
    const group=document.getElementById('wa63GroupFilter')?.value||'';
    const found=DATA.dimensions.filter(d=>(!group || group===d.type) && (!term || normalize([d.name,d.type,d.description,...d.members.map(id=>byId[id]?.name||''),...d.members].join(' ')).includes(term)));
    grid.innerHTML=found.map(d=>`<article class="wa63-dim-card">
        <span class="wa63-kicker">${esc(d.type)}</span><h2>${esc(d.name)}</h2><p>${esc(d.description)}</p>
        <div class="wa63-dim-count"><strong>${d.members.length}</strong><span>${esc(text('membersLabel'))}</span></div>
        <div class="wa63-dim-avatars" aria-hidden="true">${d.members.slice(0,5).map(id=>`<img src="${esc(byId[id].image)}" loading="lazy" alt="" onerror="this.hidden=true">`).join('')}${d.members.length>5?`<span>+${d.members.length-5}</span>`:''}</div>
        <button type="button" class="wa63-dim-open" data-action="dim-detail" data-id="${esc(d.id)}">${esc(text('detailButton'))} ↗</button>
      </article>`).join('');
    count.textContent=`${found.length} / ${DATA.dimensions.length} ${text('dimensions')}`;
    empty.hidden=found.length>0;
  }
  function render(){if(page==='members')renderMembers();else renderDimensions()}
  if(page==='members'){
    const filter=document.getElementById('wa63DimensionFilter');
    const all=[...new Set(DATA.members.flatMap(m=>m.units))].sort((a,b)=>a.localeCompare(b));
    all.forEach(v=>filter.add(new Option(v,v)));
    filter.addEventListener('change',render);
    grid.addEventListener('click',e=>{
      const btn=e.target.closest('button[data-action]');if(!btn)return;
      const c=btn.closest('.wa63-member-card');if(!c)return;
      const id=c.dataset.id;
      if(btn.dataset.action==='detail'){memberDetail(id);return}
      if(btn.dataset.action==='flip'){
        const flip=!c.classList.contains('wa63-flipped');
        if(activeFlip && activeFlip!==c){activeFlip.classList.remove('wa63-flipped');activeFlip.querySelector('.wa63-back')?.setAttribute('inert','');activeFlip.querySelector('.wa63-flip-front')?.removeAttribute('inert');}
        c.classList.toggle('wa63-flipped',flip);
        if(flip){c.querySelector('.wa63-back')?.removeAttribute('inert');c.querySelector('.wa63-flip-front')?.setAttribute('inert','');}
        else{c.querySelector('.wa63-back')?.setAttribute('inert','');c.querySelector('.wa63-flip-front')?.removeAttribute('inert');}
        const toggle=c.querySelector('.wa63-flip-front');if(toggle)toggle.setAttribute('aria-expanded',String(flip));
        activeFlip=flip?c:null;
        if(flip){const detail=c.querySelector('[data-action="detail"]');detail?.focus({preventScroll:true});}
      }
    });
  }else{
    const filter=document.getElementById('wa63GroupFilter');
    [...new Set(DATA.dimensions.map(d=>d.type))].forEach(v=>filter.add(new Option(v,v)));
    filter.addEventListener('change',render);
    grid.addEventListener('click',e=>{const b=e.target.closest('[data-action="dim-detail"]');if(b){const d=DATA.dimensions.find(x=>x.id===b.dataset.id);if(d)showDimension(d)}});
  }
  search.addEventListener('input',render);
  reset.addEventListener('click',()=>{search.value='';const f=document.querySelector('.wa63-toolbar select');if(f)f.value='';render();search.focus()});
  document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>selectLang(b.dataset.lang)));
  selectLang(lang);
  const requestedMember=qs.get('member');
  if(page==='members'&&requestedMember&&byId[requestedMember]) {
    const c=grid.querySelector(`[data-id="${requestedMember}"]`);
    if(c){c.scrollIntoView({block:'center'});memberDetail(requestedMember)}
  }
  const requestedUnit=qs.get('unit');
  if(page==='dimensions'&&requestedUnit){const d=DATA.dimensions.find(x=>x.id===requestedUnit);if(d)showDimension(d)}
  window.__wa63Directory={version:'6.3',page,count:page==='members'?DATA.members.length:DATA.dimensions.length};
})();
