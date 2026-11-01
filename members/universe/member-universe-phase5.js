/* WAV ARCHIVE · MEMBER UNIVERSE 5 — connections, source transparency and linked navigation.
 * Isolated progressive enhancement: DOES NOT change global cards, PHASE 1–4 blocks or spoiler state.
 * Data comes only from existing member-universe snapshot + Phase 4 editorial source list.
 */
(()=>{'use strict';
 const id=document.documentElement.dataset.waMember||'';
 if(!/^S(?:0[1-9]|1\d|2[0-4])$/.test(id) || document.getElementById('waMu5Connections'))return;
 const current=document.currentScript;
 const base=new URL('./',current?.src||location.href);
 const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('member-universe-phase5.css?v=5',base).href;style.dataset.waMu5Style='1';document.head.appendChild(style);
 const L={
  ko:{eyebrow:'MEMBER UNIVERSE · CONNECTIONS',title:'함께한 디멘션',lead:'같은 디멘션에 등록된 멤버를 이어 보는 기록입니다',scope:'전체 멤버에게 공통인 상위 분류는 제외했습니다. 공통 소속 기록은 친밀도나 활동량을 뜻하지 않습니다',units:'함께 소속된 디멘션',all:'전체',showMore:'더 보기',showLess:'접기',empty:'공통 디멘션이 등록된 멤버가 없습니다',loading:'연결 정보를 불러오는 중…',failed:'연결 자료를 불러오지 못했어요. 다른 멤버 기록은 상단의 MEMBERS 메뉴에서 확인할 수 있습니다',visit:'멤버 기록 보기 ↗',sourceTitle:'자료 출처와 검증 범위',sourceLead:'공식 링크·팬 참고자료·사이트 내부 기록을 구분했습니다. 링크가 있다는 사실만으로 개별 문장이 공식 검증됐다는 뜻은 아닙니다',official:'공식 사이트 참고',fan:'팬 자료 참고',archive:'사이트 기록',noSources:'출처 목록을 확인할 수 없습니다',verify:'개별 내용의 정확성은 연결된 원문과 대조해 확인해야 합니다',links:'연결 아카이브',jumpStory:'멤버 이야기',jumpUnits:'디멘션',jumpAlbums:'음반',jumpJourney:'활동 연표',jumpSignals:'SIGNAL',jumpBadge:'배지전쟁',jumpCalendar:'일정',home:'전체 멤버 ↗',members:'연결 멤버',open:'자료 확인 ↗'},
  en:{eyebrow:'MEMBER UNIVERSE · CONNECTIONS',title:'Shared DIMENSIONs',lead:'Explore members linked by registered DIMENSION membership',scope:'Umbrella labels shared by all members are excluded. Shared memberships do not measure closeness or activity',units:'Shared DIMENSIONs',all:'All',showMore:'Show more',showLess:'Show less',empty:'No registered shared DIMENSIONs',loading:'Loading connections…',failed:'Connection data unavailable. Use the MEMBERS menu to browse other members',visit:'Open member archive ↗',sourceTitle:'Sources and verification',sourceLead:'Official reference links, fan sources and in-site records are distinguished. A link alone does not verify an individual claim',official:'Official reference',fan:'Fan reference',archive:'Archive record',noSources:'Source list unavailable',verify:'Check individual facts directly against the original sources',links:'Connected archives',jumpStory:'Story',jumpUnits:'DIMENSION',jumpAlbums:'Discography',jumpJourney:'Timeline',jumpSignals:'SIGNAL',jumpBadge:'Badge War',jumpCalendar:'Schedule',home:'All members ↗',members:'linked members',open:'View source ↗'},
  ja:{eyebrow:'MEMBER UNIVERSE · CONNECTIONS',title:'共通のディメンション',lead:'同じディメンションの登録記録を通じてメンバーを探索',scope:'全員共通の上位分類を除外しています。共通所属は親密さや活動量を示しません',units:'共通ディメンション',all:'すべて',showMore:'もっと見る',showLess:'閉じる',empty:'共通ディメンションの登録はありません',loading:'関係の記録を読み込み中…',failed:'記録を読み込めません。メンバー一覧をご利用ください',visit:'メンバーの記録 ↗',sourceTitle:'出典と検証範囲',sourceLead:'公式参考リンク、ファン資料、サイト内の記録を区別します。リンクだけでは個々の記述が公式に確認されたことにはなりません',official:'公式参考',fan:'ファン資料',archive:'サイト内記録',noSources:'出典一覧がありません',verify:'個別の情報は原典との照合が必要です',links:'関連アーカイブ',jumpStory:'ストーリー',jumpUnits:'ディメンション',jumpAlbums:'音盤',jumpJourney:'活動年表',jumpSignals:'SIGNAL',jumpBadge:'バッジ戦争',jumpCalendar:'予定',home:'メンバー一覧 ↗',members:'関連メンバー',open:'参照元 ↗'}
 };
 const lang=()=>L[document.documentElement.lang]?document.documentElement.lang:'ko';
 const t=()=>L[lang()];
 const node=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=String(text);return el};
 const validUrl=(url)=>{try{const u=new URL(url,location.href);return ['https:','http:'].includes(u.protocol)?u.href:null}catch{return null}};
 const canonical=(v)=>String(v||'').trim().toLowerCase().normalize('NFKC');
 const shared=(a,b)=>{const map=new Map((a||[]).map(x=>[canonical(x),x]));return [...new Set((b||[]).map(x=>canonical(x)))].filter(x=>map.has(x)).map(x=>map.get(x))};
 const cleanMember=(m)=>m&&typeof m.id==='string'&&/^S(?:0[1-9]|1\d|2[0-4])$/.test(m.id)&&Array.isArray(m.units);
 const sourceType=(s)=>['official','fan','archive'].includes(s?.type)?s.type:'archive';
 const read=async name=>{const res=await fetch(new URL(name,base),{cache:'default'});if(!res.ok)throw Error(`${name} · HTTP ${res.status}`);return res.json()};
 // Only add scoped standalone blocks to independent member pages.
 const section=node('section','block wa-mu5');section.id='waMu5Connections';section.setAttribute('aria-labelledby','waMu5Title');
 const head=node('div','wa-mu5-head');const eye=node('p','eyebrow');const title=node('h2');title.id='waMu5Title';const lead=node('p','wa-mu5-lead');head.append(eye,title,lead);
 const nav=node('nav','wa-mu5-jumps');nav.setAttribute('aria-label','Member archive sections');
 const controls=node('div','wa-mu5-filters');controls.setAttribute('role','group');controls.setAttribute('aria-label','DIMENSION filter');
 const summary=node('p','wa-mu5-summary');summary.setAttribute('role','status');summary.setAttribute('aria-live','polite');
 const cards=node('div','wa-mu5-grid');
 const toggle=node('button','wa-mu5-toggle');toggle.type='button';toggle.hidden=true;
 const caveat=node('p','wa-mu5-caveat');
 const sourceDetails=node('details','wa-mu5-sources');sourceDetails.id='waMu5Sources';
 const sourceSummary=node('summary','wa-mu5-sources-summary');const sourceBody=node('div','wa-mu5-source-body');sourceDetails.append(sourceSummary,sourceBody);
 section.append(head,nav,controls,summary,cards,toggle,caveat,sourceDetails);
 const anchor=document.getElementById('waMu2Music')||document.getElementById('dimensions')||document.getElementById('journey');
 if(anchor?.parentElement)anchor.insertAdjacentElement('afterend',section);else document.querySelector('main')?.appendChild(section);
 if(!section.isConnected)return;
 let all=[],own=null,story=null,chosen='ALL',expanded=false,errored=false,activeUnits=[];
 const targets=[['waMu4Story','jumpStory'],['dimensions','jumpUnits'],['waMu2Music','jumpAlbums'],['journey','jumpJourney'],['signals','jumpSignals'],['badgewar','jumpBadge'],['schedule','jumpCalendar']];
 function drawNav(){nav.replaceChildren();for(const [selector,label] of targets){if(!document.getElementById(selector))continue;const a=node('a','wa-mu5-jump',t()[label]);a.href='#'+selector;nav.append(a)}const home=node('a','wa-mu5-jump wa-mu5-jump-home',t().home);home.href='../../#members';nav.append(home)}
 function drawFilters(){controls.replaceChildren();if(!own)return;for(const v of ['ALL',...activeUnits]){const b=node('button','wa-mu5-chip',v==='ALL'?t().all:v);b.type='button';b.dataset.filter=v;b.setAttribute('aria-pressed',String(chosen===v));b.addEventListener('click',()=>{chosen=v;expanded=false;draw()});controls.append(b)}}
 function drawConnections(){cards.replaceChildren();if(!own){summary.textContent=errored?t().failed:t().loading;toggle.hidden=true;return}
  const candidates=all.filter(m=>m.id!==id).map(m=>({...m,overlap:shared(activeUnits,m.units)})).filter(m=>m.overlap.length&&(chosen==='ALL'||m.overlap.some(x=>canonical(x)===canonical(chosen)))).sort((a,b)=>b.overlap.length-a.overlap.length||a.id.localeCompare(b.id));
  summary.textContent=candidates.length?`${candidates.length} ${t().members}`:t().empty;
  const visible=expanded?candidates:candidates.slice(0,6);
  const frag=document.createDocumentFragment();
  for(const m of visible){const a=node('a','wa-mu5-member');a.href=`../${m.id.toLowerCase()}/`;const top=node('div','wa-mu5-member-head');top.append(node('span','wa-mu5-code',m.id),node('span','wa-mu5-count',`${m.overlap.length} ${t().units}`));const name=(lang()==='ko'?m.ko:m.en)||m.ko||m.en||m.id;a.append(top,node('strong','wa-mu5-name',name),node('span','wa-mu5-unitlist',m.overlap.join(' · ')),node('span','wa-mu5-visit',t().visit));frag.append(a)}cards.append(frag);
  toggle.hidden=candidates.length<=6;toggle.textContent=expanded?t().showLess:`${t().showMore} · ${candidates.length-6}`;
 }
 toggle.addEventListener('click',()=>{expanded=!expanded;drawConnections()});
 function drawSources(){sourceSummary.textContent=t().sourceTitle;sourceBody.replaceChildren();sourceBody.append(node('p','wa-mu5-source-note',t().sourceLead));
  if(!story||!Array.isArray(story.sources)){sourceBody.append(node('p','wa-mu5-muted',t().noSources));return}
  const frag=document.createDocumentFragment();
  for(const s of story.sources){const href=validUrl(s.url);if(!href)continue;const row=node('div','wa-mu5-source-row');row.append(node('span','wa-mu5-origin wa-mu5-origin-'+sourceType(s),t()[sourceType(s)]),node('span','wa-mu5-source-name',String(s.label||t().open)));const a=node('a','wa-mu5-source-link',t().open);a.href=href;
    if(new URL(href).origin!==location.origin){a.target='_blank';a.rel='noopener noreferrer'}row.append(a);frag.append(row)}sourceBody.append(frag,node('small','wa-mu5-muted',t().verify))
 }
 function draw(){const copy=t();eye.textContent=copy.eyebrow;title.textContent=copy.title;lead.textContent=copy.lead;caveat.textContent=copy.scope;drawNav();drawFilters();drawConnections();drawSources()}
 async function start(){try{const [data,stories]=await Promise.all([read('members.json'),read('member-universe-phase4-stories.json')]);
    if(!Array.isArray(data.members)||data.members.length!==24)throw Error('24-member snapshot unavailable');
    all=data.members.filter(cleanMember);if(all.length!==24)throw Error('Invalid member snapshot');
    own=all.find(m=>m.id===id);if(!own)throw Error('Current member missing');
    // Umbrella records shared by every member (e.g. MSNZ) are not useful as pairwise links.
    activeUnits=own.units.filter(u=>all.some(m=>!m.units.some(v=>canonical(v)===canonical(u))));
    story=Array.isArray(stories.members)?stories.members.find(m=>m.id===id):null;
    draw();
   }catch(err){errored=true;draw();console.warn('WAV MEMBER UNIVERSE Phase 5:',err.message)}}
 draw();
 // This section is the only added DOM. Do not rerender the original profile or source blocks.
 const ob=new MutationObserver(items=>{if(items.some(v=>v.attributeName==='lang'))draw()});ob.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){io.disconnect();start()}},{rootMargin:'600px'});io.observe(section)}else start();
})();
