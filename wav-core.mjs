/* WAV ARCHIVE 15.5+ · independent, browser-native core · ES2022.
 * Integration-only: DOES NOT replace 24-member data, flipping, existing Gravity,
 * Objekt React renderer or SPA navigation. No external dependencies.
 */
const own = (o,k) => Object.prototype.hasOwnProperty.call(o,k);
const norm = v => String(v ?? '').trim().toLowerCase().normalize('NFKC');
const ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const hex = n => '0x' + BigInt(n).toString(16);
const dec = n => BigInt(n ?? 0).toString(10);
const clamp = (n,min,max) => Math.max(min,Math.min(max,n));
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const isAbort = e => e?.name === 'AbortError';
function assertAddress(value) {if(!ADDRESS.test(value ?? ''))throw Error('Invalid EVM address');return value.toLowerCase();}
function safeArray(a){return Array.isArray(a)?a:[];}
function textNode(tag,content,attrs={}){const e=document.createElement(tag);e.textContent=String(content??'');for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e;}
function keyOfToken(chainId,contract,tokenId){return `${Number(chainId)}:${assertAddress(contract)}:${dec(tokenId)}`;}
function uniqSetIntersection(sets){
  const real=sets.filter(x=>x instanceof Set);
  if(!real.length)return new Set();
  real.sort((a,b)=>a.size-b.size);
  const result=new Set();
  outer:for(const k of real[0]){for(let i=1;i<real.length;i++)if(!real[i].has(k))continue outer;result.add(k)}
  return result;
}

/** O(1) *point* lookup and inverted candidate sets. Returning N matches is O(N). */
export class WavDataRegistry {
  constructor(rows=[],{members=[]}={}){
    this.rows=new Map();this.byMember=new Map();this.bySeason=new Map();
    this.byClass=new Map();this.byToken=new Map();this.byGram=new Map();
    this.idToIndex=new Map();this.indexToId=[];this.memberInfo=new Map();
    for(const m of safeArray(members))if(m?.id)this.memberInfo.set(norm(m.id),m);
    this.load(rows);
  }
  static add(map,key,id){if(!key)return;let s=map.get(key);if(!s)map.set(key,s=new Set());s.add(id);}
  static grams(s){
    const out=new Set();
    const q=norm(s).replace(/\s+/g,' ');
    if(q.length<2)return out;
    for(let i=0;i<q.length-1;i++)out.add(q.slice(i,i+2));
    return out;
  }
  load(raw){
    this.rows.clear();this.byMember.clear();this.bySeason.clear();this.byClass.clear();
    this.byToken.clear();this.byGram.clear();this.idToIndex.clear();this.indexToId=[];
    for(const src of safeArray(raw)){
      if(!src || src.id===undefined || src.id===null)continue;
      const id=String(src.id).trim();if(!id||this.rows.has(id))continue;
      const row={...src,id};this.rows.set(id,row);
      this.indexToId.push(id);this.idToIndex.set(id,this.indexToId.length-1);
      WavDataRegistry.add(this.byMember,norm(row.memberId??row.member),id);
      WavDataRegistry.add(this.bySeason,norm(row.season),id);
      WavDataRegistry.add(this.byClass,norm(row.class??row.klass),id);
      if(row.contract && row.chainId!=null && row.tokenId!=null){
        try{WavDataRegistry.add(this.byToken,keyOfToken(row.chainId,row.contract,row.tokenId),id)}catch(_){/* invalid mapping ignored */}
      }
      const fields=[id,row.memberId,row.memberKo,row.memberEn,row.season,row.class,row.collectionNo]
        .map(norm).filter(Boolean).join(' ');
      for(const g of WavDataRegistry.grams(fields))WavDataRegistry.add(this.byGram,g,id);
    }
    // Canonical positions: share codes must be stable across different JSON input orders.
    this.indexToId.sort();this.idToIndex=new Map(this.indexToId.map((id,i)=>[id,i]));
    // A share code may only be exchanged with someone using the exact catalog revision.
    const ids=this.indexToId;let h=2166136261;
    for(const id of ids){for(const ch of id){h^=ch.codePointAt(0);h=Math.imul(h,16777619)}h^=0xff;h=Math.imul(h,16777619)}
    this.fingerprint=(h>>>0).toString(36);
  }
  get(id){return this.rows.get(String(id))??null;}
  tokenIds(chainId,contract,tokenId){return this.byToken.get(keyOfToken(chainId,contract,tokenId))??new Set();}
  select({member,season,klass,query='',limit=80}={}){
    const sets=[];
    if(member && norm(member)!=='all')sets.push(this.byMember.get(norm(member))??new Set());
    if(season && norm(season)!=='all')sets.push(this.bySeason.get(norm(season))??new Set());
    if(klass && norm(klass)!=='all')sets.push(this.byClass.get(norm(klass))??new Set());
    const q=norm(query);
    if(q){
      const grams=WavDataRegistry.grams(q);
      if(grams.size)for(const g of grams)sets.push(this.byGram.get(g)??new Set());
      else sets.push(new Set()); // require two characters for indexed text search
    }
    const ids=sets.length?uniqSetIntersection(sets):new Set(this.rows.keys());
    const result=[];for(const id of ids){
      const row=this.rows.get(id);if(!row)continue;
      // Gram hits may include false positives. Verify ONLY on reduced candidates.
      if(q){const search=[id,row.memberId,row.memberKo,row.memberEn,row.season,row.class,row.collectionNo].map(norm).join(' ');
        if(!search.includes(q))continue;}
      result.push(row);if(result.length>=clamp(limit,1,2000))break;
    }
    return result;
  }
  getCatalogIds({member,season,klass}={}){
    const sets=[];
    if(member)sets.push(this.byMember.get(norm(member))??new Set());
    if(season)sets.push(this.bySeason.get(norm(season))??new Set());
    if(klass)sets.push(this.byClass.get(norm(klass))??new Set());
    return sets.length?uniqSetIntersection(sets):new Set(this.rows.keys());
  }
}

