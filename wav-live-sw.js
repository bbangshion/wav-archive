/* WAV ARCHIVE — small network-first app shell. Does NOT manage IndexedDB or user files. */
const CACHE='wa-archive-live-shell-1';
const ROOT=new URL('./',self.location.href);
const HOME=new URL('index.html',ROOT).href;
const OFFLINE='<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#12121c"><title>WAV ARCHIVE</title><style>body{font:16px system-ui;background:#12121c;color:#faf7ff;padding:40px 20px}p{color:#bbb}</style><h1>WAV ARCHIVE</h1><p>네트워크 연결을 확인한 뒤 다시 열어 주세요</p>';
self.addEventListener('install',event=>{event.waitUntil(self.skipWaiting())});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const all=await caches.keys();await Promise.all(all.filter(k=>k.startsWith('wa-archive-live-shell-')&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
const allowed=req=>{const u=new URL(req.url);return u.origin===ROOT.origin&&u.pathname.startsWith(ROOT.pathname)};
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET'||!allowed(req))return;
  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      const u=new URL(req.url),isHome=(u.pathname===ROOT.pathname||u.pathname===new URL(HOME).pathname);
      try{
        // Always obtain current GitHub Pages HTML when online, even in an installed APK/PWA.
        const network=await fetch(req,{cache:'no-store'});
        if(network.ok&&isHome&&network.type==='basic'){
          const copy=network.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(HOME,copy)).catch(()=>{}));
        }
        return network;
      }catch(_){
        const saved=await caches.match(isHome?HOME:req);
        return saved||new Response(OFFLINE,{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}});
      }
    })());
    return;
  }
  // Never store catalog/API results or modify user requests. Revalidate scripts/styles
  // so old WebView HTTP caches don't hide new releases.
  const u=new URL(req.url);
  if(req.destination==='script'||req.destination==='style'||u.pathname.endsWith('.webmanifest')){
    event.respondWith(fetch(req,{cache:'no-cache'}).catch(()=>caches.match(req).then(r=>r||Response.error())));
  }
});
