/* WAV ARCHIVE · 5.8 Shared brand header for linked tools.
   Adds navigation only; never mutates a tool's dataset, application root or events. */
(()=>{'use strict';
 if(window.WAVSharedBrand58)return;
 function init(){
   if(document.getElementById('wa58-site-header'))return;
   const pathname=location.pathname;
   // The shared assets are linked only from standalone tools, not the main site.
   document.documentElement.classList.add('wa58-standalone');
   const nav=document.createElement('nav');nav.className='wa58-site-header';nav.id='wa58-site-header';
   nav.setAttribute('aria-label','WAV ARCHIVE 공통 탐색');
   const brand=document.createElement('a');brand.className='wa58-site-brand';brand.href='../';
   brand.setAttribute('aria-label','WAV ARCHIVE 홈으로');brand.innerHTML='<span>WAV</span> <strong>ARCHIVE</strong>';
   const links=document.createElement('div');links.className='wa58-site-links';
   const home=document.createElement('a');home.href='../';home.textContent='HOME';
   const calendar=document.createElement('a');calendar.href='../#wa-auto-hub';calendar.textContent='CALENDAR';
   const archive=document.createElement('button');archive.type='button';archive.textContent='MENU';archive.setAttribute('aria-label','WAV ARCHIVE 메뉴 열기');archive.setAttribute('aria-expanded','false');
   // The main page menu can always be reached through its HOME header.
   links.append(home,calendar,archive);nav.append(brand,links);
   document.body.insertBefore(nav,document.body.firstChild);
   const drawer=document.createElement('div');drawer.className='wa58-tool-drawer';drawer.id='wa58-tool-drawer';drawer.hidden=true;
   drawer.setAttribute('aria-label','WAV ARCHIVE 메뉴');
   const menuLinks=[['HOME','../'],['MEMBERS','../#members'],['DIMENSION','../#units'],
     ['GRAVITY','../#gravity'],['CALENDAR','../#wa-auto-hub'],['HISTORY','../#timeline'],
     ['OBJECT COLLECTION','../objekt-collection/'],['SIGNAL','../signal-moments/'],
     ['WAV LAB','../wav-plus-lab/'],['최애 찾기','../wav-labs/curator.html']];
   const list=document.createElement('nav');list.setAttribute('aria-label','WAV ARCHIVE 이동 메뉴');
   menuLinks.forEach(([label,url])=>{const a=document.createElement('a');a.href=url;a.textContent=label;list.append(a);});
   drawer.append(list);nav.after(drawer);
   function setOpen(open){drawer.hidden=!open;archive.setAttribute('aria-expanded',String(open));}
   archive.addEventListener('click',()=>setOpen(drawer.hidden));
   document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!drawer.hidden)setOpen(false);});
   document.addEventListener('click',ev=>{if(!drawer.hidden&&!nav.contains(ev.target)&&!drawer.contains(ev.target))setOpen(false);});
   window.WAVSharedBrand58=Object.freeze({path:pathname});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
