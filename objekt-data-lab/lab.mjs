/* WAV ARCHIVE 16.0 — independent, additive Objekt Data Lab.
 * No mutation of legacy Objekt Collection, WAV LABS, or original member data.
 */
import {MEMBERS,WavObjektIndex,unpackCatalog,normalizeObjekt,makeTradeCode,parseTradeCode,matchTrades} from './lab-core.mjs';
import {WavObjektStore} from './lab-storage.mjs';
const $=id=>document.getElementById(id), t0=x=>String(x??'').trim();
const app={index:new WavObjektIndex(),store:new WavObjektStore(),catalog:[],manual:[],offset:0,page:24,filter:{},language:'ko',busy:false};
let toastTimer=0,queryTimer=0;
function toast(msg){const el=$('toast');if(!el)return;el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3200)}
const dict={
 en:{catalog:'Catalog entries',owned:'Owned',wish:'Wishlist',trade:'For trade',titleCatalog:'My Objekt binder',descCatalog:'See your collection progress and mark cards.',clear:'Reset',more:'Load more',manual:'Add an Objekt manually',add:'+ Add entry',reportTitle:'Collection report',reportDesc:'Progress based on catalog entries, not official ownership or market value.',progress:'Completion within registered entries',seasonStats:'By season',badgesNote:'Badges are fan-made collection milestones in WAV ARCHIVE.',matchTitle:'Find a trade match',matchDesc:'Share only wishlist and tradable items, never your full owned list.',makeCode:'Create trade code',copy:'Copy',theirCode:'Paste another WAVTRADE1 code',compare:'Compare trade lists',backupTitle:'Keep your records safe',backupDesc:'Save a backup before switching devices.',downloadBackup:'Download JSON backup',restore:'Import backup',oldBinder:'Copy 15.5+ binder'},
 ja:{catalog:'カタログ件数',owned:'所持',wish:'ほしい',trade:'交換可能',titleCatalog:'マイObjektバインダー',descCatalog:'コレクション進捗をチェックしよう。',clear:'リセット',more:'もっと見る',manual:'手動でObjektを追加',add:'＋ リストに追加',reportTitle:'コレクション記録',reportDesc:'カタログ件数に対する個人の登録率です。公式所持証明や価格ではありません。',progress:'登録項目の収集率',seasonStats:'シーズン別',badgesNote:'バッジはWAV ARCHIVE内のファンメイド記録です。',matchTitle:'交換候補を探す',matchDesc:'希望と交換可能リストのみ共有します。',makeCode:'交換コードを作成',copy:'コピー',theirCode:'相手のWAVTRADE1コード',compare:'交換候補を比較',backupTitle:'記録のバックアップ',backupDesc:'端末を変える前に保存してください。',downloadBackup:'JSONバックアップ',restore:'バックアップ読込',oldBinder:'15.5+バインダーをコピー'}
};
function setLanguage(lang){app.language=['ko','en','ja'].includes(lang)?lang:'ko';document.documentElement.lang=app.language;
 document.querySelectorAll('[data-i18n]').forEach(el=>{if(!el.dataset.original)el.dataset.original=el.textContent.trim();el.textContent=dict[lang]?.[el.dataset.i18n]??el.dataset.original});
 document.querySelectorAll('[data-lang]').forEach(el=>el.classList.toggle('active',el.dataset.lang===lang));
 }
