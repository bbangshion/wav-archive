import {WavObjektStorage} from './objekt-binder.mjs';
import {GravityRaceLab,drawGravitySVG} from './gravity-lab.mjs';
import {WavUnitLab,exportUnitPNG} from './unit-lab.mjs';

const $=id=>document.getElementById(id);
const make=(tag,text,attrs={})=>{
  const el=document.createElement(tag); if(text!==null&&text!==undefined)el.textContent=String(text);
  for(const[k,v]of Object.entries(attrs))el.setAttribute(k,String(v));return el;
};
const format=n=>Number(n).toLocaleString('ko-KR');
let binder=null,catalog=[],visible=[],shown=36,profiles=[],members=[],report=null;
let memberFilter='',seasonFilter='';
const memberBuckets=new Map(),seasonBuckets=new Map();

function appendOptions(node,values){
  node.append(...values.map(s=>{const el=make('option',s);el.value=s;return el;}));
}
function resetVisible(){
  // Presorted catalog comes from worker. Bucket lookups O(1), intersection O(k).
  // Never repeat O(k log k) sorts when toggling filters.
  const base=memberFilter?(memberBuckets.get(memberFilter)||[]):
    seasonFilter?(seasonBuckets.get(seasonFilter)||[]):catalog;
  visible=memberFilter&&seasonFilter?base.filter(row=>row.season===seasonFilter):
    seasonFilter&&!memberFilter?base:base;
  shown=36;renderBinder();
}
function renderBinder(){
  if(!binder)return;
  const data=binder.getCompletionRate({memberId:memberFilter||null,seasonId:seasonFilter||null});
  $('binder-stats').textContent=`전체 ${format(data.total)} · 보유 ${format(data.owned)} (${data.percent}%) · 위시 ${format(data.wishlist)} · 교환 ${format(data.trade)}`;
  const fragment=document.createDocumentFragment();
  for(const item of visible.slice(0,shown)){
    const f=binder.getStatus(item.id);
    const card=make('article',null,{class:'binder-card'});
    card.append(make('strong',`${item.memberId} · ${item.season}`),make('small',item.id));
    const group=make('div',null,{class:'btn-group'});
    for(const [label,key,method] of [['보유','owned','toggleOwned'],['위시','wish','toggleWish'],['교환','trade','toggleTrade']]){
      const btn=make('button',label,{'aria-pressed':String(f[key]),title:`${label} 여부 설정`});
      btn.addEventListener('click',async()=>{
        btn.disabled=true;
        try{await binder[method](item.id);renderBinder();}catch(e){alert(`상태 저장 실패: ${e.message}`);btn.disabled=false;}
      });group.append(btn);
    }
    card.append(group);fragment.append(card);
  }
  $('binder-items').replaceChildren(fragment);
  $('show-more').hidden=shown>=visible.length;
}
async function startBinder(){
  members=await fetch('../objekt-collection/members.json').then(r=>{if(!r.ok)throw Error('Member master unavailable');return r.json();});
  profiles=members.map(m=>({id:m.id,dimensions:m.units||[]}));
  renderMembers();
  const worker=new Worker('./catalog.worker.mjs',{type:'module'});
  const rows=await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>{worker.terminate();reject(new Error('카탈로그 처리 시간 초과'));},90000);
    worker.onmessage=e=>{
      if(e.data?.type==='READY'){clearTimeout(timeout);worker.terminate();resolve(e.data.catalog);}
      else if(e.data?.type==='ERROR'){clearTimeout(timeout);worker.terminate();reject(new Error(e.data.error));}
    };worker.onerror=e=>{clearTimeout(timeout);worker.terminate();reject(new Error(e.message||'Worker error'));};
    worker.postMessage({type:'LOAD'});
  });
  catalog=rows;
  for(const row of catalog){
    if(!memberBuckets.has(row.memberId))memberBuckets.set(row.memberId,[]);
    if(!seasonBuckets.has(row.season))seasonBuckets.set(row.season,[]);
    memberBuckets.get(row.memberId).push(row);
    seasonBuckets.get(row.season).push(row);
  }
  binder=await new WavObjektStorage().init(catalog);
  const memberNames=new Map(members.map(m=>[m.id,m.nameKo]));
  const memberIds=[...binder.memberIndex.keys()].sort();
  appendOptions($('member-filter'),memberIds.map(id=>`${id} ${memberNames.get(id)||''}`));
  // Correct options to keep IDs stable despite display strings.
  [...$('member-filter').options].slice(1).forEach((o,i)=>o.value=memberIds[i]);
  appendOptions($('season-filter'),[...binder.seasonIndex.keys()].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})));
  $('member-filter').addEventListener('change',e=>{memberFilter=e.target.value;resetVisible();});
  $('season-filter').addEventListener('change',e=>{seasonFilter=e.target.value;resetVisible();});
  $('show-more').addEventListener('click',()=>{shown+=36;renderBinder();});
  $('copy-code').addEventListener('click',async()=>{
    const code=binder.generateShareableString();
    try{await navigator.clipboard.writeText(code);$('binder-status').textContent=`공유 코드 복사됨 · ${code.length}자`;}catch{
      $('peer-code').value=code;$('peer-code').select();$('binder-status').textContent='클립보드 접근 불가. 아래에서 코드를 직접 복사하세요.';
    }
  });
  $('match-code').addEventListener('click',()=>{
    try{
      const outcome=binder.matchPeer($('peer-code').value);
      $('match-result').textContent=`교환 매칭 ${outcome.score}점 · 상대가 줄 수 있는 내 위시 ${outcome.iCanReceive.length}종 · 내가 줄 수 있는 상대 위시 ${outcome.iCanGive.length}종. 상호 교환 후보 ${outcome.reciprocalPossible?'있음':'없음'}.`;
    }catch(e){$('match-result').textContent=`매칭 불가: ${e.message}`;}
  });
  $('binder-status').textContent=`저장된 카탈로그 ${format(catalog.length)}종 · 표시 데이터는 GitHub Pages의 스냅샷 기준`;
  resetVisible();
}
function showGravity(polls){
  const lab=new GravityRaceLab(polls);
  const inflation=lab.voteInflationIndex();
  const members=lab.memberStats();
  $('gravity-meta').textContent=`Gravity ${polls.length}건 · Grand Gravity ${inflation.length}건 · 팬 투표량을 사용한 옵션별 지표`;
  drawGravitySVG($('gravity-chart'),inflation.map(p=>({date:p.date,votes:p.votes})));
  const fragment=document.createDocumentFragment();
  fragment.append(make('h3','가상 멤버 지지 강세 (로스터 균등 배분 프록시)'));
  for(const item of members.slice(0,12)) {
    const dim=item.dimensions.slice(0,2).map(d=>`${d.dimension} ${(d.winRate*100).toFixed(0)}%`).join(' / ');
    fragment.append(make('p',`${item.memberId} · 승리 비율 ${(item.winRate*100).toFixed(1)}% · 공통 옵션 ${item.appearances}회 · 할당 COMO ${Math.round(item.allocatedComo).toLocaleString('ko-KR')} · 콘셉트별 ${dim||'자료 없음'}`));
  }
  $('gravity-members').replaceChildren(fragment);
}
$('gravity-file').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;
  try{
    if(file.size>15*1024*1024)throw new Error('15MB 이하 JSON을 선택하세요');
    const input=JSON.parse(await file.text());
    showGravity(Array.isArray(input)?input:input.polls);
  }catch(e){$('gravity-meta').textContent=`데이터 형식 오류: ${e.message}`;}
});
const chosen=new Set();
function renderMembers(){
  const people=$('unit-people');const fragment=document.createDocumentFragment();
  for(const m of members){
    const b=make('button',`${m.id} ${m.nameKo}`,{'aria-pressed':String(chosen.has(m.id))});
    b.addEventListener('click',()=>{
      chosen.has(m.id)?chosen.delete(m.id):chosen.add(m.id);
      b.setAttribute('aria-pressed',String(chosen.has(m.id)));
    });fragment.append(b);
  }people.replaceChildren(fragment);
}
$('create-unit').addEventListener('click',()=>{
  try{
    const lab=new WavUnitLab(profiles);report=lab.evaluate([...chosen],{concept:$('concept').value});
    const out=$('unit-report');out.replaceChildren(make('h3',report.summary),make('p',report.disclosure));
    for(const[key,label]of [['overall','종합 케미'],['cohesion','공통 활동·동기 케미'],['performanceHarmony','활동 조화도 (프록시)'],['vocalBalance','보컬 점수 (사용자 입력/중립)'],['conceptScore','콘셉트 부합도']]){
      const value=Math.round(report.stats[key]);out.append(make('p',`${label} · ${value}/100`));
      const bar=make('div',null,{class:'bar'}),inner=make('span');
      inner.style.setProperty('--progress',`${value}%`);bar.append(inner);out.append(bar);
    }
    $('export-unit').disabled=false;
  }catch(e){$('unit-report').textContent=e.message;$('export-unit').disabled=true;}
});
$('export-unit').addEventListener('click',async()=>{
  if(!report)return;
  try{await exportUnitPNG(report,{filename:`WAV-UNIT-${report.memberIds.join('-')}.png`});}
  catch(e){$('unit-report').append(make('p',`PNG 생성 실패: ${e.message}`));}
});
async function setupOffline(){
  if(!('serviceWorker'in navigator)){$('offline-state').textContent='이 브라우저는 Service Worker를 지원하지 않습니다.';return;}
  try{
    const reg=await navigator.serviceWorker.register('../service-worker.js',{scope:'../'});
    $('offline-state').textContent=`오프라인 필수 정보팩 등록 완료 · ${reg.active?'활성':'설치 처리 중'}. 최초 온라인 접속 후 사용할 수 있습니다.`;
  }catch(e){$('offline-state').textContent=`Service Worker 등록 실패: ${e.message}`;}
}
setupOffline();
startBinder().catch(e=>{$('binder-status').textContent=`바인더 초기화 실패: ${e.message}`;});
