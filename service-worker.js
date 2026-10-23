/* WAV ARCHIVE PWA — register at /wav-archive/service-worker.js, scope /wav-archive/.
 * GitHub Pages same-origin resources only. Never cache remote/private APIs.
 * 7MB index and 10MB Objekt JSON intentionally NOT precached.
 */
const VERSION='wav-shell-v11-20261024';
const SHELL=`${VERSION}-static`,RUNTIME=`${VERSION}-runtime`;
const BASE=new URL('./',self.location.href).pathname; // e.g. /wav-archive/
const url=path=>new URL(path,self.location.origin+BASE).href;
const PRECACHE=['wav-labs/offline.html','wav-labs/essentials/members-mini.json',
  'wav-labs/essentials/cheering-guide.ko.json','wav-labs/essentials/i18n/ko.json',
  'wav-labs/essentials/i18n/en.json','wav-labs/essentials/i18n/ja.json',
  'wav-labs/ui.css','wav-labs/main.mjs','wav-labs/catalog.worker.mjs','wav-labs/gravity-lab.mjs',
  'wav-labs/objekt-binder.mjs','wav-labs/unit-lab.mjs'];
const CRITICAL=new Set(PRECACHE.map(url));
const BOOT=url('wav-labs/offline.html');
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(SHELL);
    // Atomic: if an essential file fails, keep previous activated worker.
    await cache.addAll(PRECACHE.map(url));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(name=>name.startsWith('wav-shell-')&&!name.includes(VERSION))
      .map(name=>caches.delete(name)));
    await self.clients.claim();
  })());
});
const sameScope=request=>{
  const u=new URL(request.url);
  return u.origin===self.location.origin && u.pathname.startsWith(BASE);
};
async function safePut(cache,req,response){
  if(!response||!response.ok||response.type==='opaque')return;
  const size=Number(response.headers.get('content-length'))||0;
  // Avoid unexpectedly persisting big assets when using metered connectivity.
  if(size>8*1024*1024)return;
  await cache.put(req,response.clone());
}
async function staleWhileRevalidate(req,event){
  const shell=await caches.open(SHELL),run=await caches.open(RUNTIME);
  const cached=(await shell.match(req))||(await run.match(req));
  const update=fetch(req).then(async response=>{
    if(response.ok){await safePut(CRITICAL.has(req.url)?shell:run,req,response);}
    return response;
  }).catch(()=>null);
  if(cached){event.waitUntil(update);return cached;}
  return (await update)||Response.error();
}
async function navigation(req,event){
  const run=await caches.open(RUNTIME);
  const cached=await run.match(req);
  // Use cached page immediately and update in background (SWR navigation).
  if(cached){
    event.waitUntil(fetch(req).then(r=>safePut(run,req,r)).catch(()=>{}));
    return cached;
  }
  try{
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),2500);
    try{
      const response=await fetch(req,{signal:controller.signal});
      if(response.ok){await safePut(run,req,response);return response;}
    }finally{clearTimeout(timer);}
  }catch{}
  return (await caches.match(BOOT))||new Response('<h1>WAV ARCHIVE OFFLINE</h1>',
    {status:503,headers:{'Content-Type':'text/html; charset=utf-8'}});
}
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET'||!sameScope(req))return;
  const u=new URL(req.url);
  // Never stash giant live catalog or dynamically varying APIs.
  if(u.pathname.includes('/objekt-collection/data/')||u.pathname.includes('/api/'))return;
  if(req.mode==='navigate'){
    event.respondWith(navigation(req,event));return;
  }
  if(CRITICAL.has(req.url)||(/\/(essentials|wav-labs)\//.test(u.pathname)&&
    /\.(?:json|css|mjs|js|svg|webp)$/i.test(u.pathname))){
    event.respondWith(staleWhileRevalidate(req,event));
  }
});
