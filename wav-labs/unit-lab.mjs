/** Historical lineup synergies, not assertions about real members' talent. */
const cap=n=>Math.max(0,Math.min(100,Number.isFinite(n)?n:50));
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const combinations=ids=>{const pairs=[];for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++)pairs.push([ids[i],ids[j]]);return pairs;};
function overlap(a,b){const sa=new Set(a),sb=new Set(b);return [...sa].filter(x=>sb.has(x)).length;}
/** profiles: {id,yearOfBirth?,debutCohort?,dimensions:string[],
 *          vocalRating?:0-100,performanceRating?:0-100}[]
 * Ratings are OPTIONAL user-supplied subjective assessments; missing data is 50.
 */
export class WavUnitLab {
  constructor(profiles=[]){this.profiles=new Map(profiles.map(p=>[p.id,p]));}
  evaluate(memberIds,{concept='Dream'}={}){
    const ids=[...new Set(memberIds)];
    if(ids.length<2||ids.length>24)throw new Error('유닛은 최소 2명, 최대 24명을 선택하세요.');
    const rows=ids.map(id=>{const p=this.profiles.get(id);if(!p)throw new Error(`Unknown member ${id}`);return p;});
    const pairs=combinations(rows), totals=[];
    let sharedPair=0,agePair=0,cohortPair=0,conceptPair=0;
    const normalized=concept.toLowerCase();
    for(const[a,b]of pairs){
      const aa=a.dimensions||[],bb=b.dimensions||[];
      const similarity=overlap(aa,bb)/Math.max(1,new Set([...aa,...bb]).size);
      const shared=overlap(aa,bb);
      sharedPair+=Math.min(1,shared/3);
      conceptPair+=similarity;
      if(Number.isInteger(a.yearOfBirth)&&Number.isInteger(b.yearOfBirth))
        agePair+=Math.exp(-Math.abs(a.yearOfBirth-b.yearOfBirth)/4);
      else agePair+=.5;
      cohortPair+=(a.debutCohort&&a.debutCohort===b.debutCohort)?1:0;
      totals.push({pair:[a.id,b.id],sharedDimensions:shared,similarity});
    }
    const size=pairs.length;
    const history=sharedPair/size;
    const closeness=agePair/size;
    const cohorts=cohortPair/size;
    const compatibility=conceptPair/size;
    const performance=cap(35+40*history+15*cohorts+10*compatibility);
    const cohesion=cap(20+35*history+25*closeness+20*cohorts);
    const ratedVocals=rows.map(p=>p.vocalRating).filter(x=>Number.isFinite(x)&&x>=0&&x<=100);
    const ratedPerformances=rows.map(p=>p.performanceRating).filter(x=>Number.isFinite(x)&&x>=0&&x<=100);
    // Without user scores, 50 is a NEUTRAL PLACEHOLDER, not an inferred talent rating.
    const vocalBalance=ratedVocals.length===rows.length ? cap(60+40*(1-(Math.max(...ratedVocals)-Math.min(...ratedVocals))/100)) : 50;
    const subjectivePerformance=ratedPerformances.length===rows.length?cap(mean(ratedPerformances)):50;
    const conceptScore=cap(40+40*compatibility+20*history);
    const overall=cap(.35*cohesion+.30*performance+.20*conceptScore+.15*vocalBalance);
    const labels={Dream:'몽환적인 밤',Power:'강렬한 무대',Fresh:'청량한 순간',Elegant:'우아한 서사',Retro:'레트로 무드'};
    return {memberIds:ids,concept,summary:`가상 프로듀싱 분석: 이 유닛의 콘셉트는 ‘${labels[concept]||concept}’입니다. 이 수치는 공통 활동 기록 기반의 팬메이드 시뮬레이션입니다.`,
      stats:{overall,cohesion,performanceHarmony:performance,vocalBalance,subjectivePerformance,conceptScore},
      sources:{pairCount:size,pairHistory:totals,historyOverlap:history,birthYearCloseness:closeness,cohortRate:cohorts},
      disclosure:`보컬 ${ratedVocals.length}/${rows.length}명 · 퍼포먼스 ${ratedPerformances.length}/${rows.length}명 사용자 점수 입력. 미입력은 중립값 50으로 표시합니다.`};
  }
}
/** No cross-origin image requirements: by default uses ID medallions.
 * Optional provided local/permission-cleared image URLs are loaded with CORS.
 */
