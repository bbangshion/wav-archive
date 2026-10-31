/* WAV ARCHIVE Gravity 5.1 — read-only data quality UI.
 * No mutation of Gravity engine, local storage or user-selected ballots.
 */
(() => {
 'use strict';
 const root=document.getElementById('wa51-audit');
 const raw=document.getElementById('embedded-catalog');
 if(!root || !raw || window.__WA_GRAVITY_AUDIT_51__)return;
 window.__WA_GRAVITY_AUDIT_51__=true;
 const el=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!=null)n.textContent=String(value);return n;};
 let data;
 try{data=JSON.parse(raw.textContent)}catch(_){root.hidden=true;return;}
 const items=Array.isArray(data.events)?data.events:[];
 const found=items.filter(e=>e&&Number.isSafeInteger(e.number)&&e.number>0);
 const unique=new Set(found.map(e=>e.number));
 const eligible=found.filter(e=>e.totalComo!==null && Number.isSafeInteger(e.totalComo) && e.totalComo>=0);
 const stats=[
   [unique.size,'수록 Gravity 번호'],
   [eligible.length,'총 COMO 수치 기록'],
   [Math.max(0,Math.max(0,...unique)-unique.size),'현재 번호 공백']
 ];
 const container=document.getElementById('wa51-audit-stats');
 container.replaceChildren(...stats.map(([n,label])=>{const card=el('div','wa51-audit-stat');card.append(el('strong','',n.toLocaleString('ko-KR')),el('span','',label));return card;}));
 const body=document.getElementById('wa51-audit-details');
 if(!body)return;
 function row(title,summary,links){
   const card=el('article','wa51-audit-detail-card');
   card.append(el('b','',title),el('p','',summary));
   for(const [name,url] of links){if(!/^https:\/\//.test(url))continue;const a=el('a','',name+' ↗');a.href=url;a.target='_blank';a.rel='noopener noreferrer';card.append(a,document.createTextNode('  '));}
   body.append(card);
 }
 row('#06 · 후보 득표 합계와 1 COMO 차이',
     '기존 수록값 57,693 COMO와 Apollo 후보별 합계 57,692 COMO가 다릅니다. 공식 원문 재확인 전 기존 수치는 그대로 유지했습니다.',
     [['Apollo 후보별 기록','https://apollo.cafe/gravity/tripleS/26']]);
 row('#28 · A Live 25는 서로 다른 2라운드',
     'A Unit 212,989 COMO / B Unit 163,677 COMO. B의 163,677을 전체 합계로 오인하지 않도록 통합 총량은 공란 처리했습니다.',
     [['A Unit','https://apollo.cafe/gravity/tripleS/101'],['B Unit','https://apollo.cafe/gravity/tripleS/102']]);
 row('#29 · Alpha Percent Song / #30 · ∞! Summer Vacation',
     '두 개의 누락 기록을 별도 추가했습니다. Apollo와 팬 위키 대조를 거친 값이며 COSMO의 공식 결과 원문 검증을 의미하지 않습니다.',
     [['Alpha Percent','https://apollo.cafe/gravity/tripleS/103'],['Summer Vacation','https://apollo.cafe/gravity/tripleS/104']]);
 const missing=[];const max=Math.max(0,...unique);
 for(let i=1;i<=max;i++)if(!unique.has(i))missing.push('#'+i);
 row('추가 보완이 필요한 번호',
     missing.length?missing.join(' · '):'등록된 범위에 번호 공백이 없습니다. 전체 Gravity 완전 수록을 뜻하지는 않습니다.',
     [['COSMO 공식 포털','https://shop.cosmo.fans/'],['Apollo Gravity 탐색','https://apollo.cafe/gravity']]);
})();
