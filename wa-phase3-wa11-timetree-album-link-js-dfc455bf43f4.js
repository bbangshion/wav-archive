
/* WAV ARCHIVE 11 — DIMENSION TIMETREE × DISCOGRAPHY DATA BINDING
 * This is an add-on. Existing node click handlers, the original popup, geometry,
 * DNA filters, members, gyroscope and CSS remain untouched.
 * Album data are read live from #discography; no replacement data are invented.
 */
(()=>{
 'use strict';
 const root=document.getElementById('waDimensionTimeTree');
 const modal=document.getElementById('waTTAlbumDialog');
 if(!root||!modal||modal.dataset.albumBound==='1')return;
 const list=document.getElementById('waTTAlbumList');
 const title=document.getElementById('waTTAlbumTitle');
 const intro=document.getElementById('waTTAlbumIntro');
 const closeButton=document.getElementById('waTTAlbumClose');
 const originalButton=document.getElementById('waTTAlbumOriginal');
 const discographyButton=document.getElementById('waTTAlbumDiscography');
 const footerNote=document.getElementById('waTTAlbumSourceNote');
 if(!list||!title||!closeButton)return;
 const colors={'AAA':'#e7a4da','+(KR)ystal Eyes':'#ffd7de','ACID EYES':'#fa9acb','LOVElution':'#bc9bff','EVOLution':'#b0b3ff','NXT':'#8bdce6','Aria':'#f7b5dd','Glow':'#aeeace','Visionary Vision':'#99c7ff','∞!':'#e7c2ff','Alphie':'#ebbdff','MSNZ':'#83e5e9','moon':'#c9a7ff','sun':'#ffc78f','neptune':'#9be4e6','zenith':'#ffb6e4'};
 const msnzNames=new Set(['MSNZ','moon','sun','neptune','zenith']);
 const aliases={
  'AAA':['Acid Angel from Asia','AAA'],
  '+(KR)ystal Eyes':['+(KR)ystal Eyes'],
  'ACID EYES':['ACID EYES','Acid Eyes'],
  'LOVElution':['LOVElution'],
  'EVOLution':['EVOLution'],
  'NXT':['NXT'],
  'Aria':['Aria'],
  'Glow':['Glow'],
  'Visionary Vision':['Visionary Vision','VV'],
  '∞!':['tripleS ∞!','∞!','Hatchi'],
  'Alphie':['Alphie'],
  'MSNZ':['msnz'],
  'moon':['msnz'], 'sun':['msnz'], 'neptune':['msnz'], 'zenith':['msnz']
 };
 /* Only source-verified official @triplescosmos URLs; never fabricate a video id.
    When an album's official video has not been verified, provide a channel search instead. */
 const officialVideoByDimension={
  'moon':{id:'With0YDpuWQ',title:'Cameo Love'},
  'sun':{id:'LfS0-022cq8',title:'Bubble Gum Girl'},
  'neptune':{id:'vpXtzSpyV_8',title:'Fly Up'},
  'zenith':{id:'TvmLPQ7iBLQ',title:'Q&A'}
 };
 const officialVideo={
  'wa-record-03':{id:'uE_T_t6s_Go',type:'MV'},
  'wa-record-06':{id:'OvtoY0lfYJ8',type:'MV'},
  'wa-record-07':{id:'KMythzAnNK0',type:'MV'},
  'wa-record-08':{id:'s3IfM-u5hVc',type:'PERFORMANCE'},
  'wa-record-09':{id:'PqKZctzEW1o',type:'MV'},
  'wa-record-12':{id:'9bfWvaQskLU',type:'PERFORMANCE'},
  'wa-record-13':{id:'aKyt6Ahxwss',type:'MV'}
 };
 let current=null,lastTrigger=null;
 const isEnglish=()=>document.documentElement.lang==='en'||document.documentElement.dataset.language==='en';
 const normalize=value=>String(value||'').normalize('NFKC').toLowerCase().replace(/[\s.\-_]+/g,'').replace(/[’‘]/g,"'");
 const el=(tag,className,text)=>{
   const node=document.createElement(tag);
   if(className)node.className=className;
   if(text!==undefined)node.textContent=String(text);
   return node;
 };
 const text=(parent,selector)=>parent.querySelector(selector)?.textContent?.trim()||'';
 function readDiscography(){
  return [...document.querySelectorAll('#discography .disco-db-card')].map(card=>{
    const title=text(card,'h3');
    const artist=text(card,'.disco-db-artist');
    const focus=text(card,'.disco-db-focus');
    const date=text(card,'.wa-release-date');
    const tracks=[...card.querySelectorAll('.wa07-tracks li')].map(li=>{
      const number=text(li,'.wa-track-no');
      const clone=li.cloneNode(true);
      clone.querySelector('.wa-track-no')?.remove();
      return {number,name:clone.textContent.trim()};
    }).filter(item=>item.name);
    // Support explicit artwork / MV URLs added to the original discography in future versions.
    const artwork=card.dataset.albumCover||card.querySelector('img[data-album-cover]')?.getAttribute('src')||'';
    const video=officialVideo[card.id]||null;
    const mvURL=card.dataset.officialMv||'';
    const mvStart=Number(card.dataset.mvStart||0);
    return {id:card.id,title,artist,focus,date,year:card.dataset.year||'',tracks,artwork,video,mvURL,mvStart,card};
  }).filter(record=>record.title&&record.artist);
 }
 function getDimensionAlbums(name){
  const targets=(aliases[name]||[name]).map(normalize);
  return readDiscography().filter(record=>targets.includes(normalize(record.artist)));
 }
 function getOfficialVideo(record,name){
   if(record.id==='wa-record-18'&&officialVideoByDimension[name])return {...officialVideoByDimension[name],type:'MV'};
  if(record.mvURL){
    try{
      const url=new URL(record.mvURL,location.href);
      if(url.protocol!=='https:' || !(['www.youtube.com','youtube.com','youtu.be','www.youtube-nocookie.com'].includes(url.hostname)))return null;
      const id=url.hostname==='youtu.be'?url.pathname.slice(1):url.searchParams.get('v')||url.pathname.match(/\/embed\/([^/]+)/)?.[1];
      if(id&&/^[a-zA-Z0-9_-]{11}$/.test(id))return{id,type:'MV'};
    }catch(_error){return null;}
  }
  return record.video;
 }
 function parseTimestamp(raw){
   const parts=String(raw||'').trim().split(':');
   if(parts.length<2||parts.length>3||!parts.every(p=>/^\d{1,2}$/.test(p)))return 0;
   const nums=parts.map(Number);
   if(nums.slice(1).some(n=>n>59))return 0;
   return Math.max(0,Math.min(24*60*60,nums.reduce((sum,n)=>sum*60+n,0)));
 }
 function displayTimestamp(total){
   const sec=Math.max(0,Math.floor(Number(total)||0));
   const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;
   return (h?`${h}:${String(m).padStart(2,'0')}`:String(m))+':'+String(s).padStart(2,'0');
 }
 function buildVideo(record,en,name){
   const area=el('div','wa-tt-album-video');
   if(record.id==='wa-record-18'&&name==='MSNZ'){
     const text=el('div','wa-tt-album-videotitle',en?'FOUR OFFICIAL UNIT MVs':'4개 유닛 공식 MV');
     text.style.flexBasis='100%';area.append(text);
     for(const [unit,video] of Object.entries(officialVideoByDimension)){
       const a=el('a','wa-tt-album-url',`${unit.toUpperCase()} · ${video.title} ↗`);
       a.href=`https://www.youtube.com/watch?v=${video.id}&t=0s`;
       a.target='_blank';a.rel='noopener noreferrer';area.append(a);
     }
     return area;
   }
   const movie=getOfficialVideo(record,name);
   if(movie){
     const img=el('img','wa-tt-album-thumb');
     img.alt=en?'Official music video thumbnail':'공식 영상 썸네일';
     img.loading='lazy';img.decoding='async';
     img.src=`https://img.youtube.com/vi/${movie.id}/hqdefault.jpg`;
     area.append(img);
     const label=el('div','wa-tt-album-videotitle',`${movie.title||record.focus||record.title} · ${movie.type==='PERFORMANCE'?'OFFICIAL PERFORMANCE':'OFFICIAL MV'}`);
     area.append(label);
     const timeLabel=el('label','wa-tt-album-time',en?'START':'시작');
     const time=el('input');time.type='text';time.inputMode='numeric';time.value=displayTimestamp(record.mvStart);time.placeholder='0:00';time.maxLength=8;
     time.setAttribute('aria-label',en?'YouTube start timestamp':'YouTube 시작 타임스탬프');
     timeLabel.append(time);area.append(timeLabel);
     const a=el('a','wa-tt-album-url',en?'WATCH ON YOUTUBE ↗':'공식 영상 보기 ↗');
     a.target='_blank';a.rel='noopener noreferrer';
     const setLink=()=>{const timeInSeconds=parseTimestamp(time.value);a.href=`https://www.youtube.com/watch?v=${movie.id}&t=${timeInSeconds}s`;a.setAttribute('aria-label',(en?'Open video from ':'영상 시작 시간 ')+displayTimestamp(timeInSeconds));};
     time.addEventListener('input',setLink);setLink();
     area.append(a);
   }else{
     const note=el('div','wa-tt-album-novideo',en?'An individual verified MV link is not registered for this release.':'이 음반의 개별 공식 MV 링크는 아직 등록되지 않았습니다.');
     area.append(note);
     const search=el('a','wa-tt-album-url',en?'SEARCH OFFICIAL CHANNEL ↗':'공식 채널에서 검색 ↗');
     search.href='https://www.youtube.com/@triplescosmos/search?query='+encodeURIComponent(record.focus||record.title);
     search.target='_blank';search.rel='noopener noreferrer';area.append(search);
   }
   return area;
 }
 function buildReleaseCard(record,name,en){
   const card=el('article','wa-tt-album-release');
   card.style.setProperty('--album-accent',colors[name]||'#bc9bff');
   const art=el('div','wa-tt-album-art');
   const caption=el('span','wa-tt-album-art-caption',record.artwork?(en?'ALBUM ARTWORK':'앨범 아트워크'):(en?'ARCHIVE VISUAL COVER':'아카이브 제작 표지'));
   const artTitle=el('strong','',record.title);const artArtist=el('small','',record.artist);
   art.append(caption,artTitle,artArtist);
   if(record.artwork){
     try{
       const url=new URL(record.artwork,location.href);
       if(['https:','data:'].includes(url.protocol)){
         const img=el('img');img.alt=record.title+' album cover';img.loading='lazy';img.decoding='async';img.src=url.href;art.prepend(img);
       }
     }catch(_error){}
   }
   const meta=el('div','wa-tt-album-meta');
   meta.append(el('div','wa-tt-album-release-top',`${record.year||'—'} · ${record.date||'RELEASE'}`),el('h3','',record.title),el('div','wa-tt-album-artist',record.artist));
   if(record.focus)meta.append(el('p','wa-tt-album-focus',(en?'TITLE / KEY TRACK · ':'타이틀 / 대표곡 · ')+record.focus));
   meta.append(el('div','wa-tt-album-tracks-title',en?'TRACK LIST':'수록곡 리스트'));
   if(record.tracks.length){
     const ol=el('ol','wa-tt-album-tracks');
     for(const track of record.tracks){
       const li=el('li');li.append(el('span','',track.number),document.createTextNode(track.name));ol.append(li);
     }
     meta.append(ol);
   }else meta.append(el('div','wa-tt-album-novideo',en?'Track data are not available in the current archive.':'현재 아카이브에 수록곡 정보가 없습니다.'));
   meta.append(buildVideo(record,en,name));
   card.append(art,meta);
   return card;
 }
 function renderModal(name){
   const en=isEnglish();
   const dim=window.WA_DIMENSION_MASTER?.[name];
   title.textContent=name;
   title.style.color='#fff';
   const albums=getDimensionAlbums(name);
   const shared=msnzNames.has(name)&&name!=='MSNZ';
   const description=shared?(en?'The project album is shared across moon / sun / neptune / zenith.':'moon · sun · neptune · zenith가 함께 수록된 프로젝트 음반입니다.'):(en?'Linked releases from the existing discography database.':'기존 디스코그래피 DB에서 자동 연결된 음반 기록입니다.');
   intro.textContent=(dim?.release?dim.release+' · ':'')+description;
   list.replaceChildren();
   if(!albums.length){
     const message=en?'No matching release is registered in the current discography. Dimension history remains available.':'현재 디스코그래피에 이 디멘션 명의로 등록된 음반이 없습니다. 기존 디멘션 기록은 그대로 볼 수 있습니다.';
     list.append(el('div','wa-tt-album-empty',message));
   }else albums.forEach(record=>list.append(buildReleaseCard(record,name,en)));
   originalButton.textContent=en?'ORIGINAL DIMENSION RECORD ↗':'기존 디멘션 상세 기록 ↗';
   discographyButton.textContent=en?'GO TO DISCOGRAPHY ↗':'전체 음반 아카이브 ↗';
   footerNote.textContent=en?'Source: existing WAV ARCHIVE discography. Archive-style covers are NOT official album artwork. Video timestamps default to 0:00 unless verified.':'자료: WAV ARCHIVE 기존 디스코그래피. 아카이브 제작 표지는 공식 앨범 아트가 아닙니다. 영상 시간은 확인된 데이터가 없으면 0:00부터 시작합니다.';
 }
 function showModal(name,trigger){
   if(!(name in colors))return;
   lastTrigger=trigger;current=name;
   renderModal(name);
   if(modal.open)modal.close();
   if(typeof modal.showModal==='function')modal.showModal();
   else modal.setAttribute('open','');
   closeButton.focus({preventScroll:true});
 }
 function closeModal(){
   if(typeof modal.close==='function'&&modal.open)modal.close();
   else modal.removeAttribute('open');
 }
 // Delegate at the node container, after the original per-node click callback has run.
 // This is an extension of the onClick, not a replacement for the 11.0 TIMETREE UI.
 root.querySelector('#waTTNodes')?.addEventListener('click',event=>{
   const button=event.target.closest('button[data-tt-node]');
   if(!button)return;
   showModal(button.dataset.ttNode,button);
 });
 closeButton.addEventListener('click',closeModal);
 modal.addEventListener('click',event=>{if(event.target===modal)closeModal();});
 modal.addEventListener('close',()=>{
   if(lastTrigger?.isConnected)lastTrigger.focus({preventScroll:true});
   current=null;
 });
 originalButton.addEventListener('click',()=>{
   closeModal();
   const existing=root.querySelector('#waTTPopupDetail');
   if(existing?.dataset.ttDetail)existing.click();
 });
 discographyButton.addEventListener('click',()=>{
   closeModal();
   document.getElementById('discography')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
 });
 document.addEventListener('wa:language',()=>{if(current)renderModal(current);});
 modal.dataset.albumBound='1';
 window.WA_TIMETREE_ALBUM_BINDING={getDimensionAlbums,readDiscography,getOfficialVideo};
})();

