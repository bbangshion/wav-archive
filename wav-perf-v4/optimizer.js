/* WAV ARCHIVE 16 · Mobile Runtime V4
 * Goal: eliminate duplicate scroll governors, keep card flips and data engines untouched.
 * No monkey-patching rAF/addEventListener, no global element-wide will-change.
 */
(()=>{
  'use strict';
  if (window.__WAVPerformanceV4) return;
  const root = document.documentElement;
  const mobile = matchMedia('(pointer:coarse), (max-width:860px)').matches;
  const modeKey = 'wav_performance_v4_mode';
  const recognized = new Set(['auto','balanced','eco','off']);
  let mode = 'auto';
  try {
    const saved=localStorage.getItem(modeKey);
    if(recognized.has(saved))mode=saved;
    const requested=new URLSearchParams(location.search).get('waPerf');
    if(recognized.has(requested)){mode=requested;localStorage.setItem(modeKey,requested);}
  } catch (_) {}
  let signal = 0, lastInput=Date.now(), renderTimer=0, pending=false, streakBad=0, streakGood=0;
  let batteryLow=false, destroyed=false, observer=null, flipGrid=null;
  const activeCards=new Map();
  const aborter=new AbortController();
  const listen={passive:true,signal:aborter.signal};
  const frameThreshold=1000/60;
  const lowMemory=(navigator.deviceMemory && navigator.deviceMemory <= 4)
    || (navigator.hardwareConcurrency && navigator.hardwareConcurrency<=4);
  const reduceMotion=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let automaticEco=!!(lowMemory || reduceMotion);
  let current='off';
  function desired(){
    if(!mobile || mode==='off') return 'off';
    if(mode==='eco') return 'eco';
    if(mode==='balanced') return 'balanced';
    return (automaticEco || batteryLow) ? 'eco' : 'balanced';
  }
  function pulseCanvas(){
    if(document.body)document.body.classList.toggle('wa-perf-render-pulse');
  }
  function applyMode(){
    const next=desired();
    if(next===current) return;
    current=next;
    root.classList.toggle('wa16-perf',next!=='off');
    root.classList.toggle('wa16-eco',next==='eco');
    root.dataset.waPerfV4=next;
    pulseCanvas();
    window.dispatchEvent(new CustomEvent('wav:performance-mode',{detail:{mode:next}}));
  }
  applyMode();
  function offAmbient(){
    clearTimeout(renderTimer); renderTimer=0;
    root.classList.remove('wa-perf-ambient-paused');
    pulseCanvas();
  }
  function markInput(){ lastInput=Date.now(); }
  function onScroll(){
    if(destroyed||current==='off') return;
    lastInput=Date.now();
    if(!pending){
      pending=true;
      root.classList.add('wa-perf-ambient-paused');
      pulseCanvas();
    }
    if(renderTimer) clearTimeout(renderTimer);
    renderTimer=setTimeout(()=>{ pending=false; offAmbient(); },240);
  }
  function onVisibility(){
    if(document.hidden){
      clearTimeout(renderTimer);pending=false;offAmbient();
      root.classList.add('wa16-inactive');
      for(const [card,timer] of activeCards){clearTimeout(timer);card.classList.remove('wa16-flipping');}
      activeCards.clear();
    }else{
      root.classList.remove('wa16-inactive');
      lastInput=Date.now();
    }
  }
  // Capture scroll on nested scrollports too; scroll handlers never call preventDefault.
  document.addEventListener('scroll',onScroll,{capture:true,passive:true,signal:aborter.signal});
  document.addEventListener('touchmove',markInput,listen);
  document.addEventListener('pointerdown',markInput,listen);
  document.addEventListener('visibilitychange',onVisibility,{signal:aborter.signal});
  window.addEventListener('pagehide',onVisibility,listen);

  // Only the flipping member card gets a promoted compositor layer.
  function clearCard(card){
    const t=activeCards.get(card);if(t)clearTimeout(t);
    activeCards.delete(card);
    card.classList.remove('wa16-flipping');
  }
  function armCard(card){
    if(!card || current==='off') return;
    if(activeCards.has(card))clearTimeout(activeCards.get(card));
    card.classList.add('wa16-flipping');
    activeCards.set(card,setTimeout(()=>clearCard(card),850));
  }
  function attachCards(){
    const grid=document.getElementById('memberGrid');
    if(!grid || grid===flipGrid) return;
    flipGrid=grid;
    const warm=(event)=>{
      const card=event.target?.closest?.('.member-card');
      if(card && grid.contains(card))armCard(card);
    };
    grid.addEventListener('pointerdown',warm,{capture:true,passive:true,signal:aborter.signal});
    grid.addEventListener('keydown',event=>{
      if(event.key==='Enter' || event.key===' ' )warm(event);
    },{signal:aborter.signal});
    grid.addEventListener('transitionend',event=>{
      if(event.propertyName==='transform' && event.target?.matches?.('.member-card-inner')){
        const card=event.target.closest('.member-card');if(card)clearCard(card);
      }
    },{capture:true,signal:aborter.signal});
    // Never rewrite image URLs; preserve profile mappings and 3D flip state.
    for(const image of grid.querySelectorAll('img.member-photo')){
      image.decoding='async';
      if(!image.complete && image.getBoundingClientRect().top>innerHeight+500){
        if(!image.hasAttribute('loading'))image.loading='lazy';
      }
    }
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',attachCards,{once:true,signal:aborter.signal});
  }else attachCards();
  // All battery/frame monitoring is optional and does not require permission.
  if(typeof navigator.getBattery==='function'){
    Promise.resolve().then(()=>navigator.getBattery()).then(battery=>{
      if(destroyed)return;
      const update=()=>{batteryLow=(!battery.charging && battery.level<.23);applyMode();};
      update();
      battery.addEventListener('chargingchange',update,{signal:aborter.signal});
      battery.addEventListener('levelchange',update,{signal:aborter.signal});
    }).catch(()=>{});
  }

  // Bounded sample windows: no always-on 120Hz monitoring loop and no wakeups when hidden.
  function measureFrameWindow(duration=1800){
    if(document.hidden||destroyed)return Promise.resolve(null);
    return new Promise(resolve=>{
      const samples=[];let start=0,last=0;
      function frame(t){
        if(destroyed||document.hidden){resolve(null);return;}
        if(!start)start=t;
        if(last)samples.push(t-last);
        last=t;
        if(t-start<duration){requestAnimationFrame(frame);return;}
        if(samples.length<25){resolve(null);return;}
        const sorted=[...samples].sort((a,b)=>a-b);
        const median=sorted[Math.floor(sorted.length/2)];
        // Baseline based on actual refresh cadence: 60/90/120 Hz supported.
        const baseline=Math.max(1000/144,Math.min(1000/30,median));
        const p95=sorted[Math.floor((sorted.length-1)*.95)];
        const longFrames=samples.filter(x=>x>Math.max(frameThreshold*2,baseline*2.2)).length;
        const report={fps:Math.round(1000/(samples.reduce((a,b)=>a+b,0)/samples.length)),
          p95Ms:+p95.toFixed(1),medianMs:+median.toFixed(1),
          jankPercent:+(100*longFrames/samples.length).toFixed(1),frames:samples.length};
        resolve(report);
      }
      requestAnimationFrame(frame);
    });
  }
  let monitorTimer=0;
  async function monitor(){
    if(destroyed)return;
    if(current==='off' || document.hidden || Date.now()-lastInput>60000){scheduleMonitor();return;}
    const metric=await measureFrameWindow(1600);
    if(metric){
      // Hysteresis: a single scroll/spike will not flash the page by changing effects.
      const bad=metric.jankPercent>13 || metric.p95Ms>45;
      streakBad=bad?streakBad+1:0;
      streakGood=bad?0:streakGood+1;
      if(mode==='auto' && streakBad>=2){automaticEco=true;applyMode();}
      if(mode==='auto' && streakGood>=5 && !lowMemory && !batteryLow && !reduceMotion){
        automaticEco=false;applyMode();
      }
    }
    scheduleMonitor();
  }
  function scheduleMonitor(){if(!destroyed)monitorTimer=setTimeout(monitor,45000);}
  if(mobile)monitorTimer=setTimeout(monitor,15000);
  function setMode(value){
    if(!recognized.has(value))throw new TypeError('Expected auto | balanced | eco | off');
    mode=value;
    try{localStorage.setItem(modeKey,value);}catch(_){}
    applyMode();return current;
  }
  function destroy(){
    if(destroyed)return;destroyed=true;
    aborter.abort();
    clearTimeout(monitorTimer);clearTimeout(renderTimer);
    for(const [card,t] of activeCards){clearTimeout(t);card.classList.remove('wa16-flipping');}
    activeCards.clear();
    observer?.disconnect();
    root.classList.remove('wa-perf-ambient-paused','wa16-perf','wa16-eco','wa16-inactive');
    delete root.dataset.waPerfV4;
  }
  // Retain the diagnostic API previously exposed by the V1 controller.
  if(!window.WAVPerformanceCheck)window.WAVPerformanceCheck=measureFrameWindow;
  window.__WAVPerformanceV4={version:'4.0',setMode,getStatus:()=>({mode:current,chosen:mode,mobile,
    batteryLow,lowMemory,automaticEco,monitor:'periodic 1.6s every 45s'}),measure:measureFrameWindow,destroy};
})();
