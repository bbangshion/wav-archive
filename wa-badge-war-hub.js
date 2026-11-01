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
    const live=section.querySelector('#wa-bw1-live');if(live)live.textContent=`${t.season} ${chosen} · ${season.name}`;
  };
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
