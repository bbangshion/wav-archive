
/* WAV ARCHIVE 11.5 PHASE 4 — ADDITIVE BUILDER + MY WAV COLLECTIBLE BADGES
   No changes to member data, Dimension data, flip logic or prior module handlers.
   Chemistry is a transparent FAN-MADE simulation based only on existing shared
   Dimension data (not AI inference about real people or official ability). */
(()=>{
  'use strict';
  if (window.WA115_PHASE4) return;
  const $ = (selector, base=document) => base.querySelector(selector);
  const $$ = (selector, base=document) => [...base.querySelectorAll(selector)];
  const clamp=(n,low,high)=>Math.min(high,Math.max(low,n));
  const isEnglish=()=>/^en\b/i.test(document.documentElement.lang||'') || document.documentElement.dataset.language==='en';
  const scheduled=new Map();
  function onFrame(key,callback){
    if(scheduled.has(key))return;
    scheduled.set(key,requestAnimationFrame(()=>{scheduled.delete(key);callback();}));
  }
  const t=(ko,en)=>isEnglish()?en:ko;

  /* --- 01. Live producing insight. Existing WA11_UNIT_CHEMISTRY already reads
     the exact dataset used by the DNA map. Its formula remains the only source
     of truth for the 0–100 overlap score, so old and new panels cannot disagree. */
  const builder=$('#wa75Builder');
  const PRESETS={
    '몽환적인 밤':{
      en:'Dreamy Night',genreKo:'신스팝 · 드림팝',genreEn:'Synth-pop · Dream-pop',
      visualKo:'은은한 별빛과 어두운 보랏빛',visualEn:'Starlight and a midnight-violet palette',
      hookKo:'여백 있는 도입부에서 몽환적인 후렴으로 이어지는 곡',hookEn:'An airy intro that blooms into a dreamlike chorus'
    },
    '상큼한 청춘':{
      en:'Youthful Spark',genreKo:'댄스 팝 · 청량 팝',genreEn:'Dance-pop · Bright pop',
      visualKo:'여름빛과 투명한 파스텔',visualEn:'Summer light with translucent pastels',
      hookKo:'가벼운 기타와 따라 부르기 쉬운 후렴',hookEn:'Breezy guitars and an easy sing-along hook'
    },
    '강렬한 퍼포먼스':{
      en:'Power Performance',genreKo:'일렉트로 팝 · 하이 에너지',genreEn:'Electro-pop · High energy',
      visualKo:'선명한 대비와 무대 조명',visualEn:'High contrast and dramatic stage lighting',
      hookKo:'박력 있는 비트와 단체 퍼포먼스에 어울리는 드롭',hookEn:'Driving beats and a choreography-ready drop'
    },
    '따뜻한 감성':{
      en:'Warm Emotions',genreKo:'미드템포 · 어쿠스틱 팝',genreEn:'Midtempo · Acoustic pop',
      visualKo:'필름 그레인과 따뜻한 노을',visualEn:'Film grain and golden-hour light',
      hookKo:'담백한 멜로디와 조화를 강조한 코러스',hookEn:'A gentle melody with a harmony-driven chorus'
    },
    '미래적인 사운드':{
      en:'Future Sound',genreKo:'퓨처 베이스 · 일렉트로닉',genreEn:'Future bass · Electronic',
      visualKo:'홀로그램과 사이버 네온',visualEn:'Holograms and cyber neon',
      hookKo:'변칙적인 사운드 디자인과 역동적인 전개',hookEn:'Unconventional sound design and an evolving arrangement'
    }
  };
  const REPORT_MARKUP=`
    <div class="wa125-report-head">
      <div><span class="wa125-report-eyebrow">WAV LAB · VIRTUAL PRODUCING</span><h5 data-wa125-role="report-title">가상 유닛 분석</h5></div>
      <span class="wa125-fan-label">FAN SIMULATION</span>
    </div>
    <div class="wa125-report-grid">
      <div class="wa125-score-shell">
        <div class="wa125-score-dial" data-wa125-role="dial" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="유닛 공동 디멘션 활동 점수">
          <div class="wa125-score-readout"><strong data-wa125-role="score">0</strong><small>CHEMISTRY / 100</small></div>
        </div>
        <p class="wa125-score-caption" data-wa125-role="score-caption">두 명 이상 선택해 주세요</p>
      </div>
      <div class="wa125-bars">
        <div class="wa125-metric"><div class="wa125-metric-head"><span data-wa125-role="pair-title">공동 활동이 있는 멤버 쌍</span><b data-wa125-role="pair-value">0 / 0</b></div><div class="wa125-track"><i class="wa125-track-fill" data-wa125-role="pair-fill"></i></div></div>
        <div class="wa125-metric"><div class="wa125-metric-head"><span data-wa125-role="overlap-title">공통 디멘션 중첩도</span><b data-wa125-role="overlap-value">0%</b></div><div class="wa125-track"><i class="wa125-track-fill" data-wa125-role="overlap-fill"></i></div></div>
        <div class="wa125-metric"><div class="wa125-metric-head"><span data-wa125-role="diversity-title">선택 멤버의 유닛 범위</span><b data-wa125-role="diversity-value">0</b></div><div class="wa125-track"><i class="wa125-track-fill" data-wa125-role="diversity-fill"></i></div></div>
      </div>
    </div>
    <div class="wa125-dim-head"><span data-wa125-role="rank-title">공통 디멘션 빈도 역산</span><small data-wa125-role="rank-subtitle">함께 속한 멤버 쌍 기준</small></div>
    <div class="wa125-dim-list" data-wa125-role="dimensions" aria-live="polite"><div class="wa125-empty">멤버를 선택해 주세요.</div></div>
    <div class="wa125-producer-copy" aria-live="polite">
      <span class="wa125-report-eyebrow">VIRTUAL A&amp;R · CONCEPT BRIEF</span>
      <h6 data-wa125-role="concept-title">몽환적인 밤</h6>
      <p data-wa125-role="narrative">두 명 이상의 멤버를 선택하면 가상 프로듀싱 분석을 표시해요.</p>
    </div>
    <p class="wa125-method" data-wa125-role="method">※ 실측 능력치나 공식 AI 평가가 아닌 팬메이드 가상 시뮬레이션입니다.</p>`;
  let report=null;
  function buildReport(){
    if(!builder || $('#wa125ProducingReport'))return;
    report=document.createElement('section');
    report.id='wa125ProducingReport';
    report.className='wa125-report';
    report.setAttribute('aria-label','가상 유닛 분석 보고서');
    report.innerHTML=REPORT_MARKUP;
    const after=$('#wa11Chemistry',builder)||$('#wa6Lab',builder)||$('#wa75Result',builder);
    after?.insertAdjacentElement('afterend',report);
    if(!report.isConnected)$('#wa75Result',builder)?.append(report);
    updateReport();
  }
  function setText(role,value){const el=report?.querySelector('[data-wa125-role="'+role+'"]');if(el && el.textContent!==String(value))el.textContent=String(value);}
  function updateReport(){
    if(!builder || !report)return;
    const api=window.WA11_UNIT_CHEMISTRY;
    if(!api || typeof api.analyzeSelection!=='function'){
      setText('narrative',t('기존 DNA 분석 모듈을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.','Could not read the existing DNA analysis module. Please reload.'));
      return;
    }
    const analysis=api.analyzeSelection();
    const ids=analysis.members.map(m=>m.id);
    const pairCount=analysis.chemistry.pairCount;
    const positive=analysis.chemistry.pairs.filter(p=>p.count>0).length;
    const pairRatio=pairCount?positive/pairCount*100:0;
    const score=clamp(analysis.chemistry.score,0,100);
    const units=new Set(analysis.members.flatMap(m=>[...m.dimensions]));
    const allPairs={};
    analysis.chemistry.pairs.forEach(pair=>pair.dimensions.forEach(dimension=>{allPairs[dimension]=(allPairs[dimension]||0)+1;}));
    const dimensions=Object.entries(allPairs).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,4);
    const concept=$('#wa75Concept')?.value||'몽환적인 밤';
    const preset=PRESETS[concept]||PRESETS['몽환적인 밤'];
    const unitName=$('#wa75Name')?.value.trim()||t('나만의 디멘션','My Dimension');
    const overlapRate=pairCount?Math.round(Math.min(100,analysis.chemistry.sharedTotal/(pairCount*3)*100)):0;
    setText('report-title',t('가상 유닛 분석 보고서','Virtual unit analysis report'));
    setText('score',score);
    setText('pair-title',t('공동 활동이 있는 멤버 쌍','Pairs with shared Dimensions'));
    setText('overlap-title',t('공통 디멘션 중첩도','Dimension overlap rate'));
    setText('diversity-title',t('선택 멤버의 유닛 범위','Unique Dimensions represented'));
    setText('pair-value',positive+' / '+pairCount);
    setText('overlap-value',overlapRate+'%');
    setText('diversity-value',units.size);
    setText('rank-title',t('공통 디멘션 빈도 역산','Shared Dimension frequency'));
    setText('rank-subtitle',t('함께 속한 멤버 쌍 기준','Counted by overlapping pairs'));
    setText('score-caption',ids.length<2?t('멤버 2명 이상 필요','Select at least 2 members'):t('실제 디멘션 활동 중첩 기준','Based on documented Dimension overlap'));
    const dial=report.querySelector('[data-wa125-role="dial"]');
    dial.style.setProperty('--wa125-angle',score+'%');
    dial.setAttribute('aria-valuenow',String(score));
    report.querySelector('[data-wa125-role="pair-fill"]').style.width=pairRatio+'%';
    report.querySelector('[data-wa125-role="overlap-fill"]').style.width=overlapRate+'%';
    report.querySelector('[data-wa125-role="diversity-fill"]').style.width=clamp(units.size/16*100,0,100)+'%';
    const dimRoot=report.querySelector('[data-wa125-role="dimensions"]');
    dimRoot.replaceChildren();
    if(dimensions.length){
      dimensions.forEach(([unit,count])=>{
        const row=document.createElement('div');row.className='wa125-dim-row';
        const label=document.createElement('span');label.textContent=unit;label.title=unit;
        const track=document.createElement('div');track.className='wa125-track';
        const bar=document.createElement('i');bar.style.width=(pairCount?count/pairCount*100:0)+'%';track.append(bar);
        const num=document.createElement('b');num.textContent=count+' / '+pairCount;
        row.append(label,track,num);dimRoot.append(row);
      });
    }else{
      const empty=document.createElement('div');empty.className='wa125-empty';
      empty.textContent=t('현재 선택에 공통 디멘션이 없어요. 서로 다른 조합도 새로운 가능성이에요.','No shared Dimensions in this selection. A new combination can tell a new story.');
      dimRoot.append(empty);
    }
    setText('concept-title',(isEnglish()?preset.en:concept)+' · '+(isEnglish()?preset.genreEn:preset.genreKo));
    let synergy;
    if(score>=70)synergy=t('기존 공동 활동이 자주 겹쳐 연결성이 높은 조합이에요.','Their documented activity overlap suggests a highly connected combination.');
    else if(score>=35)synergy=t('일부 디멘션에서 함께한 기록이 있어 조화와 새로움을 함께 기대할 수 있어요.','Their shared history balances familiarity with new combinations.');
    else synergy=t('기존 활동 교집합은 적지만 새로운 차원의 조합으로 상상해 볼 만해요.','Their activity overlap is limited, leaving room for an imaginative new combination.');
    if(ids.length<2){
      setText('narrative',t('멤버를 두 명 이상 선택하면 콘셉트와 공동 디멘션 데이터를 바탕으로 가상 데뷔 리포트를 생성해요.','Select at least two members to generate a fictional debut brief based on shared Dimension data.'));
    }else if(isEnglish()){
      setText('narrative',`“${unitName}” is a fictional ${preset.en} debut concept. The ${ids.length}-member line-up scores ${score}/100 on documented Dimension overlap across ${pairCount} member pairs. ${synergy}\nRecommended palette: ${preset.visualEn}. Music direction: ${preset.hookEn}. This is a fan-created producing scenario, not an official forecast.`);
    }else{
      setText('narrative',`“${unitName}”의 가상 데뷔 성향은 [${concept}]이며, ${ids.length}명 조합의 공동 활동 케미 점수는 ${score}/100점입니다. ${pairCount}개 멤버 쌍에서 기존 디멘션 활동 빈도를 역산했어요. ${synergy}\n비주얼 방향: ${preset.visualKo}. 음악 제안: ${preset.hookKo}. 활동 시너지는 실제 관계가 아닌 공동 기록을 바탕으로 상상한 팬메이드 해석입니다.`);
    }
    setText('method',t('계산: 모든 멤버 쌍의 공통 디멘션 개수를 세어 쌍당 최대 3개로 제한한 뒤 (합계 ÷ 쌍 개수 ÷ 3) × 100. 데이터: 기존 S01~S24 멤버 카드의 소속 유닛. 수치·분석은 공식 평가나 실제 AI 예측이 아닙니다.','Formula: Count shared Dimensions per member pair (max 3), then (sum ÷ pair count ÷ 3) × 100. Source: existing S01–S24 member cards. Not an official rating or predictive AI.'));
  }
  if(builder){
    buildReport();
    builder.addEventListener('click',event=>{
      if(event.target.closest('.wa75-member,#wa75Reset,#wa75Save,#wa75Card'))onFrame('report',updateReport);
    });
    $('#wa75Concept')?.addEventListener('change',()=>onFrame('report',updateReport));
    $('#wa75Name')?.addEventListener('input',()=>onFrame('report',updateReport));
    document.addEventListener('wa:language',()=>onFrame('report',updateReport));
    window.addEventListener('pageshow',()=>onFrame('report',updateReport));
  }

  /* --- 02. Browser-only collectible badge engine. Achievement is awarded ONLY
     after a real local interaction. No user tracking or network requests. */
  const BADGES=[
    {id:'member',symbol:'✧',ko:'첫 번째 S',en:'First S',missionKo:'멤버 카드를 뒤집기',missionEn:'Flip a member card',x:.13,y:.21},
    {id:'dimension',symbol:'◇',ko:'차원의 발견',en:'Dimension Scout',missionKo:'TIMETREE 노드 열기',missionEn:'Open a TIMETREE node',x:.86,y:.22},
    {id:'dna',symbol:'◎',ko:'DNA 항해자',en:'DNA Navigator',missionKo:'DNA 연결망 탐색',missionEn:'Explore the DNA map',x:.18,y:.81},
    {id:'album',symbol:'♫',ko:'음반 탐험가',en:'Record Explorer',missionKo:'음반 DETAIL 펼치기',missionEn:'Expand an album detail',x:.83,y:.80},
    {id:'producer',symbol:'✦',ko:'가상 프로듀서',en:'Unit Producer',missionKo:'2명 이상 유닛 저장/제작',missionEn:'Save/build a 2+ member unit',x:.48,y:.15},
    {id:'identity',symbol:'W',ko:'MY WAV 창조자',en:'MY WAV Creator',missionKo:'WAV ID 생성하기',missionEn:'Create a WAV ID',x:.50,y:.85}
  ];
  const BADGE_MAP=new Map(BADGES.map(b=>[b.id,b]));
  const STORAGE_KEY='wav:mywav:badges:v1';
  const defaultLayout=badge=>({x:badge.x,y:badge.y,enabled:true});
  const state={version:1,unlocked:[],layout:{}};
  function loadState(){
    try{
      const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(!parsed || parsed.version!==1)return;
      state.unlocked=[...new Set((Array.isArray(parsed.unlocked)?parsed.unlocked:[]).filter(id=>BADGE_MAP.has(id)))];
      for(const badge of BADGES){
        const saved=parsed.layout?.[badge.id];
        if(saved&&typeof saved==='object'){
          state.layout[badge.id]={x:clamp(Number.isFinite(Number(saved.x))?Number(saved.x):badge.x,.08,.92),y:clamp(Number.isFinite(Number(saved.y))?Number(saved.y):badge.y,.10,.9),enabled:saved.enabled!==false};
        }
      }
    }catch(error){/* Storage may be disabled; badge controls still work in memory. */}
  }
  function persist(){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(error){/* Private mode: memory-only state. */}
  }
  const earned=id=>state.unlocked.includes(id);
  const arrangement=id=>state.layout[id]||(state.layout[id]=defaultLayout(BADGE_MAP.get(id)));
  function grant(id){
    if(!BADGE_MAP.has(id)||earned(id))return false;
    state.unlocked.push(id);arrangement(id);persist();scheduleRefresh();return true;
  }
  loadState();
  let missionBoard=null,badgeWorkshop=null;
  function missionLabel(b){return isEnglish()?b.en:b.ko;}
  function missionDescription(b){return isEnglish()?b.missionEn:b.missionKo;}
  function createMissionBoard(){
    const launch=$('#wavId .wa-id-card');if(!launch||$('#wa125MissionBoard'))return;
    missionBoard=document.createElement('section');
    missionBoard.id='wa125MissionBoard';missionBoard.className='wa125-mission-board';
    missionBoard.setAttribute('aria-label','아카이브 탐색 미션과 보상 배지');
    missionBoard.innerHTML='<div class="wa125-mission-top"><strong>WAV QUEST · BADGE COLLECTION</strong><span class="wa125-mission-count" data-wa125-role="mission-count">0 / 6</span></div><div class="wa125-mission-grid" data-wa125-role="mission-grid"></div>';
    launch.append(missionBoard);
  }
  function createBadgeWorkshop(){
    const result=$('#waIdResult');if(!result||$('#wa125BadgeWorkshop'))return;
    badgeWorkshop=document.createElement('section');
    badgeWorkshop.id='wa125BadgeWorkshop';badgeWorkshop.hidden=true;
    badgeWorkshop.setAttribute('aria-label','MY WAV ID 가상 배지 배치 설정');
    badgeWorkshop.innerHTML='<div class="wa125-workshop-title"><strong>WAV BADGE WORKSHOP</strong><span data-wa125-role="badge-progress">0 / 6 EARNED</span></div><p class="wa125-workshop-hint" data-wa125-role="workshop-hint">획득한 배지를 터치해 켜고 끈 뒤, 카드 위의 핀을 드래그해 배치하세요. 위치는 이 기기에만 저장됩니다.</p><div class="wa125-badge-controls" data-wa125-role="badge-controls"></div><button class="wa125-badge-reset" type="button" id="wa125ResetPins">배지 위치 초기화</button>';
    result.insertAdjacentElement('afterend',badgeWorkshop);
    $('#wa125ResetPins',badgeWorkshop).addEventListener('click',()=>{
      BADGES.forEach(b=>{if(earned(b.id)){const active=arrangement(b.id).enabled;state.layout[b.id]={...defaultLayout(b),enabled:active};}});
      persist();scheduleRefresh();
    });
    $('[data-wa125-role="badge-controls"]',badgeWorkshop).addEventListener('click',event=>{
      const button=event.target.closest('[data-wa125-badge-toggle]');if(!button)return;
      const id=button.dataset.wa125BadgeToggle;
      if(!earned(id))return;
      const item=arrangement(id);item.enabled=!item.enabled;
      persist();scheduleRefresh();
    });
  }
  function renderMissionBoard(){
    if(!missionBoard)return;
    $('[data-wa125-role="mission-count"]',missionBoard).textContent=state.unlocked.length+' / '+BADGES.length;
    const grid=$('[data-wa125-role="mission-grid"]',missionBoard);grid.replaceChildren();
    for(const b of BADGES){
      const tile=document.createElement('div');tile.className='wa125-mission-tile'+(earned(b.id)?' earned':'');
      const icon=document.createElement('span');icon.className='wa125-mission-icon';icon.textContent=earned(b.id)?b.symbol:'♧';
      const text=document.createElement('div');text.className='wa125-mission-text';
      const label=document.createElement('b');label.textContent=missionLabel(b);
      const desc=document.createElement('small');desc.textContent=earned(b.id)?t('✓ 획득 완료','✓ Unlocked'):missionDescription(b);
      text.append(label,desc);tile.append(icon,text);grid.append(tile);
    }
  }
  function renderWorkshop(){
    if(!badgeWorkshop)return;
    const result=$('#waIdResult');
    const visible=result&&!result.hidden&&!!$('#waIdPass');
    badgeWorkshop.hidden=!visible;
    if(!visible)return;
    $('[data-wa125-role="badge-progress"]',badgeWorkshop).textContent=state.unlocked.length+' / '+BADGES.length+' EARNED';
    $('[data-wa125-role="workshop-hint"]',badgeWorkshop).textContent=t('획득한 배지를 터치해 켜고 끈 뒤, 카드 위 핀을 드래그해 배치하세요. 배치는 이 브라우저에만 저장됩니다.','Toggle earned badges, then drag their pins on the ID card. Your layout stays in this browser.');
    $('#wa125ResetPins',badgeWorkshop).textContent=t('배지 위치 초기화','Reset pin positions');
    const grid=$('[data-wa125-role="badge-controls"]',badgeWorkshop);grid.replaceChildren();
    BADGES.forEach(b=>{
      const unlocked=earned(b.id),on=unlocked&&arrangement(b.id).enabled;
      const button=document.createElement('button');button.type='button';button.className='wa125-badge-choice';
      button.dataset.wa125BadgeToggle=b.id;button.disabled=!unlocked;
      button.setAttribute('aria-pressed',String(on));
      button.title=unlocked?t('배지 표시 전환','Toggle badge visibility'):missionDescription(b);
      const top=document.createElement('span');top.className='wa125-badge-choice-top';
      const symbol=document.createElement('span');symbol.className='wa125-badge-choice-icon';symbol.textContent=unlocked?b.symbol:'◇';
      const value=document.createElement('span');value.className='wa125-badge-switch';value.textContent=unlocked?(on?'ON':'OFF'):'LOCK';
      top.append(symbol,value);
      const name=document.createElement('b');name.textContent=missionLabel(b);
      const caption=document.createElement('small');caption.textContent=unlocked?t('카드 표면에 배치 가능','Pin to the ID card'):missionDescription(b);
      button.append(top,name,caption);grid.append(button);
    });
  }
  function pinPosition(pin,id){
    const pos=arrangement(id);pin.style.setProperty('--wa125-x',(pos.x*100)+'%');pin.style.setProperty('--wa125-y',(pos.y*100)+'%');
    pin.title=missionLabel(BADGE_MAP.get(id))+t(' · 드래그해서 이동',' · drag to reposition');
  }
  function attachPinEvents(pin,id,card){
    let drag=null,paintFrame=0;
    function paint(){paintFrame=0;if(drag && pin.isConnected)pinPosition(pin,id);}
    function requestPaint(){if(!paintFrame)paintFrame=requestAnimationFrame(paint);}
    function flushPaint(){if(paintFrame){cancelAnimationFrame(paintFrame);paintFrame=0;}pinPosition(pin,id);}
    pin.addEventListener('pointerdown',event=>{
      if(event.button!==0 && event.pointerType==='mouse')return;
      event.preventDefault();event.stopPropagation();
      const current=arrangement(id),rect=card.getBoundingClientRect();
      if(rect.width<50||rect.height<50)return;
      drag={pointer:event.pointerId,startX:event.clientX,startY:event.clientY,
        x:current.x,y:current.y,width:rect.width,height:rect.height,moved:false};
      pin.classList.add('moving');
      try{pin.setPointerCapture(event.pointerId);}catch(error){}
    });
    pin.addEventListener('pointermove',event=>{
      if(!drag||event.pointerId!==drag.pointer)return;
      event.preventDefault();event.stopPropagation();
      // Read the bounding box once on drag start, never per pointermove.
      const dx=(event.clientX-drag.startX)/drag.width;
      const dy=(event.clientY-drag.startY)/drag.height;
      if(Math.abs(dx)>0.003 || Math.abs(dy)>0.003)drag.moved=true;
      const layout=arrangement(id);
      layout.x=clamp(drag.x+dx,.08,.92);
      layout.y=clamp(drag.y+dy,.10,.9);
      requestPaint();
    });
    const finish=event=>{
      if(!drag||event.pointerId!==drag.pointer)return;
      event.stopPropagation();
      flushPaint();
      pin.classList.remove('moving');drag=null;
      try{pin.releasePointerCapture(event.pointerId);}catch(error){}
      persist();
    };
    pin.addEventListener('pointerup',finish);
    pin.addEventListener('pointercancel',finish);
    pin.addEventListener('lostpointercapture',()=>{if(drag){flushPaint();pin.classList.remove('moving');drag=null;persist();}});
    // Keyboard accessibility for precise badge positioning.
    pin.addEventListener('keydown',event=>{
      const movements={ArrowLeft:[-.02,0],ArrowRight:[.02,0],ArrowUp:[0,-.02],ArrowDown:[0,.02]};
      const change=movements[event.key];if(!change)return;
      event.preventDefault();event.stopPropagation();
      const layout=arrangement(id);layout.x=clamp(layout.x+change[0],.08,.92);layout.y=clamp(layout.y+change[1],.10,.9);
      pinPosition(pin,id);persist();
    });
    pin.addEventListener('click',event=>event.stopPropagation());
  }
  function renderPins(){
    const card=$('#waIdPass');if(!card)return;
    let layer=$('.wa125-badge-layer',card);
    if(!layer){layer=document.createElement('div');layer.className='wa125-badge-layer';layer.setAttribute('aria-label','사용자 배치 가상 배지');card.append(layer);}
    for(const b of BADGES){
      let pin=$('[data-wa125-badge-pin="'+b.id+'"]',layer);
      const show=earned(b.id)&&arrangement(b.id).enabled;
      if(!show){if(pin)pin.remove();continue;}
      if(!pin){
        pin=document.createElement('button');pin.type='button';pin.className='wa125-badge-pin';pin.dataset.wa125BadgePin=b.id;
        const icon=document.createElement('span');icon.textContent=b.symbol;pin.append(icon);
        layer.append(pin);attachPinEvents(pin,b.id,card);
      }
      pin.setAttribute('aria-label',missionLabel(b)+t(' 배지 위치 조정, 방향키로도 이동 가능',' badge. Drag or use arrow keys to move.'));
      pinPosition(pin,b.id);
    }
  }
  function refresh(){renderMissionBoard();renderWorkshop();renderPins();}
  function scheduleRefresh(){onFrame('badges',refresh);}
  createMissionBoard();createBadgeWorkshop();scheduleRefresh();
  const idResult=$('#waIdResult');
  if(idResult){
    // Existing WAV-ID renderer replaces the ID card via innerHTML. Observe only
    // its direct children and hidden property, never touch the original renderId().
    const observer=new MutationObserver(scheduleRefresh);
    observer.observe(idResult,{childList:true,attributes:true,attributeFilter:['hidden']});
  }
  document.addEventListener('click',event=>{
    const target=event.target;
    if(!(target instanceof Element))return;
    if(target.closest('#memberGrid .member-card')&&!target.closest('.member-fav,.member-history-btn,a,button')){
      const card=target.closest('#memberGrid .member-card');
      requestAnimationFrame(()=>{if(card?.classList.contains('is-flipped'))grant('member');});
    }
    if(target.closest('#waDimensionTimeTree .wa-tt-node'))grant('dimension');
    if(target.closest('#waIdDna,[data-major="dna"],#waDna65 .wa-dna65-tabs button,#waDna65 .wa-dna65-network button'))grant('dna');
    if(target.closest('#discography .disco-more')){
      const b=target.closest('.disco-more');
      requestAnimationFrame(()=>{if(b?.getAttribute('aria-expanded')==='true')grant('album');});
    }
    if(target.closest('#wa75Save,#wa75Card')){
      requestAnimationFrame(()=>{
        if($$('#wa75Builder .wa75-member[aria-pressed="true"]').length>=2)grant('producer');
      });
    }
    if(target.closest('#waIdCreate')){
      requestAnimationFrame(()=>{if($('#waIdResult:not([hidden]) #waIdPass'))grant('identity');});
    }
  },{capture:true});
  document.addEventListener('wa:language',scheduleRefresh);
  window.addEventListener('pageshow',scheduleRefresh);
  window.WA115_PHASE4=Object.freeze({
    chemistry:()=>window.WA11_UNIT_CHEMISTRY?.analyzeSelection()||null,
    getBadges:()=>JSON.parse(JSON.stringify(state)),
    refresh:()=>{updateReport();scheduleRefresh();},
    // Stable API for future on-site explorer achievements; only declared IDs accepted.
    unlockBadge:grant
  });
})();

