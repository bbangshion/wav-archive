import {unpackCatalog,normalizeObjekt} from './lab-core.mjs';
self.onmessage=e=>{try{
 const json=JSON.parse(e.data);const arr=unpackCatalog(json);if(!arr.length)throw Error('카탈로그 배열이 없어.');
 const seen=new Set();const out=[];
 for(const entry of arr){const r=normalizeObjekt(entry);if(r&&!seen.has(r.id)){seen.add(r.id);out.push(r)}}
 self.postMessage({ok:true,rows:out,raw:arr.length});
}catch(err){self.postMessage({ok:false,error:String(err.message??err)})}};
