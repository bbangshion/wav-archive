/* WAV ARCHIVE · MEMBER UNIVERSE PHASE 4 · ORIGINAL EDITORIAL STORIES
 * An additive reading layer; no changes to existing 3D cards, HISTORY, SIGNAL or other systems.
 * All user-facing source prose is authored for this project; no wiki text is copied.
 */
(()=>{'use strict';
 const id=document.documentElement.dataset.waMember;
 if(!/^S(?:0[1-9]|1\d|2[0-4])$/.test(id||'') || document.getElementById('waMu4Story'))return;
 const src=document.currentScript?.src||location.href;
 const base=new URL('./',src);
 const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('member-universe-phase4.css?v=4',base);css.dataset.waMu4Css='1';document.head.append(css);
 const LANG={
  ko:{eyebrow:'MEMBER UNIVERSE · ORIGINAL STORY',head:'멤버 이야기',subtitle:'프로필 숫자 너머, 공개부터 활동까지 이어지는 기록을 글로 읽어봅니다',moment:'기록 속 장면',source:'참고 자료와 검증 범위',official:'공식',fan:'팬 아카이브',archive:'기존 자료',note:'자료 유의사항',loading:'멤버 소개를 불러오는 중…',error:'상세 소개를 불러오지 못했어요. 아래 기존 HISTORY와 DIMENSION 기능은 그대로 이용할 수 있습니다',date:'기록 날짜',verify:'개별 사실은 출처 원문에서 확인해 주세요',open:'자료 열기 ↗'},
  en:{eyebrow:'MEMBER UNIVERSE · ORIGINAL STORY',head:'Member story',subtitle:'Read the path from the first reveal to later DIMENSION activities',moment:'From the timeline',source:'Sources and verification scope',official:'Official',fan:'Fan archive',archive:'Site data',note:'About the data',loading:'Loading editorial notes…',error:'The written profile is unavailable. The existing HISTORY and DIMENSION sections are unchanged',date:'Archive date',verify:'Check individual claims against the cited primary material',open:'View reference ↗'},
  ja:{eyebrow:'MEMBER UNIVERSE · ORIGINAL STORY',head:'メンバーストーリー',subtitle:'公開からディメンションの活動まで、記録を文章で読む',moment:'活動の記録',source:'参考資料と検証範囲',official:'公式',fan:'ファン資料',archive:'サイト内資料',note:'資料の注意点',loading:'紹介文を読み込み中…',error:'紹介文を取得できません。既存のHISTORY・DIMENSION機能はそのまま利用できます',date:'記録日',verify:'各項目は出典の原文をご確認ください',open:'資料を見る ↗'}
 };
 const lang=()=>LANG[document.documentElement.lang]?document.documentElement.lang:'ko';
 const t=()=>LANG[lang()];
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n};
 const block=el('section','block wa-mu4-story');block.id='waMu4Story';block.setAttribute('aria-labelledby','waMu4Title');
 const head=el('header','wa-mu4-head'), eye=el('p','eyebrow'), title=el('h2',''),sub=el('p','wa-mu4-sub');title.id='waMu4Title';head.append(eye,title,sub);
 const body=el('div','wa-mu4-body'), moments=el('div','wa-mu4-moments'), verify=el('details','wa-mu4-sources');
 const summary=el('summary','wa-mu4-summary'), inner=el('div','wa-mu4-source-inner');verify.append(summary,inner);
 const status=el('p','wa-mu4-status');status.setAttribute('role','status');block.append(head,body,moments,verify,status);
 const loc=document.querySelector('.section-nav')||document.querySelector('#dimensions');
 if(loc?.parentNode)loc.before(block);else document.querySelector('main')?.append(block);
 let loaded=null, snapshot=null;
 function render(){const l=lang(),copy=t();eye.textContent=copy.eyebrow;title.textContent=copy.head;sub.textContent=copy.subtitle;summary.textContent=copy.source;
 if(!loaded){status.textContent=copy.loading;return}status.textContent='';body.replaceChildren();moments.replaceChildren();inner.replaceChildren();
 const prose=loaded.originalNarrative?.[l]||loaded.originalNarrative?.ko||[];
 for(const [i,p] of prose.entries()){const item=el('p','wa-mu4-paragraph',p);item.dataset.para=String(i+1);body.append(item)}
 if(snapshot){
  const h=snapshot.history||[];
  const chosen=[];for(const x of h){if(!chosen.length&&x.title?.includes('공개')){chosen.push(x);break}}
  for(const x of h){if(chosen.length>=3)break;if(!chosen.includes(x)&&!/^ASSEMBLE(?:24|25)/i.test(x.title||''))chosen.push(x)}
  if(chosen.length){const label=el('h3','wa-mu4-mini-title',copy.moment);moments.append(label);const grid=el('div','wa-mu4-grid');for(const x of chosen){const card=el('article','wa-mu4-moment');card.append(el('time','',x.date||'—'),el('strong','',x.title||''));if(x.description)card.append(el('p','',x.description));grid.append(card)}moments.append(grid)}
 }
 inner.append(el('p','wa-mu4-caution',loaded.notice||''));inner.append(el('p','wa-mu4-caution',copy.verify));
 for(const s of loaded.sources||[]){const item=el('div','wa-mu4-source-row');const tag=el('span','wa-mu4-type wa-mu4-'+s.type,copy[s.type]||s.type);const link=el('a','',s.label+' ↗');link.href=new URL(s.url,location.href).href;link.target= s.type==='archive'?'_self':'_blank';if(link.target==='_blank')link.rel='noopener noreferrer';item.append(tag,link,el('small','',s.scope||''));inner.append(item)}
 }
 async function load(){try{
  const [r,rs]=await Promise.all([fetch(new URL('member-universe-phase4-stories.json?v=4',base),{cache:'no-cache'}),fetch(new URL('members.json',base),{cache:'no-cache'})]);
  if(!r.ok)throw Error('Failed '+r.status);
  const data=await r.json();if(data.schema!==4||!Array.isArray(data.members))throw Error('Invalid schema');
  loaded=data.members.find(x=>x.id===id);if(!loaded)throw Error('Member missing');window.__waMu4Data={editorialNotice:data.editorialNotice};loaded.notice=data.editorialNotice?.[lang()]||data.editorialNotice?.ko||'';
  if(rs.ok){const original=await rs.json();snapshot=original.members?.find(x=>x.id===id)||null}
  render();
 }catch(err){status.textContent=t().error;block.dataset.error='1';console.warn('WAV MEMBER story:',err.message)}}
 const watch=new MutationObserver(m=>{if(m.some(x=>x.attributeName==='lang')){if(loaded)loaded.notice=(window.__waMu4Data?.editorialNotice||{})[lang()]||loaded.notice;render()}});
 watch.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 /* The story is lightweight (one JSON); load after the rest of the member page is available. */
 const start=async()=>{await load();};
 if('IntersectionObserver' in window){let called=false;const io=new IntersectionObserver(entries=>{if(!called&&entries.some(e=>e.isIntersecting)){called=true;io.disconnect();start()}},{rootMargin:'450px'});io.observe(block)}else start();
})();
