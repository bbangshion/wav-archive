/* WAV ARCHIVE · BADGE WAR HUB · additive / no mutations outside #badgewar4 .wrap */
(()=>{'use strict';
  const section=document.getElementById('badgewar4');
  if(!section||section.dataset.waBadgeHub==='1')return;
  const wrap=section.querySelector(':scope > .wrap');
  if(!wrap)return;
  const cssText={
    ko:{header:'06 · BADGE WAR ARCHIVE',main:'배지전쟁, 네 번의 기록',desc:'네 시즌의 공식 영상을 한곳에서 살펴보고, 미션과 기록을 시즌별로 탐색해 보세요',season:'시즌',members:'참여 인원',episodes:'공식 본편',period:'공개 기간',region:'촬영 배경',overview:'시즌 개요',rules:'핵심 규칙',browse:'회차별 기록',watch:'공식 영상 ↗',memberLink:'멤버 아카이브 ↗',gravityLink:'GRAVITY ↗',historyLink:'HISTORY ↗',spoiler:'스포일러가 포함될 수 있는 최종화 보기',spoilText:'우승자, 스파이 정체, 배지 개수는 원본 검증 전까지 이 아카이브에서 공개하지 않습니다. 아래 링크는 결말이 포함된 공식 영상입니다',sources:'자료 출처',sourceText:'영상 및 날짜: 1theK Originals 공식 본편 · 시즌 배경: 팬 아카이브와 교차 확인. 미확인 결과·정확한 배지 수는 표시하지 않습니다',primary:'공식 영상',secondary:'시즌 배경 참고',status:'검증된 영상 링크 · 스포일러 최소화',entry:'회차로 이동',ep:'EP.',viewer:'출처 확인'},
    en:{header:'06 · BADGE WAR ARCHIVE',main:'Four seasons of Badge War',desc:'Explore four seasons, their verified official episodes and their defining missions',season:'Season',members:'On camera',episodes:'Official episodes',period:'Release period',region:'Setting',overview:'Season overview',rules:'Key rules',browse:'Episode archive',watch:'Official video ↗',memberLink:'Members ↗',gravityLink:'Gravity ↗',historyLink:'History ↗',spoiler:'Watch the finale (spoilers)',spoilText:'Winners, spy identities and badge counts remain unpublished until individually verified. The official finale linked here contains spoilers',sources:'Sources',sourceText:'Videos and dates: official 1theK Originals uploads. Season context: cross-checked against fan archive. Unverified results and badge counts are not displayed',primary:'Official videos',secondary:'Season context',status:'Verified links · spoiler-aware',entry:'Jump to episode',ep:'EP.',viewer:'Source'},
    ja:{header:'06 · BADGE WAR ARCHIVE',main:'バッジ戦争・4シーズンの記録',desc:'4シーズンの公式映像と各話のミッションをまとめて探せます',season:'シーズン',members:'出演人数',episodes:'公式本編',period:'公開期間',region:'舞台',overview:'シーズン概要',rules:'主なルール',browse:'エピソード一覧',watch:'公式映像 ↗',memberLink:'メンバー ↗',gravityLink:'Gravity ↗',historyLink:'HISTORY ↗',spoiler:'最終回を見る（ネタバレ）',spoilText:'優勝者、スパイの正体、バッジの数は確認完了まで掲載しません。最終回の公式映像にはネタバレが含まれます',sources:'出典',sourceText:'映像・日付：1theK Originalsの公式動画。背景情報：ファンアーカイブと照合。未確認の結果は掲載しません',primary:'公式映像',secondary:'シーズン参考',status:'確認済みリンク・ネタバレ配慮',entry:'話数へ移動',ep:'EP.',viewer:'出典'}
  };
  const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const dataURL='./data/wa-badgewar-seasons.json';
  const locale=()=>{let v=document.documentElement.dataset.language||document.documentElement.lang||'ko';v=v.toLowerCase().slice(0,2);return cssText[v]?v:'ko'};
  const loc=(x,lang)=>x&&typeof x==='object'?(x[lang]||x.ko||x.en||''):(x||'');
  const yt=vid=>/^[\w-]{11}$/.test(vid)?`https://www.youtube.com/watch?v=${vid}`:null;
  const simpleDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(v)?v.replace(/-/g,'.'):'';
  let chosen=4;let dataset=null;
  let phase2=null;
  const selectedTeamEpisode=Object.create(null);
  const selectedMember=Object.create(null);
  const sourceVideo=(s,i)=>yt(s.episodes[i].videoId);
  const render=()=>{
    if(!dataset)return;
    const lang=locale(),t=cssText[lang],seasons=dataset.seasons;
    const season=seasons.find(s=>s.number===chosen)||seasons[seasons.length-1];
    const rules=(season.rules||[]).map(r=>`<li>${escapeHTML(loc(r,lang))}</li>`).join('');
    const cards=season.episodes.map((ep,i)=>{
      const link=yt(ep.videoId);if(!link)return '';
      return `<article class="wa-bw1__episode" id="wa-bw-ep-${season.number}-${ep.number}">
        <div class="wa-bw1__thumb"><img alt="${escapeHTML(`Badge War ${season.number} EP.${ep.number}`)}" loading="lazy" decoding="async" width="640" height="360" src="https://i.ytimg.com/vi/${ep.videoId}/hqdefault.jpg"><span class="wa-bw1__pill">EP.${ep.number}${ep.number===4?' · FINAL':''}</span></div>
        <div class="wa-bw1__episode-body"><div class="wa-bw1__episode-head">${escapeHTML(simpleDate(ep.date))} · 1theK Originals</div><h5>${escapeHTML(loc(ep.title,lang))}</h5><p>${escapeHTML(loc(ep.summary,lang))}</p><div class="wa-bw1__linkrow"><a class="wa-bw1__link" href="${link}" rel="noopener noreferrer" target="_blank">${escapeHTML(t.watch)}</a></div></div>
       </article>`;
    }).join('');
    const sourceFirst=sourceVideo(season,0),sourceLast=sourceVideo(season,3);
    const html=`<div class="wa-bw1" lang="${lang}"><div class="wa-bw1__hero"><span class="wa-bw1__eyebrow">${escapeHTML(t.header)}</span><h2>${escapeHTML(t.main)}</h2><p>${escapeHTML(t.desc)}</p><div class="wa-bw1__stats"><span class="wa-bw1__stat"><b>04</b> SEASONS</span><span class="wa-bw1__stat"><b>16</b> EPISODES</span><span class="wa-bw1__stat">${escapeHTML(t.status)}</span></div></div>
      <div class="wa-bw1__seasons" role="tablist" aria-label="${escapeHTML(t.season)}">${seasons.map(s=>`<button type="button" class="wa-bw1__season" role="tab" aria-selected="${s.number===chosen}" data-bw-season="${s.number}" aria-controls="wa-bw1-content"><small>SEASON ${s.number} · ${s.year}</small><strong>${escapeHTML(s.name)}</strong><em>${s.episodeCount} EP · ${s.members} MEMBERS</em></button>`).join('')}</div>
      <div class="wa-bw1__panel" role="tabpanel" id="wa-bw1-content" aria-live="off"><div class="wa-bw1__panel-head"><div><span class="wa-bw1__eyebrow">SEASON 0${season.number} · ${escapeHTML(t.overview)}</span><h3>${escapeHTML(season.name)}</h3><p>${escapeHTML(loc(season.intro,lang))}</p></div><span class="wa-bw1__edition">${escapeHTML(loc(season.theme,lang))}</span></div>
      <div class="wa-bw1__facts"><div class="wa-bw1__fact"><small>${escapeHTML(t.period)}</small><strong>${escapeHTML(season.range)}</strong></div><div class="wa-bw1__fact"><small>${escapeHTML(t.members)}</small><strong>${season.members} / 24</strong></div><div class="wa-bw1__fact"><small>${escapeHTML(t.region)}</small><strong>${escapeHTML(loc(season.place,lang))}</strong></div></div>
      <span class="wa-bw1__eyebrow">${escapeHTML(t.rules)}</span><ul class="wa-bw1__rules">${rules}</ul>
      <p class="wa-bw1__note">${escapeHTML(loc(season.gravity,lang))}</p>
      ${season.participationNote?`<p class="wa-bw1__note">${escapeHTML(loc(season.participationNote,lang))}</p>`:''}
      <hr class="wa-bw1__divider"><div class="wa-bw1__sectiontop"><h4>${escapeHTML(t.browse)}</h4><span>EP.1 — EP.4</span></div>
      <nav class="wa-bw1__epnav" aria-label="${escapeHTML(t.entry)}">${season.episodes.map(ep=>`<button type="button" data-bw-jump="wa-bw-ep-${season.number}-${ep.number}">EP.${ep.number}</button>`).join('')}</nav>
      <div class="wa-bw1__episode-grid">${cards}</div>
      <details class="wa-bw1__spoiler"><summary>${escapeHTML(t.spoiler)}</summary><p>${escapeHTML(t.spoilText)}</p>${sourceLast?`<a href="${sourceLast}" class="wa-bw1__link" target="_blank" rel="noopener noreferrer">EP.4 · ${escapeHTML(t.watch)}</a>`:''}</details>
      <div class="wa-bw1__cross"><a href="#members" class="wa-bw1__link wa-bw1__link--alt">${escapeHTML(t.memberLink)}</a><a href="#gravity" class="wa-bw1__link wa-bw1__link--alt">${escapeHTML(t.gravityLink)}</a><a href="#timeline" class="wa-bw1__link wa-bw1__link--alt">${escapeHTML(t.historyLink)}</a></div>
      <div class="wa-bw1__sources"><b>${escapeHTML(t.sources)}</b> · ${escapeHTML(t.sourceText)}<br><a href="${sourceFirst}" target="_blank" rel="noopener noreferrer">1theK Originals · EP.1 ↗</a> · <a href="https://triplesfans.com/badge-war?lang=en" target="_blank" rel="noopener noreferrer">${escapeHTML(t.secondary)} ↗</a></div>
      </div><span class="wa-bw1__live" aria-live="polite" id="wa-bw1-live"></span></div>`;
    wrap.innerHTML=html;
    section.dataset.waBadgeHub='1';
    renderPhase2();
    const live=section.querySelector('#wa-bw1-live');if(live)live.textContent=`${t.season} ${chosen} · ${season.name}`;
  };
  /* Phase 2 adds season mission and team explorer ONLY inside the Badge War panel.
     Existing member cards, calendar, history, Gravity and the 16 video cards stay unchanged. */
  function renderPhase2(){
    if(!dataset||!phase2)return;
    const panel=section.querySelector('.wa-bw1__panel');
    if(!panel)return;
    const season=phase2.seasons.find(s=>s.number===chosen);
    if(!season)return;
    const lang=locale();
    const ui={
      ko:{kicker:'BADGE WAR · FIELD NOTES',heading:'미션 기록',intro:'각 회차의 핵심 게임을 빠르게 찾아보고 팀 구성을 비교해 보세요',team:'팀 구성 탐색',chooseEpisode:'회차 선택',member:'멤버 선택',all:'전체 멤버',found:'팀 구성',noTeams:'이 회차의 팀 편성은 아직 검증 중입니다',noMatch:'이 멤버의 팀 기록이 선택한 회차에 없습니다',note:'팀 편성과 미션 내용은 팬 아카이브를 참고해 정리했으며 공식 영상과 추가 대조 중입니다',gravity:'GRAVITY 연결',official:'공식 출처',source:'자료 참고',toMembers:'멤버 목록 ↗',disclaimer:'우승자·스파이 정체·배지 개수 등 결과는 검증 전까지 표시하지 않습니다'},
      en:{kicker:'BADGE WAR · FIELD NOTES',heading:'Mission records',intro:'Review the episode mechanics and compare team line-ups',team:'Team explorer',chooseEpisode:'Choose episode',member:'Member filter',all:'All members',found:'teams',noTeams:'The teams for this episode are still being checked',noMatch:'No team record for this member in this episode',note:'Teams and mission details are adapted from a fan archive and are still being checked against official video',gravity:'Gravity connection',official:'Official source',source:'Fan archive reference',toMembers:'Members ↗',disclaimer:'Winners, spy identities and exact badge counts are withheld pending verification'},
      ja:{kicker:'BADGE WAR · FIELD NOTES',heading:'ミッション記録',intro:'各話のルールとチーム編成を探索できます',team:'チーム編成',chooseEpisode:'エピソード',member:'メンバーで絞る',all:'全メンバー',found:'チーム',noTeams:'この回の編成は確認中です',noMatch:'選択した回に該当メンバーの編成記録はありません',note:'チーム・ミッション内容はファンアーカイブを参考にし、公式映像と照合中です',gravity:'Gravityとの連携',official:'公式資料',source:'ファンアーカイブ参考',toMembers:'メンバー一覧 ↗',disclaimer:'優勝者・スパイの正体・バッジ数は検証前のため掲載しません'}
    }[lang];
    const membersById=new Map(phase2.members.map(m=>[m.id,m]));
    const withTeams=season.episodes.filter(ep=>ep.teams.length);
    if(!withTeams.length)return;
    const wanted=selectedTeamEpisode[chosen];
    const episode=withTeams.find(ep=>ep.number===wanted)||withTeams[0];
    selectedTeamEpisode[chosen]=episode.number;
    let member=selectedMember[chosen]||'';
    if(member&&!membersById.has(member))member='';
    const labelMember=id=>{const m=membersById.get(id);return m?`${id} ${m[lang]||m.en}`:id};
    const missionHtml=season.episodes.map(ep=>`<div class="wa-bw2__mission"><small>EP.${ep.number}</small><b>${escapeHTML(loc(ep.title,lang))}</b><p>${escapeHTML(loc(ep.mechanic,lang))}</p></div>`).join('');
    const options=withTeams.map(ep=>`<option value="${ep.number}" ${ep.number===episode.number?'selected':''}>EP.${ep.number} · ${escapeHTML(loc(ep.title,lang))}</option>`).join('');
    const allMemberIds=[...new Set(withTeams.flatMap(ep=>ep.teams.flatMap(g=>g.members)))].sort();
    const memberOptions=`<option value="">${escapeHTML(ui.all)}</option>`+allMemberIds.map(id=>`<option value="${id}" ${id===member?'selected':''}>${escapeHTML(labelMember(id))}</option>`).join('');
    const shown=member?episode.teams.filter(team=>team.members.includes(member)):episode.teams;
    const teamHtml=shown.length?shown.map(team=>`<div class="wa-bw2__team"><b>${escapeHTML(team.label)}</b><small>${team.members.length} MEMBERS</small><div class="wa-bw2__memberchips">${team.members.map(id=>`<span class="wa-bw2__member${id===member?' wa-bw2__member--active':''}">${escapeHTML(labelMember(id))}</span>`).join('')}</div></div>`).join(''):`<p class="wa-bw2__empty">${escapeHTML(ui.noMatch)}</p>`;
    const official=season.officialMvpNotice;
    const gravityURL=official?.url&&/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/.test(official.url)?official.url:null;
    const markup=`<div class="wa-bw2" id="wa-bw2-detail"><div class="wa-bw2__top"><span class="wa-bw1__eyebrow">${escapeHTML(ui.kicker)}</span><h4>${escapeHTML(ui.heading)}</h4><p>${escapeHTML(ui.intro)}</p></div>
      <div class="wa-bw2__missions">${missionHtml}</div>
      <div class="wa-bw2__teams"><h4>${escapeHTML(ui.team)}</h4><div class="wa-bw2__controls"><label>${escapeHTML(ui.chooseEpisode)}<select data-bw2-ep>${options}</select></label><label>${escapeHTML(ui.member)}<select data-bw2-member>${memberOptions}</select></label></div>
      <div class="wa-bw2__teamgrid">${teamHtml}</div><p class="wa-bw2__source">${escapeHTML(ui.note)} <a href="https://triplesfans.com/badge-war?lang=en" target="_blank" rel="noopener noreferrer">${escapeHTML(ui.source)} ↗</a></p>
      </div><div class="wa-bw2__gravity"><b>${escapeHTML(ui.gravity)}</b><p>${escapeHTML(loc(season.gravityNotes,lang))}</p>${gravityURL?`<a href="${gravityURL}" target="_blank" rel="noopener noreferrer">${escapeHTML(loc(official.label,lang))} ↗</a>`:''}</div>
      <p class="wa-bw2__disclaimer">${escapeHTML(ui.disclaimer)}</p><a href="#members" class="wa-bw2__memberlink">${escapeHTML(ui.toMembers)}</a>
      </div>`;
    const old=panel.querySelector('#wa-bw2-detail');
    if(old){old.outerHTML=markup;}else{
      const divider=panel.querySelector('.wa-bw1__divider');
      if(divider)divider.insertAdjacentHTML('beforebegin',markup);
      else panel.insertAdjacentHTML('beforeend',markup);
    }
    renderPhase3(); // Phase 3 is local to this panel; missing data never affects previous features
  }

  /* Phase 3: measured team-lineup explorer.
     Derived exclusively from phase2 fan-crosschecked lineups; NEVER badge totals,
     competition scores, friendship rankings, MVP winners, or participation claims. */
  const labSelectedMember=Object.create(null);
  function renderPhase3(){
    if(!phase2||!dataset)return;
    const panel=section.querySelector('.wa-bw1__panel');
    if(!panel)return;
    const lang=locale();
    const labText={
      ko:{eyebrow:'BADGE WAR · DATA LAB',title:'팀 구성 데이터 랩',desc:'현재 등록된 팀 편성 기록을 기준으로 시즌과 멤버 사이의 연결을 살펴보세요',coverage:'팀 편성 확인 회차',lineups:'팀 편성 기록',memberCount:'팀 기록에 등장한 멤버',seasonCompare:'시즌별 팀 기록',seasonCompareHint:'바의 길이는 등록된 팀 편성 수를 뜻하며 배지 개수나 성적이 아닙니다',seasonLabel:'시즌',recordedEp:'기록된 회차',lineupCount:'팀 편성',chooseMember:'멤버별 팀 관계',memberLabel:'멤버 선택',episodes:'팀 편성이 기록된 회차',mateTitle:'같은 팀으로 등록된 멤버',mateCount:'서로 다른 팀원',mateTimes:'동일 팀 기록',units:'회',noMember:'해당 멤버의 팀 편성 데이터가 등록되어 있지 않습니다. 실제 미참가를 의미하지 않습니다',noMate:'아직 확인된 팀 관계가 없습니다',allData:'전체 4개 시즌 데이터 범위',seasonData:'선택한 시즌 데이터',source:'팀 데이터 출처',sourceNote:'팬 아카이브 기반 교차 자료 · 공식 본편과의 장면별 검증 진행 중',caution:'이 수치는 팀 편성 데이터에 등장한 횟수입니다. 배지 획득, 우승·MVP, 멤버 친밀도와 무관합니다. 기록이 없는 회차는 0점으로 취급하지 않습니다',goGravity:'Gravity 확인 ↗',goMember:'멤버 아카이브 ↗'},
      en:{eyebrow:'BADGE WAR · DATA LAB',title:'Team lineup data lab',desc:'Explore connections derived from currently recorded team lineups',coverage:'Episodes with lineups',lineups:'Team lineup records',memberCount:'Members in lineup records',seasonCompare:'Recorded lineups by season',seasonCompareHint:'Bars count recorded team lineups, not badges or competition performance',seasonLabel:'Season',recordedEp:'Documented episodes',lineupCount:'Lineups',chooseMember:'Member connections',memberLabel:'Choose member',episodes:'Episodes with lineup data',mateTitle:'Members on the same team',mateCount:'Distinct teammates',mateTimes:'Shared team entries',units:'times',noMember:'No team lineup is recorded for this member in the selected season. This does not mean they did not appear',noMate:'No verified lineup connection available yet',allData:'Coverage of all four seasons',seasonData:'Selected season',source:'Lineup source',sourceNote:'Fan-archive crosscheck · scene-by-scene official video verification in progress',caution:'These figures count documented lineup entries only. They are not badge scores, wins, MVPs or a measure of personal relationships. Unrecorded episodes are not treated as zero performance',goGravity:'Gravity ↗',goMember:'Members ↗'},
      ja:{eyebrow:'BADGE WAR · DATA LAB',title:'チーム編成データラボ',desc:'登録済みのチーム編成をもとに、シーズンとメンバーのつながりを見られます',coverage:'編成を確認した話数',lineups:'チーム編成記録',memberCount:'編成記録に登場したメンバー',seasonCompare:'シーズン別の編成記録',seasonCompareHint:'バーは登録されたチーム編成数です。バッジ数や成績ではありません',seasonLabel:'シーズン',recordedEp:'記録がある回',lineupCount:'編成数',chooseMember:'メンバー別のつながり',memberLabel:'メンバーを選択',episodes:'編成が記録された回',mateTitle:'同じチームのメンバー',mateCount:'異なるチームメイト',mateTimes:'同じチームの記録',units:'回',noMember:'選択したシーズンにこのメンバーの編成記録はありません。出演していないという意味ではありません',noMate:'登録済みのチーム関係はありません',allData:'4シーズン全体の記録範囲',seasonData:'選択したシーズン',source:'編成データ出典',sourceNote:'ファンアーカイブとの照合資料・公式映像で場面ごとに検証中',caution:'数値は登録済みのチーム編成回数です。バッジ・優勝・MVP・親密度ではありません。未記録の回をゼロ点とは扱いません',goGravity:'Gravityへ ↗',goMember:'メンバーへ ↗'}
    }[lang];
    const members=new Map(phase2.members.map(m=>[m.id,m]));
    const memberLabel=id=>{const m=members.get(id);return m?`${id} · ${m[lang]||m.ko||m.en}`:id;};
    const stats=phase2.seasons.map(s=>({
      number:s.number,
      episodes:s.episodes.filter(ep=>ep.teams.length>0).length,
      lineups:s.episodes.reduce((n,ep)=>n+ep.teams.length,0),
      members:new Set(s.episodes.flatMap(ep=>ep.teams.flatMap(t=>t.members))).size
    }));
    const totalEp=stats.reduce((n,s)=>n+s.episodes,0);
    const totalLineups=stats.reduce((n,s)=>n+s.lineups,0);
    const allMembers=new Set(phase2.seasons.flatMap(s=>s.episodes.flatMap(ep=>ep.teams.flatMap(g=>g.members))));
    const selectedSeason=phase2.seasons.find(s=>s.number===chosen);
    if(!selectedSeason)return;
    const seasonStats=stats.find(s=>s.number===chosen);
    const available=selectedSeason.episodes.flatMap(ep=>ep.teams.flatMap(team=>team.members));
    const memberId=labSelectedMember[chosen]||available[0]||'S01';
    labSelectedMember[chosen]=memberId;
    const mates=new Map(),entries=[];
    for(const ep of selectedSeason.episodes){
      for(const team of ep.teams){
        if(!team.members.includes(memberId))continue;
        entries.push(`EP.${ep.number} · ${team.label}`);
        for(const id of team.members){if(id!==memberId)mates.set(id,(mates.get(id)||0)+1);}
      }
    }
    const pairs=[...mates.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
    const peak=Math.max(1,...pairs.map(x=>x[1]));
    const maxLineups=Math.max(1,...stats.map(x=>x.lineups));
    const comparison=stats.map(st=>`<div class="wa-bw3__seasonrow${st.number===chosen?' wa-bw3__seasonrow--active':''}"><div class="wa-bw3__barhead"><strong>${escapeHTML(labText.seasonLabel)} ${st.number}</strong><span>${st.episodes}/4 ${escapeHTML(labText.recordedEp)} · ${st.lineups} ${escapeHTML(labText.lineupCount)}</span></div><div class="wa-bw3__track" aria-hidden="true"><span style="width:${Math.round(st.lineups/maxLineups*100)}%"></span></div></div>`).join('');
    const options=phase2.members.map(m=>`<option value="${m.id}" ${m.id===memberId?'selected':''}>${escapeHTML(memberLabel(m.id))}</option>`).join('');
    const connections=pairs.slice(0,8).map(([id,count])=>`<li class="wa-bw3__pair"><div class="wa-bw3__barhead"><span>${escapeHTML(memberLabel(id))}</span><strong>${count} ${escapeHTML(labText.units)}</strong></div><div class="wa-bw3__track" aria-hidden="true"><span style="width:${Math.round(count/peak*100)}%"></span></div></li>`).join('');
    const existing=panel.querySelector('#wa-bw3-lab');
    const markup=`<section class="wa-bw3" id="wa-bw3-lab" aria-label="${escapeHTML(labText.title)}"><span class="wa-bw1__eyebrow">${escapeHTML(labText.eyebrow)}</span><h4>${escapeHTML(labText.title)}</h4><p class="wa-bw3__intro">${escapeHTML(labText.desc)}</p>
      <div class="wa-bw3__metrics"><div><b>${totalEp}<small>/16</small></b><span>${escapeHTML(labText.coverage)}</span></div><div><b>${totalLineups}</b><span>${escapeHTML(labText.lineups)}</span></div><div><b>${allMembers.size}<small>/24</small></b><span>${escapeHTML(labText.memberCount)}</span></div></div>
      <div class="wa-bw3__grid"><div class="wa-bw3__box"><h5>${escapeHTML(labText.seasonCompare)}</h5><p>${escapeHTML(labText.seasonCompareHint)}</p>${comparison}</div>
        <div class="wa-bw3__box"><h5>${escapeHTML(labText.chooseMember)}</h5><label class="wa-bw3__picker">${escapeHTML(labText.memberLabel)}<select data-bw3-member aria-label="${escapeHTML(labText.memberLabel)}">${options}</select></label>
        <div class="wa-bw3__member-metrics"><span>${escapeHTML(labText.episodes)} <strong>${entries.length}</strong></span><span>${escapeHTML(labText.mateCount)} <strong>${pairs.length}</strong></span></div>
        ${entries.length?`<p class="wa-bw3__episodes">${escapeHTML(entries.join(' · '))}</p>`:`<p class="wa-bw3__empty">${escapeHTML(labText.noMember)}</p>`}
        ${connections?`<h6>${escapeHTML(labText.mateTitle)}</h6><ul class="wa-bw3__pairs">${connections}</ul>`:`<p class="wa-bw3__empty">${escapeHTML(labText.noMate)}</p>`}</div></div>
      <div class="wa-bw3__foot"><p>${escapeHTML(labText.caution)}</p><p><b>${escapeHTML(labText.source)}</b> · ${escapeHTML(labText.sourceNote)} · <a href="https://triplesfans.com/badge-war?lang=en" target="_blank" rel="noopener noreferrer">SOURCE ↗</a></p><div class="wa-bw3__links"><a href="#members">${escapeHTML(labText.goMember)}</a><a href="#gravity">${escapeHTML(labText.goGravity)}</a></div></div>
      </section>`;
    if(existing)existing.outerHTML=markup;
    else panel.querySelector('#wa-bw2-detail')?.insertAdjacentHTML('afterend',markup);
  }

  const validPhase2=d=>d&&d.schemaVersion===2&&Array.isArray(d.members)&&d.members.length===24&&Array.isArray(d.seasons)&&
    d.seasons.length===4&&d.seasons.every((s,i)=>s.number===i+1&&s.episodes?.length===4&&s.episodes.every((ep,j)=>ep.number===j+1&&
    Array.isArray(ep.teams)&&ep.teams.every(g=>Array.isArray(g.members)&&g.members.every(id=>/^S(0[1-9]|1[0-9]|2[0-4])$/.test(id)))));
  section.addEventListener('change',event=>{
    const target=event.target;
    if(target.matches('[data-bw2-ep]')){
      selectedTeamEpisode[chosen]=Number(target.value);selectedMember[chosen]='';renderPhase2();
    }else if(target.matches('[data-bw2-member]')){
      selectedMember[chosen]=target.value;renderPhase2();
    }else if(target.matches('[data-bw3-member]')){
      labSelectedMember[chosen]=target.value;renderPhase3();
      section.querySelector('[data-bw3-member]')?.focus({preventScroll:true});
    }
  });
  fetch('./data/wa-badgewar-phase2.json',{cache:'no-cache'})
    .then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()})
    .then(d=>{if(!validPhase2(d))throw new Error('Invalid supplemental records');phase2=d;renderPhase2()})
    .catch(err=>console.warn('[WAV ARCHIVE] Badge War detailed records unavailable; base archive remains:',err.message));
  const valid=d=>d&&Array.isArray(d.seasons)&&d.seasons.length===4&&d.seasons.every(s=>Number.isInteger(s.number)&&s.episodes?.length===4&&s.episodes.every(e=>yt(e.videoId)&&/^\d{4}-\d{2}-\d{2}$/.test(e.date)));
  section.addEventListener('click',event=>{
    const tab=event.target.closest('[data-bw-season]');
    if(tab&&section.contains(tab)&&dataset){const n=Number(tab.dataset.bwSeason);if(!dataset.seasons.some(s=>s.number===n))return;chosen=n;render();return;}
    const jump=event.target.closest('[data-bw-jump]');
    if(jump&&section.contains(jump)){
      const id=jump.dataset.bwJump;const target=section.querySelector(`#${CSS.escape(id)}`);
      if(target){target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
    }
  });
  let lastLang=locale();
  new MutationObserver(()=>{const l=locale();if(lastLang!==l){lastLang=l;render();}}).observe(document.documentElement,{attributes:true,attributeFilter:['lang','data-language']});
  fetch(dataURL,{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}).then(d=>{if(!valid(d))throw new Error('Invalid Badge War catalog');dataset=d;render();}).catch(err=>{
    /* No destructive fallback: preexisting S4 episode cards stay visible. */
    console.warn('[WAV ARCHIVE] Badge War hub fallback to legacy content:',err.message);
  });
})();
