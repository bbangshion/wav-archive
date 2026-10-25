/* WAV ARCHIVE — PWA install / safe live web update (no DOM observers, no personal data access) */
(()=>{'use strict';
  if(window.__waPwaInstallReady)return;
  window.__waPwaInstallReady=true;
  const root=new URL('../',new URL(document.currentScript?.src||'./wav-pwa/install.js',location.href));
  const insideSite=location.origin===root.origin && location.pathname.startsWith(root.pathname);
  if(!insideSite || !('fetch' in window))return;
  const lang=()=>{const v=(document.documentElement.lang||'ko').toLowerCase();return v.startsWith('ja')?'ja':v.startsWith('en')?'en':'ko'};
  const words={
    ko:{install:'앱 설치',help:'WAV ARCHIVE 설치',close:'닫기',
      chrome:'브라우저 오른쪽 위 ⋮ 메뉴 → 앱 설치 또는 홈 화면에 추가를 선택해 주세요',
      samsung:'삼성 인터넷 하단 메뉴(≡) → 현재 페이지 추가 → 홈 화면을 선택해 주세요',
      ios:'Safari의 공유 버튼 → 홈 화면에 추가를 선택해 주세요',
      native:'이미 WAV ARCHIVE 앱 안에서 열려 있어요\n웹사이트로 접속하면 별도의 홈 화면 앱을 설치할 수 있어요',
      updated:'새로운 사이트 내용이 준비됐어요',reload:'새로고침'},
    en:{install:'Install app',help:'Install WAV ARCHIVE',close:'Close',
      chrome:'Open the browser ⋮ menu and choose Install app or Add to Home screen',
      samsung:'In Samsung Internet, open the ≡ menu → Add page to → Home screen',
      ios:'In Safari, tap Share → Add to Home Screen',
      native:'You are already in the WAV ARCHIVE app\nOpen the website in a browser to install the web app separately',
      updated:'A website update is ready',reload:'Refresh'},
    ja:{install:'アプリを追加',help:'WAV ARCHIVE を追加',close:'閉じる',
      chrome:'ブラウザーの ⋮ メニューから「アプリをインストール」または「ホーム画面に追加」を選択してください',
      samsung:'Samsung Internet の ≡ メニュー → ページを追加 → ホーム画面を選択してください',
      ios:'Safari の共有ボタン → ホーム画面に追加を選択してください',
      native:'すでに WAV ARCHIVE アプリ内で開いています\nWebブラウザーから別のホーム画面アプリを追加できます',
      updated:'更新されたサイトが利用できます',reload:'更新'},
  };
  const t=(key)=>words[lang()][key];
  const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
  // Android WebView native APK cannot show Chromium's beforeinstallprompt dialog.
  const nativeWebview=()=>/\bwv\b/i.test(navigator.userAgent)||/; wv\)/i.test(navigator.userAgent);
  let pendingPrompt=null;
  function makeInstall(){
    if(standalone()||nativeWebview()||document.getElementById('wa-app-install'))return;
    const button=document.createElement('button');button.id='wa-app-install';button.type='button';
    button.setAttribute('aria-label',t('install'));
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('aria-hidden','true');
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','1.8');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');path.setAttribute('d','M12 3v12m-4-4 4 4 4-4M4 17v3h16v-3');svg.append(path);
    const label=document.createElement('span');label.textContent=t('install');button.append(svg,label);
    button.addEventListener('click',async()=>{
      if(pendingPrompt){const event=pendingPrompt;pendingPrompt=null;
        try{await event.prompt();const choice=await event.userChoice;
          if(choice?.outcome==='accepted'){button.hidden=true;return;}
        }catch(_){/* fall back to browser menu help */}
      }
      showHelp();
    });
    document.body.append(button);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&button.isConnected){label.textContent=t('install');button.setAttribute('aria-label',t('install'))}});
  }
  function showHelp(){
    let overlay=document.getElementById('wa-app-install-help');
    if(!overlay){overlay=document.createElement('div');overlay.id='wa-app-install-help';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
      const box=document.createElement('div');const title=document.createElement('h2');const desc=document.createElement('p');const close=document.createElement('button');close.type='button';
      close.addEventListener('click',()=>{overlay.hidden=true;});overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.hidden=true});
      overlay.append(box);box.append(title,desc,close);document.body.append(overlay);
    }
    const [title,desc,close]=overlay.firstElementChild.children;
    title.textContent=t('help');const ua=navigator.userAgent;
    desc.textContent=nativeWebview()?t('native'):/iPhone|iPad|iPod/.test(ua)?t('ios'):/SamsungBrowser/i.test(ua)?t('samsung'):t('chrome');
    close.textContent=t('close');overlay.hidden=false;close.focus();
  }
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();pendingPrompt=event;makeInstall();});
  window.addEventListener('appinstalled',()=>{pendingPrompt=null;document.getElementById('wa-app-install')?.remove();});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',makeInstall,{once:true});else makeInstall();

  // Do not clear browser storage, IndexedDB or Cache Storage. Only refresh the *document* when safe.
  // Most browsers/Android WebViews re-fetch navigation through a network-first service worker.
  const workerUrl=new URL('wav-live-sw.js',root);
  const sw=window.navigator.serviceWorker;
  if(sw){window.addEventListener('load',()=>{
    sw.register(workerUrl.href,{scope:root.pathname,updateViaCache:'none'})
      .then(reg=>{reg.update().catch(()=>{});})
      .catch(error=>console.warn('[WAV ARCHIVE] offline support unavailable:',error));
  },{once:true});}
  let lastCheck=0,previous='',busy=false,hiddenAt=0,shownNotice=false;
  const storageKey='wa-archive-live-etag-v1';
  try{previous=sessionStorage.getItem(storageKey)||''}catch(_){}
  function canAutoRefresh(){
    const active=document.activeElement;
    if(document.visibilityState!=='visible')return false;
    if(active?.matches?.('input,textarea,select,[contenteditable="true"]'))return false;
    if(document.querySelector('dialog[open], [aria-modal="true"], .wa-grouped-menu.open, .modal.open'))return false;
    return ![...document.querySelectorAll('audio,video')].some(el=>!el.paused);
  }
  function showRefresh(){
    if(shownNotice)return;shownNotice=true;
    const panel=document.createElement('div');panel.id='wa-app-update';panel.setAttribute('role','status');
    const msg=document.createElement('span');msg.textContent=t('updated');const button=document.createElement('button');button.type='button';button.textContent=t('reload');
    button.addEventListener('click',()=>location.reload());panel.append(msg,button);document.body.append(panel);
  }
  async function checkFreshness(afterResume=false){
    if(document.visibilityState==='hidden'||!navigator.onLine||busy)return;
    const now=Date.now();if(now-lastCheck<120000)return;lastCheck=now;busy=true;
    try{
      const response=await fetch(new URL('index.html',root),{method:'HEAD',cache:'no-store',credentials:'same-origin'});
      if(!response.ok)return;
      // Only stable entity validators; never infer an update from Date headers.
      const mark=response.headers.get('etag')||response.headers.get('last-modified')||'';
      if(!mark)return;
      const changed=!!previous&&previous!==mark;
      previous=mark;
      try{sessionStorage.setItem(storageKey,mark)}catch(_){}
      if(changed){
        if(afterResume&&canAutoRefresh()){location.reload();return;}
        showRefresh();
      }
    }catch(_){/* Offline or GitHub Pages temporarily unreachable: keep current UI */}
    finally{busy=false;}
  }
  window.addEventListener('load',()=>{setTimeout(()=>checkFreshness(),1800);},{once:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){hiddenAt=Date.now();return;}
    if(hiddenAt&&Date.now()-hiddenAt>45000)checkFreshness(true);
  });
  window.addEventListener('pageshow',event=>{if(event.persisted)checkFreshness(true)});
})();
