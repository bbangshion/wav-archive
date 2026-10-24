/** WAV ARCHIVE · Gravity Race Lab
 * Data contract:
 * {id,date,category,isGrand?,durationHours?,options:[{id, memberIds:['S01'],
 *  dimensionType:'Dream', votes:12345}], winnerOptionIds?:['id']}[]
 * Votes are votes cast by FANS for options, not votes cast by members.
 * Member support is an ALLOCATED PROXY (1 / option roster size).
 */
const finite = n => typeof n === 'number' && Number.isFinite(n);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const add = (map, k, field, n) => {
  if (!map.has(k)) map.set(k, {memberId:k, appearances:0, wins:0, allocatedComo:0,
    totalPollComo:0, perDimension:new Map()});
  map.get(k)[field] += n;
};
export class GravityRaceLab {
  constructor(polls = []) { this.load(polls); }
  load(polls) {
    if (!Array.isArray(polls)) throw new TypeError('Polls must be an array');
    this.polls = polls.map(p => {
      if (!p || !Array.isArray(p.options) || !Number.isFinite(Date.parse(p.date)))
        throw new TypeError('Each poll needs date/options');
      const options = p.options.map(o => {
        if (!o || !finite(o.votes) || o.votes < 0 || !Array.isArray(o.memberIds))
          throw new TypeError(`Invalid option in ${p.id}`);
        return {...o, votes:o.votes, memberIds:[...new Set(o.memberIds.filter(x=>/^S(?:0[1-9]|1\d|2[0-4])$/.test(x)))]};
      });
      const totalVotes = options.reduce((s,o)=>s+o.votes,0);
      const top = Math.max(0,...options.map(o=>o.votes));
      const winners = new Set(p.winnerOptionIds?.length ? p.winnerOptionIds :
        options.filter(o=>top>0 && o.votes===top).map(o=>o.id));
      return {...p, options, totalVotes, winners, ms:Date.parse(p.date)};
    }).sort((a,b)=>a.ms-b.ms);
  }
  /** One 'appearance' per member per poll, even if multiple options include them.
   * For multiple options involving a member, the winning fraction is capped to 1.
   */
  memberStats({category=null}={}) {
    const stats = new Map();
    for (const poll of this.polls) {
      if (category && poll.category !== category) continue;
      const grouped = new Map();
      for (const o of poll.options) {
        for (const memberId of o.memberIds) {
          const item = grouped.get(memberId) || {allocatedComo:0, wins:0, dimension:new Map()};
          const w = 1 / Math.max(1,o.memberIds.length);
          item.allocatedComo += o.votes * w;
          item.wins = Math.max(item.wins, poll.winners.has(o.id) ? 1/Math.max(1,poll.winners.size) : 0);
          const key = o.dimensionType || poll.category || 'Uncategorized';
          if (!item.dimension.has(key)) item.dimension.set(key,{allocatedComo:0,win:0});
          item.dimension.get(key).allocatedComo += o.votes*w;
          item.dimension.get(key).win = Math.max(item.dimension.get(key).win, poll.winners.has(o.id) ? 1/Math.max(1,poll.winners.size) : 0);
          grouped.set(memberId,item);
        }
      }
      for (const [memberId,item] of grouped) {
        add(stats,memberId,'appearances',1);
        add(stats,memberId,'wins',item.wins);
        add(stats,memberId,'allocatedComo',item.allocatedComo);
        add(stats,memberId,'totalPollComo',poll.totalVotes);
        const s=stats.get(memberId);
        for (const [key,dim] of item.dimension) {
          const old=s.perDimension.get(key)||{appearances:0,wins:0,allocatedComo:0};
          old.appearances++;
          old.wins+=dim.win;
          old.allocatedComo+=dim.allocatedComo;
          s.perDimension.set(key,old);
        }
      }
    }
    return [...stats.values()].map(s=>({
      memberId:s.memberId, appearances:s.appearances,
      wins:s.wins, winRate:s.appearances?s.wins/s.appearances:0,
      allocatedComo:s.allocatedComo,
      allocatedSupportShare:s.totalPollComo?s.allocatedComo/s.totalPollComo:0,
      dimensions:[...s.perDimension].map(([dimension,d])=>({
        dimension,appearances:d.appearances, wins:d.wins,
        winRate:d.appearances?d.wins/d.appearances:0,
        allocatedComo:d.allocatedComo
      })).sort((a,b)=>b.winRate-a.winRate||b.appearances-a.appearances)
    })).sort((a,b)=>b.winRate-a.winRate||b.allocatedComo-a.allocatedComo);
  }
  /** Index 100 = volume of earliest non-zero Grand Gravity.
   * Counts only polls with positive votes, with explicit comparison and intervals.
   * It is an absolute vote VOLUME index, not a unique-fan count.
   */
  voteInflationIndex({category='Grand Gravity'}={}) {
    const selected=this.polls.filter(p=>p.isGrand || p.category===category)
      .filter(p=>p.totalVotes>0).sort((a,b)=>a.ms-b.ms);
    const base=selected[0]?.totalVotes??0;
    let previous=null;
    return selected.map(p=>{
      const period=previous?(p.ms-previous.ms)/86400000:null;
      const change=previous&&previous.totalVotes?p.totalVotes/previous.totalVotes-1:null;
      const dailyGrowth=(period&&period>0&&previous&&previous.totalVotes)?
        Math.pow(p.totalVotes/previous.totalVotes,1/period)-1:null;
      const row={id:p.id,date:p.date,votes:p.totalVotes,index:100*p.totalVotes/base,
        growthFromPrevious:change,daysSincePrevious:period,dailyCompoundGrowth:dailyGrowth,
        votesPerHour:finite(p.durationHours)&&p.durationHours>0?p.totalVotes/p.durationHours:null};
      previous=p; return row;
    });
  }
  /** Pearson association is descriptive, NOT causal; sample count required. */
  correlationForDimension(dimensionType) {
    const rows=this.polls.map(p=>{
      const numerator=p.options.filter(o=>o.dimensionType===dimensionType).reduce((s,o)=>s+o.votes,0);
      return {x:p.ms,y:p.totalVotes?numerator/p.totalVotes:NaN};
    }).filter(v=>finite(v.y));
    const n=rows.length; if(n<3) return {n,r:null};
    const ox=rows.reduce((s,p)=>s+p.x,0)/n, oy=rows.reduce((s,p)=>s+p.y,0)/n;
    let xy=0,xx=0,yy=0;
    for(const p of rows){const a=p.x-ox,b=p.y-oy;xy+=a*b;xx+=a*a;yy+=b*b;}
    return {n,r:xx>0&&yy>0?clamp(xy/Math.sqrt(xx*yy),-1,1):null};
  }
}
/** XSS-safe: all SVG is produced through createElementNS and textContent. */
export function drawGravitySVG(host,points,{title='Grand Gravity · COMO volume',format=v=>Math.round(v).toLocaleString('ko-KR')}={}) {
  host.replaceChildren();
  const ns='http://www.w3.org/2000/svg';
  const node=(tag,attrs={},parent=null)=>{
    const el=document.createElementNS(ns,tag); for(const[k,v]of Object.entries(attrs))el.setAttribute(k,String(v));
    if(parent)parent.append(el);return el;
  };
  const rows=points.filter(p=>finite(p.votes) && finite(Date.parse(p.date))).sort((a,b)=>Date.parse(a.date)-Date.parse(b.date));
  if(!rows.length){host.textContent='표시할 Gravity 투표 데이터가 없습니다.';return null;}
  const w=700,h=260,pad={left:68,right:18,top:25,bottom:45};
  const svg=node('svg',{viewBox:`0 0 ${w} ${h}`,role:'img','aria-label':title,preserveAspectRatio:'xMidYMid meet'});
  const desc=node('title',{},svg); desc.textContent=title;
  const x0=Math.min(...rows.map(p=>Date.parse(p.date))), x1=Math.max(...rows.map(p=>Date.parse(p.date)));
  const maxY=Math.max(1,...rows.map(p=>p.votes))*1.08;
  const x=ms=>pad.left+(x1===x0?.5:(ms-x0)/(x1-x0))*(w-pad.left-pad.right);
  const y=v=>h-pad.bottom-(v/maxY)*(h-pad.top-pad.bottom);
  for(let i=0;i<=4;i++){
    const value=maxY*i/4,yy=y(value);
    node('line',{x1:pad.left,x2:w-pad.right,y1:yy,y2:yy,stroke:'currentColor','stroke-opacity':.14},svg);
    const text=node('text',{x:pad.left-9,y:yy+4,'text-anchor':'end',fill:'currentColor','font-size':11},svg);
    text.textContent=format(value);
  }
  const d=rows.map((p,i)=>`${i?'L':'M'} ${x(Date.parse(p.date)).toFixed(1)} ${y(p.votes).toFixed(1)}`).join(' ');
  node('path',{d,fill:'none',stroke:'var(--neon-purple,#a883ff)','stroke-width':3,'stroke-linecap':'round','stroke-linejoin':'round'},svg);
  rows.forEach(p=>{
    const circle=node('circle',{cx:x(Date.parse(p.date)),cy:y(p.votes),r:4,fill:'var(--neon-purple,#a883ff)'},svg);
    const t=node('title',{},circle); t.textContent=`${p.date.slice(0,10)} · ${format(p.votes)} COMO`;
  });
  for(const idx of [...new Set([0,Math.floor((rows.length-1)/2),rows.length-1])]) {
    const p=rows[idx];const text=node('text',{x:x(Date.parse(p.date)),y:h-16,'text-anchor':'middle',fill:'currentColor','font-size':11},svg);
    text.textContent=p.date.slice(0,10);
  }
  host.append(svg);return svg;
}
