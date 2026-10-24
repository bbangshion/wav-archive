/** IndexedDB, versioned peer-to-peer share codes; no user account or server. */
const request = req => new Promise((resolve,reject)=>{
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
});
const transactionEnd = tx => new Promise((resolve,reject)=>{
  tx.oncomplete=()=>resolve();tx.onabort=()=>reject(tx.error||new Error('IndexedDB aborted'));
  tx.onerror=()=>{}; // onabort carries the transaction error
});
const toBase64Url = bytes => {
  let binary=''; // share payloads are usually small; chunk for large collections
  for(let i=0;i<bytes.length;i+=8192) binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
};
const fromBase64Url = value => {
  if(!/^[A-Za-z0-9_-]+$/.test(value)||value.length>150000) throw new Error('잘못되었거나 지나치게 긴 공유 코드');
  const str=atob(value.replace(/-/g,'+').replace(/_/g,'/'));
  return Uint8Array.from(str, ch=>ch.charCodeAt(0));
};
/** FNV-1a over UTF-8 ordered catalog IDs. Not a cryptographic signature. */
export function fingerprint(ids) {
  let hash=0x811c9dc5;
  const enc=new TextEncoder();
  for(const id of ids){
    for(const byte of enc.encode(id+'\n')){
      hash=Math.imul(hash^byte,0x01000193)>>>0;
    }
  }
  return hash>>>0;
}
function writeVar(n,out){
  if(!Number.isSafeInteger(n)||n<0) throw new Error('Invalid index');
  while(n>=128){out.push((n%128)|128);n=Math.floor(n/128);}out.push(n);
}
function readVar(bytes,at){
  let value=0,scale=1;
  for(let j=0;j<6;j++){
    if(at.i>=bytes.length) throw new Error('Truncated share code');
    const b=bytes[at.i++]; value+=(b&127)*scale;
    if(!(b&128)){
      if(!Number.isSafeInteger(value)) throw new Error('Share integer overflow');
      return value;
    }
    scale*=128;
  }
  throw new Error('Overlong share integer');
}
function packSet(ids,map,out){
  const sorted=[...ids].map(id=>map.get(id)).filter(v=>v!==undefined).sort((a,b)=>a-b);
  writeVar(sorted.length,out);let prev=-1;
  for(const idx of sorted){writeVar(idx-prev,out);prev=idx;}
}
function unpackSet(bytes,at,master){
  const count=readVar(bytes,at); if(count>master.length) throw new Error('Invalid set length');
  let prev=-1;const out=new Set();
  for(let i=0;i<count;i++){
    const d=readVar(bytes,at),idx=prev+d;
    if(d<=0||idx>=master.length) throw new Error('Invalid catalog reference');
    out.add(master[idx]);prev=idx;
  }
  return out;
}
function encodeCode(master,map,wishlist,trade){
  const bytes=[87,65,86,1]; // ASCII WAV, protocol version 1
  const fp=fingerprint(master);
  for(let s=0;s<32;s+=8)bytes.push((fp>>>s)&255);
  packSet(wishlist,map,bytes);packSet(trade,map,bytes);
  return `WAV1.${toBase64Url(Uint8Array.from(bytes))}`;
}
function decodeCode(code,master){
  if(!code.startsWith('WAV1.')) throw new Error('공유 코드 버전이 맞지 않습니다');
  const bytes=fromBase64Url(code.slice(5));
  if(bytes.length<8||bytes[0]!==87||bytes[1]!==65||bytes[2]!==86||bytes[3]!==1)throw new Error('Invalid header');
  const hash= (bytes[4] | bytes[5]<<8 | bytes[6]<<16 | bytes[7]<<24)>>>0;
  if(hash!==fingerprint(master))throw new Error('카탈로그 버전이 달라서 매칭할 수 없습니다. 동일한 데이터 버전에서 다시 내보내세요.');
  const at={i:8};const wishlist=unpackSet(bytes,at,master),trade=unpackSet(bytes,at,master);
  if(at.i!==bytes.length)throw new Error('Invalid trailing data');
  return {wishlist,trade};
}
const catalogKey = x => String(x?.id??'').trim();
/** Each row must contain {id, memberId, season}; id must be stable between snapshots.
 * The IDB stores flags only, NOT 10MB of images/metadata.
 */
