/* WAV ARCHIVE · BADGE WAR HUB · additive / no mutations outside #badgewar4 .wrap */
(()=>{'use strict';
  const section=document.getElementById('badgewar4');
  if(!section||section.dataset.waBadgeHub==='1')return;
  const wrap=section.querySelector(':scope > .wrap');
  if(!wrap)return;
  const cssText={
    ko:{header:'06 · BADGE WAR ARCHIVE',main:'배지전쟁, 네 번의 기록',desc:'네 시즌의 공식 영상을 한곳에서 살펴보고, 미션과 기록을 시즌별로 탐색해 보세요',season:'시즌',members:'참여 인원',episodes:'공식 본편',period:'공개 기간',region:'촬영 배경',overview:'시즌 개요',rules:'핵심 규칙',browse:'회차별 기록',watch:'공식 영상 ↗',memberLink:'멤버 아카이브 ↗',gravityLink:'GRAVITY ↗',historyLink:'HISTORY ↗',spoiler:'스포일러가 포함될 수 있는 최종화 보기',spoilText:'이 링크는 결말이 포함된 공식 영상입니다. 아래 결과 아카이브에서도 스포일러를 직접 열어야 배지 수와 최종 결과가 표시됩니다',sources:'자료 출처',sourceText:'영상 및 날짜: 1theK Originals 공식 본편 · 시즌 배경: 팬 아카이브와 교차 확인. 미확인 결과·정확한 배지 수는 표시하지 않습니다',primary:'공식 영상',secondary:'시즌 배경 참고',status:'검증된 영상 링크 · 스포일러 최소화',entry:'회차로 이동',ep:'EP.',viewer:'출처 확인'},
    en:{header:'06 · BADGE WAR ARCHIVE',main:'Four seasons of Badge War',desc:'Explore four seasons, their verified official episodes and their defining missions',season:'Season',members:'On camera',episodes:'Official episodes',period:'Release period',region:'Setting',overview:'Season overview',rules:'Key rules',browse:'Episode archive',watch:'Official video ↗',memberLink:'Members ↗',gravityLink:'Gravity ↗',historyLink:'History ↗',spoiler:'Watch the finale (spoilers)',spoilText:'The official finale has spoilers. The sourced results section below remains closed until you choose to reveal it',sources:'Sources',sourceText:'Videos and dates: official 1theK Originals uploads. Season context: cross-checked against fan archive. Unverified results and badge counts are not displayed',primary:'Official videos',secondary:'Season context',status:'Verified links · spoiler-aware',entry:'Jump to episode',ep:'EP.',viewer:'Source'},
    ja:{header:'06 · BADGE WAR ARCHIVE',main:'バッジ戦争・4シーズンの記録',desc:'4シーズンの公式映像と各話のミッションをまとめて探せます',season:'シーズン',members:'出演人数',episodes:'公式本編',period:'公開期間',region:'舞台',overview:'シーズン概要',rules:'主なルール',browse:'エピソード一覧',watch:'公式映像 ↗',memberLink:'メンバー ↗',gravityLink:'Gravity ↗',historyLink:'HISTORY ↗',spoiler:'最終回を見る（ネタバレ）',spoilText:'公式最終回にはネタバレが含まれます。出典付きの結果は下の閉じたセクションから表示できます',sources:'出典',sourceText:'映像・日付：1theK Originalsの公式動画。背景情報：ファンアーカイブと照合。未確認の結果は掲載しません',primary:'公式映像',secondary:'シーズン参考',status:'確認済みリンク・ネタバレ配慮',entry:'話数へ移動',ep:'EP.',viewer:'出典'}
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
    renderPhase5(); // Phase 5: sourced spoiler-only badge ledger
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
      ko:{kicker:'BADGE WAR · FIELD NOTES',heading:'미션 기록',intro:'각 회차의 핵심 게임을 빠르게 찾아보고 팀 구성을 비교해 보세요',team:'팀 구성 탐색',chooseEpisode:'회차 선택',member:'멤버 선택',all:'전체 멤버',found:'팀 구성',noTeams:'이 회차의 팀 편성은 아직 검증 중입니다',noMatch:'이 멤버의 팀 기록이 선택한 회차에 없습니다',note:'팀 편성과 미션 내용은 팬 아카이브를 참고해 정리했으며 공식 영상과 추가 대조 중입니다',gravity:'GRAVITY 연결',official:'공식 출처',source:'자료 참고',toMembers:'멤버 목록 ↗',disclaimer:'최종 결과와 배지 개수는 별도 스포일러 영역에서 팬 편집 자료 출처와 함께 확인할 수 있습니다'},
      en:{kicker:'BADGE WAR · FIELD NOTES',heading:'Mission records',intro:'Review the episode mechanics and compare team line-ups',team:'Team explorer',chooseEpisode:'Choose episode',member:'Member filter',all:'All members',found:'teams',noTeams:'The teams for this episode are still being checked',noMatch:'No team record for this member in this episode',note:'Teams and mission details are adapted from a fan archive and are still being checked against official video',gravity:'Gravity connection',official:'Official source',source:'Fan archive reference',toMembers:'Members ↗',disclaimer:'Spoiler results are separately displayed with source-tier labels'},
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
    renderPhase4(); // Phase 4: optional sourced Gravity/member connections
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


  /* Phase 4 — verified-source Gravity timeline and member bridge.
     Only writes into #badgewar4 and uses existing WAVMember360.open safely. */
  let phase4=null;
  const phase4Member=Object.create(null);
  const p4UI={
    ko:{kicker:'BADGE WAR · CONNECTED ARCHIVE',title:'GRAVITY & MEMBER',intro:'관련 Gravity 기록과 멤버별 팀 편성을 하나의 경로로 살펴보세요',events:'시즌별 Gravity 기록',member:'멤버별 기록 연결',choose:'멤버 선택',open:'MEMBER 360° 열기 ↗',lineups:'등록된 팀 기록',noLineups:'이 시즌에는 해당 멤버의 팀 편성 기록이 없습니다. 실제 미참가를 뜻하지 않습니다',noGravity:'이 시즌에 출처를 확인한 Gravity 항목이 아직 없습니다',sourcePrimary:'공식 원문',sourceFan:'팬 아카이브 참고',source:'원문 보기 ↗',from:'기간',note:'공식 원문과 팬 기록을 구분했습니다. 우승자, 배지 획득 수, MVP 당선자 및 득표수는 이 화면에서 추정하지 않습니다',all:'전체 배지전쟁',season:'시즌'},
    en:{kicker:'BADGE WAR · CONNECTED ARCHIVE',title:'GRAVITY & MEMBER',intro:'Browse sourced Gravity records and documented member team lineups',events:'Season Gravity records',member:'Member connections',choose:'Choose member',open:'Open MEMBER 360° ↗',lineups:'Documented team lineups',noLineups:'No lineup entry for this member in this season. This does not imply absence',noGravity:'No sourced Gravity record is registered for this season yet',sourcePrimary:'Official primary source',sourceFan:'Fan-archive reference',source:'View source ↗',from:'Period',note:'Primary sources and fan references are separate. Winners, badge totals, MVP names and vote totals are never guessed',all:'All Badge War',season:'Season'},
    ja:{kicker:'BADGE WAR · CONNECTED ARCHIVE',title:'GRAVITY & MEMBER',intro:'Gravity記録とメンバーのチーム編成をつなげて探せます',events:'シーズン別Gravity',member:'メンバーの関連記録',choose:'メンバー選択',open:'MEMBER 360°を開く ↗',lineups:'登録済みチーム編成',noLineups:'このシーズンで該当メンバーの編成記録はありません。不参加という意味ではありません',noGravity:'このシーズンのGravity出典はまだ登録されていません',sourcePrimary:'公式一次資料',sourceFan:'ファン資料参照',source:'出典を見る ↗',from:'期間',note:'一次資料とファン資料は区別しています。優勝・バッジ数・MVP受賞者・投票数を推測しません',all:'バッジ戦争全体',season:'シーズン'}
  };
  function renderPhase4(){
    if(!phase4||!dataset||!phase2)return;
    const panel=section.querySelector('.wa-bw1__panel');
    if(!panel)return;
    const lang=locale(),ui=p4UI[lang];
    const related=phase4.events.filter(e=>e.season===chosen);
    const season=phase2.seasons.find(s=>s.number===chosen);
    if(!season)return;
    const memberId=phase4Member[chosen]||labSelectedMember[chosen]||'S01';
    phase4Member[chosen]=memberId;
    const member=phase2.members.find(m=>m.id===memberId);
    const memberName=id=>{const m=phase2.members.find(x=>x.id===id);return m?`${m.id} · ${m[lang]||m.ko||m.en}`:id};
    const rows=season.episodes.flatMap(ep=>ep.teams.filter(t=>t.members.includes(memberId)).map(t=>({ep:ep.number,label:t.label,ids:t.members})));
    const history=related.map(e=>`<li class="wa-bw4__event"><div class="wa-bw4__date">${escapeHTML(e.start)}${e.end?` — ${escapeHTML(e.end)}`:''}</div><div><span class="wa-bw4__tier ${e.sourceTier==='official_primary'?'wa-bw4__tier--primary':''}">${escapeHTML(e.sourceTier==='official_primary'?ui.sourcePrimary:ui.sourceFan)}</span><strong>${escapeHTML(loc(e.label,lang))}</strong><p>${escapeHTML(loc(e.detail,lang))}</p><a href="${escapeHTML(e.source)}" target="_blank" rel="noopener noreferrer">${escapeHTML(ui.source)}</a></div></li>`).join('');
    const options=phase2.members.map(m=>`<option value="${m.id}"${m.id===memberId?' selected':''}>${escapeHTML(memberName(m.id))}</option>`).join('');
    const documented=rows.map(r=>`<li>EP.${r.ep} · ${escapeHTML(r.label)} · ${escapeHTML(r.ids.map(memberName).join(' / '))}</li>`).join('');
    const markup=`<section id="wa-bw4-connected" class="wa-bw4" aria-label="${escapeHTML(ui.title)}"><span class="wa-bw1__eyebrow">${escapeHTML(ui.kicker)}</span><h4>${escapeHTML(ui.title)}</h4><p class="wa-bw4__lead">${escapeHTML(ui.intro)}</p>
      <div class="wa-bw4__columns"><div class="wa-bw4__box"><h5>${escapeHTML(ui.events)} · S${chosen}</h5>${history?`<ol class="wa-bw4__events">${history}</ol>`:`<p class="wa-bw4__empty">${escapeHTML(ui.noGravity)}</p>`}</div>
      <div class="wa-bw4__box"><h5>${escapeHTML(ui.member)}</h5><label class="wa-bw4__select">${escapeHTML(ui.choose)}<select data-bw4-member>${options}</select></label><strong class="wa-bw4__membername">${escapeHTML(memberName(member?.id||memberId))}</strong><p class="wa-bw4__counter">${escapeHTML(ui.lineups)} · <b>${rows.length}</b></p>${rows.length?`<ul class="wa-bw4__lineups">${documented}</ul>`:`<p class="wa-bw4__empty">${escapeHTML(ui.noLineups)}</p>`}<button type="button" data-bw4-open-member="${memberId}" class="wa-bw4__open">${escapeHTML(ui.open)}</button></div></div>
      <p class="wa-bw4__note">${escapeHTML(ui.note)} · ${escapeHTML(loc(phase4.disclaimer,lang))}</p></section>`;
    const old=panel.querySelector('#wa-bw4-connected');
    if(old)old.outerHTML=markup;
    else panel.querySelector('#wa-bw3-lab')?.insertAdjacentHTML('afterend',markup);
  }
  function openMember(id){
    if(!/^S(?:0[1-9]|1\d|2[0-4])$/.test(id))return;
    if(window.WAVMember360?.open?.(id))return;
    // Non-destructive fallback; never simulates card flip or touches card data.
    const card=document.querySelector(`#memberGrid .member-card[data-member="${id}"]`);
    const target=card||document.getElementById('members');
    if(target)target.scrollIntoView({behavior:'auto',block:'start'});
  }
  section.addEventListener('change',ev=>{
    if(ev.target.matches('[data-bw4-member]')){
      const id=String(ev.target.value||'');
      if(!/^S(?:0[1-9]|1\d|2[0-4])$/.test(id))return;
      phase4Member[chosen]=id;renderPhase4();section.querySelector('[data-bw4-member]')?.focus({preventScroll:true});
    }
  });
  section.addEventListener('click',ev=>{
    const btn=ev.target.closest('[data-bw4-open-member]');
    if(btn&&section.contains(btn))openMember(btn.dataset.bw4OpenMember);
  });
  // Browsing from the existing MEMBER 360° details back to Badge War.
  window.WAVBadgeWar4=Object.freeze({openForMember(id){
    if(!/^S(?:0[1-9]|1\d|2[0-4])$/.test(id))return false;
    if(dataset&&phase2){
      const possible=[4,3,2,1].find(num=>phase2.seasons.find(s=>s.number===num)?.episodes.some(ep=>ep.teams.some(t=>t.members.includes(id))));
      if(possible)chosen=possible;
      phase4Member[chosen]=id;
      render();
    }
    section.scrollIntoView({behavior:'auto',block:'start'});
    return true;
  }});
  /* Phase 5: source-tiered RESULTS/scoreboard, opt-in spoilers only.
     Uses existing seasons and episode archive. No changes to cards, MEMBER 360°, global CSS. */
  let phase5=null;
  const phase5Member={1:'',2:'',3:'',4:''};
  const phase5Open={1:false,2:false,3:false,4:false};
  const phase5Sort={1:'count',2:'count',3:'count',4:'count'};
  const p5UI={
    ko:{eyebrow:'BADGE WAR · RESULTS ARCHIVE',title:'결과 및 배지 기록',lead:'시즌별 우승 결과와 멤버별 배지 개수를 출처와 함께 확인하세요',open:'스포일러 포함 · 결과와 배지 수 보기',intro:'아래부터 우승 결과와 최종 순위가 공개됩니다',winner:'최종 결과',badge:'배지 수',member:'멤버',ranking:'배지 기록',filter:'멤버 선택',all:'전체 멤버',sort:'정렬',count:'배지 많은 순',number:'S번호 순',base:'게임 배지 (기본 포함)',benefit:'베네핏',total:'게임+베네핏',notWin:'배지 순위와 최종 우승은 다를 수 있습니다',source:'출처 원문 ↗',tier:'팬 편집 자료 기준',note:'자료 검증 범위',winnerTag:'우승',empty:'해당 멤버의 기록이 없습니다',coverage:'기록 인원',gameTotal:'게임 배지 합계',benefitTotal:'베네핏 합계',notParticipated:'S08 공유빈은 시즌4 촬영에 참여하지 않았습니다',back:'결과 숨기기'},
    en:{eyebrow:'BADGE WAR · RESULTS ARCHIVE',title:'Results & badge records',lead:'Season outcomes and individual badge totals with clear provenance',open:'Show results and badge counts · spoilers',intro:'Season winners, spoilers and full standings follow',winner:'Final outcome',badge:'Badges',member:'Member',ranking:'Badge ledger',filter:'Filter member',all:'All members',sort:'Sort by',count:'Badge count',number:'S-number',base:'Game incl. starter',benefit:'Benefit',total:'Game + benefit',notWin:'Badge rankings do not necessarily determine the winner',source:'View source ↗',tier:'Community-edited reference',note:'Data caveat',winnerTag:'Winner',empty:'No record for this member',coverage:'Recorded members',gameTotal:'Game badge sum',benefitTotal:'Benefit badge sum',notParticipated:'S08 YuBin did not take part in season 4 filming',back:'Hide results'},
    ja:{eyebrow:'BADGE WAR · RESULTS ARCHIVE',title:'結果・バッジ記録',lead:'シーズンごとの優勝結果とメンバー別バッジ数を出典とともに確認できます',open:'結果とバッジ数を表示 · ネタバレ',intro:'ここから優勝者と順位が表示されます',winner:'最終結果',badge:'バッジ数',member:'メンバー',ranking:'バッジ記録',filter:'メンバー絞り込み',all:'全メンバー',sort:'並び順',count:'枚数順',number:'S番号順',base:'ゲーム（初期分含む）',benefit:'ベネフィット',total:'ゲーム＋ベネフィット',notWin:'バッジ順と最終勝敗は必ずしも一致しません',source:'出典を見る ↗',tier:'ファン編集資料',note:'検証範囲',winnerTag:'優勝',empty:'該当メンバーの記録はありません',coverage:'記録人数',gameTotal:'ゲームバッジ合計',benefitTotal:'ベネフィット合計',notParticipated:'S08ユビンはシーズン4撮影に参加していません',back:'結果を閉じる'}
  };
  function renderPhase5(){
    if(!phase5||!dataset)return;
    const panel=section.querySelector('.wa-bw1__panel'); if(!panel)return;
    const s=phase5.seasons.find(x=>x.number===chosen);if(!s)return;
    const lang=locale(),t=p5UI[lang],full=s.players;
    const byID=new Map(full.map(p=>[p.id,p]));
    const memberId=phase5Member[chosen]||'';
    const sorted=[...full].sort(phase5Sort[chosen]==='number'?((a,b)=>a.id.localeCompare(b.id)):((a,b)=>b.badges-a.badges||a.id.localeCompare(b.id)));
    const display=memberId?sorted.filter(x=>x.id===memberId):sorted;
    const options=`<option value="">${escapeHTML(t.all)}</option>`+full.map(p=>`<option value="${p.id}"${p.id===memberId?' selected':''}>${escapeHTML(p.id+' · '+p.name)}</option>`).join('');
    const cols=chosen===4?`<th scope="col">${escapeHTML(t.base)}</th><th scope="col">${escapeHTML(t.benefit)}</th><th scope="col">${escapeHTML(t.total)}</th>`:`<th scope="col">${escapeHTML(t.badge)}</th>`;
    let prior=null,rank=0;
    const ranking=new Map([...full].sort((a,b)=>b.badges-a.badges||a.id.localeCompare(b.id)).map((p,i,arr)=>{if(p.badges!==prior){rank=i+1;prior=p.badges;}return [p.id,rank]}));
    const rows=display.map(p=>`<tr class="${p.winner?'wa-bw5__winner':''}"><td class="wa-bw5__rank">${ranking.get(p.id)}</td><th scope="row">${escapeHTML(p.id)} · ${escapeHTML(p.name)}${p.winner?` <span class="wa-bw5__gold">${escapeHTML(t.winnerTag)}</span>`:''}</th><td class="wa-bw5__count">${p.badges}</td>${chosen===4?`<td class="wa-bw5__count">${p.benefitBadges}</td><td class="wa-bw5__count">${p.badges+p.benefitBadges}</td>`:''}</tr>`).join('');
    const markup=`<section id="wa-bw5-results" class="wa-bw5" aria-label="${escapeHTML(t.title)}"><span class="wa-bw1__eyebrow">${escapeHTML(t.eyebrow)}</span><h4>${escapeHTML(t.title)}</h4><p class="wa-bw5__lead">${escapeHTML(t.lead)}</p>
      <details class="wa-bw5__details" ${phase5Open[chosen]?'open':''}><summary><span>${escapeHTML(t.open)}</span><span class="wa-bw5__chevron" aria-hidden="true">⌄</span></summary>
      <div class="wa-bw5__body"><p class="wa-bw5__warning">${escapeHTML(t.intro)}</p>
      <div class="wa-bw5__verdict"><small>SEASON ${chosen} · ${escapeHTML(t.winner)}</small><strong>${escapeHTML(loc(s.result,lang))}</strong><p>${escapeHTML(t.notWin)}</p></div>
      <div class="wa-bw5__metrics"><div><b>${full.length}</b><span>${escapeHTML(t.coverage)}</span></div><div><b>${s.totalGameBadges}</b><span>${escapeHTML(t.gameTotal)}</span></div>${chosen===4?`<div><b>${s.totalBenefitBadges}</b><span>${escapeHTML(t.benefitTotal)}</span></div>`:''}</div>
      <div class="wa-bw5__toolbar"><label>${escapeHTML(t.filter)}<select data-bw5-member>${options}</select></label><label>${escapeHTML(t.sort)}<select data-bw5-sort><option value="count"${phase5Sort[chosen]==='count'?' selected':''}>${escapeHTML(t.count)}</option><option value="number"${phase5Sort[chosen]==='number'?' selected':''}>${escapeHTML(t.number)}</option></select></label></div>
      <div class="wa-bw5__tablewrap"><table><caption>${escapeHTML(t.ranking)} · S${chosen}</caption><thead><tr><th scope="col">#</th><th scope="col">${escapeHTML(t.member)}</th>${cols}</tr></thead><tbody>${rows||`<tr><td colspan="${chosen===4?5:3}">${escapeHTML(t.empty)}</td></tr>`}</tbody></table></div>
      <p class="wa-bw5__method">${escapeHTML(loc(s.method,lang))}</p>
      <div class="wa-bw5__source"><b>${escapeHTML(t.note)} · ${escapeHTML(t.tier)}</b><p>${escapeHTML(loc(phase5.sourcePolicy,lang))}</p><a href="${escapeHTML(s.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHTML(t.source)}</a></div>
      </div></details></section>`;
    const old=panel.querySelector('#wa-bw5-results');
    if(old)old.outerHTML=markup;
    else panel.querySelector('.wa-bw1__cross')?.insertAdjacentHTML('beforebegin',markup);
  }
  const validP5=d=>d&&d.schemaVersion===5&&d.seasons?.length===4&&d.seasons.every((s,i)=>s.number===i+1&&
      s.players?.length===[16,24,24,23][i]&&s.players.every(p=>/^S(?:0[1-9]|1\d|2[0-4])$/.test(p.id)&&Number.isInteger(p.badges)&&p.badges>=0&&typeof p.winner==='boolean'&&(i!==3||Number.isInteger(p.benefitBadges)))&&
      Array.isArray(s.winnerIds)&&s.winnerIds.length>0&&s.winnerIds.every(id=>s.players.some(p=>p.id===id&&p.winner))&&
      /^https:\/\//.test(s.sourceUrl)&&['ko','en','ja'].every(k=>s.result?.[k]&&s.method?.[k])&&
      s.totalGameBadges===s.players.reduce((n,p)=>n+p.badges,0));
  section.addEventListener('toggle',ev=>{if(ev.target?.matches?.('.wa-bw5__details'))phase5Open[chosen]=ev.target.open;},true);
  section.addEventListener('change',ev=>{
    if(ev.target.matches('[data-bw5-member]')){phase5Member[chosen]=String(ev.target.value||'');phase5Open[chosen]=true;renderPhase5();}
    if(ev.target.matches('[data-bw5-sort]')){phase5Sort[chosen]=ev.target.value==='number'?'number':'count';phase5Open[chosen]=true;renderPhase5();}
  });
  fetch('./data/wa-badgewar-phase5.json',{cache:'no-cache'})
    .then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();})
    .then(d=>{if(!validP5(d))throw Error('Invalid sourced results ledger');phase5=d;renderPhase5();})
    .catch(err=>console.warn('[WAV ARCHIVE] Badge War sourced results unavailable; original archive preserved:',err.message));

  const validP4=d=>d&&d.schemaVersion===4&&Array.isArray(d.events)&&d.events.every(e=>[1,2,3,4].includes(e.season)&&['official_primary','fan_crosscheck'].includes(e.sourceTier)&&/^https:\/\//.test(e.source)&&/^\d{4}-\d{2}-\d{2}$/.test(e.start)&&['ko','en','ja'].every(k=>e.label?.[k]&&e.detail?.[k]));
  fetch('./data/wa-badgewar-phase4.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();})
    .then(d=>{if(!validP4(d))throw Error('Invalid Gravity source record');phase4=d;renderPhase4();})
    .catch(err=>console.warn('[WAV ARCHIVE] Gravity sourced records unavailable; base Badge War remains:',err.message));

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
