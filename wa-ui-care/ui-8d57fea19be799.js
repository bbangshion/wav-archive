/* WAV ARCHIVE: tiny one-shot accessibility and content restoration module
   No mutation observers, timers, global click capture or scroll locks. */
(() => {
  'use strict';
  const DAY = '2026-10-26'; // replaced by GitHub Action at install time
  const CLOCK = '2026.10.26 20:31';

  function improveCardBacks() {
    const grid = document.getElementById('memberGrid');
    if (!grid || grid.dataset.waCareReady === 'yes') return;
    grid.dataset.waCareReady = 'yes';
    // Back-side controls (.wa-member-facts-open, .member-history-btn,
    // .flip-again) already have their own handlers. Do NOT override them.
    // Give the passive Dimension chips one useful, keyboard-accessible action.
    const chips = grid.querySelectorAll('.member-card .member-back .unit-chip');
    for (const chip of chips) {
      if (chip.closest('button,a,[role="link"]')) continue;
      const unit = (chip.textContent || '').trim();
      if (!unit) continue;
      chip.setAttribute('role', 'link');
      chip.setAttribute('tabindex', '0');
      chip.setAttribute('aria-label', `${unit} 디멘션 보기`);
    }
    const go = (chip) => {
      if (!chip?.closest('.member-card.is-flipped')) return;
      const unit = (chip.textContent || '').trim();
      const name = (s) => s.toLowerCase().replace(/[^a-z0-9가-힣+∞]/gi, '');
      const wanted = name(unit);
      const unitCards = document.querySelectorAll('#units .unit-card');
      let dest = null;
      for (const card of unitCards) {
        const title = card.querySelector('h2,h3,.unit-title,.wa-dim-name') || card;
        if (name(title.textContent || '') === wanted) { dest = card; break; }
      }
      dest ||= document.getElementById('units');
      if (!dest) return;
      dest.scrollIntoView({ block:'start', behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto':'smooth' });
    };
    grid.addEventListener('click', (e) => {
      const chip = e.target.closest('.member-back .unit-chip[role="link"]');
      if (!chip) return;
      e.preventDefault();
      e.stopPropagation(); // otherwise the existing card handler flips it
      go(chip);
    });
    grid.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const chip = e.target.closest('.member-back .unit-chip[role="link"]');
      if (!chip) return;
      e.preventDefault();
      e.stopPropagation();
      go(chip);
    });
  }

  function line(tag, text, className = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = text;
    return el;
  }
  function improveArchiveHistory() {
    const log = document.getElementById('wa52UpdateLog');
    if (!log) return;
    const parent = document.getElementById('wa52UpdateStatus');
    if (parent?.dataset.waCareReady === 'yes') return;
    if (parent) parent.dataset.waCareReady = 'yes';
    const time = parent?.querySelector('.wa52-update-main time');
    if (time) {
      time.dateTime = DAY;
      time.textContent = `${CLOCK} KST`;
    }
    const heading = log.querySelector('.wa52-log-head');
    if (heading) {
      const title = heading.querySelector('b');
      const detail = heading.querySelector('span');
      if (title) title.textContent = 'WAV ARCHIVE · 업데이트 기록';
      if (detail) detail.textContent = '주요 변경 사항';
      // Only prepend a changelog entry for this actual installation.
      const entry = line('div', '', 'wa52-log-item wa-care-update');
      const date = line('time', DAY.replaceAll('-', '.'));
      date.dateTime = DAY;
      const change = line('span', '멤버 카드 뒷면의 터치 영역 수정 · 모바일 버튼 선택 효과 정리 · 제작 기록 보강');
      entry.replaceChildren(date, change);
      heading.insertAdjacentElement('afterend', entry);
    }
    const story = log.querySelector('.wa53-build-body');
    if (!story) return;
    const section = line('section', '', 'wa-care-notes');
    section.dataset.waCareNotes = '1';
    section.append(
      line('h3', '기록을 계속 다듬는 이유'),
      line('p', '처음에는 좋아하는 멤버들의 정보를 한곳에서 보고 싶어서 시작했어요 이제는 다른 WAV도 편하게 찾아볼 수 있도록 자료를 정리하고, 직접 써보면서 불편한 부분을 고치고 있어요')
    );
    const notes = [
      ['현장에서 남긴 기억', '10월 서울 공연에서 처음 직접 만난 24명의 무대가 오래 기억에 남았어요 공연을 보고 난 뒤에는 사진과 순간들을 다시 찾아볼 수 있는 공간도 더하고 싶었어요'],
      ['흩어진 자료를 한곳에', '멤버와 디멘션, Gravity, 음악을 연결하는 데서 시작해 SIGNAL 영상과 Objekt 기록까지 조금씩 넓혔어요 자료가 많아질수록 출처와 검색의 정확성을 더 신경 쓰고 있어요'],
      ['휴대폰에서 직접 고치기', '모바일에서 카드가 겹치거나 화면이 끊기는 문제를 보면서 이미지, CSS, JavaScript를 나누는 작업을 진행했어요 보여지는 디자인만큼 실제 작동도 중요하다고 생각해요'],
      ['앞으로도 꾸준히', '기록은 계속 쌓이지만 메뉴와 문장은 더 간결하게 만들고 싶어요 새 기능을 늘리는 것보다 지금 있는 기능을 정확하고 편하게 다듬는 작업을 이어갈게요']
    ];
    for (const [title, content] of notes) {
      const block = line('div', '', 'wa-care-note');
      block.append(line('b', title), line('p', content));
      section.append(block);
    }
    const signature = story.querySelector('.wa53-sign');
    if (signature) signature.insertAdjacentElement('beforebegin', section);
    else story.append(section);
  }

  const boot = () => { improveCardBacks(); improveArchiveHistory(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