export const wavLanguages=Object.freeze({
  ko:{title:'WAV ARCHIVE',owned:'내 오브젝트 {owned}개 / 전체 {total}개',binder:'내 손안의 Objekt 바인더',
    match:'교환 궁합 {score}%',save:'이미지 저장',loading:'불러오는 중',vote:'Gravity 투표 흐름',
    offline:'연결이 불안정해요. 잠시 후 다시 시도해 주세요.',demo:'확인된 공식 수치가 없어 표시하지 않았어요.',
    wishlist:'위시리스트',trade:'교환 가능',complete:'수집률 {rate}%'},
  en:{title:'WAV ARCHIVE',owned:'{owned} of {total} Objekts saved',binder:'Your Objekt binder',
    match:'Trade match {score}%',save:'Save image',loading:'Loading',vote:'Gravity vote trends',
    offline:'Connection failed. Please try again.',demo:'No verified official data available.',
    wishlist:'Wishlist',trade:'Up for trade',complete:'{rate}% collected'},
  ja:{title:'WAV ARCHIVE',owned:'Objekt {owned}枚 / 全{total}枚',binder:'マイObjektバインダー',
    match:'交換マッチ {score}%',save:'画像を保存',loading:'読み込み中',vote:'Gravity投票の流れ',
    offline:'接続できませんでした。時間をおいて再試行してください。',demo:'確認済みの公式データがないため表示していません。',
    wishlist:'欲しいObjekt',trade:'交換できるObjekt',complete:'収集率 {rate}%'}
});
export function createTranslator(lang='ko', extra={}){
  const dict={ko:{...wavLanguages.ko,...extra.ko},en:{...wavLanguages.en,...extra.en},ja:{...wavLanguages.ja,...extra.ja}};
  return (key,params={})=>{
    const raw=dict[lang]?.[key]??dict.ko[key]??String(key);
    return raw.replace(/\{([A-Za-z][\w]*)\}/g,(_,k)=>own(params,k)?String(params[k]??''):'{'+k+'}');
  };
}

export class WavRPC {
  constructor({url='https://api.mainnet.abs.xyz',chainId=2741,timeout=12000}={}){
    const parsed=new URL(url);if(parsed.protocol!=='https:')throw Error('RPC must use HTTPS');
    this.url=url;this.chainId=Number(chainId);this.timeout=timeout;this.seq=0;this.validated=false;
  }
  async request(method,params=[],signal){
    const timeout=new AbortController();const timer=setTimeout(()=>timeout.abort(),this.timeout);
    const merged=signal && AbortSignal.any?AbortSignal.any([signal,timeout.signal]):timeout.signal;
    try{
      const res=await fetch(this.url,{method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({jsonrpc:'2.0',id:++this.seq,method,params}),signal:merged,cache:'no-store'});
      if(!res.ok)throw Error(`RPC HTTP ${res.status}`);
      const body=await res.json();if(body.error)throw Error(`RPC: ${body.error.message??body.error.code}`);
      return body.result;
    }finally{clearTimeout(timer)}
  }
  async verify(signal){const v=Number(BigInt(await this.request('eth_chainId',[],signal)));if(v!==this.chainId)throw Error(`Wrong chain: got ${v}, need ${this.chainId}`);this.validated=true;}
  async latest(signal){if(!this.validated)await this.verify(signal);return Number(BigInt(await this.request('eth_blockNumber',[],signal)));}
  async logs(filter,signal){if(!this.validated)await this.verify(signal);return safeArray(await this.request('eth_getLogs',[filter],signal));}
}