export class WavObjektStorage {
  constructor({dbName='wav-archive-binder-v1'}={}){
    this.dbName=dbName;this.db=null;this.items=new Map();this.master=[];
    this.index=new Map();this.flags=new Map();this.queue=Promise.resolve();this.ready=false;
    this.memberIndex=new Map();this.seasonIndex=new Map();
  }
  async init(catalog) {
    if(!Array.isArray(catalog))throw new TypeError('Catalog must be an array');
    if(this.ready)throw new Error('Storage already initialized');
    for(const row of catalog){
      const id=catalogKey(row);
      if(!id||!row.memberId||!row.season||this.items.has(id))continue;
      const clean={id,memberId:String(row.memberId),season:String(row.season)};
      this.items.set(id,clean);
      for(const [map,key] of [[this.memberIndex,clean.memberId],[this.seasonIndex,clean.season]]){
        if(!map.has(key))map.set(key,new Set()); map.get(key).add(id);
      }
    }
    this.master=[...this.items.keys()].sort();this.master.forEach((id,i)=>this.index.set(id,i));
    if(typeof indexedDB==='undefined')throw new Error('이 브라우저에서는 IndexedDB를 사용할 수 없습니다.');
    this.db=await new Promise((resolve,reject)=>{
      const req=indexedDB.open(this.dbName,1);
      req.onupgradeneeded=()=>{
        const store=req.result.createObjectStore('flags',{keyPath:'id'});
        store.createIndex('owned','owned');
      };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error);
      req.onblocked=()=>reject(new Error('다른 탭이 DB 업그레이드를 막고 있습니다.'));
    });
    this.db.onversionchange=()=>{this.db.close();this.ready=false;};
    this.flags.clear();
    const tx=this.db.transaction('flags','readonly');
    const completion=transactionEnd(tx);
    const rows=await request(tx.objectStore('flags').getAll());
    await completion;
    for(const record of rows){
      if(this.items.has(record.id)) this.flags.set(record.id,{owned:!!record.owned,wish:!!record.wish,trade:!!record.trade});
    }
    this.ready=true;return this;
  }
  checkId(id){if(!this.ready)throw new Error('Binder not initialized');if(!this.items.has(id))throw new Error(`Unknown Objekt ID: ${id}`);}
  getStatus(id){this.checkId(id);return {...(this.flags.get(id)||{owned:false,wish:false,trade:false})};}
  /** Serialize fast consecutive taps; commit first, then update memory. */
  change(id,key){
    const task=async()=>{
      this.checkId(id);
      const old=this.getStatus(id);
      const next={...old,[key]:!old[key]};
      if(key==='owned' && next.owned)next.wish=false;
      if(key==='owned' && !next.owned)next.trade=false;
      if(key==='trade' && next.trade){next.owned=true;next.wish=false;}
      if(key==='wish' && next.wish){next.owned=false;next.trade=false;}
      const tx=this.db.transaction('flags','readwrite');
      const done=transactionEnd(tx);
      tx.objectStore('flags').put({id,...next,updatedAt:Date.now()});
      await done;
      this.flags.set(id,next);
      return {...next};
    };
    const promise=this.queue.then(task);this.queue=promise.catch(()=>{});
    return promise;
  }
  toggleOwned(id){return this.change(id,'owned');}
  toggleWish(id){return this.change(id,'wish');}
  toggleTrade(id){return this.change(id,'trade');}
  /** O(k) for the filtered catalog subset; no IndexedDB scan per UI rerender. */
  getCompletionRate({memberId=null,seasonId=null}={}){
    if(!this.ready)throw new Error('Binder not initialized');
    let ids;
    if(memberId&&seasonId){
      const a=this.memberIndex.get(memberId)||new Set(),b=this.seasonIndex.get(seasonId)||new Set();
      const small=a.size<b.size?a:b,large=small===a?b:a;
      ids=[...small].filter(id=>large.has(id));
    } else if(memberId) ids=this.memberIndex.get(memberId)||new Set();
    else if(seasonId) ids=this.seasonIndex.get(seasonId)||new Set();
    else ids=this.master;
    let owned=0,wishlist=0,trade=0;
    for(const id of ids){const f=this.flags.get(id);if(f?.owned)owned++;if(f?.wish)wishlist++;if(f?.trade)trade++;}
    return {owned,total:ids.length,wishlist,trade,percent:ids.length?Math.round(10000*owned/ids.length)/100:0};
  }
  generateShareableString(){
    if(!this.ready)throw new Error('Binder not initialized');
    const wishlist=[],trade=[];
    for(const [id,f]of this.flags){if(f.wish)wishlist.push(id);if(f.trade)trade.push(id);}
    return encodeCode(this.master,this.index,new Set(wishlist),new Set(trade));
  }
  parseShareableString(code){return decodeCode(String(code).trim(),this.master);}
  /** Score = reciprocal fulfillable wish coverage, weighted equally per side.
   * No online lookup, and offers are only cards explicitly marked TRADE.
   */
  matchPeer(code){
    const theirs=this.parseShareableString(code);
    const myWish=new Set(),myTrade=new Set();
    for(const[id,f]of this.flags){if(f.wish)myWish.add(id);if(f.trade)myTrade.add(id);}
    const iGive=[...myTrade].filter(id=>theirs.wishlist.has(id));
    const iGet=[...theirs.trade].filter(id=>myWish.has(id));
    const mine=myWish.size?iGet.length/myWish.size:0;
    const peer=theirs.wishlist.size?iGive.length/theirs.wishlist.size:0;
    return {score:Math.round(100*(mine+peer)/2),iCanGive:iGive,iCanReceive:iGet,
      myWishCoverage:mine,peerWishCoverage:peer,reciprocalPossible:iGive.length>0&&iGet.length>0};
  }
  close(){this.db?.close();this.ready=false;}
}
