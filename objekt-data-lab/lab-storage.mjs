/* Local-first independent storage; only requested user data is persisted on this device. */
const STORES=['owned','wish','trade','manual'];
export class WavObjektStore{
 constructor(){this.db=null;this.mode='memory';this.state={owned:new Set(),wish:new Set(),trade:new Set(),manual:[],quantities:Object.create(null)};this._writes=Promise.resolve()}
 async open(){
  if(!globalThis.indexedDB)return this;
  try{
   this.db=await new Promise((resolve,reject)=>{
    const req=indexedDB.open('wav-archive-objekt-data-lab-v1',1);
    req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('kv'))req.result.createObjectStore('kv')};
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
    req.onblocked=()=>reject(Error('DB blocked'));
   });
   this.mode='indexedDB';
   for(const name of STORES){const val=await this.get(name);if(name==='manual')this.state.manual=Array.isArray(val)?val:[];else this.state[name]=new Set(Array.isArray(val)?val:[])}
   // Optional sidecar. Never overwrite the legacy owned/wish/trade sets.
   const qty=await this.get('quantities');this.state.quantities=this.cleanQuantities(qty);
  }catch(e){console.warn('WAV DATA LAB: memory-only mode',e);this.mode='memory'}
  return this;
 }
 async get(name){if(!this.db)return null;return new Promise((res,rej)=>{const tx=this.db.transaction('kv','readonly');const q=tx.objectStore('kv').get(name);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})}
 async saveCatalog(rows){
  if(!this.db || rows.length>25000)return false;
  return new Promise((res,rej)=>{const tx=this.db.transaction('kv','readwrite');tx.objectStore('kv').put(rows,'catalog-cache');tx.oncomplete=()=>res(true);tx.onerror=()=>rej(tx.error)});
 }
 async persist(name){
  if(!this.db)return;
  const value=name==='manual'?this.state.manual:name==='quantities'?{...this.state.quantities}:[...this.state[name]];
  this._writes=this._writes.catch(()=>{}).then(()=>new Promise((res,rej)=>{
   const tx=this.db.transaction('kv','readwrite');tx.objectStore('kv').put(value,name);
   tx.oncomplete=res;tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error);
  }));
  return this._writes;
 }
 async toggle(name,id){if(!['owned','wish','trade'].includes(name))throw Error('Invalid key');const set=this.state[name],before=set.has(id);if(before)set.delete(id);else set.add(id);try{await this.persist(name)}catch(e){if(before)set.add(id);else set.delete(id);throw e}return set.has(id)}
 cleanQuantities(raw){
  const clean=Object.create(null);
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return clean;
  for(const [id,value] of Object.entries(raw).slice(0,50000)){
   if(typeof id!=='string'||!id||id.length>200||id==='__proto__'||id==='constructor')continue;
   if(Number.isInteger(value)&&value>=2&&value<=99)clean[id]=value;
  }
  return clean;
 }
 getQuantity(id){return this.state.owned.has(id)?this.state.quantities[id]||1:0}
 async changeQuantity(id,delta){
  if(!this.state.owned.has(id))throw Error('보유로 표시된 Objekt만 수량을 조정할 수 있어.');
  if(delta!==1&&delta!==-1)throw Error('Invalid quantity step');
  const prev=this.state.quantities[id]||1;
  const next=Math.max(1,Math.min(99,prev+delta));
  if(next===prev)return next;
  if(next===1)delete this.state.quantities[id];else this.state.quantities[id]=next;
  try{await this.persist('quantities')}
  catch(err){if(prev===1)delete this.state.quantities[id];else this.state.quantities[id]=prev;throw err}
  return next;
 }
 async addManual(row){if(this.state.manual.some(x=>x.id===row.id))return false;this.state.manual.push(row);await this.persist('manual');return true}
 async importBackup(data){
  if(data?.format!=='WAV_OBJEKT_LAB_BACKUP_V1')throw Error('잘못된 백업 파일이야.');
  for(const key of ['owned','wish','trade']){if(!Array.isArray(data[key])||data[key].length>50000||!data[key].every(x=>typeof x==='string'&&x.length<200))throw Error('백업 목록 형식을 확인해 줘.')}
  if(!Array.isArray(data.manual)||data.manual.length>20000)throw Error('수동 데이터 형식을 확인해 줘.');
  const quantities=this.cleanQuantities(data.quantities); // v1 backups have no quantities: default to 1
  for(const key of ['owned','wish','trade'])this.state[key]=new Set(data[key]);
  this.state.manual=data.manual.filter(x=>typeof x?.id==='string').slice(0,20000);
  this.state.quantities=quantities;
  // Serialize persistence to preserve existing transaction ordering.
  await Promise.all([...STORES,'quantities'].map(key=>this.persist(key)));
 }
 backup(){return {format:'WAV_OBJEKT_LAB_BACKUP_V1',exportedAt:new Date().toISOString(),...Object.fromEntries(['owned','wish','trade'].map(k=>[k,[...this.state[k]]])),manual:this.state.manual,quantities:{...this.state.quantities}}}
}
