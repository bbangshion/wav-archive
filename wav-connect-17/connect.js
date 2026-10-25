/* WAV ARCHIVE 17 · Connected Universe / progressive, read-only navigation.
 * No existing card click, IndexedDB, Gravity model, search callback or DNA canvas is replaced.
 */
(()=>{'use strict';
  const VERSION='17.0.1';
  const $=(selector,ctx=document)=>ctx.querySelector(selector);
  const $$=(selector,ctx=document)=>Array.from(ctx.querySelectorAll(selector));
  const TEXT={ko:{title:'CONNECTED UNIVERSE',subtitle:'한 멤버에서 관련 기록으로 이동',search:'멤버 이름 또는 S번호',noMembers:'멤버 정보를 불러오지 못했습니다',routes:'기존 아카이브 탐색',share:'멤버 링크 복사',copied:'링크가 복사되었습니다',copyFail:'주소를 복사할 수 없어 공유 창을 열었습니다',source:'출처: WAV ARCHIVE 멤버 카드 · 유닛은 카드 기록 기준',note:'각 버튼은 기존 시스템을 엽니다 멤버별 출연·투표·음반 참여 여부를 자동으로 확정하지 않습니다',empty:'검색 결과 없음',labels:{profile:'프로필',units:'디멘션',music:'음반',signal:'SIGNAL',objekt:'Objekt',gravity:'Gravity',timeline:'활동 연표',dna:'DNA 관계도'}},en:{title:'CONNECTED UNIVERSE',subtitle:'Explore the archive from one member',search:'Member name or S number',noMembers:'Member data is unavailable',routes:'Explore existing records',share:'Copy member link',copied:'Link copied',copyFail:'Could not copy; opening sharing options',source:'Source: WAV ARCHIVE member cards · units reflect card metadata',note:'Links open existing systems. They do not automatically verify an individual video appearance, vote, or album credit',empty:'No matching members',labels:{profile:'Profile',units:'DIMENSION',music:'Albums',signal:'SIGNAL',objekt:'Objekt',gravity:'Gravity',timeline:'Timeline',dna:'DNA network'}},ja:{title:'CONNECTED UNIVERSE',subtitle:'メンバーから記録を探す',search:'メンバー名またはS番号',noMembers:'メンバーデータを読み込めません',routes:'既存の記録を探す',share:'メンバーリンクをコピー',copied:'リンクをコピーしました',copyFail:'コピーできないため共有画面を開きます',source:'出典: WAV ARCHIVE メンバーカード · ユニットはカードの記載に基づきます',note:'各ボタンは既存の機能を開きます。個別の出演・投票・参加作品を自動で確定するものではありません',empty:'該当するメンバーがいません',labels:{profile:'プロフィール',units:'DIMENSION',music:'アルバム',signal:'SIGNAL',objekt:'Objekt',gravity:'Gravity',timeline:'タイムライン',dna:'DNA関係図'}}};
  const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
  const letter=id=>/^S(?:0[1-9]|1\d|2[0-4])$/.test(id);
  function lang(){const x=(document.documentElement.lang||'ko').toLowerCase();return x.startsWith('ja')?'ja':x.startsWith('en')?'en':'ko'}
  const t=()=>TEXT[lang()];
  let people=[], selected='', config={};let root,searchInput,memberList,detail,status,trigger,openElement,previousOverflow='';
  function safeAttrs(raw){const id=clean(raw?.id).toUpperCase(),name=clean(raw?.name),units=Array.isArray(raw?.units)?raw.units.map(clean).filter(Boolean).slice(0,16):[];
    return letter(id)&&name&&name.length<130?{id,name,units}:null}
  function fromDom(){return $$('#memberGrid [data-member][data-name]').map(el=>safeAttrs({id:el.dataset.member,name:el.dataset.name,units:(el.dataset.units||'').split('|')})).filter(Boolean)}
  function available(){return new Set($$('section[id],main [id]').map(x=>x.id))}
  function jump(anchor){const target=document.getElementById(anchor);if(!target)return false;close();const scroll=()=>target.scrollIntoView({behavior:'auto',block:'start'});requestAnimationFrame(scroll);return true}
  function closeMenu(){let menu=$('#waGroupedMenu');if(menu&&(menu.getAttribute('aria-hidden')==='false'||menu.classList.contains('open'))){$('#waGroupedClose')?.click()}}
  function profile(){close();const field=$('#memberSearch');const all=$('.filter[data-filter="ALL"]');if(all&&!all.classList.contains('active'))all.click();if(field){field.value=selected;field.dispatchEvent(new Event('input',{bubbles:true}));field.dispatchEvent(new Event('change',{bubbles:true}));}
    const target=$('#members');if(target)requestAnimationFrame(()=>target.scrollIntoView({behavior:'auto',block:'start'}));}
  function openObjekt(){const b=$('[data-wa-objekt-open]');if(!b)return false;close();closeMenu();requestAnimationFrame(()=>b.click());return true}
  function routeSignal(){const href=clean(config.signal_route);if(!href)return false;try{const url=new URL(href,location.href);if(url.origin!==location.origin)return false;close();location.assign(url.href);return true}catch{return false}}
  function actions(){const names=t().labels, buttons=[['profile',()=>!!$('#members'),profile],['units',()=>!!$('#units'),()=>jump('units')],['music',()=>!!$('#discography'),()=>jump('discography')],['signal',()=>!!config.signal_route,routeSignal],['objekt',()=>!!$('[data-wa-objekt-open]'),openObjekt],['gravity',()=>!!$('#gravity'),()=>jump('gravity')],['timeline',()=>!!$('#timeline'),()=>jump('timeline')]];
    const dna=clean(config.dna_anchor);if(dna)buttons.push(['dna',()=>!!document.getElementById(dna),()=>jump(dna)]);
    return buttons.map(([id,isEnabled,exec])=>({id,label:names[id],isEnabled:isEnabled(),exec}))}
  function textEl(tag,cls,txt){const el=document.createElement(tag);if(cls)el.className=cls;el.textContent=txt;return el}
  function renderPeople(){const q=clean(searchInput.value).toLocaleLowerCase();memberList.replaceChildren();const filtered=people.filter(m=>[m.id,m.name,...m.units].join(' ').toLocaleLowerCase().includes(q));
    if(!filtered.length){memberList.append(textEl('p','wa17-note',people.length?t().empty:t().noMembers));return}
    const frag=document.createDocumentFragment();for(const m of filtered){const b=document.createElement('button');b.type='button';b.className='wa17-member';b.dataset.id=m.id;b.setAttribute('aria-pressed',String(m.id===selected));const small=textEl('small','',m.id);b.append(small,document.createTextNode(m.name));frag.append(b)}memberList.append(frag)}
  function renderDetail(){detail.replaceChildren();const m=people.find(x=>x.id===selected);if(!m){detail.hidden=true;return}detail.hidden=false;
    detail.append(textEl('h3','',`${m.id} · ${m.name}`));detail.append(textEl('p','wa17-meta',t().source));
    if(m.units.length){const wrap=textEl('div','wa17-units','');for(const unit of m.units)wrap.append(textEl('span','wa17-pill',unit));detail.append(wrap)}
    detail.append(textEl('p','wa17-meta',t().routes));const grid=textEl('div','wa17-routes','');for(const action of actions()){const b=document.createElement('button');b.type='button';b.className='wa17-route';b.disabled=!action.isEnabled;b.append(document.createTextNode(action.label),document.createTextNode(' ↗'));b.addEventListener('click',()=>{if(action.isEnabled)action.exec()});grid.append(b)}detail.append(grid);
    const share=textEl('button','wa17-share',t().share);share.type='button';share.addEventListener('click',shareLink);detail.append(share);
    detail.append(textEl('p','wa17-note',t().note));}
  async function shareLink(){const url=new URL(location.href);url.searchParams.set('wa17',selected);url.hash='';try{await navigator.clipboard.writeText(url.href);status.textContent=t().copied}catch{status.textContent=t().copyFail;try{await navigator.share?.({url:url.href,title:'WAV ARCHIVE'})}catch{}}}
  function choose(id){if(!people.some(p=>p.id===id))return;selected=id;renderPeople();renderDetail();status.textContent=''}
  function open(id){openElement=document.activeElement;closeMenu();if(id)selected=id;else if(!selected)selected=people[0]?.id||'';renderPeople();renderDetail();root.classList.add('wa17-open');root.setAttribute('aria-hidden','false');previousOverflow=document.documentElement.style.overflow;document.documentElement.classList.add('wa17-dialog-open');document.documentElement.style.overflow='hidden';$('#wa17-close').focus({preventScroll:true})}
  function close(){if(!root?.classList.contains('wa17-open'))return;root.classList.remove('wa17-open');root.setAttribute('aria-hidden','true');document.documentElement.classList.remove('wa17-dialog-open');document.documentElement.style.overflow=previousOverflow;openElement?.focus?.({preventScroll:true})}
  function languageUpdate(){const x=t();$('#wa17-title').textContent=x.title;$('#wa17-sub').textContent=x.subtitle;searchInput.placeholder=x.search;renderPeople();renderDetail()}
  function create(){const existing=$('#wa17-root');if(existing){root=existing;return}root=textEl('div','','');root.id='wa17-root';root.setAttribute('aria-hidden','true');const shade=textEl('div','wa17-shade','');shade.dataset.wa17Close='';const panel=textEl('div','wa17-panel','');panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','wa17-title');const header=textEl('div','wa17-head','');const h=textEl('div','','');h.append(textEl('span','wa17-kicker','WAV ARCHIVE / 17.0'));const title=textEl('h2','',t().title);title.id='wa17-title';const sub=textEl('p','wa17-sub',t().subtitle);sub.id='wa17-sub';h.append(title,sub);const x=textEl('button','wa17-close','×');x.id='wa17-close';x.type='button';x.setAttribute('aria-label','Close');x.dataset.wa17Close='';header.append(h,x);const main=textEl('div','wa17-main','');searchInput=document.createElement('input');searchInput.type='search';searchInput.className='wa17-search';searchInput.placeholder=t().search;searchInput.setAttribute('aria-label',t().search);memberList=textEl('div','wa17-list','');detail=textEl('section','wa17-detail','');detail.hidden=true;status=textEl('output','wa17-status','');status.setAttribute('aria-live','polite');main.append(searchInput,memberList,detail,status);panel.append(header,main);root.append(shade,panel);document.body.append(root);
    root.addEventListener('click',e=>{if(e.target.closest('[data-wa17-close]'))close();const b=e.target.closest('.wa17-member');if(b&&root.contains(b))choose(b.dataset.id)});
    root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();return}if(e.key!=='Tab')return;const focusables=$$('button:not(:disabled),input:not(:disabled)',root).filter(el=>el.getClientRects().length>0);if(!focusables.length)return;const first=focusables[0],last=focusables.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});
    searchInput.addEventListener('input',()=>{renderPeople()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&root.classList.contains('wa17-open'))close()});}
  function addLauncher(){const menu=$('#waGroupedMenu .wa-menu-start')||$('#waGroupedMenu .wa-menu-play');if(!menu){return false}if(menu.querySelector('[data-wa17-launch]'))return true;const b=textEl('button','wa17-launch','');b.type='button';b.dataset.wa17Launch='';const line=textEl('span','','');line.append(textEl('b','','✦ CONNECTED UNIVERSE'),textEl('small','','17.0 ↗'));b.append(line);menu.append(b);b.addEventListener('click',()=>open());trigger=b;return true}
  async function getData(){try{const r=await fetch('wav-connect-17/member-index.json',{cache:'no-store'});if(r.ok){const data=await r.json();return Array.isArray(data.members)?data.members:[]}}catch{}
    return []}
  async function init(){create();let content=await getData();content=[...content,...fromDom()];const seen=new Set();people=content.map(safeAttrs).filter(m=>{if(!m||seen.has(m.id))return false;seen.add(m.id);return true}).sort((a,b)=>a.id.localeCompare(b.id));
    try{const r=await fetch('wav-connect-17/routes.json');if(r.ok)config=await r.json()}catch{};
    if(!addLauncher()){ // Retry only on lazy menu creation, stop automatically after a short bounded window.
      let n=0;const timer=setInterval(()=>{if(addLauncher()||++n>8)clearInterval(timer)},500);
      window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
    }
    const params=new URLSearchParams(location.search);const id=clean(params.get('wa17')).toUpperCase();if(letter(id)&&people.some(m=>m.id===id))open(id);
    new MutationObserver((_,o)=>{if(!document.documentElement.isConnected){o.disconnect();return}const l=lang();if(l!==init.lastLang){init.lastLang=l;languageUpdate()}}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    window.WAVConnect17=Object.freeze({version:VERSION,open:(id)=>open(letter(clean(id).toUpperCase())?clean(id).toUpperCase():null),close});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
