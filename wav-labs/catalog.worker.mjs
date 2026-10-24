/** Parse the 10+ MB GitHub snapshot OFF the main thread.
 * Reuses the deployed PHASE 9 normalizer, preserving S01–S24 keys.
 */
import {transformObjektData} from '../objekt-collection/objektData.mjs';
self.addEventListener('message',async event=>{
  if(event.data?.type!=='LOAD')return;
  try{
    const [catalogResponse,membersResponse]=await Promise.all([
      fetch('../objekt-collection/data/objekt-top.json',{cache:'no-cache'}),
      fetch('../objekt-collection/members.json',{cache:'force-cache'})
    ]);
    if(!catalogResponse.ok||!membersResponse.ok)throw new Error('Cannot load Objekt snapshot or master members');
    const [payload,members]=await Promise.all([catalogResponse.json(),membersResponse.json()]);
    const report=transformObjektData([{source:'objekt.top',payload}],members);
    // No transfer of image data; IDs are stable season:member:class:number.
    const catalog=report.rows.map(row=>({id:row.id,memberId:row.memberId,season:row.season,
      klass:row.class,collectionNo:row.collectionNo}));
    self.postMessage({type:'READY',catalog,report:{skipped:report.skipped,duplicates:report.duplicates}});
  }catch(error){self.postMessage({type:'ERROR',error:String(error.message||error)});}
});
