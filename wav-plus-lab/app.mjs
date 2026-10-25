/* WAV ARCHIVE 15.5+ Visible Features — isolated new screen, no legacy DOM mutations.
 * Private binder data stays in the browser's IndexedDB; no wallet secrets collected.
 */
import {
  WavDataRegistry,WavObjektStorage,
  drawWavTrendSvg
} from '../wav-core.mjs';

const $ = id => document.getElementById(id);
const safe = value => String(value ?? '').trim();
const MAX_RESULT = 50;
const names = [
 '윤서연','정혜린','이지우','김채연','김유연','김수민','김나경','공유빈','카에데','서다현','코토네','곽연지',
 '니엔','박소현','신위','마유','린','주빈','정하연','박시온','김채원','설린','서아','지연'];
const fallback = names.map((name,index)=>({id:'S'+String(index+1).padStart(2,'0'),name,dimensions:[]}));
const store = new WavObjektStorage({dbName:'wav-archive-personal-v2'});
const loaded = {members:[],manual:[],remote:[],imported:[],registry:null,votes:[],catalogAttempted:false,lang:'ko'};
let toastTimer=0;
const msg={
  ko:{catalogLoading:'카탈로그를 찾고 있어.',catalogMissing:'카탈로그 자동 연결이 확인되지 않았어. 직접 Objekt를 추가하거나 JSON을 불러와 줘.',catalogConnected:'카탈로그 {total}개를 불러왔어. 보유 여부는 직접 체크할 수 있어.',manualAdded:'바인더에 추가했어.',manualInvalid:'멤버, 시즌, 번호를 모두 입력해 줘.',already:'이미 추가된 기록이야.',toggleFail:'기록 저장에 실패했어.',saved:'이 기기에 저장했어.',shareEmpty:'카탈로그가 비어 있어. 항목을 먼저 추가해 줘.',shareCopied:'교환 코드를 복사했어.',shareMismatch:'코드가 일치하지 않아. 양쪽의 카탈로그 목록이 같아야 해.',shareResult:'교환 궁합 {score}% · 내가 원하는 카드 {want}개 · 상대방이 원하는 카드 {theyWant}개',unitNeed:'멤버 1~12명을 선택해 줘.',unitSaved:'유닛 카드가 PNG로 저장됐어.',unitLimited:'유닛은 최대 12명까지 선택할 수 있어.',unitNoData:'공동 활동 이력이 연결되지 않아 점수를 표시하지 않아.',unitScore:'공식 실력 평가가 아닌 공개 활동 기록을 바탕으로 한 팬메이드 지표야.',votesLoaded:'확인한 기록 {count}개를 불러왔어.',votesBad:'date, candidate, como 형식을 확인해 줘.',walletGood:'형식상 올바른 공개 주소야. 계약 미연결로 실제 소유권은 조회하지 않아.',walletBad:'0x로 시작하는 42자리 공개 EVM 주소를 확인해 줘.',fileTooLarge:'파일이 너무 커. 12MB 이하로 나눠서 불러와 줘.',failed:'파일을 불러오지 못했어.',imported:'Objekt {count}개를 불러왔어. 실제 데이터인지는 별도로 확인해 줘.',nothing:'표시할 카드가 없어.',searchResults:'결과 {shown}개 표시',voteNo:'확인된 데이터가 아직 없어.',voteRange:'{candidate} · 확인 기록 {count}개 · 최신 값 {value} COMO',progress:'검증된 계약 주소·이벤트 매핑을 설정하기 전에는 온체인 스캔을 실행하지 않아.'},
  en:{catalogLoading:'Looking for an available catalog.',catalogMissing:'No catalog linked. Add items manually or import JSON.',catalogConnected:'Loaded {total} catalog entries. You can mark your own cards.',manualAdded:'Added to your binder.',manualInvalid:'Choose a member and enter a season and number.',already:'Already in your binder.',toggleFail:'Could not save.',saved:'Saved on this device.',shareEmpty:'Add an item before creating a share code.',shareCopied:'Share code copied.',shareMismatch:'Catalog versions differ. Both sides need the same catalog.',shareResult:'Trade match {score}% · Your wishes {want} · Their wishes {theyWant}',unitNeed:'Select 1–12 members.',unitSaved:'Unit card saved as PNG.',unitLimited:'Up to 12 members per unit.',unitNoData:'No shared activity records available for a score.',unitScore:'A fan-made metric based on recorded activities, not talent.',votesLoaded:'Loaded {count} verified entries.',votesBad:'Expected date, candidate, como data.',walletGood:'Valid public address format. No ownership scan without verified contracts.',walletBad:'Enter a 42-character EVM address starting 0x.',fileTooLarge:'Split the input into files under 12MB.',failed:'Could not open the file.',imported:'Loaded {count} entries. Verify authenticity separately.',nothing:'No items to show.',searchResults:'Showing {shown} results',voteNo:'No verified data available.',voteRange:'{candidate} · {count} observations · latest {value} COMO',progress:'On-chain scanning requires verified contracts and event mappings.'},
  ja:{catalogLoading:'カタログを探しています。',catalogMissing:'カタログ未接続。手動追加かJSONを読み込んでください。',catalogConnected:'カタログ{total}件を読み込みました。所持カードを登録できます。',manualAdded:'バインダーに追加しました。',manualInvalid:'メンバー・シーズン・番号を入力してください。',already:'登録済みです。',toggleFail:'保存できませんでした。',saved:'この端末に保存しました。',shareEmpty:'先にカードを追加してください。',shareCopied:'交換コードをコピーしました。',shareMismatch:'カタログが一致しません。双方で同じデータが必要です。',shareResult:'交換マッチ {score}% · 自分の希望 {want}枚 · 相手の希望 {theyWant}枚',unitNeed:'1〜12名選んでください。',unitSaved:'ユニット画像を保存しました。',unitLimited:'最大12名までです。',unitNoData:'活動記録が不足しているため点数を表示しません。',unitScore:'実力評価ではなく活動履歴ベースのファンメイド指標です。',votesLoaded:'確認済みの記録を{count}件読み込みました。',votesBad:'date、candidate、como形式を確認してください。',walletGood:'公開アドレス形式は有効です。検証済み契約なしでは所持照会しません。',walletBad:'0xで始まる42文字のアドレスを入力してください。',fileTooLarge:'12MB以下に分けてください。',failed:'ファイルを読み込めませんでした。',imported:'Objekt {count}件を読み込みました。実データかは要確認です。',nothing:'表示するカードがありません。',searchResults:'{shown}件表示',voteNo:'確認済みのデータがありません。',voteRange:'{candidate} · {count}件 · 最新 {value} COMO',progress:'検証済み契約情報が必要なため、オンチェーン検索は停止中です。'}
};

