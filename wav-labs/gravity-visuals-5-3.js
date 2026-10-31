/* WAV ARCHIVE 5.3 · Gravity candidate visualization
 * Read-only data presentation. Does not mutate gravity catalog, replay,
 * prediction models, 5.1 audit, 5.2 dimension mappings, or localStorage. */
(() => {
  'use strict';
  const host=document.getElementById('wa53-breakdown');
  const src=document.getElementById('embedded-catalog');
  if (!host || !src || window.__waGravity53) return;
  window.__waGravity53=true;
  const byId=id=>document.getElementById(id);
  const select=byId('wa53-ballot');
  const rowsNode=byId('wa53-rows');
  const summary=byId('wa53-summary');
  const badge=byId('wa53-badge');
  const note=byId('wa53-note');
  const source=byId('wa53-source');
  const toggle=byId('wa53-show-all');
  if (!select || !rowsNode || !summary || !badge || !note || !source || !toggle) return;
  function elt(tag,cls,value){const el=document.createElement(tag);if(cls)el.className=cls;if(value!==undefined)el.textContent=String(value);return el;}
  const validVote=n=>Number.isSafeInteger(n)&&n>=0;
  const fmt=n=>Number(n).toLocaleString('ko-KR');
  const pct=n=>(Math.round(n*10)/10).toLocaleString('ko-KR',{maximumFractionDigits:1})+'%';
  let raw;
  try{raw=JSON.parse(src.textContent||'');}
  catch(e){rowsNode.append(elt('div','wa53-empty','후보별 득표 데이터를 읽지 못했습니다. 기존 분석 기능은 계속 이용할 수 있습니다.'));return;}
  const ballots=(Array.isArray(raw.ballots)?raw.ballots:[])
   .filter(b=>b && Array.isArray(b.options)&&b.options.some(o=>o&&validVote(o.votes)))
   .map(b=>({
      id:String(b.id||''),title:String(b.title||'제목 미등록'),date:String(b.date||''),
      winner:String(b.winner||''),source:/^https:\/\//.test(String(b.source||''))?String(b.source):'',
      total:validVote(b.totalComo)?b.totalComo:null,
      options:b.options.filter(o=>o&&validVote(o.votes))
       .map(o=>({id:String(o.id||''),label:String(o.label||o.id||'후보'),votes:o.votes}))
   }))
   .filter(b=>b.id && b.options.length);
  if(!ballots.length){rowsNode.append(elt('div','wa53-empty','후보별 득표 상세가 아직 등록되지 않았습니다.'));return;}
  for(const b of ballots){const op=elt('option','',`${b.date} · ${b.title}`);op.value=b.id;select.append(op);}
  badge.textContent=`${fmt(ballots.length)} BALLOTS`;
  let showAll=false;
  const summaryCard=(label,value)=>{
    const card=elt('div','wa53-summary-card');
    card.append(elt('small','',label),elt('strong','',value));return card;
  };
  function render(){
    const selected=ballots.find(b=>b.id===select.value)||ballots[0];
    const list=selected.options.slice().sort((a,b)=>b.votes-a.votes||a.label.localeCompare(b.label));
    const sum=list.reduce((acc,o)=>acc+o.votes,0);
    const max=Math.max(1,...list.map(o=>o.votes));
    const winner=list[0];
    const gap=winner && list.length>1?winner.votes-list[1].votes:null;
    const totalVotes=sum;
    summary.replaceChildren(
      summaryCard('등록 후보',fmt(list.length)+'개'),
      summaryCard('후보 득표 합계',fmt(totalVotes)),
      summaryCard('1·2위 차이',gap===null?'—':fmt(gap))
    );
    const clipped=list.length>8;
    toggle.hidden=!clipped;
    toggle.setAttribute('aria-pressed',String(showAll));
    toggle.textContent=showAll?'상위 8개만 보기':`전체 ${fmt(list.length)}개 후보 보기`;
    const visible=(clipped && !showAll)?list.slice(0,8):list;
    const fragment=document.createDocumentFragment();
    visible.forEach((candidate,i)=>{
      const card=elt('div','wa53-entry'+(i===0?' is-leader':''));card.setAttribute('role','listitem');
      const title=elt('div','wa53-entry-head');
      const name=elt('span','wa53-entry-name');name.append(elt('span','wa53-rank',`#${i+1}`),document.createTextNode(candidate.label));
      const nums=elt('span','wa53-entry-numbers');
      nums.append(elt('strong','',fmt(candidate.votes)+' COMO'),elt('small','',sum>0?pct(candidate.votes/sum*100):'—'));
      title.append(name,nums);
      const track=elt('div','wa53-meter');
      const fill=elt('i');fill.style.width=pct(candidate.votes/max*100);track.append(fill);
      card.append(title,track);fragment.append(card);
    });
    rowsNode.replaceChildren(fragment);
    const diff=selected.total!==null && selected.total!==sum;
    note.textContent=diff
      ?`주의: 수록 후보 합계 ${fmt(sum)} COMO와 기록된 전체 ${fmt(selected.total)} COMO가 일치하지 않습니다. 누락·중복 라운드 여부를 별도로 확인해야 하며 수치를 보정하지 않습니다.`
      :`득표율은 이 투표의 후보별 등록 COMO 합계(${fmt(sum)})를 분모로 계산했습니다. 막대 길이는 최고 득표 후보를 100%로 한 상대 길이이며 득표율 자체가 아닙니다. 공식 발표 원문과 개별 대조된 수치라는 뜻은 아닙니다.`;
    source.hidden=!selected.source;
    if (selected.source) source.href=selected.source;
    else source.removeAttribute('href');
  }
  select.addEventListener('change',()=>{showAll=false;render();});
  toggle.addEventListener('click',()=>{showAll=!showAll;render();});
  render();
})();
