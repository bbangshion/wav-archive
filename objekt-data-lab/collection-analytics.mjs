/* WAV ARCHIVE · COLLECTION ANALYTICS 4.3
   Read-only reporting layer over the existing Objekt Data Lab index/store.
   No IndexedDB writes, no schema changes, no external network requests.
*/
const LANG={
 ko:{heading:'내 Objekt 컬렉션 한눈에',description:'보유 기록을 멤버·시즌·클래스별로 살펴봐. 기존 바인더와 백업 기록은 그대로 유지돼.',unique:'고유 보유',uniqueDetail:'내가 보유로 표시한 종류',copies:'실제 등록 수량',copiesDetail:'중복 포함 · 직접 기록 기준',extras:'중복 보유',extrasDetail:'한 종류당 첫 장을 제외한 수량',gap:'남은 위시',gapDetail:'위시 중 아직 보유하지 않은 종류',progress:'카탈로그 기준 수집률',progressSub:'카탈로그에 연결된 고유 Objekt {owned}/{total} · {pct}%',tabs:'분석 기준',member:'멤버',season:'시즌',klass:'클래스',sort:'정렬',sortProgress:'수집률 높은순',sortOwned:'보유 많은순',sortName:'이름순',expand:'전체 보기',collapse:'접기',open:'카탈로그에서 보기',none:'집계할 항목이 없어. 카탈로그 데이터를 먼저 불러와 줘.',noMember:'해당 멤버의 카탈로그 데이터가 아직 없어.',notice:'이 분석은 사용자가 표시한 보유·위시 기록과 연결된 카탈로그 기준이야. 공식 소유 인증·시세·발행량 데이터가 아니야.',missing:'카탈로그에 없는 보유 항목 {count}개는 수집률 계산에서 제외했어. 보유 기록은 그대로 유지돼.',download:'분석 CSV 저장',csvDesc:'그룹별 요약 통계만 저장해. Objekt ID·교환 코드는 포함하지 않아.',totalLabel:'카탈로그 기준 고유 보유 수집률',unknown:'미분류',notReady:'카탈로그를 불러오면 그룹별 통계를 볼 수 있어.',wanted:'미보유 위시 {n}',extraCount:'중복 {n}',units:'{owned}/{total}종 · {pct}%',downloaded:'분석 CSV를 저장했어.'},
 en:{heading:'Your collection at a glance',description:'Explore your marked collection by member, season and class. Your binder and backups stay intact.',unique:'Unique owned',uniqueDetail:'Distinct Objekt types marked owned',copies:'Recorded copies',copiesDetail:'Includes duplicates · manually entered',extras:'Extra copies',extrasDetail:'Copies beyond the first per Objekt',gap:'Unowned wishlist',gapDetail:'Wishlisted items not marked owned',progress:'Catalog coverage',progressSub:'Catalog-linked unique Objekt {owned}/{total} · {pct}%',tabs:'Break down by',member:'Member',season:'Season',klass:'Class',sort:'Sort',sortProgress:'Highest coverage',sortOwned:'Most owned',sortName:'Name',expand:'Show all',collapse:'Show less',open:'Open in catalog',none:'No matching data. Load a catalog first.',noMember:'No catalog items for this member yet.',notice:'This report uses your locally marked collection and the connected catalog, not verified ownership, value or supply.',missing:'{count} owned items are missing from the catalog and excluded from coverage. Your records remain saved.',download:'Export analytics CSV',csvDesc:'Only group-level counts are exported; no Objekt IDs or trade codes.',totalLabel:'Unique catalog coverage',unknown:'Unclassified',notReady:'Load the catalog to see group breakdowns.',wanted:'Missing wishlist {n}',extraCount:'Extras {n}',units:'{owned}/{total} types · {pct}%',downloaded:'Analytics CSV downloaded.'},
 ja:{heading:'コレクションをひと目で',description:'メンバー・シーズン・クラスごとに収集記録を確認。既存のバインダーとバックアップは変更しません。',unique:'所持種類数',uniqueDetail:'所持として登録したObjektの種類',copies:'登録枚数',copiesDetail:'重複を含む・手動登録基準',extras:'重複枚数',extrasDetail:'各種類の1枚目を除いた枚数',gap:'未所持ウィッシュ',gapDetail:'ウィッシュ中の未所持種類',progress:'カタログ基準の収集率',progressSub:'カタログ連携済み {owned}/{total}種類 · {pct}%',tabs:'集計対象',member:'メンバー',season:'シーズン',klass:'クラス',sort:'並べ替え',sortProgress:'収集率順',sortOwned:'所持数順',sortName:'名前順',expand:'すべて表示',collapse:'折りたたむ',open:'カタログで表示',none:'データがありません。先にカタログを読み込んでください。',noMember:'このメンバーのデータはまだありません。',notice:'この分析はユーザーが記録した所持・ウィッシュとカタログに基づきます。公式所持証明・相場・発行数ではありません。',missing:'カタログにない所持記録 {count}件は収集率から除外しました。元の記録は保存されています。',download:'分析CSVを保存',csvDesc:'グループ別件数のみ出力し、Objekt ID・交換コードは含みません。',totalLabel:'カタログ基準の種類別収集率',unknown:'未分類',notReady:'カタログを読み込むと内訳が表示されます。',wanted:'未所持ウィッシュ {n}',extraCount:'重複 {n}',units:'{owned}/{total}種類 · {pct}%',downloaded:'分析CSVを保存しました。'}
};
const nformat=(n,l)=>Number(n||0).toLocaleString(l==='ko'?'ko-KR':l==='ja'?'ja-JP':'en-US');
const percent=(numerator,denominator)=>denominator>0?Math.round(1000*numerator/denominator)/10:null;
const escCsv=value=>{let v=String(value??'');if(/^[\s]*[=+@-]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'};
const mk=(tag,klass,text)=>{const e=document.createElement(tag);if(klass)e.className=klass;if(text!==undefined)e.textContent=text;return e};
const toSet=v=>v instanceof Set?v:new Set();

/** Pure data aggregation: O(number of catalog groups + number of marked IDs).
    Every kind of "completion" is explicitly catalog-coverage only. */
export function summarizeCollection(index,store){
 const byId=index?.byId instanceof Map?index.byId:new Map();
 const state=store?.state||{};
 const owned=toSet(state.owned),wish=toSet(state.wish);
 const groups={member:new Map(),season:new Map(),klass:new Map()};
 for(const [kind,map] of [['member',index?.byMember],['season',index?.bySeason],['klass',index?.byClass]]){
  if(!(map instanceof Map))continue;
  for(const [key,ids] of map)groups[kind].set(key,{key,total:ids.size,owned:0,wanted:0,extras:0});
 }
 let linkedOwned=0,allCopies=0,extraCopies=0,outsideCatalog=0;
 for(const id of owned){
  const q=Math.min(99,Math.max(1,Math.trunc(Number(store.getQuantity?.(id)||1))||1));
  allCopies+=q;extraCopies+=q-1;
  const row=byId.get(id);if(!row){outsideCatalog++;continue}
  linkedOwned++;
  for(const [kind,key] of [['member',row.memberId],['season',row.season],['klass',row.klass]]){
   const g=groups[kind].get(key);if(g){g.owned++;g.extras+=q-1}
  }
 }
 let unownedWish=0;
 for(const id of wish){
  if(owned.has(id))continue;
  unownedWish++;
  const row=byId.get(id);if(!row)continue;
  for(const [kind,key] of [['member',row.memberId],['season',row.season],['klass',row.klass]]){
   const g=groups[kind].get(key);if(g)g.wanted++;
  }
 }
 return {total:byId.size,unique:owned.size,linkedOwned,outsideCatalog,allCopies,extraCopies,unownedWish,coverage:percent(linkedOwned,byId.size),groups};
}

export function createCollectionAnalytics({root,onOpen,members=[]}={}){
 if(!root)return {update(){},setLanguage(){}};
 let lang='ko',kind='member',sort='progress',expanded=false,lastIndex=null,lastStore=null,lastSummary=null;
 const find=id=>root.querySelector('#'+id);
 const t=key=>(LANG[lang]||LANG.ko)[key]||key;
 const labelKey=(key)=>{
  if(kind==='member'){
   const m=members.find(x=>x.id===key);
   return m?`${key} ${m.name}`:key;
  }
  return key;
 };
 function labels(){
  root.querySelectorAll('[data-wa-an-i18n]').forEach(el=>{el.textContent=t(el.dataset.waAnI18n)});
  root.querySelectorAll('[data-wa-an-group]').forEach(b=>{
   b.setAttribute('aria-pressed',String(b.dataset.waAnGroup===kind));
  });
  find('waAnExpand').textContent=t(expanded?'collapse':'expand');
 }
 function update(){
  if(!lastIndex||!lastStore)return;
  const v=summarizeCollection(lastIndex,lastStore);lastSummary=v;
  const stats=[['waAnUnique',v.unique],['waAnCopies',v.allCopies],['waAnExtras',v.extraCopies],['waAnGap',v.unownedWish]];
  for(const [id,value] of stats)find(id).textContent=nformat(value,lang);
  const pct=v.coverage===null?'—':`${v.coverage}%`;
  find('waAnPct').textContent=pct;
  find('waAnPctBar').style.width=`${v.coverage??0}%`;
  find('waAnPctBar').setAttribute('aria-valuenow',String(v.coverage??0));
  find('waAnPctLabel').textContent=t('progressSub').replace('{owned}',nformat(v.linkedOwned,lang)).replace('{total}',nformat(v.total,lang)).replace('{pct}',pct);
  const warn=find('waAnWarning');warn.hidden=v.outsideCatalog===0;
  if(v.outsideCatalog)warn.textContent=t('missing').replace('{count}',nformat(v.outsideCatalog,lang));
  const all=[...v.groups[kind].values()];
  all.sort((a,b)=>{
   if(sort==='name')return a.key.localeCompare(b.key,lang,{numeric:true});
   if(sort==='owned')return (b.owned-a.owned)||(b.total-a.total)||a.key.localeCompare(b.key,lang,{numeric:true});
   return ((b.owned/Math.max(1,b.total))-(a.owned/Math.max(1,a.total)))||(b.owned-a.owned)||a.key.localeCompare(b.key,lang,{numeric:true});
  });
  // A constant-size initial render prevents long mobile layouts for large catalogs.
  const visible=expanded?all:all.slice(0,8);
  const frag=document.createDocumentFragment();
  for(const group of visible){
   const p=percent(group.owned,group.total)||0;
   const section=mk('div','wa-an-line');
   const upper=mk('div','wa-an-line-head');
   const label=mk('span','wa-an-name',kind==='member'?labelKey(group.key):group.key);
   const percentLabel=mk('strong','wa-an-value',`${p}%`);
   upper.append(label,percentLabel);
   const line=mk('div','wa-an-progress');line.setAttribute('aria-hidden','true');
   const fill=mk('span','wa-an-fill');fill.style.width=`${p}%`;line.append(fill);
   const details=mk('div','wa-an-line-foot');
   details.append(mk('span','',t('units').replace('{owned}',nformat(group.owned,lang)).replace('{total}',nformat(group.total,lang)).replace('{pct}',String(p))));
   const extras=mk('span','wa-an-secondary',t('wanted').replace('{n}',nformat(group.wanted,lang))+' · '+t('extraCount').replace('{n}',nformat(group.extras,lang)));
   details.append(extras);
   const btn=mk('button','wa-an-open',t('open')+' →');btn.type='button';btn.dataset.waAnOpen=group.key;btn.dataset.waAnKind=kind;
   btn.setAttribute('aria-label',`${label.textContent} · ${t('open')}`);
   section.append(upper,line,details,btn);frag.append(section);
  }
  if(all.length===0)frag.append(mk('p','wa-an-empty',t('notReady')));
  find('waAnList').replaceChildren(frag);
  find('waAnExpand').hidden=all.length<=8;
  find('waAnExpand').textContent=t(expanded?'collapse':'expand');
  find('waAnCount').textContent=`${nformat(all.length,lang)} ${t(kind)} · ${nformat(v.total,lang)} Objekt`;
 }
 function csv(){
  if(!lastSummary)return;
  const rows=[['group_type','group_key','catalog_total','unique_owned','coverage_pct','unowned_wishlist','extra_copies']];
  for(const [k,m] of Object.entries(lastSummary.groups))for(const g of m.values())rows.push([k,g.key,g.total,g.owned,percent(g.owned,g.total)??'',g.wanted,g.extras]);
  const data='\uFEFF'+rows.map(row=>row.map(escCsv).join(',')).join('\r\n')+'\r\n';
  const url=URL.createObjectURL(new Blob([data],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download=`wav-objekt-analytics-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  find('waAnStatus').textContent=t('downloaded');
 }
 root.querySelectorAll('[data-wa-an-group]').forEach(b=>b.addEventListener('click',()=>{
  kind=['member','season','klass'].includes(b.dataset.waAnGroup)?b.dataset.waAnGroup:'member';
  expanded=false;labels();update();
 }));
 find('waAnSort').addEventListener('change',e=>{sort=['progress','owned','name'].includes(e.target.value)?e.target.value:'progress';update()});
 find('waAnExpand').addEventListener('click',()=>{expanded=!expanded;labels();update()});
 find('waAnExport').addEventListener('click',csv);
 find('waAnList').addEventListener('click',event=>{
  const btn=event.target.closest?.('[data-wa-an-open]');if(!btn||!root.contains(btn))return;
  if(typeof onOpen==='function')onOpen(btn.dataset.waAnKind,btn.dataset.waAnOpen);
 });
 labels();
 return {
  update(index,store){lastIndex=index;lastStore=store;update()},
  setLanguage(next){lang=['ko','en','ja'].includes(next)?next:'ko';labels();update()}
 };
}