/* Only static copy is translated; counters and user-entered values are not overwritten. */
const staticCopy = {
 '가능성을 모으는 곳':['Where possibilities connect','可能性がつながる場所'],
 '내 Objekt, 나만의 유닛, Gravity 기록을 한곳에서.':['Your Objekt, your units, your Gravity records.','Objekt・マイユニット・Gravityの記録をひとつに。'],
 '저장 정보는 이 기기에만':['Stored on this device only','この端末のみに保存'],
 '01 · MY COLLECTION':['01 · MY COLLECTION','01 · MY COLLECTION'],
 '내 손안의 Objekt 바인더':['Your personal Objekt binder','手のひらのObjektバインダー'],
 '내가 가진 카드, 갖고 싶은 카드, 교환 가능한 카드를 직접 관리해.':['Keep track of owned, wanted, and tradable cards.','所持・欲しい・交換できるカードを自分で管理。'],
 '카탈로그':['Catalog','カタログ'],'내 보유':['Owned','所持'],'위시':['Wishlist','欲しい'],'교환 가능':['Trade','交換可能'],
 '내 기록 직접 추가':['Add a personal record','自分の記録を追加'],
 '+ 바인더에 추가':['+ Add to binder','＋ バインダーに追加'],
 '직접 추가한 기록은 보유 인증이 아니며 기기에만 저장돼.':['Manual entries are not ownership verification and stay on this device.','手動登録は所持証明ではなく、この端末のみに保存されます。'],
 'Objekt 찾기':['Find Objekts','Objektを探す'],
 '카탈로그 다시 확인':['Reload catalog','カタログを再確認'],
 '전체 멤버':['All members','全メンバー'],
 '검색 결과':['Search results','検索結果'],
 'JSON 불러오기':['Import JSON','JSONを読み込む'],
 '교환 코드':['Trade code','交換コード'],
 '위시·교환 가능 목록만 공유돼. 두 사람이 같은 카탈로그를 쓰는 경우에만 비교할 수 있어.':['Only wish/trade lists are shared. Both sides need the same catalog.','欲しい・交換可能なリストのみ共有します。比較するには同じカタログが必要です。'],
 '내 교환 코드 만들기':['Create my trade code','交換コードを作る'],
 '복사':['Copy','コピー'],
 '상대방 코드 붙여넣기':['Paste another WAV’s code','相手のコードを貼り付け'],
 '교환 궁합 확인':['Compare trade lists','交換候補を比較'],
 '02 · YOUR DIMENSION':['02 · YOUR DIMENSION','02 · YOUR DIMENSION'],
 '내가 만드는 유닛':['Create your own unit','自分だけのユニット'],
 '마음에 드는 멤버를 골라 가상의 디멘션을 만들어 봐.':['Choose members and build a fan-made Dimension.','好きなメンバーでオリジナルDimensionを作ろう。'],
 '유닛 이름':['Unit name','ユニット名'],
 '멤버 선택':['Choose members','メンバー選択'],
 '조합 점수':['Chemistry index','組み合わせ指数'],
 '함께한 디멘션':['Shared Dimensions','共通Dimension'],
 '평가 기준':['Based on','評価基準'],
 '기록 기준':['Activity records','活動記録'],
 '공식 실력 평가가 아닌, 공개 활동 이력 기반 팬메이드 조합이야.':['This is a fan-made activity-based index, not a talent rating.','公式の実力評価ではなく、活動記録ベースのファンメイド指標です。'],
 '✦ 나의 유닛 PNG로 저장':['✦ Save my unit as PNG','✦ ユニットをPNGで保存'],
 '03 · VERIFIED RECORDS':['03 · VERIFIED RECORDS','03 · VERIFIED RECORDS'],
 'Gravity 기록 살펴보기':['Explore Gravity records','Gravity記録をチェック'],
 '확인된 투표 결과만 그래프로 비교할 수 있어.':['Compare only verified vote data.','確認済みの投票データのみ比較します。'],
 '투표 기록을 자동 생성하거나 예측 득표를 실제 결과로 표시하지 않아. 공식 데이터가 담긴 JSON/CSV를 직접 불러와 줘.':['No invented or predicted vote counts. Import verified official JSON/CSV data.','推定票を公式結果として表示しません。確認済みJSON/CSVを読み込んでください。'],
 '검증한 투표 데이터 불러오기':['Import verified vote data','確認済み投票データを読み込む'],
 '비교할 후보':['Candidate','候補'],
 '데이터 없음':['No data','データなし'],
 '확인된 데이터가 아직 없어.':['No verified data yet.','確認済みデータはまだありません。'],
 '04 · COSMO / CHAIN':['04 · COSMO / CHAIN','04 · COSMO / CHAIN'],
 '공개 지갑 확인':['Check public wallet','公開ウォレットを確認'],
 '지갑 주소만으로 소유 Objekt를 단정하지 않아.':['A wallet address alone does not verify Objekt ownership.','アドレスだけではObjektの所持を確認できません。'],
 '온체인 소유권/투표 기능은 현재 검증된 계약 주소와 이벤트 매핑이 연결되지 않아 자동 조회가 비활성화되어 있어.':['On-chain ownership and vote scans are disabled until contracts and event mappings are verified.','確認済みの契約・イベント情報が未接続のため、自動検索は停止中です。'],
 '지갑 주소 형식 검사':['Wallet address format','アドレス形式を確認'],
 '주소 확인':['Check address','アドレスを確認'],
 '개인 키나 시드 문구는 절대 입력하지 마. 이 화면에서 입력한 주소는 저장하거나 서버로 보내지 않아.':['Never enter a private key or seed phrase. The address entered here is not saved or sent to a server.','秘密鍵やシードフレーズは入力しないでください。入力したアドレスは保存・送信されません。'],
 '연결 준비 상태':['Connection status','接続状態'],
 '검증된 계약 정보 없음 · 수동 바인더와 유닛 스튜디오는 바로 사용 가능':['Contracts not yet verified · Binder and Unit Studio work now','契約情報は未確認 · バインダーとユニットは利用可能'],
 '보유':['Owned','所持'],'교환':['Trade','交換'],'삭제':['Delete','削除'],
};
const placeholderCopy={
 '시즌 (예: Atom01)':['Season (e.g. Atom01)','シーズン（例：Atom01）'],
 '번호 (예: 101Z)':['Number (e.g. 101Z)','番号（例：101Z）'],
 '번호·멤버·시즌 검색 (2글자 이상)':['Search number, member, season (2+ characters)','番号・メンバー・シーズンを検索（2文字〜）'],
 'WAV2. ...':['WAV2. ...','WAV2. ...'],
 '유닛 이름을 적어줘':['Name your unit','ユニット名を入力'],
 '0x로 시작하는 공개 지갑 주소':['Public wallet address starting with 0x','0xで始まる公開ウォレットアドレス']
};
const baseText=new Map();const basePlaceholder=new Map();
function initializeTranslations(){
 const tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 while(tw.nextNode()){
  const node=tw.currentNode;const raw=node.nodeValue?.trim();
  if(raw && staticCopy[raw])baseText.set(node,{raw,left:node.nodeValue.slice(0,node.nodeValue.indexOf(raw)),right:node.nodeValue.slice(node.nodeValue.indexOf(raw)+raw.length)});
 }
 document.querySelectorAll('[placeholder]').forEach(el=>{
   if(placeholderCopy[el.placeholder])basePlaceholder.set(el,el.placeholder);
 });
}
function setLanguage(lang){
 loaded.lang=['ko','en','ja'].includes(lang)?lang:'ko';document.documentElement.lang=loaded.lang;
 const index={en:0,ja:1}[loaded.lang];
 for(const [node,{raw,left,right}] of baseText)if(node.isConnected)node.nodeValue=left+(index===undefined?raw:staticCopy[raw][index])+right;
 for(const [node,raw] of basePlaceholder)node.placeholder=index===undefined?raw:placeholderCopy[raw][index];
 document.querySelectorAll('[data-lang]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.lang===loaded.lang)));
 refreshBinder();if(loaded.votes.length)updateGravityChart();
}

function t(key,params={}){return (msg[loaded.lang]?.[key]??msg.ko[key]??key).replace(/\{(\w+)\}/g,(_,k)=>safe(params[k]));}
function toast(text){const el=$('toast');if(!el)return;el.textContent=text;el.classList.add('shown');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('shown'),2700);}
function readMembers(){
 try{const data=window.parent?.__WA11_LOCALE_DATA__?.members;
  if(data && typeof data==='object')return fallback.map(f=>{
    const m=data[f.id]??{};
    return {...f,name:safe(m.name?.ko??m.name??f.name),dimensions:Array.isArray(m.dimensions)?m.dimensions:[],
      birth:/^\d{4}-\d{2}-\d{2}$/.test(safe(m.birth))?m.birth:null};
  });
 }catch(_){/* standalone use fallback */}
 return fallback;
}
function setStatus(text){$('connection').textContent=text;}
function prepMembers(){
 loaded.members=readMembers();
 const memberSelect=$('manualMember'),objektSelect=$('objektMember');
 for(const m of loaded.members){
  const opt=document.createElement('option');opt.value=m.id;opt.textContent=`${m.id} ${m.name}`;memberSelect.append(opt);
  const option=document.createElement('option');option.value=m.id;option.textContent=`${m.id} ${m.name}`;objektSelect.append(option);
 }

}
function unwrap(json){
 if(Array.isArray(json))return json;
 if(json && typeof json==='object')for(const key of ['rows','items','data','collections','objekts','result']){
   const x=json[key];if(Array.isArray(x))return x;
   if(x && typeof x==='object' && Array.isArray(x.items))return x.items;
 }
 return [];
}
function normalize(row){
 if(!row||typeof row!=='object')return null;
 const r={...(row.metadata && typeof row.metadata==='object'?row.metadata:{}),...row};
 let memberId=safe(r.memberId??r.member_id??r.memberS??r.memberNo??r.member);
 let full=loaded.members.find(m=>m.id.toLowerCase()===memberId.toLowerCase()||m.name===memberId);
 if(!full){const memberName=safe(r.memberKo??r.member_name??r.name);full=loaded.members.find(m=>m.name===memberName);}
 if(full)memberId=full.id;
 const collectionNo=safe(r.collectionNo??r.collection_number??r.number??r.no??r.collection ?? '');
 const season=safe(r.season??r.seasonName??'');
 let id=safe(r.id??r.objektId??r.objekt_id??r.collectionId??'');
 if(!id && memberId && season && collectionNo)id=`${memberId}:${season}:${safe(r.class??r.klass)}:${collectionNo}`;
 if(!id)return null;
 return {id,memberId,memberKo:full?.name??safe(r.memberKo??r.name??memberId),season,
  collectionNo,class:safe(r.class??r.klass??''),thumbnailUrl:safe(r.thumbnailUrl??r.frontImageUrl??r.imageUrl??''),
  imageUrl:safe(r.imageUrl??r.frontImageUrl??'')};
}
function buildRegistry(){
 const unique=new Map();
 for(const r of [...loaded.remote,...loaded.imported,...loaded.manual])if(r?.id)unique.set(String(r.id),r);
 loaded.registry=new WavDataRegistry([...unique.values()],{members:loaded.members});
 setStatus(`${unique.size.toLocaleString()} Objekt · Local Binder`);
 refreshBinder();
}
function selectedRecords(){
 const reg=loaded.registry;
 if(!reg)return [];
 const q=safe($('objektQuery').value),member=safe($('objektMember').value);
 return reg.select({member,query:q,limit:MAX_RESULT});
}
function button(label,pressed,title){const b=document.createElement('button');b.type='button';b.textContent=label;b.title=title;b.setAttribute('aria-pressed',String(pressed));if(pressed)b.className='pressed';return b;}
function showRecords(){
 const host=$('objektResults');host.replaceChildren();
 const rows=selectedRecords();
 $('objektResultsStatus').textContent=t('searchResults',{shown:rows.length});
 if(!rows.length){const p=document.createElement('p');p.className='hint';p.textContent=t('nothing');host.append(p);return;}
 const frag=document.createDocumentFragment();
 for(const row of rows){
  const outer=document.createElement('div');outer.className='record';
  const info=document.createElement('div');info.className='recordinfo';
  const title=document.createElement('strong');title.textContent=`${row.memberKo??row.memberId??'Objekt'} · ${row.collectionNo??row.id}`;
  const meta=document.createElement('small');meta.textContent=[row.memberId,row.season,row.class].filter(Boolean).join(' · ');
  info.append(title,meta);
  const actions=document.createElement('div');actions.className='recordbuttons';
  for(const [group,label,title] of [['owned','보유','내가 가진 Objekt'],['wish','위시','갖고 싶은 Objekt'],['trade','교환','교환 가능한 Objekt']]){
   const b=button(label,store[group].has(row.id),title);
   b.addEventListener('click',async()=>{
    b.disabled=true;
    try{await store.toggle(group,row.id);refreshBinder();}
    catch(e){toast(t('toggleFail'));console.warn(e)}finally{b.disabled=false}
   });actions.append(b);
  }
  if(loaded.manual.some(r=>r.id===row.id)){
   const del=button('삭제',false,'직접 추가한 기록 삭제');del.className='remove';
   del.addEventListener('click',async()=>{
     loaded.manual=loaded.manual.filter(r=>r.id!==row.id);
     await store.write('wavplus-manual',loaded.manual);buildRegistry();
   });actions.append(del);
  }
  outer.append(info,actions);frag.append(outer);
 }
 host.append(frag);
}
function refreshBinder(){
 $('countCatalog').textContent=loaded.registry?.rows.size.toLocaleString()??'0';
 $('countOwned').textContent=store.owned.size.toLocaleString();
 $('countWish').textContent=store.wish.size.toLocaleString();
 $('countTrade').textContent=store.trade.size.toLocaleString();
 showRecords();
}
async function addManual(){
 const member=$('manualMember').value,season=safe($('manualSeason').value),number=safe($('manualNumber').value);
 if(!member || !season || !number){toast(t('manualInvalid'));return;}
 const id=`MANUAL:${member}:${season.toUpperCase()}:${number.toUpperCase()}`;
 if(loaded.manual.some(r=>r.id===id)){toast(t('already'));return;}
 const m=loaded.members.find(x=>x.id===member);
 loaded.manual.push({id,memberId:member,memberKo:m?.name??member,season,collectionNo:number,class:'MANUAL'});
 try{await store.write('wavplus-manual',loaded.manual);buildRegistry();
   $('objektQuery').value='';$('objektMember').value=member;toast(t('manualAdded'));
 }catch(e){toast(t('toggleFail'));console.warn(e)}
}
async function getJsonFromUrl(url){
 const ctl=new AbortController();const timer=setTimeout(()=>ctl.abort(),10000);
 try{const res=await fetch(url,{signal:ctl.signal,cache:'default'});
  if(!res.ok)return [];
  const len=Number(res.headers.get('content-length')||0);if(len>12*1024*1024)return [];
  const raw=await res.text();if(raw.length>12*1024*1024)return [];
  return unwrap(JSON.parse(raw)).map(normalize).filter(Boolean);
 }catch(_){return []}finally{clearTimeout(timer)}
}
async function autoCatalog(){
 if(loaded.catalogAttempted)return;
 loaded.catalogAttempted=true;$('catalogNotice').textContent=t('catalogLoading');
 // Read only already-published local snapshots; do not invent RPC/API routes.
 const candidates=['../objekt-collection/data/objekt-top.json','../objekt-collection/data/apollo.json',
  '../objekt-collection/data/objekts.json','../objekt-collection/objekts.json'];
 for(const path of candidates){const found=await getJsonFromUrl(path);if(found.length)loaded.remote.push(...found)}
 buildRegistry();
 const n=loaded.remote.length;
 $('catalogNotice').textContent=n?t('catalogConnected',{total:n.toLocaleString()}):t('catalogMissing');
}
async function importCatalogFile(event){
 const file=event.target.files?.[0];if(!file)return;
 event.target.value='';if(file.size>12*1024*1024){toast(t('fileTooLarge'));return;}
 try{const rows=unwrap(JSON.parse(await file.text())).map(normalize).filter(Boolean);
  if(!rows.length)throw Error('No matching catalog records');
  loaded.imported=rows;
  // Avoid surprising large IndexedDB writes on low-memory WebViews. Session import for big lists.
  if(file.size < 2*1024*1024)await store.write('wavplus-imported',rows);
  buildRegistry();toast(t('imported',{count:rows.length.toLocaleString()}));
 }catch(e){console.warn(e);toast(t('failed'))}
}
function setupBinder(){
 $('manualAdd').addEventListener('click',addManual);
 $('objektQuery').addEventListener('input',showRecords,{passive:true});
 $('objektMember').addEventListener('change',showRecords);
 $('catalogUpload').addEventListener('change',importCatalogFile);
 $('reloadCatalog').addEventListener('click',async()=>{loaded.catalogAttempted=false;loaded.remote=[];await autoCatalog()});
 $('shareGenerate').addEventListener('click',()=>{
  try{if(!loaded.registry?.rows.size)throw Error('empty');
   $('shareOutput').value=store.generateShareableString(loaded.registry);
  }catch(e){toast(t('shareEmpty'))}
 });
 $('shareCopy').addEventListener('click',async()=>{
  const value=$('shareOutput').value;if(!value)return;
  try{await navigator.clipboard.writeText(value);toast(t('shareCopied'))}
  catch(_){$('shareOutput').focus();$('shareOutput').select();toast('코드를 선택했어. 직접 복사해 줘.')}
 });
 $('shareCheck').addEventListener('click',()=>{
  try{const other=WavObjektStorage.decodeShareableString($('sharePartner').value.trim(),loaded.registry);
   const result=store.matchTrade(other);
   $('shareResult').textContent=t('shareResult',{score:result.score,want:result.myMatches.length,theyWant:result.theirMatches.length});
  }catch(e){$('shareResult').textContent=t('shareMismatch');console.warn(e)}
 });
}
function parseCSV(text){
 const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x.trim());if(lines.length<2)return [];
 const parseLine=(s)=>{const vals=[];let v='',quoted=false;
  for(let i=0;i<s.length;i++){const c=s[i];if(c==='"'){
    if(quoted&&s[i+1]==='"'){v+='"';i++}else quoted=!quoted;
   }else if(c===','&&!quoted){vals.push(v.trim());v='';}else v+=c;
  }vals.push(v.trim());return vals;};
 const heads=parseLine(lines[0]).map(x=>x.toLowerCase());
 return lines.slice(1).map(line=>{const cells=parseLine(line);return Object.fromEntries(heads.map((h,i)=>[h,cells[i]??'']))});
}
function normalizeVotes(rows){
 const out=[];
 for(const row of rows.slice(0,20000)){
  const date=safe(row.date??row.day??row.timestamp).slice(0,10);
  const candidate=safe(row.candidate??row.member??row.choice).slice(0,60);
  const como=Number(row.como??row.votes??row.value);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!candidate||!Number.isFinite(como)||como<0)continue;
  out.push({date,candidate,como});
 }
 return out.sort((a,b)=>a.date.localeCompare(b.date));
}
function showVotes(){
 const names=[...new Set(loaded.votes.map(x=>x.candidate))];
 const select=$('gravityCandidate'),prev=select.value;select.replaceChildren();
 if(!names.length){const opt=document.createElement('option');opt.value='';opt.textContent=t('voteNo');select.append(opt);
  drawWavTrendSvg($('gravityChart'),[],{label:'GRAVITY COMO'});$('gravityInfo').textContent=t('voteNo');return;}
 for(const name of names){const option=document.createElement('option');option.value=name;option.textContent=name;select.append(option)}
 select.value=names.includes(prev)?prev:names[0];updateGravityChart();
}
function updateGravityChart(){
 const candidate=$('gravityCandidate').value;
 const values=loaded.votes.filter(r=>r.candidate===candidate);
 drawWavTrendSvg($('gravityChart'),values.map(x=>({value:x.como})),{label:`${candidate} · COMO`});
 $('gravityInfo').textContent=values.length?t('voteRange',{candidate,count:values.length,value:values.at(-1).como.toLocaleString()}):t('voteNo');
}
function setupGravity(){
 $('gravityCandidate').addEventListener('change',updateGravityChart);
 $('gravityUpload').addEventListener('change',async e=>{
  const f=e.target.files?.[0];if(!f)return;e.target.value='';
  if(f.size>4*1024*1024){toast(t('fileTooLarge'));return;}
  try{const raw=await f.text(),records=f.name.toLowerCase().endsWith('.csv')?parseCSV(raw):unwrap(JSON.parse(raw));
   const rows=normalizeVotes(records);if(!rows.length)throw Error('invalid');
   loaded.votes=rows;showVotes();toast(t('votesLoaded',{count:rows.length}));
  }catch(err){console.warn(err);toast(t('votesBad'))}
 });
 showVotes();
}
function setupWallet(){
 $('walletCheck').addEventListener('click',()=>{
  const addr=safe($('walletAddress').value);
  $('walletResult').textContent=/^0x[0-9A-Fa-f]{40}$/.test(addr)?t('walletGood'):t('walletBad');
 });
 $('contractStatus').textContent=t('progress');
}
function setupTabs(){
 document.querySelectorAll('.tabs button[data-tab]').forEach(b=>{
  b.addEventListener('click',()=>{
   document.querySelectorAll('.tabs button[data-tab]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-selected',String(x===b))});
   document.querySelectorAll('main > section.pane').forEach(s=>s.hidden=s.id!==b.dataset.tab);
   if(b.dataset.tab==='binder')autoCatalog().catch(e=>console.warn(e));
  });
 });
}
async function init(){
 try{
  initializeTranslations();
  document.querySelectorAll('[data-lang]').forEach(el=>el.addEventListener('click',()=>setLanguage(el.dataset.lang)));
  prepMembers();setupTabs();setupBinder();setupGravity();setupWallet();
  await store.load();
  loaded.manual=(await store.read('wavplus-manual',[])).map(normalize).filter(Boolean);
  loaded.imported=(await store.read('wavplus-imported',[])).map(normalize).filter(Boolean);
  buildRegistry();
  let lang='ko';try{lang=window.parent.document.documentElement.dataset.waLocale||window.parent.document.documentElement.lang||'ko'}catch(_){}
  setLanguage(['ko','en','ja'].includes(lang)?lang:'ko');
  await autoCatalog();
 }catch(e){console.error('WAV PLUS LAB initialization:',e);toast('기능을 불러오지 못했어. 페이지를 다시 열어 줘.');}
}
init();
