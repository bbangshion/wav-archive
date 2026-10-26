
/* WAV ARCHIVE 11 — MICRO SOUND & HAPTIC PLUGIN
 * Independent enhancement: all legacy members, DNA, TimeTree, albums, chemistry,
 * image export and localization functions remain unmodified.
 * No external audio file, dependency, or permission prompt is required.
 */
(function WAVArchiveMicroSoundPlugin() {
  'use strict';
  if (window.WAVArchiveMicroSound) return;

  const DOC = document;
  const STORAGE_KEY = 'wa:microSound:v11:1';
  const AUDIO_API = window.AudioContext || window.webkitAudioContext;
  const vibrationSupported = typeof navigator.vibrate === 'function';
  const audioSupported = typeof AUDIO_API === 'function';
  const reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const initial = Object.freeze({
    bgm: false,
    effects: false,
    haptics: vibrationSupported && !reducedMotion
  });
  const labels = {
    ko: {
      open: '사운드 및 햅틱 설정', heading: 'WAV SENSORY', note: '가볍고 은은한 인터랙션 · 언제든 끌 수 있어요.',
      bgm: '우주 앰비언트 배경음', bgmDesc: '아주 작은 볼륨의 합성 로파이 패드',
      fx: '마이크로 효과음', fxDesc: '멤버 카드 플립 · DNA 필터 클릭',
      haptic: '모바일 햅틱', hapticDesc: '카드와 버튼 조작 시 짧은 진동',
      on: '켜짐', off: '꺼짐', unsupportedAudio: '이 브라우저는 Web Audio를 지원하지 않아요.',
      unsupportedHaptic: '이 브라우저에서는 진동을 사용할 수 없어요.',
      armed: '배경음은 화면을 터치한 뒤 재생돼요.',
      silent: '배경음은 기본적으로 자동 재생되지 않아요.',
      playing: '은은한 배경음이 재생 중이에요.',
      paused: '배경음이 일시 중지되었어요.',
      saved: '설정은 이 브라우저에 저장돼요.'
    },
    en: {
      open: 'Sound and haptic settings', heading: 'WAV SENSORY', note: 'Subtle interactions · always optional.',
      bgm: 'Cosmic ambient soundtrack', bgmDesc: 'Quiet, synthesized lo-fi pad',
      fx: 'Micro sound effects', fxDesc: 'Member card flip · DNA filter click',
      haptic: 'Mobile haptics', hapticDesc: 'Short vibration for cards and buttons',
      on: 'ON', off: 'OFF', unsupportedAudio: 'Web Audio is not supported in this browser.',
      unsupportedHaptic: 'Vibration is not supported in this browser.',
      armed: 'Tap the page to resume saved background audio.',
      silent: 'Background audio never autoplays on first visit.',
      playing: 'Soft ambient sound is playing.',
      paused: 'Background sound is paused.',
      saved: 'Settings are saved in this browser.'
    },
    ja: {
      open: 'サウンド・振動の設定', heading: 'WAV SENSORY', note: '控えめな演出 · いつでもオフにできます。',
      bgm: '宇宙アンビエントBGM', bgmDesc: '小音量のシンセ・ローファイパッド',
      fx: '操作効果音', fxDesc: 'メンバーカード・DNAフィルター',
      haptic: 'モバイル振動', hapticDesc: 'カードとボタンの軽い振動',
      on: 'オン', off: 'オフ', unsupportedAudio: 'このブラウザではWeb Audioを利用できません。',
      unsupportedHaptic: 'このブラウザでは振動を利用できません。',
      armed: '画面をタップするとBGMが再開します。',
      silent: '初回アクセス時にBGMは自動再生されません。',
      playing: '静かなBGMを再生しています。',
      paused: 'BGMを一時停止しています。',
      saved: '設定はこのブラウザに保存されます。'
    }
  };

  function readSettings() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        bgm: audioSupported && value.bgm === true,
        effects: audioSupported && value.effects === true,
        haptics: vibrationSupported && (typeof value.haptics === 'boolean' ? value.haptics : initial.haptics)
      };
    } catch (_) { return {...initial}; }
  }
  const settings = readSettings();
  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch (_) {}
  }
  function locale() {
    const lang = window.WA11Locale && window.WA11Locale.currentLang ||
      DOC.documentElement.lang || 'ko';
    return lang === 'jp' ? 'ja' : (labels[lang] ? lang : 'ko');
  }
  function phrase(key) { return labels[locale()][key]; }

  let audioContext = null;
  let audioOutput = null;
  let padNodes = null;
  let noiseBuffer = null;
  let hasGesture = false;
  let lastHapticTime = -10000;
  let button = null;
  let panel = null;
  let status = null;
  const switches = Object.create(null);
  const flipValues = new WeakMap();
  const flipIntent = new WeakMap();
  const flipHandled = new WeakMap();
  let flipObserver = null;

  function audioReady() {
    if (!audioSupported) return null;
    if (audioContext) return audioContext;
    try {
      audioContext = new AUDIO_API();
      audioOutput = audioContext.createGain();
      audioOutput.gain.value = 0.70;
      audioOutput.connect(audioContext.destination);
      return audioContext;
    } catch (err) {
      console.warn('[WAV SENSORY] Audio initialization unavailable:', err);
      return null;
    }
  }
  function tryResume() {
    if (!audioContext || DOC.hidden || audioContext.state !== 'suspended') return;
    try {
      const promise = audioContext.resume();
      if (promise && typeof promise.catch === 'function') promise.catch(() => updateView());
    } catch (_) {}
  }
  function ensureNoiseBuffer(seconds) {
    const audio = audioReady();
    if (!audio) return null;
    const size = Math.round(audio.sampleRate * seconds);
    if (noiseBuffer && noiseBuffer.length >= size) return noiseBuffer;
    const buffer = audio.createBuffer(1, size, audio.sampleRate);
    const samples = buffer.getChannelData(0);
    let previous = 0;
    for (let i = 0; i < size; i++) {
      const sample = Math.random() * 2 - 1;
      previous = (previous * 0.94) + (sample * 0.06);
      samples[i] = previous;
    }
    noiseBuffer = buffer;
    return buffer;
  }
  function playFilterTick() {
    if (!settings.effects || !hasGesture || DOC.hidden) return;
    const audio = audioReady();
    if (!audio) return;
    try {
      tryResume();
      const time = audio.currentTime;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(720, time);
      osc.frequency.exponentialRampToValueAtTime(470, time + 0.085);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.050, time + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.095);
      osc.connect(gain);
      gain.connect(audioOutput);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
      osc.start(time);
      osc.stop(time + 0.11);
    } catch (err) { console.warn('[WAV SENSORY] Filter sound:', err); }
  }
  function playFlipWhoosh() {
    if (!settings.effects || !hasGesture || DOC.hidden) return;
    const audio = audioReady();
    if (!audio) return;
    try {
      tryResume();
      const time = audio.currentTime;
      const source = audio.createBufferSource();
      source.buffer = ensureNoiseBuffer(0.27);
      const filter = audio.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 0.55;
      filter.frequency.setValueAtTime(1700, time);
      filter.frequency.exponentialRampToValueAtTime(340, time + 0.23);
      const gain = audio.createGain();
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.065, time + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.245);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(audioOutput);
      source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
      source.start(time);
      source.stop(time + 0.25);
    } catch (err) { console.warn('[WAV SENSORY] Flip sound:', err); }
  }
  function startPad() {
    if (!settings.bgm || !hasGesture || DOC.hidden || padNodes) return;
    const audio = audioReady();
    if (!audio) return;
    try {
      tryResume();
      const time = audio.currentTime;
      const bus = audio.createGain();
      bus.gain.setValueAtTime(0.0001, time);
      bus.gain.linearRampToValueAtTime(0.055, time + 2.6);
      const lowpass = audio.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 660;
      lowpass.Q.value = 0.15;
      bus.connect(lowpass);
      lowpass.connect(audioOutput);
      const oscillators = [];
      const frequencies = [110, 130.81, 164.81]; // A minor chord, quiet pad
      frequencies.forEach((frequency, index) => {
        const osc = audio.createOscillator();
        const level = audio.createGain();
        osc.type = index === 1 ? 'triangle' : 'sine';
        osc.frequency.value = frequency;
        osc.detune.value = index === 1 ? 3 : index === 2 ? -2 : 0;
        level.gain.value = index === 1 ? 0.12 : 0.18;
        osc.connect(level);
        level.connect(bus);
        osc.start();
        oscillators.push({osc, level});
      });
      const lfo = audio.createOscillator();
      const lfoDepth = audio.createGain();
      lfo.frequency.value = 0.082;
      lfoDepth.gain.value = 0.008;
      lfo.connect(lfoDepth);
      lfoDepth.connect(bus.gain);
      lfo.start();
      padNodes = {bus, lowpass, oscillators, lfo, lfoDepth};
      updateView();
    } catch (err) { console.warn('[WAV SENSORY] Ambient pad:', err); }
  }
  function stopPad() {
    const nodes = padNodes;
    if (!nodes || !audioContext) return;
    padNodes = null;
    try {
      const time = audioContext.currentTime;
      nodes.bus.gain.cancelScheduledValues(time);
      nodes.bus.gain.setValueAtTime(Math.max(0.0001, nodes.bus.gain.value), time);
      nodes.bus.gain.linearRampToValueAtTime(0, time + 0.20);
      for (const entry of nodes.oscillators) {
        entry.osc.stop(time + 0.23);
        entry.osc.onended = () => { entry.osc.disconnect(); entry.level.disconnect(); };
      }
      nodes.lfo.stop(time + 0.23);
      nodes.lfo.onended = () => {
        nodes.lfo.disconnect(); nodes.lfoDepth.disconnect();
        nodes.bus.disconnect(); nodes.lowpass.disconnect();
      };
    } catch (_) {
      nodes.oscillators.forEach(item => { try { item.osc.stop(); } catch (_) {} });
      try { nodes.lfo.stop(); } catch (_) {}
    }
  }
  function vibrate(duration = 15) {
    if (!settings.haptics || !vibrationSupported || DOC.hidden) return false;
    const now = performance.now();
    if (now - lastHapticTime < 105) return false;
    lastHapticTime = now;
    try { return Boolean(navigator.vibrate([Math.min(15, Math.max(1, duration))])); }
    catch (_) { return false; }
  }

  function setBgm(value) {
    settings.bgm = audioSupported && Boolean(value);
    persist();
    if (settings.bgm) {
      if (hasGesture) startPad();
    } else stopPad();
    updateView();
    return settings.bgm;
  }
  function setEffects(value) {
    settings.effects = audioSupported && Boolean(value);
    persist();
    if (settings.effects && hasGesture) { audioReady(); tryResume(); }
    updateView();
    return settings.effects;
  }
  function setHaptics(value) {
    settings.haptics = vibrationSupported && Boolean(value);
    persist(); updateView();
    return settings.haptics;
  }

  function makeSwitch(key) {
    const row = DOC.createElement('div');
    row.className = 'wa-sensory-row';
    const label = DOC.createElement('div');
    label.className = 'wa-sensory-copy';
    const title = DOC.createElement('strong');
    title.dataset.waSensory = key + 'Title';
    const description = DOC.createElement('small');
    description.dataset.waSensory = key + 'Desc';
    label.append(title, description);
    const toggle = DOC.createElement('button');
    toggle.type = 'button';
    toggle.className = 'wa-sensory-switch';
    toggle.dataset.waSensoryToggle = key;
    toggle.setAttribute('role','switch');
    toggle.setAttribute('aria-checked','false');
    row.append(label, toggle);
    switches[key] = {toggle, title, description};
    return row;
  }
  function buildInterface() {
    if (DOC.getElementById('waSensoryOpen')) return;
    const header = DOC.querySelector('.header .nav');
    if (!header) return;
    button = DOC.createElement('button');
    button.id = 'waSensoryOpen';
    button.type = 'button';
    button.className = 'wa-sensory-launcher';
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'waSensoryPanel');
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6a8 8 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span class="wa-sensory-dot" aria-hidden="true"></span>';
    const language = DOC.getElementById('wa11GlobalLocale') || DOC.getElementById('waLangToggle');
    const menu = DOC.getElementById('menu');
    if (language && language.parentElement === header) language.after(button);
    else if (menu && menu.parentElement === header) menu.before(button);
    else header.append(button);

    panel = DOC.createElement('section');
    panel.id = 'waSensoryPanel';
    panel.className = 'wa-sensory-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-labelledby', 'waSensoryTitle');
    panel.hidden = true;
    const top = DOC.createElement('div');
    top.className = 'wa-sensory-head';
    const heading = DOC.createElement('div');
    heading.id = 'waSensoryTitle';
    heading.className = 'wa-sensory-heading';
    const close = DOC.createElement('button');
    close.type = 'button';
    close.className = 'wa-sensory-close';
    close.setAttribute('aria-label', 'Close');
    close.textContent = '×';
    close.addEventListener('click', () => hidePanel(true));
    top.append(heading, close);
    const note = DOC.createElement('p');
    note.className = 'wa-sensory-note';
    note.dataset.waSensory = 'intro';
    const body = DOC.createElement('div');
    body.className = 'wa-sensory-options';
    body.append(makeSwitch('bgm'), makeSwitch('effects'), makeSwitch('haptics'));
    status = DOC.createElement('p');
    status.className = 'wa-sensory-status';
    status.setAttribute('role', 'status');
    const foot = DOC.createElement('p');
    foot.className = 'wa-sensory-footer';
    foot.dataset.waSensory = 'saved';
    panel.append(top, note, body, status, foot);
    DOC.body.append(panel);
    panel.addEventListener('click', event => {
      const toggle = event.target.closest('button[data-wa-sensory-toggle]');
      if (!toggle) return;
      hasGesture = true;
      const key = toggle.dataset.waSensoryToggle;
      if (key === 'bgm') setBgm(!settings.bgm);
      else if (key === 'effects') setEffects(!settings.effects);
      else if (key === 'haptics') setHaptics(!settings.haptics);
    });
    button.addEventListener('click', () => {
      if (panel.hidden) showPanel();
      else hidePanel(false);
    });
    DOC.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) hidePanel(true);
    });
    DOC.addEventListener('pointerdown', event => {
      if (panel.hidden) return;
      if (panel.contains(event.target) || button.contains(event.target)) return;
      hidePanel(false);
    }, {capture: true, passive: true});
    updateView();
  }
  function showPanel() {
    if (!panel) return;
    panel.hidden = false;
    button?.setAttribute('aria-expanded', 'true');
    updateView();
  }
  function hidePanel(returnFocus) {
    if (!panel) return;
    panel.hidden = true;
    button?.setAttribute('aria-expanded', 'false');
    if (returnFocus) button?.focus({preventScroll: true});
  }
  function updateView() {
    if (!panel || !button) return;
    const lang = locale();
    const t = labels[lang];
    const heading = DOC.getElementById('waSensoryTitle');
    if (heading) heading.textContent = t.heading;
    const note = panel.querySelector('[data-wa-sensory="intro"]');
    if (note) note.textContent = t.note;
    const footer = panel.querySelector('[data-wa-sensory="saved"]');
    if (footer) footer.textContent = t.saved;
    button.title = t.open;
    button.setAttribute('aria-label', t.open);
    button.classList.toggle('wa-sensory-active', Boolean(settings.bgm || settings.effects));
    Object.entries(switches).forEach(([key, refs]) => {
      const name = key === 'effects' ? 'fx' : key === 'haptics' ? 'haptic' : 'bgm';
      refs.title.textContent = t[name];
      refs.description.textContent = t[name + 'Desc'];
      refs.toggle.textContent = settings[key] ? t.on : t.off;
      refs.toggle.setAttribute('aria-label', t[name]);
      refs.toggle.setAttribute('aria-checked', String(settings[key]));
      refs.toggle.disabled = key === 'haptics' ? !vibrationSupported : !audioSupported;
    });
    if (status) {
      status.textContent = !audioSupported ? t.unsupportedAudio :
        !vibrationSupported ? t.unsupportedHaptic :
        settings.bgm ? (!hasGesture ? t.armed : (DOC.hidden || audioContext?.state === 'suspended' ? t.paused : t.playing)) : t.silent;
    }
  }
  function afterFlip(card) {
    const previous = flipValues.get(card);
    const current = card.classList.contains('is-flipped');
    flipValues.set(card, current);
    if (previous === undefined || previous === current) return;
    const initiated = flipIntent.get(card);
    if (!initiated || performance.now() - initiated > 900) return;
    if (performance.now() - (flipHandled.get(card) || -10000) < 160) return;
    flipHandled.set(card, performance.now());
    flipIntent.delete(card);
    playFlipWhoosh();
  }
  function watchMemberFlips() {
    const grid = DOC.getElementById('memberGrid');
    if (!grid) return;
    grid.querySelectorAll('.member-card').forEach(card => flipValues.set(card, card.classList.contains('is-flipped')));
    flipObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type !== 'attributes' || mutation.attributeName !== 'class') continue;
        const card = mutation.target;
        if (card.matches && card.matches('.member-card')) afterFlip(card);
      }
    });
    flipObserver.observe(grid, {subtree:true, attributes:true, attributeFilter:['class']});
  }
  function userGesture(event) {
    if (!event.isTrusted) return;
    if (!hasGesture) {
      hasGesture = true;
      if (settings.bgm) startPad();
      updateView();
    }
  }
  function onClickCapture(event) {
    if (!event.isTrusted) return;
    userGesture(event);
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('#waSensoryPanel,#waSensoryOpen')) return;
    const filter = target.closest('.wa-dna11-filterbar button[data-dna11-dimension]');
    if (filter) {
      vibrate(15);
      playFilterTick();
      return;
    }
    const card = target.closest('#memberGrid .member-card');
    if (card && !target.closest('a,button,input,select,textarea,label,[role="button"],[contenteditable="true"]')) {
      flipIntent.set(card, performance.now());
      vibrate(15);
      return;
    }
    const otherButton = target.closest('button,[role="button"]');
    if (otherButton && !otherButton.disabled) vibrate(8);
  }
  function onClickBubble(event) {
    if (!event.isTrusted || !(event.target instanceof Element)) return;
    const card = event.target.closest('#memberGrid .member-card');
    if (card) afterFlip(card);
  }
  function init() {
    buildInterface();
    watchMemberFlips();
    DOC.addEventListener('click', onClickCapture, {capture: true, passive: true});
    DOC.addEventListener('click', onClickBubble, {passive: true});
    // Browser audio policies: restore a saved ON state, but start only after user input.
    DOC.addEventListener('pointerdown', userGesture, {capture: true, passive: true});
    DOC.addEventListener('keydown', userGesture, {capture: true});
    DOC.addEventListener('wa:locale-change', updateView);
    DOC.addEventListener('visibilitychange', () => {
      if (!audioContext) return;
      if (DOC.hidden) {
        try { audioContext.suspend(); } catch (_) {}
      } else if (settings.bgm && hasGesture) {
        tryResume();
      }
      updateView();
    });
    window.addEventListener('pagehide', () => {
      stopPad();
      if (audioContext) { try { audioContext.suspend(); } catch (_) {} }
    });
  }

  window.WAVArchiveMicroSound = Object.freeze({
    getState() { return {...settings, audioSupported, vibrationSupported, running: Boolean(padNodes)}; },
    setBgm, setEffects, setHaptics,
    get open() { return Boolean(panel && !panel.hidden); },
    showSettings() { showPanel(); },
    hideSettings() { hidePanel(false); }
  });
  if (DOC.readyState === 'loading') DOC.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();

