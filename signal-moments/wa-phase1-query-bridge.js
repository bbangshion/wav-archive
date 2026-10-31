/* Preserve the original SIGNAL player/filter. Apply optional navigation context from SEARCH OS. */
(()=>{'use strict';
  const p=new URLSearchParams(location.search);
  const member=String(p.get('wamember')||'').toUpperCase();
  const q=String(p.get('waq')||'').trim().slice(0,160);
  if(!q&&!/^S(?:0[1-9]|1\d|2[0-4])$/.test(member))return;
  const setup=()=>{
    const search=document.getElementById('search');if(!search)return false;
    if(q){search.value=q;search.dispatchEvent(new Event('input',{bubbles:true}));}
    if(/^S(?:0[1-9]|1\d|2[0-4])$/.test(member)){
      const chip=document.querySelector(`#members button[data-member="${member}"]`);
      if(!chip)return false;
      if(chip.getAttribute('aria-pressed')!=='true')chip.click();
    }
    return true;
  };
  const onReady=()=>{if(setup())return;let n=0;const timer=setInterval(()=>{if(setup()||++n>=15)clearInterval(timer)},200);};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',onReady,{once:true});else onReady();
})();
