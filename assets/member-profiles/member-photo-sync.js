/* WAV ARCHIVE 15.5+ / S01-S24 shared profile photo registry (2026-10-25).
 * Scope is member portrait/avatar UI only. Objekt card art, concert photos,
 * historical photos and decorative/character stickers are never overwritten.
 * No global image scan, polling loop, image preload storm or full DOM rebuild.
 */
(() => {
  'use strict';
  if (window.WAVMemberPhotos?.version === '2026-10-25') return;

  const script = document.currentScript;
  if (!script?.src) return;
  const base = new URL('./2026-10/', script.src);
  const names = ['윤서연','정혜린','이지우','김채연','김유연','김수민','김나경','공유빈','카에데','서다현','코토네','곽연지','니엔','박소현','신위','마유','린','주빈','정하연','박시온','김채원','설린','서아','지연'];
  const ids = names.map((_, i) => `S${String(i + 1).padStart(2, '0')}`);
  const byName = new Map(names.map((name, i) => [name, ids[i]]));
  const main = new Map(ids.map(id => [id, new URL(`${id}.webp`, base).href]));
  const thumb = new Map(ids.map(id => [id, new URL(`${id}-thumb.webp`, base).href]));

  const idOf = value => {
    if (value == null) return '';
    const str = String(value).trim();
    const match = str.match(/(?:^|[^a-z\d])S\s*0?([1-9]|1\d|2[0-4])(?=$|[^a-z\d])/i);
    if (match) return `S${String(Number(match[1])).padStart(2, '0')}`;
    for (const [name, id] of byName) {
      if (str === name || str.startsWith(`${name} `) || str.includes(` ${name} `)) return id;
    }
    return '';
  };

  const targets = [
    '#memberGrid .member-front img.member-photo',
    '#memberGrid .member-front img.profile-photo',
    '#memberGrid .member-front img.member-img',
    '#memberGrid .member-front img.member-portrait',
    'img.member-avatar', 'img.member-thumb', 'img.member-thumbnail',
    'img.profile-photo', 'img.profile-image', 'img.member-portrait',
    'img.member-img', 'img[data-wa-member-photo]',
    '.v2-member-hit img', '.wa-mh-member img', '.wa-mh-avatar img',
    '.wa-memberdb img', '.wa-mywav-item img',
    '.oc8-memberstrip img', '.wa-bias-member img',
    '.wa-labs-member img', '.wa-unit-member img',
    '.wa-id-member img'
  ].join(',');

  const banned = '.oc8-card,.oc8-detail-image,.objekt-card,.objekt-image,.album-card,.concert-photo,.timeline-event,.history-event,.bytes-card,.character-badge,.hologram-foil';
  const contexts = '.member-card,.v2-member-hit,.wa-mh-member,.wa-mh-avatar,.wa-memberdb-card,.wa-mywav-item,.oc8-memberstrip button,.wa-bias-member,.wa-labs-member,.wa-unit-member,.wa-id-member,[data-wa-member],[data-member],[data-sid],[data-member-id]';

  function resolveMember(img) {
    if (img.closest(banned)) return '';
    let current = img;
    for (let i = 0; current && i < 6; i++, current = current.parentElement) {
      const id = idOf(current.dataset?.member ?? current.dataset?.waMember ?? current.dataset?.sid ?? current.dataset?.memberId ?? '');
      if (id) return id;
    }
    const parent = img.closest(contexts);
    if (parent) {
      const text = [img.alt, img.title, parent.getAttribute('aria-label'), parent.dataset?.name, parent.querySelector('[data-member-name]')?.textContent,
                    parent.querySelector('h3')?.textContent].filter(Boolean).join(' ');
      const id = idOf(text);
      if (id) return id;
    }
    return idOf(img.alt || '');
  }

  function apply(img) {
    if (!(img instanceof HTMLImageElement) || !img.matches(targets)) return false;
    const id = resolveMember(img);
    if (!id) return false;
    const mainCard = Boolean(img.matches('#memberGrid .member-front img'));
    const portrait = mainCard || img.classList.contains('member-portrait') || img.matches('[data-wa-member-photo="main"]');
    const url = portrait ? main.get(id) : thumb.get(id);
    if (!url) return false;
    if (img.getAttribute('src') !== url) {
      const picture = img.closest('picture');
      picture?.querySelectorAll('source').forEach(source => {
        source.removeAttribute('srcset');
        source.removeAttribute('sizes');
      });
      img.removeAttribute('srcset');
      img.src = url;
    }
    if (!mainCard) img.loading = 'lazy';
    img.decoding = 'async';
    img.dataset.wavOfficialPhoto = id;
    return true;
  }

  const pending = new Set();
  let frame = 0;
  let installed = 0;
  function flush() {
    frame = 0;
    let count = 0;
    for (const image of pending) {
      pending.delete(image);
      if (image.isConnected && apply(image)) installed++;
      if (++count >= 120) break;
    }
    if (pending.size) frame = requestAnimationFrame(flush);
  }
  function enqueue(image) {
    if (image?.nodeType !== 1) return;
    if (image instanceof HTMLImageElement) pending.add(image);
    if (!frame) frame = requestAnimationFrame(flush);
  }
  function scan(root) {
    if (!root || root.nodeType !== 1 && root.nodeType !== 9) return;
    if (root instanceof HTMLImageElement) enqueue(root);
    root.querySelectorAll?.(targets).forEach(enqueue);
  }

  function init() {
    scan(document);
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'attributes') {
          enqueue(record.target);
          continue;
        }
        record.addedNodes.forEach(node => {
          if (node.nodeType === 1) scan(node);
        });
      }
    });
    observer.observe(document.documentElement, {subtree:true, childList:true, attributes:true,
      attributeFilter:['src','srcset','data-member','data-wa-member','data-sid']});
    addEventListener('pagehide', () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      pending.clear();
    }, {once:true});
  }
  const registry = Object.freeze({
    version: '2026-10-25',
    ids: Object.freeze([...ids]),
    get: (sid, variant = 'main') => (variant === 'thumb' ? thumb : main).get(idOf(sid)) ?? null,
    getMain: sid => main.get(idOf(sid)) ?? null,
    getThumb: sid => thumb.get(idOf(sid)) ?? null,
    refresh: () => scan(document),
    get appliedImageUpdates() {return installed;}
  });
  window.WAVMemberPhotos = registry;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
