/* Connect WAV ARCHIVE existing JSON to the isolated core. Nothing auto-writes to live DOM.
 * Add optional #wav-core-demo only where a new virtual grid is desired.
 */
import {createWavCore,WavRPC,WavWalletScanner,WavVirtualScroller,
  WavGravityWhaleTracker,drawWavTrendSvg,exportWavUnitPNG,downloadWavBlob,measureWavFrames} from './wav-core.mjs';
const settings=window.WAV_CORE_SETTINGS??{};
const ids='wavCoreStatus';
function status(s){const el=document.getElementById(ids);if(el)el.textContent=s;}
async function getCatalog(){
  if(Array.isArray(settings.catalog))return settings.catalog;
  if(!settings.catalogUrl)return [];
  const ctrl=new AbortController();const time=setTimeout(()=>ctrl.abort(),12000);
  try{
    const r=await fetch(settings.catalogUrl,{signal:ctrl.signal});if(!r.ok)throw Error(`Catalog HTTP ${r.status}`);
    const result=await r.json();const rows=Array.isArray(result)?result:result.items??result.rows??result.data;
    if(!Array.isArray(rows))throw Error('Catalog JSON must contain an array');return rows;
  }finally{clearTimeout(time)}
}
async function boot(){
  try{
    const catalog=await getCatalog();
    const members=Array.isArray(settings.members)?settings.members:[];
    const core=createWavCore({rows:catalog,members,autoScrollState:true});
    await core.storage.load();
    core.rpc=new WavRPC({url:settings.rpcUrl??'https://api.mainnet.abs.xyz',chainId:settings.chainId??2741});
    core.measurePerformance=measureWavFrames;
    core.walletScanner=new WavWalletScanner({rpc:core.rpc,registry:core.registry,store:core.storage,
      eventTopics:settings.erc1155Topics??{}});
    // A verified vote contract and an ABI-specific vote decoder must be supplied.
    core.createVoteTracker=(verifiedConfig)=>new WavGravityWhaleTracker({rpc:core.rpc,...verifiedConfig});
    const host=document.querySelector('#wav-core-demo');
    if(host && catalog.length){
      host.classList.add('wa-virtual-scroll');host.style.height='min(68dvh,760px)';
      core.virtual=new WavVirtualScroller({container:host,items:core.registry.indexToId.map(id=>core.registry.get(id)),renderItem:record=>{
        const card=document.createElement('button');card.type='button';card.className='wa-objekt-cell';
        const img=document.createElement('img');
        const url=record.thumbnailUrl??record.imageUrl;
        if(url && /^https?:|^\.\//.test(url)){img.src=url;img.loading='lazy';img.decoding='async';}
        img.alt='';card.append(img);
        const title=document.createElement('strong');title.textContent=record.memberKo??record.memberId??'Objekt';card.append(title);
        const details=document.createElement('small');details.textContent=`${record.season??''} · ${record.collectionNo??''}`;card.append(details);
        card.addEventListener('click',()=>host.dispatchEvent(new CustomEvent('wav:select-objekt',{bubbles:true,detail:{id:record.id}})));
        return card;
      }});
    }
    // Never replace original React Objekt grid: the virtualizer mounts only on the opt-in host.
    Object.defineProperty(window,'WAV155Core',{value:core,configurable:true});
    status(`WAV CORE READY · ${core.registry.rows.size.toLocaleString()} entries`);
  }catch(e){console.warn('WAV core boot skipped:',e);status('WAV CORE: '+String(e?.message??e));}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
