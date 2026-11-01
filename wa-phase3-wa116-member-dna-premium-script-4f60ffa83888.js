
/* WAV ARCHIVE 11.5 / PHASE 2 — MEMBER & DNA PREMIUM
   Only reads existing data-member / data-name / data-units sources.
   Does not replace existing flip, tilt, render, DNA filter, theme or locale handlers. */
(function(){
  'use strict';
  if(window.WAVArchive116)return;
  const DOC=document;
  const grid=DOC.getElementById('memberGrid');
  const root=DOC.getElementById('waDna65');
  const stage=DOC.getElementById('waDna72Stage');
  const panel=root?.querySelector('[data-d65panel="constellation"]');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const idleTimers=new WeakMap();
  const activeAnimations=new Set();
  const aliases={'vv':'visionary vision','ↀ':'∞!','⟡':'+(kr)ystal eyes','msnz':'msnz'};
  let inspectedId='';
  let renderFrame=0;
  let inspector=null;
  let legend=null;
  const lang=()=>{
    const value=(DOC.documentElement.lang||'ko').toLowerCase();
    if(value.startsWith('ja'))return 'ja';
    if(value.startsWith('en'))return 'en';
    return 'ko';
  };
  const dictionary={
    ko:{legend:'공동 디멘션',level1:'1개 · 약한 연결',level2:'2개 · 연결',level3:'3개 이상 · 강한 연결',
        eyebrow:'DNA · RELATIONSHIP INDEX',links:'공동 활동 기준',connection:'함께한 디멘션',
        filter:'선택 필터',all:'전체',peers:'주요 연결 멤버',unit:'개',empty:'이 조건에 해당하는 연결 기록이 없습니다.',
        disclaimer:'공식 활동 이력에 기반한 연결 지표이며 실제 친밀도를 의미하지 않습니다.'},
    en:{legend:'Shared dimensions',level1:'1 · light',level2:'2 · linked',level3:'3+ · strong',
        eyebrow:'DNA · RELATIONSHIP INDEX',links:'Shared official activities',connection:'Shared dimensions',
        filter:'Active filter',all:'All',peers:'Top connections',unit:'',empty:'No connections found for this filter.',
        disclaimer:'These links reflect documented shared activities, not personal closeness.'},
    ja:{legend:'共通ユニット',level1:'1 · 弱い',level2:'2 · つながり',level3:'3以上 · 強い',
        eyebrow:'DNA · RELATIONSHIP INDEX',links:'共通活動の記録',connection:'共通ユニット',
        filter:'選択中のフィルター',all:'すべて',peers:'主なつながり',unit:'件',empty:'該当する共通活動はありません。',
        disclaimer:'公開された活動記録に基づく指標であり、私的な親密さを示しません。'}
  };
  const local=()=>dictionary[lang()];
  const normal=value=>String(value||'').trim().toLocaleLowerCase();
  const dimension=value=>aliases[normal(value)]||normal(value);
  function members(){
    const result=new Map();
    grid?.querySelectorAll('.member-card[data-member]').forEach(card=>{
      const id=card.dataset.member;
      const parts=(card.dataset.name||id||'').trim().split(/\s+/);
      const display=lang()==='en'&&parts[1]?parts[1]:parts[0];
      const units=new Set((card.dataset.units||'').split('|').map(normal).filter(Boolean));
      result.set(id,{id,name:display,units});
    });
    return result;
  }
  function shared(a,b){
    const result=[];
    if(!a||!b)return result;
    a.units.forEach(unit=>{if(b.units.has(unit))result.push(unit);});
    return result;
  }
  /* Reuse existing --wa11-aurora and --wa-glare-x/y variables. No new motion loop. */
  function setUpMembers(){
    if(!grid)return;
    grid.querySelectorAll('.member-card .member-front').forEach(front=>{
      if(front.querySelector(':scope > .wa116-ambient'))return;
      const ambient=DOC.createElement('div');
      ambient.className='wa116-ambient';
      ambient.setAttribute('aria-hidden','true');
      front.appendChild(ambient);
    });
  }
  function clearAwake(card){
    if(!card)return;
    const timer=idleTimers.get(card);
    if(timer)clearTimeout(timer);
    idleTimers.delete(card);
    card.classList.remove('wa116-awake');
    activeAnimations.delete(card);
  }
  function wakeCard(card){
    if(!card||reduced.matches||DOC.hidden)return;
    clearAwake(card);
    card.classList.add('wa116-awake');
    activeAnimations.add(card);
    idleTimers.set(card,setTimeout(()=>clearAwake(card),650));
  }
  if(grid){
    setUpMembers();
    // Capture does not cancel or replace the original click-to-flip.
    grid.addEventListener('pointerup',event=>{
      const card=event.target.closest('.member-card');
      if(card&&grid.contains(card))wakeCard(card);
    },{passive:true});
  }
  function createLegend(){
    if(!panel)return;
    if(!legend){
      legend=DOC.createElement('div');
      legend.className='wa116-dna-legend';
      legend.setAttribute('aria-label','Shared Dimension legend');
      const filterbar=panel.querySelector('.wa-dna11-filterbar');
      const summary=panel.querySelector('.wa-dna11-summary');
      const controls=panel.querySelector('.wa-dna72-controls');
      (summary||filterbar||controls)?.insertAdjacentElement('afterend',legend);
    }
    const copy=local();
    legend.replaceChildren();
    const label=DOC.createElement('span');
    label.className='wa116-dna-legend-label';
    label.textContent=copy.legend;
    legend.appendChild(label);
    [1,2,3].forEach(n=>{
      const item=DOC.createElement('span');
      item.className='wa116-dna-level';
      const dot=DOC.createElement('i');
      dot.className='wa116-dna-dot';
      dot.dataset.level=String(n);
      dot.setAttribute('aria-hidden','true');
      item.append(dot,DOC.createTextNode(copy['level'+n]));
      legend.appendChild(item);
    });
  }
  function createInspector(){
    if(!panel)return;
    if(!inspector){
      inspector=DOC.createElement('section');
      inspector.id='wa116DnaInspector';
      inspector.className='wa116-dna-inspector';
      inspector.setAttribute('aria-label','DNA relationship index');
      inspector.hidden=true;
      const stageElement=DOC.getElementById('waDna72Stage');
      if(stageElement)stageElement.before(inspector);
      else panel.appendChild(inspector);
      inspector.addEventListener('click',event=>{
        const button=event.target.closest('button[data-wa116-peer]');
        if(!button)return;
        const id=button.dataset.wa116Peer;
        const node=stage?.querySelectorAll('[data-d72]');
        const target=Array.from(node||[]).find(item=>item.dataset.d72===id);
        target?.click();
      });
    }
  }
  function activeFilter(){
    const pressed=panel?.querySelector('.wa-dna11-filterbar [data-dna11-dimension][aria-pressed="true"]');
    const value=pressed?.dataset.dna11Dimension||'ALL';
    return {value,normalized:dimension(value),all:normal(value)==='all'};
  }
  function refreshInspector(){
    if(!inspector)return;
    const selected=stage?.querySelector('.wa-dna72-node.active[data-d72]');
    if(selected)inspectedId=selected.dataset.d72;
    else inspectedId='';
    if(!inspectedId){inspector.hidden=true;inspector.replaceChildren();return;}
    const collection=members();
    const chosen=collection.get(inspectedId);
    if(!chosen){inspector.hidden=true;inspector.replaceChildren();return;}
    const filter=activeFilter();
    const all=filter.all;
    const peers=[];
    collection.forEach(other=>{
      if(other.id===chosen.id)return;
      const common=shared(chosen,other);
      if(!common.length)return;
      if(!all&&!common.includes(filter.normalized))return;
      peers.push({id:other.id,name:other.name,common});
    });
    peers.sort((a,b)=>b.common.length-a.common.length||a.id.localeCompare(b.id));
    const copy=local();
    const top=peers.slice(0,3);
    const totalUnits=new Set(peers.flatMap(entry=>entry.common)).size;
    const kicker=DOC.createElement('div');
    kicker.className='wa116-dna-eyebrow';
    kicker.textContent=copy.eyebrow;
    const title=DOC.createElement('h3');
    title.className='wa116-dna-title';
    const name=DOC.createElement('span');
    name.textContent=chosen.id+' · '+chosen.name;
    const subtitle=DOC.createElement('small');
    subtitle.textContent=copy.links+' · '+peers.length;
    title.append(name,subtitle);
    const note=DOC.createElement('p');
    note.className='wa116-dna-description';
    note.textContent=copy.connection+': '+totalUnits+' · '+copy.filter+': '+(all?copy.all:filter.value)+' · '+copy.disclaimer;
    const chips=DOC.createElement('div');
    chips.className='wa116-dna-peers';
    if(top.length){
      top.forEach(peer=>{
        const button=DOC.createElement('button');
        button.type='button';
        button.className='wa116-dna-peer';
        button.dataset.wa116Peer=peer.id;
        const label=DOC.createElement('span');
        label.textContent=peer.id+' '+peer.name;
        const score=DOC.createElement('strong');
        score.textContent=String(peer.common.length)+(copy.unit||'');
        button.title=peer.common.join(' · ');
        button.setAttribute('aria-label',peer.id+' '+peer.name+' · '+copy.connection+' '+peer.common.length);
        button.append(label,score);
        chips.appendChild(button);
      });
    }else{
      const empty=DOC.createElement('span');
      empty.textContent=copy.empty;
      chips.appendChild(empty);
    }
    inspector.replaceChildren(kicker,title,note,chips);
    inspector.hidden=false;
  }
  function scheduleRefresh(){
    if(renderFrame)return;
    renderFrame=requestAnimationFrame(()=>{
      renderFrame=0;
      // No geometry reads or changes to existing SVG nodes/lines.
      refreshInspector();
    });
  }
  function initializeDNA(){
    if(!panel||!stage)return;
    createLegend();
    createInspector();
    root.addEventListener('click',event=>{
      if(event.target.closest('[data-d72],#waDna72Reset,[data-dna11-dimension],[data-d65tab]')){
        scheduleRefresh();
        // Original constellation draw() may schedule asynchronous reconstruction.
        if(event.target.closest('[data-d65tab="constellation"]'))setTimeout(scheduleRefresh,60);
      }
    },{passive:true});
    // Existing renderer can recreate nodes. Observe child additions only, never animated styles.
    const observer=new MutationObserver(scheduleRefresh);
    observer.observe(stage,{childList:true});
    scheduleRefresh();
  }
  if(DOC.documentElement){
    // Locale plugin updates <html lang="..."> without reloading.
    const localeObserver=new MutationObserver(()=>{
      if(legend)createLegend();
      scheduleRefresh();
    });
    localeObserver.observe(DOC.documentElement,{attributes:true,attributeFilter:['lang']});
  }
  DOC.addEventListener('visibilitychange',()=>{
    if(DOC.hidden)Array.from(activeAnimations).forEach(clearAwake);
  });
  initializeDNA();
  window.WAVArchive116={
    version:'11.5-phase2',
    get status(){return {memberOverlays:grid?.querySelectorAll('.wa116-ambient').length||0,
      dnaInspector:!!inspector,selectedMember:inspectedId};},
    refresh:scheduleRefresh
  };
})();

