/* WAV ARCHIVE · 5.6 Copy polish (UI only).
 * No HTML replacement, no data writes, no click handler interception, no API use.
 * Conservative text-node updates: exact approved copy or decorative stars in UI labels.
 */
(()=>{
  'use strict';
  if (window.WAVCopy56) return;
  const translations = new Map([
    ['가능성을 모으는 곳','개인 아카이브'],
    ['Where possibilities connect','Personal archive'],
    ['可能性がつながる場所','マイアーカイブ'],
    ['내 손안의 Objekt 바인더','Objekt 바인더'],
    ['Your personal Objekt binder','Objekt binder'],
    ['手のひらのObjektバインダー','Objektバインダー'],
    ['내 기록 직접 추가','Objekt 기록 추가'],
    ['Add a personal record','Add Objekt record'],
    ['自分の記録を追加','Objektを登録'],
    ['저장 정보는 이 기기에만','데이터는 이 기기에만 저장됩니다'],
    ['Stored on this device only','Data is saved on this device'],
    ['この端末のみに保存','データはこの端末のみに保存されます'],
    ['내 Objekt, 나만의 유닛, Gravity 기록을 한곳에서.','Objekt, 유닛 구성, Gravity 기록을 한곳에서 관리합니다'],
    ['Your Objekt, your units, your Gravity records.','Manage Objekts, unit ideas and Gravity records'],
    ['Objekt・マイユニット・Gravityの記録をひとつに。','Objekt・ユニット・Gravityの記録をまとめて管理'],
    ['내가 가진 카드, 갖고 싶은 카드, 교환 가능한 카드를 직접 관리해.','보유·위시·교환할 Objekt를 관리합니다'],
    ['Keep track of owned, wanted, and tradable cards.','Manage owned, wanted and tradable Objekts'],
    ['所持・欲しい・交換できるカードを自分で管理。','所持・ウィッシュ・交換用Objektを管理します'],
    ['교환 궁합 확인','교환 목록 비교'],
    ['Compare trade lists','Compare trade lists'],
    ['交換候補を比較','交換リストを比較'],
    ['내 교환 코드 만들기','교환 코드 생성'],
    ['Create my trade code','Create trade code'],
    ['交換コードを作る','交換コードを作成'],
    ['내가 만드는 유닛','가상 유닛 만들기'],
    ['Create your own unit','Build a fan-made unit'],
    ['自分だけのユニット','オリジナルユニットを作成'],
    ['나의 추억 남기기','추억 기록'],
    ['Add a memory','Save a memory'],
    ['思い出を残す','思い出を記録'],
    ['내 손안의 Objekt 바인더','Objekt 바인더'],
    ['WAV ARCHIVE · PERSONAL LAB / 15.5+','WAV ARCHIVE · MY ARCHIVE'],
    ['WAV 15.5+ LAB','WAV LAB']
  ]);
  const decor=/[✦✧❖◆✨]/u;
  const list = 'H1,H2,H3,H4,H5,H6,BUTTON,A,SPAN,SMALL,B,STRONG,P,LABEL,SUMMARY,DIV';
  const excluded = 'script,style,noscript,template,svg,math,pre,code,kbd,samp,textarea,option,time,abbr,[contenteditable="true"],[data-wa-copy-ignore]';
  const pending=[];
  let cursor=0,scheduled=false,observer;
  const report={version:'5.6',changed:0,scanned:0};
  Object.defineProperty(window,'WAVCopy56',{value:report,configurable:false});
  function decorate(text){
    if (!decor.test(text)) return text;
    // Only standalone/leading/trailing UI decoration; leave embedded titles and user text intact.
    if (/^\s*[✦✧❖◆✨]\s*$/u.test(text)) return '';
    return text
      .replace(/^(\s*)[✦✧❖◆✨](?:\s+|(?=[\uAC00-\uD7A3A-Za-z]))/u,'$1')
      .replace(/\s+[✦✧❖◆✨](?=\s|$)/gu,'')
      .replace(/[✦✧❖◆✨]\s*$/u,'');
  }
  function polish(node){
    if (node.nodeType!==3 || !node.parentElement) return;
    const parent=node.parentElement;
    if (parent.closest(excluded) || !parent.matches(list)) return;
    // Only trusted built-in interface elements, not arbitrary user data or editable inputs.
    const before=node.nodeValue;
    const trimmed=before.trim();
    if (!trimmed || (trimmed.length>200 && !decor.test(trimmed))) return;
    report.scanned++;
    let after=translations.has(trimmed)?before.replace(trimmed,translations.get(trimmed)):before;
    after=decorate(after);
    if (after!==before){
      node.nodeValue=after;report.changed++;
      if(!after.trim() && parent.matches('span,i,em') && /^[✦✧❖◆✨]$/u.test(before.trim())){
        parent.setAttribute('aria-hidden','true');
        parent.style.display='none';
      }
    }
  }
  function add(root){
    if (!root) return;
    if (root.nodeType===3){pending.push(root);return;}
    if (root.nodeType!==1 && root.nodeType!==9 && root.nodeType!==11) return;
    if (root.nodeType===1 && root.matches(excluded))return;
    const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    while(walk.nextNode())pending.push(walk.currentNode);
  }
  function flush(deadline){
    scheduled=false;
    const start=performance.now();let count=0;
    while(cursor<pending.length && count<160 && performance.now()-start<5){
      polish(pending[cursor++]);count++;
    }
    if(cursor>=pending.length){pending.length=0;cursor=0;}
    else if(cursor>2000){pending.splice(0,cursor);cursor=0;}
    if(pending.length) schedule();
  }
  function schedule(){
    if(scheduled || document.hidden)return;
    scheduled=true;
    if('requestIdleCallback' in window)requestIdleCallback(flush,{timeout:700});
    else setTimeout(flush,16);
  }
  function start(){
    // Remove the one known decorative pseudo-star without hiding the anniversary content.
    if(!document.getElementById('wa-copy-56-safe-css')){
      const style=document.createElement('style');style.id='wa-copy-56-safe-css';
      style.textContent='.v44-otd-card.is-birthday::after{content:none!important}';
      document.head.appendChild(style);
    }
    add(document.body);schedule();
    observer=new MutationObserver(changes=>{
      for(const c of changes){
        if(c.type==='characterData')add(c.target);
        else for(const el of c.addedNodes)add(el);
      }
      schedule();
    });
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  }
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();},{passive:true});
  window.addEventListener('pagehide',()=>observer?.disconnect(),{once:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
