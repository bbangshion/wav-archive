/* WAV ARCHIVE | 5.14 | low-overhead shared performance helper
   Keeps existing rendering, search, flip, modal and storage engines intact.
   No background frame monitor, MutationObserver, global API override or analytics. */
(()=>{'use strict';
  if(window.WAVPerf514)return;
  const LOG=[];
  const stats={deferredImages:0,asyncImages:0,deferredFrames:0,checks:0};
  const short=(s)=>String(s||'').slice(0,170);
  const onError=(e)=>{ if(LOG.length>=16)LOG.shift();LOG.push({type:'error',message:short(e.message),path:short(e.filename?.split('/').pop()),line:e.lineno||0}); };
  const onReject=(e)=>{ if(LOG.length>=16)LOG.shift();LOG.push({type:'rejection',message:short(e.reason?.message||e.reason)}); };
  addEventListener('error',onError);
  addEventListener('unhandledrejection',onReject);
  function beyondViewport(el,margin=1200){
    const rect=el.getBoundingClientRect();
    return rect.bottom < -margin || rect.top > innerHeight+margin;
  }
  function isCritical(el){
    return el.matches('[fetchpriority="high"],[loading="eager"],[data-no-lazy],.member-photo') ||
      !!el.closest('#memberGrid,dialog,[role="dialog"],.wa59-hero,.wa511-hero,.wa-home-hero,header,.wa58-site-header');
  }
  function tuneImages(){
    let list=Array.from(document.images);
    for(const el of list){
      if(!el.isConnected)continue;
      if(!el.hasAttribute('decoding')){el.decoding='async';stats.asyncImages++;}
      if(el.hasAttribute('loading')||el.complete||isCritical(el))continue;
      // Only touch not-yet-loaded, far-below-fold resources; first screen is never delayed.
      if(beyondViewport(el)){
        el.loading='lazy';
        stats.deferredImages++;
      }
    }
    list=null;
    for(const el of document.querySelectorAll('iframe[src*="youtube.com/embed"],iframe[src*="youtube-nocookie.com/embed"]')){
      if(el.hasAttribute('loading')||!beyondViewport(el,1500))continue;
      el.loading='lazy';stats.deferredFrames++;
    }
  }
  let task=0;
  function idleOnce(){
    if(task)return;
    if('requestIdleCallback' in window){task=requestIdleCallback(()=>{task=0;if(!document.hidden)tuneImages();},{timeout:2500});}
    else task=setTimeout(()=>{task=0;if(!document.hidden)tuneImages();},500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',idleOnce,{once:true});
  else idleOnce();
  // A manual test helper is opt-in; no continuous 60/120Hz sampling while browsing.
  function sampleFrames(ms=1200){
    ms=Math.max(250,Math.min(2500,Number(ms)||1200));
    if(document.hidden)return Promise.resolve(null);
    return new Promise(resolve=>{
      let start=0,last=0,intervals=[];
      function tick(now){
        if(document.hidden){resolve(null);return;}
        if(!start)start=now;
        if(last)intervals.push(now-last);
        last=now;
        if(now-start<ms){requestAnimationFrame(tick);return;}
        if(!intervals.length){resolve(null);return;}
        const sorted=intervals.slice().sort((a,b)=>a-b);
        const avg=intervals.reduce((a,b)=>a+b,0)/intervals.length;
        resolve({averageFps:Math.round(1000/avg),p95FrameMs:Math.round(sorted[Math.floor((sorted.length-1)*.95)]*10)/10,frames:intervals.length});
      }
      requestAnimationFrame(tick);
    });
  }
  function report(){
    stats.checks++;
    const n=performance.getEntriesByType('navigation')[0];
    const v4=window.__WAVPerformanceV4?.getStatus?.();
    return {version:'5.14',url:location.pathname,images:document.images.length,
      optimizations:{...stats},navigation:n?{domContentLoadedMs:Math.round(n.domContentLoadedEventEnd),loadMs:Math.round(n.loadEventEnd),transferBytes:n.transferSize||0}:null,
      v4Mode:v4?.mode||'not detected on this page',issues:LOG.slice()};
  }
  const api=Object.freeze({report,sampleFrames,errors:()=>LOG.slice()});
  Object.defineProperty(window,'WAVPerf514',{value:api,writable:false,configurable:true});
})();
