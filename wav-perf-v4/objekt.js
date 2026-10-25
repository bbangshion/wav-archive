/* Separate Objekt route: preserve existing React/TanStack virtualizer and IndexedDB. */
(()=>{'use strict';
  if(window.__WavObjektPerfV4)return;
  const root=document.documentElement;
  const aborter=new AbortController();
  let idle=0,started=false;
  function move(){
    if(!started){started=true;root.classList.add('wa-perf-ambient-paused');}
    clearTimeout(idle);
    idle=setTimeout(()=>{started=false;root.classList.remove('wa-perf-ambient-paused');},250);
  }
  document.addEventListener('scroll',move,{passive:true,capture:true,signal:aborter.signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(idle);started=false;root.classList.remove('wa-perf-ambient-paused');}},{signal:aborter.signal});
  window.__WavObjektPerfV4={destroy(){aborter.abort();clearTimeout(idle);root.classList.remove('wa-perf-ambient-paused');}};
})();
