/* WAV ARCHIVE / Objekt Data Lab 16 — pure data and trade functions.
 * No network requests, no global mutations, no invented supply or COMO values.
 */
export const NAMES=['윤서연','정혜린','이지우','김채연','김유연','김수민','김나경','공유빈','카에데','서다현','코토네','곽연지','니엔','박소현','신위','마유','린','주빈','정하연','박시온','김채원','설린','서아','지연'];
export const MEMBERS=NAMES.map((name,i)=>({id:`S${String(i+1).padStart(2,'0')}`,name}));
const nameToId=new Map(MEMBERS.map(m=>[m.name,m.id]));
const text=x=>String(x??'').trim();
const fold=x=>text(x).toLowerCase().replace(/\s+/g,'');
const unique=arr=>[...new Set(arr)];
export function unpackCatalog(data){
 if(Array.isArray(data))return data;
 if(data&&typeof data==='object'){
  for(const k of ['rows','items','data','objekts','collections','result','catalog']){
   const a=data[k]; if(Array.isArray(a))return a;
   if(a&&Array.isArray(a.items))return a.items;
  }
 }
 return [];
}
export function normalizeObjekt(raw){
 if(!raw||typeof raw!=='object')return null;
 const m={...(typeof raw.metadata==='object'&&raw.metadata!==null?raw.metadata:{}),...raw};
 const memberField=m.memberId??m.member_id??m.memberS??m.memberNo??m.member??m.member_code;
 let memberId=text((memberField&&typeof memberField==='object')?(memberField.id??memberField.number??memberField.code??memberField.nameKo??memberField.name):memberField).toUpperCase();
 if(/^S?\d{1,2}$/.test(memberId))memberId=`S${String(Number(memberId.replace('S',''))).padStart(2,'0')}`;
 if(!/^S(0[1-9]|1\d|2[0-4])$/.test(memberId)){
  memberId=nameToId.get(text(m.memberKo??m.member_name??m.name??m.member))??nameToId.get(memberId)??'';
 }
 if(!memberId && typeof m.id==='string'){const match=m.id.match(/(?:^|[:_-])(S(?:0[1-9]|1\d|2[0-4]))(?:[:_-]|$)/i);if(match)memberId=match[1].toUpperCase()}
 const season=text(m.season??m.seasonName??m.season_name).toUpperCase().replace(/\s+/g,'');
 const klass=text(m.class??m.klass??m.className??m.objektClass).toUpperCase();
 const number=text(m.collectionNo??m.collection_number??m.number??m.no??m.collection??m.collectionNumber).toUpperCase();
 const sourceId=text(m.id??m.objektId??m.objekt_id??m.collectionId??m.collection_id);
 // Prefer catalog's provided unique identity. Never collapse distinct print serials by guesswork.
 const id=sourceId||((memberId&&season&&number)?`${memberId}:${season}:${klass}:${number}`:'');
 if(!id)return null;
 const tryImage=text(m.thumbnailUrl??m.frontImageUrl??m.imageUrl??m.media?.frontUrl??m.thumbnail??m.image??'');
 let image='';
 try{if(tryImage){const u=new URL(tryImage,location.href);if(['https:','http:'].includes(u.protocol))image=u.href;}}catch(_){/* empty image */}
 const supply=Number(m.mintedSupply??m.verifiedSupply);
 const supplied=Number.isFinite(supply)&&supply>0&&m.supplyVerified===true?supply:null;
 return {id,memberId,memberName:MEMBERS.find(x=>x.id===memberId)?.name??'',season,klass,number,image,verifiedSupply:supplied,source:text(m.source??'')};
}
export class WavObjektIndex{
 constructor(rows=[]){this.byId=new Map();this.byMember=new Map();this.bySeason=new Map();this.byClass=new Map();this.total=0;this.load(rows)}
 load(rows){
  this.byId.clear();this.byMember.clear();this.bySeason.clear();this.byClass.clear();
  for(const raw of rows){const r=raw&&raw.memberId!==undefined&&raw.klass!==undefined?raw:normalizeObjekt(raw);if(!r||this.byId.has(r.id))continue;
   this.byId.set(r.id,r);
   for(const [key,map] of [[r.memberId,this.byMember],[r.season,this.bySeason],[r.klass,this.byClass]]){
    if(!key)continue;if(!map.has(key))map.set(key,new Set());map.get(key).add(r.id);
   }
  }
  this.total=this.byId.size;
 }
 select({member='',season='',klass='',query='',offset=0,limit=24}={}){
  const sets=[];
  if(member)sets.push(this.byMember.get(member)??new Set());
  if(season)sets.push(this.bySeason.get(season)??new Set());
  if(klass)sets.push(this.byClass.get(klass)??new Set());
  sets.sort((a,b)=>a.size-b.size);
  const src=sets.length?sets[0]:this.byId.keys();
  const search=fold(query);const filtered=[];let count=0;
  for(const id of src){
   if(sets.length>1&&!sets.slice(1).every(s=>s.has(id)))continue;
   const r=this.byId.get(id);if(!r)continue;
   if(search && !fold([r.id,r.memberId,r.memberName,r.season,r.klass,r.number].join(' ')).includes(search))continue;
   count++;if(count>offset&&filtered.length<limit)filtered.push(r);
  }
  return {rows:filtered,total:count};
 }
 completion(group,ownedIds){
  const ids=group?.member?this.byMember.get(group.member):group?.season?this.bySeason.get(group.season):this.byId.keys();
  let have=0,total=0;for(const id of ids??[]){total++;if(ownedIds.has(id))have++}
  return {owned:have,total,percent:total?Math.round((have/total)*1000)/10:0};
 }
}
// v1 code shares only wish and trade IDs. No name, wallet, owned list or device ID.
function toBase64Url(bytes){let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function fromBase64Url(s){if(!/^[A-Za-z0-9_-]{1,250000}$/.test(s))throw Error('Invalid share code');const b=atob(s.replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(b,c=>c.charCodeAt(0));}
export function makeTradeCode(wish,trade){
 const clean=a=>unique([...a].map(text).filter(x=>x&&x.length<=180)).sort().slice(0,6000);
 const payload=JSON.stringify({v:1,w:clean(wish),t:clean(trade)});
 if(payload.length>150000)throw Error('교환 목록이 너무 커. 목록을 나눠 줘.');
 return 'WAVTRADE1.'+toBase64Url(new TextEncoder().encode(payload));
}
export function parseTradeCode(input){
 const s=text(input);if(!s.startsWith('WAVTRADE1.'))throw Error('WAVTRADE1 코드가 아니야.');
 const raw=fromBase64Url(s.slice('WAVTRADE1.'.length));
 if(raw.byteLength>180000)throw Error('교환 코드 크기 제한을 초과했어.');
 const v=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(raw));
 if(v?.v!==1||!Array.isArray(v.w)||!Array.isArray(v.t))throw Error('교환 코드 형식을 확인해 줘.');
 const validate=x=>x.length<=6000&&x.every(y=>typeof y==='string'&&y.length>0&&y.length<=180);
 if(!validate(v.w)||!validate(v.t))throw Error('교환 코드에 잘못된 항목이 있어.');
 return {wish:new Set(v.w),trade:new Set(v.t)};
}
export function matchTrades(my,other){
 const need=[...my.wish].filter(id=>other.trade.has(id));
 const offer=[...other.wish].filter(id=>my.trade.has(id));
 const myRate=my.wish.size?Math.round(100*need.length/my.wish.size):null;
 const theirRate=other.wish.size?Math.round(100*offer.length/other.wish.size):null;
 return {need,offer,myRate,theirRate,mutual:need.length>0&&offer.length>0};
}
