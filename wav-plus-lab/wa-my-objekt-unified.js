/* WAV ARCHIVE 16.0 — two tools, one MY OBJEKT menu entry.
   Original binder remains completely unchanged; analytics is loaded on demand.
   No changes to IndexedDB keys, images, catalog or other modules.
*/
(()=>{'use strict';
  const root=document.getElementById('binder');
  const tabs=root?.querySelector('.wa-objekt-unify-tabs');
  const old=root?.querySelector('#wa-myobj-legacy');
  const lab=root?.querySelector('#wa-myobj-analytics');
  const frame=root?.querySelector('#waMyObjektLabFrame');
  if(!root||!tabs||!old||!lab||!frame)return;
  let loaded=false;
  const activate=kind=>{
    const analytics=kind==='analytics';
    old.hidden=analytics;lab.hidden=!analytics;
    tabs.querySelectorAll('button[data-objekt-view]').forEach(btn=>{
      const active=btn.dataset.objektView===(analytics?'analytics':'binder');
      btn.setAttribute('aria-selected',String(active));btn.tabIndex=active?0:-1;
    });
    if(analytics&&!loaded){
      frame.src=new URL('../objekt-data-lab/index.html',location.href).href;
      loaded=true;
    }
    // The inactive iframe is unloaded to avoid GPU/memory pressure, at the cost
    // of discarding its unsaved form input (saved collection records persist).
    if(!analytics&&loaded){frame.src='about:blank';loaded=false}
  };
  tabs.addEventListener('click',e=>{
    const button=e.target.closest?.('button[data-objekt-view]');
    if(!button)return;
    activate(button.dataset.objektView);
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='hidden'&&loaded){frame.src='about:blank';loaded=false}
    else if(document.visibilityState==='visible'&&!loaded&&!lab.hidden){
      frame.src=new URL('../objekt-data-lab/index.html',location.href).href;loaded=true
    }
  },{passive:true});
  const params=new URLSearchParams(location.search);
  activate(params.get('objektView')==='analytics'?'analytics':'binder');
})();
