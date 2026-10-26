
/* WAV ARCHIVE · GRAVITY RACE LAB
 * Standalone read-only archive overlay. No changes to MEMBERS, DIMENSIONS,
 * TAP TO FLIP, legacy Gravity records, or existing handlers.
 * Data: archived FINAL COMO counts only. Intermediate race frames are simulated.
 */
(() => {
  'use strict';
  if (window.WAVGravityRaceLab?.mounted) return;

  const ARCHIVE_RESULTS = Object.freeze([
    {
      id:'taipei-1018', date:'2026-10-18', type:'event', status:'unverified',
      title:{ko:'ANDLESS 타이베이 앙코르 Gravity',en:'ANDLESS Taipei Encore Gravity',ja:'ANDLESS 台北アンコール Gravity'},
      description:{ko:'투표 진행은 확인되지만 신뢰할 수 있는 최종 득표수·선정곡은 미확인. 집계 그래프는 제공하지 않습니다.',en:'The event is documented, but a trustworthy final tally and winning song are unavailable. No chart is shown.',ja:'投票実施は確認できますが、確かな最終票数と選曲結果は未確認。グラフは表示しません。'},
      source:'https://apollo.cafe/gravity/tripleS/234',choices:[]
    },
    {
      id:'seoul-1011b', date:'2026-10-11', type:'event',status:'final',total:89339,
      title:{ko:'ANDLESS 서울 앙코르 · 10.11 기록 #228',en:'ANDLESS Seoul Encore · 11 Oct #228',ja:'ANDLESS ソウルアンコール · 10/11 #228'},
      description:{ko:'10월 11일에 등록된 두 투표 기록 중 #228. 3위 선택지 이름은 원문에 표시되지 않습니다.',en:'Apollo record #228 from 11 Oct. The third option is unnamed in the source.',ja:'10月11日の記録 #228。3位候補の名称は資料にありません。'},
      winner:{ko:'Midnight Flower',en:'Midnight Flower',ja:'Midnight Flower'},
      source:'https://apollo.cafe/gravity/tripleS/228',
      choices:[['Midnight Flower',36308],['Too Hot',29798],[{ko:'3위 · 선택지명 미기재',en:'3rd · unnamed option',ja:'3位 · 名称未記載'},16353],['Firework Diary',6880]]
    },
    {
      id:'seoul-1011a', date:'2026-10-11', type:'event',status:'final',total:13814,
      title:{ko:'ANDLESS 서울 앙코르 · 10.11 기록 #227',en:'ANDLESS Seoul Encore · 11 Oct #227',ja:'ANDLESS ソウルアンコール · 10/11 #227'},
      description:{ko:'별도 기록 #227. 1위 선택지의 제목이 원문에 표시되지 않아 임의로 채우지 않았습니다.',en:'Separate record #227. The winning option name is not supplied by the source.',ja:'別の記録 #227。1位の候補名は元資料にないため補っていません。'},
      winner:null,source:'https://apollo.cafe/gravity/tripleS/227',
      choices:[[{ko:'1위 · 선택지명 미기재',en:'1st · unnamed option',ja:'1位 · 名称未記載'},3605],['Too Hot',3447],['Midnight Flower',3418],['Firework Diary',3344]]
    },
    {
      id:'seoul-1010', date:'2026-10-10', type:'event',status:'final',total:117929,
      title:{ko:'ANDLESS 서울 앙코르 · 10.10',en:'ANDLESS Seoul Encore · 10 Oct',ja:'ANDLESS ソウルアンコール · 10/10'},
      description:{ko:'서울 첫 공연의 앙코르 최종곡 선정 투표.',en:'Encore song choice during the first Seoul concert.',ja:'ソウル初日のアンコール曲を選ぶ投票。'},
      winner:{ko:'24',en:'24',ja:'24'},source:'https://apollo.cafe/gravity/tripleS/226',
      choices:[['24',55051],['Colorful',39765],['Heart Raider',12066],['Type of Girl',11047]]
    },
    {
      id:'opening-0925',date:'2026-09-25',type:'event',status:'final',total:113636,
      title:{ko:'서울 공연 오프닝 의상 Gravity',en:'Seoul Opening Outfit Gravity',ja:'ソウル公演オープニング衣装 Gravity'},
      description:{ko:'ANDLESS 서울 콘서트 오프닝 의상 콘셉트 선정.',en:'Opening outfit concept for the ANDLESS Seoul concert.',ja:'ANDLESS ソウル公演の衣装コンセプト投票。'},
      winner:{ko:'배틀로얄 룩',en:'Battle Royale Look',ja:'バトルロイヤル・ルック'},
      source:'https://apollo.cafe/gravity/tripleS/224',
      choices:[[{ko:'배틀로얄 룩',en:'Battle Royale Look',ja:'バトルロイヤル'},60180],[{ko:'세일러문 룩',en:'Sailor Moon Look',ja:'セーラームーン'},23841],[{ko:'에반게리온 룩',en:'Evangelion Look',ja:'エヴァンゲリオン'},16693],[{ko:'마린 룩',en:'Marine Look',ja:'マリン'},5043],[{ko:'카드캡터 체리 룩',en:'Cardcaptor Sakura Look',ja:'カードキャプターさくら'},4974],[{ko:'발레코어 룩',en:'Balletcore Look',ja:'バレエコア'},2905]]
    },
    {
      id:'winter-song',date:'2026-09-24',type:'event',status:'final',total:33343,
      title:{ko:'겨울 커버곡 Gravity',en:'Winter Cover Song Gravity',ja:'冬のカバー曲 Gravity'},
      description:{ko:'Winter Cover Unit · Team Blue C 공연곡 선정.',en:'Winter cover song selected for Team Blue C.',ja:'Team Blue C の冬のカバー曲選定。'},
      winner:'Merry & Happy',source:'https://apollo.cafe/gravity/tripleS/223',
      choices:[['Merry & Happy',12166],['첫눈에... (Snowy Wish)',8206],['Santa Tell Me',4836],['雪の華',4299],['Merry-Chri',2182],['A Nonsense Christmas',1654]]
    },
    {
      id:'winter-unit',date:'2026-09-23',type:'event',status:'final',total:97917,
      title:{ko:'겨울 커버 유닛 선발 Gravity',en:'Winter Cover Unit Gravity',ja:'冬のカバーユニット Gravity'},
      description:{ko:'Team Blue C가 선정됨. 16개 선택지의 최종 결과를 기록.',en:'Team Blue C was selected; all 16 final options are archived.',ja:'Team Blue C が選ばれました。最終16候補を記録。'},
      winner:'Team Blue C',source:'https://apollo.cafe/gravity/tripleS/222',
      choices:[['Team Blue C',28137],['Team White',25616],['Team Blue B',12965],['Team Blue D',8574],['Team Yellow B',5772],['Team Red B',4339],['Team Red A',1902],['Team Yellow C',1869],['Team Pink A',1771],['Team Orange A',1351],['Team Red C',1282],['Team Orange B',1170],['Team Yellow A',820],['Team Green B',741],['Team Pink B',582],['Team Blue A',518],['Team Green A',508]]
    },
    {
      id:'visual-director',date:'2026-09-21',type:'event',status:'final',total:87462,
      title:{ko:'Visual Director Gravity',en:'Visual Director Gravity',ja:'Visual Director Gravity'},
      description:{ko:'비주얼 디렉터 선정 Gravity. 최종 콘셉트는 빈티지 웨딩.',en:'Visual director selection. The winning concept is vintage wedding.',ja:'ビジュアルディレクター選考。テーマはヴィンテージウェディング。'},
      winner:{ko:'박소현',en:'SoHyun',ja:'ソヒョン'},source:'https://apollo.cafe/gravity/tripleS/221',
      choices:[[{ko:'박소현',en:'SoHyun',ja:'ソヒョン'},47411],[{ko:'정혜린',en:'HyeRin',ja:'ヘリン'},28986],[{ko:'윤서연',en:'SeoYeon',ja:'ソヨン'},11065]]
    },
    {
      id:'assemble26-leader',date:'2026-05',type:'event',status:'final',total:755316,
      title:{ko:'ASSEMBLE26 리더 선발 Gravity',en:'ASSEMBLE26 Leader Gravity',ja:'ASSEMBLE26 リーダー Gravity'},
      description:{ko:'리더 후보 두 명의 결선 최종 기록. 53.0%로 지연 선정.',en:'Leader final. JiYeon selected with 53.0%.',ja:'リーダー選考決選。ジヨンが53.0%で選出。'},
      winner:{ko:'지연',en:'JiYeon',ja:'ジヨン'},source:'https://www.namu.moe/w/tripleS/Gravity',
      choices:[[{ko:'지연',en:'JiYeon',ja:'ジヨン'},400420],[{ko:'김채연',en:'ChaeYeon',ja:'チェヨン'},354896]]
    },
    {
      id:'ballad2-grand',date:'2026-08-23',type:'grand',status:'summary',total:1250945,
      title:{ko:'Ballad Dimension 2 · Grand Gravity',en:'Ballad Dimension 2 · Grand Gravity',ja:'Ballad Dimension 2 · Grand Gravity'},
      description:{ko:'총 1,250,945 COMO 사용. 주빈 사전 합류 + 투표 선발 3인. 전체 후보별 누적 최종치가 아닌, 여러 선발 라운드의 총합입니다.',en:'Total 1,250,945 COMO across separate selection rounds. JooBin was pre-selected; three others were voted in. Not a candidate-by-candidate race.',ja:'複数ラウンドの合計1,250,945 COMO。ジュビンは事前選抜、残り3名を投票で選出。候補別のレースではありません。'},
      winner:null,source:'https://triplesfans.com/gravity?lang=en',choices:[]
    },
    {
      id:'assemble25-grand',date:'2025-02-01',type:'grand',status:'summary',total:583228,
      title:{ko:'ASSEMBLE25 타이틀곡 Grand Gravity',en:'ASSEMBLE25 Title Track Grand Gravity',ja:'ASSEMBLE25 タイトル曲 Grand Gravity'},
      description:{ko:'깨어 (Are You Alive)가 선정됨. 583,228 COMO는 모든 라운드를 합친 투표 총계이며 깨어의 단일 후보 득표수가 아닙니다.',en:'Are You Alive was selected. 583,228 COMO is the aggregate across rounds, NOT the winning option count.',ja:'Are You Alive が選出。583,228 COMOは全ラウンドの合計で、勝利候補の単独得票数ではありません。'},
      winner:{ko:'깨어 (Are You Alive)',en:'Are You Alive',ja:'Are You Alive'},source:'https://triplesfans.com/gravity?lang=en',choices:[]
    },
    {
      id:'japan-grand',date:'2024-08-28',type:'grand',status:'summary',total:968420,
      title:{ko:'Japan Dimension ∞! 선발 Grand Gravity',en:'Japan Dimension ∞! Grand Gravity',ja:'日本 DIMENSION ∞! Grand Gravity'},
      description:{ko:'멤버 구성 선발 전체 투표 968,420 COMO. 별도로 실시된 리더 선발 투표 수치와 구분합니다.',en:'968,420 COMO used for the lineup selection; not the same as the separate leader vote.',ja:'メンバー構成決定の合計968,420 COMO。別途行われたリーダー投票と区別します。'},
      winner:'∞! (Hatchi)',source:'https://triplesfans.com/gravity?lang=en',choices:[]
    },
    {
      id:'reality-0425',date:'2026-04-25',type:'event',status:'final',total:496143,
      title:{ko:'2026 예능 콘셉트 Gravity',en:'2026 Variety Concept Gravity',ja:'2026 バラエティ企画 Gravity'},
      description:{ko:'배지전쟁 4의 기본 콘셉트가 된 예능 기획 선택 투표.',en:'The vote deciding the large-scale variety-show concept.',ja:'大型バラエティ番組のコンセプト選択。'},
      winner:'Trust No One',source:'https://apollo.cafe/gravity/tripleS/184',
      choices:[['Trust No One',385373],['ALL YES, tripleS',110770]]
    }
  ]);

  const DICT = Object.freeze({
    ko:{summary:'총 COMO 확인 · 후보별 미확인',recent:'최근',tag:'ARCHIVE CHECKED · 2026',title:'GRAVITY RACE LAB',intro:'최종 COMO 결과를 타임랩스로 탐색하는 투표 기록. 날짜·후보별 실제 최종 수치는 외부 아카이브와 대조했어.',final:'최종 득표 기록',items:'기록',latest:'최근 기록',all:'전체',event:'EVENT',grand:'GRAND',play:'▶ 투표 흐름 재생',pending:'수치 확인 중',winner:'결과',source:'기록 출처 ↗',policy:'중요: 재생 중간값과 순위 변화는 가상의 보간 연출입니다. 실제 투표 당시의 시점별 득표 추이·역전 기록이 아닙니다. 마지막 화면의 후보별 COMO만 확인된 최종 결과입니다. COSMO 원자료와 비공식 기록은 서로 구분합니다.',modalKicker:'WAV ARCHIVE · FINAL VOTE VISUALIZER',tot:'최종 합계',sim:'가상 흐름 재생 · 실제 시간별 집계 아님',start:'▶ 재생',pause:'Ⅱ 일시정지',again:'↺ 처음부터',close:'닫기',timeline:'가상 진행률',now:'재생 단계',end:'최종 결과',noData:'재생용 최종 득표 자료 없음',sourceNote:'출처: 외부 Gravity 기록',year:'연도',noItems:'해당 범주의 Gravity 기록이 없어.',unknown:'결과 확인 중'},
    en:{summary:'Total known · breakdown unavailable',recent:'Recent',tag:'ARCHIVE CHECKED · 2026',title:'GRAVITY RACE LAB',intro:'Explore archived final COMO totals as an interactive race. Candidate counts were checked against public archives.',final:'Final vote records',items:'records',latest:'Recent',all:'ALL',event:'EVENT',grand:'GRAND',play:'▶ Replay vote flow',pending:'Data pending',winner:'Winner',source:'Data source ↗',policy:'Important: intermediate totals and rank changes are SIMULATED interpolation, not actual historical timestamps or comeback events. Only the final candidate COMO counts are archived outcomes. Third-party data is identified separately from COSMO.',modalKicker:'WAV ARCHIVE · FINAL VOTE VISUALIZER',tot:'Final total',sim:'Simulation · not historical vote-by-time data',start:'▶ Play',pause:'Ⅱ Pause',again:'↺ Restart',close:'Close',timeline:'Simulated progress',now:'In progress',end:'Final result',noData:'No verified final candidate totals',sourceNote:'Source: third-party Gravity archive',year:'Year',noItems:'No Gravity records in this filter.',unknown:'Result under review'},
    ja:{summary:'総数確認済み · 候補別データなし',recent:'最近',tag:'ARCHIVE CHECKED · 2026',title:'GRAVITY RACE LAB',intro:'候補別の最終COMO数をインタラクティブに可視化。数値は公開アーカイブと照合しています。',final:'最終投票記録',items:'記録',latest:'最近の記録',all:'すべて',event:'EVENT',grand:'GRAND',play:'▶ 投票フロー再生',pending:'集計確認中',winner:'結果',source:'記録の出典 ↗',policy:'重要：再生途中の得票数・順位変動は架空の補間演出で、当時の実際の時間別集計ではありません。最後に表示される最終候補別COMOのみ記録された結果です。',modalKicker:'WAV ARCHIVE · FINAL VOTE VISUALIZER',tot:'最終合計',sim:'再現シミュレーション · 実際の時間別投票データではありません',start:'▶ 再生',pause:'Ⅱ 停止',again:'↺ やり直し',close:'閉じる',timeline:'仮想進行率',now:'再生中',end:'最終結果',noData:'確認済み候補別票数なし',sourceNote:'出典：外部 Gravity 記録',year:'年',noItems:'該当するGravityの記録はありません。',unknown:'結果確認中'}
  });

  const LANG_ALIASES = {'jp':'ja','kr':'ko'};
  const state = { filter:'all',selected:null,progress:0,timer:0,startedAt:0,running:false,rows:[],closeFocus:null };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const numberFormat = new Intl.NumberFormat('en-US');
  let section=null, lab=null, dialog=null;
  const byId=(id)=>document.getElementById(id);
  const num=(n)=>numberFormat.format(n);
  const lang=()=>{
    const raw=String(window.WA11Locale?.currentLang || window.currentLang || document.documentElement.lang || 'ko').toLowerCase();
    const short=LANG_ALIASES[raw.slice(0,2)] || raw.slice(0,2);
    return DICT[short] ? short : 'ko';
  };
  const msg=(key)=>DICT[lang()][key];
  const localized=(val)=>typeof val==='string' ? val : ((val && (val[lang()]||val.ko||val.en||val.ja)) || '');
  const make=(tag,cls,txt)=>{
    const node=document.createElement(tag);
    if(cls)node.className=cls;
    if(txt!==undefined)node.textContent=txt;
    return node;
  };
  const button=(cls,text)=>{const b=make('button',cls,text);b.type='button';return b;};
  const verified=(entry)=>entry.status==='final' && Array.isArray(entry.choices) && entry.choices.length>0 &&
    entry.choices.every(c=>Number.isSafeInteger(c[1])&&c[1]>=0) &&
    entry.choices.reduce((sum,c)=>sum+c[1],0)===entry.total;

  function makeCard(item){
    const art=make('article','wgr-card');
    art.dataset.wgrId=item.id;
    art.dataset.type=item.type;
    const top=make('div','wgr-card-top');
    top.append(make('span','wgr-dot'),make('span','',item.date),make('span','',item.type.toUpperCase()),make('span','',verified(item)?'ARCHIVE CHECKED':(item.status==='summary'?'AGGREGATE ONLY':'DATA PENDING')));
    const title=make('h3','',localized(item.title));
    const desc=make('p','wgr-card-desc',localized(item.description));
    const wins=make('div','wgr-winner',item.winner?`${msg('winner')} · ${localized(item.winner)}`:(item.status==='summary'?msg('summary'):msg('unknown')));
    const bottom=make('div','wgr-card-bottom');
    const count=make('span','wgr-total',(verified(item)||item.status==='summary')?`${num(item.total)} COMO`:msg('pending'));
    const actions=make('div','wgr-actions');
    const src=make('a','wgr-source',msg('source'));
    src.href=item.source;src.target='_blank';src.rel='noopener noreferrer';
    actions.append(src);
    if(verified(item)){
      const play=button('wgr-play',msg('play'));
      play.addEventListener('click',()=>openRace(item,play));
      actions.append(play);
    }
    bottom.append(count,actions);art.append(top,title,desc,wins,bottom);
    return art;
  }
  function setFilter(value){
    state.filter=value;
    const list=lab.querySelector('.wgr-list');
    list.replaceChildren();
    let entries=ARCHIVE_RESULTS.filter(e=>value==='all' || e.type===value || (value==='recent' && e.date>='2026-09-01'));
    if(!entries.length)list.append(make('p','wgr-null',msg('noItems')));
    for(const item of entries)list.append(makeCard(item));
    lab.querySelectorAll('[data-wgr-filter]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.wgrFilter===value)));
  }
  function buildLab(){
    lab=make('div','');lab.id='waGravityRaceLab';
    const shell=make('div','wgr-shell');
    const kicker=make('div','wgr-kicker',msg('tag'));
    const header=make('div','wgr-head');
    const name=make('h2','',msg('title'));
    const titleWrap=make('div');titleWrap.append(name);
    header.append(titleWrap,make('p','wgr-head-note',msg('intro')));
    const stats=make('div','wgr-statrow');
    const complete=ARCHIVE_RESULTS.filter(verified).length;
    for(const [key,value] of [[msg('final'),complete],[msg('items'),ARCHIVE_RESULTS.length],['LAST CHECK','2026.10.23 KST']]){
      const item=make('div','wgr-stat');item.append(make('span','',key),make('b','',String(value)));stats.append(item);
    }
    const tabs=make('div','wgr-tabs');tabs.setAttribute('role','group');
    tabs.setAttribute('aria-label','Gravity filter');
    for(const key of ['all','recent','event','grand']){
      const t=button('wgr-tab',msg(key));t.dataset.wgrFilter=key;t.setAttribute('aria-pressed','false');
      t.addEventListener('click',()=>setFilter(key));tabs.append(t);
    }
    const list=make('div','wgr-list');
    const policy=make('p','wgr-policynote',msg('policy'));
    shell.append(kicker,header,stats,tabs,list,policy);lab.append(shell);
    const before=section.querySelector('#wa63GravityIntelligence') || section.querySelector('#wa-gravity-v2') || section.querySelector('.wrap');
    section.insertBefore(lab,before);
    setFilter(state.filter);
  }
  function buildDialog(){
    dialog=make('dialog','');dialog.id='waGravityRaceDialog';
    const inner=make('div','wgr-dialog-inner');
    const top=make('div','wgr-dialog-top');
    const header=make('div');header.append(make('span','wgr-overline',msg('modalKicker')),make('h2','wgr-modal-title'));
    const close=button('wgr-close','×');close.setAttribute('aria-label',msg('close'));
    close.addEventListener('click',closeRace);
    top.append(header,close);
    const big=make('div','wgr-bigstat');
    const total=make('span','wgr-total-num','0');total.id='wgrDialogTotal';
    big.append(total,make('small','',`COMO · ${msg('tot')}`));
    const warn=make('p','wgr-warning',msg('sim'));
    const controls=make('div','wgr-racecontrols');
    const play=button('wgr-control',msg('start'));play.dataset.wgrAction='play';
    const restart=button('wgr-control secondary',msg('again'));restart.dataset.wgrAction='restart';
    controls.append(play,restart);
    const progress=make('input','wgr-range');progress.type='range';progress.min='0';progress.max='1000';progress.step='1';progress.value='0';progress.id='wgrRaceProgress';
    progress.setAttribute('aria-label',msg('timeline'));
    const tick=make('div','wgr-progress-label');tick.append(make('span','',msg('timeline')),make('span','wgr-percent','0%'));
    const board=make('div','wgr-raceboard');board.id='wgrRaceBoard';board.setAttribute('aria-live','off');
    const footer=make('div','wgr-dialogfoot');const source=make('a','',msg('sourceNote'));source.id='wgrRaceSource';source.target='_blank';source.rel='noopener noreferrer';
    footer.append(source,make('p','',msg('policy')));
    inner.append(top,big,warn,controls,progress,tick,board,footer);
    dialog.append(inner);document.body.append(dialog);
    dialog.addEventListener('click',event=>{if(event.target===dialog)closeRace()});
    dialog.addEventListener('close',()=>{stopRace();state.selected=null;state.closeFocus?.focus?.()});
    dialog.querySelector('[data-wgr-action="play"]').addEventListener('click',toggleRace);
    dialog.querySelector('[data-wgr-action="restart"]').addEventListener('click',()=>{stopRace();state.progress=0;paintFrame(0);startRace()});
    progress.addEventListener('input',()=>{stopRace();state.progress=Number(progress.value)/1000;paintFrame(state.progress)});
  }
  function makeRaceRow(entry,choice,index){
    const row=make('div','wgr-racer');row.dataset.choiceIndex=String(index);
    row.style.order=String(index);
    const head=make('div','wgr-racer-head');
    const name=make('span','wgr-racer-name');name.append(make('b','',`#${index+1}`),document.createTextNode(localized(choice[0])));
    const amount=make('span','wgr-racer-count','0 COMO');
    head.append(name,amount);
    const bar=make('div','wgr-bar-track');bar.append(make('div','wgr-bar-fill'));
    row.append(head,bar);entry.row=row;entry.nameEl=name;entry.amountEl=amount;entry.fillEl=bar.firstElementChild;
    return row;
  }
  function openRace(item,trigger){
    if(!verified(item))return;
    stopRace();state.selected=item;state.progress=0;state.closeFocus=trigger;
    dialog.querySelector('.wgr-modal-title').textContent=localized(item.title);
    dialog.querySelector('#wgrDialogTotal').textContent=num(item.total);
    dialog.querySelector('#wgrRaceSource').href=item.source;
    const board=byId('wgrRaceBoard');board.replaceChildren();
    state.rows=item.choices.map((choice,index)=>({choice,index,row:null}));
    for(const [index,row] of state.rows.entries())board.append(makeRaceRow(row,row.choice,index));
    paintFrame(0);
    if(typeof dialog.showModal==='function')dialog.showModal();
    else dialog.setAttribute('open','');
    dialog.querySelector('.wgr-close').focus({preventScroll:true});
    startRace();
  }
  function closeRace(){
    stopRace();if(dialog?.open){if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open')}
  }
  function stopRace(){
    if(state.timer){clearTimeout(state.timer);state.timer=0}
    state.running=false;
    if(dialog){const btn=dialog.querySelector('[data-wgr-action="play"]');if(btn)btn.textContent=msg('start')}
  }
  function simulatedValue(amount,p,index){
    if(p>=1)return amount;
    if(p<=0)return 0;
    // Fictional monotonic growth curves, each reaching the exact archived final.
    // No historical timestamp, rate, or intermediate count is asserted.
    const exponents=[1.20,0.72,1.51,0.91,1.79,1.10,0.65,1.39];
    const exponent=exponents[index % exponents.length];
    return Math.max(0,Math.min(amount,Math.round(amount * (p ** exponent))));
  }
  function paintFrame(progress){
    if(!state.selected)return;
    const p=Math.min(1,Math.max(0,progress));state.progress=p;
    byId('wgrRaceProgress').value=String(Math.round(p*1000));
    dialog.querySelector('.wgr-percent').textContent=`${Math.round(p*100)}%`;
    const maxFinal=Math.max(1,...state.selected.choices.map(row=>row[1]));
    const values=state.rows.map(x=>simulatedValue(x.choice[1],p,x.index));
    const sorted=state.rows.map(x=>x.index).sort((a,b)=>values[b]-values[a]||a-b);
    const shouldReorder=state.rows.some(x=>Number(x.row.style.order)!==sorted.indexOf(x.index));
    const oldY=new Map();
    if(shouldReorder&&!reduced.matches){
      for(const item of state.rows)oldY.set(item.index,item.row.getBoundingClientRect().top);
    }
    for(const entry of state.rows){
      const rank=sorted.indexOf(entry.index)+1;
      const label=localized(entry.choice[0]);
      entry.nameEl.firstElementChild.textContent=`#${rank}`;
      if(entry.nameEl.lastChild.nodeType===Node.TEXT_NODE)entry.nameEl.lastChild.nodeValue=label;
      entry.amountEl.textContent=`${num(values[entry.index])} COMO`;
      entry.fillEl.style.width=`${((values[entry.index]/maxFinal)*100).toFixed(2)}%`;
      entry.row.classList.toggle('wgr-leader',rank===1);
      entry.row.style.order=String(rank-1);
    }
    if(shouldReorder && !reduced.matches && oldY.size){
      requestAnimationFrame(()=>{
        if(!dialog?.open)return;
        for(const item of state.rows){
          const distance=oldY.get(item.index)-item.row.getBoundingClientRect().top;
          if(Math.abs(distance)>2 && typeof item.row.animate==='function'){
            item.row.getAnimations().forEach(anim=>anim.cancel());
            item.row.animate([{transform:`translate3d(0,${distance}px,0)`},{transform:'translate3d(0,0,0)'}],{duration:360,easing:'cubic-bezier(.2,.7,.24,1)'});
          }
        }
      });
    }
  }
  function startRace(){
    if(!state.selected || document.hidden || state.running)return;
    if(state.progress>=1){state.progress=0;paintFrame(0)}
    if(reduced.matches){paintFrame(1);return}
    state.running=true;
    const start=performance.now()-state.progress*6500;
    dialog.querySelector('[data-wgr-action="play"]').textContent=msg('pause');
    function tick(){
      if(!state.running||!state.selected||document.hidden)return;
      const p=Math.min(1,(performance.now()-start)/6500);
      paintFrame(p);
      if(p>=1){stopRace();return}
      state.timer=window.setTimeout(tick,220);
    }
    tick();
  }
  function toggleRace(){if(state.running){stopRace()}else{startRace()}}
  function refreshLocale(){
    if(!lab)return;
    const selected=state.selected;const prog=state.progress;
    setFilter(state.filter);
    lab.querySelector('.wgr-kicker').textContent=msg('tag');
    lab.querySelector('.wgr-head h2').textContent=msg('title');
    lab.querySelector('.wgr-head-note').textContent=msg('intro');
    lab.querySelector('.wgr-policynote').textContent=msg('policy');
    const captions=[msg('final'),msg('items'),'LAST CHECK'];
    lab.querySelectorAll('.wgr-stat span').forEach((el,i)=>{el.textContent=captions[i]});
    lab.querySelectorAll('.wgr-tab').forEach(el=>{el.textContent=msg(el.dataset.wgrFilter)});
    if(selected && dialog?.open){
      dialog.querySelector('.wgr-modal-title').textContent=localized(selected.title);
      dialog.querySelector('.wgr-warning').textContent=msg('sim');
      dialog.querySelector('.wgr-overline').textContent=msg('modalKicker');
      dialog.querySelector('.wgr-close').setAttribute('aria-label',msg('close'));
      dialog.querySelector('.wgr-progress-label span').textContent=msg('timeline');
      dialog.querySelector('.wgr-dialogfoot p').textContent=msg('policy');
      dialog.querySelector('#wgrRaceSource').textContent=msg('sourceNote');
      dialog.querySelector('[data-wgr-action="restart"]').textContent=msg('again');
      dialog.querySelector('[data-wgr-action="play"]').textContent=state.running?msg('pause'):msg('start');
      paintFrame(prog);
    }
  }
  function annotateLegacyRecords(){
    // Legacy HTML stays intact in the source. Minimal on-screen annotations
    // clarify confirmed archival category mismatches without deleting any data.
    const cards=Array.from(section.querySelectorAll('.gravity-card'));
    for(const card of cards){
      const text=card.textContent||'';
      if(text.includes('Ballad Dimension 2') && text.includes('최종 DIMENSION') && text.includes('5인')){
        const candidates=Array.from(card.querySelectorAll('.gravity-ranking .gravity-rank'));
        for(const node of candidates){
          const title=node.querySelector('.rank-name');
          const count=node.querySelector('.como');
          if(title?.textContent?.includes('최종 DIMENSION') && count?.textContent?.includes('5인')){
            count.textContent='4인';
            count.title='주빈 사전 선발 1인 + Gravity 선발 3인';
          }
        }
      }
      if(text.includes('ASSEMBLE25 Title Track') && text.includes('583,228')){
        const rank=card.querySelector('.gravity-ranking .gravity-rank');
        if(rank && rank.textContent.includes('583,228')){
          const vote=rank.querySelector('.como');
          if(vote)vote.textContent='최종 선정 (583,228 = 전체 투표 합계)';
        }
      }
      if(text.includes('Japan Dimension ∞!') && text.includes('104,796')){
        if(!card.querySelector('[data-wa-gravity-audit]')){
          const note=make('p','', '자료 안내 · 아래 마유/코토네 등의 수치는 별도의 ∞! 리더 선발 Gravity 일부 결과이며, 이 멤버 구성 Grand Gravity의 후보별 득표수로 해석하면 안 됩니다.');
          note.dataset.waGravityAudit='1';
          note.style.cssText='font-size:10px;line-height:1.6;padding:9px 11px;border-left:2px solid #d4af82;background:rgba(184,128,44,.08);border-radius:7px';
          card.querySelector('.gravity-ranking')?.after(note);
        }
      }
    }
    const legacyGrid=section.querySelector('.gravity-grid');
    if(legacyGrid && !section.querySelector('.wgr-legacy-alert')){
      const warning=make('div','wgr-legacy-alert','기존 GRAVITY 01–11은 과거 요약을 보존한 레거시 기록입니다. 위 RACE LAB은 별도로 교차 확인된 최종 후보별 COMO를 우선 표시하며, 총투표수와 특정 후보 득표수는 반드시 구별해 주세요.');
      legacyGrid.before(warning);
    }
    const label=section.querySelector('#wa63GravityIntelligence .wa63-paneltop span');
    const latest=section.querySelector('#wa63GravityIntelligence .wa63-panel:nth-child(2) .wa63-paneltop span');
    if(latest && latest.textContent.includes('SEP 2026'))latest.textContent='SEP 2026 · ARCHIVE';
  }
  function init(){
    section=byId('gravity');if(!section || byId('waGravityRaceLab'))return;
    buildLab();buildDialog();annotateLegacyRecords();
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stopRace()});
    window.addEventListener('pagehide',stopRace,{passive:true});
    document.addEventListener('wa:locale-change',refreshLocale);
    document.addEventListener('wa:language',refreshLocale);
    window.WAVGravityRaceLab={mounted:true,records:ARCHIVE_RESULTS.length,verified:ARCHIVE_RESULTS.filter(verified).length,open:(id)=>{const r=ARCHIVE_RESULTS.find(x=>x.id===id);if(r && verified(r))openRace(r,null)},stop:stopRace};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

