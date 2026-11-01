

(function(){
  'use strict';
  const grid=document.getElementById('memberGrid');
  if (!grid || grid.dataset.wa11GyroV2 === '1') return;
  grid.dataset.wa11GyroV2='1';
  const cards=Array.from(grid.querySelectorAll('.member-card'));
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer=matchMedia('(pointer: coarse)');
  const hasOrientation=typeof window.DeviceOrientationEvent !== 'undefined';
  const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
  const rafByCard=new WeakMap();
  // Pointer-only animation state. The original gyro rAF/lerp remains untouched.
  const pointerMotion=new WeakMap();
  const pointerRects=new WeakMap();
  const timers=new WeakMap();
  const currentlyTilting=new Set();
  const isEnglish=()=>document.documentElement.lang.toLowerCase().startsWith('en');
  let gyroEnabled=false;
  let gyroObserved=false;
  let gyroBase=null;
  let gyroTarget=null;
  let lastSensorFrame=0;
  // Motion records are lightweight targets. Rendering is scheduled once per frame.
  const gyroFrame={
    id:0,previousTime:0,card:null,scrolling:false,
    currentX:0,currentY:0,currentGlowX:0,currentGlowY:0,
    targetX:0,targetY:0,targetGlowX:0,targetGlowY:0,
    pickTime:0,needPick:true
  };
  const GYRO_LERP_PER_60HZ=0.1;
  const GYRO_EPSILON_DEG=0.015;
  const GYRO_EPSILON_PX=0.10;
  let touchGesture=null;
  let toggle=null;

  /* Aurora hues are decorative, NOT claims about members' official colors. */
  cards.forEach((card,index)=>{
    const id=card.dataset.member||'S'+String(index+1).padStart(2,'0');
    const number=parseInt(id.replace(/\D/g,''),10)||index+1;
    const hue=(250+number*19)%360;
    card.style.setProperty('--wa11-aurora','hsla('+hue+',90%,72%,.20)');
  });

  function label(){
    if (!toggle) return;
    toggle.textContent=isEnglish() ? (gyroEnabled?'GYRO ON':'GYRO OFF') : (gyroEnabled?'자이로 켜짐':'자이로 꺼짐');
    toggle.setAttribute('aria-label',isEnglish()?'Toggle member-card gyroscope tilt':'멤버 카드 자이로 기울기 켜기 또는 끄기');
    toggle.setAttribute('aria-pressed',String(gyroEnabled));
  }
  // Always show the control on mobile, even if the browser blocks sensors.
  // A missing DeviceOrientationEvent used to hide the button without explanation.
  let sensorFeedback=null;
  function feedback(ko,en){
    if(!sensorFeedback)return;
    sensorFeedback.textContent=isEnglish()?en:ko;
    sensorFeedback.hidden=!ko;
  }
  if (coarsePointer.matches || matchMedia('(max-width: 768px)').matches){
    const toolbar=document.querySelector('#members .member-toolbar');
    if(toolbar){
      toggle=document.createElement('button');
      toggle.type='button';
      toggle.id='wa11GyroToggle';
      toggle.dataset.wa11Ui='gyro';
      toolbar.appendChild(toggle);
      sensorFeedback=document.createElement('div');
      sensorFeedback.id='wa11GyroFeedback';
      sensorFeedback.hidden=true;
      sensorFeedback.setAttribute('role','status');
      sensorFeedback.setAttribute('aria-live','polite');
      toolbar.insertAdjacentElement('afterend',sensorFeedback);
      label();
    }
  }

  function clearMotion(card){
    if (!card || (!currentlyTilting.has(card) && !card.classList.contains('wa11-tilt-home') && !card.classList.contains('wa115-gyro-smoothing')))return;
    // Cancel pointer lerp at the same lifecycle boundary as the existing tilt.
    pointerMotion.delete(card);
    pointerRects.delete(card);
    // Remove only the compositing state. The original flip transform is untouched.
    card.classList.remove('wa115-gyro-smoothing');
    card.style.removeProperty('--wa115-glow-x');
    card.style.removeProperty('--wa115-glow-y');
    const id=rafByCard.get(card);
    if (id)cancelAnimationFrame(id);
    rafByCard.delete(card);
    const timer=timers.get(card);
    if (timer)clearTimeout(timer);
    timers.delete(card);
    card.classList.add('wa11-tilt-home');
    card.style.setProperty('--wa11-tilt-x','0deg');
    card.style.setProperty('--wa11-tilt-y','0deg');
    card.classList.remove('wa11-tilting');
    // Temporarily keep the tilt class to animate smoothly back to zero.
    card.classList.add('wa11-tilting');
    const t=setTimeout(()=>{
      card.classList.remove('wa11-tilting','wa11-tilt-home');
      card.style.removeProperty('--wa11-tilt-x');
      card.style.removeProperty('--wa11-tilt-y');
      card.style.removeProperty('--wa11-aurora-active');
    },370);
    timers.set(card,t);
    currentlyTilting.delete(card);
  }
  function applyMotion(card,xDeg,yDeg,lightX,lightY,composited=false){
    if(!card || reduceMotion.matches || document.hidden)return;
    const timer=timers.get(card);
    if(timer)clearTimeout(timer);
    timers.delete(card);
    card.classList.remove('wa11-tilt-home');
    card.classList.add('wa11-tilting');
    card.style.setProperty('--wa11-tilt-x',xDeg.toFixed(3)+'deg');
    card.style.setProperty('--wa11-tilt-y',yDeg.toFixed(3)+'deg');
    // Gyro frames keep gradients static: light is moved by a compositor transform.
    // Mouse/touch retains the original positional gradient behavior.
    if(!composited){
      card.style.setProperty('--wa-glare-x',clamp(lightX,0,100).toFixed(1)+'%');
      card.style.setProperty('--wa-glare-y',clamp(lightY,0,100).toFixed(1)+'%');
    }
    currentlyTilting.add(card);
  }
  function queueMotion(card,xDeg,yDeg,lightX,lightY){
    if(document.hidden || reduceMotion.matches)return;
    let state=pointerMotion.get(card);
    if(!state){
      state={x:0,y:0,gx:0,gy:0,targetX:0,targetY:0,targetGX:0,targetGY:0,at:0};
      pointerMotion.set(card,state);
      // Reuse the existing phase 2B glint translation, not a repainting gradient.
      card.style.setProperty('--wa-glare-x','50%');
      card.style.setProperty('--wa-glare-y','40%');
      card.classList.add('wa115-gyro-smoothing');
    }
    state.targetX=xDeg;
    state.targetY=yDeg;
    state.targetGX=(lightX-50)*.16;
    state.targetGY=(lightY-50)*.14;
    // Multiple pointermove events produce at most one rendering frame.
    if(rafByCard.has(card))return;
    function tick(now){
      rafByCard.delete(card);
      if(pointerMotion.get(card)!==state || !card.isConnected || document.hidden || reduceMotion.matches)return;
      const elapsed=state.at?clamp(now-state.at,1,50):16.667;
      state.at=now;
      // 0.1 / 60Hz, 0.0513 / 120Hz: same damping in real time.
      const alpha=1-Math.pow(.9,elapsed/16.667);
      state.x+=(state.targetX-state.x)*alpha;
      state.y+=(state.targetY-state.y)*alpha;
      state.gx+=(state.targetGX-state.gx)*alpha;
      state.gy+=(state.targetGY-state.gy)*alpha;
      applyMotion(card,state.x,state.y,50,40,true);
      card.style.setProperty('--wa115-glow-x',state.gx.toFixed(2)+'px');
      card.style.setProperty('--wa115-glow-y',state.gy.toFixed(2)+'px');
      const unsettled=Math.abs(state.targetX-state.x)>.018 ||
        Math.abs(state.targetY-state.y)>.018 ||
        Math.abs(state.targetGX-state.gx)>.08 ||
        Math.abs(state.targetGY-state.gy)>.08;
      if(unsettled)rafByCard.set(card,requestAnimationFrame(tick));
      else state.at=0; // Stop at rest; resume when another pointer sample arrives.
    }
    rafByCard.set(card,requestAnimationFrame(tick));
  }
  function fromPoint(card,clientX,clientY,limit){
    const now=performance.now();
    let cached=pointerRects.get(card);
    if(!cached || now-cached.at>150 || cached.scrollX!==scrollX || cached.scrollY!==scrollY){
      const bounds=card.getBoundingClientRect();
      cached={bounds,at:now,scrollX,scrollY};
      pointerRects.set(card,cached);
    }
    const bounds=cached.bounds;
    if(!bounds.width||!bounds.height)return;
    const nx=clamp((clientX-bounds.left)/bounds.width,0,1);
    const ny=clamp((clientY-bounds.top)/bounds.height,0,1);
    queueMotion(card,(.5-ny)*limit,(nx-.5)*limit,nx*100,ny*100);
  }

  /* Mouse: delegation; original click/flip handlers are not replaced. */
  grid.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch' || reduceMotion.matches)return;
    if(!matchMedia('(hover: hover) and (pointer: fine)').matches)return;
    const card=event.target.closest('.member-card');
    if(card&&grid.contains(card))fromPoint(card,event.clientX,event.clientY,9);
  },{passive:true});
  grid.addEventListener('pointerout',event=>{
    if(event.pointerType==='touch')return;
    const card=event.target.closest('.member-card');
    if(card&&!card.contains(event.relatedTarget))clearMotion(card);
  },{passive:true});

  /* Finger touch: subtle instant tilt without blocking native vertical scrolling. */
  grid.addEventListener('pointerdown',event=>{
    if(event.pointerType!=='touch' || reduceMotion.matches)return;
    const card=event.target.closest('.member-card');
    if(!card)return;
    if(gyroTarget&&gyroTarget!==card)clearMotion(gyroTarget);
    gyroTarget=card;
    gyroFrame.needPick=true; // Immediately prefer the card just touched.
    touchGesture={id:event.pointerId,card,startX:event.clientX,startY:event.clientY,scrolling:false};
    if(!gyroEnabled)fromPoint(card,event.clientX,event.clientY,4);
  },{passive:true});
  grid.addEventListener('pointermove',event=>{
    const g=touchGesture;
    if(!g||event.pointerId!==g.id||gyroEnabled)return;
    if(Math.abs(event.clientY-g.startY)>14){
      g.scrolling=true;
      clearMotion(g.card);
      return;
    }
    if(!g.scrolling)fromPoint(g.card,event.clientX,event.clientY,4);
  },{passive:true});
  function finishTouch(event){
    const g=touchGesture;
    if(!g||event.pointerId!==g.id)return;
    touchGesture=null;
    if(!gyroEnabled)clearMotion(g.card);
  }
  grid.addEventListener('pointerup',finishTouch,{passive:true});
  grid.addEventListener('pointercancel',finishTouch,{passive:true});

  function visible(card){
    if(!card||!card.getClientRects().length)return false;
    const r=card.getBoundingClientRect();
    return r.bottom>0&&r.top<innerHeight;
  }
  function bestVisible(){
    let selected=null;
    let nearest=Infinity;
    for(const card of cards){
      if(!visible(card))continue;
      const r=card.getBoundingClientRect();
      const distance=Math.abs((r.top+r.bottom)/2-innerHeight/2)-(card.classList.contains('is-flipped')?90:0);
      if(distance<nearest){nearest=distance;selected=card;}
    }
    return selected;
  }
  function cancelGyroFrame(){
    if(gyroFrame.id){cancelAnimationFrame(gyroFrame.id);gyroFrame.id=0;}
    gyroFrame.previousTime=0;
    gyroFrame.needPick=true;
    if(gyroFrame.card){
      const card=gyroFrame.card;
      gyroFrame.card=null;
      clearMotion(card);
    }
  }

  let scrollResumeTimer=0;
  function markGyroCardDirty(){
    if(!gyroEnabled)return;
    gyroFrame.scrolling=true;
    if(scrollResumeTimer)clearTimeout(scrollResumeTimer);
    scrollResumeTimer=setTimeout(()=>{
      scrollResumeTimer=0;
      gyroFrame.scrolling=false;
      gyroFrame.needPick=true;
      scheduleGyroFrame();
    },135);
  }
  // Scroll listeners never query layout or modify the card transform.
  window.addEventListener('scroll',markGyroCardDirty,{passive:true});
  window.addEventListener('resize',markGyroCardDirty,{passive:true});

  function pickGyroCard(now){
    if(gyroFrame.needPick || !gyroFrame.card || now-gyroFrame.pickTime>350){
      gyroFrame.needPick=false;
      gyroFrame.pickTime=now;
      const next=visible(gyroTarget)?gyroTarget:bestVisible();
      if(next!==gyroFrame.card){
        if(gyroFrame.card)clearMotion(gyroFrame.card);
        gyroFrame.card=next;
        gyroFrame.currentX=0;
        gyroFrame.currentY=0;
        gyroFrame.currentGlowX=0;
        gyroFrame.currentGlowY=0;
        gyroFrame.previousTime=0;
        if(next){
          // Keep pre-existing hologram gradient stationary while moving only its layer.
          next.style.setProperty('--wa-glare-x','50%');
          next.style.setProperty('--wa-glare-y','40%');
          next.classList.add('wa115-gyro-smoothing');
        }
      }
    }
    return gyroFrame.card;
  }

  function scheduleGyroFrame(){
    if(!gyroFrame.id && !gyroFrame.scrolling && gyroEnabled && !document.hidden && !reduceMotion.matches){
      gyroFrame.id=requestAnimationFrame(renderGyroFrame);
    }
  }

  function renderGyroFrame(now){
    gyroFrame.id=0;
    if(!gyroEnabled || document.hidden || reduceMotion.matches || gyroFrame.scrolling)return;
    const card=pickGyroCard(now);
    if(!card)return;
    const dt=gyroFrame.previousTime?clamp(now-gyroFrame.previousTime,1,50):16.667;
    gyroFrame.previousTime=now;
    // Frame-rate-independent Lerp: ~0.1 at 60Hz, ~0.19 at 30Hz.
    const alpha=1-Math.pow(1-GYRO_LERP_PER_60HZ,dt/16.667);
    const oldX=gyroFrame.currentX;
    const oldY=gyroFrame.currentY;
    const oldGlowX=gyroFrame.currentGlowX;
    const oldGlowY=gyroFrame.currentGlowY;
    gyroFrame.currentX+= (gyroFrame.targetX-gyroFrame.currentX)*alpha;
    gyroFrame.currentY+= (gyroFrame.targetY-gyroFrame.currentY)*alpha;
    gyroFrame.currentGlowX+= (gyroFrame.targetGlowX-gyroFrame.currentGlowX)*alpha;
    gyroFrame.currentGlowY+= (gyroFrame.targetGlowY-gyroFrame.currentGlowY)*alpha;
    const stillMoving=
      Math.abs(gyroFrame.targetX-gyroFrame.currentX)>GYRO_EPSILON_DEG ||
      Math.abs(gyroFrame.targetY-gyroFrame.currentY)>GYRO_EPSILON_DEG ||
      Math.abs(gyroFrame.targetGlowX-gyroFrame.currentGlowX)>GYRO_EPSILON_PX ||
      Math.abs(gyroFrame.targetGlowY-gyroFrame.currentGlowY)>GYRO_EPSILON_PX;
    const moved=
      Math.abs(oldX-gyroFrame.currentX)>0.0005 ||
      Math.abs(oldY-gyroFrame.currentY)>0.0005 ||
      Math.abs(oldGlowX-gyroFrame.currentGlowX)>0.005 ||
      Math.abs(oldGlowY-gyroFrame.currentGlowY)>0.005;
    if(moved){
      // Existing tilt still lives on the OUTER card; inner .is-flipped is preserved.
      // Passing the composited flag avoids repaints from gradient-position changes.
      applyMotion(card,gyroFrame.currentX,gyroFrame.currentY,50,40,true);
      card.style.setProperty('--wa115-glow-x',gyroFrame.currentGlowX.toFixed(2)+'px');
      card.style.setProperty('--wa115-glow-y',gyroFrame.currentGlowY.toFixed(2)+'px');
    }
    if(stillMoving)scheduleGyroFrame();
    else gyroFrame.previousTime=0; // Sleep at rest; wake on next sensor target change.
  }

  function orientation(event){
    if(!gyroEnabled || document.hidden || reduceMotion.matches)return;
    // Sensor callbacks only record the latest reading, regardless of input Hz.
    // CSS is never written here; rAF is the sole rendering path.
    if(!Number.isFinite(event.beta) || !Number.isFinite(event.gamma))return;
    lastSensorFrame=performance.now();
    if(!gyroObserved){
      gyroObserved=true;
      if(sensorTimeout){clearTimeout(sensorTimeout);sensorTimeout=0;}
      feedback('자이로 연결됨! 카드를 화면에 띄우고 휴대폰을 기울여 보세요.',
               'Gyroscope connected! Keep a card visible and tilt your phone.');
    }
    if(gyroBase===null)gyroBase={beta:event.beta,gamma:event.gamma};
    const dx=clamp(event.gamma-gyroBase.gamma,-25,25);
    const dy=clamp(event.beta-gyroBase.beta,-25,25);
    // Original angle mapping and 3.75 degree max are retained.
    gyroFrame.targetX=-dy*.15;
    gyroFrame.targetY=dx*.15;
    // Approx. 16px translation of an already-rasterized glow texture.
    gyroFrame.targetGlowX=dx*.64;
    gyroFrame.targetGlowY=dy*.54;
    scheduleGyroFrame();
  }
  let sensorTimeout=0;
  function stopGyro(){
    gyroEnabled=false;
    gyroBase=null;
    if(scrollResumeTimer){clearTimeout(scrollResumeTimer);scrollResumeTimer=0;}
    gyroFrame.scrolling=false;
    cancelGyroFrame();
    if(sensorTimeout){clearTimeout(sensorTimeout);sensorTimeout=0;}
    window.removeEventListener('deviceorientation',orientation);
    for(const card of Array.from(currentlyTilting))clearMotion(card);
    label();
  }
  async function startGyro(){
    // Web motion sensors are generally restricted to a secure HTTPS context.
    // Browser-local content:// previews, in-app browsers and denied settings may block them.
    if(!window.isSecureContext){
      feedback('센서 사용에는 HTTPS가 필요해요. HTML 다운로드 파일 대신 GitHub Pages 사이트를 열어주세요.',
               'Motion sensors require HTTPS. Open the GitHub Pages site instead of a downloaded HTML file.');
      return;
    }
    if(reduceMotion.matches){
      feedback('기기의 애니메이션 줄이기 설정이 켜져 있어요. 해당 설정을 끄고 다시 시도해 주세요.',
               'Reduced motion is enabled. Turn off the device motion-reduction setting and try again.');
      return;
    }
    if(!hasOrientation){
      feedback('이 브라우저에서는 기기 방향 센서를 제공하지 않아요. 삼성 인터넷 또는 Chrome의 HTTPS 사이트에서 시도해 주세요.',
               'This browser does not expose orientation sensors. Try Samsung Internet or Chrome on HTTPS.');
      return;
    }
    try{
      // Keep permission request directly in the user-click task on iOS.
      if(typeof DeviceOrientationEvent.requestPermission==='function'){
        const permission=await DeviceOrientationEvent.requestPermission();
        if(permission!=='granted'){
          feedback('자이로 센서 권한이 거부되었어요. 브라우저의 사이트 권한을 확인해 주세요.',
                   'Motion sensor permission was denied. Check your site permissions.');
          return;
        }
      }
      gyroEnabled=true;
      gyroObserved=false;
      gyroBase=null;
      lastSensorFrame=0;
      gyroFrame.needPick=true;
      gyroFrame.previousTime=0;
      gyroFrame.targetX=gyroFrame.targetY=0;
      gyroFrame.targetGlowX=gyroFrame.targetGlowY=0;
      gyroFrame.currentX=gyroFrame.currentY=0;
      gyroFrame.currentGlowX=gyroFrame.currentGlowY=0;
      window.addEventListener('deviceorientation',orientation,{passive:true});
      label();
      feedback('센서 신호 확인 중… 휴대폰을 천천히 기울여 보세요.',
               'Waiting for sensor data… Tilt your phone gently.');
      sensorTimeout=setTimeout(()=>{
        sensorTimeout=0;
        if(gyroEnabled&&!gyroObserved){
          stopGyro();
          feedback('센서 데이터가 전달되지 않았어요. 브라우저의 동작 센서 권한이나 보안 설정을 확인해 주세요.',
                   'No sensor data received. Check the browser motion-sensor permission and security settings.');
        }
      },6000);
    }catch(err){
      stopGyro();
      feedback('센서 활성화 실패: 브라우저 권한과 HTTPS 접속을 확인해 주세요.',
               'Could not enable sensors. Check permissions and the HTTPS connection.');
    }
  }
  if(toggle)toggle.addEventListener('click',()=>{
    if(gyroEnabled){stopGyro();feedback('','');}
    else startGyro();
  });
  document.addEventListener('wa:language',label);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){
      gyroBase=null;
      cancelGyroFrame();
      for(const card of Array.from(currentlyTilting))clearMotion(card);
    }else if(gyroEnabled){
      // Recalibrate after returning to the page, without deleting sensor listeners.
      gyroFrame.needPick=true;
    }
  });
  window.addEventListener('pagehide',stopGyro,{passive:true});
  reduceMotion.addEventListener('change',()=>{
    if(reduceMotion.matches){stopGyro();for(const card of Array.from(currentlyTilting))clearMotion(card);}
  });
  /* Releasing layout/texture work when scrolling off the card. */
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){if(!entry.isIntersecting)clearMotion(entry.target);}
  },{threshold:0});
  cards.forEach(card=>observer.observe(card));
})();