// Contract ABI is deliberately not guessed; supported vote event(s) must be verified by the integrator.
export class WavGravityWhaleTracker {
  constructor({rpc,contracts=[],topic0=[],decodeVote,threshold=1000,span=400,intervalMs=4000}={}){
    if(!(rpc instanceof WavRPC))throw Error('WavRPC instance required');
    this.rpc=rpc;this.contracts=contracts.map(assertAddress);this.topic0=topic0;
    this.decodeVote=decodeVote;this.threshold=BigInt(threshold);this.span=clamp(span,1,2000);
    this.intervalMs=Math.max(2500,intervalMs);this.events=[];this.cursor=null;this.controller=null;this.maxEvents=3000;
  }
  async scan({fromBlock,toBlock,signal,onProgress=()=>{}}={}){
    if(!this.contracts.length||!this.topic0.length||typeof this.decodeVote!=='function')
      throw Error('Verified vote contract address, event topics and decodeVote are required');
    const max=toBlock??await this.rpc.latest(signal);const start=fromBlock??Math.max(0,max-2000);
    if(start>max)return [];
    if(max-start>60000)throw Error('Use a smaller block range (<= 60,000) to avoid RPC overload');
    const added=[];
    for(let s=start;s<=max;s+=this.span){
      const e=Math.min(s+this.span-1,max);
      const logs=await this.rpc.logs({address:this.contracts,topics:[this.topic0],fromBlock:hex(s),toBlock:hex(e)},signal);
      for(const log of logs){
        const decoded=this.decodeVote(log);
        for(const item of (Array.isArray(decoded)?decoded:decoded?[decoded]:[])){
          const amount=BigInt(item.amount??0);if(amount<0n)continue;
          const event={chainId:this.rpc.chainId,candidate:String(item.candidate??''),
            wallet:item.wallet?assertAddress(item.wallet):null,amount:amount.toString(),
            txHash:log.transactionHash,block:Number(BigInt(log.blockNumber)),logIndex:Number(BigInt(log.logIndex))};
          if(!event.candidate)continue;
          this.events.push(event);added.push(event);
          if(this.events.length>this.maxEvents)this.events.splice(0,this.events.length-this.maxEvents);
        }
      }
      onProgress({current:e,end:max,found:added.length});
      if(s+this.span<=max)await sleep(80);
    }
    this.cursor=max+1;return added;
  }
  highVolume(){return this.events.filter(x=>BigInt(x.amount)>=this.threshold);}
  async start({onUpdate=()=>{},onError=()=>{}}={}){
    if(this.controller)return;this.controller=new AbortController();
    const ctl=this.controller;
    const loop=async()=>{
      while(!ctl.signal.aborted){try{
        if(!document.hidden){const tip=await this.rpc.latest(ctl.signal);const end=Math.max(0,tip-10);
          const from=this.cursor??Math.max(0,end-500);
          if(from<=end){const events=await this.scan({fromBlock:from,toBlock:Math.min(end,from+this.span*8),signal:ctl.signal});
            if(events.length)onUpdate(events);}
        }}catch(err){if(!isAbort(err))onError(err)}
        await sleep(this.intervalMs);
      }
    };loop();
  }
  stop(){this.controller?.abort();this.controller=null;}
  static correlationMatrix(rounds,candidates,prior=4){
    const names=[...new Set(candidates)];const m=names.length;
    const matrix=Array.from({length:m},()=>Array(m).fill(0));
    const vectors=names.map(n=>safeArray(rounds).map(r=>Number(r?.[n]??0)));
    const count=safeArray(rounds).length;
    for(let i=0;i<m;i++)for(let j=i;j<m;j++){
      if(i===j){matrix[i][j]=count?1:0;continue;}
      const a=vectors[i],b=vectors[j];if(count<3){matrix[i][j]=matrix[j][i]=0;continue;}
      const ma=a.reduce((x,y)=>x+y,0)/count,mb=b.reduce((x,y)=>x+y,0)/count;
      let cov=0,va=0,vb=0;for(let k=0;k<count;k++){const x=a[k]-ma,y=b[k]-mb;cov+=x*y;va+=x*x;vb+=y*y;}
      const pearson=va&&vb?cov/Math.sqrt(va*vb):0;
      matrix[i][j]=matrix[j][i]=clamp(pearson*count/(count+prior),-1,1);
    }
    return {candidates:names,matrix,sampleCount:count,method:'sample-shrunk Pearson (not posterior probability)'};
  }
  static betaPosterior(success,trials,alpha=1,beta=1){
    if(!Number.isInteger(success)||!Number.isInteger(trials)||success<0||trials<success||alpha<=0||beta<=0)throw Error('Invalid Bayesian sample');
    return {alpha:alpha+success,beta:beta+trials-success,mean:(alpha+success)/(alpha+beta+trials)};
  }
}

/** Minimal vote adapter for ERC-1155 COMO transfers, usable ONLY after official
 * recipient-to-candidate mapping and token ID have been independently verified.
 * The transfer alone does not establish an actual Gravity vote.
 */
export function createVerifiedComoDecoder({recipients={},comoTokenId,validated=false}={}){
  if(!validated)throw Error('Vote recipient/candidate mapping must be independently verified');
  if(comoTokenId===undefined)throw Error('Verified COMO token ID is required');
  const votes=new Map(Object.entries(recipients).map(([a,c])=>[assertAddress(a),String(c)]));
  if(!votes.size)throw Error('Verified candidate recipient mapping is empty');
  const token=dec(comoTokenId);
  return log=>{
    const t=safeArray(log?.topics);if(t.length!==4)return null;
    const candidate=votes.get('0x'+t[3].slice(-40).toLowerCase());
    if(!candidate)return null;
    const wallet='0x'+t[2].slice(-40).toLowerCase();
    let decoded=[];
    if(t[0]?.toLowerCase()==='0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62'){
      const data=chunks32(log.data);if(data.length===2)decoded=[{id:BigInt('0x'+data[0]),amount:BigInt('0x'+data[1])}];
    }else if(t[0]?.toLowerCase()==='0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb'){
      decoded=decodeBatch(log.data);
    }
    const out=[];for(const part of decoded)if(part.id.toString()===token&&part.amount>0n)
      out.push({candidate,wallet,amount:part.amount.toString()});
    return out.length?out:null;
  };
}

/** Simple data-only SVG chart: no D3, no external script, no HTML string injection. */
export function drawWavTrendSvg(svg,points,{label='COMO',color='var(--neon-purple, #a78bfa)'}={}){
  if(!svg || typeof document==='undefined')return;
  const ns='http://www.w3.org/2000/svg';svg.replaceChildren();svg.setAttribute('viewBox','0 0 640 240');
  svg.setAttribute('role','img');svg.setAttribute('aria-label',String(label));
  const values=safeArray(points).map(v=>Number(typeof v==='number'?v:v?.value)).filter(Number.isFinite);
  const path=document.createElementNS(ns,'path');const w=600,h=190,x0=20,y0=20;
  if(values.length<2){const t=document.createElementNS(ns,'text');t.setAttribute('x','20');t.setAttribute('y','110');
    t.setAttribute('fill','#aaa');t.textContent='Not enough verified data';svg.append(t);return;}
  let min=Math.min(...values),max=Math.max(...values);if(max===min){max+=1;min-=1;}
  const d=values.map((v,i)=>`${i?'L':'M'}${(x0+i*w/(values.length-1)).toFixed(1)} ${(y0+h-(v-min)/(max-min)*h).toFixed(1)}`).join(' ');
  path.setAttribute('d',d);path.setAttribute('fill','none');path.setAttribute('stroke',color);
  path.setAttribute('stroke-width','3');path.setAttribute('stroke-linejoin','round');svg.append(path);
  const axis=document.createElementNS(ns,'text');axis.textContent=`${label}   ${min.toLocaleString()} – ${max.toLocaleString()}`;
  axis.setAttribute('fill','#bdb7d5');axis.setAttribute('font-size','13');axis.setAttribute('x','20');axis.setAttribute('y','235');svg.append(axis);
}