async function loadAllowedImage(url){
  if(!url)return null;
  return new Promise(resolve=>{
    const img=new Image();img.crossOrigin='anonymous';img.decoding='async';
    const timeout=setTimeout(()=>resolve(null),3000);
    img.onload=()=>{clearTimeout(timeout);resolve(img);};
    img.onerror=()=>{clearTimeout(timeout);resolve(null);};
    img.src=url;
  });
}
function roundRect(ctx,x,y,w,h,r,fill){
  ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();
}
function fit(ctx,value,maxWidth){
  let text=String(value);while(text.length>1&&ctx.measureText(text).width>maxWidth)text=text.slice(0,-2)+'…';return text;
}
/** canvas.toBlob PNG output; mobile-safe max 1920px for default DPR=2.
 * `artworks` maps member ID to locally hosted permitted photos.
 */
export async function exportUnitPNG(report,{artworks={},width=960,scale=2,filename='wav-unit.png'}={}){
  if(!report?.memberIds?.length)throw new Error('No unit report');
  const dpr=Math.min(2,Math.max(1,scale));
  const w=Math.min(1200,Math.max(320,width));
  const columns=report.memberIds.length>8?4:Math.min(4,report.memberIds.length);
  const rows=Math.ceil(report.memberIds.length/columns);
  const cardW=(w-96-(columns-1)*12)/columns;
  const h=290+rows*210+120;
  const canvas=document.createElement('canvas');canvas.width=Math.ceil(w*dpr);canvas.height=Math.ceil(h*dpr);
  const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('Canvas not supported');ctx.scale(dpr,dpr);
  const bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#0b0b0f');bg.addColorStop(.6,'#1e102f');bg.addColorStop(1,'#0b0b0f');
  ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  ctx.textBaseline='middle';ctx.fillStyle='#e8daf9';ctx.font='700 43px system-ui';ctx.fillText('WAV UNIT LAB',48,64);
  ctx.font='24px system-ui';ctx.fillStyle='#ad8dd8';ctx.fillText(fit(ctx,report.concept,w-96),48,111);
  ctx.fillStyle='#ffffff';ctx.font='800 80px system-ui';ctx.fillText(`${Math.round(report.stats.overall)} / 100`,48,205);
  ctx.font='17px system-ui';ctx.fillStyle='#b49ec5';ctx.fillText('Fan-made · Historical data simulation',48,244);
  const images=await Promise.all(report.memberIds.map(id=>loadAllowedImage(artworks[id])));
  for(let i=0;i<report.memberIds.length;i++){
    const id=report.memberIds[i],row=Math.floor(i/columns),col=i%columns;
    const x=48+col*(cardW+12),y=290+row*210;
    roundRect(ctx,x,y,cardW,190,18,'#271737');
    const image=images[i];
    if(image){
      ctx.save();ctx.beginPath();ctx.roundRect(x+12,y+12,cardW-24,132,10);ctx.clip();
      const ratio=Math.max((cardW-24)/image.naturalWidth,132/image.naturalHeight);
      const dw=image.naturalWidth*ratio,dh=image.naturalHeight*ratio;
      ctx.drawImage(image,x+12+(cardW-24-dw)/2,y+12+(132-dh)/2,dw,dh);ctx.restore();
    } else {
      ctx.font=`700 ${Math.min(42,cardW*.27)}px system-ui`;ctx.fillStyle='#ae91ed';ctx.textAlign='center';
      ctx.fillText(id,x+cardW/2,y+78);ctx.textAlign='left';
    }
    ctx.font='600 20px system-ui';ctx.fillStyle='#fff';ctx.fillText(id,x+16,y+168);
  }
  ctx.font='16px system-ui';ctx.fillStyle='#c5b1d2';
  ctx.fillText(report.disclosure.slice(0,85),48,h-68);
  ctx.fillText('WAV ARCHIVE · unofficial fan-made card',48,h-34);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Canvas is tainted or PNG failed')),'image/png'));
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement('a');anchor.href=url;anchor.download=filename;document.body.append(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
  return blob;
}