function create(tag,className='',txt=''){const el=document.createElement(tag);if(className)el.className=className;if(txt!==undefined&&txt!==null)el.textContent=txt;return el}
function status(msg){$('catalogNotice').textContent=msg}
function fmt(n){return Number(n||0).toLocaleString('ko-KR')}
function selOption(parent,value,label){const opt=document.createElement('option');opt.value=value;opt.textContent=label;parent.append(opt)}
function repopulateFilters(){
 const member=$('member');for(const m of MEMBERS)if(!member.querySelector(`option[value="${m.id}"]`))selOption(member,m.id,`${m.id} ${m.name}`);
 const manual=$('manualMember');if(manual.options.length===0)for(const m of MEMBERS)selOption(manual,m.id,`${m.id} ${m.name}`);
 for(const [id,map,prefix] of [['season',app.index.bySeason,'전체 시즌'],['klass',app.index.byClass,'전체 클래스']]){
  const el=$(id),keep=el.value;el.replaceChildren();selOption(el,'',prefix);
  [...map.keys()].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})).forEach(s=>selOption(el,s,s));el.value=keep&&map.has(keep)?keep:'';
 }
}
function combineCatalog(newRows){const all=new Map();for(const row of [...newRows,...app.manual])if(row?.id)all.set(row.id,row);
 app.catalog=newRows;app.index=new WavObjektIndex([...all.values()]);repopulateFilters();resetResults();updateStats();
}
function resetResults(){app.offset=0;renderCards()}
function readFilters(){return {member:$('member').value,season:$('season').value,klass:$('klass').value,query:$('search').value.trim()}}
function renderCards(){
 const query={...readFilters(),offset:app.offset,limit:app.page};const {rows,total}=app.index.select(query);
 const frag=document.createDocumentFragment();
 for(const r of rows){
  const card=create('article','card');const top=create('div','card-top');
  if(r.image){const img=create('img');img.loading='lazy';img.decoding='async';img.src=r.image;img.alt='';img.onerror=()=>img.remove();top.append(img)}
  else top.append(create('div','placeholder','✦'));
  const detail=create('div');detail.append(create('strong','',`${r.memberId||'—'} ${r.memberName||''}`));
  detail.append(create('small','',r.number||r.id));detail.append(create('small','',`${r.season||'시즌 미상'} · ${r.klass||'CLASS'}`));top.append(detail);
  const actions=create('div','card-actions');for(const [key,label] of [['owned','보유'],['wish','위시'],['trade','교환']]){
   const button=create('button','',label);button.type='button';button.dataset.action=key;button.dataset.id=r.id;button.setAttribute('aria-pressed',String(app.store.state[key].has(r.id)));button.setAttribute('aria-label',`${r.memberId} ${r.number||r.id} ${label}`);actions.append(button);
  }
  card.append(top,actions);frag.append(card);
 }
 if(!app.offset)$('cards').replaceChildren(frag);else $('cards').append(frag);
 app.offset+=rows.length;$('resultCount').textContent=`${fmt(total)}개 중 ${fmt(app.offset)}개 표시`;
 $('more').hidden=app.offset>=total||rows.length===0;
 if(!app.offset)$('cards').append(create('p','hint','조건에 맞는 카드가 없어. 필터를 바꾸거나 카탈로그를 불러와 줘.'));
}
function updateStats(){const owned=app.store.state.owned,st=app.store.state;
 $('catalogCount').textContent=fmt(app.index.total);$('ownedCount').textContent=fmt(owned.size);$('wishCount').textContent=fmt(st.wish.size);$('tradeCount').textContent=fmt(st.trade.size);
 const all=app.index.completion(null,owned);$('totalPct').textContent=all.total?`${all.percent}%`:'—';$('barfill').style.width=`${all.percent}%`;
 $('reportBase').textContent=`연결된 ${fmt(all.total)}개 항목 중 ${fmt(all.owned)}개를 보유로 표시했어. (전체 카탈로그 누락 시 수집률도 제한적)`;
 const frag=document.createDocumentFragment();
 for(const m of MEMBERS){const p=app.index.completion({member:m.id},owned);if(!p.total)continue;
  const wrap=create('div','report-row'),head=create('div','report-row-head');head.append(create('span','',`${m.id} ${m.name}`));head.append(create('small','',`${p.owned}/${p.total} · ${p.percent}%`));
  const mini=create('div','mini'),fill=create('span');fill.style.width=`${p.percent}%`;mini.append(fill);wrap.append(head,mini);frag.append(wrap);
 }
 $('memberBars').replaceChildren(frag);
 const seas=document.createDocumentFragment();for(const s of [...app.index.bySeason.keys()].sort()){const p=app.index.completion({season:s},owned);seas.append(create('span','',`${s} · ${p.owned}/${p.total} (${p.percent}%)`))} $('seasonStats').replaceChildren(seas);
 const badge=document.createDocumentFragment();for(const [limit,label] of [[1,'✦ 첫 Objekt'],[10,'✦ 10개 기록'],[24,'✦ 24개 기록'],[100,'✦ 100개 기록'],[500,'✦ 500개 기록']])if(owned.size>=limit)badge.append(create('span','',label));
 if(!badge.childNodes.length)badge.append(create('span','','✦ 첫 등록을 기다리는 중'));$('badges').replaceChildren(badge);
}
async function dataFromFile(file){if(!file||file.size>20*1024*1024)throw Error('JSON은 20MB 이하만 불러올 수 있어.');
 const text=await file.text();return parseRecords(text)
}
async function parseRecords(jsonText){
 if(typeof Worker!=='undefined'){
  try{return await new Promise((resolve,reject)=>{
   const worker=new Worker(new URL('./catalog-worker.mjs',import.meta.url),{type:'module'});let done=false;
   const finish=(fn,v)=>{if(done)return;done=true;clearTimeout(timer);worker.terminate();fn(v)};
   const timer=setTimeout(()=>finish(reject,Error('데이터 처리 시간이 너무 길어.')),20000);
   worker.onmessage=e=>e.data?.ok?finish(resolve,e.data.rows):finish(reject,Error(e.data?.error??'카탈로그 파싱 오류'));
   worker.onerror=e=>finish(reject,Error(e.message||'Worker 오류'));worker.postMessage(jsonText);
  })}catch(e){console.warn('Worker parse fallback',e)}
 }
 const rows=unpackCatalog(JSON.parse(jsonText));if(!rows.length)throw Error('Objekt 배열을 찾지 못했어.');
 const unique=new Map();for(const r of rows){const nr=normalizeObjekt(r);if(nr)unique.set(nr.id,nr)}return [...unique.values()];
}
const candidateUrls=['../objekt-collection/data/objekt-top.json','../objekt-collection/data/apollo.json','../objekt-collection/data/objekts.json','../objekt-collection/objekts.json','../objekt-collection/catalog.json'];
async function loadCatalog(){status('기존 Objekt 카탈로그 연결을 확인 중이야…');
 for(const p of candidateUrls){const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),6000);
  try{
   const response=await fetch(p,{signal:ctl.signal});if(!response.ok)continue;
   const len=Number(response.headers.get('content-length')||0);if(len>20*1024*1024)continue;
   const mime=response.headers.get('content-type')||'';if(!mime.includes('json')&&!p.endsWith('.json'))continue;
   const data=await response.text();if(data.length>20*1024*1024)continue;
   const rows=await parseRecords(data);if(rows.length){combineCatalog(rows);status(`카탈로그 ${fmt(rows.length)}개를 ${p}에서 불러왔어. 이미지가 없거나 데이터 기준이 다르면 JSON으로 교체해 줘.`);return}
  }catch(err){console.debug('Objekt catalog not available',p,err?.message)}finally{clearTimeout(t)}
 }
 combineCatalog(app.catalog);
 status('자동으로 읽을 수 있는 카탈로그 JSON이 없어. 기존 Objekt Collection은 그대로 유지돼. 저장된 카탈로그가 있으면 계속 사용할 수 있고, 없으면 JSON을 불러오거나 직접 추가해 줘.');
}
function downloadJson(name,data){const file=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(file);const a=create('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000)}
async function importPreviousBinder(){
 if(typeof indexedDB==='undefined')throw Error('이 브라우저에서 기존 바인더 DB를 읽을 수 없어.');
 // Read-only: legacy storage schema from WAV ARCHIVE 15.5+ / WavObjektStorage.
 const db=await new Promise((resolve,reject)=>{const req=indexedDB.open('wav-archive-personal-v2');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});
 try{
  if(!db.objectStoreNames.contains('state'))throw Error('기존 바인더를 찾지 못했어.');
  const tx=db.transaction('state','readonly');const kv=tx.objectStore('state');const get=key=>new Promise((res,rej)=>{const r=kv.get(key);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
  const [o,w,t,m]=await Promise.all(['list:owned','list:wish','list:trade','wavplus-manual'].map(get));
  for(const [name,arr] of [['owned',o],['wish',w],['trade',t]])if(Array.isArray(arr)){for(const id of arr)if(typeof id==='string')app.store.state[name].add(id);await app.store.persist(name)}
  if(Array.isArray(m)){for(const row of m){const v=normalizeObjekt(row);if(v&&!app.manual.some(x=>x.id===v.id))app.manual.push(v)}app.store.state.manual=app.manual;await app.store.persist('manual')}
  combineCatalog(app.catalog);toast('기존 바인더 기록을 복사했어. 원본 데이터는 그대로야.');
 }finally{db.close()}
}
function renderMatch(matched){const box=$('matchResults');box.replaceChildren();
 const heading=create('p');heading.append(create('strong','',`내가 원하는 카드 중 ${matched.need.length}개 · 상대방이 원하는 카드 중 ${matched.offer.length}개`));box.append(heading);
 box.append(create('p','',`내 위시 충족률: ${matched.myRate??'—'}% · 상대 위시 충족률: ${matched.theirRate??'—'}%`));
 if(!matched.need.length&&!matched.offer.length){box.append(create('p','',`양쪽 목록에서 일치한 카드가 없어.`));return}
 for(const [name,list] of [['내가 받을 수 있는 카드',matched.need],['내가 줄 수 있는 카드',matched.offer]]){
  if(!list.length)continue;box.append(create('strong','',`${name} (${list.length})`));
  const ul=create('ul');for(const id of list.slice(0,50)){const r=app.index.byId.get(id);ul.append(create('li','',r?`${r.memberId} ${r.season} ${r.number||r.id}`:id))}
  if(list.length>50)ul.append(create('li','',`외 ${list.length-50}개`));box.append(ul);
 }
 if(matched.mutual)box.append(create('strong','','✦ 서로 교환 가능한 후보가 있어! 실제 양도 가능 여부는 COSMO에서 확인해 줘.'));
}
function bind(){
 document.querySelectorAll('[data-lang]').forEach(btn=>btn.addEventListener('click',()=>setLanguage(btn.dataset.lang)));
 for(const id of ['member','season','klass'])$(id).addEventListener('change',resetResults);
 $('search').addEventListener('input',()=>{clearTimeout(queryTimer);queryTimer=setTimeout(resetResults,180)});
 $('reset').addEventListener('click',()=>{$('search').value='';for(const id of ['member','season','klass'])$(id).value='';resetResults()});
 $('more').addEventListener('click',renderCards);
 $('cards').addEventListener('click',async e=>{const btn=e.target.closest?.('button[data-action]');if(!btn||btn.disabled)return;
  btn.disabled=true;try{const key=btn.dataset.action,id=btn.dataset.id;const pressed=await app.store.toggle(key,id);btn.setAttribute('aria-pressed',String(pressed));updateStats()}catch(err){toast('저장에 실패했어. 다시 시도해 줘.')}finally{btn.disabled=false}
 });
 $('catalogFile').addEventListener('change',async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;try{
  status('카탈로그 분석 중…');const rows=await dataFromFile(file);combineCatalog(rows);let stored=false;try{stored=await app.store.saveCatalog(rows)}catch(e){console.warn('No catalog cache',e)}status(`${fmt(rows.length)}개를 불러왔어. ${stored?'이 기기에 카탈로그도 저장했어.':'카탈로그 임시 사용 중: 다음 접속 때 JSON을 다시 불러와 줘.'}`);
 }catch(err){status(`카탈로그 오류: ${err.message}`)}});
 $('addManual').addEventListener('click',async()=>{const member=$('manualMember').value,season=t0($('manualSeason').value).toUpperCase(),number=t0($('manualNumber').value).toUpperCase();
  if(!member||!season||!number){toast('멤버, 시즌, 번호를 입력해 줘.');return}
  const row=normalizeObjekt({id:`MANUAL:${member}:${season}:${number}`,memberId:member,season,collectionNo:number,klass:'MANUAL'});
  if(await app.store.addManual(row)){app.manual=app.store.state.manual;combineCatalog(app.catalog);toast('등록했어! 보유·위시·교환을 선택해 줘.')}else toast('이미 등록된 카드야.');
 });
 $('makeCode').addEventListener('click',()=>{try{$('myCode').value=makeTradeCode(app.store.state.wish,app.store.state.trade);toast('위시·교환 코드 생성 완료!')}catch(e){toast(e.message)}});
 $('copyCode').addEventListener('click',async()=>{const code=$('myCode').value;if(!code){toast('코드를 먼저 만들어 줘.');return}try{await navigator.clipboard.writeText(code);toast('복사했어!')}catch(e){$('myCode').focus();$('myCode').select();const ok=document.execCommand?.('copy');toast(ok?'복사했어!':'텍스트를 길게 눌러 복사해 줘.')}});
 $('doMatch').addEventListener('click',()=>{try{const other=parseTradeCode($('theirCode').value);renderMatch(matchTrades(app.store.state,other))}catch(e){toast(e.message)}});
 $('backupDownload').addEventListener('click',()=>downloadJson('wav-objekt-lab-backup.json',app.store.backup()));
 $('backupUpload').addEventListener('change',async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;try{
  if(file.size>4*1024*1024)throw Error('백업은 4MB 이하만 불러올 수 있어.');const backup=JSON.parse(await file.text());
  if(!confirm('현재 DATA LAB 기록을 백업 파일의 내용으로 바꿀까? 기존 15.5+ 바인더는 건드리지 않아.'))return;
  await app.store.importBackup(backup);app.manual=app.store.state.manual.map(normalizeObjekt).filter(Boolean);combineCatalog(app.catalog);toast('백업을 복원했어.');
 }catch(err){toast(`백업 오류: ${err.message}`)}});
 $('oldBinderImport').addEventListener('click',async()=>{try{await importPreviousBinder()}catch(err){toast(err.message??'기존 바인더를 읽지 못했어.')}});
}
async function main(){bind();repopulateFilters();try{await app.store.open()}catch(e){console.warn('Store init failed',e)}
 app.manual=app.store.state.manual.map(normalizeObjekt).filter(Boolean);
 $('storageStatus').textContent=app.store.mode==='indexedDB'?'IndexedDB 저장 중':'임시 저장 모드 · 백업 필수';
 updateStats();try{const cached=await app.store.get('catalog-cache');if(Array.isArray(cached)&&cached.length){combineCatalog(cached);status(`기기에 저장한 카탈로그 ${fmt(cached.length)}개를 불러왔어. 새 데이터도 확인할게.`)}}catch(e){console.debug('Cache missing',e)}await loadCatalog();}
main().catch(err=>{console.error('WAV Objekt Lab init',err);status('이 화면을 불러오는 중 오류가 났어. 새로고침하거나 JSON으로 데이터를 불러와 줘.')});