/** IndexedDB-based local binder. No wallet address or contents are uploaded by this class. */
export class WavObjektStorage {
  constructor({dbName='wav-archive-personal-v2'}={}){
    this.dbName=dbName;this.memory=new Map();this.db=null;this._opening=null;
    this.owned=new Set();this.wish=new Set();this.trade=new Set();
  }
  async open(){
    if(this._opening)return this._opening;
    this._opening=new Promise(resolve=>{
      if(typeof indexedDB==='undefined'){resolve(null);return;}
      try{
        const req=indexedDB.open(this.dbName,1);
        req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('state'))req.result.createObjectStore('state');};
        req.onsuccess=()=>{this.db=req.result;this.db.onversionchange=()=>{this.db?.close();this.db=null;};resolve(this.db);};
        req.onerror=()=>resolve(null);req.onblocked=()=>resolve(null);
      }catch(_){resolve(null)}
    });return this._opening;
  }
  async read(key,def=null){
    const db=await this.open();if(!db)return this.memory.get(key)??def;
    return new Promise(resolve=>{
      try{const q=db.transaction('state','readonly').objectStore('state').get(key);
        q.onsuccess=()=>resolve(q.result??def);q.onerror=()=>resolve(def);
      }catch(_){resolve(def)}
    });
  }
  async write(key,value){
    const db=await this.open();if(!db){this.memory.set(key,value);return;}
    return new Promise((resolve,reject)=>{
      try{const tx=db.transaction('state','readwrite');tx.objectStore('state').put(value,key);
        tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error??Error('IndexedDB write failed'));
      }catch(e){reject(e)}
    });
  }
  async load(){
    for(const name of ['owned','wish','trade'])this[name]=new Set(safeArray(await this.read(`list:${name}`,[])));
    return this;
  }
  async toggleOwned(id){return this.toggle('owned',id);}
  async toggle(name,id){
    if(!['owned','wish','trade'].includes(name))throw Error('Invalid binder group');
    const set=this[name];const key=String(id);
    if(set.has(key))set.delete(key);else set.add(key);
    try{await this.write(`list:${name}`,[...set])}catch(err){
      // Restore state on transactional failure.
      if(set.has(key))set.delete(key);else set.add(key);throw err;
    }
    return set.has(key);
  }
  getCompletionRate(registry,filters={}){
    const ids=registry.getCatalogIds(filters);let owned=0;
    for(const id of ids)if(this.owned.has(id))owned++;
    return {owned,total:ids.size,percent:ids.size?Math.round(owned/ids.size*10000)/100:0};
  }
  async scanState(chainId,contract,wallet){return this.read(`scan:${chainId}:${assertAddress(contract)}:${assertAddress(wallet)}`,null);}
  async saveScanState(chainId,contract,wallet,value){return this.write(`scan:${chainId}:${assertAddress(contract)}:${assertAddress(wallet)}`,value);}
  /** Only wishlist/trade is shared. No wallet address or owned list is included. */
  generateShareableString(registry){
    const encoder=new TextEncoder();
    const mapSet=s=>[...s].map(id=>registry.idToIndex.get(id)).filter(Number.isInteger).sort((a,b)=>a-b);
    const buf=[2]; // format version
    const fp=encoder.encode(registry.fingerprint);if(fp.length>64)throw Error('Fingerprint too long');
    buf.push(fp.length,...fp);
    for(const name of ['wish','trade']){
      const sorted=mapSet(this[name]);writeVar(buf,sorted.length);
      let prev=0;for(const x of sorted){writeVar(buf,x-prev);prev=x;}
    }
    return 'WAV2.'+toBase64Url(Uint8Array.from(buf));
  }
  static decodeShareableString(code,registry){
    if(!String(code).startsWith('WAV2.'))throw Error('Unsupported binder share format');
    const bytes=fromBase64Url(String(code).slice(5));if(bytes.length>200000)throw Error('Share code too large');
    let pos=0;if(bytes[pos++]!==2)throw Error('Wrong format version');
    const fLen=bytes[pos++];if(!fLen||fLen>64||pos+fLen>bytes.length)throw Error('Invalid fingerprint');
    const fp=new TextDecoder('utf-8',{fatal:true}).decode(bytes.subarray(pos,pos+fLen));pos+=fLen;
    if(fp!==registry.fingerprint)throw Error('Catalog version mismatch: refresh both devices');
    const result={};
    for(const name of ['wish','trade']){
      const count=readVar(bytes,()=>pos++,()=>pos);
      if(count>registry.indexToId.length)throw Error('Invalid share entry count');
      const set=new Set();let prev=0;
      for(let i=0;i<count;i++){
        const delta=readVar(bytes,()=>pos++,()=>pos);prev+=delta;
        const id=registry.indexToId[prev];if(!id)throw Error('Invalid catalog reference');set.add(id);
      }result[name]=set;
    }
    if(pos!==bytes.length)throw Error('Extra data in share code');
    return result;
  }
  matchTrade(other){
    const theirWish=other?.wish??new Set();const theirTrade=other?.trade??new Set();
    const myMatches=[...this.wish].filter(id=>theirTrade.has(id));
    const theirMatches=[...theirWish].filter(id=>this.trade.has(id));
    const total=this.wish.size+theirWish.size;
    return {myMatches,theirMatches,score:total?Math.round(100*(myMatches.length+theirMatches.length)/total):0};
  }
}
function writeVar(out,n){
  if(!Number.isSafeInteger(n)||n<0)throw Error('Invalid varint');
  while(n>=128){out.push((n%128)|128);n=Math.floor(n/128)}out.push(n);
}
function readVar(bytes,next){
  let out=0,scale=1;
  for(let i=0;i<8;i++){
    const at=next();if(at>=bytes.length)throw Error('Truncated varint');const b=bytes[at];
    out+=(b&127)*scale;if(!Number.isSafeInteger(out))throw Error('Varint overflow');
    if(!(b&128))return out;scale*=128;
  }throw Error('Varint too long');
}
function toBase64Url(u8){
  let text='';for(let i=0;i<u8.length;i+=8192)text+=String.fromCharCode(...u8.subarray(i,i+8192));
  if(typeof btoa!=='undefined')return btoa(text).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  return Buffer.from(u8).toString('base64url');
}
function fromBase64Url(raw){
  if(!/^[A-Za-z0-9_-]*$/.test(raw)||raw.length>270000)throw Error('Invalid share string');
  if(typeof atob!=='undefined')return Uint8Array.from(atob(raw.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
  return new Uint8Array(Buffer.from(raw,'base64url'));
}

const EVENTS=Object.freeze({
  ERC721:'0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  TransferSingle:'0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
  TransferBatch:'0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb'
});
const topicAddress = a => '0x'+'0'.repeat(24)+assertAddress(a).slice(2);
const untopic = topic => topic&&topic.length===66?'0x'+topic.slice(-40).toLowerCase():null;
const chunks32=data => {const s=String(data??'').replace(/^0x/,'');if(!s||s.length%64)return [];return s.match(/.{64}/g)??[];};
function decodeBatch(data){
  const words=chunks32(data);if(words.length<4)throw Error('Malformed TransferBatch');
  const extract=offset=>{
    const start=Number(BigInt('0x'+words[offset])/32n);if(!Number.isSafeInteger(start)||start<0||start>=words.length)throw Error('Bad batch offset');
    const size=Number(BigInt('0x'+words[start]));if(!Number.isSafeInteger(size)||size>5000||start+1+size>words.length)throw Error('Bad batch size');
    return words.slice(start+1,start+1+size).map(w=>BigInt('0x'+w));
  };
  const ids=extract(0),values=extract(1);if(ids.length!==values.length)throw Error('Mismatched batch lengths');
  return ids.map((id,i)=>({id,amount:values[i]}));
}

/** Reads ONLY addresses in specified verified contracts. RPC transfer backfill costs real time.
 * ERC-721 requires no ABI. Optional ERC-1155 topics are passed by the site owner.
 * Assumes transfer logs fully account for holdings since deployment.
 */
export class WavWalletScanner {
  constructor({rpc,registry,store,eventTopics={},chunk=500,confirmations=12}={}){
    if(!(rpc instanceof WavRPC)||!(registry instanceof WavDataRegistry)||!(store instanceof WavObjektStorage))throw Error('Missing RPC/Registry/Storage');
    this.rpc=rpc;this.registry=registry;this.store=store;
    this.topics={ERC721:EVENTS.ERC721,...eventTopics};this.chunk=clamp(chunk,1,1500);
    this.confirmations=clamp(confirmations,0,100);
  }
  parseLog(log,type,wallet){
    const topics=safeArray(log.topics);
    let from,to,entries=[];
    if(type==='ERC721'){
      if(topics.length!==4)return null;from=untopic(topics[1]);to=untopic(topics[2]);
      entries=[{id:BigInt(topics[3]),amount:1n}];
    }else if(type==='TransferSingle'){
      if(topics.length!==4)return null;from=untopic(topics[2]);to=untopic(topics[3]);
      const words=chunks32(log.data);if(words.length!==2)return null;
      entries=[{id:BigInt('0x'+words[0]),amount:BigInt('0x'+words[1])}];
    }else if(type==='TransferBatch'){
      if(topics.length!==4)return null;from=untopic(topics[2]);to=untopic(topics[3]);
      entries=decodeBatch(log.data);
    }
    if(from!==wallet&&to!==wallet)return null;
    return entries.map(({id,amount})=>({id:id.toString(),delta:(to===wallet?amount:0n)-(from===wallet?amount:0n)}));
  }
  async sync({wallet,contracts,onProgress=()=>{},signal,maxBlocks=20000}={}){
    wallet=assertAddress(wallet);await this.rpc.verify(signal);
    const safeLatest=Math.max(0,(await this.rpc.latest(signal))-this.confirmations);
    const results=[];
    for(const conf of safeArray(contracts)){
      const address=assertAddress(conf.address),type=conf.type??'ERC721';
      const deployment=Number(conf.deploymentBlock);
      if(!Number.isSafeInteger(deployment)||deployment<0)throw Error(`Verified deploymentBlock required for ${address}`);
      if(!['ERC721','TransferSingle','TransferBatch'].includes(type)||!this.topics[type])
        throw Error(`Verified event topic required: ${type}`);
      const stored=await this.store.scanState(this.rpc.chainId,address,wallet);
      const state=stored??{lastBlock:deployment-1,balances:{}};
      // If deployment block changed, rescan instead of trusting an incompatible checkpoint.
      const checkpoint=state.lastBlock>=deployment-1?state:{lastBlock:deployment-1,balances:{}};
      const start=Math.max(deployment,checkpoint.lastBlock+1);
      if(safeLatest-start+1>maxBlocks)throw Error(`Sync too large (${safeLatest-start+1} blocks). Use indexed API or bounded imports; no false zero-second promise.`);
      const balances=new Map(Object.entries(checkpoint.balances).map(([id,count])=>[id,BigInt(count)]));
      for(let block=start;block<=safeLatest;block+=this.chunk){
        const end=Math.min(block+this.chunk-1,safeLatest),topic=this.topics[type];
        const position=type==='ERC721'?1:2;
        const base=[topic];while(base.length<position+1)base.push(null);
        const outbound=[...base];outbound[position]=topicAddress(wallet);
        const inbound=[...base];inbound[position+1]=topicAddress(wallet);
        // Outbound and inbound OR filters require separate indexed-topic queries.
        const queries=[outbound,inbound];const merged=new Map();
        for(const topics of queries){
          const logs=await this.rpc.logs({address,topics,fromBlock:hex(block),toBlock:hex(end)},signal);
          for(const log of logs)merged.set(`${log.transactionHash}:${log.logIndex}`,log);
        }
        for(const log of merged.values()){
          const entries=this.parseLog(log,type,wallet);
          for(const entry of entries??[]){const old=balances.get(entry.id)??0n;balances.set(entry.id,old+entry.delta);}
        }
        // Save checkpoint ONLY after a full successful chunk. Can resume on failure.
        const stateNew={lastBlock:end,balances:Object.fromEntries([...balances].map(([id,value])=>[id,value.toString()]))};
        await this.store.saveScanState(this.rpc.chainId,address,wallet,stateNew);
        onProgress({contract:address,block:end,total:safeLatest});
      }
      const owned=[];
      for(const [tokenId,qty] of balances)if(qty>0n){
        const ids=this.registry.tokenIds(this.rpc.chainId,address,tokenId);
        for(const id of ids)owned.push({id,quantity:qty.toString(),tokenId,contract:address});
      }
      results.push(...owned);
    }
    return results; // Does NOT silently overwrite user-maintained binder state.
  }
  async syncOwned({wallet,contracts,onProgress,signal,maxBlocks}={}){
    const found=await this.sync({wallet,contracts,onProgress,signal,maxBlocks});
    // On-chain scan is an independently labeled snapshot, not manual owned flags.
    await this.store.write(`chain-snapshot:${this.rpc.chainId}:${assertAddress(wallet)}`,
      {at:new Date().toISOString(),records:found});
    return found;
  }
}

/** Purposefully lightweight pairwise 'chemi' index, NOT objective talent scores. */
export class WavLabsSynergy {
  constructor(members=[]){this.members=new Map();this.pairs=new Map();
    for(const m of safeArray(members))if(m?.id)this.members.set(String(m.id),m);
    const a=[...this.members.values()];
    for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){
      const x=a[i],y=a[j];const ax=new Set(safeArray(x.dimensions).map(norm));
      const ay=new Set(safeArray(y.dimensions).map(norm));let overlap=0;
      for(const u of ax)if(ay.has(u))overlap++;
      const shared=overlap/Math.max(1,new Set([...ax,...ay]).size);
      const ageX=Date.parse(x.birth??''),ageY=Date.parse(y.birth??'');
      const age=Number.isFinite(ageX)&&Number.isFinite(ageY)
        ?Math.exp(-Math.abs(ageX-ageY)/86400000/365/3):null;
      const line= x.line && y.line ? Number(x.line===y.line):null;
      this.pairs.set([String(x.id),String(y.id)].sort().join('|'),{shared,age,line,sharedCount:overlap});
    }
  }
  evaluate(ids){
    const chosen=[...new Set(safeArray(ids).map(String))].filter(id=>this.members.has(id));
    if(chosen.length<2)return {score:null,pairs:[],confidence:'insufficient'};
    const pairs=[];let sum=0;
    for(let i=0;i<chosen.length;i++)for(let j=i+1;j<chosen.length;j++){
      const a=chosen[i],b=chosen[j],e=this.pairs.get([a,b].sort().join('|'));if(!e)continue;
      let score=e.shared*0.65,weight=0.65;
      if(e.age!==null){score+=e.age*0.2;weight+=.2;}
      if(e.line!==null){score+=e.line*.15;weight+=.15;}
      const value=Math.round(score/weight*100);
      pairs.push({a,b,score:value,sharedDimensionCount:e.sharedCount});sum+=value;
    }
    return {score:pairs.length?Math.round(sum/pairs.length):null,pairs,confidence:'fan-made heuristic; not vocal/performance ability',
      vocalBalance:null,performanceHarmony:null};
  }
}

/** CORS-safe Canvas 2D image export. No unverified photos are hotlinked or fabricated. */
export async function exportWavUnitPNG({name='WAV UNIT',members=[],width=1200,height=1500}={}){
  if(typeof document==='undefined')throw Error('Canvas export requires a browser');
  width=clamp(Math.floor(width),300,2400);height=clamp(Math.floor(height),300,3200);
  if(width*height>6500000)throw Error('Canvas export size exceeds safe mobile limit');
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const c=canvas.getContext('2d',{alpha:false});if(!c)throw Error('Canvas 2D not available');
  const bg=c.createLinearGradient(0,0,width,height);bg.addColorStop(0,'#070916');bg.addColorStop(.5,'#21123c');bg.addColorStop(1,'#090d1e');
  c.fillStyle=bg;c.fillRect(0,0,width,height);
  c.textAlign='center';c.fillStyle='#d9c7ff';c.font=`600 ${Math.floor(width*.025)}px system-ui`;
  c.fillText('WAV ARCHIVE  ·  FAN MADE DIMENSION',width/2,height*.08);
  const safeName=String(name).slice(0,42);c.fillStyle='#fff';c.font=`800 ${Math.floor(width*.068)}px system-ui`;
  c.fillText(safeName,width/2,height*.16,width*.9);
  const arr=safeArray(members).slice(0,24);const columns=arr.length<=4?2:arr.length<=12?3:4;
  const rows=Math.ceil(arr.length/columns),gap=width*.016,areaX=width*.06,areaWidth=width*.88;
  const cardW=(areaWidth-gap*(columns-1))/columns;
  const cardH=Math.min(cardW*1.3,(height*.70-gap*Math.max(0,rows-1))/Math.max(1,rows));
  const startY=height*.225;
  for(let i=0;i<arr.length;i++){
    const m=arr[i];const col=i%columns,row=Math.floor(i/columns);
    const x=areaX+col*(cardW+gap),y=startY+row*(cardH+gap);
    c.fillStyle='#1b1935';c.beginPath();
    if(typeof c.roundRect==='function')c.roundRect(x,y,cardW,cardH,Math.min(22,width*.02));
    else c.rect(x,y,cardW,cardH);
    c.fill();
    c.strokeStyle='#a687f1';c.lineWidth=2;c.stroke();
    // External images may taint canvas. Only explicitly supplied CORS-capable pictures are tried.
    if(m.imageUrl){try{
      const url=new URL(m.imageUrl,location.href);
      if(url.protocol==='https:' || url.origin===location.origin){
        const photo=await new Promise((resolve,reject)=>{
          const img=new Image();img.crossOrigin='anonymous';const t=setTimeout(()=>{img.src='';reject(Error('image timeout'))},3000);
          img.onload=()=>{clearTimeout(t);resolve(img)};img.onerror=()=>{clearTimeout(t);reject(Error('image unavailable'))};img.src=url.href;
        });
        c.save();c.beginPath();c.rect(x+3,y+3,cardW-6,cardH*.76);c.clip();
        c.drawImage(photo,x+3,y+3,cardW-6,cardH*.76);c.restore();
      }
    }catch(_){/* Keep branded card; no broken export */}}
    c.textAlign='left';c.font=`700 ${Math.floor(width*.020)}px system-ui`;
    c.fillStyle='#e7d6ff';c.fillText(String(m.id??'').slice(0,7),x+cardW*.08,y+cardH*.83,cardW*.84);
    c.fillStyle='#fff';c.font=`800 ${Math.floor(width*.024)}px system-ui`;
    c.fillText(String(m.name??m.nameKo??'').slice(0,18),x+cardW*.08,y+cardH*.93,cardW*.84);
  }
  c.fillStyle='#aaa2c8';c.textAlign='center';c.font=`500 ${Math.floor(width*.018)}px system-ui`;
  c.fillText('UNOFFICIAL FAN CREATION · NOT A REAL DIMENSION',width/2,height*.965);
  return new Promise((resolve,reject)=>{
    try{canvas.toBlob(blob=>blob?resolve(blob):reject(Error('PNG export failed')),'image/png');}
    catch(e){reject(e)}
  });
}
export function downloadWavBlob(blob,filename='wav-unit.png'){
  if(!(blob instanceof Blob))throw Error('Expected PNG Blob');
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;
  a.download=String(filename).replace(/[^a-zA-Z0-9가-힣._-]/g,'_').slice(0,85)||'wav-unit.png';
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}

/** Virtual row renderer: DOM count stays O(visible rows), not O(whole catalog).
 * Pass a FUNCTION that returns a DOM node, never HTML from untrusted JSON.
 */
export class WavVirtualScroller {
  constructor({container,items=[],renderItem,aspect=.74,caption=70,gap=12,overscanPx=300,columns}={}){
    if(!container||typeof renderItem!=='function')throw Error('Container and renderItem required');
    this.container=container;this.renderItem=renderItem;this.items=safeArray(items);
    this.aspect=clamp(aspect,.3,2);this.caption=clamp(caption,0,220);
    this.gap=clamp(gap,0,36);this.overscanPx=clamp(overscanPx,0,1000);
    this.columnForWidth=columns??(w=>w<480?2:w<800?3:w<1200?4:5);
    this.rows=new Map();this.pending=0;this.destroyed=false;
    this.viewport=document.createElement('div');this.viewport.className='wa-virtual-viewport';
    this.viewport.setAttribute('role','list');this.container.replaceChildren(this.viewport);
    this._scroll=()=>this.schedule();this.container.addEventListener('scroll',this._scroll,{passive:true});
    this.resizeObserver=typeof ResizeObserver!=='undefined'?new ResizeObserver(()=>this.measure()):null;
    this.resizeObserver?.observe(container);
    this.measure();
  }
  setItems(items){this.items=safeArray(items);this.rows.forEach(r=>r.remove());this.rows.clear();
    this.container.scrollTop=0;this.measure();}
  measure(){if(this.destroyed)return;
    const w=this.container.clientWidth;
    const previousColumns=this.columns;
    this.columns=clamp(Math.round(this.columnForWidth(w)),1,7);
    if(previousColumns && previousColumns!==this.columns){
      for(const row of this.rows.values())row.remove();
      this.rows.clear();
    }
    this.cardWidth=Math.max(65,(w-this.gap*(this.columns-1))/this.columns);
    this.rowHeight=Math.ceil((this.cardWidth/this.aspect)+this.caption+this.gap);
    this.count=Math.ceil(this.items.length/this.columns);
    this.viewport.style.height=(this.count*this.rowHeight)+'px';
    this.schedule();
  }
  schedule(){if(this.pending||this.destroyed)return;this.pending=requestAnimationFrame(()=>{this.pending=0;this.render();});}
  render(){if(this.destroyed||!this.rowHeight)return;
    const top=this.container.scrollTop;
    const start=clamp(Math.floor(Math.max(0,top-this.overscanPx)/this.rowHeight),0,this.count);
    const end=clamp(Math.ceil((top+this.container.clientHeight+this.overscanPx)/this.rowHeight),start,this.count);
    for(const [index,el] of this.rows)if(index<start||index>=end){el.remove();this.rows.delete(index);}
    for(let row=start;row<end;row++)if(!this.rows.has(row)){
      const holder=document.createElement('div');holder.className='wa-virtual-row';holder.setAttribute('role','listitem');
      holder.style.top=(row*this.rowHeight)+'px';holder.style.height=(this.rowHeight-this.gap)+'px';
      holder.style.setProperty('--wa-virtual-columns',String(this.columns));
      holder.style.setProperty('--wa-virtual-gap',`${this.gap}px`);
      const startIndex=row*this.columns;
      for(let i=0;i<this.columns;i++){
        const item=this.items[startIndex+i];if(!item)break;
        const node=this.renderItem(item,startIndex+i);
        if(node instanceof Node){node.style.minWidth='0';node.style.minHeight='0';holder.append(node);}
      }
      this.viewport.append(holder);this.rows.set(row,holder);
    }
    // Width-dependent row height changed; update surviving row geometry without rebuilding content.
    for(const [index,el] of this.rows){el.style.top=(index*this.rowHeight)+'px';
      el.style.height=(this.rowHeight-this.gap)+'px';el.style.setProperty('--wa-virtual-columns',String(this.columns));}
  }
  destroy(){this.destroyed=true;if(this.pending)cancelAnimationFrame(this.pending);
    this.resizeObserver?.disconnect();this.container.removeEventListener('scroll',this._scroll);
    this.rows.clear();this.viewport.remove();
  }
}

/** Scroll state for visual throttling. Does NOT disable taps or override preventDefault. */
export class WavScrollStateController {
  constructor({idleMs=120,root=document.documentElement}={}){
    this.root=root;this.idleMs=Math.max(100,idleMs);this.timer=0;this.active=false;
    this.scroll=()=>this.pulse();this.end=()=>this.cooldown();
    document.addEventListener('scroll',this.scroll,{capture:true,passive:true});
    document.addEventListener('touchmove',this.scroll,{passive:true});
    document.addEventListener('touchend',this.end,{passive:true});
    window.addEventListener('pagehide',this.end,{passive:true});
  }
  pulse(){if(!this.active){this.active=true;this.root.classList.add('global-scrolling');}
    this.cooldown();}
  cooldown(){clearTimeout(this.timer);this.timer=setTimeout(()=>{
    this.active=false;this.root.classList.remove('global-scrolling');},this.idleMs);}
  destroy(){clearTimeout(this.timer);this.root.classList.remove('global-scrolling');
    document.removeEventListener('scroll',this.scroll,true);
    document.removeEventListener('touchmove',this.scroll);
    document.removeEventListener('touchend',this.end);
    window.removeEventListener('pagehide',this.end);
  }
}

/** Opt-in section display locking. Never apply it to fixed, sticky, dialogs or interactive cards. */
export function attachWavSectionLock(root=document){
  const targets=[...root.querySelectorAll('[data-wa-layout-section]')].filter(e=>
    !e.matches('dialog,[role="dialog"],.member-card,.oc8-card,[style*="position:sticky"]'));
  for(const el of targets){
    const fallback=Math.max(180,Math.round(el.getBoundingClientRect().height)||450);
    el.style.setProperty('--wa-estimated-height',`${fallback}px`);
    el.classList.add('wa-layout-lazy');
  }
  return {disconnect(){for(const el of targets)el.classList.remove('wa-layout-lazy');}};
}

export function createWavCore({rows=[],members=[],autoScrollState=true}={}){
  const registry=new WavDataRegistry(rows,{members});
  const storage=new WavObjektStorage();
  const scroll=autoScrollState&&typeof document!=='undefined'?new WavScrollStateController():null;
  const labs=new WavLabsSynergy(members);
  return {registry,storage,labs,scroll,t:createTranslator,
    destroy(){scroll?.destroy();}};
}

/** On-demand measurement only. Refresh rate is never forced by the page. */
export function measureWavFrames({seconds=4}={}){
  if(typeof requestAnimationFrame==='undefined')return Promise.reject(Error('Browser rAF required'));
  const ms=clamp(Number(seconds)*1000,500,12000);
  return new Promise(resolve=>{
    let prev=null,start=null;const deltas=[];
    const frame=now=>{
      if(document.hidden)return resolve({status:'hidden'});
      if(start===null)start=now;
      if(prev!==null)deltas.push(now-prev);prev=now;
      if(now-start<ms)requestAnimationFrame(frame);
      else{
        const sorted=[...deltas].sort((a,b)=>a-b);const total=deltas.reduce((a,b)=>a+b,0);
        const mean=total/Math.max(1,deltas.length);
        resolve({frames:deltas.length,averageFPS:Math.round(1000/Math.max(mean,.001)),
          p95FrameMs:Math.round((sorted[Math.floor(sorted.length*.95)]??0)*10)/10,
          maxFrameMs:Math.round((sorted.at(-1)??0)*10)/10,
          note:'Measures rAF cadence for this scene, not guaranteed device/display FPS.'});
      }
    };requestAnimationFrame(frame);
  });
}
