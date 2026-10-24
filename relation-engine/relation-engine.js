/* WAV ARCHIVE 11.5 — PHASE 15 / DYNAMIC RELATION ENGINE
 * Browser-only / additive-only. Do not mutate #memberGrid or existing DNA listeners.
 * Evidence is deliberately sparse: absent HAUS/SIGNAL data is UNKNOWN, not zero.
 * See README_KR.md for provenance and schema.
 */
(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const MS_DAY = 86400000;
  const NUM = n => Number.isFinite(n) ? n : 0;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const normId = value => {
    const m = String(value == null ? '' : value).trim().toUpperCase().match(/^S?0?([1-9]|1\d|2[0-4])$/);
    if (!m) throw new Error('S01~S24 중에서 멤버를 선택해 주세요.');
    return `S${m[1].padStart(2,'0')}`;
  };
  const cleanUnit = str => String(str || '').toLowerCase().replace(/[\s\-_()]/g, '');
  const utc = str => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(str || ''))) return NaN;
    const d = new Date(`${str}T00:00:00Z`);
    return Number.isNaN(+d) || d.toISOString().slice(0,10) !== str ? NaN : +d;
  };
  const esc = str => String(str == null ? '' : str).replace(/[&<>"']/g,c=>({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

  // HAUS 1: dated residence ranges documented by tripleS Wiki.
  // This is a historical subset, NOT a complete HAUS tenancy ledger.
  const VERIFIED_HAUS = [
    ['S01','HAUS 1','Purple Room','2022-05-09','2022-11-30'],
    ['S02','HAUS 1','Purple Room','2022-05-23','2022-08-12'],
    ['S03','HAUS 1','Mint Room','2022-06-07','2022-11-30'],
    ['S04','HAUS 1','Mint Room','2022-06-29','2022-08-12'],
    ['S05','HAUS 1','Purple Room','2022-07-18','2022-11-30'],
    ['S08','HAUS 1','Mint Room','2022-09-12','2022-11-30']
  ].map(([memberId,haus,room,from,to])=>({
    memberId, haus, room, from, to,
    source: 'https://triples.fandom.com/wiki/HAUS_1'
  }));

  // Exact dates verified from Aria profile; other birth YEARS are read from the
  // existing member cards. No fabricated day/month for the remaining members.
  const VERIFIED_BIRTHDATES = {
    S03:'2005-10-24', S04:'2004-12-04', S09:'2005-12-20',
    S10:'2003-01-08', S13:'2003-06-02'
  };

  const ARIA=['S03','S04','S09','S10','S13'];
  const NXT=['S17','S18','S19','S20'];
  const LOVE=['S01','S02','S08','S09','S10','S13','S14','S15'];
  const EVOL=['S03','S04','S05','S06','S07','S11','S12','S16'];
  // Verified songs are a PARTIAL catalogue, used only where unit members
  // and album credits are known. Never equate a unit name with a song count.
  const VERIFIED_TRACKS = [
    ...['Door','첫 이별 (Farewell My First)'].map(title=>({
      id:`aria-${title}`,title,unit:'Aria',members:ARIA,
      source:'https://music.bugs.co.kr/album/4095214'
    })),
    {id:'nxt-just-do-it',title:'Just Do It',unit:'NXT',members:NXT,
      source:'https://triplesfans.com/dimensions'},
    ...['ↀ','Girls\' Capitalism','복합성 (Complexity)','Black Soul Dress','Seoul Sonyo Sound','Cry Baby','Speed Love','Number 8'].map(title=>({
      id:`love-${title}`,title,unit:'LOVElution',members:LOVE,
      source:'https://triplesfans.com/dimensions'
    })),
    ...['⟡','Invincible','Rhodanthe','Heavy Metal Wings','미열 37.5','Moto Princess','Oui','Enhanced Flower'].map(title=>({
      id:`evol-${title}`,title,unit:'EVOLution',members:EVOL,
      source:'https://triplesfans.com/dimensions'
    }))
  ];

  class WavRelationEngine {
    constructor({ members=[], hausStays=VERIFIED_HAUS, tracks=VERIFIED_TRACKS, signalEvents=[] }={}) {
      this.members = new Map();
      this.haus = new Map();
      this.tracks = new Map();
      this.signals = new Map();
      this.revision = 0;
      this.pairCache = new Map();
      this.setMembers(members);
      this.addHausStays(hausStays);
      this.addTracks(tracks);
      this.addSignalEvents(signalEvents);
    }

    setMembers(rows) {
      this.members.clear();
      for (const item of rows) {
        try {
          const id = normId(item.id || item.memberId || item.sNumber);
          const explicitBirthday = item.birthDate || VERIFIED_BIRTHDATES[id] || null;
          const birthYear = explicitBirthday && Number.isFinite(utc(explicitBirthday))
            ? Number(explicitBirthday.slice(0,4))
            : Number(item.birthYear) || null;
          this.members.set(id, {
            id, name: String(item.name || id).trim(),
            birthDate: explicitBirthday && Number.isFinite(utc(explicitBirthday)) ? explicitBirthday : null,
            birthYear, units: [...new Set((item.units || []).map(String).map(x=>x.trim()).filter(Boolean))]
          });
        } catch (_) { /* Ignore non-member rows, do not mutate source data */ }
      }
      this.invalidate();
      return this;
    }

    // Backwards-compatible adapter: read existing 24 cards, NO data rewrite.
    static fromExistingDOM(root=document) {
      const cards=[...root.querySelectorAll('#memberGrid .member-card[data-member]')];
      const rows=cards.map(card=>{
        const text=card.textContent || '';
        const birthYear = /\b(?:19|20)\d{2}\b/.exec(text)?.[0] || null;
        return {
          id:card.dataset.member,
          name:(card.dataset.name || card.dataset.member).split(/\s+/)[0],
          birthYear:birthYear?Number(birthYear):null,
          units:(card.dataset.units || '').split('|').map(x=>x.trim()).filter(Boolean)
        };
      });
      return new WavRelationEngine({members:rows});
    }

    invalidate() { this.revision++; this.pairCache.clear(); }

    addHausStays(rows) {
      for (const x of rows) {
        try {
          const memberId=normId(x.memberId || x.id);
          const start=utc(x.from), end=utc(x.to);
          if (!Number.isFinite(start) || !Number.isFinite(end) || end<start || !x.haus) continue;
          if (!this.haus.has(memberId)) this.haus.set(memberId,[]);
          this.haus.get(memberId).push({
            haus:String(x.haus),room:String(x.room||''),from:x.from,to:x.to,
            start,end,source:String(x.source||'')
          });
        } catch (_) { /* skip invalid historical item */ }
      }
      this.invalidate();return this;
    }

    addTracks(rows) {
      for (const track of rows) {
        if (!track || !track.id || !track.title || !Array.isArray(track.members)) continue;
        const ids=[];
        for (const value of track.members) { try { ids.push(normId(value)); } catch (_) {} }
        if (ids.length < 2) continue;
        this.tracks.set(String(track.id),{
          id:String(track.id), title:String(track.title),unit:String(track.unit||''),
          members:new Set(ids),source:String(track.source||'')
        });
      }
      this.invalidate();return this;
    }

    // Feed *verified* official SIGNAL items:
    // {id,title,members:['S03','S09'],url:'https://youtu.be/...',weight:1}
    // Unknown/unindexed episodes must never be treated as no chemistry.
    addSignalEvents(rows) {
      for (const episode of rows) {
        if (!episode || !episode.id || !Array.isArray(episode.members) || !episode.url) continue;
        const ids=[];
        for (const x of episode.members) { try { ids.push(normId(x)); } catch (_) {} }
        if (ids.length < 2) continue;
        this.signals.set(String(episode.id),{
          id:String(episode.id),title:String(episode.title||'SIGNAL'),
          members:new Set(ids),url:String(episode.url),
          weight:clamp(Number(episode.weight)||1,0.1,3)
        });
      }
      this.invalidate();return this;
    }

    hausOverlap(a,b) {
      const staysA=this.haus.get(a)||[], staysB=this.haus.get(b)||[];
      const raw=[], details=[];
      for (const x of staysA) for (const y of staysB) {
        if (cleanUnit(x.haus)!==cleanUnit(y.haus)) continue;
        const start=Math.max(x.start,y.start),end=Math.min(x.end,y.end);
        if (start>end) continue;
        raw.push([start,end+MS_DAY]); // inclusive historical dates
        details.push({
          haus:x.haus, sameRoom:Boolean(x.room&&y.room&&cleanUnit(x.room)===cleanUnit(y.room)),
          from:new Date(start).toISOString().slice(0,10),
          to:new Date(end).toISOString().slice(0,10),
          days:Math.round((end-start)/MS_DAY)+1,
          source:x.source||y.source
        });
      }
      raw.sort((x,y)=>x[0]-y[0]);
      const merged=[];
      for (const [start,end] of raw) {
        const last=merged[merged.length-1];
        if (last && start<=last[1]) last[1]=Math.max(last[1],end);
        else merged.push([start,end]);
      }
      const days=merged.reduce((sum,[start,end])=>sum+(end-start)/MS_DAY,0);
      return {days:Math.round(days),details,hasSource:staysA.length>0&&staysB.length>0};
    }

    calculateChemistry(memberA, memberB) {
      const a=normId(memberA),b=normId(memberB);
      if (a===b) throw new Error('서로 다른 두 멤버를 선택해 주세요.');
      const cacheKey=[a,b].sort().join('|');
      if(this.pairCache.has(cacheKey))return this.pairCache.get(cacheKey);
      const A=this.members.get(a),B=this.members.get(b);
      if (!A||!B) throw new Error('멤버 데이터가 없습니다. 기존 MEMBER 데이터 연결을 확인해 주세요.');

      const unitsB=new Set(B.units.map(cleanUnit));
      const commonUnits=A.units.filter(u=>unitsB.has(cleanUnit(u)));
      const haus=this.hausOverlap(a,b);
      const songs=[...this.tracks.values()].filter(t=>t.members.has(a)&&t.members.has(b));
      const commonUnitKeys=new Set(commonUnits.map(cleanUnit));
      const catalogUnits=new Set([...this.tracks.values()].map(t=>cleanUnit(t.unit)));
      const hasTrackCoverage=[...commonUnitKeys].some(u=>catalogUnits.has(u));
      const signal=[...this.signals.values()].filter(t=>t.members.has(a)&&t.members.has(b));
      const sameYear=Boolean(A.birthYear&&B.birthYear&&A.birthYear===B.birthYear);
      const birthGap=(A.birthYear&&B.birthYear)?Math.abs(A.birthYear-B.birthYear):null;
      const exactDays=(A.birthDate&&B.birthDate)
        ? Math.round(Math.abs(utc(A.birthDate)-utc(B.birthDate))/MS_DAY) : null;

      // Five axes with explicit evidence coverage. Unknown ≠ zero.
      const factors={
        haus: {weight:.25, value:haus.days>0?clamp(30+70*haus.days/210,0,100):null, known:haus.days>0},
        songs:{weight:.30, value:hasTrackCoverage?clamp(30+70*songs.length/2,0,100):null, known:hasTrackCoverage},
        birthday:{weight:.15, value:birthGap===null?null:clamp(100-birthGap*18,0,100),known:birthGap!==null},
        signal:{weight:.20, value:signal.length?clamp(55+45*signal.reduce((n,e)=>n+e.weight,0)/4,0,100):null,known:signal.length>0},
        dimension:{weight:.10, value:clamp(commonUnits.length/3*100,0,100), known:true}
      };

      // Bayesian-style shrink to neutral 50 for sparse evidence. The result is
      // a fan-made documentation-strength index, NOT a personal closeness fact.
      const coverage=Object.values(factors).reduce((v,f)=>v+(f.known?f.weight:0),0);
      const delta=Object.values(factors).reduce((v,f)=>v+(f.known?f.weight*(f.value-50):0),0);
      const score=Math.round(clamp(50+delta*.92,0,100));

      const sentences=[];
      if(haus.days>0){
        const roommate=haus.details.some(d=>d.sameRoom);
        sentences.push(`${A.name}과 ${B.name}은 기록된 ${haus.details[0].haus}에서 ${haus.days}일 동안 함께 생활${roommate?'했고 같은 방을 사용했습니다':'했습니다'}.`);
      }
      if(sameYear)sentences.push('두 사람은 같은 출생연도의 동갑 멤버입니다.');
      else if(birthGap!==null&&birthGap<=2)sentences.push(`출생연도 차이는 ${birthGap}년입니다.`);
      if(commonUnits.length) sentences.push(`공통 디멘션은 ${commonUnits.join(', ')}입니다.`);
      if(songs.length){
        const byUnit=[...new Set(songs.map(s=>s.unit).filter(Boolean))];
        sentences.push(`${byUnit.join('·')}에서 함께 참여한 확인된 곡은 ${songs.length}곡(${songs.slice(0,3).map(s=>s.title).join(', ')}${songs.length>3?' 외':''})입니다.`);
      } else if(commonUnits.length){
        sentences.push('곡별 참여 데이터는 확인된 범위에서만 계산합니다.');
      }
      if(signal.length)sentences.push(`함께 출연한 것으로 등록된 공식 SIGNAL은 ${signal.length}편입니다.`);
      if(!sentences.length) sentences.push('현재 검증된 공동 활동 기록이 충분하지 않습니다. 서로의 실제 친밀도를 뜻하지는 않습니다.');
      const level=coverage<.30?'기록 부족':score>=75?'강한 연결':score>=60?'다층 연결':'탐색 중';
      const result=Object.freeze({
        memberA:{id:a,name:A.name},memberB:{id:b,name:B.name},
        score,level,coverage:Math.round(coverage*100),
        metrics:{
          sharedHausDays:haus.days>0?haus.days:null,
          verifiedSharedSongs:songs.length,
          birthYearGap:birthGap, exactBirthGapDays:exactDays,
          officialSignalCount:signal.length,sharedDimensionCount:commonUnits.length
        },
        factors,commonDimensions:commonUnits,
        hausDetails:haus.details,
        tracks:songs.map(s=>({title:s.title,unit:s.unit,source:s.source})),
        signalSources:signal.map(s=>({title:s.title,url:s.url})),
        narrative:sentences.join(' '),
        disclaimer:'팬메이드 기록 연결 지수 · 공개 자료와 등록된 이벤트 기반, 사적 친밀도 추정 아님',
        sourceCoverage:coverage<.65?'자료 부족: 점수는 중립값 쪽으로 보정됨':'등록된 자료 기준'
      });
      this.pairCache.set(cacheKey,result);
      return result;
    }
  }

  function node(name,attrs={},text) {
    const n=document.createElementNS(NS,name);
    for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));
    if(text!=null)n.textContent=String(text);
    return n;
  }

  class WavRelationSVG {
    constructor(container){this.root=container;this.svg=null;}
    render(result){
      if(!this.root)return;
      const score=result.score;
      const svg=node('svg',{viewBox:'0 0 740 220',role:'img','aria-label':`${result.memberA.name}과 ${result.memberB.name} 연결 지수 ${score}점`,preserveAspectRatio:'xMidYMid meet'});
      svg.append(node('title',{},'WAV ARCHIVE · DYNAMIC RELATION ENGINE'),node('desc',{},result.narrative));
      const defs=node('defs');
      const gradient=node('linearGradient',{id:'wa15LinkGradient',x1:'0%',y1:'0%',x2:'100%',y2:'0%'});
      gradient.append(node('stop',{offset:'0%','stop-color':'#5dd9ef'}),node('stop',{offset:'52%','stop-color':'#a77aff'}),node('stop',{offset:'100%','stop-color':'#ff7ac8'}));
      defs.append(gradient);svg.append(defs);
      const width=(1.4+score/100*6).toFixed(2);
      const commonX=370;
      // Relative line weight encodes computed index; other existing DNA edges
      // are not touched. No perpetual rAF or expensive SVG filters.
      svg.append(node('path',{d:'M 140 112 Q 370 38 600 112',fill:'none',stroke:'#7e56b7','stroke-width':'12','stroke-opacity':'.12'}));
      svg.append(node('path',{d:'M 140 112 Q 370 38 600 112',fill:'none',stroke:'url(#wa15LinkGradient)','stroke-width':width,'stroke-linecap':'round',class:'wa15-link'}));
      for(const [x,member] of [[122,result.memberA],[618,result.memberB]]){
        svg.append(node('circle',{cx:x,cy:112,r:53,fill:'#121022',stroke:'#9170cf','stroke-width':'2'}));
        svg.append(node('circle',{cx:x,cy:112,r:46,fill:'#1f173b'}));
        svg.append(node('text',{x,y:106,'text-anchor':'middle',class:'wa15-svg-code'},member.id));
        svg.append(node('text',{x,y:133,'text-anchor':'middle',class:'wa15-svg-name'},member.name));
      }
      svg.append(node('rect',{x:commonX-65,y:25,width:130,height:50,rx:23,fill:'#1e1538',stroke:'#a77aff','stroke-opacity':'.7'}));
      svg.append(node('text',{x:commonX,y:58,'text-anchor':'middle',class:'wa15-svg-score'},`${score} / 100`));
      svg.append(node('text',{x:commonX,y:190,'text-anchor':'middle',class:'wa15-svg-sub'},`기록 근거 ${result.coverage}% · ${result.level}`));
      this.root.replaceChildren(svg);
      this.svg=svg;
    }
  }

  function createUI(){
    const root=document.getElementById('waDna65');
    if(!root||root.querySelector('[data-d65tab="relation"]'))return;
    const tabs=root.querySelector('.wa-dna65-tabs');
    const sheet=root.querySelector('.wa-dna65-sheet');
    if(!tabs||!sheet)return;
    const tab=document.createElement('button');
    tab.type='button';tab.dataset.d65tab='relation';tab.textContent='✦ RELATION STORY';
    tab.setAttribute('aria-label','두 멤버의 역사적 연결 관계 분석');
    tabs.append(tab);

    const panel=document.createElement('div');
    panel.className='wa-dna65-panel wa15-panel';panel.dataset.d65panel='relation';
    panel.innerHTML=`<div class="wa15-head"><strong>DYNAMIC RELATION ENGINE</strong><small>HAUS · DIMENSION · SONG · SIGNAL</small></div>
      <div class="wa15-chooser"><label>A MEMBER<select id="wa15A" aria-label="첫 번째 멤버"></select></label><span>×</span><label>B MEMBER<select id="wa15B" aria-label="두 번째 멤버"></select></label></div>
      <button type="button" id="wa15Run">RELATION ANALYZE →</button>
      <div id="wa15Output" aria-live="polite"></div>
      <div class="wa15-foot">데이터 출처: 기존 WAV ARCHIVE 멤버·디멘션 기록 / HAUS 1 / Aria 등 확인된 발매 정보. 공개된 관계 기록만 사용하며 사적인 친밀도는 판단하지 않습니다.</div>`;
    sheet.append(panel);
    let engine=null;
    const first=panel.querySelector('#wa15A'),second=panel.querySelector('#wa15B');
    const output=panel.querySelector('#wa15Output');
    function refresh(){
      engine=WavRelationEngine.fromExistingDOM(document);
      // Optional approved verified SIGNAL/HAUS records from external local file.
      if(window.WavRelationAdditionalData){
        const data=window.WavRelationAdditionalData;
        if(Array.isArray(data.hausStays))engine.addHausStays(data.hausStays);
        if(Array.isArray(data.tracks))engine.addTracks(data.tracks);
        if(Array.isArray(data.signalEvents))engine.addSignalEvents(data.signalEvents);
      }
      const all=[...engine.members.values()];
      const options=all.map(m=>`<option value="${esc(m.id)}">${esc(m.id)} · ${esc(m.name)}</option>`).join('');
      first.innerHTML=options;second.innerHTML=options;
      if(all.length>1){first.value=all.some(m=>m.id==='S03')?'S03':all[0].id;
        second.value=all.some(m=>m.id==='S09')?'S09':all[1].id;}
      return all.length;
    }
    function analyze(){
      if(!engine || !engine.members.size)refresh();
      try {
        const r=engine.calculateChemistry(first.value,second.value);
        const stats=[
          ['HAUS 동거',r.metrics.sharedHausDays==null?'자료 미확인':`${r.metrics.sharedHausDays}일`],
          ['공통 디멘션',`${r.metrics.sharedDimensionCount}개`],
          ['공동 참여곡',`${r.metrics.verifiedSharedSongs}곡 (등록 자료 기준)`],
          ['출생연도 차',r.metrics.birthYearGap==null?'미확인':`${r.metrics.birthYearGap}년`],
          ['공식 SIGNAL',r.metrics.officialSignalCount?`${r.metrics.officialSignalCount}건 등록`:'미등록 / 미확인']
        ];
        output.innerHTML='<div class="wa15-scene" id="wa15Scene"></div>'+`<div class="wa15-metrics">${stats.map(([label,value])=>`<div><small>${esc(label)}</small><strong>${esc(value)}</strong></div>`).join('')}</div>`+
        `<div class="wa15-story"><b>ARCHIVE STORY</b><p>${esc(r.narrative)}</p><small>${esc(r.sourceCoverage)} · ${esc(r.disclaimer)}</small></div>`+
        `<div class="wa15-source">${r.hausDetails.length?`<a target="_blank" rel="noopener noreferrer" href="https://triples.fandom.com/wiki/HAUS_1">HAUS 기록 ↗</a>`:''} ${r.tracks.length?`<a target="_blank" rel="noopener noreferrer" href="https://music.bugs.co.kr/album/4095214">Aria 음반 등 출처 ↗</a>`:''}</div>`;
        new WavRelationSVG(output.querySelector('#wa15Scene')).render(r);
      } catch(err){output.textContent=err.message;}
    }
    tab.addEventListener('click',()=>{if(refresh())analyze();});
    panel.querySelector('#wa15Run').addEventListener('click',analyze);
    first.addEventListener('change',analyze);second.addEventListener('change',analyze);
    // An optional shortcut in the EXISTING S 연결 보기 tab. Keep the old COMPARE
    // onclick intact, and merely add a separate route to the deeper new view.
    const originalCompare=root.querySelector('#waDna65Compare');
    if(originalCompare && !root.querySelector('#wa15FromCompare')){
      const shortcut=document.createElement('button');
      shortcut.type='button';shortcut.id='wa15FromCompare';
      shortcut.textContent='✦ STORY 분석';
      originalCompare.insertAdjacentElement('afterend',shortcut);
      shortcut.addEventListener('click',()=>{
        const a=root.querySelector('#waDna65A')?.value;
        const b=root.querySelector('#waDna65B')?.value;
        tab.click();
        if(a&&engine?.members.has(a))first.value=a;
        if(b&&engine?.members.has(b))second.value=b;
        tab.scrollIntoView({block:'nearest',inline:'center',behavior:'auto'});
        analyze();
      });
    }
    window.WAVDynamicRelation=Object.freeze({
      version:'15.0',
      open(a='S03',b='S09'){
        if(typeof window.waOpenDnaNetwork==='function')window.waOpenDnaNetwork();
        tab.click();if(engine?.members.has(a))first.value=a;
        if(engine?.members.has(b))second.value=b;analyze();
      },
      calculateChemistry(a,b){if(!engine || !engine.members.size)refresh();return engine.calculateChemistry(a,b);},
      get engine(){if(!engine||!engine.members.size)refresh();return engine;}
    });
  }

  window.WavRelationEngine=WavRelationEngine;
  window.WavRelationSVG=WavRelationSVG;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',createUI,{once:true});
  else createUI();
})();
